
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/auth/reset-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo }
        );

      if (error) {
        setMessage(
          "We couldn't process your request. Please try again shortly."
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="section narrow auth-page">
      <span className="eyebrow">
        EcoHome / Account Support
      </span>

      {!submitted ? (
        <>
          <h1>Forgot your password?</h1>

          <p className="auth-intro">
            Enter the email address associated
            with your EcoHome account and we'll
            send you a password reset link.
          </p>

          <form
            className="form auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Email address
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </label>

            <button
              type="submit"
              className="button primary auth-submit"
              disabled={busy}
            >
              {busy
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="reset-success-icon">
            ✓
          </div>

          <h1>Check your email!</h1>

          <p className="auth-intro">
            If an account exists with that email
            address, you'll receive instructions
            to reset your password.
          </p>

          <button
            type="button"
            className="button primary auth-submit"
            onClick={() => {
              setSubmitted(false);
              setMessage("");
            }}
          >
            Try another email
          </button>
        </>
      )}

      {message && (
        <p role="alert" className="form-message">
          {message}
        </p>
      )}

      <Link
        href="/login"
        className="auth-back-link"
      >
        ← Back to sign in
      </Link>
    </main>
  );
}
