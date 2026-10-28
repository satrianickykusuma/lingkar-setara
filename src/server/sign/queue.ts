import { listOrders, type OrderRecord } from "@/server/orders/order-repository";
import { readClipInventory } from "@/server/sign/clip-inventory";
import { compileSignPlan } from "@/server/sign/sign-compiler";

/**
 * Queue helpers for the cashier screen.
 *
 * Shared by the API route and the server-rendered counter pages so "which order
 * is next" is answered in exactly one place — the screen and the endpoint cannot
 * disagree about the queue.
 */

/**
 * Orders that still need someone at the counter to act on them.
 *
 * `disiapkan` is deliberately **not** here: once an order is marked prepared it
 * has left the queue, and leaving it in would keep a finished order on the cashier
 * screen forever. That is what the "Tandai sudah disiapkan" button is for.
 */
export const WAITING_STATUSES: OrderRecord["status"][] = ["baru", "dikonfirmasi"];

export type QueueEntry = {
  id: string;
  code: string;
  status: OrderRecord["status"];
  createdAt: string;
  service: OrderRecord["service"];
  customer: { name: string };
  itemCount: number;
  total: number;
  signSegments: number;
  signReady: number;
  signPending: number;
  signPlayable: boolean;
};

async function toEntry(
  order: OrderRecord,
  inventory: Awaited<ReturnType<typeof readClipInventory>>,
): Promise<QueueEntry> {
  const { plan } = compileSignPlan(order, {
    available: inventory.videos,
    urls: inventory.videoUrl,
    posterUrls: inventory.posterUrl,
  });
  return {
    id: order.id,
    code: order.code,
    status: order.status,
    createdAt: order.createdAt,
    service: order.service,
    customer: { name: order.customer.name },
    itemCount: order.itemCount,
    total: order.total,
    signSegments: plan.segments.length,
    signReady: plan.readyCount,
    signPending: plan.pendingCount,
    signPlayable: plan.readyCount > 0,
  };
}

/** Waiting orders, newest first. The head of this list is what the counter shows. */
export async function readQueue(limit = 40): Promise<QueueEntry[]> {
  const inventory = await readClipInventory();
  const orders = await listOrders(limit);
  const waiting = orders
    .filter((order) => WAITING_STATUSES.includes(order.status))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return Promise.all(waiting.map((order) => toEntry(order, inventory)));
}

export async function readQueueSummary() {
  const queue = await readQueue();
  return {
    serverTime: new Date().toISOString(),
    waitingCount: queue.length,
    next: queue[0] ?? null,
    queue,
  };
}
