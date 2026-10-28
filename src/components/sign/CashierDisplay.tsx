"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { cashierCopy } from "@/data/cashier";
import type { QueueEntry } from "@/server/sign/queue";

type Feed = {
  serverTime: string;
  waitingCount: number;
  next: QueueEntry | null;
  queue: QueueEntry[];
};

const SERVICE_LABEL: Record<string, string> = {
  "dine-in": "Makan di tempat",
  takeaway: "Bawa pulang",
  delivery: "Diantar",
};

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The cashier's idle screen.
 *
 * Long-polls `/api/kasir/antrean` and, the moment an order it has not played
 * yet appears, navigates to that order's sign screen. A screen that has just been
 * opened adopts the oldest waiting order immediately — that is what the counter
 * wants when it is switched on mid-service.
 *
 * The `since` cursor lives in `localStorage`, not React state, so a page reload
 * does not replay orders the staff has already seen.
 */
export function CashierDisplay({ initialFeed }: { initialFeed: Feed }) {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed>(initialFeed);
  const [connected, setConnected] = useState(true);
  const [soundReady, setSoundReady] = useState(false);
  const cursorRef = useRef<string>("");
  const adoptedRef = useRef(false);

  const navigateTo = useCallback(
    (entry: QueueEntry) => {
      window.localStorage.setItem("lingkar-setara:last-seen-order", entry.createdAt);
      router.push(`/kasir/${encodeURIComponent(entry.code)}`);
    },
    [router],
  );

  /** Two-tone chime. Web Audio is used because it needs no asset and cannot 404. */
  const chime = useCallback(() => {
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const context = new Ctor();
      const notes = [880, 1174.66];
      notes.forEach((frequency, position) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        const start = context.currentTime + position * 0.18;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.34);
      });
      window.setTimeout(() => void context.close(), 1200);
    } catch {
      // A blocked or unsupported AudioContext must never break the queue.
    }
  }, []);

  const notify = useCallback(
    (entry: QueueEntry) => {
      if (soundReady) chime();
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(cashierCopy.notified, {
          body: `${entry.code} · ${entry.customer.name} · ${entry.itemCount} item`,
          tag: entry.code,
        });
      }
    },
    [chime, soundReady],
  );

  // Adopt whatever is already waiting on first mount.
  useEffect(() => {
    if (adoptedRef.current) return;
    adoptedRef.current = true;
    cursorRef.current = window.localStorage.getItem("lingkar-setara:last-seen-order") ?? "";
    if (initialFeed.next) navigateTo(initialFeed.next);
  }, [initialFeed.next, navigateTo]);

  // Long-poll loop.
  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;

    const run = async () => {
      while (!cancelled) {
        controller = new AbortController();
        try {
          const since = cursorRef.current;
          const url = since
            ? `/api/kasir/antrean?since=${encodeURIComponent(since)}`
            : "/api/kasir/antrean";
          const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
          if (response.status === 401) {
            // The session expired while this screen sat open. Send the device back
            // to the door rather than polling an endpoint that keeps refusing.
            setConnected(false);
            router.replace("/kasir/masuk");
            return;
          }
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = (await response.json()) as Feed;
          if (cancelled) return;
          setConnected(true);
          setFeed(data);

          const newest = data.queue[0];
          if (newest && Date.parse(newest.createdAt) > Date.parse(cursorRef.current || "0")) {
            cursorRef.current = newest.createdAt;
            notify(newest);
            navigateTo(newest);
            return; // The page is changing; stop the loop.
          }
        } catch (error) {
          if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
          setConnected(false);
          // Back off briefly so a down server is not hammered.
          await new Promise((resolve) => setTimeout(resolve, 4000));
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [navigateTo, notify, router]);

  const enableSound = async () => {
    setSoundReady(true);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission().catch(() => undefined);
    }
    chime();
  };

  const next = feed.next;

  return (
    <section className="container-page section-y relative overflow-x-clip pt-28">
      <LineArt
        motif="orbit"
        tone="sage"
        opacity="opacity-25"
        className="top-24 -left-24 hidden size-64 lg:block"
      />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
            <Icon name="signLanguage" className="size-4" />
            {cashierCopy.eyebrow}
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {cashierCopy.title}
          </h1>
          <p className="max-w-prose text-sm text-ink-muted sm:text-base">
            {cashierCopy.body}
          </p>
        </div>

        <button
          type="button"
          onClick={enableSound}
          aria-pressed={soundReady}
          className={`inline-flex items-center gap-2 rounded-pill px-5 py-3 text-sm font-bold transition-colors ${
            soundReady
              ? "bg-sage text-white"
              : "bg-electric text-on-brand shadow-btn hover:scale-105"
          }`}
        >
          <Icon name={soundReady ? "check" : "play"} className="size-5" />
          {soundReady ? cashierCopy.soundOn : cashierCopy.soundOff}
        </button>
      </header>

      {!soundReady ? (
        <p className="mt-4 rounded-card border border-line bg-surface p-4 text-xs text-ink-muted">
          {cashierCopy.soundBlocked}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Menunggu" value={String(feed.waitingCount)} hint="pesanan aktif" />
        <StatCard
          label="Berikutnya"
          value={next ? next.code : "—"}
          hint={next ? `${next.customer.name} · ${next.itemCount} item` : cashierCopy.queueEmpty}
        />
        <StatCard
          label="Status pantau"
          value={connected ? "Terhubung" : "Terputus"}
          hint={`${cashierCopy.lastChecked} ${formatClock(feed.serverTime)}`}
        />
      </div>

      {next ? (
        <div className="mt-8 rounded-card border-2 border-ocean bg-card p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-ocean">
            {cashierCopy.openQueue}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-extrabold">{next.code}</p>
              <p className="text-sm text-ink-muted">
                {`${next.customer.name} · ${SERVICE_LABEL[next.service] ?? next.service}`}
                {` · ${next.itemCount} porsi · ${formatRupiah(next.total)}`}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {next.signPlayable
                  ? `${next.signReady} dari ${next.signSegments} segmen isyarat siap diputar.`
                  : "Belum ada klip isyarat untuk pesanan ini."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo(next)}
              className="bg-electric inline-flex items-center gap-2 rounded-pill px-6 py-3 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 focus-visible:outline-white"
            >
              <Icon name="play" className="size-5" />
              Tampilkan sekarang
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-card border border-line bg-card p-8 text-center shadow-card">
          <span className="bg-electric mx-auto inline-flex size-14 items-center justify-center rounded-pill text-on-brand">
            <Icon name="signLanguage" className="size-7" />
          </span>
          <h2 className="mt-4 font-display text-xl font-extrabold">{cashierCopy.idleTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{cashierCopy.idleBody}</p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-leaft">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-sage" />
            </span>
            {cashierCopy.watching}
          </p>
          <p className="mt-3 text-xs text-ink-muted">{cashierCopy.noOrdersYet}</p>
        </div>
      )}

      {feed.queue.length > 0 ? (
        <div className="mt-6 rounded-card border border-line bg-card p-5 shadow-card">
          <h2 className="font-display text-base font-bold text-ink">
            {`Antrean (${feed.queue.length})`}
          </h2>
          <ol className="mt-3 flex flex-col divide-y divide-line">
            {feed.queue.map((entry, position) => (
              <li key={entry.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="w-6 text-xs font-black text-ink-muted">{position + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-extrabold">{entry.code}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {`${entry.customer.name} · ${entry.itemCount} item · ${formatRupiah(entry.total)} · ${formatClock(entry.createdAt)}`}
                  </p>
                </div>
                <span
                  className={`rounded-pill px-2.5 py-1 text-xs font-bold ${
                    entry.signPlayable ? "bg-sage/20 text-leaft" : "bg-line/70 text-ink-muted"
                  }`}
                >
                  {entry.signPlayable ? `${entry.signReady} klip` : "belum ada klip"}
                </span>
                <button
                  type="button"
                  onClick={() => navigateTo(entry)}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/70 px-4 py-2 text-xs font-bold text-ink transition-colors hover:text-ocean"
                >
                  <Icon name="play" className="size-4" />
                  Tampilkan
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
      <p className="text-electric mt-1 font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-ink-muted">{hint}</p>
    </div>
  );
}
