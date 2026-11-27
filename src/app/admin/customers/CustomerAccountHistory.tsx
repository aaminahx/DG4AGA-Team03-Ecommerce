import "server-only";

type HistoryEntry = {
  id: string;
  action: "suspended" | "reactivated";
  previous_suspended: boolean;
  new_suspended: boolean;
  reason: string;
  changed_by: string;
  changed_at: string;
  administratorName: string;
};

type Props = {
  suspended: boolean;
  suspendedAt: string | null;
  suspendedByName: string | null;
  suspensionReason: string | null;
  authSyncRequired: boolean;
  accountHistory: HistoryEntry[];
};

function formatDateTime(value: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

export default function CustomerAccountHistory({
  suspended,
  suspendedAt,
  suspendedByName,
  suspensionReason,
  authSyncRequired,
  accountHistory,
}: Props) {
  return (
    <>
      {/* Current account restriction */}

      {suspended && (
        <section className="adm-customer-panel adm-restriction-panel">
          <div className="adm-customer-panel-head">
            <h2>Account restriction</h2>
            <p>
              Information about the current account suspension.
            </p>
          </div>

          <dl className="adm-customer-information">
            <div>
              <dt>Account status</dt>
              <dd>
                <span className="adm-pill adm-customer-suspended">
                  Suspended
                </span>
              </dd>
            </div>

            <div>
              <dt>Suspended on</dt>
              <dd>{formatDateTime(suspendedAt)}</dd>
            </div>

            <div>
              <dt>Suspended by</dt>
              <dd>
                {suspendedByName || "Administrator"}
              </dd>
            </div>
          </dl>

          <div className="adm-restriction-reason">
            <h3>Suspension reason</h3>
            <p>
              {suspensionReason || "No reason recorded."}
            </p>
          </div>
        </section>
      )}

      {/* Authentication synchronisation */}

      {authSyncRequired && (
        <div className="adm-account-warning" role="alert">
          <strong>Authentication synchronisation required</strong>

          <p>
            The database account status does not match
            Supabase Authentication. Administrator review
            is required before further account changes.
          </p>
        </div>
      )}

      {/* Account management history */}

      <section className="adm-customer-panel">
        <div className="adm-customer-panel-head">
          <h2>Account management history</h2>

          <p>
            Review previous account suspensions and
            reactivations, including the administrator
            responsible and the reason for each action.
          </p>
        </div>

        {accountHistory.length === 0 ? (
          <div className="adm-customer-empty">
            <h3>No account management history</h3>

            <p>
              No suspension or reactivation actions have
              been recorded for this customer.
            </p>
          </div>
        ) : (
          <div className="adm-account-history">
            {accountHistory.map((entry) => {
              const wasSuspended =
                entry.action === "suspended";

              return (
                <article
                  key={entry.id}
                  className="adm-account-history-item"
                >
                  <div
                    className={`adm-history-icon ${
                      wasSuspended
                        ? "adm-history-icon-red"
                        : "adm-history-icon-green"
                    }`}
                    aria-hidden="true"
                  >
                    {wasSuspended ? "!" : "✓"}
                  </div>

                  <div className="adm-history-content">
                    <div className="adm-history-heading">
                      <h3>
                        {wasSuspended
                          ? "Account suspended"
                          : "Account reactivated"}
                      </h3>

                      <span
                        className={`adm-pill ${
                          wasSuspended
                            ? "adm-customer-suspended"
                            : "adm-customer-active"
                        }`}
                      >
                        {wasSuspended
                          ? "Suspended"
                          : "Reactivated"}
                      </span>
                    </div>

                    <p className="adm-history-date">
                      {formatDateTime(entry.changed_at)}
                    </p>

                    <div className="adm-history-reason">
                      <strong>Reason</strong>
                      <p>{entry.reason}</p>
                    </div>

                    <div className="adm-history-admin">
                      Changed by:{" "}
                      <strong>
                        {entry.administratorName}
                      </strong>
                    </div>

                    <div className="adm-history-transition">
                      {entry.previous_suspended
                        ? "Suspended"
                        : "Not suspended"}
                      {" → "}
                      {entry.new_suspended
                        ? "Suspended"
                        : "Not suspended"}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}