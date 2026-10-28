/**
 * Sign-language vocabulary registry.
 *
 * This file is the contract between the recordings and the app: every entry
 * corresponds to one clip in `public/videos/isyarat/<id>.mp4`. Nothing may be
 * listed here without a recording, because a missing clip reaches the cashier as
 * an unplayable segment.
 *
 * Provenance: the shop supplied 30 HEVC .mov recordings, transcoded to H.264 MP4
 * by `tools/transcode_sign_clips.py`. They cover portions 1–10, ten dishes, two
 * drinks, two ways of serving, two temperatures and three condiment choices. They
 * do **not** cover greetings, payment or delivery, so those concepts deliberately
 * do not exist here — and the order form was trimmed to match (see `data/menu.ts`).
 */

export type GlossCategory =
  | "porsi"
  | "makanan"
  | "minuman"
  | "layanan"
  | "suhu"
  | "kondimen";

/** Recording state of one clip. */
export type ClipStatus = "ready" | "pending";

export type Gloss = {
  /** Stable id. Also the filename stem of the clip. */
  id: string;
  category: GlossCategory;
  /** Indonesian label shown to staff and guests. */
  label: string;
  /** The sign-language gloss, i.e. what the recording shows. */
  glossNotation: string;
  /** Public path of the clip. */
  videoSrc: string;
  posterSrc: string;
  /** Nominal length, used only for the plan's duration estimate. */
  durationMs: number;
  status: ClipStatus;
  /** What the recording shows, for whoever maintains it. */
  direction?: string;
};

export function clipSrcFor(id: string): string {
  return `/videos/isyarat/${id}.mp4`;
}

export function posterSrcFor(id: string): string {
  return `/videos/isyarat/${id}.jpg`;
}

/** Shorthand for the table below; `videoSrc`/`posterSrc`/`status` are derived. */
type Row = Omit<Gloss, "videoSrc" | "posterSrc" | "status">;

