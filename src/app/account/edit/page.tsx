
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "./EditProfileForm";

export default async function EditProfilePage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?next=/account/edit");
  }

  // Verify the current user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?next=/account/edit");
  }

  // Retrieve only the signed-in user's profile.
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(
        "first_name, last_name, phone, is_suspended"
      )
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    redirect("/login?reason=verification-failed");
  }

  if (profile.is_suspended !== false) {
    redirect("/login?reason=account-suspended");
  }

  return (
    <main className="section narrow edit-profile-page">
      <span className="eyebrow">
        EcoHome / My Account / Edit Profile
      </span>

      <h1>Edit your profile</h1>

      <p className="auth-intro">
        Keep your personal information up to date.
      </p>

      <EditProfileForm
        firstName={profile.first_name ?? ""}
        lastName={profile.last_name ?? ""}
        email={user.email ?? ""}
        phone={profile.phone ?? ""}
      />

      <Link
        href="/account"
        className="auth-back-link"
      >
        ← Back to My Account
      </Link>
    </main>
  );
}
