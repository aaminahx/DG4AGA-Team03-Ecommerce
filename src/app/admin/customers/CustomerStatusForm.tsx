"use client";

import { useActionState, useState } from "react";
import {
  updateCustomerStatus,
  type CustomerActionState,
} from "./actions";

type Props = {
  customerId: string;
  suspended: boolean;
};

const initialState: CustomerActionState = {};

export default function CustomerStatusForm({
  customerId,
  suspended,
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateCustomerStatus,
    initialState
  );

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordEdited, setPasswordEdited] = useState(false);

  const action = suspended ? "reactivate" : "suspend";

  const passwordError =
    state.field === "adminPassword" &&
    !passwordEdited &&
    !pending;

  function resetForm() {
    setOpen(false);
    setReason("");
    setConfirmed(false);
    setShowPassword(false);
    setPasswordEdited(false);
  }

  return (
    <section className="adm-customer-panel adm-customer-management">
      <div className="adm-customer-panel-head">
        <h2>Account management</h2>
        <p>
          Manage this customer's access to EcoHome while
          preserving their existing order records.
        </p>
      </div>

      {state.success && state.message && (
        <div className="adm-account-success" role="status">
          {state.message}
        </div>
      )}

      {state.warning && (
        <div className="adm-account-warning" role="alert">
          {state.warning}
        </div>
      )}

      {(!open || state.success) && (
        <div className="adm-customer-management-row">
          <div>
            <h3>
              {suspended
                ? "Reactivate customer account"
                : "Suspend customer account"}
            </h3>

            <p>
              {suspended
                ? "Restore access to the customer's account."
                : "Restrict access without deleting customer or order records."}
            </p>
          </div>

          <button
            type="button"
            className={
              suspended
                ? "adm-customer-reactivate-button"
                : "adm-customer-danger-button"
            }
            onClick={() => {
              setOpen(true);
              setPasswordEdited(true);
            }}
            
          >
            {suspended
              ? "Reactivate account"
              : "Suspend account"}
          </button>
        </div>
      )}

      {open && !state.success && (
        <form
          action={formAction}
          className={`adm-account-form ${
            suspended ? "adm-account-reactivation" : ""
          }`}
          onSubmit={() => {
            setPasswordEdited(false);
            setShowPassword(false);
          }}
        >
          <input
            type="hidden"
            name="customerId"
            value={customerId}
          />

          <input
            type="hidden"
            name="expectedSuspended"
            value={String(suspended)}
          />

          <input
            type="hidden"
            name="newSuspended"
            value={String(!suspended)}
          />

          <h3>
            {suspended
              ? "Confirm account reactivation"
              : "Confirm account suspension"}
          </h3>

          <p>
            {suspended
              ? "Reactivating this account will restore the customer's access to EcoHome."
              : "Suspending this account will restrict the customer's access to EcoHome. Existing order records will be preserved."}
          </p>

          <div className="adm-account-field">
            <label htmlFor="accountReason">
              Reason for {suspended ? "reactivation" : "suspension"} *
            </label>

            <textarea
              id="accountReason"
              name="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={`Enter the reason for ${suspended ? "reactivating" : "suspending"} this account...`}
              minLength={5}
              maxLength={500}
              rows={4}
              required
              disabled={pending}
            />

            <div className="adm-account-field-footer">
              <small>
                This reason will be recorded in the account history.
              </small>

              <small>{reason.length}/500</small>
            </div>

            {state.field === "reason" &&
              state.error &&
              !pending && (
                <p className="adm-password-error" role="alert">
                  {state.error}
                </p>
              )}
          </div>

          <div className="adm-password-verification">
            <h4>Administrator verification</h4>

            <p>
              Enter your administrator password to authorise
              this action.
            </p>

            <label htmlFor="customerAdminPassword">
              Administrator password
            </label>

            <div
              className={`adm-password-input ${
                passwordError ? "adm-password-invalid" : ""
              }`}
            >
              <input
                id="customerAdminPassword"
                name="adminPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                maxLength={1024}
                required
                disabled={pending}
                aria-invalid={passwordError}
                aria-describedby={
                  passwordError
                    ? "customerPasswordError"
                    : undefined
                }
                onChange={() => setPasswordEdited(true)}
              />

              <button
                type="button"
                className="adm-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={pending}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {passwordError && (
              <p
                id="customerPasswordError"
                className="adm-password-error"
                role="alert"
              >
                {state.error}
              </p>
            )}
          </div>

          <label className="adm-account-checkbox">
            <input
              type="checkbox"
              name="confirmAction"
              value="yes"
              checked={confirmed}
              onChange={(event) =>
                setConfirmed(event.target.checked)
              }
              required
              disabled={pending}
            />

            <span>
              I understand that this action will{" "}
              {suspended ? "restore" : "restrict"} the customer's
              access to EcoHome.
            </span>
          </label>

          {state.error && !state.field && !pending && (
            <div className="adm-account-error" role="alert">
              {state.error}
            </div>
          )}

          <div className="adm-account-actions">
            <button
              type="button"
              className="adm-account-cancel"
              onClick={resetForm}
              disabled={pending}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={
                suspended
                  ? "adm-account-submit-green"
                  : "adm-account-submit-red"
              }
              disabled={
                pending ||
                !confirmed ||
                reason.trim().length < 5
              }
            >
              {pending
                ? "Verifying..."
                : `Verify & ${action}`}
            </button>
          </div>
        </form>
      )}

      <p className="adm-customer-security-note">
        Administrator password verification is required for
        all account status changes. Actions are recorded in
        the customer account history.
      </p>
    </section>
  );
}