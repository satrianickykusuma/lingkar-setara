import { clipManifest } from "@/data/clip-manifest";

/**
 * What sign clips exist, without touching the filesystem.
 *
 * This used to `readdir` the clip folder. That works on a machine with a disk but
 * not on a serverless host, where `public/` is served from a CDN and `process.cwd()`
 * is not the project root — the scan would silently report zero clips and every
 * order would look unrecorded. The inventory now comes from a generated module
 * (`tools/make_clip_manifest.py`), which is bundled with the code and therefore
 * always accurate for that build.
 */

export type ClipInventory = {
  /** Where the clips live, for messages and the checklist. */
  directory: string;
  /** Gloss ids with a usable video file. */
  videos: Set<string>;
  /** Gloss ids with a poster still. */
  posters: Set<string>;
  /** Gloss id -> public URL of the actual file. */
  videoUrl: Map<string, string>;
  /** Gloss id -> public URL of the poster, when one exists. */
  posterUrl: Map<string, string>;
  /** When the manifest was generated, so a stale build is visible. */
  generatedAt: string;
};

const DIRECTORY = "public/videos/isyarat";

export async function readClipInventory(): Promise<ClipInventory> {
  const videoUrl = new Map(Object.entries(clipManifest.videos));
  const posterUrl = new Map(Object.entries(clipManifest.posters));

  return {
    directory: DIRECTORY,
    videos: new Set(videoUrl.keys()),
    posters: new Set(posterUrl.keys()),
    videoUrl,
    posterUrl,
    generatedAt: clipManifest.generatedAt,
  };
}

export function clipDirectory(): string {
  return DIRECTORY;
}
