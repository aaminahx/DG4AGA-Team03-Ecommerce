
import type { Metadata } from "next";
import EcoHeaderServer from "@/components/EcoHeaderServer";
import { CartProvider } from "@/components/CartProvider";
import "./styles.css";

export const metadata: Metadata = {
  title: "EcoHome | Smarter Home Living",
  description: "Discover products to make your home more energy efficient.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <EcoHeaderServer />
          <main>{children}</main>
          <footer className="eco-footer">
            © {new Date().getFullYear()} EcoHome. Smarter living, lower energy use.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
