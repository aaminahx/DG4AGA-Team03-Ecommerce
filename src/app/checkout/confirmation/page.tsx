
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderDetails = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
};

export default function ConfirmationPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrder = sessionStorage.getItem("demoOrder");

      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch (error) {
      console.error("Could not load order:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <main className="cart-page">
        <p>Loading your order...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h2>No recent order found</h2>
          <p>Please visit checkout to complete a demo order.</p>
          <Link href="/products">Explore Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="confirmation-card">

        <div className="confirmation-icon">✓</div>

        <span className="eyebrow">EcoHome / Order Confirmation</span>

        <h1>Thank you, {order.firstName}!</h1>

        <p className="confirmation-message">
          Your demo checkout has been completed successfully.
          Here is a summary of your order.
        </p>

        <div className="confirmation-details">
          <h2>Delivery Details</h2>

          <p>
            <strong>Name:</strong> {order.firstName} {order.lastName}
          </p>

          <p>
            <strong>Email:</strong> {order.email}
          </p>

          <p>
            <strong>Address:</strong> {order.address}, {order.city}, {order.postcode}
          </p>
        </div>

        <div className="confirmation-details">
          <h2>Order Summary</h2>

          {order.items.map((item) => (
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

          <div className="cart-price-row">
            <span>Subtotal</span>
            <span>£{order.subtotal.toFixed(2)}</span>
          </div>

          <div className="cart-price-row">
            <span>Delivery</span>
            <span>
              {order.deliveryCost === 0
                ? "Free"
                : `£${order.deliveryCost.toFixed(2)}`}
            </span>
          </div>

          <div className="cart-total">
            <span>Total</span>
            <span>£{order.total.toFixed(2)}</span>
          </div>
        </div>

        <p className="checkout-note">
          Demo confirmation only. No payment has been taken
          and no real order has been placed.
        </p>

        <Link href="/products" className="confirmation-button">
          Continue Shopping
        </Link>

      </div>
    </main>
  );
}

