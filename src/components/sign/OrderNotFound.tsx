import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";

export const metadata: Metadata = {
  title: "Pesanan tidak ditemukan",
  robots: { index: false, follow: false },
};

/**
 * Shown when an order page names a code the server does not have.
 *
 * A bare 404 is a dead end for the two people who actually land here: a guest who
 * tapped "Lihat versi bahasa isyarat" and a cashier who typed a code. Both need to
 * know *why* and what to do next, so this replaces `notFound()` with an
 * explanation and a way forward.
 */
export function OrderNotFound({
  code,
  forStaff = false,
}: {
  code: string;
  /** Shows the cashier shortcuts. Off for guests, on inside the staff area. */
  forStaff?: boolean;
}) {
  return (
    <section className="container-page section-y relative overflow-x-clip pt-28">
      <LineArt
        motif="orbit"
        tone="sage"
        opacity="opacity-25"
        className="top-24 -left-24 hidden size-64 lg:block"
      />

      <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
        <span className="inline-flex size-14 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
          <Icon name="search" className="size-7" />
        </span>

        <h1 className="font-display text-3xl font-extrabold leading-tight">
          Pesanan tidak ditemukan
        </h1>

        <p className="text-sm text-ink-muted">
          {`Kode `}
          <span className="rounded bg-surface px-1.5 py-0.5 font-display font-bold text-ink">
            {code}
          </span>
          {` tidak ada di catatan server ini.`}
        </p>

        <div className="w-full rounded-card border border-line bg-surface p-4">
          <p className="text-sm font-bold">Biasanya karena salah satu hal ini:</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink-muted">
            <li>
              — Pesanan dibuat saat server belum menyala, atau tersimpan di
              peramban berbeda. Versi isyarat hanya bisa dibuka untuk pesanan yang
              tercatat di server.
            </li>
            <li>— Kode pesanan salah ketik, atau berasal dari kedai lain.</li>
            <li>
              — Catatan pesanan di server sudah dibersihkan (misalnya setelah
              pengujian).
            </li>
          </ul>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/menu"
            className="bg-electric inline-flex items-center gap-2 rounded-pill px-6 py-3 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-white"
          >
            Kembali ke menu
          </Link>
          {/*
            Staff links only. A guest's own order page must not advertise the
            cashier area — that URL is not theirs to know.
          */}
          {forStaff ? (
            <>
              <Link
                href="/kasir"
                className="inline-flex items-center gap-2 rounded-pill border border-line-strong/70 px-6 py-3 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
              >
                <Icon name="signLanguage" className="size-5" />
                Layar pantau kasir
              </Link>
              <Link
                href="/kasir/daftar"
                className="inline-flex items-center gap-2 rounded-pill border border-line-strong/70 px-6 py-3 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
              >
                Daftar pesanan terakhir
              </Link>
            </>
          ) : null}
        </div>

        <p className="text-xs text-ink-muted">
          Jika Anda barusan memesan dan kode ini muncul di layar sukses, berarti
          pesanan gagal tercatat di server. Coba kirim ulang pesanan saat koneksi
          stabil.
        </p>
      </div>
    </section>
  );
}
