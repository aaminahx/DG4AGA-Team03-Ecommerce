
"use client";

import { useActionState, useState } from "react";
import {
  updateProfile,
  type ProfileActionState,
} from "./actions";

type EditProfileFormProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const initialState: ProfileActionState = {};

export default function EditProfileForm({
  firstName,
  lastName,
  email,
  phone,
}: EditProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  );

  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [edited, setEdited] = useState(false);

  const errors = edited ? undefined : state.fieldErrors;

  return (
    <form
      className="form auth-form edit-profile-form"
      action={formAction}
      onSubmit={() => setEdited(false)}
    >
      <label>
        First name

        <input
          type="text"
          name="firstName"
          value={first}
          onChange={(event) => {
            setFirst(event.target.value);
            setEdited(true);
          }}
          autoComplete="given-name"
          maxLength={50}
          aria-invalid={Boolean(errors?.firstName)}
          disabled={pending}
          required
        />

        {errors?.firstName && (
          <span className="profile-field-error">
            {errors.firstName}
          </span>
        )}
      </label>

      <label>
        Last name

        <input
          type="text"
          name="lastName"
          value={last}
          onChange={(event) => {
            setLast(event.target.value);
            setEdited(true);
          }}
          autoComplete="family-name"
          maxLength={50}
          aria-invalid={Boolean(errors?.lastName)}
          disabled={pending}
          required
        />

        {errors?.lastName && (
          <span className="profile-field-error">
            {errors.lastName}
          </span>
        )}
      </label>

      <label>
        Email address

        <input
          type="email"
          value={email}
          readOnly
          className="profile-readonly-input"
        />

        <span className="profile-field-hint">
          Your registered email address cannot be
          changed through this form.
        </span>
      </label>

      <label>
        Phone number (optional)

        <input
          type="tel"
          name="phone"
          value={phoneNumber}
          onChange={(event) => {
            setPhoneNumber(event.target.value);
            setEdited(true);
          }}
          autoComplete="tel"
          placeholder="Enter your phone number"
          maxLength={25}
          aria-invalid={Boolean(errors?.phone)}
          disabled={pending}
        />

        {errors?.phone && (
          <span className="profile-field-error">
            {errors.phone}
          </span>
        )}
      </label>

      <div className="profile-security-note">
        <strong>🔒 Your information is secure</strong>

        <p>
          Your personal details are stored securely.
          Changes can only be made by your authenticated
          account.
        </p>
      </div>

      <button
        type="submit"
        className="button primary auth-submit"
        disabled={pending}
      >
        {pending ? "Saving changes..." : "Save Changes"}
      </button>

      {!pending && !edited && state.success && (
        <div
          role="status"
          className="profile-success-message"
        >
          <strong>✓ Profile updated</strong>
          <p>{state.message}</p>
        </div>
      )}

      {!pending && !edited && state.error && (
        <div
          role="alert"
          className="profile-error-message"
        >
          {state.error}
        </div>
      )}
    </form>
  );
}
