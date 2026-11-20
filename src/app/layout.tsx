
import type { Metadata } from "next";
import EcoHeaderServer from "@/components/EcoHeaderServer";
import { CartProvider } from "@/components/CartProvider";
import { Nunito } from "next/font/google";
import "./styles.css";

export const metadata: Metadata = {
  title: "EcoHome | Smarter Home Living",
  description: "Discover products to make your home more energy efficient.",
};

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        <CartProvider>
          <EcoHeaderServer />
          <main>{children}</main>
          <footer className="eco-footer">
            © {new Date().getFullYear()} EcoHome.
            Smarter living, lower energy use.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
