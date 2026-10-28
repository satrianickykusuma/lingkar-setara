import { iconPaths, type IconName } from "@/data/icons";

type Props = {
  name: IconName;
  /** Size and colour utilities, e.g. `size-5 text-ocean`. */
  className?: string;
  /** Stroke width in user units; the set is drawn for 1.5. */
  strokeWidth?: number;
};

/**
 * Outline icon. Decorative by default: the accessible name always comes from the
 * surrounding link, button or text, so the SVG itself is aria-hidden.
 */
export function Icon({ name, className = "size-5", strokeWidth = 1.5 }: Props) {
  const segments = iconPaths[name].split("|");

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {segments.map((segment) => (
        <path key={segment} d={segment} />
      ))}
    </svg>
  );
}
