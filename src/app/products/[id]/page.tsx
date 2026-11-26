import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";
import ProductReviews from "@/components/ProductReviews";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase) {
    notFound();
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      category_id,
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
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const product = data as unknown as Product & { category_id?: string };

  const { data: reviewRatings, error: reviewRatingsError } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", product.id);

  if (reviewRatingsError) {
    console.error("Could not load product review summary:", reviewRatingsError);
  }

  const productRatings = reviewRatings ?? [];
  const reviewCount = productRatings.length;
  const averageRating =
    reviewCount > 0
      ? Math.round(
          (productRatings.reduce(
            (sum, review) => sum + Number(review.rating),
            0
          ) /
            reviewCount) *
            10
        ) / 10
      : 0;

  // Fetch up to 4 similar products in the same category
  let relatedProducts: Product[] = [];
  if (product.category_id) {
    const { data: related } = await supabase
      .from("products")
      .select("id,name,price,image_url,brand,category:categories(name)")
      .eq("category_id", product.category_id)
      .eq("is_active", true)
      .neq("id", product.id)
      .limit(4);
    if (related) {
      relatedProducts = related as unknown as Product[];
    }
  }

  const specRows: { label: string; value: string }[] = [
    { label: "Brand / Manufacturer", value: product.brand ?? "" },
    { label: "Model / Part Code", value: product.model_code ?? "" },
    { label: "Product Type", value: product.product_type ?? "" },
    { label: "Category", value: product.category?.name ?? "" },
    { label: "Colour / Finish", value: product.colour ?? "" },
    { label: "Size / Capacity", value: product.size_capacity ?? "" },
    {
      label: "Pack Quantity",
      value: product.pack_of ? `Pack of ${product.pack_of}` : "",
    },
    { label: "Key Specifications", value: product.specifications ?? "" },
    { label: "Warranty / Guarantee", value: product.warranty ?? "" },
    { label: "Retailer Reference", value: product.where_listed ?? "" },
  ].filter((row) => row.value && row.value.trim().toLowerCase() !== "not found");

  const hasEcoClaim =
    product.energy_saving &&
    product.energy_saving.trim().toLowerCase() !== "not found";

  return (
    <section className="section fk-pdp-container">
      {/* Breadcrumb */}
      <nav className="fk-pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href="/products">Products</Link>
        {product.category?.name && (
          <>
            <span>›</span>
            <span>{product.category.name}</span>
          </>
        )}
      </nav>

      {/* Main 2-Column Flipkart Layout */}
      <div className="fk-pdp-grid">
        {/* LEFT COLUMN: Sticky Image Card + Action Buttons */}
        <div className="fk-pdp-left">
          <div className="fk-pdp-image-box">
            {hasEcoClaim && (
              <span className="fk-pdp-eco-ribbon">Eco Verified</span>
            )}
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="fk-pdp-main-img"
              />
            ) : (
              <div className="fk-pdp-placeholder" aria-hidden="true">
                {product.name.slice(0, 1)}
              </div>
            )}
          </div>

          {product.stock_quantity > 0 && (
            <div className="fk-pdp-buy-actions">
              <AddToCartButton
                product={{
                  id: String(product.id),
                  name: product.name,
                  price: Number(product.price),
                }}
              />
            </div>
          )}

          {/* Quick Trust Badges */}
          <div className="fk-pdp-trust-strip">
            <div>
              <strong>Transparent Data</strong>
              <span>Independent UK benchmarks</span>
            </div>
            <div>
              <strong>EcoHome Assured</strong>
              <span>Energy & water efficiency rated</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Title, Price, Highlights, Specs Table */}
        <div className="fk-pdp-right">
          <div className="fk-pdp-brand-row">
            {product.brand && (
              <span className="fk-pdp-brand-pill">{product.brand}</span>
            )}
            <span className="fk-pdp-cat-text">
              {product.category?.name ?? "EcoHome"}
            </span>
          </div>

          <h1 className="fk-pdp-title">{product.name}</h1>
          <a
            className="pdp-rating-summary"
            href="#reviews"
            aria-label={`Read customer reviews. ${
              reviewCount > 0
                ? `${averageRating.toFixed(1)} out of 5 from ${reviewCount} reviews`
                : "No reviews yet"
            }`}
          >
            {reviewCount > 0 ? (
              <>
                <span aria-hidden="true">★★★★★</span>
                <strong>{averageRating.toFixed(1)}</strong>
                <span>({reviewCount} reviews)</span>
              </>
            ) : (
              <span>No reviews yet · Be the first to review</span>
            )}
          </a>

          <div className="fk-pdp-price-panel">
            <div className="fk-pdp-price-line">
              <span className="fk-pdp-price">
                £{Number(product.price).toFixed(2)}
              </span>
              {product.pack_of && product.pack_of > 1 && (
                <span className="fk-pdp-pack-badge">
                  Pack of {product.pack_of}
                </span>
              )}
              <span
                className={`fk-pdp-stock-badge ${
                  product.stock_quantity > 0 ? "in" : "out"
                }`}
              >
                {product.stock_quantity > 0
                  ? `In Stock (${product.stock_quantity} available)`
                  : "Out of Stock"}
              </span>
            </div>
            {product.price_note && (
              <p className="fk-pdp-price-note">{product.price_note}</p>
            )}
          </div>

          {/* Key Highlights Box */}
          <div className="fk-pdp-box">
            <h2 className="fk-pdp-box-title">Product Overview</h2>
            <p className="fk-pdp-desc">{product.description}</p>
          </div>

          {/* Energy & Water Saving Callout */}
          {hasEcoClaim && (
            <div className="fk-pdp-callout eco">
              <h3>Energy & Water Saving Evidence / Claim</h3>
              <p>{product.energy_saving}</p>
            </div>
          )}

          {/* Honest Buyer Considerations / Drawbacks */}
          {product.drawbacks &&
            product.drawbacks.trim().toLowerCase() !== "not found" && (
              <div className="fk-pdp-callout warning">
                <h3>Good to Know Before You Buy</h3>
                <p>{product.drawbacks}</p>
              </div>
            )}

          {/* Flipkart-style Specifications Table */}
          {specRows.length > 0 && (
            <div className="fk-pdp-box">
              <h2 className="fk-pdp-box-title">Specifications</h2>
              <table className="fk-pdp-specs-table">
                <tbody>
                  {specRows.map((row) => (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {product.source_link && (
                <p className="fk-pdp-source">
                  Source reference:{" "}
                  <a
                    href={product.source_link.split("|")[0].trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {product.where_listed ?? "Retailer listing"} ↗
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ProductReviews productId={product.id} />

      {/* Similar Products Carousel/Row */}
      {relatedProducts.length > 0 && (
        <div className="fk-related-section">
          <h2>Similar Products in {product.category?.name}</h2>
          <div className="fk-related-grid">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="fk-related-card"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <div className="fk-card-img-fallback">
                    {item.name.slice(0, 1)}
                  </div>
                )}
                {item.brand && <small>{item.brand}</small>}
                <h3>{item.name}</h3>
                <strong>£{Number(item.price).toFixed(2)}</strong>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}