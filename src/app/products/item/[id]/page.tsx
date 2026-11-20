
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/lib/types";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return (
      <section className="section">
        <h1>Product unavailable</h1>
        <p>Unable to connect to the product catalogue.</p>
      </section>
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,description,price,stock_quantity,image_url,category:categories(name)"
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("PRODUCT DETAIL ERROR:", error);
    return (
      <section className="section">
        <h1>Unable to load product</h1>
        <p>Please try again later.</p>
      </section>
    );
  }

  if (!data) {
    notFound();
  }

  const product = data as unknown as Product;
  const inStock = product.stock_quantity > 0;

  return (
    <section className="section product-detail-page">
      <Link href="/products" className="category-back-link">
        ← Back to Shop All
      </Link>

      <div className="product-detail-layout">
        <div className="product-detail-image">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
            />
          ) : (
            <span>{product.name.slice(0, 1)}</span>
          )}
        </div>

        <div className="product-detail-info">
          <span className="eyebrow">
            {product.category?.name ?? "EcoHome"}
          </span>

          <h1>{product.name}</h1>

          <strong className="product-detail-price">
            £{Number(product.price).toFixed(2)}
          </strong>

          <p>
            {inStock
              ? `${product.stock_quantity} available`
              : "Currently out of stock"}
          </p>

          {inStock && (
            <AddToCartButton
              product={{
                id: String(product.id),
                name: product.name,
                price: Number(product.price),
              }}
            />
          )}

          <div className="product-detail-description">
            <h2>Product Description</h2>
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
