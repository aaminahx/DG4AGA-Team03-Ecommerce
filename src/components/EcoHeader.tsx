
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Sparkles, UserRound } from "lucide-react";
import type { FormEvent } from "react";

import BasketLink from "@/components/BasketLink";
import AIShoppingAssistant from "@/components/AIShoppingAssistant";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";


const searchPrompts = [
  "LED bulbs under £20",
  "Cut my heating bill",
  "Water-saving showerheads",
];

type Props = {
  products: Product[];
};

function getCategoryIcon(category: string) {
  const name = category.toLowerCase();
  if (name.includes("light")) return "✦";
  if (name.includes("heat")) return "♨";
  if (name.includes("energy")) return "⚡";
  if (name.includes("water")) return "◈";
  if (name.includes("kitchen")) return "⌂";
  return "◈";
}

export default function EcoHeader({ products }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMinimized, setAssistantMinimized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const query = pathname === "/products" ? searchParams.get("q") || "" : "";
    // URL navigation must synchronize the controlled search field and dropdown.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(query);
    setDebouncedQuery(query);
    setSearchFocused(false);
  }, [pathname, searchParams]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.category?.name?.trim())
            .filter((name): name is string => !!name)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();
    if (!query) return [];

    const budgetMatch = query.match(
      /(?:under|below|less than|cheaper than|up to|max(?:imum)?)\s*£?\s*(\d+(?:\.\d+)?)/i
    );
    const maxPrice = budgetMatch ? Number(budgetMatch[1]) : null;
    const searchableQuery = query
      .replace(
        /(?:under|below|less than|cheaper than|up to|max(?:imum)?)\s*£?\s*\d+(?:\.\d+)?/gi,
        ""
      )
      .replace(/£\s*\d+(?:\.\d+)?/g, "");
    const ignoredTerms = new Set([
      "a", "an", "and", "anything", "eco", "find", "for", "i", "me",
      "my", "of", "product", "products", "search", "the", "to", "with",
    ]);
    const terms = (searchableQuery.match(/[\p{L}\p{N}]+/gu) ?? [])
      .filter((term) => !ignoredTerms.has(term));

    return products
      .map((product) => {
        const searchableText = [
          product.name,
          product.description,
          product.category?.name,
          product.brand,
          product.product_type,
          product.specifications,
          product.energy_saving,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const score = terms.reduce(
          (total, term) => total + Number(searchableText.includes(term)),
          0
        );

        return { product, score };
      })
      .filter(({ product, score }) => {
        const withinBudget =
          maxPrice === null || Number(product.price) <= maxPrice;
        return withinBudget && (terms.length === 0 || score > 0);
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          Number(a.product.price) - Number(b.product.price)
      )
      .slice(0, 5)
      .map(({ product }) => product);
  }, [products, debouncedQuery]);

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

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearchFocused(false);
    router.push(`/products?q=${encodeURIComponent(query)}`);
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
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    onClick={() => {
                      setShopOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    <span aria-hidden="true">{getCategoryIcon(category)}</span>{" "}
                    {category}
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

          <Link className="nav-link" href="/#savings">
            Find My Savings
          </Link>
        </nav>

        <div className="eco-actions">
          <div
            className="nav-search-container"
            onFocusCapture={() => setSearchFocused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setSearchFocused(false);
              }
            }}
          >
            <form
              className="eco-search ai-header-search"
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <Sparkles className="ai-header-sparkle" size={17} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSearchFocused(false);
                }}
                placeholder="Ask anything or search eco products..."
                aria-label="Ask anything or search eco products"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ai-header-clear"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                  }}
                >
                  ×
                </button>
              )}
              <button type="submit" aria-label="Search products">
                <Search size={17} />
              </button>
            </form>

            {searchFocused && (
              <div
                id="nav-search-popover"
                className="nav-search-popover"
                role="region"
                aria-label="Search suggestions and products"
              >
                {searchQuery.trim() ? (
                  <>
                    {debouncedQuery.trim() ? (
                      searchResults.length > 0 ? (
                        <div className="nav-search-results">
                          {searchResults.map((product) => (
                            <Link
                              className="nav-search-result"
                              href={`/products/${product.id}`}
                              key={product.id}
                              onClick={() => setSearchFocused(false)}
                            >
                              {product.image_url ? (
                                <img src={product.image_url} alt="" />
                              ) : (
                                <span className="nav-search-result-placeholder" aria-hidden="true">
                                  {product.name.slice(0, 1)}
                                </span>
                              )}
                              <span className="nav-search-result-copy">
                                <strong>{product.name}</strong>
                                <small>{product.category?.name ?? "Eco Product"}</small>
                              </span>
                              <strong className="nav-search-result-price">
                                £{Number(product.price).toFixed(2)}
                              </strong>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="nav-search-empty">
                          No matching products found. Try a different search.
                        </p>
                      )
                    ) : (
                      <p className="nav-search-empty">Searching products...</p>
                    )}
                    <Link
                      className="nav-search-all-link"
                      href={`/products?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => setSearchFocused(false)}
                    >
                      View all results in catalogue →
                    </Link>
                  </>
                ) : (
                  <div className="nav-search-suggestions">
                    <strong>Try asking EcoHome</strong>
                    <p>
                      Ask anything: &quot;LED bulbs under £20&quot; • &quot;Cut my
                      heating bill&quot; • &quot;Water-saving showerheads&quot;
                    </p>
                    {searchPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setSearchQuery(prompt)}
                      >
                        <Sparkles size={14} aria-hidden="true" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
