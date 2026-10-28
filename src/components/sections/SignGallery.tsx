"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { TutorialPlayer } from "@/components/sections/TutorialPlayer";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { gallerySection, signVideos, type SignVideoCategory } from "@/data/belajar";

type FilterId = SignVideoCategory | "all";
type ArrowDirection = "left" | "right";

const ARROWS: Record<ArrowDirection, { label: string; icon: "chevronLeft" | "chevronRight" }> = {
  left: { label: "Video sebelumnya", icon: "chevronLeft" },
  right: { label: "Video berikutnya", icon: "chevronRight" },
};

/**
 * Sign-language video gallery. The filter is a real toggle group (`aria-pressed`)
 * and the strip is a native scroll container, so it stays usable with a
 * keyboard, a wheel or a touch screen. With no footage bundled, each card is
 * rendered by `TutorialPlayer` as a labelled still.
 */
export function SignGallery() {
  const [filter, setFilter] = useState<FilterId>("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? signVideos
        : signVideos.filter((video) => video.category === filter),
    [filter],
  );

  return (
    <section
      id="galeri"
      aria-labelledby="galeri-title"
      className="container-page section-y relative"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <Eyebrow>{gallerySection.eyebrow}</Eyebrow>
          <h2
            id="galeri-title"
            className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
          >
            {gallerySection.title}
          </h2>
          <p className="mt-3 text-base text-ink-muted">{gallerySection.body}</p>
        </div>

        <div className="flex items-center gap-2">
          <ScrollButton direction="left" />
          <ScrollButton direction="right" />
        </div>
      </div>

      <ul className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
        {gallerySection.filters.map((option) => {
          const active = filter === option.id;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => setFilter(option.id as FilterId)}
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

      <p aria-live="polite" className="sr-only">
        {`Menampilkan ${visible.length} video tutorial`}
      </p>

      <div
        id="galeri-strip"
        className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pt-1 pb-4 scroll-smooth"
      >
        {visible.map((video) => (
          <TutorialPlayer
            key={video.id}
            title={video.title}
            description={video.description}
            duration={video.duration}
            image={video.image}
            alt={video.alt}
            label={video.label}
            icon={video.icon}
            meta={video.meta}
            src={video.videoSrc}
            className="w-[85%] flex-none snap-start sm:w-[360px]"
          />
        ))}
      </div>
    </section>
  );
}

/** Scrolls the strip; native scrolling stays available regardless. */
function ScrollButton({ direction }: { direction: ArrowDirection }) {
  const { label, icon } = ARROWS[direction];

  return (
    <button
      type="button"
      onClick={() => {
        const strip = document.getElementById("galeri-strip");
        if (!strip) return;
        const amount = Math.max(320, strip.clientWidth * 0.7);
        strip.scrollBy({
          left: direction === "left" ? -amount : amount,
          behavior: "smooth",
        });
      }}
      className="inline-flex size-10 items-center justify-center rounded-pill bg-card text-ink shadow-card transition-all duration-300 hover:bg-ocean hover:text-on-brand"
    >
      <Icon name={icon} className="size-5" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
