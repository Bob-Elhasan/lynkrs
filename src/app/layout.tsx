import type { Metadata } from "next";
import { Archivo, Inter, Caveat } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Pages serves the site from a sub path, so social cards need the full origin
// to resolve against. Falls back to the dev server when the variable is unset.
// metadataBase is the origin only: Next already prefixes the base path onto
// asset URLs, so including it here would double it up.
const basePath = process.env.PAGES_BASE_PATH ?? "";
const origin = basePath ? "https://bob-elhasan.github.io" : "http://localhost:3000";
const siteUrl = `${origin}${basePath}`;

const title = "Lynkrs. Growth is designed, not guessed";
const description =
  "A growth agency that joins strategy, media, content and SEO into one system, so marketing earns its keep.";

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title,
  description,
  openGraph: { title, description, siteName: "Lynkrs", type: "website", url: siteUrl },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${caveat.variable}`}>
      <head>
        {/* The entrance reveal starts everything at opacity 0 and Reveal.tsx
            fades it in. With scripting off nothing ever would, so the whole
            document would render blank — and the prism needs script too, so
            this is the page anyone without it actually gets. */}
        <noscript>
          <style>{".rv{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
