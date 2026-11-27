import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { setActive, setStock } from "./actions";

const LOW_STOCK = 5;

type Row = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  category: { name: string } | null;
};

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export default async function AdminProducts({
  searchParams,
}: {
      searchParams: Promise<{
      q?: string;
      category?: string;
      added?: string;
      updated?: string;
    }>;
}) {
    const {
    q = "",
    category = "",
    added = "",
    updated = "",
  } = await searchParams;
  const supabase = (await createClient())!;

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, is_active, category:categories(name)")
    .order("name");

  if (error) {
    return <p role="alert">Sorry, the products could not be loaded. Please refresh.</p>;
  }

  const { data: cats } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  const all = (data ?? []) as unknown as Row[];
  const term = q.trim().toLowerCase();
  const rows = all.filter(
    (p) =>
      (!category || p.category?.name === category) &&
      (!term ||
        p.name.toLowerCase().includes(term) ||
        (p.category?.name ?? "").toLowerCase().includes(term))
  );
  const filtering = Boolean(term || category);

  return (
    <>
      {added === "1" && (
  <p role="status" className="adm-success">
    <span className="adm-success-icon" aria-hidden="true" />
    Product added.
  </p>
)}

{updated === "1" && (
  <p role="status" className="adm-success">
    <span className="adm-success-icon" aria-hidden="true" />
    Product updated successfully.
  </p>
)}
      <header className="adm-head">
        <div>
          <h1>Products</h1>
          <p className="adm-muted">
            {filtering
              ? `Showing ${rows.length} of ${all.length} products.`
              : `${all.length} in total. Change stock, or hide a product from shoppers.`}
          </p>
        </div>
        <form className="adm-search" role="search" action="/admin/products">
          <label htmlFor="adm-cat" className="sr-only">Filter by category</label>
          <select id="adm-cat" name="category" defaultValue={category}>
            <option value="">All categories</option>
            {(cats ?? []).map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
          <label htmlFor="adm-q" className="sr-only">Search products</label>
          <input id="adm-q" name="q" defaultValue={q} placeholder="Search products" />
          <button type="submit">Apply</button>
          {filtering && (
            <a href="/admin/products" className="adm-clear">Clear</a>
          )}
        </form>
        <Link href="/admin/products/new" className="adm-add-product">
        <span aria-hidden="true">+</span>
        Add product
        </Link>
      </header>

      {rows.length === 0 ? (
        <p className="adm-empty">
          No products match your filters. <a href="/admin/products">Clear filters</a>
        </p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Price</th>
                <th scope="col">Stock level</th>
                <th scope="col">Update stock</th>
                <th scope="col">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const out = p.stock_quantity === 0;
                const low = !out && p.stock_quantity <= LOW_STOCK;
                return (
                  <tr key={p.id} className={p.is_active ? "" : "adm-row-hidden"}>
                    <td>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="adm-product-link"
                      >
                        <strong>{p.name}</strong>
                      </Link>

                      <small>{p.category?.name ?? "Uncategorised"}</small>

                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="adm-edit-link"
                      >
                        Edit product
                      </Link>
                    </td>
                    <td>{gbp.format(Number(p.price))}</td>
                    <td>
                      <span
                        className={
                          out ? "adm-pill adm-pill-bad" : low ? "adm-pill adm-pill-warn" : "adm-pill adm-pill-ok"
                        }
                      >
                        {out ? "Out of stock" : low ? `${p.stock_quantity} left` : `${p.stock_quantity} in stock`}
                      </span>
                    </td>
                    <td>
                      <form action={setStock} className="adm-inline">
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="number"
                          name="stock"
                          min={0}
                          max={100000}
                          step={1}
                          defaultValue={p.stock_quantity}
                          aria-label={`Stock for ${p.name}`}
                          required
                        />
                        <button type="submit" aria-label={`Save stock for ${p.name}`}>Save</button>
                      </form>
                    </td>
                    <td>
                      <form action={setActive} className="adm-inline">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="active" value={p.is_active ? "false" : "true"} />
                        <span className={p.is_active ? "adm-state-on" : "adm-state-off"}>
                          {p.is_active ? "Visible" : "Hidden"}
                        </span>
                        <button type="submit" className="adm-ghost" aria-label={`${p.is_active ? "Hide" : "Show"} ${p.name}`}>
                          {p.is_active ? "Hide" : "Show"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}