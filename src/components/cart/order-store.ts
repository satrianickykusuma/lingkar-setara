import type { PlacedOrder } from "@/data/checkout";

const STORAGE_KEY = "lingkar-setara:last-order:v1";

let cachedKey: string | null = null;
let cachedOrder: PlacedOrder | null = null;
let revision = 0;

const listeners = new Set<() => void>();

/** Raw stored JSON, or null when storage is unavailable or empty. */
function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): PlacedOrder | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    if (typeof (value as PlacedOrder).code !== "string") return null;
    return value as PlacedOrder;
  } catch {
    return null;
  }
}

/**
 * Snapshot for `useSyncExternalStore`: only changes reference when the stored
 * value or the revision actually changed, which keeps React from looping.
 */
export function getOrderSnapshot(): PlacedOrder | null {
  const raw = readRaw();
  const key = `${revision}|${raw ?? ""}`;
  if (key !== cachedKey) {
    cachedKey = key;
    cachedOrder = parse(raw);
  }
  return cachedOrder;
}

export function getServerOrderSnapshot(): PlacedOrder | null {
  return null;
}

/** Same cache-invalidation requirement as the cart: see `cart-store.ts`. */
function handleExternalChange(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  revision += 1;
  cachedKey = null;
  for (const listener of listeners) listener();
}

export function subscribeToOrder(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleExternalChange);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleExternalChange);
  };
}

export function saveOrder(order: PlacedOrder): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* in-memory only */
  }
  revision += 1;
  cachedKey = null;
  for (const listener of listeners) listener();
}

export function clearOrder(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  revision += 1;
  cachedKey = null;
  for (const listener of listeners) listener();
}

/**
 * Short, human-readable order reference: LS-<day><month>-<random 4>.
 * Not a database key — it only has to be unique enough for a WhatsApp handoff.
 */
export function createOrderCode(now = new Date()): string {
  const stamp = `${String(now.getDate()).padStart(2, "0")}${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `LS-${stamp}-${random}`;
}

/** Rupiah formatting shared with the cart. */
export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}
