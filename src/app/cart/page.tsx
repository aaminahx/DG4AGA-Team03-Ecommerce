
"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryCost = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + deliveryCost;
  const amountForFreeDelivery = Math.max(0, 50 - subtotal);
  const deliveryProgress = Math.min((subtotal / 50) * 100, 100);

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-heading">
          <span className="eyebrow">
            EcoHome / Your Shopping Basket
          </span>

          <h1>Your Basket</h1>

          <p>
            Sustainable choices for a happier home.
          </p>
        </div>

        <div className="cart-empty">
          <h2>Your basket is empty</h2>

          <p>
            Discover our sustainable products and find
            something lovely for your home.
          </p>

          <Link href="/products">
            Explore Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">

      {/* Page heading */}
      <div className="cart-heading">
        <span className="eyebrow">
          EcoHome / Your Shopping Basket
        </span>

        <h1>Your Basket</h1>

        <p>
          Sustainable choices for a happier home.
        </p>
      </div>

      <div className="cart-layout">

        {/* Basket products */}
        <section className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.id}>

              <div>
                <h2>{item.name}</h2>

                <p>
                  Price: £{item.price.toFixed(2)}
                </p>

                <p>
                  Subtotal: £
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              <div className="cart-item-controls">

                <div className="cart-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="cart-remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>

              </div>
            </article>
          ))}
        </section>

        {/* Order summary */}
        <aside className="cart-summary">

          <h2>Order Summary</h2>

          {/* Free delivery progress */}
          <div>
            {subtotal < 50 ? (
              <p className="delivery-message">
                You're £{amountForFreeDelivery.toFixed(2)} away
                from free delivery!
              </p>
            ) : (
              <p className="delivery-message">
                You've unlocked free delivery!
              </p>
            )}

            <div className="delivery-track">
              <div
                className="delivery-progress"
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>

            <p className="delivery-caption">
              Free standard delivery on orders of £50 or more.
            </p>
          </div>

          {/* Price breakdown */}
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

          {/* Checkout */}
          <Link
            href="/checkout"
            className="cart-checkout"
          >
            Proceed to Checkout
          </Link>

          {/* Additional actions */}
          <div className="cart-actions">
            <Link href="/products">
              Continue Shopping
            </Link>

            <button
              type="button"
              onClick={clearCart}
            >
              Empty Basket
            </button>
          </div>

        </aside>
      </div>
    </main>
  );
}










