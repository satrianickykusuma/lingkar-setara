import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StaffSignOut } from "@/components/kasir/StaffSignOut";
import { Icon } from "@/components/ui/Icon";
import { hasStaffSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kasir",
  robots: { index: false, follow: false },
};

/**
 * Gate and chrome for the whole cashier area.
 *
 * Every `/kasir/**` page renders inside this layout, so the session check happens
 * once and cannot be forgotten on a new page, and the staff toolbar is defined
 * once rather than repeated per screen.
 *
 * Nothing under `/kasir` is linked from a customer page: staff reach it by
 * bookmarking `/kasir`, which sends them here when there is no session.
 */
export default async function CashierLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasStaffSession())) redirect("/kasir/masuk");

  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-2.5">
          <nav className="flex flex-wrap items-center gap-2" aria-label="Alat kasir">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-ocean px-3 py-1.5 text-xs font-bold text-on-brand">
              <Icon name="shieldCheck" className="size-4" />
              Area kasir
            </span>
            <Link
              href="/kasir/daftar"
              className="rounded-pill px-3 py-1.5 text-xs font-bold text-ink-muted transition-colors hover:bg-card hover:text-ink"
            >
              Layar pantau
            </Link>
            <Link
              href="/kasir/rekaman"
              className="rounded-pill px-3 py-1.5 text-xs font-bold text-ink-muted transition-colors hover:bg-card hover:text-ink"
            >
              Progres rekaman
            </Link>
          </nav>
          <StaffSignOut />
        </div>
      </div>
      {children}
    </>
  );
}
