import { menuById, type CartLine } from "@/components/cart/cart-store";

/**
 * Turns a cart line into words.
 *
 * The same phrasing is needed by the drawer, the checkout summary, the success
 * screen and the WhatsApp message, so it lives outside the components to keep the
 * four copies from drifting apart.
 */

/** "Nasi Goreng (2 porsi, pakai rica, kecap)" */
export function describeLine(line: CartLine): string {
  const item = menuById[line.id];
  if (!item) return "";

  const parts = [`${line.porsi} porsi`];
  if (line.chili) parts.push(line.chili === "pakai" ? "pakai rica" : "tanpa rica");
  if (line.soy) parts.push("pakai kecap");
  if (line.temperature) parts.push(line.temperature);

  return `${item.name} (${parts.join(", ")})`;
}

/** "Nasi Goreng · 2 porsi" — for tight spots like a table cell. */
export function describeLineShort(line: CartLine): string {
  const item = menuById[line.id];
  if (!item) return "";
  return `${item.name} · ${line.porsi} porsi`;
}
