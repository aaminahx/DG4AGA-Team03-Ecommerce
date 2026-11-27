
"use client";

import { useState } from "react";

type ReturnRequest = {
  id: string;
  order: string;
  product: string;
  reason: string;
  status: "Pending" | "Under review" | "Approved" | "Rejected";
  date: string;
};

const demoOrders = [
  {
    id: "EH-1024",
    date: "18 November 2026",
    products: [
      "Bamboo Storage Basket",
      "Organic Cotton Cushion",
    ],
  },
  {
    id: "EH-1018",
    date: "12 November 2026",
    products: ["Recycled Glass Vase"],
  },
];

export default function ReturnsPage() {
  const [orderId, setOrderId] = useState("");
  const [product, setProduct] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);

  const [requests, setRequests] = useState<ReturnRequest[]>([
    {
      id: "RET-001",
      order: "EH-1018",
      product: "Recycled Glass Vase",
      reason: "Item arrived damaged",
      status: "Under review",
      date: "20 November 2026",
    },
  ]);

  const selectedOrder = demoOrders.find(
    (order) => order.id === orderId
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!orderId || !product || !reason) return;

    const newRequest: ReturnRequest = {
      id: `RET-${String(requests.length + 1).padStart(3, "0")}`,
      order: orderId,
      product,
      reason,
      status: "Pending",
      date: new Date().toLocaleDateString("en-GB"),
    };

    setRequests((previous) => [newRequest, ...previous]);
    setSuccess(true);
    setOrderId("");
    setProduct("");
    setReason("");
    setDescription("");
  }

  return (
    <div className="returns-page">

      {/* Hero */}
      <section className="returns-hero">
        <div className="returns-hero-inner">
          <div>
            <span className="returns-eyebrow">
              ECOHOME CUSTOMER SERVICE
            </span>

            <h1>
              Returns & Refunds<span>.</span>
            </h1>

            <div className="returns-title-underline" />

            <p>
              We want you to love your purchase. If something
              isn't quite right, we're here to help make
              your return simple and hassle-free.
            </p>
          </div>

          <div className="returns-hero-icon" aria-hidden="true">
            ↩
          </div>
        </div>
      </section>

      <div className="returns-container">

        {/* Information cards */}
        <section className="returns-benefits">
          <article className="returns-benefit-card">
            <span className="returns-icon">↩</span>
            <h2>Easy returns</h2>
            <p>
              Submit your return request in just a few
              simple steps.
            </p>
          </article>

          <article className="returns-benefit-card">
            <span className="returns-icon">✓</span>
            <h2>Request tracking</h2>
            <p>
              Stay updated as our team reviews your request.
            </p>
          </article>

          <article className="returns-benefit-card">
            <span className="returns-icon">£</span>
            <h2>Refund updates</h2>
            <p>
              Keep track of your refund progress in one place.
            </p>
          </article>
        </section>

        {/* Return form */}
        <section className="returns-form-section">

          <div className="returns-section-heading">
            <span className="returns-eyebrow">
              CUSTOMER RETURNS CENTRE
            </span>

            <h2>Start a return</h2>

            <p>
              Select an order and tell us which item you'd
              like to return.
            </p>
          </div>

          {success && (
            <div className="returns-success" role="status">
              <strong>✓ Return request submitted!</strong>
              <p>
                Your demonstration request has been added
                to your return history.
              </p>
            </div>
          )}

          <form
            className="returns-form"
            onSubmit={handleSubmit}
          >
            <div className="returns-field">
              <label htmlFor="return-order">
                Select your order
              </label>

              <select
                id="return-order"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setProduct("");
                }}
                required
              >
                <option value="">Choose an order</option>

                {demoOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.id} — {order.date}
                  </option>
                ))}
              </select>
            </div>

            <div className="returns-field">
              <label htmlFor="return-product">
                Product to return
              </label>

              <select
                id="return-product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                disabled={!selectedOrder}
                required
              >
                <option value="">Choose a product</option>

                {selectedOrder?.products.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="returns-field">
              <label htmlFor="return-reason">
                Reason for return
              </label>

              <select
                id="return-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option>Item arrived damaged</option>
                <option>Wrong item received</option>
                <option>Item is faulty</option>
                <option>Not as described</option>
                <option>No longer needed</option>
                <option>Other</option>
              </select>
            </div>

            <div className="returns-field">
              <label htmlFor="return-description">
                Additional information
                <span className="optional-label">
                  Optional
                </span>
              </label>

              <textarea
                id="return-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please tell us a little more about your return..."
              />
            </div>

            <div className="returns-form-bottom">
              <p>
                By submitting, you are requesting a return.
                This does not automatically approve a refund.
              </p>

              <button type="submit" className="returns-submit">
                Submit return request <span>→</span>
              </button>
            </div>
          </form>
        </section>

        {/* Return history */}
        <section className="returns-history">
          <div className="returns-section-heading">
            <span className="returns-eyebrow">
              YOUR ACCOUNT
            </span>

            <h2>Your return requests</h2>

            <p>
              View the status of your previous return requests.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="returns-empty">
              <span>↩</span>
              <h3>No return requests yet</h3>
              <p>
                Your submitted return requests will appear here.
              </p>
            </div>
          ) : (
            <div className="returns-request-list">
              {requests.map((request) => (
                <article
                  className="returns-request-card"
                  key={request.id}
                >
                  <div className="returns-request-info">
                    <span className="returns-request-id">
                      {request.id} · {request.date}
                    </span>

                    <h3>{request.product}</h3>

                    <p>
                      Order {request.order} · {request.reason}
                    </p>
                  </div>

                  <span
                    className={`returns-status returns-status-${request.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {request.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Help panel */}
        <section className="returns-help">
          <div>
            <span className="returns-eyebrow">
              WE'RE HERE TO HELP
            </span>

            <h2>Need a little help?</h2>

            <p>
              Have a question about your order, return or refund?
              Our customer care team is happy to help.
            </p>
          </div>

          <a href="/contact" className="returns-help-button">
            Contact us →
          </a>
        </section>

      </div>
    </div>
  );
}

