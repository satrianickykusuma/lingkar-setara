"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Brand } from "@/components/layout/Brand";
import { Nav } from "@/components/layout/Nav";
import { CartTrigger } from "@/components/cart/CartTrigger";
import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { headerChip } from "@/data/content";

/**
 * Persistent glass navigation bar, following the Menu page design: brand, nav,
 * a "Layanan Isyarat & Visual" status chip, the cart button and the mobile menu.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the page behind the mobile panel from scrolling while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [menuOpen]);

  // Escape closes the panel, matching expected keyboard behaviour.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`glass-panel band-gradient-header fixed inset-x-0 top-0 z-50 border-b border-line-strong/40 transition-shadow duration-300 ${
        scrolled ? "shadow-glow" : ""
      }`}
    >
      {/* Ornamental line-art, kept behind the content and out of the way. */}
      <LineArt
        motif="botanical"
        tone="sage"
        opacity="opacity-25"
        className="-top-6 left-1/3 hidden w-64 lg:block"
      />
      <LineArt
        motif="ripples"
        tone="ocean"
        opacity="opacity-20"
        className="-right-6 -bottom-10 hidden w-32 lg:block"
      />

      <div className="container-page relative z-10 flex items-center justify-between gap-3 py-2">
        <Link href="/" onClick={closeMenu} className="shrink-0">
          <Brand />
          <span className="sr-only">Lingkar Setara — kembali ke beranda</span>
        </Link>

        <Nav className="hidden lg:block" />

        <div className="flex shrink-0 items-center gap-2">
          <p className="hidden items-center gap-2 rounded-pill border border-line-strong/60 bg-card/70 px-3 py-1.5 text-xs font-bold text-ink lg:flex">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-sage motion-safe:animate-pulse"
            />
            {headerChip}
          </p>

          <CartTrigger />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-seluler"
            className="inline-flex size-11 items-center justify-center rounded-btn text-ocean transition-colors duration-200 hover:bg-ocean-soft lg:hidden"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="size-6" />
            <span className="sr-only">{menuOpen ? "Tutup menu" : "Buka menu"}</span>
          </button>
        </div>
      </div>

      <div
        id="menu-seluler"
        hidden={!menuOpen}
        className="container-page relative z-10 pb-4 lg:hidden"
      >
        <Nav
          onNavigate={closeMenu}
          className="rounded-card border border-line bg-card/95 p-4 shadow-card backdrop-blur-sm"
        />
        <p className="mt-3 flex items-center gap-2 rounded-btn border border-line-strong/60 bg-card/70 px-3 py-2 text-xs font-bold text-ink">
          <span aria-hidden="true" className="size-2 rounded-full bg-sage" />
          {headerChip}
        </p>
      </div>
    </header>
  );
}
