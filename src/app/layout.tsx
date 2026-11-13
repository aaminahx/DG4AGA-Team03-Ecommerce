import type { Metadata } from "next";
import Link from "next/link";
import "./styles.css";
import { CartProvider } from "@/components/CartProvider";
import BasketLink from "@/components/BasketLink";
import AIShoppingAssistantServer from "@/components/AIShoppingAssistantServer";

export const metadata: Metadata = {
  title: "EcoHome",
  description: "Cut your energy bills with products matched to your home, budget and priorities.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <header className="site-header">
            <Link className="brand" href="/">Eco Home </Link>
            <AIShoppingAssistantServer />

            <nav aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/products">Products</Link>
              <Link href="/login">Sign in</Link>
              <Link href="/account">My Account</Link>
              <BasketLink />
            </nav>
          </header>
          <main>{children}</main>
          <footer>
            <p>Eco Home helps UK households find affordable, energy-saving products for lighting, heating, appliances and water use.</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}


