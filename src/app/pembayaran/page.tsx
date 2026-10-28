import type { Metadata } from "next";

import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Pembayaran",
  description:
    "Selesaikan pesanan Lingkar Setara: pilih cara penyajian, isi data pemesan, lalu tentukan metode pembayaran.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main id="main" className="pt-20">
      <CheckoutFlow />
    </main>
  );
}
