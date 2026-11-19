
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  instructions: string;
};

type FieldName = keyof FormData;
type FieldErrors = Partial<Record<FieldName, string>>;

// Styling applied directly to invalid fields.
// This works without adding any new CSS.
const invalidFieldStyle = {
  border: "2px solid #dc2626",
  backgroundColor: "#fff1f2",
  boxShadow: "0 0 0 1px #dc2626",
};

const fieldErrorStyle = {
  display: "block",
  color: "#b91c1c",
  fontSize: "13px",
  fontWeight: 500,
  marginTop: "5px",
} as const;

const checkoutErrorStyle = {
  color: "#b91c1c",
  backgroundColor: "#fff1f2",
  border: "1px solid #fecdd3",
  padding: "12px",
  borderRadius: "8px",
  marginTop: "12px",
  marginBottom: "12px",
};

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutKey, setCheckoutKey] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    instructions: "",
  });

  // Basket totals for display.
  // Supabase calculates the final authoritative total.
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryCost = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + deliveryCost;

  const basketSignature = JSON.stringify(
    items.map(({ id, quantity }) => ({ id, quantity }))
  );

  const customerSignature = JSON.stringify(formData);

  // Reset the checkout request key when the order changes.
  useEffect(() => {
    setCheckoutKey(null);
  }, [basketSignature, customerSignature]);

  // Validate every checkout field.
  function validateForm(): FieldErrors {
    const errors: FieldErrors = {};

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const city = formData.city.trim();
    const postcode = formData.postcode.trim();

    if (firstName.length < 1 || firstName.length > 80) {
      errors.firstName =
        "Please enter your first name (maximum 80 characters).";
    }

    if (lastName.length < 1 || lastName.length > 80) {
      errors.lastName =
        "Please enter your last name (maximum 80 characters).";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    const phonePattern = /^\+?[\d\s()-]{7,40}$/;

    if (!phone) {
      errors.phone = "Please enter your phone number.";
    } else if (
      phone.length > 40 ||
      !phonePattern.test(phone)
    ) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (address.length < 5 || address.length > 250) {
      errors.address =
        "Enter a street address of at least 5 characters.";
    }

    if (city.length < 2 || city.length > 100) {
      errors.city = "Please enter a valid city or town.";
    }

    // Basic UK postcode validation.
    const ukPostcode =
      /^(GIR\s?0AA|(?:[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}))$/i;

    if (!ukPostcode.test(postcode)) {
      errors.postcode =
        "Please enter a valid UK postcode, e.g. B1 1AA.";
    }

    if (formData.instructions.length > 1000) {
      errors.instructions =
        "Delivery instructions must be under 1,000 characters.";
    }

    return errors;
  }

  // Update form values and remove corrected field errors.
  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    const field = name as FieldName;

    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setCheckoutError("");
  }

  // Submit checkout to the existing secure API.
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setCheckoutError(
        "Please correct the highlighted fields before placing your order."
      );

      const firstInvalidField = Object.keys(errors)[0];

      document
        .getElementsByName(firstInvalidField)[0]
        ?.focus();

      return;
    }

    setIsSubmitting(true);
    setCheckoutError("");

    const requestKey = checkoutKey ?? crypto.randomUUID();
    setCheckoutKey(requestKey);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          customer: {
            ...formData,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postcode: formData.postcode.trim().toUpperCase(),
          },
          idempotencyKey: requestKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to place your order."
        );
      }

      if (!result.orderId) {
        throw new Error("No order reference was returned.");
      }

    // Show a loading screen while navigating.
setIsRedirecting(true);

// Clear basket after the order has been saved.
clearCart();

