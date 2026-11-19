
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Couldn't sign out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        style={{
          padding: "12px 22px",
          borderRadius: "10px",
          border: "1px solid #d4d4d4",
          backgroundColor: "#ffffff",
          color: "#222222",
          fontWeight: 600,
          cursor: isSigningOut
            ? "wait"
            : "pointer",
        }}
      >
        {isSigningOut
          ? "Signing out..."
          : "Sign Out"}
      </button>

      {error && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}
    </div>
  );
}