const ROWS: Row[] = [
  /* ── Porsi (1–10) ───────────────────────────────────────────────────────── */
  { id: "porsi-1", category: "porsi", label: "1 porsi", glossNotation: "ONE PORTION", durationMs: 7400, direction: "Angka satu diikuti isyarat porsi." },
  { id: "porsi-2", category: "porsi", label: "2 porsi", glossNotation: "TWO PORTION", durationMs: 6000, direction: "Angka dua diikuti isyarat porsi." },
  { id: "porsi-3", category: "porsi", label: "3 porsi", glossNotation: "THREE PORTION", durationMs: 7200, direction: "Angka tiga diikuti isyarat porsi." },
  { id: "porsi-4", category: "porsi", label: "4 porsi", glossNotation: "FOUR PORTION", durationMs: 5300, direction: "Angka empat diikuti isyarat porsi." },
  { id: "porsi-5", category: "porsi", label: "5 porsi", glossNotation: "FIVE PORTION", durationMs: 6200, direction: "Angka lima diikuti isyarat porsi." },
  { id: "porsi-6", category: "porsi", label: "6 porsi", glossNotation: "SIX PORTION", durationMs: 6200, direction: "Angka enam diikuti isyarat porsi." },
  { id: "porsi-7", category: "porsi", label: "7 porsi", glossNotation: "SEVEN PORTION", durationMs: 5900, direction: "Angka tujuh diikuti isyarat porsi." },
  { id: "porsi-8", category: "porsi", label: "8 porsi", glossNotation: "EIGHT PORTION", durationMs: 7500, direction: "Angka delapan diikuti isyarat porsi." },
  { id: "porsi-9", category: "porsi", label: "9 porsi", glossNotation: "NINE PORTION", durationMs: 7600, direction: "Angka sembilan diikuti isyarat porsi." },
  { id: "porsi-10", category: "porsi", label: "10 porsi", glossNotation: "TEN PORTION", durationMs: 6300, direction: "Angka sepuluh diikuti isyarat porsi." },

  /* ── Makanan ────────────────────────────────────────────────────────────── */
  { id: "makanan-nasi-campur", category: "makanan", label: "Nasi Campur", glossNotation: "I WANT ORDER RICE MIXED", durationMs: 15200, direction: "Kalimat pesan lengkap untuk nasi campur." },
  { id: "makanan-nasi-goreng", category: "makanan", label: "Nasi Goreng", glossNotation: "I WANT ORDER FRIED RICE", durationMs: 11600, direction: "Kalimat pesan lengkap untuk nasi goreng." },
  { id: "makanan-ayam-goreng", category: "makanan", label: "Ayam Goreng", glossNotation: "FRIED CHICKEN", durationMs: 7200, direction: "Isyarat ayam lalu isyarat goreng." },
  { id: "makanan-ikan-goreng", category: "makanan", label: "Ikan Goreng", glossNotation: "FRIED FISH", durationMs: 8400, direction: "Isyarat ikan lalu isyarat goreng." },
  { id: "makanan-tahu-goreng", category: "makanan", label: "Tahu Goreng", glossNotation: "FRIED TOFU", durationMs: 10200, direction: "Isyarat tahu lalu isyarat goreng." },
  { id: "makanan-tempe-goreng", category: "makanan", label: "Tempe Goreng", glossNotation: "FRIED TEMPEH", durationMs: 8100, direction: "Isyarat tempe lalu isyarat goreng." },
  { id: "makanan-sayur-campur", category: "makanan", label: "Sayur Campur", glossNotation: "VEGETABLE MIXED", durationMs: 8100, direction: "Isyarat sayur lalu isyarat campur." },
  { id: "makanan-sayur-kangkung", category: "makanan", label: "Sayur Kangkung", glossNotation: "WATER SPINACH", durationMs: 9000, direction: "Isyarat kangkung." },
  { id: "makanan-pisang-goreng", category: "makanan", label: "Pisang Goreng", glossNotation: "I WANT ORDER FRIED BANANA", durationMs: 10800, direction: "Kalimat pesan lengkap untuk pisang goreng." },
  { id: "makanan-pisang-stik", category: "makanan", label: "Pisang Stik", glossNotation: "I WANT ORDER BANANA STICK", durationMs: 10600, direction: "Kalimat pesan lengkap untuk pisang stik." },

  /* ── Minuman ────────────────────────────────────────────────────────────── */
  { id: "minuman-kopi", category: "minuman", label: "Kopi", glossNotation: "I WANT ORDER DRINK COFFEE", durationMs: 12600, direction: "Kalimat pesan lengkap untuk kopi." },
  { id: "minuman-pop-ice", category: "minuman", label: "Pop Ice", glossNotation: "I WANT ORDER DRINK POP ICE", durationMs: 13200, direction: "Kalimat pesan lengkap untuk pop ice." },

  /* ── Layanan ────────────────────────────────────────────────────────────── */
  { id: "layanan-makan-sini", category: "layanan", label: "Makan di sini", glossNotation: "EAT HERE", durationMs: 7000, direction: "Isyarat makan lalu menunjuk ke meja." },
  { id: "layanan-bawa-pulang", category: "layanan", label: "Bawa pulang", glossNotation: "TAKEAWAY", durationMs: 10500, direction: "Isyarat membungkus lalu membawa pergi." },

  /* ── Suhu ───────────────────────────────────────────────────────────────── */
  { id: "suhu-dingin", category: "suhu", label: "Dingin", glossNotation: "COLD", durationMs: 6700, direction: "Isyarat dingin." },
  { id: "suhu-hangat", category: "suhu", label: "Hangat", glossNotation: "WARM", durationMs: 5000, direction: "Isyarat hangat." },

  /* ── Kondimen ───────────────────────────────────────────────────────────── */
  { id: "kondimen-kecap", category: "kondimen", label: "Pakai kecap", glossNotation: "SOY SAUCE", durationMs: 6900, direction: "Isyarat kecap." },
  { id: "kondimen-pakai-rica", category: "kondimen", label: "Pakai rica", glossNotation: "WITH CHILI", durationMs: 5700, direction: "Isyarat rica dengan penegasan." },
  { id: "kondimen-tanpa-rica", category: "kondimen", label: "Tidak pakai rica", glossNotation: "NO CHILI", durationMs: 7000, direction: "Isyarat rica lalu penyangkalan." },
];

/** The registry. `status` is corrected from disk by `clip-inventory.ts`. */
export const glossRegistry: Gloss[] = ROWS.map((row) => ({
  ...row,
  videoSrc: clipSrcFor(row.id),
  posterSrc: posterSrcFor(row.id),
  status: "pending" as ClipStatus,
}));

export const glossById: Record<string, Gloss> = Object.fromEntries(
  glossRegistry.map((gloss) => [gloss.id, gloss]),
);

export const glossCategories: { id: GlossCategory; label: string }[] = [
  { id: "porsi", label: "Porsi" },
  { id: "makanan", label: "Makanan" },
  { id: "minuman", label: "Minuman" },
  { id: "layanan", label: "Layanan" },
  { id: "suhu", label: "Suhu" },
  { id: "kondimen", label: "Kondimen" },
];