// Navigate to confirmation.
router.replace(
  `/checkout/confirmation?orderId=${encodeURIComponent(
    result.orderId
  )}`
);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }
if (isRedirecting) {
  return (
    <main
      className="cart-page"
      style={{
        textAlign: "center",
        paddingTop: "100px",
        paddingBottom: "100px",
      }}
    >
      <div
        role="status"
        aria-live="polite"
        style={{
          maxWidth: "450px",
          margin: "0 auto",
        }}
      >
        <h2>Order placed successfully!</h2>

        <p style={{ marginTop: "15px" }}>
          We're preparing your order confirmation...
        </p>

        <div
          style={{
            margin: "25px auto",
            width: "35px",
            height: "35px",
            border: "4px solid #d1fae5",
            borderTop: "4px solid #15803d",
            borderRadius: "50%",
            animation: "ecohome-spin 0.8s linear infinite",
          }}
        />

        <style jsx>{`
          @keyframes ecohome-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </main>
  );
}
  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h2>Your basket is empty</h2>
          <p>
            Add some products before proceeding to checkout.
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
        <section className="checkout-form-section">
          <form
            className="form checkout-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <h2>Contact Information</h2>

            {/* FIRST NAME */}
            <label>
              First Name

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                maxLength={80}
                aria-invalid={!!fieldErrors.firstName}
                style={
                  fieldErrors.firstName
                    ? invalidFieldStyle
                    : undefined
                }
                required
              />

              {fieldErrors.firstName && (
                <span role="alert" style={fieldErrorStyle}>
                  {fieldErrors.firstName}
                </span>
              )}
            </label>

            {/* LAST NAME */}
            <label>
              Last Name

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                maxLength={80}
                aria-invalid={!!fieldErrors.lastName}
                style={
                  fieldErrors.lastName
                    ? invalidFieldStyle
                    : undefined
                }
                required
              />

              {fieldErrors.lastName && (
                <span role="alert" style={fieldErrorStyle}>
                  {fieldErrors.lastName}
                </span>
              )}
            </label>

            {/* EMAIL */}
            <label>
              Email Address

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-invalid={!!fieldErrors.email}
                style={
                  fieldErrors.email
                    ? invalidFieldStyle
                    : undefined
                }
                required
              />

              {fieldErrors.email && (
                <span role="alert" style={fieldErrorStyle}>
                  {fieldErrors.email}
                </span>
              )}
            </label>

            {/* PHONE */}
            <label>
              Phone Number

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="07123456789"
                maxLength={40}
                aria-invalid={!!fieldErrors.phone}
                style={
                  fieldErrors.phone
                    ? invalidFieldStyle
                    : undefined
                }
                required
              />

              {fieldErrors.phone && (
                <span role="alert" style={fieldErrorStyle}>
                  {fieldErrors.phone}
                </span>
              )}
            </label>

            <div className="checkout-divider" />

            <h2>Delivery Address</h2>

            {/* STREET ADDRESS */}
            <label>
              Street Address

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House number and street"
                minLength={5}
                maxLength={250}
                aria-invalid={!!fieldErrors.address}
                style={
                  fieldErrors.address
                    ? invalidFieldStyle
                    : undefined
                }
                required
              />

              {fieldErrors.address && (
                <span role="alert" style={fieldErrorStyle}>
                  {fieldErrors.address}
                </span>
              )}
            </label>

            {/* CITY */}
            <label>
              City or Town

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                minLength={2}
                maxLength={100}
                aria-invalid={!!fieldErrors.city}
                style={
                  fieldErrors.city
                    ? invalidFieldStyle
                    : undefined
                }
                required
              />

              {fieldErrors.city && (
                <span role="alert" style={fieldErrorStyle}>
                  {fieldErrors.city}
                </span>
              )}
            </label>

            {/* POSTCODE */}
            <label>
              Postcode

              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                placeholder="B1 1AA"
                maxLength={20}
                aria-invalid={!!fieldErrors.postcode}
                style={
                  fieldErrors.postcode
                    ? invalidFieldStyle
                    : undefined
                }
                required
              />

              {fieldErrors.postcode && (
                <span role="alert" style={fieldErrorStyle}>
                  {fieldErrors.postcode}
                </span>
              )}
            </label>

            {/* DELIVERY INSTRUCTIONS */}
            <label>
              Delivery Instructions (Optional)

              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Any special delivery instructions?"
                rows={4}
                maxLength={1000}
                aria-invalid={!!fieldErrors.instructions}
                style={
                  fieldErrors.instructions
                    ? invalidFieldStyle
                    : undefined
                }
              />

              {fieldErrors.instructions && (
                <span role="alert" style={fieldErrorStyle}>
                  {fieldErrors.instructions}
                </span>
              )}
            </label>

            {/* CHECKOUT ERROR */}
            {checkoutError && (
              <p role="alert" style={checkoutErrorStyle}>
                {checkoutError}
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="button primary checkout-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Placing your order..."
                : "Place Demo Order"}
            </button>

            <p className="checkout-note">
              This is a demonstration checkout.
              No payment will be taken.
            </p>
          </form>
        </section>

        {/* ORDER SUMMARY */}
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
