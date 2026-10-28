"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/Icon";

/** Signs the device out by clearing the session cookie, then returns to the door. */
export function StaffSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/kasir/sesi", { method: "DELETE" }).catch(() => undefined);
        router.replace("/kasir/masuk");
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/70 px-4 py-2 text-xs font-bold text-ink-muted transition-colors hover:text-ink disabled:opacity-50"
    >
      <Icon name="user" className="size-4" />
      {busy ? "Keluar…" : "Keluar"}
    </button>
  );
}
