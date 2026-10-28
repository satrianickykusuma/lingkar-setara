import type { IconName } from "@/data/icons";

export type SignVideoCategory = "makanan" | "minuman" | "kasir";

export type SignVideo = {
  id: string;
  /** Card eyebrow, e.g. "Makanan • QB-01". */
  label: string;
  category: SignVideoCategory;
  title: string;
  description: string;
  /** Two short facts shown as chips. */
  meta: [string, string];
  duration: string;
  /** Outline icon for the card's corner. */
  icon: IconName;
  image: string;
  alt: string;
  /** No tutorial footage is bundled yet; the UI says so instead of faking it. */
  videoSrc?: string;
};

export type OrderStep = {
  id: string;
  index: string;
  title: string;
  description: string;
};

export type GestureCard = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
};

export const belajarHero = {
  badge: "Ruang Edukasi BISINDO Gorontalo",
  badgeNote: "Terbuka & Hangat",
  title: "Belajar Isyarat: Pesan Mudah, Terhubung Akrab",
  body: "Kuasai isyarat pemesanan praktis bersama kawan Tuli Lingkar Setara. Lebih dari sekadar memesan makanan, ini adalah perjumpaan yang setara dan inklusif.",
  assistTitle: "Pemesanan Ramah Tuli",
  assistSteps: "Tunjuk Menu • Isyarat Ringan • Senyuman",
  chips: [
    { id: "bisindo", label: "BISINDO Gorontalo", icon: "signLanguage" as IconName },
    { id: "subtitle", label: "Subtitle Lengkap", icon: "closedCaption" as IconName },
    { id: "durasi", label: "03:45", icon: "clock" as IconName },
  ],
  spotlight: {
    title: "Video Spotlight Utama",
    heading: "5 Langkah Praktis Memesan Makanan & Minuman di Kasir",
    duration: "03:45",
    timestamp: "01:30 / 03:45",
    speedLabel: "Kecepatan: 1.0x (Normal)",
    note: "Barista kami siap membantu",
    poster: "/images/belajar/barista-isyarat.jpg",
    posterAlt:
      "Barista Tuli Lingkar Setara memperagakan bahasa isyarat di depan konter kafe",
  },
} as const;

export const orderSteps: OrderStep[] = [
  {
    id: "sapaan",
    index: "1",
    title: "Sapaan Hangat",
    description:
      "Tersenyum dan lambaikan telapak tangan sopan setinggi dada untuk membuka obrolan.",
  },
  {
    id: "kode-menu",
    index: "2",
    title: "Tunjukkan Kode Menu",
    description:
      "Peragakan huruf kode menu (misal: QB-01 atau MB-02) atau tunjuk papan kartu visual.",
  },
  {
    id: "jumlah",
    index: "3",
    title: "Jumlah & Tipe Layanan",
    description:
      "Angkat jari untuk jumlah, lalu isyaratkan “Makan Sini” atau “Bungkus”.",
  },
  {
    id: "rasa",
    index: "4",
    title: "Preferensi Rasa",
    description:
      "Isyarat sederhana untuk “Kurang Manis”, “Pedas”, atau “Tanpa Es Batu”.",
  },
  {
    id: "terima-kasih",
    index: "5",
    title: "Terima Kasih Penuh Makna",
    description:
      "Sentuh ujung jari ke dagu lalu gerakkan lembut lurus ke depan dengan anggukan hangat.",
  },
];

export const gallerySection = {
  eyebrow: "Koleksi Pembelajaran Visual",
  title: "Galeri Isyarat Menu & Interaksi",
  body: "Geser ke samping untuk menemukan tutorial isyarat setiap hidangan dan kebutuhan transaksi.",
  filters: [
    { id: "all", label: "Semua Video" },
    { id: "makanan", label: "Makanan" },
    { id: "minuman", label: "Minuman" },
    { id: "kasir", label: "Kasir & Apresiasi" },
  ],
} as const;

