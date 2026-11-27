import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

/* =========================================
   CUSTOMER TYPES
========================================= */

type CustomerOrder = {
  id: string;
  user_id: string;
  total: number | null;
  subtotal: number;
  delivery_cost: number;
  status: string;
  created_at: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  emailVerified: boolean;
  totalOrders: number;
  completedPurchases: number;
  totalSpent: number;
  lastOrderAt: string | null;
  suspended: boolean;
  authSuspended: boolean | null;
  authSyncRequired: boolean;
};

type CustomerDetailOrder = CustomerOrder & {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  payment_status: string;
};

type AccountHistory = {
  id: string;
  customer_id: string;
  action: "suspended" | "reactivated";
  previous_suspended: boolean;
  new_suspended: boolean;
  reason: string;
  changed_by: string;
  changed_at: string;
};

/* =========================================
   HELPER FUNCTIONS
========================================= */

function isAuthSuspended(user: User): boolean {
  return Boolean(
    user.banned_until &&
      new Date(user.banned_until).getTime() > Date.now()
  );
}

function calculateOrderTotal(order: CustomerOrder): number {
  return Number(
    order.total ??
      Number(order.subtotal) +
        Number(order.delivery_cost)
  );
}

/* =========================================
   ADMIN AUTHORISATION
========================================= */

export async function requireAdmin() {
  const supabase = await createClient();

  if (!supabase) redirect("/login");

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, is_suspended")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    profile?.role !== "admin" ||
    profile.is_suspended !== false
  ) {
    redirect("/");
  }

  return supabase;
}

