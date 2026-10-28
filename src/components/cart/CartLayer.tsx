"use client";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartFX } from "@/components/cart/CartFX";
import { FloatingCart } from "@/components/cart/FloatingCart";

/**
 * Mounts the cart drawer, its sticky summary bar and the fly-to-cart effect once
 * for the whole app, so every add-to-cart control stays in sync through the
 * shared cart context.
 */
export function CartLayer() {
  return (
    <>
      <CartFX />
      <FloatingCart />
      <CartDrawer />
    </>
  );
}
