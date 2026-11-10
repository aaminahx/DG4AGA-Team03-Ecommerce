
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function EditProfilePage() {
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Green");
  const [email, setEmail] = useState("alex@example.com");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      "Demo mode: Your profile changes have been saved for this demonstration. Permanent saving will be enabled when Supabase is connected."
    );
  }

  return (
    <main className="section narrow edit-profile-page">
      <span className="eyebrow">EcoHome / My Account / Edit Profile</span>

      <h1>Edit your profile</h1>

      <p className="auth-intro">
        Keep your personal information up to date.
      </p>

      <form className="form auth-form" onSubmit={handleSubmit}>
        <label>
          First name
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </label>

        <label>
          Last name
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Phone number
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter your phone number"
          />
        </label>

        <button type="submit" className="button primary auth-submit">
          Save Changes
        </button>

        {message && (
          <p role="status" className="form-message">
            {message}
          </p>
        )}
      </form>

      <Link href="/account" className="auth-back-link">
        ← Back to My Account
      </Link>
    </main>
  );
}

