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

function dot(a, b) {
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += a[i] * b[i];
  return total;
}

self.onmessage = async (event) => {
  const { query, products } = event.data;
  try {
    const extractor = await getExtractor();
    const texts = [
      query,
      ...products.map((p) => `${p.name}. ${p.description}`),
    ];
    const tensor = await extractor(texts, {
      pooling: "mean",
      normalize: true,
    });
    const vectors = tensor.tolist();
    const ranked = products
      .map((product, index) => ({
        ...product,
        score: dot(vectors[0], vectors[index + 1]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    self.postMessage({ type: "result", ranked });
  } catch (error) {
    self.postMessage({ type: "error", message: error?.message || String(error) });
  }
};
