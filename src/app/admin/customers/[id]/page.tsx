import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetails } from "../data";
import CustomerStatusForm from "../CustomerStatusForm";
import CustomerAccountHistory from "../CustomerAccountHistory";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function AdminCustomerDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const customer = await getCustomerDetails(id);

  if (!customer) {
    notFound();
  }

  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");

  const latestOrder = customer.latestOrder;

  return (
    <div className="adm-customer-details">

      {/* Back navigation */}

      <Link
        href="/admin/customers"
        className="adm-edit-link adm-customer-back"
      >
        ← Back to customers
      </Link>

      {/* Customer header */}

      <header className="adm-customer-header">
        <div className="adm-customer-profile">
          <div className="adm-customer-avatar-large">
            {initials}
          </div>

          <div className="adm-customer-heading">
            <span className="adm-customer-eyebrow">
              CUSTOMER PROFILE
            </span>

            <h1>{customer.name}</h1>

            <p>{customer.email}</p>
          </div>
        </div>

        <span
          className={`adm-pill ${
            customer.suspended
              ? "adm-customer-suspended"
              : "adm-customer-active"
          }`}
        >
          {customer.suspended ? "Suspended" : "Not suspended"}
        </span>
      </header>

      {/* Customer statistics */}

      <div className="adm-stats">

        <div className="adm-stat">
          <span>Total orders</span>
          <strong>{customer.totalOrders}</strong>
          <small>All orders placed</small>
        </div>

        <div className="adm-stat">
          <span>Total spending</span>
          <strong>{formatMoney(customer.totalSpent)}</strong>
          <small>Excluding cancelled orders</small>
        </div>

        <div className="adm-stat">
          <span>Average order value</span>
          <strong>{formatMoney(customer.averageOrder)}</strong>
          <small>Non-cancelled orders</small>
        </div>

        <div className="adm-stat">
          <span>Delivered orders</span>
          <strong>{customer.deliveredOrders}</strong>
          <small>
            {customer.cancelledOrders} cancelled
          </small>
        </div>

      </div>

      {/* Account and delivery information */}

      <div className="adm-customer-info-grid">

        <section className="adm-customer-panel">
          <div className="adm-customer-panel-head">
            <h2>Account information</h2>
            <p>Registered customer account details.</p>
          </div>

          <dl className="adm-customer-information">

            <div>
              <dt>Full name</dt>
              <dd>{customer.name}</dd>
            </div>

            <div>
              <dt>Email address</dt>
              <dd>{customer.email}</dd>
            </div>

            <div>
              <dt>Account role</dt>
              <dd>{formatStatus(customer.role)}</dd>
            </div>

            <div>
              <dt>Registration date</dt>
              <dd>{formatDate(customer.createdAt)}</dd>
            </div>

            <div>
              <dt>Email verification</dt>
              <dd>
                <span
                  className={`adm-pill ${
                    customer.emailVerified
                      ? "adm-customer-active"
                      : "adm-customer-unverified"
                  }`}
                >
                  {customer.emailVerified
                    ? "Verified"
                    : "Unverified"}
                </span>
              </dd>
            </div>

            <div>
              <dt>Last sign in</dt>
              <dd>
                {customer.lastSignIn
                  ? formatDate(customer.lastSignIn)
                  : "Never signed in"}
              </dd>
            </div>

            <div>
              <dt>Account status</dt>
              <dd>
                {customer.suspended
                  ? "Suspended"
                  : "Not suspended"}
              </dd>
            </div>

          </dl>
        </section>

        {/* Latest delivery details */}

        <section className="adm-customer-panel">
          <div className="adm-customer-panel-head">
            <h2>Delivery information</h2>
            <p>Details from the customer's most recent order.</p>
          </div>

          {latestOrder ? (
            <dl className="adm-customer-information">

              <div>
                <dt>Recipient</dt>
                <dd>
                  {[
                    latestOrder.first_name,
                    latestOrder.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ") || "Not provided"}
                </dd>
              </div>

              <div>
                <dt>Contact email</dt>
                <dd>{latestOrder.email || "Not provided"}</dd>
              </div>

              <div>
                <dt>Phone number</dt>
                <dd>{latestOrder.phone || "Not provided"}</dd>
              </div>

              <div>
                <dt>Address</dt>
                <dd>{latestOrder.address || "Not provided"}</dd>
              </div>

              <div>
                <dt>City</dt>
                <dd>{latestOrder.city || "Not provided"}</dd>
              </div>

              <div>
                <dt>Postcode</dt>
                <dd>{latestOrder.postcode || "Not provided"}</dd>
              </div>

              <div>
                <dt>Last order date</dt>
                <dd>{formatDate(latestOrder.created_at)}</dd>
              </div>

            </dl>
          ) : (
            <div className="adm-customer-empty">
              <h3>No delivery information</h3>

              <p>
                This customer has not placed an order yet.
                Delivery details will appear once an order
                has been placed.
              </p>
            </div>
          )}
        </section>

      </div>

      {/* Order history */}

      <section className="adm-customer-panel">
        <div className="adm-customer-panel-head">
          <h2>Order history</h2>

          <p>
            View all orders associated with this customer.
          </p>
        </div>

        {customer.orders.length === 0 ? (
          <div className="adm-customer-empty">
            <h3>No orders yet</h3>

            <p>
              This customer has not made any purchases.
            </p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table adm-customer-orders-table">
              <thead>
                <tr>
                  <th>Order reference</th>
                  <th>Date placed</th>
                  <th>Total</th>
                  <th>Order status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.id}>

                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="adm-product-link"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>

                    <td>
                      {formatDate(order.created_at)}
                    </td>

                    <td>
                      <strong>
                        {formatMoney(
                          Number(
                            order.total ??
                              Number(order.subtotal) +
                                Number(order.delivery_cost)
                          )
                        )}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`adm-pill adm-order-${order.status}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td>
                      <span className="adm-pill adm-payment-simulated">
                        {formatStatus(order.payment_status)}
                      </span>
                    </td>

                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="adm-edit-link"
                      >
                        View order →
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Account management */}
      <CustomerStatusForm
        customerId={customer.id}
        suspended={customer.suspended}
      />
      <CustomerAccountHistory
  suspended={customer.suspended}
  suspendedAt={customer.suspendedAt}
  suspendedByName={customer.suspendedByName}
  suspensionReason={customer.suspensionReason}
  authSyncRequired={customer.authSyncRequired}
  accountHistory={customer.accountHistory}
/>

    </div>
  );
}