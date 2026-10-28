"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/Icon";

/**
 * Staff sign-in form.
 *
 * Submits to `/api/kasir/sesi` with `fetch` rather than a form action so the
 * failure stays on this page and can be announced inline — a redirect to an error
 * route would lose the typed state and say less.
 */
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/kasir/sesi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? "Gagal masuk. Coba lagi.");
        return;
      }
      // Refresh so the server re-renders the cashier area with the new cookie.
      router.replace("/kasir");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Periksa koneksi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="kasir-password" className="text-sm font-bold">
          Kata sandi kasir
        </label>
        <input
          id="kasir-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "kasir-password-error" : undefined}
          className="w-full rounded-btn border border-line-strong/70 bg-surface-base px-4 py-3 text-sm transition-all focus:border-ocean focus:ring-2 focus:ring-ocean/30 focus:outline-none"
        />
      </div>

      {error ? (
        <p id="kasir-password-error" role="alert" className="text-xs font-bold text-tomato-deep">
          {error}
        </p>
      ) : null}

      {!configured ? (
        <p className="rounded-card border border-line bg-surface p-3 text-xs text-ink-muted">
          {`KASIR_PASSWORD belum diatur di server, jadi pintu ini terkunci untuk semua orang. Tambahkan `}
          <code className="rounded bg-card px-1.5 py-0.5">KASIR_PASSWORD=...</code>
          {` ke `}
          <code className="rounded bg-card px-1.5 py-0.5">.env.local</code>
          {` lalu jalankan ulang server.`}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy || password === "" || !configured}
        className="bg-electric inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-white disabled:opacity-50"
      >
        <Icon name="shieldCheck" className="size-5" />
        {busy ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
