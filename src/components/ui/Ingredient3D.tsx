import { SHAPES, type IngredientShape } from "@/components/ui/Ingredient";

export type IngredientVolume = "chili" | "citrus" | "leaf" | "tomato" | "mushroom";

type Props = {
  shape: IngredientShape;
  /** Which depth preset to paint with. */
  volume?: IngredientVolume;
  /** Absolute-position utilities. */
  className?: string;
};

type Recipe = {
  /** Base body colour, mid-tone of the object. */
  base: string;
  /** Shaded edge, used for the gradient's far stop. */
  deep: string;
  /** Interior shading strokes and leaf veins. */
  line: string;
  /** Hue of the soft drop shadow. */
  shadow: string;
};

/**
 * Depth presets. The pigments are desaturated illustration tones from the
 * `Illustration pigments` token block — deliberately muted so the drawings read
 * as part of the sage-and-cream brand rather than a new loud accent.
 */
const RECIPES: Record<IngredientVolume, Recipe> = {
  chili: {
    base: "var(--color-chili)",
    deep: "var(--color-chili-deep)",
    line: "var(--color-chili-deep)",
    shadow: "rgb(150 65 42 / 0.28)",
  },
  citrus: {
    base: "var(--color-citrus)",
    deep: "var(--color-citrus-deep)",
    line: "var(--color-citrus-deep)",
    shadow: "rgb(187 143 40 / 0.26)",
  },
  leaf: {
    base: "var(--color-leaf-fill)",
    deep: "var(--color-leaf-deep)",
    line: "var(--color-leaf-deep)",
    shadow: "rgb(111 143 86 / 0.26)",
  },
  tomato: {
    base: "var(--color-tomato)",
    deep: "var(--color-tomato-deep)",
    line: "var(--color-tomato-deep)",
    shadow: "rgb(151 66 58 / 0.26)",
  },
  mushroom: {
    base: "var(--color-mushroom)",
    deep: "var(--color-mushroom-deep)",
    line: "var(--color-mushroom-deep)",
    shadow: "rgb(166 141 106 / 0.28)",
  },
};

/**
 * Volume treatment of the same ingredients: a two-stop body gradient, a soft
 * offset contact shadow, a bright rim on the lit edge and interior shading.
 *
 * This is vector shading, not a rendered 3D asset — it gives the ornaments
 * depth without pulling generated raster images into the bundle. Opacity is set
 * through a wrapper style so it composites as a group (path-level opacity would
 * make the overlaps visible).
 */
export function Ingredient3D({
  shape,
  volume = "leaf",
  className = "",
}: Props) {
  const [body, ...detail] = SHAPES[shape];
  const recipe = RECIPES[volume];
  const id = `${shape}-${volume}`;

  return (
    <span className={`ornament-group pointer-events-none absolute block ${className}`}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 200 200"
        fill="none"
        className="size-full"
      >
        <defs>
          <linearGradient id={`${id}-body`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor={recipe.base} />
            <stop offset="100%" stopColor={recipe.deep} />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="0.34" cy="0.28" r="0.6">
            <stop offset="0%" stopColor="var(--color-cream)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-cream)" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-blur`} x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* Contact shadow, offset down-right as if lit from the upper left. */}
        <path
          d={body}
          fill={recipe.shadow}
          filter={`url(#${id}-blur)`}
          transform="translate(5 8)"
        />

        <path d={body} fill={`url(#${id}-body)`} />
        <path d={body} fill={`url(#${id}-glow)`} />

        {/* Rim light along the upper-left edge. */}
        <path
          d={body}
          stroke="var(--color-cream)"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.85}
        />

        {/* Interior shading: leaf veins, clove lines, tomato ridges. */}
        <g stroke={recipe.line} strokeWidth={2.2} strokeLinecap="round" opacity={0.45}>
          {detail.map((path) => (
            <path key={path} d={path} />
          ))}
        </g>
      </svg>
    </span>
  );
}
