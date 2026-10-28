import type { OrderRecord } from "@/server/orders/order-repository";

/**
 * Storage contract for orders.
 *
 * The app has to run in two very different places:
 *
 * - **A machine with a disk** (the shop's own computer, a VPS, this repository
 *   locally) where an append-only file is simple and free.
 * - **Serverless** (Netlify, Vercel) where the filesystem is read-only and every
 *   invocation may be a fresh container, so anything written to disk is lost.
 *
 * Both implement this interface, and nothing above it knows which is in use.
 */
export type OrderStorage = {
  /** Human-readable description, shown by the diagnostic endpoint. */
  readonly describe: string;
  /** Every order, one entry per id (latest revision wins). */
  list(): Promise<OrderRecord[]>;
  get(id: string): Promise<OrderRecord | null>;
  /** Inserts or replaces the whole record. */
  save(record: OrderRecord): Promise<void>;
  remove(id: string): Promise<boolean>;
  clear(): Promise<number>;
};

/** Latest record wins, in first-seen order — shared by both backends. */
export function collapseById(records: OrderRecord[]): OrderRecord[] {
  const byId = new Map<string, OrderRecord>();
  for (const record of records) byId.set(record.id, record);
  return [...byId.values()];
}
