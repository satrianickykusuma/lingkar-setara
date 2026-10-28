import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { LineArt } from "@/components/ui/LineArt";
import { hero } from "@/data/content";

/** Hero band: rounded media panel with the copy laid over a soft glass wash. */
export function Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="container-page relative overflow-x-clip pt-28 pb-12 lg:pt-32 lg:pb-16"
    >
      <LineArt
        motif="botanical"
        tone="sage"
        opacity="opacity-30"
        className="top-16 -left-24 hidden size-72 lg:block"
      />
      <LineArt
        motif="sparkle"
        tone="ocean"
        opacity="opacity-25"
        className="top-24 -right-16 hidden size-56 lg:block"
      />

      {/* Market-stall scatter along the panel's lower edge. These sit outside
          the copy column and clear of the LineArt above, so each one reads
          instead of disappearing into an overlapping silhouette. */}
      <Ingredient
        shape="lemon"
        tone="sage"
        opacity="opacity-40"
        className="-bottom-2 -left-20 hidden size-28 xl:block"
      />
      <Ingredient
        shape="chili"
        tone="ocean"
        opacity="opacity-35"
        className="-bottom-6 -right-16 hidden size-24 xl:block"
      />
      <Ingredient3D
        shape="tomato"
        volume="tomato"
        className="-bottom-10 left-1/4 hidden size-24 2xl:block"
      />
      <Ingredient
        shape="herb"
        tone="sage"
        opacity="opacity-30"
        className="bottom-24 -left-24 hidden size-24 2xl:block"
      />

      <div className="relative isolate overflow-hidden rounded-sheet bg-surface shadow-glow">
        {/* Background photograph, with a left-to-right wash so the copy on the
            left always keeps AA contrast (this is why the text reads navy, not
            white on a busy photo). */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={hero.image}
            alt={hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-base/92 via-base/80 to-base/55 lg:bg-linear-to-r lg:from-base/95 lg:via-base/82 lg:to-base/15"
          />
        </div>

        <div className="grid items-center gap-8 p-6 md:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            <p className="glass-panel inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-xs font-bold text-ocean shadow-sm">
              <span aria-hidden="true" className="size-2 rounded-full bg-sage" />
              {hero.badge}
            </p>

            <h1
              id="hero-title"
              className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[64px] lg:leading-[72px]"
            >
              {hero.titleLead}{" "}
              <span className="text-electric block lg:inline">{hero.titleAccent}</span>
            </h1>

            <p className="mt-5 max-w-xl font-body text-base text-ink-muted sm:text-lg">
              {hero.body}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button href={hero.primaryCta.href} variant="primary" arrow>
                {hero.primaryCta.label}
              </Button>
              <Button href={hero.secondaryCta.href} variant="glass">
                {hero.secondaryCta.label}
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-ink-muted lg:justify-start">
              {hero.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-ocean" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative glass card: reinforces the brand chip styling and keeps
              the right column from reading as empty space. */}
          <div className="hidden lg:col-span-5 lg:block lg:justify-self-end">
            <div className="glass-panel animate-rise relative isolate rounded-card border border-line-strong/60 p-5 shadow-card">
              {/* A little depth so the card is not flat glass alone. */}
              <Ingredient3D
                shape="leaf"
                volume="leaf"
                className="-top-10 -right-8 size-28 rotate-12"
              />
              <p className="relative text-xs font-bold uppercase tracking-[0.08em] text-ocean">
                Tiga cara memesan
              </p>
              <ul className="relative mt-3 flex flex-col gap-3 text-sm text-ink">
                <li className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-ocean" />
                  Bahasa isyarat (BISINDO)
                </li>
                <li className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-sky" />
                  Tulis di kertas pesanan
                </li>
                <li className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-sage" />
                  Bicara seperti biasa
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
