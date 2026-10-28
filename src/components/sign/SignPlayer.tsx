"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { LineArt } from "@/components/ui/LineArt";
import { cashierCopy } from "@/data/cashier";

/**
 * Counter-side sign player.
 *
 * Two audiences share this component:
 *
 * - **Cashier mode** (`autoPlay`, used by `/kasir/<kode>`) starts on the first segment that
 *   has a recording, advances by itself, skips segments with no clip and loops,
 *   so the person at the till reads an order without touching anything.
 * - **Guest mode** (`autoPlay={false}`, used by `/pesanan/<kode>`) is the same screen
 *   minus the automatic behaviour, the queue and the status buttons.
 *
 * A segment whose file is missing is reported as `pending` by the API and shown
 * as an explicit slot, so a half-finished vocabulary still plays what exists.
 */

type Segment = {
  order: number;
  glossId: string;
  category: string;
  label: string;
  glossNotation: string;
  videoSrc: string;
  posterSrc: string;
  durationMs: number;
  status: "ready" | "pending";
  caption?: string;
};

type Plan = {
  orderId: string;
  orderCode: string;
  segments: Segment[];
  totalDurationMs: number;
  readyCount: number;
  pendingCount: number;
  complete: boolean;
};

type OrderStatus = "baru" | "dikonfirmasi" | "disiapkan" | "selesai" | "dibatalkan";

type OrderSummary = {
  code: string;
  status: OrderStatus;
  service: string;
  payment: string;
  customer: { name: string };
  tableNumber?: string;
  itemCount: number;
  total: number;
  createdAt: string;
};

type QueueItem = {
  code: string;
  customer: { name: string };
  itemCount: number;
  signPlayable: boolean;
};

type Props = {
  /** Internal order id or the printed code. */
  identifier: string;
  initialPlan: Plan;
  initialOrder: OrderSummary;
  /** Cashier screens play by themselves and can advance the kitchen status. */
  autoPlay?: boolean;
  /** Other orders still waiting, so the counter knows what is coming. */
  queue?: QueueItem[];
};

const SERVICE_LABEL: Record<string, string> = {
  "dine-in": "Makan di tempat",
  takeaway: "Bawa pulang",
  delivery: "Diantar",
};

