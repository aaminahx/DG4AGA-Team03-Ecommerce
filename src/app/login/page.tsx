"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const SUSPENSION_MESSAGE =
  "Your EcoHome account has been suspended. Please contact customer support for assistance.";

const VERIFICATION_MESSAGE =
  "We could not verify your account status. Please try again later.";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [accountNotice, setAccountNotice] = useState("");

  /* =========================================
     ACCOUNT RESTRICTION NOTICES
  ========================================= */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const reason = params.get("reason");

    if (reason === "account-suspended") {
      setAccountNotice(SUSPENSION_MESSAGE);
    }

    if (reason === "verification-failed") {
      setAccountNotice(VERIFICATION_MESSAGE);
    }
  }, []);

  /* =========================================
     SWITCH LOGIN TYPE
  ========================================= */

  function switchLoginType(admin: boolean) {
    setIsAdminLogin(admin);
    setIsRegistering(false);
    setMessage("");
    setAccountNotice("");
    setShowPassword(false);
  }

  /* =========================================
     LOGIN AND REGISTRATION
  ========================================= */

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setMessage("");
    setAccountNotice("");

    const form = new FormData(event.currentTarget);

    const firstName = String(
      form.get("firstName") ?? ""
    ).trim();

    const lastName = String(
      form.get("lastName") ?? ""
    ).trim();

    const email = String(
      form.get("email") ?? ""
    ).trim();

    const password = String(
      form.get("password") ?? ""
    );

    const confirmPassword = String(
      form.get("confirmPassword") ?? ""
    );

    /* VALIDATE REGISTRATION DETAILS */

    if (
      isRegistering &&
      (!firstName ||
        !lastName ||
        firstName.length > 50 ||
        lastName.length > 50)
    ) {
      setMessage(
        "Please enter a valid first and last name."
      );

      setBusy(false);
      return;
    }

    if (
      isRegistering &&
      password !== confirmPassword
    ) {
      setMessage("Your passwords do not match.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createClient();

      /* =========================================
         CUSTOMER REGISTRATION
      ========================================= */

      if (isRegistering && !isAdminLogin) {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                display_name: `${firstName} ${lastName}`,
              },
            },
          });

        if (error) {
          setMessage(error.message);
        } else if (data.session) {
          setMessage(
            "Your account has been created and you are signed in!"
          );
        } else {
          setMessage(
            "Account created! Please check your email to confirm your account before signing in."
          );
        }
      } else {

        /* =========================================
           CUSTOMER AND ADMIN LOGIN
        ========================================= */

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          if (error.code === "user_banned") {
            setAccountNotice(SUSPENSION_MESSAGE);
          } else if (
            error.code === "invalid_credentials"
          ) {
            setMessage(
              "Incorrect email address or password."
            );
          } else if (
            error.code === "email_not_confirmed"
          ) {
            setMessage(
              "Please confirm your email address before signing in."
            );
          } else {
            setMessage(
              "Unable to sign in. Please try again later."
            );
          }

          return;
        }

        /* VERIFY AUTHENTICATED USER */

        if (!data.user || !data.session) {
          await supabase.auth.signOut({
            scope: "local",
          });

          setMessage(
            "Unable to verify your login. Please try again."
          );

          return;
        }

        /* =========================================
           ACCOUNT STATUS AND ROLE CHECK
        ========================================= */

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("is_suspended, role")
          .eq("id", data.user.id)
          .single();

        /* FAIL SECURELY IF VERIFICATION FAILS */

        if (profileError || !profile) {
          await supabase.auth.signOut({
            scope: "local",
          });

          setAccountNotice(VERIFICATION_MESSAGE);

          return;
        }

        /* BLOCK SUSPENDED ACCOUNTS */

        if (profile.is_suspended !== false) {
          await supabase.auth.signOut({
            scope: "local",
          });

          setAccountNotice(SUSPENSION_MESSAGE);

          return;
        }

        /* =========================================
           VERIFY ADMINISTRATOR ACCESS
        ========================================= */

        if (
          isAdminLogin &&
          profile.role !== "admin"
        ) {
          await supabase.auth.signOut({
            scope: "local",
          });

          setMessage(
            "Access denied. This login is restricted to authorised administrators."
          );

          return;
        }

        /* =========================================
           SUCCESSFUL LOGIN
        ========================================= */

        window.location.assign(
          isAdminLogin ? "/admin" : "/account"
        );
      }
    } catch {
      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  /* =========================================
     LOGIN PAGE INTERFACE
  ========================================= */

  return (
    <section className="section narrow auth-page">
      <span className="eyebrow">
        Welcome to EcoHome
      </span>

      <h1>
        {isAdminLogin
          ? "Administrator Login"
          : isRegistering
            ? "Create your account"
            : "Welcome back"}
      </h1>

      <p className="auth-intro">
        {isAdminLogin
          ? "Sign in to manage the EcoHome store."
          : isRegistering
            ? "Join EcoHome and discover a more sustainable way to shop."
            : "Sign in to access your EcoHome account."}
      </p>

      {/* LOGIN TYPE SELECTOR */}

      <div className="auth-login-tabs">
        <button
          type="button"
          className={!isAdminLogin ? "active" : ""}
          aria-pressed={!isAdminLogin}
          disabled={busy}
          onClick={() => switchLoginType(false)}
        >
          Customer Login
        </button>

        <button
          type="button"
          className={isAdminLogin ? "active" : ""}
          aria-pressed={isAdminLogin}
          disabled={busy}
          onClick={() => switchLoginType(true)}
        >
          Admin Login
        </button>
      </div>

      {/* ADMINISTRATOR ACCESS NOTICE */}

      {isAdminLogin && (
        <div className="auth-admin-notice">
          <span
            className="auth-admin-icon"
            aria-hidden="true"
          >
            🛡️
          </span>

          <div>
            <strong>Administrator Access</strong>

            <p>
              Restricted to authorised EcoHome staff.
            </p>
          </div>
        </div>
      )}

      {/* ACCOUNT RESTRICTION NOTICE */}

      {accountNotice && (
        <div
          className="auth-account-notice"
          role="alert"
        >
          <span
            className="auth-notice-icon"
            aria-hidden="true"
          >
            !
          </span>

          <div>
            <strong>
              {accountNotice === SUSPENSION_MESSAGE
                ? "Account suspended"
                : "Account verification unavailable"}
            </strong>

            <p>{accountNotice}</p>
          </div>
        </div>
      )}

      <form
        key={
          isAdminLogin
            ? "admin-login"
            : isRegistering
              ? "customer-register"
              : "customer-login"
        }
        className="form auth-form"
        onSubmit={submit}
      >

        {/* REGISTRATION NAME FIELDS */}

        {isRegistering && !isAdminLogin && (
          <div className="auth-name-row">
            <label>
              First name

              <input
                name="firstName"
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                maxLength={50}
                required
                disabled={busy}
              />
            </label>

            <label>
              Last name

              <input
                name="lastName"
                type="text"
                placeholder="Last name"
                autoComplete="family-name"
                maxLength={50}
                required
                disabled={busy}
              />
            </label>
          </div>
        )}

        {/* EMAIL ADDRESS */}

        <label>
          {isAdminLogin
            ? "Administrator email address"
            : "Email address"}

          <input
            name="email"
            type="email"
            placeholder={
              isAdminLogin
                ? "Enter your administrator email"
                : "you@example.com"
            }
            autoComplete="email"
            required
            disabled={busy}
          />
        </label>

        {/* PASSWORD */}

        <label>
          Password

          <div className="password-field">
            <input
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              autoComplete={
                isRegistering
                  ? "new-password"
                  : "current-password"
              }
              minLength={
                isRegistering ? 8 : undefined
              }
              required
              disabled={busy}
            />

            <button
              type="button"
              className="password-toggle"
              disabled={busy}
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {/* CONFIRM PASSWORD */}

        {isRegistering && !isAdminLogin && (
          <label>
            Confirm password

            <input
              name="confirmPassword"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password again"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={busy}
            />
          </label>
        )}

        {/* FORGOTTEN PASSWORD */}

        {!isRegistering && (
          <div className="auth-forgot">
            <Link
              href="/forgot-password"
              className="auth-forgot-link"
            >
              Forgot your password?
            </Link>
          </div>
        )}

        {/* SUBMIT BUTTON */}

        <button
          type="submit"
          className="button primary auth-submit"
          disabled={busy}
        >
          {busy
            ? "Please wait..."
            : isAdminLogin
              ? "Sign in to Admin Dashboard"
              : isRegistering
                ? "Create account"
                : "Sign in"}
        </button>

        {/* GENERAL FORM MESSAGES */}

        {message && (
          <p
            role="status"
            aria-live="polite"
            className="form-message"
          >
            {message}
          </p>
        )}
      </form>

      {/* LOGIN AND REGISTRATION SWITCH */}

      {!isAdminLogin ? (
        <div className="auth-switch">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage("");
              setAccountNotice("");
              setShowPassword(false);
            }}
          >
            {isRegistering
              ? "Sign in"
              : "Create one"}
          </button>
        </div>
      ) : (
        <p className="auth-admin-footer">
          🔒 Administrator accounts cannot be
          registered publicly.
        </p>
      )}
    </section>
  );
}
