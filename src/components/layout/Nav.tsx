"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/data/content";

type Props = {
  /** Utility classes decide which breakpoint shows this nav. */
  className?: string;
  onNavigate?: () => void;
};

/**
 * Primary navigation. A client component only because it reads the current path
 * to mark the active link; the links themselves stay static.
 */
export function Nav({ className = "", onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className={className}>
      <ul className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-5">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-btn px-2 py-2 text-sm font-bold whitespace-nowrap transition-colors duration-300 lg:py-1 ${
                  isActive
                    ? "text-ocean lg:border-b-2 lg:border-ocean lg:pb-1"
                    : "text-ink-muted hover:text-ocean"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
