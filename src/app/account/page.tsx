
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?next=/account");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?next=/account");
  }
// Verify that the customer's account is not suspended.
const { data: profile, error: profileError } =
  await supabase
    .from("profiles")
    .select(
      "first_name, last_name, display_name, phone, is_suspended"
       )
    .eq("id", user.id)
    .single();

// Deny access if the account status cannot be verified.
if (profileError || !profile) {
  redirect("/login?reason=verification-failed");
}

// Prevent suspended customers from accessing their account.
if (profile.is_suspended !== false) {
  redirect("/login?reason=account-suspended");
}
  // Load only the signed-in customer's orders.
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, created_at, total, status, payment_status"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const email = user.email ?? "No email available";

    const firstName = profile.first_name ?? "";
    const lastName = profile.last_name ?? "";
    const phone = profile.phone ?? "";

    const displayName = firstName.trim() || "Customer";

  return (
    <main className="section account-page">
      <span className="eyebrow">
        EcoHome / My Account
      </span>

      <h1>Welcome back, {displayName}!</h1>

      <p className="account-intro">
        Manage your account and keep track of your
        EcoHome journey.
      </p>

      <div className="account-grid">
        {/* PERSONAL DETAILS */}
        <section className="account-card">
          <div className="account-card-icon">👤</div>

          <h2>Personal Details</h2>

          <p>
            Your EcoHome account information.
          </p>

          <div className="account-info">
            <p>
              <strong>Email Address</strong>
            </p>
            <p>{email}</p>

            <p>
              <strong>Account Status</strong>
            </p>
            <p>
              {user.email_confirmed_at
                ? "Email verified"
                : "Email not yet verified"}
            </p>
          </div>
        </section>

        {/* ORDER HISTORY */}
        <section className="account-card">
          <div className="account-card-icon">📦</div>

          <h2>My Orders</h2>

          <p>
            View your previous EcoHome purchases.
          </p>

          {ordersError ? (
            <p role="alert">
              We couldn't load your orders.
              Please try again later.
            </p>
          ) : !orders || orders.length === 0 ? (
            <p className="account-placeholder">
              You haven't placed any orders yet.
            </p>
          ) : (
            <div className="account-info">
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: "12px 0",
                  }}
                >
                  <p>
                    <strong>
                      Order #{order.id.slice(0, 8)}
                    </strong>
                  </p>

                  <p>
                    {new Date(
                      order.created_at
                    ).toLocaleDateString("en-GB")}
                  </p>

                  <p>
                    Total: £{Number(order.total).toFixed(2)}
                  </p>

                  <p>
                    Status: {order.status}
                  </p>

                  <Link
                    href={`/checkout/confirmation?orderId=${encodeURIComponent(
                      order.id
                    )}`}
                    className="account-link"
                  >
                    View Order →
                  </Link>
                </div>
              ))}
            </div>
          )}

          <Link href="/products" className="account-link">
            Continue Shopping →
          </Link>
        </section>

        {/* ACCOUNT SECURITY */}
        <section className="account-card">
          <div className="account-card-icon">🔒</div>

          <h2>Account Security</h2>

          <p>
            Your account is protected by Supabase
            authentication.
          </p>

          <p>
            Password management will be available
            here once the reset feature is connected.
          </p>
        </section>

        {/* MEMBERSHIP */}
        <section className="account-card">
          <div className="account-card-icon">🌱</div>

          <h2>EcoHome Membership</h2>

          <p>
            Thank you for supporting more sustainable
            shopping.
          </p>

          <span className="account-membership">
            Sustainable Living Starts Here
          </span>
        </section>
      </div>

      <Link href="/products" className="account-back-link">
        ← Continue Shopping
      </Link>

      <SignOutButton />
      
    </main>
  );
}
