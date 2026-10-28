import { Icon } from "@/components/ui/Icon";
import { menuHero } from "@/data/menu";

/** Menu page banner: headline plus the visual-ordering assist card. */
export function MenuHero() {
  return (
    <section
      aria-labelledby="menu-hero-title"
      className="container-page pt-28 pb-8 lg:pt-32"
    >
      <div className="grid items-end gap-6 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-3 lg:col-span-8">
          <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
            <Icon name="eco" className="size-4" />
            {menuHero.badge}
          </p>

          <h1
            id="menu-hero-title"
            className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ocean sm:text-5xl"
          >
            {menuHero.title}
          </h1>

          <p className="max-w-2xl text-base text-ink-muted md:text-lg">{menuHero.body}</p>
        </div>

        <div className="glass-panel flex flex-col gap-3 rounded-card border border-line-strong/50 p-6 shadow-card lg:col-span-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
                <Icon name="signLanguage" className="size-6" />
              </span>
              <div>
                <p className="font-display text-sm font-bold leading-tight">
                  {menuHero.assistTitle}
                </p>
                <p className="text-xs font-bold text-ink-muted">{menuHero.assistSteps}</p>
              </div>
            </div>
            <span
              aria-hidden="true"
              className="size-3 shrink-0 rounded-full bg-sage motion-safe:animate-ping"
            />
          </div>
          <p className="text-sm text-ink-muted">{menuHero.assistBody}</p>
        </div>
      </div>
    </section>
  );
}
