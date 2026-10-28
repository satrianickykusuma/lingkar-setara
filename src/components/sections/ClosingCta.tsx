import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { LineArt } from "@/components/ui/LineArt";
import { closingCta } from "@/data/content";

/** Closing CTA: practical visit details and the two ways to reach the team. */
export function ClosingCta() {
  return (
    <section aria-labelledby="kunjungi-title" className="section-y relative overflow-x-clip">
      <LineArt
        motif="ripples"
        tone="sage"
        opacity="opacity-30"
        className="top-10 -left-24 hidden size-64 lg:block"
      />
      <LineArt
        motif="botanical"
        tone="ocean"
        opacity="opacity-25"
        className="-bottom-6 -right-16 hidden size-72 xl:block"
      />

      {/* A plated set in the margin below the section's cards. */}
      <Ingredient3D
        shape="mushroom"
        volume="mushroom"
        className="-bottom-8 left-4 hidden size-28 rotate-6 xl:block"
      />
      <Ingredient
        shape="eggplant"
        tone="sage"
        opacity="opacity-35"
        className="-bottom-12 right-1/4 hidden size-24 2xl:block"
      />
      <Ingredient
        shape="garlic"
        tone="ocean"
        opacity="opacity-25"
        className="-top-8 -left-16 hidden size-20 2xl:block"
      />

      <div className="container-page">
        <div className="bg-electric relative isolate overflow-hidden rounded-sheet p-8 text-on-brand shadow-glow sm:p-12">
          {/* Soft mint bloom plus line-art for depth without hiding the gradient. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-mint/25 blur-3xl"
          />
          <LineArt
            motif="orbit"
            tone="cream"
            opacity="opacity-25"
            className="-bottom-16 -left-10 size-72"
          />
          <LineArt
            motif="sparkle"
            tone="cream"
            opacity="opacity-20"
            className="-top-8 right-1/3 size-40"
          />

          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col items-start gap-4">
              <p className="eyebrow text-on-brand/80">{closingCta.eyebrow}</p>
              <h2
                id="kunjungi-title"
                className="font-display text-3xl font-extrabold leading-tight sm:text-4xl"
              >
                {closingCta.titleLead} {closingCta.titleAccent}
              </h2>
              <p className="max-w-prose font-body text-base text-on-brand/90">
                {closingCta.body}
              </p>
              <Button
                href="#kontak"
                variant="glass"
                arrow
                className="mt-2 border-white/70 bg-white/90 text-navy hover:bg-white"
              >
                {closingCta.cta.label}
              </Button>
            </div>

            <ul className="glass-panel flex flex-col gap-4 rounded-card border border-white/40 p-6 text-ink">
              <li className="flex items-start gap-3">
                <Icon name="pin" className="mt-0.5 size-5 shrink-0 text-ocean" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Alamat
                  </span>
                  {closingCta.address}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="clock" className="mt-0.5 size-5 shrink-0 text-ocean" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Jam buka
                  </span>
                  {closingCta.hours}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="whatsapp" className="mt-0.5 size-5 shrink-0 text-ocean" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                    WhatsApp
                  </span>
                  {closingCta.whatsapp}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="mail" className="mt-0.5 size-5 shrink-0 text-ocean" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Email
                  </span>
                  {closingCta.email}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
