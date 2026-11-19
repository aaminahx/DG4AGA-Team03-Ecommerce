"use client";

import Link from "next/link";
import { useState } from "react";
import { UserRound, Heart, Sparkles } from "lucide-react";
import BasketLink from "@/components/BasketLink";
import AIShoppingAssistant from "@/components/AIShoppingAssistant";
import type { Product } from "@/lib/types";

const categories = ["Lighting", "Heating", "Home & Kitchen", "Water Saving"];

type Props = {
  products: Product[];
};

export default function EcoHeader({ products }: Props) {
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMinimized, setAssistantMinimized] = useState(false);

  const handleHeaderTriggerClick = () => {
    if (!assistantOpen) {
      setAssistantOpen(true);
      setAssistantMinimized(false);
    } else if (assistantMinimized) {
      setAssistantMinimized(false);
    } else {
      setAssistantMinimized(true);
    }
  };

  return (
    <>
      <header className="eco-header">
        <Link href="/" className="eco-logo" aria-label="EcoHome home">
          <span className="eco-house" aria-hidden="true">⌂</span>
          <span>EcoHome</span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰ <span className="sr-only">Toggle navigation</span>
        </button>

        <nav
          className={`eco-nav ${menuOpen ? "mobile-open" : ""}`}
          aria-label="Main navigation"
        >
          <div className="nav-shop">
            <button
              type="button"
              className="nav-link"
              aria-expanded={shopOpen}
              onClick={() => setShopOpen(!shopOpen)}
            >
              Shop <span aria-hidden="true">⌄</span>
            </button>

            {shopOpen && (
              <div className="shop-menu">
                {categories.map((category, index) => (
                  <Link
                    href="/products"
                    onClick={() => setShopOpen(false)}
                    key={category}
                  >
                    <span aria-hidden="true">
                      {["♧", "▥", "▣", "♢"][index]}
                    </span>{" "}
                    {category}
                  </Link>
                ))}

                <Link
                  className="all-products-link"
                  href="/products"
                  onClick={() => setShopOpen(false)}
                >
                  Shop all products →
                </Link>
              </div>
            )}
          </div>

          <a className="nav-link active-link" href="/#savings">
            Find My Savings
          </a>
        </nav>

        <div className="eco-actions">
          <button
            type="button"
            className="eco-search ai-header-trigger"
            onClick={handleHeaderTriggerClick}
            aria-label="Open EcoHome AI shopping assistant"
            aria-haspopup="dialog"
            aria-expanded={assistantOpen && !assistantMinimized}
          >
            <Sparkles className="ai-header-sparkle" size={17} />
            <span className="ai-header-label">Ask EcoHome AI</span>
            <span className="ai-header-arrow">⌄</span>
          </button>

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

      <AIShoppingAssistant
        products={products}
        open={assistantOpen}
        isMinimized={assistantMinimized}
        onMinimizedChange={setAssistantMinimized}
        onClose={() => {
          setAssistantOpen(false);
          setAssistantMinimized(false);
        }}
        onOpen={() => {
          setAssistantOpen(true);
          setAssistantMinimized(false);
        }}
      />
    </>
  );
}