import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Europe/London",
    }).format(new Date())
  );
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboard() {
  const supabase = (await createClient())!;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, is_active, category:categories(name)")
    .order("stock_quantity", { ascending: true });

  if (error) {
    return <p role="alert">Sorry, the products could not be loaded. Please refresh.</p>;
  }

  const products = (data ?? []) as unknown as Row[];
  const active = products.filter((p) => p.is_active);
  const hidden = products.length - active.length;
  const out = active.filter((p) => p.stock_quantity === 0);
  const low = active.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK);
  const healthy = active.length - out.length - low.length;
  const stockValue = active.reduce((sum, p) => sum + Number(p.price) * p.stock_quantity, 0);
  const attention = [...out, ...low].slice(0, 6);

  const pct = (n: number) => (active.length ? (n / active.length) * 100 : 0);
  const name = profile?.display_name ?? "there";
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  }).format(new Date());

  return (
    <>
      <header className="adm-hero">
        <p className="adm-date">{today}</p>
        <h1>
          {greeting()}, {name} 👋
        </h1>
        <p>Here&apos;s how the shop is looking today.</p>
      </header>

      <section className="adm-stats" aria-label="Shop summary">
        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">📦</span>
          <strong>{active.length}</strong>
          <span>Products on sale</span>
          {hidden > 0 && <small>{hidden} hidden from shoppers</small>}
        </article>
        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">💷</span>
          <strong>{gbp.format(stockValue)}</strong>
          <span>Value of stock</span>
          <small>At current prices</small>
        </article>
        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">⚠️</span>
          <strong>{low.length}</strong>
          <span>Running low</span>
          <small>{LOW_STOCK} or fewer left</small>
        </article>
        <article className="adm-stat">
          <span className="adm-ico" aria-hidden="true">🚫</span>
          <strong>{out.length}</strong>
          <span>Out of stock</span>
          <small>Can&apos;t be bought right now</small>
        </article>
      </section>

      <div className="adm-cols">
        <section className="adm-card" aria-labelledby="health-h">
          <h2 id="health-h">Stock health</h2>
          {active.length === 0 ? (
            <p className="adm-empty">No products on sale yet.</p>
          ) : (
            <>
              <div
                className="adm-bar"
                role="img"
                aria-label={`${healthy} well stocked, ${low.length} running low, ${out.length} out of stock`}
              >
                <span className="adm-seg adm-ok" style={{ width: `${pct(healthy)}%` }} />
                <span className="adm-seg adm-warn" style={{ width: `${pct(low.length)}%` }} />
                <span className="adm-seg adm-bad" style={{ width: `${pct(out.length)}%` }} />
              </div>
              <ul className="adm-legend">
                <li><i className="adm-ok" /> Well stocked <b>{healthy}</b></li>
                <li><i className="adm-warn" /> Running low <b>{low.length}</b></li>
                <li><i className="adm-bad" /> Out of stock <b>{out.length}</b></li>
              </ul>
            </>
          )}
        </section>

        <section className="adm-card" aria-labelledby="attn-h">
          <h2 id="attn-h">Needs your attention</h2>
          {attention.length === 0 ? (
            <p className="adm-empty">🎉 Everything is well stocked.</p>
          ) : (
            <ul className="adm-list">
              {attention.map((p) => (
                <li key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.category?.name ?? "Uncategorised"}</small>
                  </div>
                  <span className={p.stock_quantity === 0 ? "adm-pill adm-pill-bad" : "adm-pill adm-pill-warn"}>
                    {p.stock_quantity === 0 ? "Out of stock" : `${p.stock_quantity} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="next-h">
        <h2 id="next-h" className="adm-sub">Coming up</h2>
        <div className="adm-actions">
          <Link href="/admin/products" className="adm-action adm-action-on">
            <span aria-hidden="true">✏️</span>
            <strong>Manage products</strong>
            <small>Search, restock and hide products</small>
          </Link>
          <div className="adm-action" aria-disabled="true">
            <span aria-hidden="true">🧾</span>
            <strong>Orders</strong>
            <small>Track and update orders</small>
          </div>
          <div className="adm-action" aria-disabled="true">
            <span aria-hidden="true">💬</span>
            <strong>Enquiries</strong>
            <small>Reply to customers</small>
          </div>
        </div>
      </section>
    </>
  );
}