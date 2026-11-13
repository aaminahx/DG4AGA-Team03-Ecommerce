
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      "Demo mode: Your password reset request has been received. Email functionality will be enabled when Supabase is connected."
    );

    setSubmitted(true);
  }

  return (
    <main className="section narrow auth-page">
      <span className="eyebrow">EcoHome / Account Support</span>

      {!submitted ? (
        <>
          <h1>Forgot your password?</h1>

          <p className="auth-intro">
            Don't worry! Enter the email address associated with your
            account and we'll help you get back in.
          </p>

          <form className="form auth-form" onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <button type="submit" className="button primary auth-submit">
              Reset password
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="reset-success-icon">✓</div>

          <h1>Request received!</h1>

          <p className="auth-intro">
            {message}
          </p>

          <button
            type="button"
            className="button primary auth-submit"
            onClick={() => {
              setSubmitted(false);
              setMessage("");
              setEmail("");
            }}
          >
            Try another email
          </button>
        </>
      )}

      <Link href="/login" className="auth-back-link">
        ← Back to sign in
      </Link>
    </main>
  );
}

