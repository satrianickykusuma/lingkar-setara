import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { LineArt } from "@/components/ui/LineArt";
import { practiceSection } from "@/data/belajar";

/** Closing invitation: practise in the shop, plus a route back to the menu. */
export function PracticeCta() {
  return (
    <section
      aria-labelledby="praktik-title"
      className="container-page section-y relative overflow-x-clip"
    >
      <Ingredient3D
        shape="avocado"
        volume="leaf"
        className="-bottom-8 -left-14 hidden size-28 rotate-6 xl:block"
      />
      <Ingredient
        shape="lime"
        tone="ocean"
        opacity="opacity-30"
        className="-bottom-10 -right-14 hidden size-24 2xl:block"
      />

      <div className="relative isolate overflow-hidden rounded-sheet border border-line-strong/50 bg-surface shadow-glow">
        <LineArt
          motif="orbit"
          tone="sage"
          opacity="opacity-40"
          className="-top-16 -right-12 size-72"
        />
        <LineArt
          motif="wave"
          tone="ocean"
          opacity="opacity-30"
          className="-bottom-20 -left-16 size-80"
        />

        <div className="relative z-10 grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
          <div className="flex flex-col items-start gap-4">
            <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-card/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
              <Icon name="inclusiveSpace" className="size-4" />
              {practiceSection.eyebrow}
            </p>
            <h2
              id="praktik-title"
              className="font-display text-3xl font-extrabold leading-tight sm:text-4xl"
            >
              Jangan Khawatir Berbuat Salah{" "}
              <span className="text-electric">Saat Berisyarat!</span>
            </h2>
            <p className="max-w-prose text-base text-ink-muted">
              {practiceSection.body}
            </p>
            <Button href={practiceSection.cta.href} arrow>
              {practiceSection.cta.label}
            </Button>
          </div>

          <div className="hover-lift relative aspect-4/3 overflow-hidden rounded-card border border-line-strong/40 shadow-card">
            <Image
              src="/images/belajar/barista-isyarat.jpg"
              alt="Kawan Tuli Lingkar Setara tersenyum sambil memperagakan isyarat kepada tamu"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
