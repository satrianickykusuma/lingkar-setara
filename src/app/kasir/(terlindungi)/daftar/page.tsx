import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { listOrders } from "@/server/orders/order-repository";
import { compileSignPlan, captureStatus } from "@/server/sign/sign-compiler";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Isyarat",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  baru: "Baru",
  dikonfirmasi: "Dikonfirmasi",
  disiapkan: "Disiapkan",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

/**
 * `/kasir` — the counter index: how complete the vocabulary is, plus the recent
 * orders so staff can open any of them in the sign player.
 */
export default async function IsyaratIndexPage() {
  const [orders, status] = await Promise.all([listOrders(12), Promise.resolve(captureStatus())]);

  return (
    <main id="main" className="pt-20">
      <section className="container-page section-y relative overflow-x-clip">
        <LineArt
          motif="orbit"
          tone="sage"
          opacity="opacity-25"
          className="top-24 -left-24 hidden size-64 lg:block"
        />

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
              <Icon name="signLanguage" className="size-4" />
              Ruang isyarat
            </p>
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Pesanan dalam Bahasa Isyarat
            </h1>
            <p className="max-w-prose text-sm text-ink-muted sm:text-base">
              Setiap pesanan diterjemahkan menjadi urutan klip isyarat. Buka satu
              pesanan untuk memutarnya di layar kasir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/kasir"
              className="bg-electric inline-flex items-center gap-2 rounded-pill px-5 py-3 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 focus-visible:outline-white"
            >
              <Icon name="signLanguage" className="size-5" />
              Buka layar pantau
            </Link>
            <Link
              href="/kasir/rekaman"
              className="inline-flex items-center gap-2 rounded-pill border border-line-strong/70 px-5 py-3 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
            >
              <Icon name="playCircle" className="size-5" />
              Progres rekaman
            </Link>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Kosakata" value={String(status.total)} hint="konsep isyarat" />
          <StatCard label="Sudah direkam" value={String(status.ready)} hint="klip siap putar" />
          <StatCard
            label="Menunggu"
            value={String(status.pending)}
            hint={status.pending === 0 ? "kosakata lengkap" : "klip belum diunggah"}
          />
        </div>

        <div className="mt-8 rounded-card border border-line bg-card p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink">Pesanan terakhir</h2>

          {orders.length === 0 ? (
            <p className="mt-3 rounded-card border border-line bg-surface p-6 text-sm text-ink-muted">
              Belum ada pesanan tercatat. Kirim satu lewat halaman pembayaran,
              lalu pesanan itu muncul di sini bersama rencana isyaratnya.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {orders.map((order) => {
                const { plan } = compileSignPlan(order);
                return (
                  <li key={order.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-extrabold">{order.code}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {`${order.customer.name} · ${order.itemCount} item · ${formatRupiah(order.total)} · ${plan.segments.length} segmen isyarat`}
                      </p>
                    </div>
                    <span className="rounded-pill bg-ocean-soft px-2.5 py-1 text-xs font-bold text-ocean">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <Link
                      href={`/kasir/${encodeURIComponent(order.code)}`}
                      className="bg-electric inline-flex items-center gap-2 rounded-pill px-4 py-2 text-xs font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 focus-visible:outline-white"
                    >
                      <Icon name="play" className="size-4" />
                      Putar isyarat
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="mt-4 text-xs text-ink-muted">
          Butuh kode lain? Buka <code className="rounded bg-surface px-1.5 py-0.5">/kasir/&lt;kode pesanan&gt;</code>,
          misalnya <Link href="/kasir/LS-0101-0000" className="underline">/kasir/LS-…</Link>.
        </p>
      </section>
    </main>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
      <p className="text-electric mt-1 font-display text-3xl font-extrabold">{value}</p>
      <p className="text-xs text-ink-muted">{hint}</p>
    </div>
  );
}
