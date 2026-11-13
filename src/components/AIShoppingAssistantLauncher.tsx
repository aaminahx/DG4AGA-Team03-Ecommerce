
"use client";

import { useState } from "react";
import AIShoppingAssistant from "./AIShoppingAssistant";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
};

export default function AIShoppingAssistantLauncher({
  products,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="ai-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open EcoHome AI shopping assistant"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="ai-search-leading-icon" aria-hidden="true">
          ✦
        </span>

        <span className="ai-search-text">
          <strong>Ask EcoHome AI</strong>
          <small>What are you looking for today?</small>
        </span>

        <span className="ai-search-action" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </button>

      <AIShoppingAssistant
        products={products}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
