
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRound, Heart, Sparkles } from "lucide-react";

import BasketLink from "@/components/BasketLink";
import AIShoppingAssistant from "@/components/AIShoppingAssistant";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";


const categories = [
  {
    name: "Lighting",
    href: "/products/lighting",
    icon: "✦",
  },
  {
    name: "Heating & Insulation",
    href: "/products/heating-insulation",
    icon: "♨",
  },
  {
    name: "Smart Energy",
    href: "/products/smart-energy",
    icon: "⚡",
  },
  {
    name: "Water Saving",
    href: "/products/water-savings",
    icon: "◈",
  },
  {
    name: "Kitchen Appliances",
    href: "/products/kitchen-appliances",
    icon: "⌂",
  },
];


type Props = {
  products: Product[];
};

export default function EcoHeader({ products }: Props) {
  const pathname = usePathname();

  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMinimized, setAssistantMinimized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isShopPage =
    pathname === "/products" ||
    pathname.startsWith("/products/");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (active) {
        setIsLoggedIn(!!user);
      }
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setIsLoggedIn(!!session?.user);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const accountHref = isLoggedIn
    ? "/account"
    : "/login?next=/account";

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
        <Link
          href="/"
          className="eco-logo"
          aria-label="EcoHome home"
        >
          <span className="eco-house" aria-hidden="true">
            ⌂
          </span>
          <span>EcoHome</span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
          <span className="sr-only">
            Toggle navigation
          </span>
        </button>

        <nav
          className={`eco-nav ${menuOpen ? "mobile-open" : ""}`}
          aria-label="Main navigation"
        >
          <div className="nav-shop">
            <button
              type="button"
              className={`nav-link ${isShopPage ? "active-link" : ""}`}
              aria-expanded={shopOpen}
              onClick={() => setShopOpen(!shopOpen)}
            >
              Shop <span aria-hidden="true">⌄</span>
            </button>

            {shopOpen && (
              <div className="shop-menu">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={() => {
                      setShopOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    <span aria-hidden="true">
                      {category.icon}
                    </span>{" "}
                    {category.name}
                  </Link>
                ))}

                <Link
                  className="all-products-link"
                  href="/products"
                  onClick={() => {
                    setShopOpen(false);
                    setMenuOpen(false);
                  }}
                >
                  Shop all products →
                </Link>
              </div>
            )}
          </div>

          <a className="nav-link" href="/#savings">
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
            <span className="ai-header-label">
              Ask EcoHome AI
            </span>
            <span className="ai-header-arrow">⌄</span>
          </button>

          <Link
            className="icon-link"
            href={accountHref}
            aria-label={isLoggedIn ? "My Account" : "Sign in"}
          >
            <UserRound size={24} strokeWidth={1.8} />
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
