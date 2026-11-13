import Link from "next/link";

const categoryCards = [
  { title: "Lighting", className: "category-lighting", alt: "Pendant lighting" },
  { title: "Heating", className: "category-heating", alt: "Radiator" },
  { title: "Home & Kitchen", className: "category-kitchen", alt: "Kitchen kettle" },
  { title: "Water Saving", className: "category-water", alt: "Shower" },
];

export default function Home() {
  return (
    <div className="eco-homepage">
      <section className="eco-hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <span className="eco-eyebrow">Energy-saving for every home</span>
          <h1 id="hero-heading">Smarter<br />home living<span className="title-dot">.</span></h1>
          <span className="title-underline" aria-hidden="true" />
          <p>Energy-efficient products that help you save money, reduce usage and live more comfortably.</p>
          <Link className="yellow-button" href="/products">Shop the range <span aria-hidden="true">→</span></Link>
        </div>
        <div className="hero-visual" role="img" aria-label="Warm modern interior with a glowing table lamp, plants and books" />
      </section>

      <section className="savings-panel" id="savings" aria-labelledby="savings-heading">
        <div className="savings-intro">
          <span className="eco-eyebrow">Personalised energy plan</span>
          <h2 id="savings-heading">Find My Savings</h2>
          <p>Answer a few quick questions about your home, budget and energy use. Get personalised product recommendations and see how much you could save.</p>
          <Link className="yellow-button" href="/products">Explore products <span aria-hidden="true">→</span></Link>
          <small>Interactive quiz coming soon.</small>
        </div>
        <div className="savings-steps" aria-label="How the future savings quiz will work">
          <div><span className="step-icon">▤</span><p>1. Tell us<br />about your home</p></div>
          <div><span className="step-icon">☷</span><p>2. Set your<br />budget &amp; goals</p></div>
          <div><span className="step-icon">✧</span><p>3. Get AI<br />recommendations</p></div>
        </div>
        <div className="savings-example" aria-label="Illustrative savings preview">
          <span>Your potential savings</span>
          <p><strong>£120</strong> / year <em>Example</em></p>
          <div className="mini-bars"><div /><div /></div>
          <small>Illustration only — not a calculated estimate.</small>
        </div>
      </section>

      <section className="categories-section" id="categories" aria-labelledby="categories-heading">
        <div className="category-heading"><h2 id="categories-heading">Shop by Category</h2><Link href="/products">View all categories <span aria-hidden="true">→</span></Link></div>
        <div className="category-grid">
          {categoryCards.map((category) => (
            <Link href="/products" key={category.title} className={`category-tile ${category.className}`} aria-label={`Browse ${category.title} products`}>
              <span>{category.title} <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
