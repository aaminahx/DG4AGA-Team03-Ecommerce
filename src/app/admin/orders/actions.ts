"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createAuthClient } from "@supabase/supabase-js";

const STATUSES = [
  "placed",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof STATUSES)[number];

export type OrderActionState = {
  success?: boolean;
  error?: string;
  message?: string;
  field?: "adminPassword";
};

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["processing", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function updateOrderStatus(
  _previousState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: "Unable to connect. Please try again." };
  }

  // Verify the signed-in user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Please log in to continue." };
  }

  // Verify administrator permissions.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return { error: "You are not authorised to manage orders." };
  }

  // Read submitted values.
  const orderId = formData.get("orderId");
  const expectedStatus = formData.get("expectedStatus");
  const newStatus = formData.get("newStatus");

  // Validate the order ID.
  const validId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (typeof orderId !== "string" || !validId.test(orderId)) {
    return { error: "Invalid order reference." };
  }

  // Validate both statuses.
  if (
    typeof expectedStatus !== "string" ||
    typeof newStatus !== "string" ||
    !STATUSES.includes(expectedStatus as OrderStatus) ||
    !STATUSES.includes(newStatus as OrderStatus)
  ) {
    return { error: "Invalid order status." };
  }

  // Validate the requested transition.
  if (
    !TRANSITIONS[expectedStatus as OrderStatus].includes(
      newStatus as OrderStatus
    )
  ) {
    return { error: "This status change is not permitted." };
  }

  // Require cancellation confirmation.
  if (
    newStatus === "cancelled" &&
    formData.get("confirmCancellation") !== "yes"
  ) {
    return { error: "Please confirm the cancellation." };
  }

let error: { message: string } | null = null;

if (newStatus === "cancelled") {
  const password = formData.get("adminPassword");

  if (
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > 1024
  ) {
    return {
      error: "Please enter your administrator password.",
    };
  }

  if (!user.email) {
    return {
      error: "Unable to verify your administrator account.",
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      error: "Authentication service unavailable.",
    };
  }

  // Use a separate client to verify the password
  // without replacing the existing browser session.
  const verificationClient = createAuthClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const {
    data: verification,
    error: verificationError,
  } = await verificationClient.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (
    verificationError ||
    verification.user?.id !== user.id ||
    !verification.session
  ) {
    return {
      error: "Password verification failed. Please try again.",
      field: "adminPassword",
    };
  }

  // Remove the temporary verification session.
  const { error: signOutError } =
    await verificationClient.auth.signOut({
      scope: "local",
    });

  if (signOutError) {
    return {
      error: "Unable to complete secure verification.",
    };
  }

  // Only call the privileged cancellation function
  // after successful password verification.
  const adminClient = createAdminClient();

  const result = await adminClient.rpc(
    "cancel_order_verified",
    {
      p_order_id: orderId,
      p_expected_status: expectedStatus,
      p_admin_id: user.id,
    }
  );

  error = result.error;
} else {
  // Normal fulfilment updates.
  const result = await supabase.rpc(
    "update_order_status",
    {
      p_order_id: orderId,
      p_expected_status: expectedStatus,
      p_new_status: newStatus,
    }
  );

  error = result.error;
}
  if (error) {
    if (
      error.message ===
      "Order status has changed. Refresh and try again."
    ) {
      return {
        error: "This order has changed. Refresh and try again.",
      };
    }

    return {
      error: "Unable to update this order. Please refresh and try again.",
    };
  }

  // Refresh affected pages.
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/products", "layout");

  if (newStatus === "cancelled") {
    return {
      success: true,
      message: "Order cancelled successfully. Stock has been restored.",
    };
  }

  return {
    success: true,
    message: "Order status updated successfully.",
  };
}