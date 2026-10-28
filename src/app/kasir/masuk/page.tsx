import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/kasir/LoginForm";
import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { isAuthConfigured } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk kasir",
  robots: { index: false, follow: false },
};

/**
 * `/kasir/masuk` — the only door into the cashier area.
 *
 * Kept out of the sitemap and unlinked from customer pages: staff reach it by
 * bookmarking `/kasir`, which redirects here when there is no session.
 */
export default function CashierLoginPage() {
  return (
    <main id="main" className="pt-20">
      <section className="container-page section-y relative overflow-x-clip">
        <LineArt
          motif="orbit"
          tone="sage"
          opacity="opacity-25"
          className="top-24 -left-24 hidden size-64 lg:block"
        />

        <div className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-card border border-line bg-card p-6 shadow-card sm:p-8">
          <span className="inline-flex size-14 items-center justify-center rounded-pill bg-ocean-soft text-ocean">
            <Icon name="shieldCheck" className="size-7" />
          </span>

          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-extrabold leading-tight">
              Masuk sebagai kasir
            </h1>
            <p className="text-sm text-ink-muted">
              Halaman ini untuk petugas kedai. Tamu tidak perlu masuk untuk
              memesan.
            </p>
          </div>

          <LoginForm configured={isAuthConfigured()} />

          <p className="border-t border-line pt-4 text-xs text-ink-muted">
            <Link href="/" className="font-bold text-ocean underline-offset-4 hover:underline">
              Kembali ke halaman tamu
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
