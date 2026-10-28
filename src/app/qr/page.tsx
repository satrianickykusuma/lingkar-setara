import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { qrMeta } from "@/data/qr-meta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kode QR",
  robots: { index: false, follow: false },
};

/**
 * `/qr` — the printable codes, with a staleness check.
 *
 * A QR aimed at a LAN address goes stale the moment the router hands out a different
 * IP, and a printed card cannot be edited. So this page compares the address baked
 * into the code against the address it is being served on, and says so loudly when
 * they differ — printing a card that silently points nowhere is the failure mode
 * worth designing against.
 */
export default async function QrPage() {
  const meta = hasQr() ? qrMeta : null;
  const requestHeaders = await headers();
  const host = requestHeaders.get("host")?.split(":")[0] ?? null;
  const servedBase = host ? `http://${host}` : null;

  const metaHost = meta ? new URL(meta.base).hostname : null;

  // Loopback is not a mismatch: the code is meant for *another* device, so viewing
  // this page at localhost is the normal case, not an error to shout about.
  const loopback = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const matches = meta !== null && host !== null && metaHost === host;
  const differentLan = meta !== null && !loopback && !matches;

  /** Only a real LAN mismatch is a problem worth alarming for. */
  const status: "ok" | "local" | "stale" = matches ? "ok" : differentLan ? "stale" : "local";

  return (
    <main id="main" className="pt-20">
      <section className="container-page section-y relative overflow-x-clip">
        <LineArt
          motif="orbit"
          tone="sage"
          opacity="opacity-25"
          className="top-24 -left-24 hidden size-64 lg:block"
        />

        <header className="flex flex-col items-start gap-2">
          <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
            <Icon name="qrCode" className="size-4" />
            Kode QR
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Pindai untuk membuka situs
          </h1>
          <p className="max-w-prose text-sm text-ink-muted sm:text-base">
            Tempel di meja, pintu masuk, atau papan menu. Ponsel memindai kode ini lalu
            langsung membuka halaman pemesanan.
          </p>
        </header>

        {meta === null ? (
          <p className="mt-6 rounded-card border border-line bg-surface p-4 text-sm font-bold text-tomato-deep">
            {`Belum ada kode QR. Jalankan `}
            <code className="rounded bg-card px-1.5 py-0.5">python tools/make_qr.py</code>
            {` lebih dulu.`}
          </p>
        ) : (
          <>
            <div
              className={`mt-6 rounded-card border p-4 text-sm ${
                status === "stale"
                  ? "border-tomato/50 bg-surface text-tomato-deep"
                  : "border-line bg-surface text-ink-muted"
              }`}
            >
              <p className="font-bold">
                {status === "stale"
                  ? "Kode ini mengarah ke alamat yang berbeda dari yang sedang dibuka."
                  : status === "local"
                    ? "Kode ini untuk perangkat lain di jaringan yang sama."
                    : "Kode ini cocok dengan alamat yang sedang Anda buka."}
              </p>
              <p className="mt-1">
                {`Dikodekan: `}
                <span className="rounded bg-card px-1.5 py-0.5 font-display font-bold text-ink">
                  {meta.base}
                </span>
              </p>
              {status === "local" && servedBase ? (
                <p className="mt-1">
                  {`Anda membukanya lewat `}
                  <span className="rounded bg-card px-1.5 py-0.5 font-display font-bold text-ink">
                    {servedBase}
                  </span>
                  {`, yang hanya berlaku di komputer ini. Untuk ponsel, gunakan alamat di atas — sama-sama terhubung ke Wi-Fi yang sama.`}
                </p>
              ) : null}
              {status === "stale" && servedBase ? (
                <p className="mt-1">
                  {`Sedang dibuka di: `}
                  <span className="rounded bg-card px-1.5 py-0.5 font-display font-bold text-ink">
                    {servedBase}
                  </span>
                  {`. Jalankan ulang `}
                  <code className="rounded bg-card px-1.5 py-0.5">python tools/make_qr.py</code>
                  {` agar kodenya mengikuti alamat ini.`}
                </p>
              ) : null}
              <p className="mt-2 text-xs">
                {`Dibuat ${formatGenerated(meta.generatedAt)}. Selama situs tetap di alamat ini, kode yang sudah dicetak tetap berlaku — dan kode yang sudah tercetak tidak bisa diubah kalau alamatnya berganti.`}
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="rounded-card border border-line bg-card p-5 shadow-card">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Halaman pemesanan
                  </p>
                  <div className="relative mx-auto mt-3 aspect-square w-full max-w-sm overflow-hidden rounded-media border border-line bg-white">
                    <Image
                      src={meta.files.menu.png}
                      alt={`Kode QR menuju ${meta.base}/menu`}
                      fill
                      sizes="(min-width: 1024px) 380px, 90vw"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="mt-3 text-center font-display text-sm font-bold text-ocean">
                    {`${meta.base}/menu`}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <a
                      href={meta.files.menu.svg}
                      download
                      className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/70 px-4 py-2 text-xs font-bold text-ink transition-colors hover:text-ocean"
                    >
                      <Icon name="arrowRight" className="size-4 rotate-90" />
                      SVG (cetak)
                    </a>
                    <a
                      href={meta.files.menu.png}
                      download
                      className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/70 px-4 py-2 text-xs font-bold text-ink transition-colors hover:text-ocean"
                    >
                      <Icon name="arrowRight" className="size-4 rotate-90" />
                      PNG
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-card border border-line bg-card p-5 shadow-card">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Kartu meja siap cetak
                  </p>
                  <div className="relative mt-3 w-full overflow-hidden rounded-media border border-line">
                    <Image
                      src={meta.files.card}
                      alt="Kartu meja berisi kode QR untuk memesan"
                      width={1240}
                      height={1754}
                      sizes="(min-width: 1024px) 560px, 90vw"
                      className="h-auto w-full"
                      unoptimized
                    />
                  </div>
                  <p className="mt-3 text-xs text-ink-muted">
                    {`Ukuran A5 (1240 × 1754 px, 150 dpi). Kirim berkas ini ke percetakan, atau cetak sendiri lalu letakkan di meja.`}
                  </p>
                  <a
                    href={meta.files.card}
                    download
                    className="bg-electric mt-3 inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 focus-visible:outline-white"
                  >
                    <Icon name="arrowRight" className="size-4 rotate-90" />
                    Unduh kartu meja
                  </a>
                </div>

                <div className="mt-4 rounded-card border border-line bg-surface p-4">
                  <p className="text-sm font-bold">Kalau alamat server berubah</p>
                  <ol className="mt-2 flex flex-col gap-1.5 text-sm text-ink-muted">
                    <li>
                      1. Beri komputer kasir alamat tetap (DHCP reservation) di router, agar
                      alamatnya tidak berganti sendiri.
                    </li>
                    <li>
                      {`2. Kalau tetap berubah, jalankan ulang `}
                      <code className="rounded bg-card px-1.5 py-0.5">python tools/make_qr.py</code>
                      {` lalu `}
                      <code className="rounded bg-card px-1.5 py-0.5">npm run build</code>
                      {` dan cetak lagi.`}
                    </li>
                  </ol>
                  <p className="mt-2 text-xs text-ink-muted">
                    Kode QR hanya berisi alamat. Selama servernya menyala di alamat itu, kode
                    yang sudah dicetak tetap berlaku.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <p className="mt-8 text-xs font-bold">
          <Link href="/menu" className="text-ocean underline-offset-4 hover:underline">
            Buka menu
          </Link>
        </p>
      </section>
    </main>
  );
}

/** The module is generated; treat a missing/empty base as "not generated yet". */
function hasQr(): boolean {
  return typeof qrMeta.base === "string" && qrMeta.base.length > 0;
}

/**
 * `generatedAt` is written by `tools/make_qr.py` in local time without a zone
 * suffix, so `new Date()` would read it as UTC and shift the displayed time.
 * Parsing the parts and formatting them by hand keeps what is shown truthful.
 */
function formatGenerated(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day, hour, minute] = match;
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const monthName = months[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthName} ${year}, ${hour}.${minute}`;
}
