import type { Metadata } from "next";

import { MenuCatalog } from "@/components/sections/MenuCatalog";
import { MenuHero } from "@/components/sections/MenuHero";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Katalog hidangan Lingkar Setara: mangkuk sehat, roti panggang, camilan segar, dan minuman kreatif. Pesan dengan bahasa isyarat, tulisan, atau suara.",
};

export default function MenuPage() {
  return (
    <main id="main" className="relative overflow-hidden pt-20">
      <Ornaments />
      <div className="relative z-10">
        <MenuHero />
        <MenuCatalog />
      </div>
    </main>
  );
}

/** Cream-and-blue line-art ornaments, matching the reference menu page. */
function Ornaments() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute -top-16 right-1/4 size-72 opacity-50"
        fill="none"
        stroke="var(--color-ornament-blue)"
        strokeWidth={2.8}
      >
        <path
          d="M100 20 C100 65 145 100 190 100 C145 100 100 135 100 180 C100 135 55 100 10 100 C55 100 100 65 100 20 Z"
          strokeDasharray="4 4"
        />
        <path d="M100 50 C100 75 125 100 150 100 C125 100 100 125 100 150 C100 125 75 100 50 100 C75 100 100 75 100 50 Z" />
        <circle cx="100" cy="100" r="8" strokeWidth={2.5} />
      </svg>

      <svg
        viewBox="0 0 200 200"
        className="absolute top-1/4 -left-20 size-80 opacity-50"
        fill="none"
        stroke="var(--color-ornament-sage)"
        strokeWidth={2.6}
      >
        <path d="M20 50 C60 20, 140 80, 180 40" />
        <path d="M20 75 C60 45, 140 105, 180 65" strokeDasharray="5 5" />
        <path d="M20 100 C60 70, 140 130, 180 90" />
        <path d="M20 125 C60 95, 140 155, 180 115" />
        <circle cx="45" cy="35" r="4" fill="var(--color-ornament-sage)" />
        <circle cx="160" cy="55" r="3.5" fill="var(--color-ornament-sage)" />
        <circle cx="90" cy="150" r="5" strokeDasharray="3 3" />
      </svg>

      <svg
        viewBox="0 0 240 240"
        className="absolute top-1/2 -right-16 size-80 opacity-50"
        fill="none"
        stroke="var(--color-ornament-blue)"
        strokeWidth={2.6}
      >
        <path d="M20 120 Q60 60, 120 120 T220 120" />
        <path d="M20 140 Q60 80, 120 140 T220 140" strokeDasharray="5 5" />
        <path d="M20 160 Q60 100, 120 160 T220 160" />
        <circle cx="70" cy="50" r="24" strokeDasharray="4 4" />
        <circle cx="70" cy="50" r="12" />
      </svg>

      <svg
        viewBox="0 0 180 180"
        className="absolute bottom-40 left-12 size-64 opacity-40"
        fill="none"
        stroke="var(--color-ornament-blue)"
        strokeWidth={2.6}
      >
        <path d="M90 10 C90 50, 130 90, 170 90 C130 90, 90 130, 90 170 C90 130, 50 90, 10 90 C50 90, 90 50, 90 10 Z" />
        <path
          d="M90 35 C90 65, 115 90, 145 90 C115 90, 90 115, 90 145 C90 115, 65 90, 35 90 C65 90, 90 65, 90 35 Z"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}
