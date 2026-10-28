import Image from "next/image";

import { Icon } from "@/components/ui/Icon";
import { videoPlaceholderNote } from "@/data/belajar";

type Props = {
  title: string;
  description: string;
  duration: string;
  image: string;
  alt: string;
  /** Rendered as a chip over the poster, e.g. "Makanan • QB-01". */
  label?: string;
  icon?: React.ComponentProps<typeof Icon>["name"];
  /** Extra chips under the description. */
  meta?: readonly string[];
  /** Larger treatment for the page's spotlight player. */
  size?: "spotlight" | "card";
  /** Real footage, once it exists. Without it the poster stays a still frame. */
  src?: string;
  className?: string;
};

/**
 * Video slot for a sign-language tutorial.
 *
 * No tutorial footage is bundled with this project, so the component renders the
 * poster as a still frame and says so, rather than showing a play button that
 * does nothing. Pass `src` once real footage exists and it renders a real
 * `<video>` element with native controls.
 */
export function TutorialPlayer({
  title,
  description,
  duration,
  image,
  alt,
  label,
  icon = "playCircle",
  meta,
  size = "card",
  src,
  className = "",
}: Props) {
  const isSpotlight = size === "spotlight";

  return (
    <figure
      className={`flex flex-col overflow-hidden rounded-card border border-line-strong/50 bg-card shadow-card ${className}`}
    >
      <div
        className={`relative w-full ${isSpotlight ? "aspect-16/9" : "aspect-16/10"}`}
      >
        {src ? (
          <video
            controls
            preload="metadata"
            poster={image}
            className="absolute inset-0 size-full object-cover"
          >
            <source src={src} type="video/mp4" />
            {`Peramban Anda tidak mendukung pemutar video. ${description}`}
          </video>
        ) : (
          <>
            <Image
              src={image}
              alt={alt}
              fill
              sizes={
                isSpotlight ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, 90vw"
              }
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-navy/70 via-navy/20 to-transparent"
            />

            {label ? (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-pill border border-mint/40 bg-navy/80 px-3 py-1 text-xs font-bold text-on-brand backdrop-blur-sm">
                <Icon name="signLanguage" className="size-4 text-mint" />
                {label}
              </span>
            ) : null}

            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-btn bg-navy/80 px-2.5 py-1 text-xs font-bold text-on-brand backdrop-blur-sm">
              <Icon name="clock" className="size-4 text-mint" />
              {duration}
            </span>

            {/* Marks the absence of footage without promising playback. */}
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-btn bg-card/90 px-2.5 py-1 text-xs font-bold text-ink backdrop-blur-sm">
              <Icon name="play" className="size-4 text-ocean" />
              {`Segera hadir · ${duration}`}
            </span>
          </>
        )}
      </div>

      <figcaption
        className={`flex flex-1 flex-col gap-3 ${isSpotlight ? "p-6" : "p-5"}`}
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
            <Icon name={icon} className="size-5" />
          </span>
          <div>
            <p
              className={`font-display font-extrabold leading-snug ${
                isSpotlight ? "text-xl sm:text-2xl" : "text-base"
              }`}
            >
              {title}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{description}</p>
          </div>
        </div>

        {meta && meta.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-1.5">
            {meta.map((item) => (
              <li
                key={item}
                className="rounded-btn bg-line/60 px-2 py-0.5 text-xs font-bold text-ink-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        {src ? null : (
          <p className="mt-auto flex items-center gap-2 pt-1 text-xs font-bold text-ink-muted">
            <Icon name="playCircle" className="size-4 shrink-0 text-ocean/70" />
            {videoPlaceholderNote}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
