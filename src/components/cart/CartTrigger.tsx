"use client";

import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";
import { CART_BADGE_ATTR, CART_TARGET_ATTR } from "@/components/cart/cart-fx-events";
import { cartCopy } from "@/data/menu";

/**
 * Header cart button. Before the stored cart is read the count renders as 0, and
 * React patches the text once localStorage has been consulted.
 *
 * The data attributes are the landing target for the fly-to-cart effect and the
 * pulse it triggers; see `CartFX`.
 */
export function CartTrigger({ className = "" }: { className?: string }) {
  const { itemCount, openDrawer } = useCart();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-haspopup="dialog"
      {...{ [CART_TARGET_ATTR]: "" }}
      className={`bg-electric relative inline-flex items-center gap-2 rounded-pill px-4 py-2.5 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 active:scale-95 focus-visible:outline-white ${className}`}
    >
      <Icon name="cart" className="size-5" />
      <span className="hidden sm:inline">Belanja</span>
      <span
        {...{ [CART_BADGE_ATTR]: "" }}
        className="inline-block rounded-pill bg-card px-2 py-0.5 text-xs font-black leading-none text-ocean"
      >
        {itemCount}
      </span>
      <span className="sr-only">
        {itemCount === 0
          ? `${cartCopy.triggerLabel}: kosong`
          : `${cartCopy.triggerLabel}: ${itemCount} item`}
      </span>
    </button>
  );
}
