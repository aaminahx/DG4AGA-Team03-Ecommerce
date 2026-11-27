export default function FAQPage() {
  return (
    <section className="section info-page">

      <span className="eyebrow">ECOHOME / HELP</span>

      <h1>Frequently Asked Questions</h1>

      <p>
        Have a question? Find answers to some of our
        most common questions below.
      </p>

      <div className="faq-list">

        <details className="faq-item">
          <summary>What is EcoHome?</summary>
          <p>
            EcoHome is an online store focused on
            products that can help households reduce
            energy use and make more sustainable choices.
          </p>
        </details>

        <details className="faq-item">
          <summary>How do I find energy-saving products?</summary>
          <p>
            Browse our product categories or use the
            search feature to find products suitable
            for your home.
          </p>
        </details>

        <details className="faq-item">
          <summary>How do I place an order?</summary>
          <p>
            Browse the catalogue, add products to your
            basket and follow the checkout process.
          </p>
        </details>

        <details className="faq-item">
          <summary>How can I return a product?</summary>
          <p>
            Visit our Delivery & Returns page for
            information about the returns process.
          </p>
        </details>

        <details className="faq-item">
          <summary>How can I contact EcoHome?</summary>
          <p>
            Visit our Contact Us page to find our
            customer support contact details.
          </p>
        </details>

      </div>

    </section>
  );
}