const PAYMENT_LABEL: Record<string, string> = {
  qris: "QRIS",
  ewallet: "E-wallet",
  transfer: "Transfer bank",
  cash: "Tunai",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  baru: "Baru",
  dikonfirmasi: "Dikonfirmasi",
  disiapkan: "Disiapkan",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function SignPlayer({
  identifier,
  initialPlan,
  initialOrder,
  autoPlay = true,
  queue = [],
}: Props) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [order, setOrder] = useState<OrderSummary>(initialOrder);

  const firstPlayable = useMemo(
    () => initialPlan.segments.findIndex((segment) => segment.status === "ready"),
    [initialPlan.segments],
  );

  // Cashier mode opens straight on a segment that can actually be played, rather
  // than on a "rekaman belum tersedia" slot.
  const [index, setIndex] = useState(autoPlay && firstPlayable > 0 ? firstPlayable : 0);
  const [playing, setPlaying] = useState(autoPlay && firstPlayable >= 0);
  const [missing, setMissing] = useState<string[]>(() =>
    initialPlan.segments.filter((segment) => segment.status === "pending").map((s) => s.glossId),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  const current = plan.segments[index];
  const isMissing = current ? missing.includes(current.glossId) : false;

  const nextPlayableFrom = useCallback(
    (from: number): number => {
      if (plan.segments.length === 0) return -1;
      for (let offset = 1; offset <= plan.segments.length; offset += 1) {
        const candidate = (from + offset) % plan.segments.length;
        const segment = plan.segments[candidate];
        if (segment && !missing.includes(segment.glossId)) return candidate;
      }
      return -1;
    },
    [missing, plan.segments],
  );

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(plan.segments.length - 1, next)));
    },
    [plan.segments.length],
  );

  const handleEnded = useCallback(() => {
    if (!playing) return;
    const next = nextPlayableFrom(index);
    if (next === -1) {
      setPlaying(false); // Nothing playable at all.
      return;
    }
    goTo(next);
  }, [goTo, index, nextPlayableFrom, playing]);

  const handleError = useCallback(() => {
    if (!current) return;
    setMissing((entries) =>
      entries.includes(current.glossId) ? entries : [...entries, current.glossId],
    );
    if (!playing) return;
    const next = nextPlayableFrom(index);
    if (next === -1) setPlaying(false);
    else if (next !== index) goTo(next);
  }, [current, goTo, index, nextPlayableFrom, playing]);

  // Re-read the plan so a clip recorded after this screen opened is picked up.
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/isyarat/rencana/${encodeURIComponent(identifier)}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as { plan: Plan; order: OrderSummary };
      setPlan(data.plan);
      setOrder(data.order);
      setMissing(data.plan.segments.filter((s) => s.status === "pending").map((s) => s.glossId));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat rencana.");
    }
  }, [identifier]);

  const setStatus = useCallback(
    async (status: OrderStatus) => {
      setSaving(true);
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(identifier)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as { order: OrderSummary };
        setOrder((previous) => ({ ...previous, status: data.order.status }));
      } catch {
        setError("Status gagal disimpan. Periksa koneksi lalu coba lagi.");
      } finally {
        setSaving(false);
      }
    },
    [identifier],
  );

  // Start (or restart) the clip whenever the active segment or play state changes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playing || isMissing) return;
    video.currentTime = 0;
    void video
      .play()
      .then(() => setAutoplayBlocked(false))
      .catch(() => {
        // Browsers may refuse; offer a tap target instead of failing silently.
        setAutoplayBlocked(true);
        setPlaying(false);
      });
  }, [current, index, isMissing, playing]);

  // Keep the active row visible while the sequence advances on its own.
  useEffect(() => {
    if (!playing) return;
    activeItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [index, playing]);

  const step = (delta: number) => {
    setPlaying(false);
    goTo(index + delta);
  };

  const notPlayable = plan.readyCount === 0;
  const markedReady = order.status === "disiapkan" || order.status === "selesai";

  return (
    <section className="container-page section-y pt-28">
      <LineArt
        motif="wave"
        tone="sage"
        opacity="opacity-25"
        className="top-24 -left-24 hidden size-64 lg:block"
      />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong/50 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-leaft">
            <Icon name="signLanguage" className="size-4" />
            {autoPlay ? cashierCopy.nowServing : "Pemutar isyarat"}
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {`Pesanan ${order.code}`}
          </h1>
          <p className="text-sm text-ink-muted">
            {`${order.customer.name} · ${SERVICE_LABEL[order.service] ?? order.service}`}
            {order.tableNumber ? ` · Meja ${order.tableNumber}` : ""}
            {` · ${PAYMENT_LABEL[order.payment] ?? order.payment} · ${formatRupiah(order.total)}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-pill px-3 py-1.5 text-xs font-bold ${
              order.status === "selesai" ? "bg-sage/25 text-leaft" : "bg-ocean-soft text-ocean"
            }`}
          >
            {STATUS_LABEL[order.status]}
          </span>

          {autoPlay ? (
            <>
              <button
                type="button"
                onClick={() => setStatus("disiapkan")}
                disabled={saving || markedReady}
                className="inline-flex items-center gap-2 rounded-pill border border-line-strong/70 px-4 py-2.5 text-sm font-bold text-ink-muted transition-colors hover:text-ink disabled:opacity-45"
              >
                <Icon name="check" className="size-4" />
                {markedReady ? cashierCopy.markReadyDone : cashierCopy.markReady}
              </button>
              <button
                type="button"
                onClick={() => setStatus("selesai")}
                disabled={saving || order.status === "selesai"}
                className="bg-electric inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 focus-visible:outline-white disabled:opacity-50"
              >
                <Icon name="check" className="size-4" />
                {order.status === "selesai" ? cashierCopy.markDoneDone : cashierCopy.markDone}
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-pill border border-line-strong/70 px-4 py-2.5 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
          >
            <Icon name="refresh" className="size-4" />
            Muat ulang
          </button>
        </div>
      </header>

      {error ? (
        <p
          className="mt-4 rounded-card border border-line bg-surface p-4 text-sm font-bold text-tomato-deep"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Stage */}
        <div className={autoPlay ? "lg:col-span-8" : "lg:col-span-7"}>
          <div className="overflow-hidden rounded-card border border-line bg-navy shadow-card">
            <div className="relative aspect-4/3 w-full bg-navy">
              {current && !isMissing ? (
                <video
                  ref={videoRef}
                  key={current.glossId}
                  src={current.videoSrc}
                  poster={current.posterSrc}
                  playsInline
                  muted
                  autoPlay={autoPlay}
                  preload="auto"
                  onEnded={handleEnded}
                  onError={handleError}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-on-brand">
                  <span className="inline-flex size-14 items-center justify-center rounded-pill bg-on-brand/10">
                    <Icon name="signLanguage" className="size-7 text-mint" />
                  </span>
                  <p className="font-display text-lg font-bold">
                    {notPlayable ? "Belum ada klip isyarat" : "Rekaman belum tersedia"}
                  </p>
                  <p className="max-w-md text-sm text-on-brand/80">
                    {notPlayable
                      ? cashierCopy.noClipYet
                      : current
                        ? `Slot video untuk "${current.label}" sudah disiapkan. Unggah ${current.glossId}.mp4 ke folder klip untuk mengaktifkannya.`
                        : "Rencana ini tidak punya segmen."}
                  </p>
                </div>
              )}

              {autoplayBlocked && current && !isMissing ? (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-navy/70 text-on-brand"
                >
                  <span className="bg-electric inline-flex size-16 items-center justify-center rounded-pill shadow-btn">
                    <Icon name="play" className="size-7" />
                  </span>
                  <span className="text-sm font-bold">Ketuk untuk mulai memutar</span>
                </button>
              ) : null}

              {current ? (
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-navy to-transparent p-4">
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-bold text-on-brand sm:text-2xl">
                      {current.label}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-mint">
                      {current.glossNotation}
                    </p>
                    {current.caption ? (
                      <p className="mt-1 truncate text-xs text-on-brand/80">{current.caption}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-pill bg-on-brand/15 px-2.5 py-1 text-xs font-bold text-on-brand">
                    {`${current.order} / ${plan.segments.length}`}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Transport */}
            <div className="flex flex-wrap items-center gap-2 border-t border-on-brand/15 p-4">
              <button
                type="button"
                onClick={() => setPlaying(true)}
                disabled={playing || notPlayable}
                className="bg-electric inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-bold text-on-brand shadow-btn transition-transform duration-300 hover:scale-105 disabled:opacity-50"
              >
                <Icon name="play" className="size-4" />
                {notPlayable ? "Belum ada klip" : playing ? "Memutar…" : "Putar berurutan"}
              </button>
              <button
                type="button"
                onClick={() => setPlaying(false)}
                disabled={!playing}
                className="rounded-pill border border-on-brand/25 px-4 py-2.5 text-sm font-bold text-on-brand/90 transition-colors hover:text-on-brand disabled:opacity-40"
              >
                Jeda
              </button>
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={index === 0}
                className="inline-flex size-10 items-center justify-center rounded-pill border border-on-brand/25 text-on-brand disabled:opacity-40"
              >
                <Icon name="chevronLeft" className="size-5" />
                <span className="sr-only">Segmen sebelumnya</span>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={index >= plan.segments.length - 1}
                className="inline-flex size-10 items-center justify-center rounded-pill border border-on-brand/25 text-on-brand disabled:opacity-40"
              >
                <Icon name="chevronRight" className="size-5" />
                <span className="sr-only">Segmen berikutnya</span>
              </button>
              <label className="ml-auto flex items-center gap-2 text-xs font-bold text-on-brand/80">
                Kecepatan
                <select
                  defaultValue="1"
                  onChange={(event) => {
                    const video = videoRef.current;
                    if (video) video.playbackRate = Number(event.target.value);
                  }}
                  className="rounded-btn border border-on-brand/25 bg-navy px-2 py-1 text-xs font-bold text-on-brand"
                >
                  {["0.75", "1", "1.25", "1.5"].map((rate) => (
                    <option key={rate} value={rate}>
                      {`${rate}×`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <p className="mt-3 text-xs text-ink-muted">
            {`${plan.readyCount} dari ${plan.segments.length} segmen punya rekaman.`}
            {plan.pendingCount > 0
              ? ` ${plan.pendingCount} segmen dilewati sampai videonya diunggah.`
              : ""}
            {autoPlay ? ` ${cashierCopy.autoPlayBody}` : ""}
          </p>
        </div>

        {/* Segment list + queue */}
        <aside className={autoPlay ? "lg:col-span-4" : "lg:col-span-5"}>
          <div className="rounded-card border border-line bg-card p-4 shadow-card lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-bold text-ink">Urutan isyarat</h2>
              <span className="rounded-pill bg-ocean-soft px-2.5 py-1 text-xs font-bold text-ocean">
                {`${Math.round(plan.totalDurationMs / 1000)}s`}
              </span>
            </div>

            <ol className="mt-3 flex max-h-[26rem] flex-col gap-1.5 overflow-y-auto pr-1">
              {plan.segments.map((segment, position) => {
                const active = position === index;
                const clipMissing = missing.includes(segment.glossId) || segment.status === "pending";
                return (
                  <li
                    key={`${segment.glossId}-${segment.order}`}
                    ref={active ? activeItemRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setPlaying(false);
                        goTo(position);
                      }}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-btn border px-3 py-2 text-left transition-colors ${
                        active
                          ? "border-ocean bg-ocean-soft/70"
                          : "border-transparent hover:border-line hover:bg-surface"
                      }`}
                    >
                      <span className="w-6 shrink-0 text-xs font-black text-ink-muted">
                        {segment.order}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{segment.label}</span>
                        <span className="block text-xs text-ink-muted">{segment.glossNotation}</span>
                      </span>
                      {clipMissing ? (
                        <span className="shrink-0 rounded-pill bg-line/70 px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                          belum ada
                        </span>
                      ) : (
                        <Icon name="check" className="size-4 shrink-0 text-leaft" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            {autoPlay ? (
              <div className="mt-4 border-t border-line pt-4">
                <h2 className="font-display text-base font-bold text-ink">
                  {cashierCopy.queueNext}
                </h2>
                {queue.length === 0 ? (
                  <p className="mt-2 text-xs text-ink-muted">{cashierCopy.queueEmpty}</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {queue.slice(0, 4).map((entry) => (
                      <li key={entry.code} className="flex items-center gap-2">
                        <Link
                          href={`/kasir/${encodeURIComponent(entry.code)}`}
                          className="min-w-0 flex-1 rounded-btn px-2 py-1.5 transition-colors hover:bg-surface"
                        >
                          <span className="block truncate text-sm font-bold">{entry.code}</span>
                          <span className="block truncate text-xs text-ink-muted">
                            {`${entry.customer.name} · ${entry.itemCount} item`}
                          </span>
                        </Link>
                        <span
                          className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-bold ${
                            entry.signPlayable
                              ? "bg-sage/20 text-leaft"
                              : "bg-line/70 text-ink-muted"
                          }`}
                        >
                          {entry.signPlayable ? "siap" : "belum ada klip"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/kasir"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ocean underline-offset-4 hover:underline"
                >
                  <Icon name="arrowRight" className="size-4 rotate-180" />
                  Kembali ke layar pantau
                </Link>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
