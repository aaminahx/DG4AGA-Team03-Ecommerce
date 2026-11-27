
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
};

export async function updateProfile(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      error: "Account services are currently unavailable.",
    };
  }

  // Verify the authenticated user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "Please log in again to update your profile.",
    };
  }

  // Verify account status.
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("is_suspended")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    return {
      error: "We could not verify your account status.",
    };
  }

  if (profile.is_suspended !== false) {
    return {
      error:
        "Your account is suspended. Please contact EcoHome customer support.",
    };
  }

  // Read and validate permitted fields only.
  const firstName = String(
    formData.get("firstName") ?? ""
  ).trim();

  const lastName = String(
    formData.get("lastName") ?? ""
  ).trim();

  const phone = String(
    formData.get("phone") ?? ""
  ).trim();

  const fieldErrors: NonNullable<
    ProfileActionState["fieldErrors"]
  > = {};

  if (firstName.length < 1 || firstName.length > 50) {
    fieldErrors.firstName =
      "Enter a first name between 1 and 50 characters.";
  }

  if (lastName.length < 1 || lastName.length > 50) {
    fieldErrors.lastName =
      "Enter a last name between 1 and 50 characters.";
  }

  const phoneDigits = phone.replace(/[^0-9]/g, "");

  if (
    phone &&
    (
      phone.length < 7 ||
      phone.length > 25 ||
      !/^[+]?[0-9 ()-]+$/.test(phone) ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    )
  ) {
    fieldErrors.phone = "Enter a valid phone number.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  // Use the restricted database function.
  const { error } = await supabase.rpc(
    "update_my_profile",
    {
      p_first_name: firstName,
      p_last_name: lastName,
      p_phone: phone || null,
    }
  );

  if (error) {
    console.error("Profile update failed:", error.code);

    if (error.code === "42501") {
      return {
        error:
          "Your account is not authorised to update these details.",
      };
    }

    return {
      error:
        "We couldn't save your changes. Please try again.",
    };
  }

  revalidatePath("/account");
  revalidatePath("/account/edit");
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${user.id}`);

  return {
    success: true,
    message: "Your profile has been updated successfully.",
  };
}
