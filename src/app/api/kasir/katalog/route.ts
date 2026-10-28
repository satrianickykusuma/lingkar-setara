import { NextResponse } from "next/server";

import { hasStaffSession } from "@/server/auth/session";
import { glossById, glossRegistry } from "@/server/sign/glossary";
import { readClipInventory } from "@/server/sign/clip-inventory";
import { captureStatus } from "@/server/sign/sign-compiler";

export const dynamic = "force-dynamic";

/**
 * GET /api/kasir/katalog — the vocabulary plus how many clips are recorded.
 * **Staff only**: the capture checklist is production information, not guest-facing.
 *
 * The capture status is computed from the filesystem rather than trusted from a
 * flag: dropping `public/videos/isyarat/<glossId>.mp4` in place is the whole
 * workflow for publishing a recording, and this endpoint is what proves it took
 * effect.
 */
export async function GET() {
  if (!(await hasStaffSession())) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sesi kasir tidak ditemukan. Masuk dulu." },
      { status: 401 },
    );
  }

  const inventory = await readClipInventory();
  const { videos, posters } = inventory;

  // Reflect what is actually on disk into the registry view we return.
  for (const gloss of glossRegistry) {
    gloss.status = videos.has(gloss.id) ? "ready" : "pending";
  }

  const status = captureStatus();

  return NextResponse.json({
    clipDirectory: inventory.directory,
    naming: "<glossId>.mp4 (opsional: <glossId>.jpg untuk poster)",
    status: {
      total: status.total,
      ready: status.ready,
      pending: status.pending,
      percentReady: status.percentReady,
    },
    categories: status.byCategory.map((category) => ({
      id: category.id,
      total: category.total,
      ready: category.ready,
      items: category.items.map((item) => ({
        id: item.id,
        label: item.label,
        glossNotation: item.glossNotation,
        category: item.category,
        durationMs: item.durationMs,
        direction: item.direction,
        videoSrc: item.videoSrc,
        hasVideo: videos.has(item.id),
        hasPoster: posters.has(item.id),
      })),
    })),
    missing: glossRegistry.filter((gloss) => !videos.has(gloss.id)).map((gloss) => gloss.id),
    known: Object.keys(glossById).length,
  });
}
