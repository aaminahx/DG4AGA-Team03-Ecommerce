import Link from "next/link";
import { getCustomers } from "./data";

export const dynamic = "force-dynamic";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/London",
});

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    sort?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const q =
    typeof params.q === "string"
      ? params.q.slice(0, 200)
      : "";

  const filter = ["returning", "no-orders", "new"].includes(
    params.filter ?? ""
  )
    ? params.filter!
    : "";

  const sort = ["oldest", "spending", "orders", "name"].includes(
    params.sort ?? ""
  )
    ? params.sort!
    : "newest";

  const status = [
    "active",
    "suspended",
    "sync-required",
  ].includes(params.status ?? "")
    ? params.status!
    : "";

  const customers = await getCustomers();

  /* =========================================
     CUSTOMER STATISTICS
  ========================================= */

  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const newCustomers = customers.filter(
    (customer) =>
      new Date(customer.createdAt) >= monthStart
  ).length;

  const returningCustomers = customers.filter(
    (customer) => customer.completedPurchases >= 2
  ).length;

  const activeCustomers = customers.filter(
    (customer) =>
      !customer.suspended &&
      !customer.authSyncRequired
  ).length;

  const suspendedCustomers = customers.filter(
    (customer) => customer.suspended
  ).length;

  const syncRequiredCustomers = customers.filter(
    (customer) => customer.authSyncRequired
  ).length;

  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  const averageSpent =
    customers.length > 0
      ? totalSpent / customers.length
      : 0;

  /* =========================================
     SEARCH AND FILTERING
  ========================================= */

  const term = q.trim().toLowerCase();

  const rows = customers.filter((customer) => {
    const matchesSearch =
      !term ||
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term);

    const matchesFilter =
      !filter ||
      (filter === "returning" &&
        customer.completedPurchases >= 2) ||
      (filter === "no-orders" &&
        customer.totalOrders === 0) ||
      (filter === "new" &&
        new Date(customer.createdAt) >= monthStart);

    const matchesStatus =
      !status ||
      (status === "active" &&
        !customer.suspended &&
        !customer.authSyncRequired) ||
      (status === "suspended" &&
        customer.suspended) ||
      (status === "sync-required" &&
        customer.authSyncRequired);

    return (
      matchesSearch &&
      matchesFilter &&
      matchesStatus
    );
  });

  /* =========================================
     CUSTOMER SORTING
  ========================================= */

  rows.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );

      case "spending":
        return b.totalSpent - a.totalSpent;

      case "orders":
        return b.totalOrders - a.totalOrders;

      case "name":
        return a.name.localeCompare(b.name);

      default:
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
    }
  });

  const filtering = Boolean(
    term ||
    filter ||
    status ||
    sort !== "newest"
  );

  return (
    <>
      {/* PAGE HEADING */}

      <header className="adm-head">
        <div>
          <h1>Customers</h1>

          <p className="adm-muted">
            View and manage registered EcoHome customers.
          </p>
        </div>
      </header>

      {/* CUSTOMER SUMMARY CARDS */}

      <section
        className="adm-stats adm-customer-summary"
        aria-label="Customer summary"
      >
        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">
            👥
          </span>

          <strong>{customers.length}</strong>

          <span>Total customers</span>

          <small>Registered accounts</small>
        </article>

        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">
            ✨
          </span>

          <strong>{newCustomers}</strong>

          <span>New customers</span>

          <small>Registered this month</small>
        </article>

        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">
            🔄
          </span>

          <strong>{returningCustomers}</strong>

          <span>Returning customers</span>

          <small>Two or more non-cancelled orders</small>
        </article>

        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">
            💷
          </span>

          <strong>{gbp.format(averageSpent)}</strong>

          <span>Average customer spend</span>

          <small>Simulated purchases</small>
        </article>

        {/* ACTIVE ACCOUNTS */}

        <article className="adm-stat adm-stat-active">
          <span className="adm-ico" aria-hidden="true">
            ✓
          </span>

          <strong>{activeCustomers}</strong>

          <span>Active accounts</span>

          <small>Unrestricted, synchronised accounts</small>
        </article>

        {/* SUSPENDED ACCOUNTS */}

        <article className="adm-stat adm-stat-suspended">
          <span className="adm-ico" aria-hidden="true">
            !
          </span>

          <strong>{suspendedCustomers}</strong>

          <span>Suspended accounts</span>

          <small>Restricted customer accounts</small>
        </article>
      </section>

      {/* AUTHENTICATION WARNING */}

      {syncRequiredCustomers > 0 && (
        <div
          className="adm-account-warning adm-customer-sync-alert"
          role="alert"
        >
          <div>
            <strong>
              Authentication synchronisation required
            </strong>

            <p>
              {syncRequiredCustomers} customer{" "}
              {syncRequiredCustomers === 1
                ? "account requires"
                : "accounts require"}{" "}
              administrator review.
            </p>
          </div>

          <Link
            href="/admin/customers?status=sync-required"
            className="adm-edit-link"
          >
            Review accounts →
          </Link>
        </div>
      )}

      {/* SEARCH AND FILTERING */}

      <div className="adm-head adm-orders-toolbar">
        <div>
          <h2>All customers</h2>

          <p className="adm-muted">
            Showing {rows.length} of {customers.length} customers
          </p>
        </div>

        <form
          className="adm-search adm-customer-search"
          role="search"
          action="/admin/customers"
        >
          {/* CUSTOMER TYPE FILTER */}

          <label
            htmlFor="customer-filter"
            className="sr-only"
          >
            Filter customers
          </label>

          <select
            id="customer-filter"
            name="filter"
            defaultValue={filter}
          >
            <option value="">All customers</option>
            <option value="new">New this month</option>
            <option value="returning">
              Returning customers
            </option>
            <option value="no-orders">No orders</option>
          </select>

          {/* ACCOUNT STATUS FILTER */}

          <label
            htmlFor="customer-status"
            className="sr-only"
          >
            Filter by account status
          </label>

          <select
            id="customer-status"
            name="status"
            defaultValue={status}
          >
            <option value="">All statuses</option>
            <option value="active">Active accounts</option>
            <option value="suspended">
              Suspended accounts
            </option>
            <option value="sync-required">
              Synchronisation required
            </option>
          </select>

          {/* SORTING */}

          <label
            htmlFor="customer-sort"
            className="sr-only"
          >
            Sort customers
          </label>

          <select
            id="customer-sort"
            name="sort"
            defaultValue={sort}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="spending">
              Highest spending
            </option>
            <option value="orders">Most orders</option>
            <option value="name">Name A–Z</option>
          </select>

          {/* SEARCH */}

          <label
            htmlFor="customer-search"
            className="sr-only"
          >
            Search customers
          </label>

          <input
            id="customer-search"
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            maxLength={200}
          />

          <button type="submit">Apply</button>

          {filtering && (
            <Link
              href="/admin/customers"
              className="adm-clear"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* CUSTOMER TABLE */}

      {rows.length === 0 ? (
        <p className="adm-empty">
          {filtering ? (
            <>
              No customers match your filters.{" "}

              <Link href="/admin/customers">
                Clear filters
              </Link>
            </>
          ) : (
            "No customers have registered yet."
          )}
        </p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table adm-customers-table">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Registered</th>
                <th scope="col">Orders</th>
                <th scope="col">Total spent</th>
                <th scope="col">Last order</th>
                <th scope="col">Email status</th>
                <th scope="col">Account status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((customer) => (
                <tr key={customer.id}>
                  {/* CUSTOMER IDENTITY */}

                  <td>
                    <div className="adm-customer-identity">
                      <span
                        className="adm-customer-avatar"
                        aria-hidden="true"
                      >
                        {customer.name
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part: string) =>
                            part.charAt(0).toUpperCase()
                          )
                          .join("")}
                      </span>

                      <div className="adm-customer-name">
                        <strong>{customer.name}</strong>

                        <small>{customer.email}</small>
                      </div>
                    </div>
                  </td>

                  {/* REGISTRATION DATE */}

                  <td>
                    {dateFormat.format(
                      new Date(customer.createdAt)
                    )}
                  </td>

                  {/* ORDER STATISTICS */}

                  <td>{customer.totalOrders}</td>

                  <td>
                    <strong>
                      {gbp.format(customer.totalSpent)}
                    </strong>
                  </td>

                  <td>
                    {customer.lastOrderAt
                      ? dateFormat.format(
                          new Date(customer.lastOrderAt)
                        )
                      : "No orders"}
                  </td>

                  {/* EMAIL VERIFICATION */}

                  <td>
                    <span
                      className={`adm-pill ${
                        customer.emailVerified
                          ? "adm-customer-verified"
                          : "adm-customer-unverified"
                      }`}
                    >
                      {customer.emailVerified
                        ? "Verified"
                        : "Unverified"}
                    </span>
                  </td>

                  {/* ACCOUNT STATUS */}

                  <td>
                    <div className="adm-customer-status-stack">
                      <span
                        className={`adm-pill ${
                          customer.suspended
                            ? "adm-customer-suspended"
                            : customer.authSyncRequired
                              ? "adm-customer-sync-required"
                              : "adm-customer-active"
                        }`}
                      >
                        {customer.suspended
                          ? "Suspended"
                          : customer.authSyncRequired
                            ? "Review required"
                            : "Active"}
                      </span>

                      {customer.authSyncRequired && (
                        <small className="adm-customer-sync-text">
                          Authentication mismatch
                        </small>
                      )}
                    </div>
                  </td>

                  {/* CUSTOMER DETAILS LINK */}

                  <td>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="adm-edit-link"
                    >
                      View customer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}