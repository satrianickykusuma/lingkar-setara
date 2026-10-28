import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/data/icons";

type Variant = "primary" | "glass" | "link" | "outline";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  /** Trailing → affordance. */
  arrow?: boolean;
  /** Optional leading icon. */
  icon?: IconName;
  className?: string;
};

/**
 * Button set following the Lingkar Setara component spec:
 * primary = Ocean Punch → Mint Electric gradient with a blue glow shadow,
 * glass   = frosted surface with a hairline border,
 * outline = brand-blue outline for quiet secondary actions,
 * link    = blue text that underlines on hover.
 *
 * Filled variants ring in white on focus, because the global focus ring is
 * Ocean Punch and would vanish against the gradient.
 */
const variants: Record<Variant, string> = {
  primary:
    "bg-electric text-on-brand shadow-btn hover:shadow-btn-hover hover:scale-[1.03] focus-visible:outline-white",
  glass:
    "glass-panel text-ocean border border-line-strong/70 hover:border-ocean/50 hover:bg-card/90 focus-visible:outline-ocean",
  outline:
    "border-2 border-ocean text-ocean hover:bg-ocean-soft focus-visible:outline-ocean",
  link: "text-ocean px-0 py-0 hover:text-ocean-deep hover:underline underline-offset-4 focus-visible:outline-ocean",
};

const base =
  "inline-flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ease-[var(--ease-brand)]";

export function Button({
  href,
  children,
  variant = "primary",
  arrow = false,
  icon,
  className = "",
}: Props) {
  const shape =
    variant === "link"
      ? "rounded-btn"
      : variant === "outline"
        ? "rounded-btn px-6 py-3"
        : "rounded-pill px-6 py-3";

  return (
    <Link href={href} className={`${base} ${shape} ${variants[variant]} ${className}`}>
      {icon ? <Icon name={icon} className="size-5" /> : null}
      {children}
      {arrow ? <Icon name="arrowRight" className="size-5" /> : null}
    </Link>
  );
}
