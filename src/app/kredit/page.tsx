import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { menuById } from "@/data/menu";
import { photoCredits } from "@/data/photo-credits";

export const metadata: Metadata = {
  title: "Kredit foto",
  description:
    "Sumber, pemotret, dan lisensi setiap foto hidangan yang dipakai di menu Kedai Tuli Bersama.",
};

/**
 * `/kredit` — photo attribution.
 *
 * Not decoration: every dish photo is CC BY, CC BY-SA or CC0 from Wikimedia
 * Commons, and those licences permit commercial use **only with credit**. This page
 * is the credit, which is why it is linked from the footer of every page.
 *
 * Cropping is an adaptation, so the cropped files stay under their original
 * licence — stated below rather than left implicit.
 */
export default function PhotoCreditsPage() {
  return (
    <main id="main" className="pt-20">
      <section className="container-page section-y relative overflow-x-clip">
        <LineArt
          motif="botanical"
          tone="sage"
          opacity="opacity-25"
          className="top-28 -right-24 hidden size-72 lg:block"
        />

        <header className="flex flex-col items-start gap-2">
          <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
            <Icon name="quote" className="size-4" />
            Kredit
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Kredit foto hidangan
          </h1>
          <p className="max-w-prose text-sm text-ink-muted sm:text-base">
            Foto di halaman menu berasal dari Wikimedia Commons dengan lisensi CC BY,
            CC BY-SA, atau CC0. Lisensi tersebut mengizinkan pemakaian komersial
            dengan syarat mencantumkan pemotret dan lisensinya — daftar di bawah ini
            memenuhi syarat itu.
          </p>
        </header>

        <div className="mt-6 rounded-card border border-line bg-surface p-4">
          <p className="text-xs text-ink-muted">
            Foto dipotong (crop) agar seragam di kartu menu. Pemotongan adalah
            perubahan, sehingga berkas hasil potong tetap berlisensi sama dengan
            aslinya. Foto dapat diganti dengan foto milik kedai sendiri kapan saja —
            cukup timpa berkasnya lalu perbarui daftar ini.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {photoCredits.map((credit) => {
            const dish = menuById[credit.dishId];
            return (
              <li
                key={credit.dishId}
                className="flex flex-col gap-1.5 rounded-card border border-line bg-card p-4 shadow-card"
              >
                <p className="font-display text-base font-bold text-ink">
                  {dish?.name ?? credit.dishId}
                </p>
                <p className="text-sm text-ink">
                  <span className="text-ink-muted">Foto: </span>
                  {credit.artist}
                </p>
                <p className="text-sm">
                  <span className="text-ink-muted">Lisensi: </span>
                  <a
                    href={credit.licenceUrl || credit.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer license"
                    className="font-bold text-ocean underline-offset-4 hover:underline"
                  >
                    {credit.licence}
                  </a>
                </p>
                <a
                  href={credit.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-ocean underline-offset-4 hover:underline"
                >
                  Berkas asli di Wikimedia Commons
                  <Icon name="externalLink" className="size-3.5" />
                </a>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-xs text-ink-muted">
          {`Ingin memakai foto kedai sendiri? Ganti `}
          <code className="rounded bg-surface px-1.5 py-0.5">public/images/menu/&lt;id&gt;.jpg</code>
          {` lalu jalankan ulang `}
          <code className="rounded bg-surface px-1.5 py-0.5">npm run build</code>
          {` dan perbarui `}
          <code className="rounded bg-surface px-1.5 py-0.5">src/data/photo-credits.ts</code>.
        </p>

        <p className="mt-4 text-xs font-bold">
          <Link href="/menu" className="text-ocean underline-offset-4 hover:underline">
            Kembali ke menu
          </Link>
        </p>
      </section>
    </main>
  );
}
