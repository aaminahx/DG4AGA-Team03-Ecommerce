
import SemanticSearch from "../ai-search/SemanticSearch";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

// Temporary products shown only if Supabase is unavailable
const demoProducts: Product[] = [
  {
    id: "demo-1",
    name: "Example product",
    description: "Shown only until Supabase is connected.",
    price: 12,
    stock_quantity: 8,
    image_url: null,
    category: { name: "Demo" },
  },
  {
    id: "demo-2",
    name: "Second example",
    description: "Replace all demonstration data with justified test data.",
    price: 24,
    stock_quantity: 2,
    image_url: null,
    category: { name: "Demo" },
  },
];

export default async function ProductsPage() {
  const supabase = await createClient();

  let products: Product[] = demoProducts;
  let setupMode = true;

  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,name,description,price,stock_quantity,image_url,category:categories(name)"
      )
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("SUPABASE PRODUCTS ERROR:", error);
    } else if (data) {
      products = data as unknown as Product[];
      setupMode = false;
    }
  }

  return (
    <section className="section">
      <span className="eyebrow">
        EcoHome / Shop
      </span>

      <h1>Shop All Products</h1>

      <p>
        Explore our range of products designed to help
        you make more energy-conscious choices at home.
      </p>

      {setupMode && (
        <p className="setup" role="alert">
          Setup mode: connect Supabase to replace
          this temporary data.
        </p>
      )}

      {/* Keep the team's AI semantic search */}
      <SemanticSearch products={products} />

      {/* Clean, reusable product cards */}
      <div className="grid products">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {!setupMode && products.length === 0 && (
        <p>
          No products are currently available.
        </p>
      )}
    </section>
  );
}
