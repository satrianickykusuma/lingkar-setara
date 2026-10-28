import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Ingredient } from "@/components/ui/Ingredient";
import { Ingredient3D } from "@/components/ui/Ingredient3D";
import { LineArt } from "@/components/ui/LineArt";
import { story } from "@/data/content";

/** Story band: editorial copy plus two offset photos of the team and room. */
export function Story() {
  return (
    <section id="cerita" aria-labelledby="cerita-title" className="section-y relative overflow-x-clip">
      {/* Ornamental line-art plus a blurred accent, filling the margins. */}
      <LineArt
        motif="wave"
        tone="ocean"
        opacity="opacity-25"
        className="top-10 -left-24 hidden size-72 lg:block"
      />
      <LineArt
        motif="ripples"
        tone="sage"
        opacity="opacity-30"
        className="right-0 bottom-4 hidden size-52 xl:block"
      />

      {/* Ingredients sit low in the wide right margin, below the photo pair, so
          they never tangle with the images or the value list. */}
      <Ingredient
        shape="garlic"
        tone="sage"
        opacity="opacity-40"
        className="-bottom-4 -right-16 hidden size-24 xl:block"
      />
      <Ingredient3D
        shape="chili"
        volume="chili"
        className="right-8 -bottom-2 hidden size-20 rotate-12 2xl:block"
      />
      <Ingredient
        shape="leaf"
        tone="ocean"
        opacity="opacity-30"
        className="bottom-28 -left-20 hidden size-24 2xl:block"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-0 size-96 -translate-y-1/2 rounded-full bg-ocean/5 blur-3xl"
      />

      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow>{story.eyebrow}</Eyebrow>
          <h2
            id="cerita-title"
            className="font-display text-3xl font-extrabold leading-tight sm:text-4xl"
          >
            {story.titleLead} <span className="text-electric">{story.titleAccent}</span>
          </h2>

          {story.paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-prose font-body text-base text-ink-muted">
              {paragraph}
            </p>
          ))}

          <Button href={story.cta.href} variant="link" arrow className="mt-2">
            {story.cta.label}
          </Button>

          <ul className="mt-4 flex flex-col gap-4 border-t border-line pt-6">
            {story.values.map((value) => (
              <li key={value.id} className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-btn bg-ocean-soft text-ocean">
                  <Icon name={value.icon} className="size-6" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold">{value.title}</p>
                  <p className="text-sm text-ink-muted">{value.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Two offset photos: matches the source layout, with the hover-lift the
            brand spec asks for. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="pt-8 sm:pt-12">
            <div className="hover-lift relative aspect-3/4 overflow-hidden rounded-media shadow-card">
              <Image
                src={story.streetImage}
                alt={story.streetAlt}
                fill
                sizes="(min-width: 1024px) 25vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <div className="hover-lift relative aspect-3/4 overflow-hidden rounded-media shadow-card">
              <Image
                src={story.roomImage}
                alt={story.roomAlt}
                fill
                sizes="(min-width: 1024px) 25vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
