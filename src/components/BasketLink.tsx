"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function BasketLink() {
  const { items } = useCart();

  const count = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Link href="/cart">
      Basket ({count})
    </Link>
  );
}


