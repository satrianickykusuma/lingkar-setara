import Image from "next/image";

import { site } from "@/data/content";

type Props = {
  /** Utility classes for size and placement. */
  className?: string;
  tone?: "ink" | "light";
};

/**
 * Brand lockup: the Lingkar Setara mark plus the wordmark. The mark is the
 * project's own logo asset, so it keeps its colours on both light and dark
 * surfaces instead of being tinted.
 */
export function Brand({ className = "", tone = "ink" }: Props) {
  const wordmark = tone === "light" ? "text-on-brand" : "text-navy";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src={site.logo}
        alt=""
        width={490}
        height={490}
        className="h-12 w-12 shrink-0 object-contain"
      />
      <span className={`font-display text-xl font-extrabold tracking-tight ${wordmark}`}>
        {site.name}
      </span>
    </span>
  );
}
