import type { Metadata } from "next";
import Link from "next/link";

import { OrderNotFound } from "@/components/sign/OrderNotFound";
import { SignPlayer } from "@/components/sign/SignPlayer";
import { getOrder, getOrderByCode } from "@/server/orders/order-repository";
import { readClipInventory } from "@/server/sign/clip-inventory";
import { compileSignPlan } from "@/server/sign/sign-compiler";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Isyarat pesanan Anda",
  robots: { index: false, follow: false },
};

/**
 * `/pesanan/<kode>` — the **guest's** view of their own order in sign language.
 *
 * This is the only sign screen a customer can reach: read-only, nothing plays on
 * its own, and it exposes no queue, no other order and no status buttons.
 *
 * The cashier equivalent is `/kasir/<kode>`, behind the staff login. The two were
 * one page before; splitting them is what keeps the counter tooling out of the
 * customer's reach.
 */
export default async function GuestOrderPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const decoded = decodeURIComponent(kode);

  const order = (await getOrder(decoded)) ?? (await getOrderByCode(decoded));
  if (!order) {
    return (
      <main id="main" className="pt-20">
        <OrderNotFound code={decoded} />
      </main>
    );
  }

  const inventory = await readClipInventory();
  const { plan } = compileSignPlan(order, {
    available: inventory.videos,
    urls: inventory.videoUrl,
    posterUrls: inventory.posterUrl,
  });

  return (
    <main id="main" className="pt-20">
      <SignPlayer
        identifier={order.code}
        /* Guest mode: nothing auto-plays, no queue, no status controls. */
        autoPlay={false}
        initialPlan={plan}
        initialOrder={{
          code: order.code,
          status: order.status,
          service: order.service,
          payment: order.payment,
          customer: order.customer,
          itemCount: order.itemCount,
          total: order.total,
          createdAt: order.createdAt,
        }}
      />
      <section className="container-page pb-16">
        <p className="rounded-card border border-line bg-surface p-4 text-xs text-ink-muted">
          Halaman ini menampilkan isyarat untuk pesanan Anda sendiri. Petugas kedai
          memakai layar terpisah di perangkat kasir.{" "}
          <Link href="/menu" className="font-bold text-ocean underline-offset-4 hover:underline">
            Pesan lagi
          </Link>
        </p>
      </section>
    </main>
  );
}
