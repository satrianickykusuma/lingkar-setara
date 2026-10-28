"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  addToCart,
  cartTotals,
  clearCart,
  decrementCartLine,
  getCartSnapshot,
  getServerCartSnapshot,
  removeCartLine,
  subscribeToCart,
  updateCartLine,
  type CartLine,
  type NewCartLine,
} from "@/components/cart/cart-store";

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  /** Adds a dish with its choices; identical choices merge into one line. */
  add: (line: NewCartLine) => void;
  /** Changes portions or choices of an existing line, identified by `lineKey`. */
  update: (key: string, patch: Partial<CartLine>) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart state shared by the header badge, the floating summary bar and the drawer.
 *
 * The persisted lines live in an external store (`cart-store.ts`) read through
 * `useSyncExternalStore`, so React stays in sync with localStorage without setting
 * state from an effect. The drawer's open flag is plain component state.
 *
 * Lines are addressed by `lineKey` rather than by dish id, because two lines of the
 * same dish can differ in portions, rica or kecap.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const add = useCallback((line: NewCartLine) => addToCart(line), []);
  const update = useCallback((key: string, patch: Partial<CartLine>) => updateCartLine(key, patch), []);
  const decrement = useCallback((key: string) => decrementCartLine(key), []);
  const remove = useCallback((key: string) => removeCartLine(key), []);
  const clear = useCallback(() => clearCart(), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const { itemCount, subtotal } = useMemo(() => cartTotals(lines), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount,
      subtotal,
      add,
      update,
      decrement,
      remove,
      clear,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      lines,
      itemCount,
      subtotal,
      add,
      update,
      decrement,
      remove,
      clear,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Announces cart changes to assistive tech without stealing focus. */}
      <p aria-live="polite" className="sr-only">
        {itemCount === 0 ? "Keranjang kosong" : `${itemCount} porsi di keranjang`}
      </p>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus dipakai di dalam <CartProvider>");
  }
  return context;
}