/* =========================================
   CUSTOMER LISTING
========================================= */

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await requireAdmin();
  const admin = createAdminClient();

  const { data: profiles, error: profileError } =
    await admin
      .from("profiles")
      .select(`
        id,
        display_name,
        created_at,
        is_suspended
      `)
      .eq("role", "customer")
      .order("created_at", { ascending: false });

  if (profileError) {
    throw new Error("Unable to load customers.");
  }

  // Retrieve registered authentication accounts.

  const users: User[] = [];
  let page = 1;

  while (true) {
    const { data, error } =
      await admin.auth.admin.listUsers({
        page,
        perPage: 100,
      });

    if (error) {
      throw new Error("Unable to load customer accounts.");
    }

    users.push(...data.users);

    if (data.users.length < 100) break;

    page++;
  }

  const usersById = new Map(
    users.map((user) => [user.id, user])
  );

  // Retrieve customer orders.

  const orders: CustomerOrder[] = [];
  const pageSize = 500;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        total,
        subtotal,
        delivery_cost,
        status,
        created_at
      `)
      .order("id")
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error("Unable to load customer orders.");
    }

    orders.push(...data);

    if (data.length < pageSize) break;

    offset += pageSize;
  }

  // Combine profiles, authentication accounts and orders.

  return (profiles ?? []).map((profile) => {
    const user = usersById.get(profile.id);

    const customerOrders = orders.filter(
      (order) => order.user_id === profile.id
    );

    const validOrders = customerOrders.filter(
      (order) => order.status !== "cancelled"
    );

    const totalSpent = validOrders.reduce(
      (sum, order) => sum + calculateOrderTotal(order),
      0
    );

    const lastOrder =
      [...customerOrders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )[0] ?? null;

    // Database account status.

    const suspended = profile.is_suspended === true;

    // Authentication account status.

    const authSuspended = user
      ? isAuthSuspended(user)
      : null;

    const authSyncRequired =
      authSuspended === null ||
      suspended !== authSuspended;

    return {
      id: profile.id,
      name: profile.display_name || "Unnamed customer",
      email: user?.email ?? "Unavailable",
      createdAt: profile.created_at,
      emailVerified: Boolean(user?.email_confirmed_at),

      suspended,
      authSuspended,
      authSyncRequired,

      totalOrders: customerOrders.length,
      completedPurchases: validOrders.length,
      totalSpent,
      lastOrderAt: lastOrder?.created_at ?? null,
    };
  });
}

/* =========================================
   INDIVIDUAL CUSTOMER DETAILS
========================================= */

export async function getCustomerDetails(customerId: string) {
  const supabase = await requireAdmin();

  // Validate customer ID.

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(customerId)) {
    return null;
  }

  const admin = createAdminClient();

  // Retrieve customer profile.

  const { data: profile, error: profileError } =
    await admin
      .from("profiles")
      .select(`
        id,
        display_name,
        role,
        created_at,
        is_suspended,
        suspended_at,
        suspended_by,
        suspension_reason
      `)
      .eq("id", customerId)
      .eq("role", "customer")
      .maybeSingle();

  if (profileError) {
    throw new Error("Unable to load customer profile.");
  }

  if (!profile) {
    return null;
  }

  // Retrieve authentication information.

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(customerId);

  if (authError || !authData.user) {
    throw new Error("Unable to load customer account.");
  }

  const user = authData.user;

  // Retrieve customer order history.

  const orders: CustomerDetailOrder[] = [];

  const pageSize = 500;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        postcode,
        total,
        subtotal,
        delivery_cost,
        status,
        payment_status,
        created_at
      `)
      .eq("user_id", customerId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error("Unable to load customer order history.");
    }

    orders.push(...data);

    if (data.length < pageSize) break;

    offset += pageSize;
  }

  /* =========================================
     ACCOUNT MANAGEMENT HISTORY
  ========================================= */

  const accountHistory: AccountHistory[] = [];

  let historyOffset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("customer_account_history")
      .select(`
        id,
        customer_id,
        action,
        previous_suspended,
        new_suspended,
        reason,
        changed_by,
        changed_at
      `)
      .eq("customer_id", customerId)
      .order("changed_at", { ascending: false })
      .order("id", { ascending: false })
      .range(
        historyOffset,
        historyOffset + pageSize - 1
      );

    if (error) {
      throw new Error(
        "Unable to load customer account history."
      );
    }

    accountHistory.push(...data);

    if (data.length < pageSize) break;

    historyOffset += pageSize;
  }

  /* =========================================
     ADMINISTRATOR INFORMATION
  ========================================= */

  const administratorIds = [
    ...new Set([
      ...accountHistory.map(
        (entry) => entry.changed_by
      ),
      ...(profile.suspended_by
        ? [profile.suspended_by]
        : []),
    ]),
  ];

  const administratorNames = new Map<string, string>();

  for (let index = 0; index < administratorIds.length; index += 100) {
    const ids = administratorIds.slice(index, index + 100);

    const { data, error } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", ids);

    if (error) {
      throw new Error(
        "Unable to load administrator information."
      );
    }

    for (const administrator of data ?? []) {
      administratorNames.set(
        administrator.id,
        administrator.display_name || "Administrator"
      );
    }
  }

  const historyWithAdministrators = accountHistory.map(
    (entry) => ({
      ...entry,
      administratorName:
        administratorNames.get(entry.changed_by) ||
        "Administrator",
    })
  );

  /* =========================================
     CUSTOMER STATISTICS
  ========================================= */

  const validOrders = orders.filter(
    (order) => order.status !== "cancelled"
  );

  const totalSpent = validOrders.reduce(
    (sum, order) => sum + calculateOrderTotal(order),
    0
  );

  const averageOrder =
    validOrders.length > 0
      ? totalSpent / validOrders.length
      : 0;

  /* =========================================
     ACCOUNT STATUS
  ========================================= */

  const suspended = profile.is_suspended === true;

  const authSuspended = isAuthSuspended(user);

  const authSyncRequired =
    suspended !== authSuspended;

  /* =========================================
     RETURN CUSTOMER INFORMATION
  ========================================= */

  return {
    id: profile.id,
    name: profile.display_name || "Unnamed customer",
    email: user.email ?? "Unavailable",
    role: profile.role,
    createdAt: profile.created_at,
    emailVerified: Boolean(user.email_confirmed_at),
    lastSignIn: user.last_sign_in_at ?? null,

    // Account status.

    suspended,
    suspendedAt: profile.suspended_at ?? null,
    suspendedBy: profile.suspended_by ?? null,
    suspensionReason: profile.suspension_reason ?? null,

    suspendedByName: profile.suspended_by
      ? administratorNames.get(profile.suspended_by) ||
        "Administrator"
      : null,

    // Authentication synchronisation.

    authSuspended,
    authSyncRequired,
    bannedUntil: user.banned_until ?? null,

    // Customer statistics.

    totalOrders: orders.length,
    totalSpent,
    averageOrder,

    deliveredOrders: orders.filter(
      (order) => order.status === "delivered"
    ).length,

    cancelledOrders: orders.filter(
      (order) => order.status === "cancelled"
    ).length,

    // Customer records.

    latestOrder: orders[0] ?? null,
    orders,
    accountHistory: historyWithAdministrators,
  };
}