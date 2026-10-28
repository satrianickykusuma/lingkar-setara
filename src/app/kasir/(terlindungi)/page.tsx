import type { Metadata } from "next";
import Link from "next/link";

import { CashierDisplay } from "@/components/sign/CashierDisplay";
import { Icon } from "@/components/ui/Icon";
import { cashierCopy } from "@/data/cashier";
import { readQueueSummary } from "@/server/sign/queue";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layar kasir isyarat",
  robots: { index: false, follow: false },
};

/**
 * `/kasir` — the screen the shop leaves open on the counter device.
 *
 * It watches for new orders and moves itself to the sign playback for each one,
 * which is how the seller receives an order as sign language instead of having to
 * go looking for it. The order index lives at `/kasir/daftar`.
 */
export default async function CashierMonitorPage() {
  const feed = await readQueueSummary();

  return (
    <>
      <CashierDisplay initialFeed={feed} />

      <section className="container-page pb-16">
        <div className="rounded-card border border-line bg-surface p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
            <Icon name="clock" className="size-5 text-ocean" />
            {cashierCopy.tutorialLink}
          </h2>
          <ol className="mt-3 flex flex-col gap-2 text-sm text-ink-muted">
            <li>{`1. Buka halaman ini di perangkat kasir, lalu ketuk "${cashierCopy.soundOff}" sekali agar bunyi notifikasi diizinkan peramban.`}</li>
            <li>2. Biarkan tab tetap terbuka dan perangkat tetap menyala. Layar memantau pesanan baru setiap beberapa detik.</li>
            <li>3. Saat pesanan masuk, layar berpindah sendiri dan memutar urutan isyarat. Tidak perlu menekan apa pun.</li>
            <li>4. Setelah pesanan disiapkan, tekan tombol status di layar isyarat agar antrean ikut bersih.</li>
          </ol>
          <p className="mt-4 flex flex-wrap gap-3 text-xs font-bold">
            <Link href="/kasir/daftar" className="text-ocean underline-offset-4 hover:underline">
              Daftar semua pesanan
            </Link>
            <Link href="/kasir/rekaman" className="text-ocean underline-offset-4 hover:underline">
              Progres rekaman isyarat
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
