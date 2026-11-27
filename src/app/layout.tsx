
import type { Metadata } from "next";
import EcoHeaderServer from "@/components/EcoHeaderServer";
import { CartProvider } from "@/components/CartProvider";
import { Nunito } from "next/font/google";
import "./styles.css";
import Link from "next/link";
import CookieConsent from "@/components/CookieConsent";


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
    <html lang="en" suppressHydrationWarning>
      <body className={nunito.className}>
        <CartProvider>
          <EcoHeaderServer />
          <main>{children}</main>
          <footer className="eco-footer">

  <div className="eco-footer-inner">

    <div className="eco-footer-brand">
      <Link href="/" className="eco-footer-logo">
        EcoHome<span>.</span>
      </Link>

      <p>Smarter living, lower energy use.</p>

      <small>
        Making energy-conscious choices feel simpler,
        one home at a time.
      </small>
    </div>

    <nav className="eco-footer-nav">

      <div>
        <h2>Help & Support</h2>
        <Link href="/faq">FAQs</Link>
        <Link href="/contact">Contact Us</Link>
        <Link href="/returns">Delivery & Returns</Link>
      </div>

      <div>
        <h2>Information</h2>
        <Link href="/terms">Terms & Conditions</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/cookies">Cookie Policy</Link>
      </div>

    </nav>

  </div>

  <div className="eco-footer-bottom">
    <span>
      © {new Date().getFullYear()} EcoHome. All rights reserved.
    </span>
    <span>Smarter living, lower energy use.</span>
  </div>

</footer>
<CookieConsent />
        </CartProvider>

      </body>
    </html>
  );
}




