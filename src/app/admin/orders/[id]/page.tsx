import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import OrderStatusForm from "../OrderStatusForm";

const STATUSES = [
  "placed",
  "processing",
  "dispatched",
  "delivered",
] as const;

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});

export default async function AdminOrderDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  if (!supabase) redirect("/login");

  // Verify authentication.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // Verify administrator permissions.
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/");
  }

  // Validate the order ID.
  const validId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!validId.test(id)) notFound();

  // Retrieve order details.
  const { data: order, error: orderError } =
    await supabase
      .from("orders")
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        postcode,
        instructions,
        subtotal,
        delivery_cost,
        total,
        status,
        payment_status,
        created_at
      `)
      .eq("id", id)
      .maybeSingle();

  if (orderError) {
    return (
      <p role="alert">
        Sorry, this order could not be loaded.
        Please refresh.
      </p>
    );
  }

  if (!order) notFound();

  // Retrieve purchased products.
  const { data: items, error: itemsError } =
    await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        product_name,
        quantity,
        unit_price,
        line_total
      `)
      .eq("order_id", id)
      .order("product_name");

  if (itemsError) {
    return (
      <p role="alert">
        Sorry, the order items could not be loaded.
        Please refresh.
      </p>
    );
  }

  const orderItems = items ?? [];

  const total =
    order.total !== null
      ? Number(order.total)
      : Number(order.subtotal) +
        Number(order.delivery_cost);

  const cancelled = order.status === "cancelled";

  const currentStep = STATUSES.findIndex(
    (status) => status === order.status
  );

  return (
    <div className="adm-order-detail">

      {/* Back navigation */}
      <Link
        href="/admin/orders"
        className="adm-order-back"
      >
        ← Back to orders
      </Link>

      {/* Order heading */}
      <header className="adm-head">
        <div>
          <h1>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>

          <p className="adm-muted">
            Placed on{" "}
            {dateFormat.format(new Date(order.created_at))}
          </p>
        </div>

        <span
          className={`adm-pill adm-order-${order.status}`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </header>

      {/* Order progress */}
      <section className="adm-card adm-order-card">
        <h2>Order progress</h2>

        {cancelled ? (
          <p className="adm-order-cancelled-message">
            This order has been cancelled.
          </p>
        ) : (
          <ol className="adm-order-progress">
            {STATUSES.map((status, index) => (
              <li
                key={status}
                className={
                  index <= currentStep
                    ? "adm-order-step adm-order-step-done"
                    : "adm-order-step"
                }
                aria-current={
                  index === currentStep
                    ? "step"
                    : undefined
                }
              >
                <span
                  className="adm-order-step-circle"
                  aria-hidden="true"
                >
                  {index <= currentStep
                    ? "✓"
                    : index + 1}
                </span>

                <strong>{STATUS_LABELS[status]}</strong>

                <small>
                  {index === currentStep
                    ? "Current status"
                    : index < currentStep
                    ? "Completed"
                    : "Pending"}
                </small>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Customer and delivery details */}
      <div className="adm-order-grid">

        <section className="adm-card adm-order-card">
          <h2>Customer details</h2>

          <dl className="adm-order-info">
            <div>
              <dt>Full name</dt>
              <dd>
                {order.first_name} {order.last_name}
              </dd>
            </div>

            <div>
              <dt>Email address</dt>
              <dd>{order.email}</dd>
            </div>

            <div>
              <dt>Phone number</dt>
              <dd>{order.phone || "Not provided"}</dd>
            </div>
          </dl>
        </section>

        <section className="adm-card adm-order-card">
          <h2>Delivery details</h2>

          <dl className="adm-order-info">
            <div>
              <dt>Delivery address</dt>
              <dd className="adm-order-address">
                {order.address}
                <br />
                {order.city}
                <br />
                {order.postcode}
              </dd>
            </div>

            <div>
              <dt>Delivery instructions</dt>
              <dd>
                {order.instructions || "None provided"}
              </dd>
            </div>
          </dl>
        </section>

      </div>

      {/* Purchased products */}
      <section className="adm-card adm-order-card">
        <h2>Order items</h2>

        <p className="adm-muted">
          {orderItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          )}{" "}
          items purchased
        </p>

        {orderItems.length === 0 ? (
          <p className="adm-empty">
            No items were found for this order.
          </p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table adm-order-items">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Unit price</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>

              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.product_name}</strong>
                    </td>

                    <td>{item.quantity}</td>

                    <td>
                      {gbp.format(Number(item.unit_price))}
                    </td>

                    <td>
                      {gbp.format(
                        item.line_total !== null
                          ? Number(item.line_total)
                          : Number(item.unit_price) *
                            item.quantity
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Order totals */}
        <div className="adm-order-totals">
          <div>
            <span>Subtotal</span>
            <strong>
              {gbp.format(Number(order.subtotal))}
            </strong>
          </div>

          <div>
            <span>Delivery</span>
            <strong>
              {Number(order.delivery_cost) === 0
                ? "Free"
                : gbp.format(Number(order.delivery_cost))}
            </strong>
          </div>

          <div className="adm-order-grand-total">
            <span>Order total</span>
            <strong>{gbp.format(total)}</strong>
          </div>
        </div>
      </section>

      {/* Payment information */}
      <section className="adm-card adm-order-card">
        <h2>Payment information</h2>

        <dl className="adm-order-info">
          <div>
            <dt>Payment status</dt>
            <dd>
              <span className="adm-pill adm-payment-simulated">
                {order.payment_status === "simulated"
                  ? "Simulated"
                  : order.payment_status}
              </span>
            </dd>
          </div>

          <div>
            <dt>Order amount</dt>
            <dd>{gbp.format(total)}</dd>
          </div>

          <div>
            <dt>Payment method</dt>
            <dd>Simulated checkout</dd>
          </div>
        </dl>

        <p className="adm-order-payment-note">
          This order was placed using EcoHome&apos;s
          simulated checkout. No real payment was taken.
        </p>
      </section>

      {/* Order management */}
        <section className="adm-card adm-order-card">
          <h2>Manage order</h2>

          <p className="adm-muted">
            Update the fulfilment status of this order.
          </p>

          <OrderStatusForm
            key={order.id}
            orderId={order.id}
            currentStatus={order.status}
          />
        </section>
    </div>
  );
}