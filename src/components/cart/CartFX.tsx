"use client";

import { useEffect } from "react";

import {
  CART_BADGE_ATTR,
  CART_FLY_EVENT,
  CART_POP_EVENT,
  CART_TARGET_ATTR,
  findCardImage,
  type CartFlyDetail,
} from "@/components/cart/cart-fx-events";

const FLIGHT_MS = 780;

/**
 * Draws the "dish flies into the cart" effect.
 *
 * A temporary clone of the dish photo is appended to <body> and animated to the
 * header cart button with the Web Animations API. Only `transform` and `opacity`
 * are animated, and the element is removed on finish or cancel, so nothing leaks.
 *
 * Accessibility: motion is opt-in. When the user asks for reduced motion the
 * flight is skipped entirely and only the badge pulse plays, which is a scale
 * change the reduced-motion block in globals.css already neutralises.
 */
export function CartFX() {
  useEffect(() => {
    let running: Animation | null = null;
    let clone: HTMLElement | null = null;

    const cleanup = () => {
      clone?.remove();
      clone = null;
      running = null;
    };

    const pulse = () => {
      const target = document.querySelector<HTMLElement>(`[${CART_TARGET_ATTR}]`);
      const badge = target?.querySelector<HTMLElement>(`[${CART_BADGE_ATTR}]`);
      if (!target || !badge) return;

      // Restart the animation even when a previous pop is still playing.
      for (const el of [target, badge]) {
        el.dataset.pop = "false";
        void el.offsetWidth;
        el.dataset.pop = "true";
      }
      window.setTimeout(() => {
        delete target.dataset.pop;
        delete badge.dataset.pop;
      }, 700);
    };

    const onFly = (event: Event) => {
      const detail = (event as CustomEvent<CartFlyDetail>).detail;
      const target = document.querySelector<HTMLElement>(`[${CART_TARGET_ATTR}]`);
      if (!target) {
        pulse();
        return;
      }

      const source =
        detail.source ?? findCardImage(document.querySelector<HTMLElement>("article"));
      const imageEl = source ? findCardImage(source) : null;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        pulse();
        return;
      }

      // Where the dish is flying from: the card's own photo when it is on screen,
      // otherwise the button that was clicked.
      const from = (imageEl ?? source)?.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      if (!from || from.width === 0) {
        pulse();
        return;
      }

      cleanup();

      const size = Math.min(from.width, from.height);
      const flying = document.createElement("img");
      flying.src = imageEl?.currentSrc || detail.image;
      flying.alt = "";
      flying.setAttribute("aria-hidden", "true");
      flying.className =
        "pointer-events-none fixed z-[60] rounded-full object-cover shadow-card";
      Object.assign(flying.style, {
        left: `${from.left}px`,
        top: `${from.top}px`,
        width: `${size}px`,
        height: `${size}px`,
      });
      clone = flying;
      document.body.appendChild(flying);

      const toX = to.left + to.width / 2 - (from.left + size / 2);
      const toY = to.top + to.height / 2 - (from.top + size / 2);

      running = flying.animate(
        [
          { transform: "translate(0px, 0px) scale(1)", opacity: 0, offset: 0 },
          { transform: "translate(0px, -14px) scale(1.04)", opacity: 1, offset: 0.18 },
          {
            transform: `translate(${toX}px, ${toY}px) scale(0.22)`,
            opacity: 0.85,
            offset: 1,
          },
        ],
        { duration: FLIGHT_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      );

      running.onfinish = () => {
        pulse();
        cleanup();
      };
      running.oncancel = cleanup;
    };

    const onPop = () => pulse();

    window.addEventListener(CART_FLY_EVENT, onFly);
    window.addEventListener(CART_POP_EVENT, onPop);
    return () => {
      window.removeEventListener(CART_FLY_EVENT, onFly);
      window.removeEventListener(CART_POP_EVENT, onPop);
      running?.cancel();
      cleanup();
    };
  }, []);

  return null;
}
