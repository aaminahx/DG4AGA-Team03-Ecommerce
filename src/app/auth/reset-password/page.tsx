
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkRecovery() {
      const { data, error } =
        await supabase.auth.getSession();

      if (active) {
        setReady(!!data.session && !error);
      }
    }

    void checkRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;

        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          setReady(!!session);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (!ready || busy) return;

    setMessage("");

    if (password.length < 8) {
      setMessage(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      await supabase.auth.signOut();
      setSuccess(true);
    } catch {
      setMessage(
        "Unable to update your password. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="section narrow auth-page">
      <span className="eyebrow">
        EcoHome / Account Security
      </span>

      {success ? (
        <>
          <h1>Password updated!</h1>

          <p className="auth-intro">
            Your password has been changed.
            You can now sign in using your
            new password.
          </p>

          <Link
            href="/login"
            className="button primary auth-submit"
          >
            Sign In
          </Link>
        </>
      ) : (
        <>
          <h1>Create a new password</h1>

          <p className="auth-intro">
            Choose a secure password for your
            EcoHome account.
          </p>

          {!ready ? (
            <p role="status">
              Checking your password reset link...
              If this continues, the link may have
              expired. Please request a new one.
            </p>
          ) : (
            <form
              className="form auth-form"
              onSubmit={handleSubmit}
            >
              <label>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  minLength={8}
                  required
                />
              </label>

              <label>
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  minLength={8}
                  required
                />
              </label>

              <button
                type="submit"
                className="button primary auth-submit"
                disabled={busy}
              >
                {busy
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </form>
          )}

          {message && (
            <p role="alert" className="form-message">
              {message}
            </p>
          )}

          <Link
            href="/forgot-password"
            className="auth-back-link"
          >
            ← Request a new reset link
          </Link>
        </>
      )}
    </main>
  );
}
