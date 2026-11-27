import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUSES = [
  "placed",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof STATUSES)[number];

type Order = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subtotal: number;
  delivery_cost: number;
  total: number | null;
  status: OrderStatus;
  payment_status: string;
  created_at: string;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
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
  month: "short",
  year: "numeric",
  timeZone: "Europe/London",
});

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const q =
    typeof params.q === "string"
      ? params.q.slice(0, 200)
      : "";

  const status = STATUSES.includes(
    params.status as OrderStatus
  )
    ? (params.status as OrderStatus)
    : "";

  const supabase = await createClient();

  if (!supabase) redirect("/login");

  // Verify the authenticated user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // Restrict the page to administrators.
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/");
  }

  // Retrieve customer orders.
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      first_name,
      last_name,
      email,
      subtotal,
      delivery_cost,
      total,
      status,
      payment_status,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p role="alert">
        Sorry, the orders could not be loaded.
        Please refresh.
      </p>
    );
  }

  const all = (data ?? []) as Order[];

  // Order statistics.
  const placed = all.filter(
    (o) => o.status === "placed"
  ).length;

  const processing = all.filter(
    (o) => o.status === "processing"
  ).length;

  const dispatched = all.filter(
    (o) => o.status === "dispatched"
  ).length;

  const delivered = all.filter(
    (o) => o.status === "delivered"
  ).length;

  const cancelled = all.filter(
    (o) => o.status === "cancelled"
  ).length;

  // Search and filtering.
  const term = q.trim().toLowerCase();

  const rows = all.filter((order) => {
    const customerName =
      `${order.first_name} ${order.last_name}`.toLowerCase();

    const reference =
      `#${order.id.slice(0, 8)}`.toLowerCase();

    return (
      (!status || order.status === status) &&
      (!term ||
        customerName.includes(term) ||
        order.email.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term) ||
        reference.includes(term))
    );
  });

  const filtering = Boolean(term || status);

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Orders</h1>

          <p className="adm-muted">
            {filtering
              ? `Showing ${rows.length} of ${all.length} orders.`
              : "View and manage customer orders."}
          </p>
        </div>
      </header>

      {/* Order summary cards */}
      <section
        className="adm-stats"
        aria-label="Order summary"
      >
        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">
            🧾
          </span>
          <strong>{all.length}</strong>
          <span>Total orders</span>
          <small>{cancelled} cancelled</small>
        </article>

        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">
            📦
          </span>
          <strong>{placed + processing}</strong>
          <span>Awaiting dispatch</span>
          <small>
            {placed} placed · {processing} processing
          </small>
        </article>

        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">
            🚚
          </span>
          <strong>{dispatched}</strong>
          <span>Dispatched</span>
          <small>On their way</small>
        </article>

        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">
            ✅
          </span>
          <strong>{delivered}</strong>
          <span>Delivered</span>
          <small>Completed orders</small>
        </article>
      </section>

      {/* Search and filter */}
      <div className="adm-head adm-orders-toolbar">
        <div>
          <h2>All orders</h2>
          <p className="adm-muted">
            {rows.length} orders found
          </p>
        </div>

        <form
          className="adm-search"
          role="search"
          action="/admin/orders"
        >
          <label
            htmlFor="adm-status"
            className="sr-only"
          >
            Filter by order status
          </label>

          <select
            id="adm-status"
            name="status"
            defaultValue={status}
          >
            <option value="">All statuses</option>

            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>

          <label
            htmlFor="adm-order-q"
            className="sr-only"
          >
            Search orders
          </label>

          <input
            id="adm-order-q"
            name="q"
            defaultValue={q}
            placeholder="Search orders"
            maxLength={200}
          />

          <button type="submit">Apply</button>

          {filtering && (
            <a
              href="/admin/orders"
              className="adm-clear"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Orders table */}
      {rows.length === 0 ? (
        <p className="adm-empty">
          {filtering ? (
            <>
              No orders match your filters.{" "}
              <a href="/admin/orders">
                Clear filters
              </a>
            </>
          ) : (
            "No customer orders have been placed yet."
          )}
        </p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table adm-orders-table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Total</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((order) => (
                <tr key={order.id}>
                  <td>
  <Link
    href={`/admin/orders/${order.id}`}
    className="adm-product-link"
  >
    <strong>
      #{order.id.slice(0, 8).toUpperCase()}
    </strong>
    </Link>

    <Link
        href={`/admin/orders/${order.id}`}
        className="adm-edit-link"
    >
        View order
    </Link>
    </td>

                  <td>
                    <strong>
                      {order.first_name} {order.last_name}
                    </strong>
                    <small>{order.email}</small>
                  </td>

                  <td>
                    {dateFormat.format(
                      new Date(order.created_at)
                    )}
                  </td>

                  <td>
                    <strong>
                      {gbp.format(
                        order.total !== null
                          ? Number(order.total)
                          : Number(order.subtotal) +
                            Number(order.delivery_cost)
                      )}
                    </strong>
                  </td>

                  <td>
                    <span className="adm-pill adm-payment-simulated">
                      Simulated
                    </span>
                  </td>

                  <td>
                    <span
                      className={`adm-pill adm-order-${order.status}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
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