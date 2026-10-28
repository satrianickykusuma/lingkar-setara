/**
 * Shared contract for the "dish flies into the cart" effect.
 *
 * Any control that adds a dish dispatches one of these events with the element
 * that was clicked. `CartFX` owns the animation, so no interactive component
 * needs to know anything about how the effect is drawn.
 */

export const CART_FLY_EVENT = "lingkar-setara:cart-fly";
export const CART_POP_EVENT = "lingkar-setara:cart-pop";

/** Marks the element the dish should fly into (the header cart button). */
export const CART_TARGET_ATTR = "data-cart-target";
/** Marks the numeric badge inside the cart button. */
export const CART_BADGE_ATTR = "data-cart-badge";

export type CartFlyDetail = {
  /** The button or card that was clicked; the dish flies out of its photo. */
  source: HTMLElement | null;
  /** Dish photo, used when no rendered <img> is available near the source. */
  image: string;
  /** Alt text for the flying clone, kept for assistive contexts. */
  alt: string;
};

/** Ask `CartFX` to fly a dish from `source` into the cart. */
export function requestFlyToCart(detail: CartFlyDetail): void {
  window.dispatchEvent(new CustomEvent<CartFlyDetail>(CART_FLY_EVENT, { detail }));
}

/** Convenience: resolve the photo that sits inside a card. */
export function findCardImage(source: HTMLElement | null): HTMLImageElement | null {
  if (!source) return null;
  return source.closest("article, li")?.querySelector("img") ?? null;
}
