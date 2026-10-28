type Shape =
  | "chili"
  | "garlic"
  | "tomato"
  | "onion"
  | "lemon"
  | "lime"
  | "mushroom"
  | "leaf"
  | "herb"
  | "avocado"
  | "shrimp"
  | "eggplant";

export type IngredientShape = Shape;

/**
 * Cooking-ingredient ornaments, drawn in one hand-authored line style: 200×200
 * box, stroke-only, round caps, no fills.
 *
 * The shapes match the existing `LineArt` motifs (same viewBox and stroke
 * weight) so the two families sit together. Nothing here carries meaning, so
 * every instance is aria-hidden.
 */
export const SHAPES: Record<Shape, string[]> = {
  chili: [
    "M98 42 C92 26 102 18 114 22",
    "M98 42 C66 56 50 92 58 126 C64 154 88 172 112 168 C138 164 152 138 144 108 C136 78 118 48 98 42 Z",
    "M76 84 C70 110 74 138 90 154",
  ],
  garlic: [
    "M100 22 C104 38 104 50 100 60",
    "M100 60 C68 62 48 88 48 122 C48 150 70 174 100 174 C130 174 152 150 152 122 C152 88 132 62 100 60 Z",
    "M100 62 V172",
    "M80 78 C68 96 65 126 74 150",
    "M120 78 C132 96 135 126 126 150",
  ],
  tomato: [
    "M48 108 C48 78 72 58 100 58 C128 58 152 78 152 108 C152 142 128 166 100 166 C72 166 48 142 48 108 Z",
    "M100 60 C98 44 104 34 114 26",
    "M100 60 C94 42 82 34 70 34",
    "M100 60 C114 44 132 38 146 44",
    "M62 84 C50 80 42 70 40 58",
    "M74 74 C64 66 60 56 60 46",
  ],
  onion: [
    "M118 26 C106 20 92 22 80 32",
    "M80 32 C58 52 44 84 46 118 C48 150 72 174 100 174 C128 174 152 150 154 118 C156 84 142 52 118 26 Z",
    "M100 44 V172",
    "M76 58 C62 80 58 118 68 148",
    "M124 58 C138 80 142 118 132 148",
  ],
  lemon: [
    "M100 34 C136 34 166 64 166 100 C166 136 136 166 100 166 C64 166 34 136 34 100 C34 64 64 34 100 34 Z",
    "M100 44 V156",
    "M48 78 L152 122",
    "M152 78 L48 122",
    "M70 50 L130 150",
    "M130 50 L70 150",
  ],
  lime: [
    "M100 188 A88 88 0 0 1 100 12 Z",
    "M100 30 A70 70 0 0 1 100 170",
    "M100 52 A48 48 0 0 1 100 148",
    "M100 30 V170",
  ],
  mushroom: [
    "M40 100 C40 70 66 46 100 46 C134 46 160 70 160 100 C160 108 152 112 142 112 H58 C48 112 40 108 40 100 Z",
    "M100 112 V150 C100 162 110 168 118 164 C124 161 124 152 118 150",
    "M66 74 C78 62 92 56 104 54",
    "M138 88 C142 74 134 62 122 56",
    "M62 122 H138",
  ],
  leaf: [
    "M100 22 C150 56 174 104 158 154 C112 168 62 148 42 110 C26 78 50 42 100 22 Z",
    "M100 22 C112 70 116 116 108 160",
    "M62 74 C84 86 106 94 130 96",
    "M54 108 C74 118 92 124 112 126",
  ],
  herb: [
    "M100 172 C100 122 100 76 100 34",
    "M100 84 C72 74 54 52 52 26 C80 28 100 48 100 84 Z",
    "M100 118 C128 108 146 86 148 60 C120 62 100 82 100 118 Z",
    "M100 150 C76 142 60 124 58 102 C82 104 100 122 100 150 Z",
  ],
  avocado: [
    "M100 30 C128 30 152 66 152 108 C152 146 128 172 100 172 C72 172 48 146 48 108 C48 66 72 30 100 30 Z",
    "M100 106 C112 106 121 116 121 128 C121 140 112 149 100 149 C88 149 79 140 79 128 C79 116 88 106 100 106 Z",
    "M100 30 C98 54 98 80 100 102",
  ],
  shrimp: [
    "M44 106 C48 76 74 60 102 66 C134 72 152 94 150 116 C148 134 132 144 114 140 C100 137 92 124 96 112 C100 102 112 98 120 104",
    "M48 100 C38 92 34 80 38 70",
    "M50 116 C40 118 30 114 24 106",
    "M150 116 C162 120 172 130 174 142",
    "M62 126 C64 138 72 148 84 152",
    "M86 60 C92 48 104 42 116 44",
    "M150 106 C158 100 162 90 160 80",
  ],
  eggplant: [
    "M92 44 C104 30 124 30 136 42",
    "M92 44 C66 60 48 98 56 134 C64 166 96 182 126 174 C156 166 172 132 162 98 C154 70 134 50 92 44 Z",
    "M100 78 C88 106 88 138 100 162",
    "M118 44 C134 34 154 38 164 50",
  ],
};

type Props = {
  shape: Shape;
  /** Absolute-position utilities, e.g. `-left-8 top-10 size-40`. */
  className?: string;
  tone?: "sage" | "ocean" | "cream" | "ink";
  /** Tailwind opacity utility; ornament stays faint by design. */
  opacity?: string;
  strokeWidth?: number;
};

const TONES = {
  sage: "var(--color-ornament-sage)",
  ocean: "var(--color-ornament-blue)",
  cream: "var(--color-ornament-cream)",
  ink: "var(--color-ink)",
} as const;

/**
 * A single ingredient drawn as line art. Purely decorative: it never animates
 * (the audience is accessibility-first, so the motion dial stays low) and it is
 * hidden from assistive tech. Tilt it with a Tailwind `rotate-*` utility rather
 * than a transform prop, so no component needs an inline style.
 */
export function Ingredient({
  shape,
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
      {SHAPES[shape].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
