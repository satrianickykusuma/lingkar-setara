import { menuById, servings, type MenuItem } from "@/data/menu";
import { glossById, glossRegistry, posterSrcFor, type Gloss, type GlossCategory } from "@/server/sign/glossary";
import type { OrderItem, OrderRecord } from "@/server/orders/order-repository";

/**
 * Compiles a placed order into a playable sequence of sign-language clips.
 *
 * Every segment is a recorded gloss. There is no synthesis and no invented
 * vocabulary: choices without a clip are not offered by the order form, so the
 * plan can be built from `menu.ts` alone.
 *
 * The output is a plan rather than a rendered video — the counter plays the clips
 * in order, and a clip that does not exist on disk is reported as `pending` so the
 * player can skip it and say so.
 */

export type SignSegment = {
  /** Position in the sequence, starting at 1. */
  order: number;
  glossId: string;
  category: GlossCategory;
  label: string;
  glossNotation: string;
  /** Always a concrete path: the clip may not exist yet, but its slot does. */
  videoSrc: string;
  posterSrc: string;
  durationMs: number;
  status: "ready" | "pending";
  /** Shown under the clip: which dish or choice this segment represents. */
  caption?: string;
};

export type SignPlan = {
  version: 2;
  orderId: string;
  orderCode: string;
  createdAt: string;
  segments: SignSegment[];
  totalDurationMs: number;
  readyCount: number;
  pendingCount: number;
  /** True when every segment has a recording. */
  complete: boolean;
};

export type CompileOptions = {
  /** Gloss ids whose video file exists, read from the clip directory. */
  available?: ReadonlySet<string>;
  /** Actual URL per clip, since the file extension is whatever was saved. */
  urls?: ReadonlyMap<string, string>;
  /** Actual URL per poster, when one exists. */
  posterUrls?: ReadonlyMap<string, string>;
};

export type CompileResult = {
  plan: SignPlan;
  /** Menu ids with no usable sign — a configuration gap, not a runtime one. */
  unmappedItems: string[];
};

/* ── Segment construction ─────────────────────────────────────────────────── */

function segment(glossId: string, order: number, caption?: string): SignSegment | null {
  const gloss: Gloss | undefined = glossById[glossId];
  if (!gloss) return null;
  return {
    order,
    glossId: gloss.id,
    category: gloss.category,
    label: gloss.label,
    glossNotation: gloss.glossNotation,
    videoSrc: gloss.videoSrc,
    posterSrc: gloss.posterSrc ?? posterSrcFor(gloss.id),
    durationMs: gloss.durationMs,
    status: gloss.status,
    caption,
  };
}

/** Portions are signed with a dedicated clip for each count from 1 to 10. */
export function porsiSignId(porsi: number): string {
  const clamped = Math.min(10, Math.max(1, Math.round(porsi)));
  return `porsi-${clamped}`;
}

/** The sign for a dish, or null when the catalogue entry has no recording. */
export function dishSignId(itemId: string): string | null {
  const item: MenuItem | undefined = menuById[itemId];
  if (!item) return null;
  return item.signId in glossById ? item.signId : null;
}

/**
 * Segments for one ordered line, in the order a person would sign them:
 * the dish, how many portions, then the choices that change it.
 */
export function itemSegments(item: OrderItem, startAt: number): SignSegment[] {
  const segments: SignSegment[] = [];
  let position = startAt;

  const dishId = dishSignId(item.id);
  if (!dishId) return segments;

  const push = (glossId: string, caption?: string) => {
    const next = segment(glossId, position + 1, caption);
    if (!next) return;
    position += 1;
    segments.push(next);
  };

  push(dishId, `${item.porsi} porsi`);

  push(porsiSignId(item.porsi), `${item.porsi} porsi`);

  if (item.chili) {
    push(item.chili === "pakai" ? "kondimen-pakai-rica" : "kondimen-tanpa-rica");
  }
  if (item.soy === true) {
    push("kondimen-kecap");
  }
  if (item.temperature) {
    push(item.temperature === "dingin" ? "suhu-dingin" : "suhu-hangat");
  }

  return segments;
}

/* ── Compiler ─────────────────────────────────────────────────────────────── */

export function compileSignPlan(
  order: OrderRecord,
  options: CompileOptions = {},
): CompileResult {
  const segments: SignSegment[] = [];
  const unmappedItems: string[] = [];

  for (const item of order.items as OrderItem[]) {
    if (!dishSignId(item.id)) {
      unmappedItems.push(item.id);
      continue;
    }
    segments.push(...itemSegments(item, segments.length));
  }

  // How the order is served, signed once at the end.
  const served = servings.find((serving) => serving.id === order.service);
  if (served) {
    const serviceSegment = segment(served.signId, segments.length + 1);
    if (serviceSegment) segments.push(serviceSegment);
  }

  // A segment is playable only when the recording exists on disk; the registry
  // default alone would claim readiness for clips that were never uploaded.
  if (options.available) {
    for (const entry of segments) {
      entry.status = options.available.has(entry.glossId) ? "ready" : "pending";
    }
  }
  if (options.urls) {
    for (const entry of segments) {
      const url = options.urls.get(entry.glossId);
      if (url) entry.videoSrc = url;
    }
  }
  if (options.posterUrls) {
    for (const entry of segments) {
      const url = options.posterUrls.get(entry.glossId);
      if (url) entry.posterSrc = url;
    }
  }

  const totalDurationMs = segments.reduce((sum, entry) => sum + entry.durationMs, 0);
  const readyCount = segments.filter((entry) => entry.status === "ready").length;
  const pendingCount = segments.length - readyCount;

  return {
    plan: {
      version: 2,
      orderId: order.id,
      orderCode: order.code,
      createdAt: new Date().toISOString(),
      segments,
      totalDurationMs,
      readyCount,
      pendingCount,
      complete: pendingCount === 0 && segments.length > 0,
    },
    unmappedItems,
  };
}

/* ── Capture checklist ────────────────────────────────────────────────────── */

export type CaptureStatus = {
  total: number;
  ready: number;
  pending: number;
  percentReady: number;
  byCategory: {
    id: GlossCategory;
    label: string;
    total: number;
    ready: number;
    items: Gloss[];
  }[];
};

/** Progress over the whole vocabulary, independent of any order. */
export function captureStatus(): CaptureStatus {
  const byCategory = new Map<GlossCategory, Gloss[]>();
  for (const gloss of glossRegistry) {
    const bucket = byCategory.get(gloss.category) ?? [];
    bucket.push(gloss);
    byCategory.set(gloss.category, bucket);
  }

  const ready = glossRegistry.filter((gloss) => gloss.status === "ready").length;
  const total = glossRegistry.length;

  return {
    total,
    ready,
    pending: total - ready,
    percentReady: total === 0 ? 0 : Math.round((ready / total) * 100),
    byCategory: [...byCategory.entries()].map(([id, items]) => ({
      id,
      label: id,
      total: items.length,
      ready: items.filter((item) => item.status === "ready").length,
      items,
    })),
  };
}

/**
 * Every catalogue dish must have a clip. Run this from a test or the staff
 * checklist so a new dish cannot ship silently unplayable.
 */
export function vocabularyGaps(): { dishId: string; signId: string }[] {
  return Object.values(menuById)
    .filter((item) => !(item.signId in glossById))
    .map((item) => ({ dishId: item.id, signId: item.signId }));
}
