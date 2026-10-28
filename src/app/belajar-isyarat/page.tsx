import type { Metadata } from "next";

import { BelajarHero } from "@/components/sections/BelajarHero";
import { OrderSteps } from "@/components/sections/OrderSteps";
import { PracticeCta } from "@/components/sections/PracticeCta";
import { SignLibrary } from "@/components/sections/SignLibrary";
import { LineArt } from "@/components/ui/LineArt";
import { clipManifest } from "@/data/clip-manifest";
import type { LibraryClip } from "@/data/belajar";
import { glossCategories, glossRegistry } from "@/server/sign/glossary";

export const metadata: Metadata = {
  title: "Belajar Isyarat",
  description:
    "Tonton dan pelajari 29 isyarat yang dipakai untuk memesan di Kedai Tuli Bersama: sepuluh hidangan, porsi 1–10, dua minuman, cara penyajian, suhu, dan pilihan rica atau kecap.",
};

/**
 * Every recorded sign, ready to learn from.
 *
 * The clips come from the glossary (labels, gloss, duration) paired with the build
 * manifest (the real file URLs). Using the manifest rather than assuming
 * `<id>.mp4` means a renamed or missing file shows up as a missing card instead of
 * a dead player.
 */
function libraryClips(): LibraryClip[] {
  const categoryLabel = new Map(glossCategories.map((entry) => [entry.id, entry.label]));

  return glossRegistry.flatMap((gloss) => {
    const videoSrc = clipManifest.videos[gloss.id];
    if (!videoSrc) return [];
    return [
      {
        id: gloss.id,
        label: gloss.label,
        gloss: gloss.glossNotation,
        category: gloss.category,
        categoryLabel: categoryLabel.get(gloss.category) ?? gloss.category,
        videoSrc,
        posterSrc: clipManifest.posters[gloss.id] ?? gloss.posterSrc,
        durationSeconds: Math.round(gloss.durationMs / 1000),
      },
    ];
  });
}

export default function BelajarIsyaratPage() {
  const clips = libraryClips();

  return (
    <main id="main" className="relative overflow-clip pt-20">
      <Ornaments />
      <div className="relative z-10">
        <BelajarHero />
        <OrderSteps />
        <SignLibrary clips={clips} />
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
