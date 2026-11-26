import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ProductCatalogueClient from "@/components/ProductCatalogueClient";

type ProductRating = {
  averageRating: number;
  totalCount: number;
};

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
  const ratingsByProduct: Record<string, ProductRating> = {};

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

    const { data: reviewRatings, error: reviewError } = await supabase
      .from("product_reviews")
      .select("product_id, rating");

    if (reviewError) {
      console.error("Could not load catalogue review ratings:", reviewError);
    } else {
      const groupedRatings = new Map<string, number[]>();
      for (const review of reviewRatings ?? []) {
        const values = groupedRatings.get(review.product_id) ?? [];
        values.push(Number(review.rating));
        groupedRatings.set(review.product_id, values);
      }

      for (const [productId, ratings] of groupedRatings) {
        ratingsByProduct[productId] = {
          averageRating:
            Math.round(
              (ratings.reduce((sum, value) => sum + value, 0) /
                ratings.length) *
                10
            ) / 10,
          totalCount: ratings.length,
        };
      }
    }
  }

  return (
    <section className="section fk-page-wrapper">
      {setupMode && (
        <p className="setup">
          Setup mode: connect Supabase to replace this temporary data.
        </p>
      )}

      <Suspense fallback={<p>Loading products...</p>}>
        <ProductCatalogueClient
          products={products}
          ratingsByProduct={ratingsByProduct}
        />
      </Suspense>
    </section>
  );
}