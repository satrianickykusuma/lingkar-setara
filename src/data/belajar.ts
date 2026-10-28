import type { IconName } from "@/data/icons";
import type { GlossCategory } from "@/server/sign/glossary";

/**
 * Copy for the learn-sign page.
 *
 * Everything here describes what the shop has **actually recorded**: 29 clips
 * covering portions, ten dishes, two drinks, two ways of serving, two temperatures
 * and three condiment choices. The page used to advertise tutorials for dishes that
 * no longer exist (Citrus Bloom, Minty Matcha) and for phrases with no recording at
 * all (payment, gratitude), which promised footage nobody could watch. Copy that
 * cannot be backed by a clip does not belong on a learning page.
 */

export type OrderStep = {
  id: string;
  index: string;
  title: string;
  description: string;
  /** Gloss id the learner can watch for this step, if one exists. */
  clip?: string;
};

export type LibraryClip = {
  id: string;
  /** Indonesian label, e.g. "Nasi Goreng". */
  label: string;
  /** The recorded sign, e.g. "I WANT ORDER FRIED RICE". */
  gloss: string;
  category: GlossCategory;
  categoryLabel: string;
  videoSrc: string;
  posterSrc: string;
  /** Seconds, for the "0:12" chip. */
  durationSeconds: number;
};

export const belajarHero = {
  badge: "Ruang Edukasi BISINDO Gorontalo",
  badgeNote: "Terbuka & Hangat",
  titleLead: "Belajar Isyarat:",
  titleAccent: "Pesan Mudah, Terhubung Akrab",
  body:
    "Semua isyarat yang dipakai saat memesan di kedai ini bisa Anda pelajari sendiri di halaman ini. Tonton, ulangi, lalu coba langsung di kasir — tidak perlu lancar untuk mulai.",
  chips: [
    { id: "bisindo", label: "BISINDO Gorontalo", icon: "signLanguage" as IconName },
    { id: "subtitle", label: "Glos ditulis di tiap klip", icon: "closedCaption" as IconName },
    { id: "gratis", label: "Bisa ditonton berulang", icon: "refresh" as IconName },
  ],
  assistTitle: "Pemesanan Ramah Tuli",
  assistSteps: "Tunjuk Menu • Isyarat Ringan • Senyuman",
  assistNote:
    "Semua kawan Tuli di kedai menguasai BISINDO. Tidak perlu lancar — cukup mencoba, sisanya kami bantu.",
  poster: "/images/belajar/barista-isyarat.jpg",
  posterAlt:
    "Barista Tuli Lingkar Setara memperagakan bahasa isyarat di depan konter kedai",
  cta: { label: "Mulai dari 29 isyarat", href: "#pustaka" },
} as const;

/**
 * The real ordering flow, in the order the app asks for it. Each step names the
 * clip that demonstrates it, so the card can link straight to the video.
 */
export const orderSteps: OrderStep[] = [
  {
    id: "pilih-hidangan",
    index: "1",
    title: "Pilih Hidangan",
    description:
      "Sebut nama hidangannya, atau tunjuk gambarnya di menu. Isyaratnya berupa kalimat pesan lengkap.",
    clip: "makanan-nasi-goreng",
  },
  {
    id: "tentukan-porsi",
    index: "2",
    title: "Tentukan Porsi",
    description:
      "Angka satu sampai sepuluh, masing-masing punya rekaman sendiri. Angka lalu isyarat porsi.",
    clip: "porsi-2",
  },
  {
    id: "pilih-rica",
    index: "3",
    title: "Pilih Rica",
    description:
      "Pakai rica atau tidak. Ini yang paling sering ditanyakan kasir, jadi paling berguna dikuasai.",
    clip: "kondimen-pakai-rica",
  },
  {
    id: "pilih-kecap",
    index: "4",
    title: "Kecap atau Tidak",
    description: "Isyarat kecap dipakai apa adanya, tanpa tambahan kata lain.",
    clip: "kondimen-kecap",
  },
  {
    id: "layanan",
    index: "5",
    title: "Makan di Sini atau Bawa Pulang",
    description:
      "Langkah terakhir. Untuk minuman, pilih juga dingin atau hangat.",
    clip: "layanan-bawa-pulang",
  },
];

export const signLibrary = {
  eyebrow: "Pustaka Isyarat",
  title: "29 Isyarat untuk Memesan",
  body:
    "Setiap isyarat yang muncul di layar kasir, dalam satu halaman. Pilih kategori untuk mempersempit, atau tonton berurutan dari atas.",
  note:
    "Tekan tombol putar pada kartu. Video tidak dimuat sebelum Anda memutarnya, jadi halaman ini tetap ringan di ponsel.",
  howTo: [
    "Tonton satu isyarat, lalu ulangi gerakannya dua sampai tiga kali.",
    "Gabungkan angka dengan isyarat porsi saat memesan lebih dari satu.",
    "Tidak perlu sempurna — kasir akan membantu bila ada yang kurang jelas.",
  ],
  /** Filter chips; "all" is prepended by the component. */
  filters: [
    { id: "porsi" as GlossCategory, label: "Porsi", icon: "pin" as IconName },
    { id: "makanan" as GlossCategory, label: "Makanan", icon: "restaurantMenu" as IconName },
    { id: "minuman" as GlossCategory, label: "Minuman", icon: "cup" as IconName },
    { id: "layanan" as GlossCategory, label: "Layanan", icon: "takeawayBag" as IconName },
    { id: "suhu" as GlossCategory, label: "Suhu", icon: "snow" as IconName },
    { id: "kondimen" as GlossCategory, label: "Kondimen", icon: "flame" as IconName },
  ],
} as const;

export const practiceSection = {
  eyebrow: "Ruang Ramah & Eksklusif • Praktikkan di Kedai",
  title: "Jangan Khawatir Berbuat Salah Saat Berisyarat!",
  body:
    "Kawan Tuli kami sangat mengapresiasi setiap senyuman dan usaha Anda mencoba berisyarat. Interaksi ini bukan tentang kesempurnaan teknis, melainkan tentang perjumpaan manusiawi yang hangat dan setara.",
  cta: { label: "Lihat Menu Lengkap", href: "/menu" },
} as const;

/** "0:12" — used for the duration chip on each clip card. */
export function formatClipDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
