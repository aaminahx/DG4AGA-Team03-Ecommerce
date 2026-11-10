
"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(
      form.get("confirmPassword") ?? ""
    );

    if (isRegistering && password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createClient();

      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else if (data.session) {
          setMessage("Your account has been created and you are signed in!");
        } else {
          setMessage(
            "Account created! Please check your email to confirm your account before signing in."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section narrow auth-page">
      <span className="eyebrow">Welcome to EcoHome</span>

      <h1>
        {isRegistering ? "Create your account" : "Welcome back"}
      </h1>

      <p className="auth-intro">
        {isRegistering
          ? "Join EcoHome and discover a more sustainable way to shop."
          : "Sign in to access your EcoHome account."}
      </p>

      <form className="form auth-form" onSubmit={submit}>
        <label>
          Email address
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <div className="password-field">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete={
                isRegistering ? "new-password" : "current-password"
              }
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {isRegistering && (
          <label>
            Confirm password
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password again"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
        )}

        {!isRegistering && (
          <div className="auth-forgot">
            <Link href="/forgot-password" className="auth-forgot-link">
                Forgot your password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          className="button primary auth-submit"
          disabled={busy}
        >
          {busy
            ? "Please wait..."
            : isRegistering
              ? "Create account"
              : "Sign in"}
        </button>

        {message && (
          <p role="status" aria-live="polite" className="form-message">
            {message}
          </p>
        )}
      </form>

      <div className="auth-switch">
        {isRegistering
          ? "Already have an account?"
          : "Don't have an account?"}

        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setMessage("");
            setShowPassword(false);
          }}
        >
          {isRegistering ? "Sign in" : "Create one"}
        </button>
      </div>
    </section>
  );
}
