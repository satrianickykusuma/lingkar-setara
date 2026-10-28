"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/components/cart/CartProvider";
import { requestFlyToCart } from "@/components/cart/cart-fx-events";
import { menuItems } from "@/data/content";

/**
 * Signature menu carousel. The only client component besides the Header: it
 * owns scroll state, the arrow buttons and the progress dots.
 *
 * Accessibility: the strip is a native scroll container, so keyboard, wheel and
 * touch all work without JavaScript; the arrows and dots are additive. The dot
 * group only renders once the card count is known (>= 2).
 */
export function MenuCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    setAtStart(scrollLeft <= 4);
    setAtEnd(scrollLeft >= scrollWidth - clientWidth - 4);

    let closest = 0;
    let smallest = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const distance = Math.abs(card.offsetLeft - track.offsetLeft - scrollLeft);
      if (distance < smallest) {
        smallest = distance;
        closest = index;
      }
    });
    setActive(closest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    sync();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.max(320, track.clientWidth * 0.7);
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  const goTo = (index: number) => {
    const track = trackRef.current;
    const card = cardRefs.current[index];
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={trackRef}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pt-1 pb-4 scroll-smooth"
      >
        {menuItems.map((item, index) => (
          <li
            key={item.slug}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            className={`hover-lift relative flex snap-start overflow-hidden rounded-card shadow-card ${
              item.spotlight
                ? "min-h-[380px] w-[300px] flex-none sm:w-[480px]"
                : "w-[280px] flex-none flex-col bg-card sm:w-[330px]"
            }`}
          >
            {item.spotlight ? (
              <>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 640px) 480px, 300px"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/45 to-transparent"
                />
                <div className="relative z-10 mt-auto flex flex-col gap-2 p-6 text-on-brand">
                  {item.badge ? <Badge tone="brand">{item.badge}</Badge> : null}
                  <h3 className="font-display text-2xl font-extrabold">{item.name}</h3>
                  <p className="max-w-md text-sm text-on-brand/90">{item.description}</p>
                  <PriceRow item={item} tone="light" />
                </div>
              </>
            ) : (
              <>
                <div className="relative aspect-16/11 w-full">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 640px) 330px, 280px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-extrabold leading-tight">
                      {item.name}
                    </h3>
                    {item.badge ? <Badge tone="sage">{item.badge}</Badge> : null}
                  </div>
                  <p className="text-sm text-ink-muted">{item.description}</p>
                  <PriceRow item={item} tone="dark" />
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {menuItems.length > 1 ? (
        <div className="mt-2 flex items-center justify-between gap-4">
          <ul className="flex items-center gap-2" role="list">
            {menuItems.map((item, index) => (
              <li key={`dot-${item.slug}`}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-current={index === active ? "true" : undefined}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === active
                      ? "w-8 bg-ocean"
                      : "w-2.5 bg-line-strong hover:bg-ocean/60"
                  }`}
                >
                  <span className="sr-only">{`Pilih kartu ${index + 1}: ${item.name}`}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ArrowButton
              label="Hidangan sebelumnya"
              direction="left"
              disabled={atStart}
              onClick={() => step(-1)}
            />
            <ArrowButton
              label="Hidangan berikutnya"
              direction="right"
              disabled={atEnd}
              onClick={() => step(1)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "brand" | "sage";
}) {
  const styles =
    tone === "brand"
      ? "bg-ocean text-on-brand"
      : "bg-sage/20 text-leaft";
  return (
    <span className={`w-fit rounded-pill px-3 py-1 text-xs font-bold ${styles}`}>
      {children}
    </span>
  );
}

function PriceRow({
  item,
  tone,
}: {
  item: { slug: string; name: string; price: string; priceLabel: string; image: string; alt: string };
  tone: "light" | "dark";
}) {
  const { add, isDrawerOpen, openDrawer, closeDrawer } = useCart();

  return (
    <div className="mt-auto flex items-center justify-between gap-4 pt-3">
      <span
        className={`font-display text-lg font-extrabold ${
          tone === "light" ? "text-mint" : "text-ocean"
        }`}
      >
        <span className="sr-only">{item.priceLabel} — </span>
        {item.price}
      </span>
      <button
        type="button"
        onClick={(event) => {
          add({ id: item.slug });
          requestFlyToCart({
            source: event.currentTarget,
            image: item.image,
            alt: item.alt,
          });
          if (isDrawerOpen) {
            closeDrawer();
          } else {
            openDrawer();
          }
        }}
        className={`inline-flex size-9 items-center justify-center rounded-pill transition-transform duration-200 hover:scale-110 active:scale-95 ${
          tone === "light"
            ? "bg-on-brand/15 text-on-brand hover:bg-on-brand/25"
            : "bg-ocean-soft text-ocean hover:bg-ocean hover:text-on-brand"
        }`}
      >
        <Icon name="plus" className="size-5" />
        <span className="sr-only">{`Tambah ${item.name} ke keranjang`}</span>
      </button>
    </div>
  );
}

function ArrowButton({
  label,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-10 items-center justify-center rounded-pill bg-card text-ink shadow-card transition-all duration-300 hover:bg-ocean hover:text-on-brand disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-ink"
    >
      <Icon name={direction === "left" ? "chevronLeft" : "chevronRight"} className="size-5" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
