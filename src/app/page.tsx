import Link from "next/link";



const categoryCards = [
  {
    title: "Lighting",
    href: "/products?category=Lighting",
    className: "category-lighting",
    alt: "Energy-efficient lighting",
  },
  {
    title: "Heating & Insulation",
    href: "/products?category=Heating",
    className: "category-heating",
    alt: "Heating and home insulation products",
  },
  {
    title: "Smart Energy",
    href: "/products?category=Heating",
    className: "category-smart",
    alt: "Energy monitoring and smart home devices",
  },
  {
    title: "Water Saving",
    href: "/products?category=Water%20Saving",
    className: "category-water",
    alt: "Water-saving products",
  },
  {
    title: "Kitchen Appliances",
    href: "/products?category=Home%20%26%20Kitchen",
    className: "category-kitchen",
    alt: "Energy-conscious kitchen appliances",
  },
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
         <Link className="yellow-button" href="/quiz">
          Start the quiz <span aria-hidden="true">→</span></Link>
          <small>Get personalised energy-saving recommendations.</small>
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
    <Link
      href={category.href}
      key={category.title}
      className={`category-tile ${category.className}`}
      aria-label={`Browse ${category.title} products`}
    >
      <span>
        {category.title} <span aria-hidden="true">→</span>
      </span>
    </Link>
  ))}
</div>

      </section>
      {/* ABOUT US SECTION */}
      <section className="home-about" id="about">
        <div className="home-about-content">
          <span className="home-about-tag">ABOUT ECOHOME</span>

          <h2>
            A better home.
            <br />
            A smarter way to <span>live.</span>
          </h2>

          <h3>
            Making sustainable living simpler, one home at a time.
          </h3>

          <p>
            At EcoHome, we believe that creating a more sustainable home
            shouldn&apos;t be complicated. We&apos;re here to make
            energy-efficient living more accessible by bringing together
            practical products that help you use less energy, reduce waste
            and make your home more comfortable.
          </p>

          <p>
            Whether you&apos;re looking to improve your lighting, make
            better use of water or find smarter home essentials, we&apos;re
            here to help you make choices that benefit both your home and
            the environment.
          </p>

          <div className="home-savings-feature">
            <span className="home-savings-icon">✦</span>
            <div>
              <h3>Discover your home&apos;s savings potential.</h3>
              <p>
                Our Find My Savings feature is designed to help you explore
                energy-saving opportunities and discover products suited
                to your home and goals.
              </p>
            </div>
          </div>

          <p className="home-about-tagline">
            Small changes. Smarter choices. Better living.
          </p>

          <Link href="/products" className="home-about-button">
            Shop EcoHome <span>→</span>
          </Link>
        </div>

        <div className="home-about-visual">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000"
            alt="Beautiful modern home interior with natural materials and indoor plants"
          />
          <div className="home-image-caption">
            <span>✿</span> Live more sustainably
          </div>
        </div>

        <div className="home-about-features">
          <div className="home-about-card">
            <span>♧</span>
            <h3>Sustainability</h3>
            <p>Thoughtful choices for a greener home.</p>
          </div>

          <div className="home-about-card">
            <span>£</span>
            <h3>Saving</h3>
            <p>Helping reduce everyday energy use.</p>
          </div>

          <div className="home-about-card">
            <span>⌂</span>
            <h3>Comfort</h3>
            <p>Making everyday living better.</p>
          </div>
        </div>
      </section>
    </div>
    
  );
}
