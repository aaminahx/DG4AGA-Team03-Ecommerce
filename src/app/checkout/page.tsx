
"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    instructions: "",
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryCost = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + deliveryCost;

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const orderDetails = {
    ...formData,
    items,
    subtotal,
    deliveryCost,
    total,
  };

  sessionStorage.setItem(
    "demoOrder",
    JSON.stringify(orderDetails)
  );

  clearCart();

  router.push("/checkout/confirmation");
}

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h2>Your basket is empty</h2>
          <p>Add some products before proceeding to checkout.</p>

          <Link href="/products">
            Explore Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">

      <div className="cart-heading">
        <span className="eyebrow">
          EcoHome / Secure Checkout
        </span>

        <h1>Checkout</h1>

        <p>
          You're one step closer to a more sustainable home.
        </p>
      </div>

      <div className="checkout-layout">

        {/* Customer details form */}
        <section className="checkout-form-section">

          <form className="form checkout-form" onSubmit={handleSubmit}>

            <h2>Contact Information</h2>

            <label>
              First Name
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
              />
            </label>

            <label>
              Last Name
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                required
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </label>

            <div className="checkout-divider" />

            <h2>Delivery Address</h2>

            <label>
              Street Address
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House number and street"
                required
              />
            </label>

            <label>
              City or Town
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                required
              />
            </label>

            <label>
              Postcode
              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                placeholder="Enter your postcode"
                required
              />
            </label>

            <label>
              Delivery Instructions (Optional)
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Any special delivery instructions?"
                rows={4}
              />
            </label>

            <button
              type="submit"
              className="button primary checkout-submit"
            >
              Continue to Payment (Coming Soon)
            </button>

            <p className="checkout-note">
              This is a demonstration checkout. No payment will be taken.
            </p>

          </form>
        </section>

        {/* Order summary */}
        <aside className="cart-summary checkout-summary">

          <h2>Your Order</h2>

          {items.map((item) => (
            <div className="checkout-product" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>Quantity: {item.quantity}</p>
              </div>

              <strong>
                £{(item.price * item.quantity).toFixed(2)}
              </strong>
            </div>
          ))}

          <div className="checkout-divider" />

          <div className="cart-price-row">
            <span>Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>

          <div className="cart-price-row">
            <span>Delivery</span>
            <span>
              {deliveryCost === 0
                ? "Free"
                : `£${deliveryCost.toFixed(2)}`}
            </span>
          </div>

          <div className="cart-total">
            <span>Total</span>
            <span>£{total.toFixed(2)}</span>
          </div>

          <p className="checkout-note">
            {subtotal >= 50
              ? "You've qualified for free delivery!"
              : `Spend £${(50 - subtotal).toFixed(2)} more to unlock free delivery.`}
          </p>

          <Link href="/cart" className="checkout-back-link">
            ← Return to Basket
          </Link>

        </aside>

      </div>
    </main>
  );
}



