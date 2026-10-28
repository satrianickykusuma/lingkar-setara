import { Icon } from "@/components/ui/Icon";
import { TutorialPlayer } from "@/components/sections/TutorialPlayer";
import { belajarHero } from "@/data/belajar";

/** Belajar Isyarat banner: headline, accessibility chips and the spotlight slot. */
export function BelajarHero() {
  return (
    <section
      aria-labelledby="belajar-title"
      className="container-page pt-28 pb-10 lg:pt-32"
    >
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-start gap-3 lg:col-span-7">
          <p className="inline-flex flex-wrap items-center gap-2 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
            <Icon name="signLanguage" className="size-4" />
            {belajarHero.badge}
            <span aria-hidden="true" className="text-ink-muted">
              •
            </span>
            <span className="normal-case tracking-normal text-ink-muted">
              {belajarHero.badgeNote}
            </span>
          </p>

          <h1
            id="belajar-title"
            className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl"
          >
            Belajar Isyarat:{" "}
            <span className="text-electric">Pesan Mudah, Terhubung Akrab</span>
          </h1>

          <p className="max-w-2xl text-base text-ink-muted md:text-lg">
            {belajarHero.body}
          </p>

          <ul className="mt-2 flex flex-wrap items-center gap-2">
            {belajarHero.chips.map((chip) => (
              <li
                key={chip.id}
                className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/60 bg-card/80 px-3 py-1.5 text-xs font-bold text-ink"
              >
                <Icon name={chip.icon} className="size-4 text-ocean" />
                {chip.label}
              </li>
            ))}
          </ul>

          <div className="glass-panel mt-4 flex flex-col gap-3 rounded-card border border-line-strong/50 p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
                <Icon name="signLanguage" className="size-6" />
              </span>
              <div>
                <p className="font-display text-sm font-bold leading-tight">
                  {belajarHero.assistTitle}
                </p>
                <p className="text-xs font-bold text-ink-muted">
                  {belajarHero.assistSteps}
                </p>
              </div>
            </div>
            <p className="text-sm text-ink-muted">
              Semua kawan Tuli di kedai menguasai BISINDO. Tidak perlu lancar —
              cukup mencoba, sisanya kami bantu.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <TutorialPlayer
            size="spotlight"
            title={belajarHero.spotlight.heading}
            description={belajarHero.spotlight.title}
            duration={belajarHero.spotlight.duration}
            image={belajarHero.spotlight.poster}
            alt={belajarHero.spotlight.posterAlt}
            icon="playCircle"
            meta={[
              belajarHero.spotlight.timestamp,
              belajarHero.spotlight.speedLabel,
              belajarHero.spotlight.note,
            ]}
          />
        </div>
      </div>
    </section>
  );
}
