import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Alex_Brush } from "next/font/google";
import "./globals.css";
import { ProductsProvider } from "@/context/ProductsContext";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";

const displaySerif = Playfair_Display({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const uiSans = Plus_Jakarta_Sans({
  variable: "--font-ui-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const scriptAccent = Alex_Brush({
  variable: "--font-script-accent",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lamha Arts & Craft | Handcrafted Indian Festive & Pooja Décor",
  description: "We create what you imagine. Beautifully hand-designed Shubh Labh hangings, T-light sets, Haldi Kumkum platters, Shagun items, and Torans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${displaySerif.variable} ${uiSans.variable} ${scriptAccent.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-ivory text-brand-charcoal font-ui">
        <ProductsProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <CartDrawer />
          </CartProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
