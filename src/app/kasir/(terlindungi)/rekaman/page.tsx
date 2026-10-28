import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { glossCategories, clipSrcFor, posterSrcFor } from "@/server/sign/glossary";
import { readClipInventory } from "@/server/sign/clip-inventory";
import { captureStatus } from "@/server/sign/sign-compiler";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Progres rekaman isyarat",
  robots: { index: false, follow: false },
};

/**
 * `/kasir/rekaman` — the recording checklist.
 *
 * Reads the generated clip manifest rather than the folder, because this page also
 * runs where there is no folder to read (serverless). Add a clip, then run
 * `python tools/make_clip_manifest.py` and rebuild; the row flips to ready.
 */
export default async function RecordingProgressPage() {
  const inventory = await readClipInventory();
  const { videos, posters } = inventory;

  const status = captureStatus();
  const missing = status.byCategory.flatMap((category) =>
    category.items.filter((item) => !videos.has(item.id)),
  );

  return (
    <main id="main" className="pt-20">
      <section className="container-page section-y relative overflow-x-clip">
        <LineArt
          motif="botanical"
          tone="sage"
          opacity="opacity-25"
          className="top-32 -right-20 hidden size-72 lg:block"
        />

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
              <Icon name="playCircle" className="size-4" />
              Checklist rekaman
            </p>
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              {`${status.ready} dari ${status.total} klip siap`}
            </h1>
            <p className="max-w-prose text-sm text-ink-muted sm:text-base">
              {`Letakkan file di `}
              <code className="rounded bg-surface px-1.5 py-0.5 text-xs">{clipSrcFor("<glossId>")}</code>
              {` untuk menandai satu klip selesai. Poster opsional: `}
              <code className="rounded bg-surface px-1.5 py-0.5 text-xs">{posterSrcFor("<glossId>")}</code>.
            </p>
          </div>

          <Link
            href="/kasir"
            className="inline-flex items-center gap-2 rounded-pill border border-line-strong/70 px-5 py-3 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name="arrowRight" className="size-5 rotate-180" />
            Daftar pesanan
          </Link>
        </header>

        <div className="mt-6 rounded-card border border-line bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold">Kemajuan keseluruhan</p>
            <p className="text-sm font-bold text-ocean">{`${status.percentReady}%`}</p>
          </div>
          {/*
            Progress is drawn with an SVG line rather than a div width: `pathLength`
            normalises the line to 100 units, so `strokeDashoffset` can carry the
            runtime percentage without any inline style.
          */}
          <div className="mt-3">
            <svg
              viewBox="0 0 100 4"
              preserveAspectRatio="none"
              className="h-2.5 w-full"
              role="progressbar"
              aria-valuenow={status.ready}
              aria-valuemin={0}
              aria-valuemax={status.total}
              aria-label="Kemajuan rekaman isyarat"
            >
              <line
                x1="0"
                y1="2"
                x2="100"
                y2="2"
                pathLength={100}
                stroke="var(--color-line)"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <line
                x1="0"
                y1="2"
                x2="100"
                y2="2"
                pathLength={100}
                stroke="var(--color-ocean)"
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={`${status.percentReady} 100`}
              />
            </svg>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            {status.pending === 0
              ? "Semua klip sudah ada. Pemutar isyarat akan memutar seluruh urutan."
              : `${status.pending} klip belum tersedia dan akan dilewati di pemutar.`}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {glossCategories.map((category) => {
            const bucket = status.byCategory.find((entry) => entry.id === category.id);
            if (!bucket) return null;
            return (
              <div
                key={category.id}
                className="rounded-card border border-line bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-base font-bold text-ink">{category.label}</h2>
                  <span className="rounded-pill bg-ocean-soft px-2.5 py-1 text-xs font-bold text-ocean">
                    {`${bucket.ready} / ${bucket.total}`}
                  </span>
                </div>

                <ul className="mt-3 flex flex-col divide-y divide-line">
                  {bucket.items.map((gloss) => {
                    const ready = videos.has(gloss.id);
                    return (
                      <li key={gloss.id} className="flex items-start gap-3 py-2.5">
                        <span
                          className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-pill ${
                            ready ? "bg-sage/25 text-leaft" : "bg-line/70 text-ink-muted"
                          }`}
                        >
                          <Icon name={ready ? "check" : "clock"} className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{gloss.label}</p>
                          <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                            {gloss.glossNotation}
                            {posters.has(gloss.id) ? " · poster siap" : ""}
                          </p>
                          {gloss.direction ? (
                            <p className="mt-1 text-xs text-ink-muted">{gloss.direction}</p>
                          ) : null}
                        </div>
                        <span
                          className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-bold ${
                            ready ? "bg-sage/20 text-leaft" : "bg-line/70 text-ink-muted"
                          }`}
                        >
                          {ready ? "siap" : "belum"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {missing.length > 0 ? (
          <div className="mt-6 rounded-card border border-line bg-surface p-5">
            <p className="text-sm font-bold">{`${missing.length} klip yang masih perlu direkam`}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {missing.map((gloss) => (
                <li
                  key={gloss.id}
                  className="rounded-pill border border-line-strong/60 bg-card px-3 py-1 text-xs font-bold text-ink-muted"
                >
                  {gloss.id}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </main>
  );
}
