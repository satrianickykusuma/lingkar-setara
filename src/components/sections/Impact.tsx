import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { LineArt } from "@/components/ui/LineArt";
import { impactSection } from "@/data/content";

/** Impact band: a few honest, checkable numbers plus one guest quote. */
export function Impact() {
  return (
    <section
      id="dampak"
      aria-labelledby="dampak-title"
      className="section-y relative overflow-hidden bg-surface"
    >
      <LineArt
        motif="botanical"
        tone="sage"
        opacity="opacity-35"
        className="top-6 -right-16 hidden size-72 lg:block"
      />
      <LineArt
        motif="orbit"
        tone="ocean"
        opacity="opacity-25"
        className="-bottom-10 -left-20 hidden size-64 xl:block"
      />

      {/* The band's outer margins are wide here, so they take the heavier
          volumes: these sit far from the centred statistic column. */}
      <Ingredient3D
        shape="avocado"
        volume="leaf"
        className="-bottom-6 -left-10 hidden size-28 rotate-6 xl:block"
      />
      <Ingredient
        shape="onion"
        tone="ocean"
        opacity="opacity-30"
        className="top-24 -right-10 hidden size-24 xl:block"
      />
      <Ingredient3D
        shape="tomato"
        volume="tomato"
        className="-bottom-4 right-1/4 hidden size-20 -rotate-6 2xl:block"
      />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{impactSection.eyebrow}</Eyebrow>
          <h2
            id="dampak-title"
            className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
          >
            {impactSection.titleLead}{" "}
            <span className="text-electric">{impactSection.titleAccent}</span>
          </h2>
          <p className="mt-3 font-body text-base text-ink-muted">{impactSection.body}</p>
        </div>

        <dl className="mt-10 grid gap-4 sm:grid-cols-3">
          {impactSection.stats.map((stat) => (
            <div
              key={stat.id}
              className="hover-lift rounded-card bg-card p-6 text-center shadow-card"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="text-electric block font-display text-4xl font-extrabold">
                  {stat.value}
                </span>
                <span
                  aria-hidden="true"
                  className="mt-2 block text-sm font-bold text-ink-muted"
                >
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <figure className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 rounded-card bg-card p-6 text-center shadow-card sm:p-8">
          <Icon name="quote" className="size-8 text-ocean/40" strokeWidth={1.2} />
          <blockquote className="font-display text-lg font-bold leading-relaxed text-ink sm:text-xl">
            &ldquo;{impactSection.quote}&rdquo;
          </blockquote>
          <figcaption className="text-sm font-bold text-ink-muted">
            {impactSection.quoteAuthor}
          </figcaption>
        </figure>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Angka diperbarui setiap kuartal oleh tim kami.
        </p>
      </div>
    </section>
  );
}
