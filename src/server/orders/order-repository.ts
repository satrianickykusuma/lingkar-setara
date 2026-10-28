import { randomUUID } from "node:crypto";

import { orderStorage, storageDescription } from "@/server/orders/storage";

/**
 * Order persistence for the sign-language pipeline.
 *
 * This module owns the *shape* of an order and the operations callers use. Where the
 * bytes actually go is decided by `storage/` — a file on a machine with a disk, or
 * Redis on a serverless host. Neither the compiler nor the API routes know which.
 */

export type OrderStatus =
  | "baru"
  | "dikonfirmasi"
  | "disiapkan"
  | "selesai"
  | "dibatalkan";

export type OrderItem = {
  id: string;
  name: string;
  code: string;
  /** Portions ordered. 1–10, because each count has its own sign clip. */
  porsi: number;
  unitPrice: number;
  lineTotal: number;
  /** Savoury choices; absent when the dish does not offer them. */
  chili?: "pakai" | "tanpa";
  soy?: boolean;
  /** Drink choice; absent for food. */
  temperature?: "dingin" | "hangat";
};

export type OrderRecord = {
  id: string;
  /** Human-facing reference printed on the success screen, e.g. LS-0310-8564. */
  code: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  /** Only the two ways of serving that have a recorded sign. */
  service: "makan-sini" | "bawa-pulang";
  customer: { name: string; phone?: string };
  notes?: string;
  /** Kept for the WhatsApp handoff; it has no sign clip, so it is not in the plan. */
  payment: "qris" | "ewallet" | "transfer" | "cash";
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  itemCount: number;
  /** Filled in by the compiler, so the plan is stable once created. */
  signPlanId?: string;
};

export type NewOrder = Omit<
  OrderRecord,
  "id" | "createdAt" | "updatedAt" | "status" | "signPlanId"
> & {
  status?: OrderStatus;
};

export async function createOrder(input: NewOrder): Promise<OrderRecord> {
  const now = new Date().toISOString();
  const record: OrderRecord = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "baru",
    createdAt: now,
    updatedAt: now,
    // Stable per order, so the counter has a durable handle on the plan.
    signPlanId: `plan_${input.code}`,
  };
  await orderStorage().save(record);
  return record;
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  return orderStorage().get(id);
}

/**
 * Look up by the printed code.
 *
 * Codes can legitimately repeat: one is generated per checkout, and a retry produces
 * the same code again. The most recently created record wins, which is the one the
 * counter is looking at.
 */
export async function getOrderByCode(code: string): Promise<OrderRecord | null> {
  const matches = (await orderStorage().list())
    .filter((record) => record.code === code)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  return matches[matches.length - 1] ?? null;
}

/** Newest first, one entry per order. */
export async function listOrders(limit = 50): Promise<OrderRecord[]> {
  const all = await orderStorage().list();
  return [...all]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<OrderRecord, "status" | "signPlanId">>,
): Promise<OrderRecord | null> {
  const current = await orderStorage().get(id);
  if (!current) return null;
  const next: OrderRecord = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await orderStorage().save(next);
  return next;
}

/** Removes an order. Needed for clearing test data and for starting a new service day. */
export async function deleteOrder(id: string): Promise<boolean> {
  return orderStorage().remove(id);
}

/** Empties the store. Returns how many orders were removed. */
export async function deleteAllOrders(): Promise<number> {
  return orderStorage().clear();
}

/** Where orders are kept, for the diagnostic endpoint. */
export function ordersFilePath(): string {
  return storageDescription().describe;
}
