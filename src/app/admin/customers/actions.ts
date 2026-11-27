"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createAuthClient } from "@supabase/supabase-js";

export type CustomerActionState = {
  success?: boolean;
  error?: string;
  message?: string;
  warning?: string;
  field?: "adminPassword" | "reason";
};

export async function updateCustomerStatus(
  _previousState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
    if (process.env.ENABLE_CUSTOMER_STATUS_CHANGES !== "true") {
  return {
    error: "Account management is not yet enabled.",
  };
}
  // 1. Verify the current session
  const supabase = await createClient();

  if (!supabase) {
    return { error: "Authentication service unavailable." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Please log in again." };
  }

  // 2. Verify administrator permissions
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    profile?.role !== "admin" ||
    profile.is_suspended
  ) {
    return { error: "Administrator access required." };
  }

  // 3. Retrieve submitted information
  const customerId = formData.get("customerId");
  const expectedStatus = formData.get("expectedSuspended");
  const requestedStatus = formData.get("newSuspended");
  const reasonValue = formData.get("reason");
  const password = formData.get("adminPassword");
  const confirmation = formData.get("confirmAction");

  // 4. Validate the customer ID
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (
    typeof customerId !== "string" ||
    !uuidPattern.test(customerId)
  ) {
    return { error: "Invalid customer account." };
  }

  if (customerId === user.id) {
    return { error: "You cannot modify your own account." };
  }

  // 5. Validate the requested status
  if (
    (expectedStatus !== "true" && expectedStatus !== "false") ||
    (requestedStatus !== "true" && requestedStatus !== "false")
  ) {
    return { error: "Invalid account status." };
  }

  const expectedSuspended = expectedStatus === "true";
  const newSuspended = requestedStatus === "true";

  if (expectedSuspended === newSuspended) {
    return { error: "No account status change requested." };
  }

  // 6. Validate the reason
  const reason =
    typeof reasonValue === "string" ? reasonValue.trim() : "";

  if (reason.length < 5 || reason.length > 500) {
    return {
      error: "Please enter a reason between 5 and 500 characters.",
      field: "reason",
    };
  }

  // 7. Require explicit confirmation
  if (confirmation !== "yes") {
    return {
      error: "Please confirm that you wish to continue.",
    };
  }

  // 8. Validate the administrator password
  if (
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > 1024
  ) {
    return {
      error: "Please enter your administrator password.",
      field: "adminPassword",
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
    return { error: "Authentication service unavailable." };
  }

  // 9. Verify the password using an isolated client
  const verificationClient = createAuthClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data: verification, error: verificationError } =
    await verificationClient.auth.signInWithPassword({
      email: user.email,
      password,
    });

  if (verificationError) {
    if (verificationError.code === "invalid_credentials") {
      return {
        error: "Incorrect password. Please try again.",
        field: "adminPassword",
      };
    }

    return {
      error: "Password verification is unavailable. Please try again later.",
    };
  }

  if (
    verification.user?.id !== user.id ||
    !verification.session
  ) {
    return {
      error: "Administrator verification failed.",
    };
  }

  // 10. Close the temporary verification session
  const { error: signOutError } =
    await verificationClient.auth.signOut({
      scope: "local",
    });

  if (signOutError) {
    return {
      error: "Unable to complete secure verification.",
    };
  }

  // 11. Create the privileged server client
  const admin = createAdminClient();

  // 12. Update the database and record the audit history
  const { error: updateError } = await admin.rpc(
    "update_customer_account_status",
    {
      p_customer_id: customerId,
      p_expected_suspended: expectedSuspended,
      p_new_suspended: newSuspended,
      p_reason: reason,
      p_admin_id: user.id,
    }
  );

  if (updateError) {
    if (updateError.message.includes("Account status has changed")) {
      return {
        error: "This account has changed. Refresh and try again.",
      };
    }

    return {
      error: "Unable to update the customer account.",
    };
  }

    // 13. Refresh affected admin pages
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${customerId}`);

  // 14. Confirm the successful account status change
  return {
    success: true,
    message: newSuspended
      ? "Customer account successfully suspended."
      : "Customer account successfully reactivated.",
  };
}