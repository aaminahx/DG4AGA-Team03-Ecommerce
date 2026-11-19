
import { pipeline } from "@huggingface/transformers";

let extractorPromise;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      {
        dtype: "q8",
        progress_callback: (progress) => {
          self.postMessage({ type: "progress", progress });
        },
      }
    );
  }

  return extractorPromise;
}

// Detect an explicit maximum-price request.
function getMaxPrice(query) {
  const safeQuery = String(query ?? "");

  const patterns = [
    /(?:under|below|less than|cheaper than|maximum|max)\s*£?\s*(\d+(?:\.\d+)?)/i,
    /£\s*(\d+(?:\.\d+)?)\s*(?:or less|and under|maximum|max)/i,
    /up to\s*£?\s*(\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = safeQuery.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

// Remove budget wording before semantic matching.
function cleanSearchQuery(query) {
  return String(query ?? "")
    .replace(
      /(?:under|below|less than|cheaper than|maximum|max|up to)\s*£?\s*\d+(?:\.\d+)?/gi,
      ""
    )
    .replace(
      /£\s*\d+(?:\.\d+)?\s*(?:or less|and under|maximum|max)/gi,
      ""
    )
    .trim();
}

function dot(a, b) {
  let total = 0;

  for (let i = 0; i < a.length; i += 1) {
    total += a[i] * b[i];
  }

  return total;
}

// Load the AI model as soon as the worker starts.
async function initialiseModel() {
  try {
    await getExtractor();

    self.postMessage({ type: "ready" });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error?.message || String(error),
    });
  }
}

initialiseModel();

self.onmessage = async (event) => {
  const query = String(event.data?.query ?? "");

  const products = Array.isArray(event.data?.products)
    ? event.data.products
    : [];

  try {
    if (!query.trim()) {
      self.postMessage({
        type: "result",
        ranked: [],
        message: "Please enter a search query.",
      });

      return;
    }

    if (products.length === 0) {
      self.postMessage({
        type: "result",
        ranked: [],
        message: "No products are currently available.",
      });

      return;
    }

    const maxPrice = getMaxPrice(query);

    // Filter products before AI ranking.
    const eligibleProducts =
      maxPrice !== null
        ? products.filter((product) => {
            const price = Number(product.price);

            return Number.isFinite(price) && price <= maxPrice;
          })
        : products;

    if (eligibleProducts.length === 0) {
      self.postMessage({
        type: "result",
        ranked: [],
        maxPrice,
        message: `No products found within £${maxPrice}.`,
      });

      return;
    }

    const extractor = await getExtractor();

    const semanticQuery =
      cleanSearchQuery(query) || query;

    const texts = [
      semanticQuery,
      ...eligibleProducts.map(
        (product) =>
          `${product.name ?? ""}. ${product.description ?? ""}`
      ),
    ];

    const tensor = await extractor(texts, {
      pooling: "mean",
      normalize: true,
    });

    const vectors = tensor.tolist();

    const ranked = eligibleProducts
      .map((product, index) => ({
        ...product,
        score: dot(vectors[0], vectors[index + 1]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    self.postMessage({
      type: "result",
      ranked,
      maxPrice,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error?.message || String(error),
    });
  }
};
