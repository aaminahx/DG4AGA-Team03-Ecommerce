"use client";

import Link from "next/link";
import { useState } from "react";
import { UserRound, Heart, Search } from "lucide-react";
import BasketLink from "@/components/BasketLink";

const categories = ["Lighting", "Heating", "Home & Kitchen", "Water Saving"];

export default function EcoHeader() {
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <header className="eco-header">
      <Link href="/" className="eco-logo" aria-label="EcoHome home">
        <span className="eco-house" aria-hidden="true">⌂</span><span>EcoHome</span>
      </Link>
      <button className="mobile-menu-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
        ☰ <span className="sr-only">Toggle navigation</span>
      </button>
      <nav className={`eco-nav ${menuOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
        <div className="nav-shop">
          <button type="button" className="nav-link" aria-expanded={shopOpen} onClick={() => setShopOpen(!shopOpen)}>Shop <span aria-hidden="true">⌄</span></button>
          {shopOpen && (
            <div className="shop-menu">
              {categories.map((category, index) => (
                <Link href="/products" onClick={() => setShopOpen(false)} key={category}>
                  <span aria-hidden="true">{["♧", "▥", "▣", "♢"][index]}</span> {category}
                </Link>
              ))}
              <Link className="all-products-link" href="/products" onClick={() => setShopOpen(false)}>Shop all products →</Link>
            </div>
          )}
        </div>
        <a className="nav-link active-link" href="/#savings">Find My Savings</a>
      </nav>

      <div className="eco-actions">
        <form className="eco-search" action="/products" method="get">
          <Search size={20} strokeWidth={1.8} aria-hidden="true" />
          <input aria-label="Search products" name="q" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </form>
        <Link className="icon-link" href="/login" aria-label="Sign in">
  <UserRound size={24} strokeWidth={1.8} />
</Link>
        <Link className="nav-link" href="/account">
  My Account
</Link>
        <span
  className="icon-link"
  aria-label="Favourites coming soon"
  title="Favourites coming soon"
>
  <Heart size={24} strokeWidth={1.8} />
</span>
      <div className="basket-wrap">
  <BasketLink />
</div>
      </div>
    </header>
  );
}
