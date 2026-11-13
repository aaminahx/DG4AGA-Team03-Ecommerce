
"use client";

import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "./CartProvider";

export default function BasketLink() {
  const { items } = useCart();

  const count = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Link
      href="/cart"
      className="icon-link"
      aria-label={`Basket with ${count} items`}
      title={`Basket (${count})`}
    >
      <ShoppingBasket size={24} strokeWidth={1.8} />
     <span style={{ fontSize: "20px", fontWeight: 800 }}>
  {count}
</span>
    </Link>
  );
}
