import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">A foundation, not a finished assessment</span>
          <h1>Turn a real need into a responsible e-commerce platform.</h1>
          <p>
            This starter proves the deployment path. Your team must define the
            business, redesign the experience and implement, test and evaluate
            the assessed functionality.
          </p>
          <div className="actions">
            <Link className="button primary" href="/products">View sample catalogue</Link>
            <a className="button secondary" href="https://github.com" target="_blank" rel="noreferrer">Open GitHub</a>
          </div>
        </div>
        <div className="hero-card" aria-label="Project priorities">
          <strong>Build for evidence</strong>
          <ul>
            <li>Secure and role-aware</li>
            <li>Usable and accessible</li>
            <li>Reliable and tested</li>
            <li>Deployed and assessable</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <span className="eyebrow">Your first decisions</span>
        <h2>Do not begin with colours and products.</h2>
        <div className="grid three">
          <article className="card"><span>01</span><h3>Need</h3><p>Who experiences a credible problem, and why does it matter?</p></article>
          <article className="card"><span>02</span><h3>Value</h3><p>How will the platform improve the existing customer or operational journey?</p></article>
          <article className="card"><span>03</span><h3>Evidence</h3><p>How will your team demonstrate quality, decisions and individual contribution?</p></article>
        </div>
      </section>

      <section className="notice">
        <strong>Intentionally incomplete:</strong> basket, checkout, orders,
        returns, reviews, inventory rules, administrator tools and any AI-enabled
        extension are not implemented for you.
      </section>
    </>
  );
}
