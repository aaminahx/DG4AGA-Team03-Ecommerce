"use client";

import { useActionState, useState } from "react";
import {
  updateOrderStatus,
  type OrderActionState,
} from "./actions";

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const NEXT_STATUS: Record<string, string> = {
  placed: "processing",
  processing: "dispatched",
  dispatched: "delivered",
};

const initialState: OrderActionState = {};

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderStatus,
    initialState
  );

  const [showCancellation, setShowCancellation] =
    useState(false);

  const [confirmed, setConfirmed] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [passwordEdited, setPasswordEdited] = useState(false);

  const nextStatus = NEXT_STATUS[currentStatus];

  const canCancel =
    currentStatus === "placed" ||
    currentStatus === "processing";

  const finished =
    currentStatus === "delivered" ||
    currentStatus === "cancelled";

  const passwordError =
    state.field === "adminPassword" &&
    !passwordEdited &&
    !pending;

  return (
    <div className="adm-status-form">

      {/* CURRENT ORDER STATUS */}

      <div className="adm-order-manage">
        <span>Current status</span>

        <span
          className={`adm-pill adm-order-${currentStatus}`}
        >
          {STATUS_LABELS[currentStatus] ?? currentStatus}
        </span>
      </div>

      {/* SUCCESS MESSAGE */}

      {state.success && (
        <div
          className="adm-success"
          role="status"
        >
          ✓ {state.message}
        </div>
      )}

      {/* GENERAL ERROR MESSAGE */}

      {state.error &&
        state.field !== "adminPassword" &&
        !pending && (
          <div
            className="adm-status-error"
            role="alert"
          >
            {state.error}
          </div>
        )}

      {/* COMPLETED OR CANCELLED ORDERS */}

      {finished ? (
        <p className="adm-status-finished">
          {currentStatus === "delivered"
            ? "This order has been delivered. No further status updates are available."
            : "This order has been cancelled. No further status updates are available."}
        </p>
      ) : (
        <>

          {/* NORMAL ORDER STATUS UPDATES */}

          {nextStatus && (
            <form
              action={formAction}
              className="adm-status-update"
            >
              <input
                type="hidden"
                name="orderId"
                value={orderId}
              />

              <input
                type="hidden"
                name="expectedStatus"
                value={currentStatus}
              />

              <div className="adm-status-field">
                <label htmlFor="newStatus">
                  New order status
                </label>

                <select
                  id="newStatus"
                  name="newStatus"
                  value={nextStatus}
                  disabled={pending}
                  required
                >
                  <option value={nextStatus}>
                    {STATUS_LABELS[nextStatus]}
                  </option>
                </select>
              </div>

              <p className="adm-muted">
                Move this order from{" "}
                {STATUS_LABELS[currentStatus]} to{" "}
                {STATUS_LABELS[nextStatus]}.
              </p>

              <div className="adm-status-actions">
                <button
                  type="submit"
                  className="adm-status-submit"
                  disabled={pending}
                >
                  {pending
                    ? "Updating..."
                    : "Update status"}
                </button>
              </div>
            </form>
          )}

          {/* ORDER CANCELLATION */}

          {canCancel && (
            <div className="adm-cancel-section">

              <h3>Cancel order</h3>

              <p>
                Cancelling this order will automatically
                restore the purchased products to stock.
                This action cannot be reversed.
              </p>

              {!showCancellation ? (
                <button
                  type="button"
                  className="adm-cancel-order-btn"
                  disabled={pending}
                  onClick={() => {
                    setConfirmed(false);
                    setShowPassword(false);
                    setPasswordEdited(true);
                    setShowCancellation(true);
                  }}
                >
                  Cancel order
                </button>
              ) : (
                <form
                  action={formAction}
                  className="adm-cancel-confirmation"
                  onSubmit={() => {
                    setPasswordEdited(false);
                    setShowPassword(false);
                  }}
                >

                  {/* ORDER INFORMATION */}

                  <input
                    type="hidden"
                    name="orderId"
                    value={orderId}
                  />

                  <input
                    type="hidden"
                    name="expectedStatus"
                    value={currentStatus}
                  />

                  <input
                    type="hidden"
                    name="newStatus"
                    value="cancelled"
                  />

                  <strong>
                    Are you sure you want to cancel this order?
                  </strong>

                  {/* ADMINISTRATOR PASSWORD VERIFICATION */}

                  <div className="adm-password-verification">

                    <h4>
                      Administrator verification required
                    </h4>

                    <p>
                      Enter your current EcoHome password
                      to authorise this cancellation.
                    </p>

                    <label htmlFor="adminPassword">
                      Administrator password
                    </label>

                    <div
                      className={`adm-password-input ${
                        passwordError
                          ? "adm-password-invalid"
                          : ""
                      }`}
                    >
                      <input
                        id="adminPassword"
                        name="adminPassword"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        maxLength={1024}
                        disabled={pending}
                        required
                        aria-invalid={passwordError}
                        aria-describedby={
                          passwordError
                            ? "adminPassword-error"
                            : undefined
                        }
                        onChange={() => {
                          setPasswordEdited(true);
                        }}
                      />

                      <button
                        type="button"
                        className="adm-password-toggle"
                        disabled={pending}
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* INCORRECT PASSWORD MESSAGE */}

                    {passwordError && state.error && (
                      <p
                        id="adminPassword-error"
                        className="adm-password-error"
                        role="alert"
                      >
                        {state.error}
                      </p>
                    )}

                  </div>

                  {/* CANCELLATION CONFIRMATION CHECKBOX */}

                  <label className="adm-confirm-checkbox">

                    <input
                      type="checkbox"
                      name="confirmCancellation"
                      value="yes"
                      checked={confirmed}
                      onChange={(event) =>
                        setConfirmed(event.target.checked)
                      }
                      disabled={pending}
                      required
                    />

                    <span>
                      I understand that this action cannot
                      be reversed.
                    </span>

                  </label>

                  {/* CANCELLATION BUTTONS */}

                  <div className="adm-cancel-actions">

                    <button
                      type="button"
                      className="adm-keep-order"
                      disabled={pending}
                      onClick={() => {
                        setShowCancellation(false);
                        setConfirmed(false);
                        setShowPassword(false);
                        setPasswordEdited(true);
                      }}
                    >
                      Keep order
                    </button>

                    <button
                      type="submit"
                      className="adm-confirm-cancel"
                      disabled={!confirmed || pending}
                    >
                      {pending
                        ? "Verifying..."
                        : "Verify & cancel"}
                    </button>

                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}