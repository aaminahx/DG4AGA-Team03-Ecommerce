
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Order = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  subtotal: number;
  delivery_cost: number;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

type PageProps = {
  searchParams: Promise<{
    orderId?: string | string[];
  }>;
};

export default async function ConfirmationPage({
  searchParams,
}: PageProps) {
  const { orderId } = await searchParams;

  const supabase = await createClient();

  if (!supabase) {
    return (
      <main className="cart-page">
        <p>Order service is currently unavailable.</p>
      </main>
    );
  }

  // Confirm the customer is signed in.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h2>Please sign in</h2>
          <p>Sign in to view your order confirmation.</p>
          <Link href="/login">Go to Login</Link>
        </div>
      </main>
    );
  }

  // Only accept a valid order ID.
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (
    typeof orderId !== "string" ||
    !uuidPattern.test(orderId)
  ) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h2>No order selected</h2>
          <p>We couldn't find a valid order reference.</p>
          <Link href="/products">Explore Products</Link>
        </div>
      </main>
    );
  }

  // Fetch only the signed-in customer's order.
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      first_name,
      last_name,
      email,
      address,
      city,
      postcode,
      subtotal,
      delivery_cost,
      total,
      status,
      created_at,
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        line_total
      )
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h2>Order not found</h2>
          <p>
            We couldn't find this order in your account.
          </p>
          <Link href="/products">Explore Products</Link>
        </div>
      </main>
    );
  }

  const order = data as Order;

  return (
    <main className="cart-page">
      <div className="confirmation-card">

        <div className="confirmation-icon">✓</div>

        <span className="eyebrow">
          EcoHome / Order Confirmation
        </span>

        <h1>Thank you, {order.first_name}!</h1>

        <p className="confirmation-message">
          Your simulated order has been placed
          successfully and saved to your account.
        </p>

        <div className="confirmation-details">
          <h2>Order Information</h2>

          <p>
            <strong>Order Reference:</strong>{" "}
            {order.id}
          </p>

          <p>
            <strong>Order Date:</strong>{" "}
            {new Date(order.created_at).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {order.status}
          </p>
        </div>

        <div className="confirmation-details">
          <h2>Delivery Details</h2>

          <p>
            <strong>Name:</strong>{" "}
            {order.first_name} {order.last_name}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {order.email}
          </p>

          <p>
            <strong>Address:</strong>{" "}
            {order.address}, {order.city},{" "}
            {order.postcode}
          </p>
        </div>

        <div className="confirmation-details">
          <h2>Order Summary</h2>

          {order.order_items.map((item) => (
            <div
              className="checkout-product"
              key={item.id}
            >
              <div>
                <strong>{item.product_name}</strong>
                <p>Quantity: {item.quantity}</p>
              </div>

              <strong>
                £{Number(item.line_total).toFixed(2)}
              </strong>
            </div>
          ))}

          <div className="cart-price-row">
            <span>Subtotal</span>
            <span>
              £{Number(order.subtotal).toFixed(2)}
            </span>
          </div>

          <div className="cart-price-row">
            <span>Delivery</span>
            <span>
              {Number(order.delivery_cost) === 0
                ? "Free"
                : `£${Number(
                    order.delivery_cost
                  ).toFixed(2)}`}
            </span>
          </div>

          <div className="cart-total">
            <span>Total</span>
            <span>
              £{Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        <p className="checkout-note">
          This is a simulated order for demonstration
          purposes. No payment has been taken.
        </p>

        <Link
          href="/products"
          className="confirmation-button"
        >
          Continue Shopping
        </Link>

      </div>
    </main>
  );
}
