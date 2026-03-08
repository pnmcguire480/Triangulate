import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Triangulate | Trust Through Convergence",
  description:
    "See where news sources agree. Triangulate clusters coverage from across the political spectrum and shows you where the facts converge.",
  keywords: [
    "news",
    "triangulation",
    "media bias",
    "convergence",
    "trust",
    "fact checking",
    "primary sources",
  ],
  openGraph: {
    title: "Triangulate | Trust Through Convergence",
    description:
      "See where news sources agree. Find the signal in the noise.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Triangulate | Trust Through Convergence",
    description:
      "See where news sources agree. Find the signal in the noise.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-brand-warm text-brand-navy font-body antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
