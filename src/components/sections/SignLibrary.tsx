"use client";

import { useMemo, useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { formatClipDuration, signLibrary, type LibraryClip } from "@/data/belajar";

type FilterId = "all" | LibraryClip["category"];

type Group = {
  id: LibraryClip["category"];
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  clips: LibraryClip[];
};

/**
 * The whole recorded vocabulary, playable.
 *
 * The point is self-study: someone can open this page before visiting, watch the
 * sign for a dish, replay it, and arrive already able to order. So every clip is
 * rendered with a real `<video>` and native controls — no custom player to break,
 * no autoplay, and `preload="none"` so 29 clips do not become 105 MB of downloads
 * just because the page was opened.
 *
 * Clips are grouped by category and filtered with `aria-pressed` toggle buttons, so
 * the same structure works for a keyboard and a screen reader.
 */
export function SignLibrary({ clips }: { clips: LibraryClip[] }) {
  const [filter, setFilter] = useState<FilterId>("all");

  const groups = useMemo<Group[]>(() => {
    return signLibrary.filters
      .map((category) => ({
        id: category.id,
        label: category.label,
        icon: category.icon,
        clips: clips.filter((clip) => clip.category === category.id),
      }))
      .filter((group) => group.clips.length > 0);
  }, [clips]);

  const visible = filter === "all" ? groups : groups.filter((group) => group.id === filter);
  const visibleCount = visible.reduce((total, group) => total + group.clips.length, 0);

  return (
    <section
      id="pustaka"
      aria-labelledby="pustaka-title"
      className="container-page section-y relative scroll-mt-24"
    >
      <div className="max-w-2xl">
        <Eyebrow>{signLibrary.eyebrow}</Eyebrow>
        <h2
          id="pustaka-title"
          className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
        >
          {signLibrary.title}
        </h2>
        <p className="mt-3 text-base text-ink-muted">{signLibrary.body}</p>
      </div>

      <ul className="mt-6 flex flex-wrap items-center gap-2">
        <li>
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label={`Semua (${clips.length})`}
          />
        </li>
        {groups.map((group) => (
          <li key={group.id}>
            <FilterButton
              active={filter === group.id}
              onClick={() => setFilter(group.id)}
              label={`${group.label} (${group.clips.length})`}
              icon={group.icon}
            />
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="mt-3 text-sm font-bold text-ink-muted">
        {`Menampilkan ${visibleCount} isyarat`}
      </p>

      <div className="mt-8 flex flex-col gap-10">
        {visible.map((group) => (
          <section key={group.id} aria-labelledby={`grup-${group.id}`}>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-pill bg-surface text-ocean">
                <Icon name={group.icon} className="size-4" />
              </span>
              <h3
                id={`grup-${group.id}`}
                className="font-display text-xl font-extrabold leading-tight sm:text-2xl"
              >
                {group.label}
              </h3>
              <span className="text-xs font-bold text-ink-muted">
                {`${group.clips.length} isyarat`}
              </span>
            </div>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.clips.map((clip) => (
                <li
                  key={clip.id}
                  id={`klip-${clip.id}`}
                  className="hover-lift flex flex-col overflow-hidden rounded-card border border-line-strong/40 bg-card shadow-card scroll-mt-24"
                >
                  {/*
                    The clips are portrait (1080×1920). A 16:9 box with
                    object-cover would crop the top and bottom — exactly where the
                    hands and face are — so the frame is shown whole instead:
                    portrait-ish ratio, object-contain, neutral letterbox.
                  */}
                  <video
                    controls
                    playsInline
                    preload="none"
                    poster={clip.posterSrc}
                    aria-label={`Isyarat ${clip.label} — ${clip.gloss}`}
                    className="aspect-4/5 w-full bg-ink/5 object-contain"
                  >
                    <source src={clip.videoSrc} type="video/mp4" />
                    {`Peramban Anda tidak dapat memutar video isyarat ${clip.label}.`}
                  </video>

                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-base font-bold leading-snug">
                        {clip.label}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-surface px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                        <Icon name="clock" className="size-3" />
                        {formatClipDuration(clip.durationSeconds)}
                      </span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.06em] text-ocean">
                      {clip.gloss}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-card border border-line bg-surface p-5">
        <p className="font-display text-sm font-bold">Cara memakai halaman ini</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {signLibrary.howTo.map((tip) => (
            <li key={tip} className="flex gap-2 text-sm text-ink-muted">
              <Icon name="check" className="mt-0.5 size-4 shrink-0 text-leaft" />
              {tip}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">{signLibrary.note}</p>
      </div>
    </section>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: Parameters<typeof Icon>[0]["name"];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-xs font-bold transition-all active:scale-95 md:text-sm ${
        active
          ? "bg-ocean text-on-brand shadow-sm"
          : "border border-line-strong/60 bg-surface text-ink-muted hover:bg-line/60 hover:text-ink"
      }`}
    >
      {icon ? <Icon name={icon} className="size-4" /> : null}
      {label}
    </button>
  );
}
