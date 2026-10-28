import {
  PORSI_MAX,
  PORSI_MIN,
  menuById as catalogById,
  type ChiliChoice,
  type MenuItem,
  type TemperatureChoice,
} from "@/data/menu";

/**
 * Cart state, persisted to `localStorage` and read through `useSyncExternalStore`.
 *
 * A line is not just "a dish": the choices are part of its identity, because
 * "nasi goreng, 2 porsi, pakai rica" and "nasi goreng, 1 porsi, tanpa rica" are
 * different things to the kitchen. `lineKey()` is what makes that distinction
 * stable across reloads.
 */

export type CartLine = {
  /** MenuItem.id */
  id: string;
  /** Portions. 1–10 because the vocabulary has one clip per portion. */
  porsi: number;
  /** Savoury food only. */
  chili?: ChiliChoice;
  /** Savoury food only. */
  soy?: boolean;
  /** Drinks only. */
  temperature?: TemperatureChoice;
};

/** A line before it has options, as the catalogue hands it over. */
export type NewCartLine = Pick<CartLine, "id"> &
  Partial<Pick<CartLine, "porsi" | "chili" | "soy" | "temperature">>;

/** The menu catalog indexed by id, so a cart line can always resolve its dish. */
export const menuById: Record<string, MenuItem> = catalogById;

/** Storage key is versioned: the line shape changed when options arrived. */
const STORAGE_KEY = "lingkar-setara:cart:v2";

const EMPTY: CartLine[] = [];

let cachedKey: string | null = null;
let cachedLines: CartLine[] = EMPTY;
let revision = 0;

const listeners = new Set<() => void>();

/**
 * Identity of a line: the dish plus every choice that changes what the kitchen
 * makes. Also the React key and the DOM id used by the drawer's controls.
 */
export function lineKey(line: CartLine): string {
  return [
    line.id,
    `p${line.porsi}`,
    line.chili ?? "-",
    line.soy === undefined ? "-" : line.soy ? "kecap" : "-",
    line.temperature ?? "-",
  ].join("|");
}

/** Clamps and normalises a line against what the dish actually offers. */
function normalise(line: NewCartLine): CartLine | null {
  const item = menuById[line.id];
  if (!item) return null;

  const porsi = Math.min(PORSI_MAX, Math.max(PORSI_MIN, Math.round(line.porsi ?? 1)));

  // A choice the dish does not offer is dropped rather than stored, so the cart
  // can never send the kitchen an option the vocabulary cannot express.
  const chili = item.options.chili ? line.chili ?? "pakai" : undefined;
  const soy = item.options.soy ? line.soy === true : undefined;
  const temperature = item.options.temperature ? line.temperature ?? "hangat" : undefined;

  return { id: item.id, porsi, chili, soy, temperature };
}

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    const lines = parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const candidate = entry as Partial<CartLine>;
      if (typeof candidate.id !== "string") return [];
      // Accept the old `quantity` field so a cart saved before this change is not
      // silently emptied; anything unparseable is dropped.
      const porsi =
        typeof candidate.porsi === "number"
          ? candidate.porsi
          : typeof (candidate as { quantity?: unknown }).quantity === "number"
            ? (candidate as { quantity: number }).quantity
            : 1;
      const line = normalise({
        id: candidate.id,
        porsi,
        chili: candidate.chili,
        soy: candidate.soy,
        temperature: candidate.temperature,
      });
      return line ? [line] : [];
    });

    return lines.length === 0 ? EMPTY : merge(lines);
  } catch {
    return EMPTY;
  }
}

/** Combines duplicate lines that survived a reload. */
function merge(lines: CartLine[]): CartLine[] {
  const byKey = new Map<string, CartLine>();
  for (const line of lines) {
    const key = lineKey(line);
    const existing = byKey.get(key);
    if (existing) {
      existing.porsi = Math.min(PORSI_MAX, existing.porsi + line.porsi);
    } else {
      byKey.set(key, { ...line });
    }
  }
  return [...byKey.values()];
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getCartSnapshot(): CartLine[] {
  const raw = readRaw();
  const key = `${revision}|${raw ?? ""}`;
  if (key !== cachedKey) {
    cachedKey = key;
    cachedLines = parse(raw);
  }
  return cachedLines;
}

export function getServerCartSnapshot(): CartLine[] {
  return EMPTY;
}

function handleExternalChange(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  revision += 1;
  cachedKey = null;
  for (const listener of listeners) listener();
}

export function subscribeToCart(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleExternalChange);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleExternalChange);
  };
}

function write(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* in-memory only */
  }
  revision += 1;
  cachedKey = null;
  for (const listener of listeners) listener();
}

/** Adds a dish, merging into an identical line and summing portions up to ten. */
export function addToCart(input: NewCartLine): void {
  const line = normalise(input);
  if (!line) return;

  const lines = getCartSnapshot();
  const key = lineKey(line);
  const existing = lines.find((entry) => lineKey(entry) === key);

  if (existing) {
    write(
      lines.map((entry) =>
        lineKey(entry) === key
          ? { ...entry, porsi: Math.min(PORSI_MAX, entry.porsi + line.porsi) }
          : entry,
      ),
    );
    return;
  }
  write([...lines, line]);
}

/** Changes an existing line in place; used by the drawer's option controls. */
export function updateCartLine(key: string, patch: Partial<CartLine>): void {
  const lines = getCartSnapshot();
  const index = lines.findIndex((entry) => lineKey(entry) === key);
  if (index === -1) return;

  const current = lines[index];
  const next = normalise({ ...current, ...patch });
  if (!next) return;

  const withoutCurrent = lines.filter((_, position) => position !== index);
  const sameKey = withoutCurrent.find((entry) => lineKey(entry) === lineKey(next));
  const merged = sameKey
    ? withoutCurrent.map((entry) =>
        lineKey(entry) === lineKey(next)
          ? { ...entry, porsi: Math.min(PORSI_MAX, entry.porsi + next.porsi) }
          : entry,
      )
    : [...withoutCurrent, next];

  write(merged);
}

export function decrementCartLine(key: string): void {
  const lines = getCartSnapshot();
  const index = lines.findIndex((entry) => lineKey(entry) === key);
  if (index === -1) return;

  const line = lines[index];
  if (line.porsi <= 1) {
    write(lines.filter((_, position) => position !== index));
    return;
  }
  write(
    lines.map((entry, position) =>
      position === index ? { ...entry, porsi: entry.porsi - 1 } : entry,
    ),
  );
}

export function removeCartLine(key: string): void {
  write(getCartSnapshot().filter((entry) => lineKey(entry) !== key));
}

export function clearCart(): void {
  write([]);
}

export function cartTotals(lines: CartLine[]): { itemCount: number; subtotal: number } {
  return lines.reduce(
    (totals, line) => {
      const item = menuById[line.id];
      if (!item) return totals;
      return {
        itemCount: totals.itemCount + line.porsi,
        subtotal: totals.subtotal + item.price * line.porsi,
      };
    },
    { itemCount: 0, subtotal: 0 },
  );
}

/** "45.000" style grouping, shared by the cart, checkout and summary. */
export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}
