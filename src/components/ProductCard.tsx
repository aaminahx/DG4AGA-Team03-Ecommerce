
import Link from "next/link";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const inStock = product.stock_quantity > 0;

  return (
    <article className="product product-card">
      <Link
        href={`/products/item/${product.id}`}
        className="product-card-link"
        aria-label={`View ${product.name}`}
      >
        <div className="product-image">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <span className="product-placeholder">
              {product.name.slice(0, 1)}
            </span>
          )}
        </div>

        <span className="product-card-category">
          {product.category?.name ?? "EcoHome"}
        </span>

        <h2 className="product-card-title">
          {product.name}
        </h2>
      </Link>

      <div className="product-card-bottom">
        <div className="product-meta">
          <strong>£{Number(product.price).toFixed(2)}</strong>
          <small>
            {inStock ? "In stock" : "Out of stock"}
          </small>
        </div>

        {inStock && (
          <AddToCartButton
            product={{
              id: String(product.id),
              name: product.name,
              price: Number(product.price),
            }}
          />
        )}
      </div>
    </article>
  );
}
