
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";

// Website category names mapped to Supabase categories

const categories = {
  lighting: {
    title: "Lighting",
    databaseNames: ["lighting"],
    description: "Discover energy-efficient lighting for your home.",
  },
  heating: {
    title: "Heating",
    databaseNames: ["heating"],
    description: "Smart ways to keep your home warm and comfortable.",
  },
  insulation: {
    title: "Home Insulation",
    databaseNames: ["insulation", "draught proofing"],
    description: "Keep warmth inside and reduce unwanted heat loss.",
  },
  "smart-energy": {
    title: "Smart Energy",
    databaseNames: [
      "energy monitoring",
      "energymonitoring",
      "smart devices",
    ],
    description: "Monitor, manage and reduce your household energy use.",
  },
  "water-savings": {
    title: "Water Savings",
    databaseNames: ["water saving", "water savings"],
    description: "Save water and energy with practical household essentials.",
  },
};


type CategorySlug = keyof typeof categories;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!(category in categories)) {
    notFound();
  }

  const selectedCategory = categories[category as CategorySlug];
  const supabase = await createClient();

  let products: Product[] = [];
  let errorMessage = "";

  if (!supabase) {
    errorMessage = "Unable to connect to the product catalogue.";
  } else {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,description,price,stock_quantity,image_url,category:categories!inner(name)"
      )
      .eq("is_active", true)
      .in("categories.name", selectedCategory.databaseNames)
      .order("name");

    if (error) {
      console.error("CATEGORY PRODUCTS ERROR:", error);
      errorMessage = "Products couldn't be loaded. Please try again.";
    } else {
      products = (data ?? []) as unknown as Product[];
    }
  }

  return (
    <section className="section">
      
<div
  className="category-navigation"
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "28px",
  }}
>
  <span className="eyebrow">
    EcoHome / Shop / {selectedCategory.title}
  </span>

  <Link
    href="/products"
    className="category-back-link"
  >
    ← Back to Shop All
  </Link>
</div>

      <h1>{selectedCategory.title}</h1>
      <p>{selectedCategory.description}</p>

      {errorMessage && (
        <p role="alert" className="setup">
          {errorMessage}
        </p>
      )}

      {!errorMessage && products.length === 0 && (
        <p>No products available in this category yet.</p>
      )}

      <div className="grid products">
        {products.map((product) => (
          <article className="product" key={product.id}>
            <div className="product-image" aria-hidden="true">
              {product.name.slice(0, 1)}
            </div>

            <span>
              {product.category?.name ?? "Uncategorised"}
            </span>

            <h2>{product.name}</h2>
            <p>{product.description}</p>

            <div className="product-meta">
              <strong>£{Number(product.price).toFixed(2)}</strong>
              <small>
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} in stock`
                  : "Out of stock"}
              </small>
            </div>

            {product.stock_quantity > 0 && (
              <AddToCartButton
                product={{
                  id: String(product.id),
                  name: product.name,
                  price: Number(product.price),
                }}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
