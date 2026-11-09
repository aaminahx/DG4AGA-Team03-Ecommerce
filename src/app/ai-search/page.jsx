"use client";

import { useEffect, useRef, useState } from "react";

const PRODUCTS = [
  {
    id: 1,
    name: "City Backpack",
    price: 59,
    description: "Lightweight bag with a padded laptop sleeve for daily commuting."
  },
  {
    id: 2,
    name: "Trail Backpack",
    price: 79,
    description: "Water-resistant outdoor backpack with comfortable padded straps."
  },
  {
    id: 3,
    name: "Travel Backpack",
    price: 119,
    description: "Large cabin-friendly backpack for flights and longer journeys."
  },
  {
    id: 4,
    name: "Eco Tote",
    price: 29,
    description: "Small recycled-fabric shopping bag for everyday groceries."
  },
];

export default function Page() {
  const worker = useRef(null);

  const [query, setQuery] = useState(
    "A waterproof backpack for university and carrying a laptop"
  );

  const [status, setStatus] = useState(
    "Ready to test. The model downloads on the first search."
  );

  const [results, setResults] = useState([]);
  useEffect(() => {
  worker.current = new Worker(
    new URL("./worker.js", import.meta.url),
    { type: "module" }
  );

  worker.current.onmessage = ({ data }) => {
    if (data.type === "progress") {
      const pct = Number.isFinite(data.progress?.progress)
        ? ` ${Math.round(data.progress.progress)}%` : "";
      setStatus(`Loading browser model${pct}`);
    }

    if (data.type === "result") {
      setResults(data.ranked);
      setStatus("Complete - ranking was calculated inside this browser.");
    }

    if (data.type === "error") setStatus(`Error: ${data.message}`);
  };

  return () => worker.current?.terminate();
}, []);

function search() {
  if (!query.trim()) return;
  setResults([]);
  setStatus("Starting local AI model...");
  worker.current?.postMessage({ query, products: PRODUCTS });
}
return (
  <main style={{ maxWidth: 850, margin: "0 auto", padding: 40 }}>
    <p style={{ color: "#159e8c", fontWeight: 700 }}>BROWSER AI</p>

    <h1>Semantic product search</h1>

    <p>No API key. The query is processed locally after the model downloads.</p>

    <textarea
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      rows={4}
      style={{ width: "100%", padding: 14, fontSize: 17 }}
    />

    <button
      onClick={search}
      disabled={!query.trim()}
      style={{ marginTop: 14, padding: "12px 20px" }}
    >
      Find matching products
    </button>

    <p style={{ color: "#159e8c" }}>{status}</p>

    <section>
      {results.map((product, index) => (
        <article
          key={product.id}
          style={{ background: "#edf4f7", marginTop: 12, padding: 16 }}
        >
          <strong>{index + 1}. {product.name}</strong>

          <div>
            £{product.price} - similarity {(product.score * 100).toFixed(1)}%
          </div>

          <small>{product.description}</small>
        </article>
      ))}
    </section>
  </main>
);
}