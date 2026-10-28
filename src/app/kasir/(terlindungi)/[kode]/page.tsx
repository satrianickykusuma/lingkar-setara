import type { Metadata } from "next";

import { OrderNotFound } from "@/components/sign/OrderNotFound";
import { SignPlayer } from "@/components/sign/SignPlayer";
import { getOrder, getOrderByCode } from "@/server/orders/order-repository";
import { readClipInventory } from "@/server/sign/clip-inventory";
import { readQueue } from "@/server/sign/queue";
import { compileSignPlan } from "@/server/sign/sign-compiler";

type Props = {
  params: Promise<{ kode: string }>;
  searchParams: Promise<{ layar?: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Isyarat pesanan",
  robots: { index: false, follow: false },
};

/**
 * `/kasir/LS-0310-8564` — the sign playback for one order, for staff.
 *
 * Primarily a **counter screen**: it plays the sequence by itself and lets staff
 * advance the kitchen status. The guest's own copy of this screen lives at `/pesanan/<kode>`, which is
 * read-only and does not auto-play.
 *
 * Accepts the printed code or the internal id — the printed one is the point,
 * since that is what is on the receipt and what the cashier screen navigates to.
 */
export default async function SignScreenPage({ params, searchParams }: Props) {
  const [{ kode }, { layar }] = await Promise.all([params, searchParams]);
  const decoded = decodeURIComponent(kode);

  const order = (await getOrder(decoded)) ?? (await getOrderByCode(decoded));

  // Unknown code: explain it instead of a bare 404, and offer the staff a way
  // back into the tools they were using.
  if (!order) {
    return (
      <main id="main" className="pt-20">
        <OrderNotFound code={decoded} forStaff />
      </main>
    );
  }

  const inventory = await readClipInventory();
  const { plan } = compileSignPlan(order, {
    available: inventory.videos,
    urls: inventory.videoUrl,
    posterUrls: inventory.posterUrl,
  });

  // Learning mode is the opt-in: everything else is the counter behaving on its
  // own. A finished order stops auto-playing because there is nothing to prepare.
  const autoPlay = layar !== "belajar" && order.status !== "selesai";

  const queue = await readQueue();
  const position = queue.findIndex((entry) => entry.id === order.id);
  const upcoming = position >= 0 ? queue.slice(position + 1) : queue;

  return (
    <main id="main" className="pt-20">
      <SignPlayer
        identifier={order.code}
        autoPlay={autoPlay}
        queue={upcoming.map((entry) => ({
          code: entry.code,
          customer: entry.customer,
          itemCount: entry.itemCount,
          signPlayable: entry.signPlayable,
        }))}
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
    </main>
  );
}
