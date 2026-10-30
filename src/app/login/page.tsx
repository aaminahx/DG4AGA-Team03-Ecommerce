"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : "Signed in. Your team must now design the account journey.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section narrow">
      <span className="eyebrow">Authentication foundation</span>
      <h1>Sign in</h1>
      <form className="form" onSubmit={submit}>
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
        <button className="button primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        {message && <p role="status" className="form-message">{message}</p>}
      </form>
      <p className="task-note"><strong>Team task:</strong> complete registration, sign-out, password reset and account management with appropriate validation and feedback.</p>
    </section>
  );
}
