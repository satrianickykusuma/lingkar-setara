import { Icon } from "@/components/ui/Icon";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { LineArt } from "@/components/ui/LineArt";
import { cheatSheet, gestureCards } from "@/data/belajar";

/**
 * Quick-reference glossary. The four gestures are written out rather than played
 * back: there is no tutorial footage in this project, so the card explains the
 * movement instead of offering a button that leads nowhere.
 */
export function CheatSheet() {
  return (
    <section
      id="kamus"
      aria-labelledby="kamus-title"
      className="container-page section-y relative overflow-x-clip"
    >
      <LineArt
        motif="botanical"
        tone="sage"
        opacity="opacity-30"
        className="top-4 -left-24 hidden size-72 lg:block"
      />
      <Ingredient3D
        shape="leaf"
        volume="leaf"
        className="top-1/3 -right-16 hidden size-24 -rotate-12 xl:block"
      />
      <Ingredient
        shape="herb"
        tone="sage"
        opacity="opacity-30"
        className="-bottom-6 -left-16 hidden size-24 2xl:block"
      />

      <div className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
          <Icon name="frontHand" className="size-4" />
          {cheatSheet.eyebrow}
        </p>
        <h2
          id="kamus-title"
          className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
        >
          {cheatSheet.title}
        </h2>
        <p className="mt-3 text-base text-ink-muted">{cheatSheet.body}</p>
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {gestureCards.map((card) => (
          <li
            key={card.id}
            className="hover-lift flex h-full flex-col gap-3 rounded-card border border-line-strong/40 bg-card p-6 shadow-card"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
              <Icon name={card.icon} className="size-6" />
            </span>
            <p className="font-display text-lg font-bold leading-snug">{card.title}</p>
            <p className="text-sm text-ink-muted">{card.description}</p>
            <p className="mt-auto flex items-center gap-2 pt-2 text-xs font-bold text-leaft">
              <Icon name="verified" className="size-4" />
              Praktikkan di kasir
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center font-display text-lg font-bold text-ink-muted">
        {cheatSheet.note}
      </p>
    </section>
  );
}
