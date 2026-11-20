import SemanticSearch from "../ai-search/SemanticSearch";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductCatalogueClient from "@/components/ProductCatalogueClient";

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
];

export default async function ProductsPage() {
  const supabase = await createClient();

  let products = demoProducts;
  let setupMode = true;

  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        stock_quantity,
        image_url,
        brand,
        model_code,
        product_type,
        colour,
        size_capacity,
        pack_of,
        specifications,
        energy_saving,
        drawbacks,
        warranty,
        price_note,
        where_listed,
        source_link,
        category:categories(name)
      `
      )
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      products = data as unknown as Product[];
      setupMode = false;
    }
  }

  return (
    <section className="section fk-page-wrapper">
      {setupMode && (
        <p className="setup">
          Setup mode: connect Supabase to replace this temporary data.
        </p>
      )}

      <SemanticSearch products={products} />

      <ProductCatalogueClient products={products} />
    </section>
  );
}