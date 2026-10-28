import type { Metadata } from "next";

import { BelajarHero } from "@/components/sections/BelajarHero";
import { CheatSheet } from "@/components/sections/CheatSheet";
import { OrderSteps } from "@/components/sections/OrderSteps";
import { PracticeCta } from "@/components/sections/PracticeCta";
import { SignGallery } from "@/components/sections/SignGallery";
import { LineArt } from "@/components/ui/LineArt";

export const metadata: Metadata = {
  title: "Belajar Isyarat",
  description:
    "Kuasai isyarat pemesanan praktis dalam BISINDO bersama kawan Tuli Lingkar Setara: lima langkah memesan di kasir, galeri tutorial, dan kamus isyarat kilat.",
};

export default function BelajarIsyaratPage() {
  return (
    <main id="main" className="relative overflow-hidden pt-20">
      <Ornaments />
      <div className="relative z-10">
        <BelajarHero />
        <OrderSteps />
        <SignGallery />
        <CheatSheet />
        <PracticeCta />
      </div>
    </main>
  );
}

/** Page-level line-art, matching the motifs used by the header and footer. */
function Ornaments() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <LineArt
        motif="sparkle"
        tone="ocean"
        opacity="opacity-25"
        className="top-24 right-1/4 hidden size-72 lg:block"
      />
      <LineArt
        motif="botanical"
        tone="sage"
        opacity="opacity-30"
        className="top-1/3 -left-24 hidden size-80 lg:block"
      />
      <LineArt
        motif="wave"
        tone="ocean"
        opacity="opacity-25"
        className="top-2/3 -right-20 hidden size-80 lg:block"
      />
      <LineArt
        motif="orbit"
        tone="sage"
        opacity="opacity-30"
        className="bottom-40 left-1/3 hidden size-64 xl:block"
      />
    </div>
  );
}
