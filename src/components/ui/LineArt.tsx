type Motif = "ripples" | "botanical" | "wave" | "sparkle" | "orbit";

type Tone = "sage" | "ocean" | "cream";

type Props = {
  motif: Motif;
  /** Absolute-position utilities, e.g. `-top-10 right-8 size-72`. */
  className?: string;
  tone?: Tone;
  /** Tailwind opacity utility; ornamental art stays faint by design. */
  opacity?: string;
  strokeWidth?: number;
};

const TONES: Record<Tone, string> = {
  sage: "var(--color-ornament-sage)",
  ocean: "var(--color-ornament-blue)",
  cream: "var(--color-ornament-cream)",
};

/**
 * Decorative line-art, shared by the header, the footer and the page bodies so
 * the "active whitespace" of the brand spec is filled consistently.
 *
 * Always aria-hidden: none of it carries meaning. Reduced-motion users are
 * unaffected because nothing here animates.
 */
export function LineArt({
  motif,
  className = "",
  tone = "sage",
  opacity = "opacity-40",
  strokeWidth = 2.6,
}: Props) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 200 200"
      fill="none"
      stroke={TONES[tone]}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`pointer-events-none absolute ${opacity} ${className}`}
    >
      {motif === "ripples" && (
        <>
          <path d="M100 20 C100 65 145 100 190 100 C145 100 100 135 100 180 C100 135 55 100 10 100 C55 100 100 65 100 20 Z" strokeDasharray="4 4" />
          <path d="M100 50 C100 75 125 100 150 100 C125 100 100 125 100 150 C100 125 75 100 50 100 C75 100 100 75 100 50 Z" />
          <circle cx="100" cy="100" r="8" />
        </>
      )}

      {motif === "botanical" && (
        <>
          <path d="M20 50 C60 20, 140 80, 180 40" />
          <path d="M20 75 C60 45, 140 105, 180 65" strokeDasharray="5 5" />
          <path d="M20 100 C60 70, 140 130, 180 90" />
          <path d="M20 125 C60 95, 140 155, 180 115" />
          <circle cx="45" cy="35" r="4" fill={TONES[tone]} />
          <circle cx="160" cy="55" r="3.5" fill={TONES[tone]} />
          <circle cx="90" cy="150" r="5" strokeDasharray="3 3" />
        </>
      )}

      {motif === "wave" && (
        <>
          <path d="M20 100 Q60 50, 100 100 T180 100" />
          <path d="M20 120 Q60 70, 100 120 T180 120" strokeDasharray="5 5" />
          <path d="M20 140 Q60 90, 100 140 T180 140" />
          <circle cx="60" cy="45" r="22" strokeDasharray="4 4" />
          <circle cx="60" cy="45" r="11" />
        </>
      )}

      {motif === "sparkle" && (
        <>
          <path d="M100 15 C100 55, 140 95, 180 95 C140 95, 100 135, 100 175 C100 135, 60 95, 20 95 C60 95, 100 55, 100 15 Z" />
          <path
            d="M100 40 C100 70, 125 95, 155 95 C125 95, 100 120, 100 150 C100 120, 75 95, 45 95 C75 95, 100 70, 100 40 Z"
            strokeDasharray="4 4"
          />
        </>
      )}

      {motif === "orbit" && (
        <>
          <circle cx="100" cy="100" r="80" strokeDasharray="5 7" />
          <circle cx="100" cy="100" r="52" />
          <circle cx="100" cy="100" r="22" strokeDasharray="3 5" />
          <path d="M20 100 Q60 50, 100 100 T180 100" />
        </>
      )}
    </svg>
  );
}
