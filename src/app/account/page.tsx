
"use client";

import Link from "next/link";

export default function AccountPage() {
  // Temporary demo customer information
  const customer = {
    firstName: "Alex",
    lastName: "Green",
    email: "alex@example.com",
  };

  return (
    <main className="section account-page">
      <span className="eyebrow">EcoHome / My Account</span>

      <h1>Welcome back, {customer.firstName}!</h1>

      <p className="account-intro">
        Manage your account and keep track of your EcoHome journey.
      </p>

      <div className="account-grid">

        <section className="account-card">
          <div className="account-card-icon">👤</div>
          <h2>Personal Details</h2>
          <p>View and manage your personal information.</p>

          <div className="account-info">
            <p><strong>Name</strong></p>
            <p>{customer.firstName} {customer.lastName}</p>

            <p><strong>Email</strong></p>
            <p>{customer.email}</p>
          </div>

          <Link href="/account/edit" className="account-link">
            Edit Profile →
          </Link>
        </section>

        <section className="account-card">
          <div className="account-card-icon">📦</div>
          <h2>My Orders</h2>
          <p>Keep track of your purchases and delivery information.</p>

          <p className="account-placeholder">
            Your order history will appear here.
          </p>

          <Link href="/cart" className="account-link">
            View Basket →
          </Link>
        </section>

        <section className="account-card">
          <div className="account-card-icon">🔒</div>
          <h2>Account Security</h2>
          <p>Keep your account secure and manage your password.</p>

          <Link href="/forgot-password" className="account-link">
            Reset Password →
          </Link>
        </section>

        <section className="account-card">
          <div className="account-card-icon">🌱</div>
          <h2>EcoHome Membership</h2>
          <p>
            Thank you for supporting more sustainable shopping.
          </p>

          <span className="account-membership">
            Sustainable Living Starts Here
          </span>
        </section>

      </div>

      <p className="account-demo-note">
        Demo account: Customer information is currently sample data.
        Real account details will be connected through Supabase later.
      </p>

      <Link href="/products" className="account-back-link">
        ← Continue Shopping
      </Link>
    </main>
  );
}

