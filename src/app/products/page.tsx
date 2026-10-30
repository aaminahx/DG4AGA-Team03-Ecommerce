import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

const demoProducts: Product[] = [
  { id: "demo-1", name: "Example product", description: "Shown only until Supabase is connected.", price: 12, stock_quantity: 8, image_url: null, category: { name: "Demo" } },
  { id: "demo-2", name: "Second example", description: "Replace all demonstration data with justified test data.", price: 24, stock_quantity: 2, image_url: null, category: { name: "Demo" } },
];

export default async function ProductsPage() {
  const supabase = await createClient();
  let products = demoProducts;
  let setupMode = true;

  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,description,price,stock_quantity,image_url,category:categories(name)")
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      products = data as unknown as Product[];
      setupMode = false;
    }
  }

  return (
    <section className="section">
      <span className="eyebrow">Sample catalogue</span>
      <h1>Products</h1>
      {setupMode && <p className="setup">Setup mode: connect Supabase to replace this temporary data.</p>}
      <div className="grid products">
        {products.map((product) => (
          <article className="product" key={product.id}>
            <div className="product-image" aria-hidden="true">{product.name.slice(0, 1)}</div>
            <span>{product.category?.name ?? "Uncategorised"}</span>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <div className="product-meta">
              <strong>£{Number(product.price).toFixed(2)}</strong>
              <small>{product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}</small>
            </div>
          </article>
        ))}
      </div>
      <p className="task-note"><strong>Team task:</strong> implement justified search, category and price filtering. Do not copy an unverified solution.</p>
    </section>
  );
}
