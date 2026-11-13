
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Product } from "@/lib/types";

type RankedProduct = Product & {
  score: number;
};

type Props = {
  products: Product[];
  open: boolean;
  onClose: () => void;
};

const suggestions = [
  "Something to keep my room warm",
  "Charge my laptop from a UK socket",
  "Find energy-saving products under £30",
];

export default function AIShoppingAssistant({
  products,
  open,
  onClose,
}: Props) {
  const workerRef = useRef<Worker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingQueryRef = useRef<string | null>(null);
  const searchingRef = useRef(false);
  const modelReadyRef = useRef(false);
  const productsRef = useRef(products);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RankedProduct[]>([]);
  const [status, setStatus] = useState("Loading AI model...");
  const [searching, setSearching] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  // Keep the latest catalogue available to the worker handler.
  productsRef.current = products;

  const updateSearching = (value: boolean) => {
    searchingRef.current = value;
    setSearching(value);
  };

  const sendSearchToWorker = useCallback((value: string) => {
    const cleanQuery = value.trim();
    const worker = workerRef.current;

    if (!cleanQuery || !worker) return;

    pendingQueryRef.current = null;

    updateSearching(true);
    setQuery(cleanQuery);
    setResults([]);
    setStatus("Searching your product catalogue...");

    worker.postMessage({
      type: "search",
      query: cleanQuery,
      products: productsRef.current,
    });
  }, []);

  const runSearch = useCallback(
    (value: string) => {
      const cleanQuery = value.trim();

      if (!cleanQuery) return;

      if (!workerRef.current) {
        setStatus("Assistant unavailable. Please reopen it.");
        return;
      }

      if (searchingRef.current) {
        setStatus("Please wait for your current search to finish.");
        return;
      }

      setQuery(cleanQuery);

      if (!modelReadyRef.current) {
        pendingQueryRef.current = cleanQuery;
        setResults([]);
        setStatus("Question saved. Loading AI model...");
        return;
      }

      sendSearchToWorker(cleanQuery);
    },
    [sendSearchToWorker]
  );

  // Create one worker whenever the assistant opens.
  useEffect(() => {
    if (!open) return;

    modelReadyRef.current = false;
    searchingRef.current = false;
    pendingQueryRef.current = null;

    setModelReady(false);
    setSearching(false);
    setResults([]);
    setStatus("Loading AI model...");

    const worker = new Worker(
      new URL("../app/ai-search/worker.js", import.meta.url),
      { type: "module" }
    );

    workerRef.current = worker;

    worker.onmessage = ({ data }) => {
      if (data.type === "progress") {
        const progress = data.progress?.progress;

        const percentage = Number.isFinite(progress)
          ? ` ${Math.round(progress)}%`
          : "";

        setStatus(`Loading AI model${percentage}...`);
      }

      if (data.type === "ready") {
        modelReadyRef.current = true;
        setModelReady(true);
        setStatus("AI assistant ready. What do you need?");

        const pendingQuery = pendingQueryRef.current;

        if (pendingQuery) {
          sendSearchToWorker(pendingQuery);
        }
      }

      if (data.type === "result") {
        const ranked = data.ranked ?? [];

        setResults(ranked);
        updateSearching(false);

        setStatus(
          ranked.length > 0
            ? `Found ${ranked.length} matching products.`
            : "No matching products found. Try another description."
        );
      }

      if (data.type === "error") {
        modelReadyRef.current = false;
        setModelReady(false);
        pendingQueryRef.current = null;
        updateSearching(false);

        setStatus(`AI error: ${data.message}`);
      }
    };

    worker.onerror = (error) => {
      modelReadyRef.current = false;
      setModelReady(false);
      pendingQueryRef.current = null;
      updateSearching(false);

      setStatus(`Worker error: ${error.message}`);
    };

    // Tell the worker to initialise the AI model.
    worker.postMessage({ type: "init" });

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => {
      window.clearTimeout(focusTimer);

      modelReadyRef.current = false;
      searchingRef.current = false;
      pendingQueryRef.current = null;

      worker.terminate();

      if (workerRef.current === worker) {
        workerRef.current = null;
      }
    };
  }, [open, sendSearchToWorker]);

  // Escape key and background scrolling.
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ai-assistant-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="ai-assistant-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-title"
      >
        <header className="ai-assistant-header">
          <div>
            <span className="ai-assistant-icon">✦</span>

            <h2 id="ai-assistant-title">
              EcoHome AI Assistant
            </h2>

            <p>Browser AI · Experimental</p>
          </div>

          <button
            type="button"
            className="ai-assistant-close"
            onClick={onClose}
            aria-label="Close assistant"
          >
            ×
          </button>
        </header>

        <div className="ai-assistant-content">
          <div className="ai-assistant-welcome">
            Hi! 👋 I'm your EcoHome assistant. Tell me what you
            need, and I'll help you find matching products.

            <br />
            <br />

            You can ask things like "under £20" or something
            to keep your room warm.
          </div>

          <div className="ai-assistant-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={searching}
                onClick={() => runSearch(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <p
            className="ai-assistant-status"
            aria-live="polite"
          >
            {status}
          </p>

          {results.length > 0 && (
            <div className="ai-assistant-results">
              <h3>Top AI matches</h3>

              {results.map((product) => (
                <article
                  className="ai-assistant-product"
                  key={product.id}
                >
                  <div>
                    <span>
                      {product.category?.name ?? "Uncategorised"}
                    </span>

                    <h4>{product.name}</h4>

                    <p>{product.description}</p>

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
          )}
        </div>

        <form
          className="ai-assistant-input"
          onSubmit={(event) => {
            event.preventDefault();
            runSearch(query);
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What do you need?"
            aria-label="Describe what you need"
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={!query.trim() || searching}
          >
            {searching ? "Searching..." : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
