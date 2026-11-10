
"use client";

import { useCart } from "./CartProvider";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="bg-black text-white px-4 py-2 rounded"
    >
      Add to Basket
    </button>
  );
}

