import type { Metadata } from "next";
import Link from "next/link";
import "./styles.css";

export const metadata: Metadata = {
  title: "DG4AGA Starter Store",
  description: "A deliberately incomplete foundation for the DG4AGA team project",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">DG4AGA Starter</Link>
          <nav aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>Replace this identity, content and design with your team’s justified solution.</p>
        </footer>
      </body>
    </html>
  );
}
