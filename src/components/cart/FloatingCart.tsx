"use client";

import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";
import { formatRupiah } from "@/components/cart/cart-store";
import { cartCopy } from "@/data/menu";

/**
 * Sticky summary bar, mirroring the reference page's floating cart. It only
 * appears from `lg` up: on phones the header badge and the drawer already cover
 * the same job, and a fixed bar there would cover the "+ Pesan" button of the
 * first card. Renders nothing while the cart is empty.
 */
export function FloatingCart() {
  const { itemCount, subtotal, clear, openDrawer } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 hidden px-12 lg:block">
      <div className="container-page pointer-events-auto">
        <div className="glass-panel ml-auto flex w-fit items-center gap-4 rounded-card border border-line-strong/60 py-2.5 pr-2.5 pl-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
              <Icon name="cart" className="size-5" />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-pill bg-sage text-[11px] font-black text-white">
                {itemCount}
              </span>
            </span>
            <div>
              <p className="font-display text-sm font-extrabold leading-tight">
                {`${itemCount} pesanan siap dikirim`}
              </p>
              <p className="text-xs font-bold text-ink-muted">
                {`Subtotal: ${formatRupiah(subtotal)}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clear}
            className="rounded-btn px-2 py-1 text-xs font-bold text-ink-muted transition-colors hover:text-ink"
          >
            {cartCopy.clearLabel}
          </button>

          <button
            type="button"
            onClick={openDrawer}
            aria-haspopup="dialog"
            className="bg-electric inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 focus-visible:outline-white"
          >
            Lihat keranjang
            <Icon name="arrowRight" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
