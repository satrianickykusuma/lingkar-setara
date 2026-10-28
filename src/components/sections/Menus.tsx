import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { LineArt } from "@/components/ui/LineArt";
import { MenuCarousel } from "@/components/sections/MenuCarousel";
import { menuSection } from "@/data/content";

/** Signature menu band: heading row, then the scrollable dish carousel. */
export function Menus() {
  return (
    <section
      id="menu"
      aria-labelledby="menu-title"
      className="container-page section-y relative overflow-x-clip"
    >
      <LineArt
        motif="sparkle"
        tone="sage"
        opacity="opacity-30"
        className="-top-6 right-0 hidden size-56 lg:block"
      />
      <LineArt
        motif="wave"
        tone="ocean"
        opacity="opacity-25"
        className="-bottom-8 -left-20 hidden size-64 xl:block"
      />

      <Ingredient
        shape="mushroom"
        tone="sage"
        opacity="opacity-35"
        className="-top-8 -left-20 hidden size-24 xl:block"
      />
      <Ingredient
        shape="shrimp"
        tone="ocean"
        opacity="opacity-30"
        className="-bottom-4 -right-20 hidden size-24 2xl:block"
      />

      <div className="relative rounded-sheet bg-surface px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        {/* Ingredients tucked into the band's empty top-right pocket. */}
        <Ingredient3D
          shape="lime"
          volume="citrus"
          className="bottom-8 right-6 hidden size-20 rotate-6 lg:block"
        />
        <Ingredient
          shape="tomato"
          tone="sage"
          opacity="opacity-30"
          className="right-32 bottom-10 hidden size-16 lg:block"
        />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <Eyebrow>{menuSection.eyebrow}</Eyebrow>
            <h2
              id="menu-title"
              className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
            >
              {menuSection.titleLead}{" "}
              <span className="text-electric">{menuSection.titleAccent}</span>
            </h2>
            <p className="mt-3 font-body text-base text-ink-muted">{menuSection.body}</p>
          </div>

          <Button
            href={menuSection.cta.href}
            variant="outline"
            className="hidden md:inline-flex"
          >
            {menuSection.cta.label}
          </Button>
        </div>

        <MenuCarousel />

        <div className="mt-4 md:hidden">
          <Button href={menuSection.cta.href} variant="outline" className="w-full">
            {menuSection.cta.label}
          </Button>
        </div>

        <p className="mt-2 text-xs text-ink-muted">
          Geser kartu untuk melihat hidangan lain. Harga belum termasuk pajak.
        </p>
      </div>
    </section>
  );
}
