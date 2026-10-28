"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";
import { describeLine } from "@/components/cart/cart-describer";
import {
  formatRupiah,
  lineKey,
  menuById,
  type CartLine,
} from "@/components/cart/cart-store";
import { whatsappHref } from "@/data/content";
import { PORSI_MAX, cartCopy } from "@/data/menu";

/**
 * Slide-over cart. Keeps the reference layout (header, scrollable lines, notes +
 * total footer) and adds the accessibility work the reference lacked:
 * `role="dialog"`/`aria-modal`, Escape to close, body scroll lock and focus that
 * lands inside the panel.
 *
 * Every line shows the choices that were made, and those choices are editable
 * here — a guest who forgot to untick kecap should not have to start over.
 */
export function CartDrawer() {
  const {
    lines,
    itemCount,
    subtotal,
    update,
    decrement,
    remove,
    clear,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  const panelRef = useRef<HTMLDivElement>(null);
  const notesId = useId();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isDrawerOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  const quickOrderHref = buildWhatsappHref(lines, notes, subtotal);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isDrawerOpen ? "opacity-100" : "pointer-events-none invisible opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label={cartCopy.closeLabel}
        onClick={closeDrawer}
        tabIndex={isDrawerOpen ? 0 : -1}
        className="absolute inset-0 h-full w-full cursor-default bg-navy/45 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={cartCopy.title}
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-line-strong/60 bg-surface-base shadow-glow transition-transform duration-300 ease-[var(--ease-brand)] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <Icon name="cart" className="size-5 text-ocean" />
            <h2 className="font-display text-lg font-extrabold">{cartCopy.title}</h2>
            {itemCount > 0 ? (
              <span className="rounded-pill bg-ocean-soft px-2 py-0.5 text-xs font-bold text-ocean">
                {`${itemCount} porsi`}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex size-9 items-center justify-center rounded-pill bg-ocean-soft text-ocean transition-colors hover:bg-line"
          >
            <Icon name="close" className="size-5" />
            <span className="sr-only">{cartCopy.closeLabel}</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="inline-flex size-14 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
                <Icon name="cart" className="size-7" />
              </span>
              <p className="font-display text-base font-extrabold">{cartCopy.emptyTitle}</p>
              <p className="max-w-xs text-sm text-ink-muted">{cartCopy.emptyBody}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {lines.map((line) => {
                const item = menuById[line.id];
                if (!item) return null;
                const key = lineKey(line);

                return (
                  <li key={key} className="flex gap-3 rounded-card border border-line bg-card p-3">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-media">
                      <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display text-sm font-bold leading-snug">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="shrink-0 rounded-btn p-1 text-ink-muted transition-colors hover:text-navy"
                        >
                          <Icon name="trash" className="size-4" />
                          <span className="sr-only">{`Hapus ${item.name}`}</span>
                        </button>
                      </div>

                      <p className="text-xs text-ink-muted">
                        {`${formatRupiah(item.price)} / porsi · ${item.code}`}
                      </p>

                      <LineChoices line={line} onChange={(patch) => update(key, patch)} />

                      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        <div className="inline-flex items-center gap-1 rounded-pill border border-line p-0.5">
                          <button
                            type="button"
                            onClick={() => decrement(key)}
                            className="inline-flex size-7 items-center justify-center rounded-pill text-ocean transition-colors hover:bg-ocean-soft"
                          >
                            <Icon name="minus" className="size-4" />
                            <span className="sr-only">{`Kurangi porsi ${item.name}`}</span>
                          </button>
                          <span className="min-w-8 text-center text-sm font-bold">
                            {`${line.porsi} porsi`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (line.porsi < PORSI_MAX) update(key, { porsi: line.porsi + 1 });
                            }}
                            disabled={line.porsi >= PORSI_MAX}
                            className="inline-flex size-7 items-center justify-center rounded-pill text-ocean transition-colors hover:bg-ocean-soft disabled:opacity-40"
                          >
                            <Icon name="plus" className="size-4" />
                            <span className="sr-only">{`Tambah porsi ${item.name}`}</span>
                          </button>
                        </div>
                        <span className="text-sm font-extrabold text-ocean">
                          {formatRupiah(item.price * line.porsi)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-line bg-surface px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-1">
              <label htmlFor={notesId} className="text-xs font-bold text-ink-muted">
                Catatan untuk dapur (opsional)
              </label>
              <input
                id={notesId}
                type="text"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Contoh: bungkus terpisah, tambah nasi"
                className="w-full rounded-btn border border-line-strong/70 bg-card px-3 py-2 text-sm transition-all focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none"
              />
              <p className="text-[11px] text-ink-muted">
                Catatan bebas tidak punya isyarat; pilihan porsi, rica, kecap, dan suhu di
                atas yang akan ditampilkan di layar kasir.
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-ink-muted">{cartCopy.subtotalLabel}</span>
              <span className="font-display text-xl font-extrabold text-ocean">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <p className="text-xs text-ink-muted">{cartCopy.taxNote}</p>

            <Link
              href="/pembayaran"
              onClick={closeDrawer}
              className="bg-electric inline-flex w-full items-center justify-center gap-2 rounded-pill px-5 py-3 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-white"
            >
              <Icon name="shieldCheck" className="size-5" />
              {cartCopy.payLabel}
              <Icon name="arrowRight" className="size-4" />
            </Link>

            <details className="group">
              <summary className="cursor-pointer list-none text-xs font-bold text-ink-muted underline-offset-4 hover:underline">
                {cartCopy.quickOrderLabel}
              </summary>
              <a
                href={quickOrderHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-pill border border-line-strong/70 px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:text-ocean"
              >
                <Icon name="whatsapp" className="size-5" />
                {cartCopy.checkoutLabel}
              </a>
            </details>

            <button
              type="button"
              onClick={clear}
              className="self-start text-xs font-bold text-ink-muted transition-colors hover:text-ink"
            >
              {cartCopy.clearLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Editable choices for one line. Only the controls the dish supports are shown, so
 * the drawer never offers a choice the sign vocabulary cannot express.
 */
function LineChoices({
  line,
  onChange,
}: {
  line: CartLine;
  onChange: (patch: Partial<CartLine>) => void;
}) {
  const item = menuById[line.id];
  if (!item) return null;
  if (!item.options.chili && !item.options.soy && !item.options.temperature) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
      {item.options.chili ? (
        <div className="inline-flex overflow-hidden rounded-pill border border-line">
          {(["pakai", "tanpa"] as const).map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => onChange({ chili: choice })}
              aria-pressed={line.chili === choice}
              className={`px-2 py-0.5 text-[11px] font-bold transition-colors ${
                line.chili === choice
                  ? "bg-ocean text-on-brand"
                  : "bg-card text-ink-muted hover:text-ink"
              }`}
            >
              {choice === "pakai" ? "Pakai rica" : "Tanpa rica"}
            </button>
          ))}
        </div>
      ) : null}

      {item.options.soy ? (
        <button
          type="button"
          onClick={() => onChange({ soy: !line.soy })}
          aria-pressed={line.soy === true}
          className={`rounded-pill border px-2 py-0.5 text-[11px] font-bold transition-colors ${
            line.soy
              ? "border-ocean bg-ocean text-on-brand"
              : "border-line bg-card text-ink-muted hover:text-ink"
          }`}
        >
          Kecap
        </button>
      ) : null}

      {item.options.temperature ? (
        <div className="inline-flex overflow-hidden rounded-pill border border-line">
          {(["dingin", "hangat"] as const).map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => onChange({ temperature: choice })}
              aria-pressed={line.temperature === choice}
              className={`px-2 py-0.5 text-[11px] font-bold capitalize transition-colors ${
                line.temperature === choice
                  ? "bg-ocean text-on-brand"
                  : "bg-card text-ink-muted hover:text-ink"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Builds a wa.me deep link with the order summary prefilled. */
function buildWhatsappHref(lines: CartLine[], notes: string, subtotal: number): string {
  const rows = lines
    .map((line) => {
      const item = menuById[line.id];
      if (!item) return null;
      return `- ${describeLine(line)} = ${formatRupiah(item.price * line.porsi)}`;
    })
    .filter((row): row is string => row !== null);

  const head = [
    "Halo Kedai Tuli Bersama, saya mau pesan:",
    ...rows,
    "",
    `Subtotal: ${formatRupiah(subtotal)}`,
  ];
  if (notes.trim()) head.push(`Catatan: ${notes.trim()}`);

  return whatsappHref(head.join("\n"));
}