export const signVideos: SignVideo[] = [
  {
    id: "citrus-bloom",
    label: "Makanan • QB-01",
    category: "makanan",
    title: "Isyarat “Citrus Bloom Quinoa Bowl”",
    description:
      "Membentuk mangkuk dengan kedua tangan melingkar, lalu gerakan jari memeras jeruk segar di atasnya.",
    meta: ["Gerakan 2 Tangan", "Tingkat Mudah"],
    duration: "01:20",
    icon: "star",
    image: "/images/belajar/isyarat-citrus-bloom.jpg",
    alt: "Peragaan isyarat untuk hidangan Citrus Bloom Quinoa Bowl",
  },
  {
    id: "minty-matcha",
    label: "Makanan • MB-02",
    category: "makanan",
    title: "Isyarat “Minty Matcha Superbowl”",
    description:
      "Isyarat mengocok bambu matcha disusul sentuhan lembut telunjuk ke ujung hidung untuk aroma mint.",
    meta: ["Gerakan Halus", "Kategori Superbowl"],
    duration: "01:15",
    icon: "bolt",
    image: "/images/belajar/isyarat-minty-matcha.jpg",
    alt: "Peragaan isyarat untuk hidangan Minty Matcha Superbowl",
  },
  {
    id: "veggie-sandwich",
    label: "Makanan • SW-03",
    category: "makanan",
    title: "Isyarat “Veggie Sandwich”",
    description:
      "Menangkupkan telapak tangan mendatar merefleksikan roti lapis, lalu menyilangkan jari untuk sayuran panggang.",
    meta: ["Gerakan Telapak", "Sourdough Gandum"],
    duration: "01:30",
    icon: "bakery",
    image: "/images/belajar/isyarat-veggie-sandwich.jpg",
    alt: "Peragaan isyarat untuk hidangan Artisan Grilled Veggie Sandwich",
  },
  {
    id: "tropical-sage",
    label: "Minuman • DR-05",
    category: "minuman",
    title: "Isyarat “Tropical Sage Cooler”",
    description:
      "Tangan membentuk silinder gelas dingin, disambung getaran jemari lembut mewakili kesegaran soda herbal.",
    meta: ["Minuman Dingin", "Sensasi Segar"],
    duration: "01:10",
    icon: "cup",
    image: "/images/belajar/isyarat-tropical-sage.jpg",
    alt: "Peragaan isyarat untuk minuman Tropical Sage Cooler",
  },
  {
    id: "porsi-kuantitas",
    label: "Frasa Kasir • Porsi",
    category: "kasir",
    title: "Isyarat “Porsi & Kuantitas”",
    description:
      "Mengenal angka 1 sampai 5 dalam BISINDO serta gestur tangan untuk porsi sedang atau porsi besar.",
    meta: ["Angka & Jumlah", "Paling Praktis"],
    duration: "02:00",
    icon: "pin",
    image: "/images/belajar/isyarat-porsi-kuantitas.jpg",
    alt: "Peragaan isyarat angka dan porsi dalam BISINDO",
  },
  {
    id: "qris",
    label: "Transaksi • QRIS",
    category: "kasir",
    title: "Isyarat “Bayar QRIS & Terima Kasih”",
    description:
      "Isyarat memegang gawai menghadap kode QR, konfirmasi nominal, serta ungkapan rasa syukur “Enak Sekali”.",
    meta: ["Non-Tunai", "Apresiasi Kasir"],
    duration: "01:45",
    icon: "qrCode",
    image: "/images/belajar/isyarat-qris.jpg",
    alt: "Peragaan isyarat membayar dengan QRIS dan ucapan terima kasih",
  },
];

export const cheatSheet = {
  eyebrow: "Kamus Isyarat Kilat (Cheat Sheet)",
  title: "4 Gestur Utama Saat Bertemu Kawan Tuli",
  body: "Sentuhan kecil bahasa isyarat menciptakan atmosfer penerimaan yang luar biasa. Latih gerakan tangan Anda sebelum berkunjung.",
  note: "Bahasa hati yang melampaui suara",
} as const;

export const gestureCards: GestureCard[] = [
  {
    id: "terima-kasih",
    icon: "frontHand",
    title: "Terima Kasih",
    description:
      "Sentuh ujung jari tangan ke dagu, lalu dorong lembut ke arah barista sambil mengangguk.",
  },
  {
    id: "enak-sekali",
    icon: "smile",
    title: "Enak Sekali",
    description:
      "Usap lembut pipi dengan ujung jemari atau putar telapak tangan di dada sambil tersenyum.",
  },
  {
    id: "rekomendasi",
    icon: "verified",
    title: "Rekomendasi",
    description:
      "Buka kedua telapak tangan ke atas lalu angkat sedikit sebagai tanda menu favorit hari ini.",
  },
  {
    id: "pesan-ini",
    icon: "point",
    title: "Pesan Ini",
    description:
      "Arahkan telunjuk ke foto menu atau tunjukkan kode huruf pada kartu visual meja kasir.",
  },
];

export const practiceSection = {
  eyebrow: "Ruang Ramah & Eksklusif • Praktikkan di Kedai",
  title: "Jangan Khawatir Berbuat Salah Saat Berisyarat!",
  body: "Kawan Tuli kami sangat mengapresiasi setiap senyuman dan usaha Anda mencoba berisyarat. Interaksi ini bukan tentang kesempurnaan teknis, melainkan tentang perjumpaan manusiawi yang hangat dan setara.",
  cta: { label: "Lihat Menu Lengkap", href: "/menu" },
} as const;

/** Shown wherever a tutorial has no footage yet, so nothing pretends to play. */
export const videoPlaceholderNote =
  "Rekaman tutorial belum tersedia — kartu ini menyiapkan tempatnya.";
