import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Plus_Jakarta_Sans } from "next/font/google";

import { CartLayer } from "@/components/cart/CartLayer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

/**
 * Atkinson Hyperlegible Next is designed by the Braille Institute for readers
 * with low vision: letterforms stay distinguishable instead of relying on
 * context. For a deaf-run, accessibility-led eatery it is the right body face.
 */
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lingkar Setara — Ruang Makan Ramah Teman Tuli",
    template: "%s · Lingkar Setara",
  },
  description:
    "Lingkar Setara adalah ruang makan yang dijalankan oleh teman Tuli. Pesan menu, kenali cerita kami, dan belajar isyarat bersama.",
  openGraph: {
    title: "Lingkar Setara — Ruang Makan Ramah Teman Tuli",
    description:
      "Makanan rumahan yang jujur, dilayani dengan bahasa isyarat dan senyum.",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${atkinson.variable} scroll-smooth`}
    >
      <body className="flex min-h-dvh flex-col bg-surface-base font-body text-ink antialiased">
        <CartProvider>
          <a href="#main" className="skip-link">
            Lompat ke konten
          </a>
          <Header />
          {children}
          <Footer />
          <CartLayer />
        </CartProvider>
      </body>
    </html>
  );
}
