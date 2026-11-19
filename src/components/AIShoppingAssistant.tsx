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

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: RankedProduct[];
  isSuggestions?: boolean;
};

type Props = {
  products: Product[];
  open: boolean;
  isMinimized: boolean;
  onMinimizedChange: (minimized: boolean) => void;
  onClose: () => void;
  onOpen: () => void;
};

const suggestions = [
  "Something to keep my room warm",
  "Charge my laptop from a UK socket",
  "Find energy-saving products under £30",
];

const initialWelcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! 👋 I'm your EcoHome AI assistant. Choose a quick prompt below or ask me anything:",
  isSuggestions: true,
};

export default function AIShoppingAssistant({
  products,
  open,
  isMinimized,
  onMinimizedChange,
  onClose,
  onOpen,
}: Props) {
  const workerRef = useRef<Worker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const pendingQueryRef = useRef<string | null>(null);
  const searchingRef = useRef(false);
  const modelReadyRef = useRef(false);
  const productsRef = useRef(products);

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // Chat states
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([initialWelcomeMessage]);
  const [status, setStatus] = useState("Loading AI model...");
  const [searching, setSearching] = useState(false);

  productsRef.current = products;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, searching]);

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
    setQuery("");
    setStatus("Searching your product catalogue...");

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: cleanQuery },
    ]);

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

      if (!modelReadyRef.current) {
        pendingQueryRef.current = cleanQuery;
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "user", content: cleanQuery },
        ]);
        setStatus("Question saved. Loading AI model...");
        return;
      }

      sendSearchToWorker(cleanQuery);
    },
    [sendSearchToWorker]
  );

  // Initialize Worker when opened
  useEffect(() => {
    if (!open) return;

    modelReadyRef.current = false;
    searchingRef.current = false;
    pendingQueryRef.current = null;
    setSearching(false);
    setStatus("Loading AI model...");

    const worker = new Worker(
      new URL("../app/ai-search/worker.js", import.meta.url),
      { type: "module" }
    );

    workerRef.current = worker;

    worker.onmessage = ({ data }) => {
      if (data.type === "progress") {
        const progress = data.progress?.progress;
        const percentage = Number.isFinite(progress) ? ` ${Math.round(progress)}%` : "";
        setStatus(`Loading AI model${percentage}...`);
      }

      if (data.type === "ready") {
        modelReadyRef.current = true;
        setStatus("AI assistant ready. What do you need?");

        const pendingQuery = pendingQueryRef.current;
        if (pendingQuery) {
          sendSearchToWorker(pendingQuery);
        }
      }

      if (data.type === "result") {
        // STRICT GUARD: Only process results if the user actively triggered a search
        if (!searchingRef.current) return;

        const ranked = data.ranked ?? [];
        updateSearching(false);

        if (ranked.length > 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Here are the top ${ranked.length} eco-friendly matches I found for you:`,
              products: ranked,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content:
                "Nothing matched that exact phrase — try asking about smart plugs, heating, LED lighting, or pick a prompt below:",
              isSuggestions: true,
            },
          ]);
        }

        setStatus("Ready for your next query.");
      }

      if (data.type === "error") {
        modelReadyRef.current = false;
        updateSearching(false);
        setStatus(`AI error: ${data.message}`);
      }
    };

    worker.onerror = (error) => {
      modelReadyRef.current = false;
      updateSearching(false);
      setStatus(`Worker error: ${error.message}`);
    };

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

  // Click outside to minimize chat window (ignoring the navbar trigger button)
  useEffect(() => {
    if (!open || isMinimized) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest(".ai-header-trigger")) return;

      if (windowRef.current && !windowRef.current.contains(target)) {
        onMinimizedChange(true);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, isMinimized, onMinimizedChange]);

  // Dragging event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleFullClose = () => {
    updateSearching(false);
    setMessages([initialWelcomeMessage]);
    onClose();
  };

  return (
    <>
      {/* Persistent Floating Launcher Button */}
      {!open && (
        <button
          type="button"
          className="ai-persistent-fab"
          onClick={onOpen}
          aria-label="Open EcoHome AI assistant"
          title="Chat with EcoHome AI"
        >
          <span className="fab-sparkle">✦</span>
          <span className="fab-pulse"></span>
        </button>
      )}

      {/* Minimized Floating Bubble */}
      {open && isMinimized && (
        <div
          className="ai-minimized-bubble"
          onClick={() => onMinimizedChange(false)}
          title="Restore EcoHome AI chat"
        >
          <span>✦</span>
          <span className="minimized-badge">AI</span>
        </div>
      )}

      {/* Main Draggable Chat Window */}
      {open && !isMinimized && (
        <div
          ref={windowRef}
          className="ai-chat-window"
          style={
            position
              ? { left: `${position.x}px`, top: `${position.y}px`, bottom: "auto", right: "auto" }
              : {}
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-chat-title"
        >
          {/* Draggable Header */}
          <div className="ai-chat-header" onMouseDown={handleMouseDown}>
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar">
                <span>✦</span>
              </div>
              <div>
                <h3 id="ai-chat-title">EcoHome AI</h3>
                <span className="ai-chat-status-indicator">
                  <span className="ai-pulse-dot"></span>
                  {status}
                </span>
              </div>
            </div>
            <div className="ai-chat-header-actions" onMouseDown={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="ai-chat-dock-btn"
                onClick={() => onMinimizedChange(true)}
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                🗕
              </button>
              <button
                type="button"
                className="ai-chat-close-btn"
                onClick={handleFullClose}
                title="Close and reset chat"
                aria-label="Close and reset chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="ai-chat-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-chat-message ${msg.role === "user" ? "user" : "assistant"}`}
              >
                {msg.role === "assistant" && <div className="ai-msg-icon">✦</div>}
                <div className="ai-msg-bubble">
                  <p>{msg.content}</p>

                  {/* Vertical Suggestions inside welcome or fallback message */}
                  {msg.isSuggestions && (
                    <div className="ai-vertical-suggestions">
                      {suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          disabled={searching}
                          onClick={() => runSearch(sug)}
                        >
                          ✨ {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.products && msg.products.length > 0 && (
                    <div className="ai-chat-products">
                      {msg.products.map((product) => (
                        <div className="ai-chat-product-card" key={product.id}>
                          <div className="ai-chat-prod-meta">
                            <span className="ai-prod-cat">
                              {product.category?.name ?? "Eco Product"}
                            </span>
                            <span className="ai-prod-match">
                              {(product.score * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <h4>{product.name}</h4>
                          <p className="ai-prod-desc">{product.description}</p>
                          <div className="ai-chat-prod-footer">
                            <strong className="ai-prod-price">
                              £{Number(product.price).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {searching && (
              <div className="ai-chat-message assistant">
                <div className="ai-msg-icon">✦</div>
                <div className="ai-msg-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            className="ai-chat-input-form"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch(query);
            }}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask AI about products or budget..."
              aria-label="Ask AI about products or budget"
              autoComplete="off"
            />
            <button type="submit" disabled={!query.trim() || searching}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}