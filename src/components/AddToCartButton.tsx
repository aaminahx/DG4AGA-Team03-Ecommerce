
"use client";

import { useCart } from "./CartProvider";
import { ShoppingBasket } from "lucide-react";

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
      type="button"
      onClick={() => addToCart(product)}
      style={{
        backgroundColor: "#F4C542",
        color: "#17233B",
        border: "none",
        borderRadius: "12px",
        padding: "12px 20px",
        marginTop: "12px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <ShoppingBasket size={19} />
      Add to Basket
    </button>
  );
}
