"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";

type Props = {
  products: Product[];
};

type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";
type PackFilter = "all" | "single" | "multipack";

export default function ProductCatalogueClient({ products }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [maxPriceCap, setMaxPriceCap] = useState<number | "ALL">("ALL");
  const [packFilter, setPackFilter] = useState<PackFilter>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [ecoVerifiedOnly, setEcoVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState<boolean>(false);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category?.name?.trim() || "Uncategorised";
      map.set(cat, (map.get(cat) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand && p.brand.trim().toLowerCase() !== "not found") {
        set.add(p.brand.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const productTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.product_type && p.product_type.trim().toLowerCase() !== "not found") {
        set.add(p.product_type.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedBrand("ALL");
    setSelectedType("ALL");
    setMaxPriceCap("ALL");
    setPackFilter("all");
    setInStockOnly(false);
    setEcoVerifiedOnly(false);
    setSortBy("relevance");
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id);
        if (next.length === 0) setShowCompareDrawer(false);
        return next;
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((p) => {
      const cat = p.category?.name?.trim() || "Uncategorised";
      const price = Number(p.price) || 0;
      const pack = Number(p.pack_of) || 1;

      if (selectedCategory !== "ALL" && cat !== selectedCategory) {
        return false;
      }
      if (
        selectedBrand !== "ALL" &&
        (p.brand?.trim() || "") !== selectedBrand
      ) {
        return false;
      }
      if (
        selectedType !== "ALL" &&
        (p.product_type?.trim() || "") !== selectedType
      ) {
        return false;
      }
      if (maxPriceCap !== "ALL" && price > maxPriceCap) {
        return false;
      }
      if (packFilter === "single" && pack > 1) {
        return false;
      }
      if (packFilter === "multipack" && pack <= 1) {
        return false;
      }
      if (inStockOnly && p.stock_quantity <= 0) {
        return false;
      }
      if (
        ecoVerifiedOnly &&
        (!p.energy_saving || p.energy_saving.trim().toLowerCase() === "not found")
      ) {
        return false;
      }
      if (q) {
        const haystack = [
          p.name,
          p.brand,
          p.product_type,
          p.colour,
          cat,
          p.specifications,
          p.energy_saving,
          p.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "price-asc") {
      return [...list].sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortBy === "price-desc") {
      return [...list].sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sortBy === "name-asc") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedType,
    maxPriceCap,
    packFilter,
    inStockOnly,
    ecoVerifiedOnly,
    sortBy,
  ]);

  const comparedProducts = useMemo(
    () => products.filter((p) => compareIds.includes(p.id)),
    [products, compareIds]
  );

  const activeFiltersCount = [
    selectedCategory !== "ALL",
    selectedBrand !== "ALL",
    selectedType !== "ALL",
    maxPriceCap !== "ALL",
    packFilter !== "all",
    inStockOnly,
    ecoVerifiedOnly,
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  return (
    <div className="fk-v2-wrapper">
      {/* Creative UK Eco Benchmark Strip */}
      <div className="fk-eco-banner">
        <div className="fk-eco-banner-badge">UK Eco Reference</div>
        <div className="fk-eco-banner-items">
          <span>
            <strong>LED Spotlight Upgrade:</strong> ~£45/yr &amp; 35 kg CO₂ saved
            (EST)[cite: 1]
          </span>
          <span>•</span>
          <span>
            <strong>Efficient Showerhead:</strong> ~£25/yr &amp; ~9,200 L water
            saved (EST)[cite: 1]
          </span>
          <span>•</span>
          <span>
            <strong>Electricity Cap:</strong> 26.32 p/kWh (Ofgem Q4 2026)[cite: 1]
          </span>
        </div>
      </div>

      {/* Category Quick Pills Row */}
      <div className="fk-cat-pills-bar" role="tablist" aria-label="Product categories">
        <button
          type="button"
          className={`fk-cat-chip ${selectedCategory === "ALL" ? "active" : ""}`}
          onClick={() => setSelectedCategory("ALL")}
        >
          All Products <span>({products.length})</span>
        </button>
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            type="button"
            className={`fk-cat-chip ${selectedCategory === cat ? "active" : ""}`}
            onClick={() =>
              setSelectedCategory((prev) => (prev === cat ? "ALL" : cat))
            }
          >
            {cat} <span>({count})</span>
          </button>
        ))}
      </div>

      {/* HORIZONTAL FILTER & SORT BAR ON TOP OF PRODUCTS */}
      <div className="fk-horizontal-filter-bar">
        <div className="fk-filter-controls-grid">
          {/* Search */}
          <div className="fk-filter-field">
            <label htmlFor="fk-v2-search">Search</label>
            <input
              id="fk-v2-search"
              type="search"
              placeholder="Bulb, air fryer, thermostat, tap..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Max Price */}
          <div className="fk-filter-field">
            <label htmlFor="fk-v2-price">Max Price</label>
            <select
              id="fk-v2-price"
              value={maxPriceCap}
              onChange={(e) =>
                setMaxPriceCap(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                )
              }
            >
              <option value="ALL">Any Price</option>
              <option value={10}>Under £10</option>
              <option value={25}>Under £25</option>
              <option value={50}>Under £50</option>
              <option value={100}>Under £100</option>
              <option value={150}>Under £150</option>
            </select>
          </div>

          {/* Brand */}
          <div className="fk-filter-field">
            <label htmlFor="fk-v2-brand">Brand</label>
            <select
              id="fk-v2-brand"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="ALL">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Product Type */}
          <div className="fk-filter-field">
            <label htmlFor="fk-v2-type">Product Type</label>
            <select
              id="fk-v2-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Types ({productTypes.length})</option>
              {productTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Pack Size */}
          <div className="fk-filter-field">
            <label htmlFor="fk-v2-pack">Pack Size</label>
            <select
              id="fk-v2-pack"
              value={packFilter}
              onChange={(e) => setPackFilter(e.target.value as PackFilter)}
            >
              <option value="all">All Packs</option>
              <option value="single">Single Item (1)</option>
              <option value="multipack">Multi-Pack (2+)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="fk-filter-field">
            <label htmlFor="fk-v2-sort">Sort By</label>
            <select
              id="fk-v2-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Second Row: Quick Checkboxes + Result Count + Clear */}
        <div className="fk-filter-subrow">
          <div className="fk-quick-toggles">
            <label className="fk-toggle-pill">
              <input
                type="checkbox"
                checked={ecoVerifiedOnly}
                onChange={(e) => setEcoVerifiedOnly(e.target.checked)}
              />
              <span>Eco Saving Claim / Evidence</span>
            </label>

            <label className="fk-toggle-pill">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <div className="fk-filter-summary-right">
            <span className="fk-count-text">
              Showing <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> products
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                className="fk-clear-filters-btn"
                onClick={clearAllFilters}
              >
                Reset ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCT GRID (4 per row on desktop, 5 on wide screens) */}
      {filteredProducts.length === 0 ? (
        <div className="fk-empty-box">
          <h3>No matching products found</h3>
          <p>Try clearing a filter or increasing your budget cap.</p>
          <button
            type="button"
            className="fk-reset-filters-btn"
            onClick={clearAllFilters}
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="fk-v2-grid">
          {filteredProducts.map((product) => {
            const hasEcoClaim =
              product.energy_saving &&
              product.energy_saving.trim().toLowerCase() !== "not found";
            const isSaved = !!savedIds[product.id];
            const isCompared = compareIds.includes(product.id);

            return (
              <article className="fk-v2-card" key={product.id}>
                <div className="fk-v2-card-top">
                  {hasEcoClaim ? (
                    <span className="fk-v2-eco-tag">Eco Claim</span>
                  ) : (
                    <span className="fk-v2-cat-tag">
                      {product.category?.name ?? "EcoHome"}
                    </span>
                  )}

                  <button
                    type="button"
                    aria-label="Wishlist"
                    className={`fk-v2-heart ${isSaved ? "active" : ""}`}
                    onClick={() =>
                      setSavedIds((prev) => ({
                        ...prev,
                        [product.id]: !prev[product.id],
                      }))
                    }
                  >
                    {isSaved ? "♥" : "♡"}
                  </button>
                </div>

                <Link href={`/products/${product.id}`} className="fk-v2-link">
                  <div className="fk-v2-img-box">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="fk-v2-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="fk-v2-img-letter" aria-hidden="true">
                        {product.name.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  {product.brand && (
                    <div className="fk-v2-brand">{product.brand}</div>
                  )}

                  <h2 className="fk-v2-title" title={product.name}>
                    {product.name}
                  </h2>

                  <p className="fk-v2-specs">
                    {product.specifications &&
                    product.specifications.toLowerCase() !== "not found"
                      ? product.specifications
                      : product.description}
                  </p>
                </Link>

                <div className="fk-v2-bottom">
                  <div className="fk-v2-price-row">
                    <strong className="fk-v2-price">
                      £{Number(product.price).toFixed(2)}
                    </strong>
                    {product.pack_of && product.pack_of > 1 && (
                      <span className="fk-v2-pack">
                        Pack {product.pack_of}
                      </span>
                    )}
                  </div>

                  <div className="fk-v2-meta-row">
                    <span
                      className={
                        product.stock_quantity > 0
                          ? "fk-v2-stock-ok"
                          : "fk-v2-stock-no"
                      }
                    >
                      {product.stock_quantity > 0
                        ? `${product.stock_quantity} in stock`
                        : "Out of stock"}
                    </span>

                    <label className="fk-v2-compare-chk">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => toggleCompare(product.id)}
                      />
                      <span>Compare</span>
                    </label>
                  </div>

                  {product.stock_quantity > 0 && (
                    <div className="fk-v2-cart-wrap">
                      <AddToCartButton
                        product={{
                          id: String(product.id),
                          name: product.name,
                          price: Number(product.price),
                        }}
                      />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Creative Side-by-Side Product Compare Tray & Modal */}
      {comparedProducts.length > 0 && (
        <div className="fk-compare-bar">
          <div>
            <strong>Compare ({comparedProducts.length}/3):</strong>{" "}
            <span>{comparedProducts.map((p) => p.name).join(" • ")}</span>
          </div>
          <div className="fk-compare-bar-actions">
            <button
              type="button"
              className="fk-compare-open-btn"
              onClick={() => setShowCompareDrawer((v) => !v)}
            >
              {showCompareDrawer ? "Hide Table" : "Compare Now"}
            </button>
            <button
              type="button"
              className="fk-compare-clear-btn"
              onClick={() => {
                setCompareIds([]);
                setShowCompareDrawer(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {showCompareDrawer && comparedProducts.length > 0 && (
        <div className="fk-compare-table-card">
          <h3>Side-by-Side Comparison</h3>
          <div className="fk-compare-scroll">
            <table className="fk-compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {comparedProducts.map((p) => (
                    <th key={p.id}>
                      <Link href={`/products/${p.id}`}>{p.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Price</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id}>
                      <strong>£{Number(p.price).toFixed(2)}</strong>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Brand</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id}>{p.brand || "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td>Category / Type</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id}>
                      {p.category?.name || "—"} • {p.product_type || "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Key Specs</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id}>{p.specifications || p.description}</td>
                  ))}
                </tr>
                <tr>
                  <td>Energy / Water Saving</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id}>{p.energy_saving || "Not specified"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}