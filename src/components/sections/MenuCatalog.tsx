"use client";

import Image from "next/image";
import { useDeferredValue, useId, useMemo, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { useCart } from "@/components/cart/CartProvider";
import { requestFlyToCart } from "@/components/cart/cart-fx-events";
import { formatRupiah } from "@/components/cart/cart-store";
import {
  PORSI_MAX,
  PORSI_MIN,
  chiliChoice,
  menuCatalog,
  menuCategories,
  menuFilters,
  menuHero,
  temperatureChoice,
  type ChiliChoice,
  type MenuCategoryId,
  type MenuFilterId,
  type MenuItem,
  type TemperatureChoice,
} from "@/data/menu";

type CategorySelection = MenuCategoryId | "all";

/**
 * Catalogue with category pills, a text search and requirement filters.
 *
 * Each card carries the choices the dish actually supports — portions, rica, kecap,
 * temperature — and every one of those choices has a sign clip behind it. The card
 * therefore doubles as the order form: what you pick here is what the kitchen sees
 * in sign language.
 */
export function MenuCatalog() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MenuFilterId>("all");
  const [category, setCategory] = useState<CategorySelection>("all");
  const searchId = useId();
  const counterId = useId();

  const deferredQuery = useDeferredValue(query);

  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();

    return menuCatalog.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (filter === "chili" && !item.options.chili) return false;
      if (filter === "soy" && !item.options.soy) return false;
      if (filter === "temperature" && !item.options.temperature) return false;
      if (!needle) return true;

      return (
        item.name.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.code.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [category, filter, deferredQuery]);

  const resetAll = () => {
    setQuery("");
    setFilter("all");
    setCategory("all");
  };

  return (
    <section
      id="menu"
      aria-labelledby="katalog-title"
      className="container-page section-y relative overflow-x-clip"
    >
      <Ingredient3D
        shape="onion"
        volume="leaf"
        className="top-1/3 -left-16 hidden size-24 rotate-6 2xl:block"
      />
      <Ingredient
        shape="tomato"
        tone="sage"
        opacity="opacity-30"
        className="-right-16 bottom-1/3 hidden size-24 2xl:block"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-ocean" />
          <h2
            id="katalog-title"
            className="font-display text-sm font-extrabold uppercase tracking-[0.08em] sm:text-base"
          >
            {menuHero.catalogTitle}
          </h2>
        </div>
        <p id={counterId} aria-live="polite" className="text-sm font-bold text-ink-muted">
          {`Menampilkan ${visible.length} dari ${menuCatalog.length} hidangan`}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <label htmlFor={searchId} className="sr-only">
              Cari hidangan
            </label>
            <Icon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-muted"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={menuHero.searchPlaceholder}
              className="w-full rounded-pill border border-line-strong/60 bg-surface py-3 pr-5 pl-11 text-sm font-medium transition-all focus:border-ocean focus:bg-card focus:ring-2 focus:ring-ocean/30 focus:outline-none md:text-base"
            />
          </div>

          <ul className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {menuFilters.map((option) => {
              const active = filter === option.id;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => setFilter(option.id)}
                    aria-pressed={active}
                    title={option.hint}
                    className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                      active
                        ? "border-ocean bg-ocean text-on-brand"
                        : "border-line-strong/60 bg-surface text-ink hover:bg-line/60"
                    }`}
                  >
                    <Icon name={option.icon} className="size-4" />
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <ul className="flex items-center gap-2 overflow-x-auto pb-1">
          {menuCategories.map((option) => {
            const active = category === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setCategory(option.id)}
                  aria-pressed={active}
                  className={`rounded-pill px-5 py-2 text-xs font-bold whitespace-nowrap transition-all active:scale-95 md:text-sm ${
                    active
                      ? "bg-ocean text-on-brand shadow-sm"
                      : "border border-line-strong/60 bg-surface text-ink-muted hover:bg-line/60 hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-card border border-line bg-card p-10 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
            <Icon name="search" className="size-6" />
          </span>
          <p className="font-display text-base font-extrabold">Tidak ada hidangan yang cocok</p>
          <p className="max-w-sm text-sm text-ink-muted">
            Coba kata kunci lain, atau kembalikan filter ke “Semua Menu”.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="mt-1 rounded-pill border-2 border-ocean px-5 py-2.5 text-sm font-bold text-ocean transition-colors hover:bg-ocean-soft"
          >
            Atur ulang filter
          </button>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.id}>
              <MenuCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const { add, isDrawerOpen, openDrawer, closeDrawer } = useCart();

  // The choices being configured on this card, before it is added to the cart.
  const [porsi, setPorsi] = useState(1);
  const [chili, setChili] = useState<ChiliChoice>("pakai");
  const [soy, setSoy] = useState(false);
  const [temperature, setTemperature] = useState<TemperatureChoice>("hangat");

  const optionsId = useId();
  const total = item.price * porsi;

  return (
    <article className="hover-lift flex h-full flex-col overflow-hidden rounded-card border border-line-strong/50 bg-card shadow-card">
      <div className="relative aspect-16/11 w-full">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />

        {item.badge ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-pill border border-mint/50 bg-card/90 px-3 py-1 text-xs font-bold text-leaft backdrop-blur-sm">
            <Icon name={item.badge.icon} className="size-4" />
            {item.badge.label}
          </span>
        ) : null}

        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-btn bg-navy/85 px-2.5 py-1 text-xs font-bold text-on-brand backdrop-blur-md">
          <Icon name="signLanguage" className="size-4 text-mint" />
          {`Kode: ${item.code}`}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-snug">{item.name}</h3>
          <p className="shrink-0 font-display text-base font-extrabold text-ocean">
            {formatRupiah(item.price)}
          </p>
        </div>

        <p className="text-sm text-ink-muted">{item.description}</p>

        <ul className="flex flex-wrap items-center gap-1.5 pt-1">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-btn bg-line/60 px-2 py-0.5 text-xs font-bold text-ink-muted"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div id={optionsId} className="mt-2 flex flex-col gap-2.5 rounded-card bg-surface p-3">
          {/* Portions: the vocabulary has one clip per count, so this is capped. */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-ink-muted">Porsi</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPorsi((value) => Math.max(PORSI_MIN, value - 1))}
                disabled={porsi <= PORSI_MIN}
                className="inline-flex size-7 items-center justify-center rounded-pill border border-line-strong/70 bg-card text-ink transition-colors hover:bg-line/60 disabled:opacity-40"
              >
                <Icon name="minus" className="size-3.5" />
                <span className="sr-only">{`Kurangi porsi ${item.name}`}</span>
              </button>
              <span className="w-8 text-center text-sm font-extrabold" aria-live="polite">
                {porsi}
              </span>
              <button
                type="button"
                onClick={() => setPorsi((value) => Math.min(PORSI_MAX, value + 1))}
                disabled={porsi >= PORSI_MAX}
                className="inline-flex size-7 items-center justify-center rounded-pill border border-line-strong/70 bg-card text-ink transition-colors hover:bg-line/60 disabled:opacity-40"
              >
                <Icon name="plus" className="size-3.5" />
                <span className="sr-only">{`Tambah porsi ${item.name}`}</span>
              </button>
            </div>
          </div>

          {item.options.chili ? (
            <fieldset className="flex items-center justify-between gap-2">
              <legend className="float-left text-xs font-bold text-ink-muted">
                {chiliChoice.question}
              </legend>
              <div className="flex gap-1">
                {chiliChoice.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setChili(option.id)}
                    aria-pressed={chili === option.id}
                    className={`rounded-pill px-2.5 py-1 text-xs font-bold transition-colors ${
                      chili === option.id
                        ? "bg-ocean text-on-brand"
                        : "border border-line-strong/60 bg-card text-ink-muted hover:text-ink"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {item.options.temperature ? (
            <fieldset className="flex items-center justify-between gap-2">
              <legend className="float-left text-xs font-bold text-ink-muted">
                {temperatureChoice.question}
              </legend>
              <div className="flex gap-1">
                {temperatureChoice.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTemperature(option.id)}
                    aria-pressed={temperature === option.id}
                    className={`rounded-pill px-2.5 py-1 text-xs font-bold transition-colors ${
                      temperature === option.id
                        ? "bg-ocean text-on-brand"
                        : "border border-line-strong/60 bg-card text-ink-muted hover:text-ink"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {item.options.soy ? (
            <label className="flex items-center justify-between gap-2 text-xs font-bold text-ink-muted">
              Kecap
              <span className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={soy}
                  onChange={(event) => setSoy(event.target.checked)}
                  className="size-3.5 accent-ocean"
                />
                <span className="text-ink">Pakai kecap</span>
              </span>
            </label>
          ) : null}
        </div>

        <button
          type="button"
          onClick={(event) => {
            add({
              id: item.id,
              porsi,
              chili: item.options.chili ? chili : undefined,
              soy: item.options.soy ? soy : undefined,
              temperature: item.options.temperature ? temperature : undefined,
            });
            // Fly the dish into the cart, and open the drawer straight away so the
            // result is visible even if the animation never runs.
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
          className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-pill bg-ocean px-5 py-2.5 text-sm font-bold text-on-brand transition-all hover:bg-sky active:scale-95 focus-visible:outline-white"
        >
          <Icon name="plus" className="size-4" />
          <span>
            {menuHero.addLabel}
            <span className="font-extrabold">{` · ${formatRupiah(total)}`}</span>
          </span>
          <span className="sr-only">{` ${item.name}, ${porsi} porsi, ke keranjang`}</span>
        </button>
      </div>
    </article>
  );
}
