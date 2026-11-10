
"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";

type RankedProduct = Product & {
  score: number;
};

export default function SemanticSearch({
  products,
}: {
  products: Product[];
}) {
  const workerRef = useRef<Worker | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RankedProduct[]>([]);
  const [status, setStatus] = useState(
    "Describe what you are looking for."
  );
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const aiWorker = new Worker(
      new URL("./worker.js", import.meta.url),
      { type: "module" }
    );

    workerRef.current = aiWorker;

    aiWorker.onmessage = ({ data }) => {
      if (data.type === "progress") {
        const progress = data.progress?.progress;

        const percentage = Number.isFinite(progress)
          ? ` ${Math.round(progress)}%`
          : "";

        setStatus(`Loading AI model${percentage}...`);
      }

      if (data.type === "result") {
        setResults(data.ranked);
        setStatus(
          `Found ${data.ranked.length} matching products.`
        );
        setSearching(false);
      }

      if (data.type === "error") {
        setStatus(`AI Error: ${data.message}`);
        setSearching(false);
      }
    };

    aiWorker.onerror = (error) => {
      setStatus(`Worker error: ${error.message}`);
      setSearching(false);
    };

    return () => {
      aiWorker.terminate();
      workerRef.current = null;
    };
  }, []);

  function handleSearch() {
    if (!query.trim() || !workerRef.current) return;

    setResults([]);
    setSearching(true);
    setStatus("Searching your product catalogue...");

    workerRef.current.postMessage({
      query: query.trim(),
      products,
    });
  }

  return (
    <section
      style={{
        margin: "28px 0",
        padding: "24px",
        border: "1px solid #dce5e2",
        borderRadius: "16px",
        background: "#ffffff",
      }}
    >
      <span style={{ color: "#087f68", fontWeight: 700 }}>
        AI POWERED SEARCH
      </span>

      <h2 style={{ marginTop: 10 }}>
        Find products using natural language
      </h2>

      <p>
        Describe what you need. Our AI understands the meaning
        of your search, not just individual keywords.
      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
          placeholder="e.g. Something to reduce heat loss in my home"
          style={{
            flex: "1 1 280px",
            padding: "14px",
            border: "1px solid #cbd5d1",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />

        <button
          onClick={handleSearch}
          disabled={!query.trim() || searching}
          style={{
            padding: "14px 22px",
            background: "#087f68",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            opacity: searching ? 0.6 : 1,
          }}
        >
          {searching ? "Searching..." : "Search with AI"}
        </button>
      </div>

      <p
        aria-live="polite"
        style={{ color: "#087f68", marginTop: 14 }}
      >
        {status}
      </p>

      {results.length > 0 && (
        <>
          <h3>Top AI matches</h3>

          <div className="grid products">
            {results.map((product, index) => (
              <article
                className="product"
                key={product.id}
              >
                <div className="product-image">
                  {index + 1}
                </div>

                <span>
                  {product.category?.name ?? "Uncategorised"}
                </span>

                <h2>{product.name}</h2>

                <p>{product.description}</p>

                <div className="product-meta">
                  <strong>
                    £{Number(product.price).toFixed(2)}
                  </strong>

                  <small>
                    {(product.score * 100).toFixed(1)}% similarity
                  </small>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
