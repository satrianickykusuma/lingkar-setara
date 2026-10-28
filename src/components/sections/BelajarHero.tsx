import Image from "next/image";

import { Icon } from "@/components/ui/Icon";
import { belajarHero } from "@/data/belajar";

/**
 * Belajar Isyarat banner.
 *
 * The old version held a "spotlight" player with a fake 03:45 duration, a fake
 * timestamp and no video behind it. A learning page should not show a play button
 * that plays nothing, so the slot now holds a photograph and a link to the real
 * library below.
 */
export function BelajarHero() {
  return (
    <section
      aria-labelledby="belajar-title"
      className="container-page pt-28 pb-10 lg:pt-32"
    >
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-start gap-3 lg:col-span-7">
          <p className="inline-flex flex-wrap items-center gap-2 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
            <Icon name="signLanguage" className="size-4" />
            {belajarHero.badge}
            <span aria-hidden="true" className="text-ink-muted">
              •
            </span>
            <span className="normal-case tracking-normal text-ink-muted">
              {belajarHero.badgeNote}
            </span>
          </p>

          <h1
            id="belajar-title"
            className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl"
          >
            {belajarHero.titleLead}{" "}
            <span className="text-electric">{belajarHero.titleAccent}</span>
          </h1>

          <p className="max-w-2xl text-base text-ink-muted md:text-lg">
            {belajarHero.body}
          </p>

          <ul className="mt-2 flex flex-wrap items-center gap-2">
            {belajarHero.chips.map((chip) => (
              <li
                key={chip.id}
                className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/60 bg-card/80 px-3 py-1.5 text-xs font-bold text-ink"
              >
                <Icon name={chip.icon} className="size-4 text-ocean" />
                {chip.label}
              </li>
            ))}
          </ul>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={belajarHero.cta.href}
              className="bg-electric inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 focus-visible:outline-white"
            >
              <Icon name="playCircle" className="size-4" />
              {belajarHero.cta.label}
            </a>
            <a
              href="/menu"
              className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/70 px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:text-ocean"
            >
              Lihat menu
              <Icon name="arrowRight" className="size-4" />
            </a>
          </div>

          <div className="glass-panel mt-2 flex flex-col gap-3 rounded-card border border-line-strong/50 p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
                <Icon name="signLanguage" className="size-6" />
              </span>
              <div>
                <p className="font-display text-sm font-bold leading-tight">
                  {belajarHero.assistTitle}
                </p>
                <p className="text-xs font-bold text-ink-muted">
                  {belajarHero.assistSteps}
                </p>
              </div>
            </div>
            <p className="text-sm text-ink-muted">{belajarHero.assistNote}</p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <figure className="overflow-hidden rounded-sheet border border-line-strong/40 bg-card shadow-card">
            <div className="relative aspect-4/3 w-full">
              <Image
                src={belajarHero.poster}
                alt={belajarHero.posterAlt}
                fill
                priority
                sizes="(min-width: 1024px) 420px, 90vw"
                className="object-cover"
              />
            </div>
            <figcaption className="p-4">
              <p className="font-display text-sm font-bold">
                Dipandu langsung oleh kawan Tuli
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Semua isyarat di halaman ini direkam di kedai ini, bukan animasi
                atau ilustrasi.
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
