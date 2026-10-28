import type { IconName } from "@/data/icons";

export type NavLink = {
  label: string;
  href: string;
};

export type MenuItem = {
  slug: string;
  name: string;
  description: string;
  /** Displayed price. */
  price: string;
  /** Translation of the price for screen readers, e.g. "Rp 45.000". */
  priceLabel: string;
  badge?: string;
  image: string;
  alt: string;
  /** The two "signature" cards render as a full-bleed photo spotlight. */
  spotlight?: boolean;
};

export type ValuePoint = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
};

export const site = {
  name: "Lingkar Setara",
  tagline: "Ruang makan yang dijalankan teman Tuli.",
  logo: "/images/logo-setara.png",
} as const;

/** Section links use absolute paths so they work from every route. */
export const navLinks: NavLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Belajar Isyarat", href: "/belajar-isyarat" },
  { label: "Cerita Kami", href: "/#cerita" },
  { label: "Dampak", href: "/#dampak" },
  { label: "Kontak", href: "/#kontak" },
];

/** Persistent status chip in the header, matching the Menu page design. */
export const headerChip = "Layanan Isyarat & Visual";

export const hero = {
  badge: "Dijalankan oleh teman Tuli",
  titleLead: "Suara Kecil,",
  titleAccent: "Dampak Besar",
  body: "Pengalaman kuliner yang seluruh dapurnya dijalankan teman Tuli. Setiap piring dikerjakan dengan teliti, dan setiap pesanan bisa kamu sampaikan lewat bahasa isyarat, tulisan, atau suara.",
  primaryCta: { label: "Lihat Menu", href: "/menu" },
  secondaryCta: { label: "Pesan Meja", href: "/#kontak" },
  image: "/images/hero-makan-siang.jpg",
  alt: "Ikan panggang dengan saus kuning dan sayuran segar di atas piring putih, disajikan di meja kayu restoran",
  /** Short credibility strip under the CTAs. */
  highlights: [
    "Pelayan paham bahasa isyarat",
    "Menu bergambar di setiap meja",
    "Dapur terbuka, bisa ditonton",
  ],
} as const;

export const story = {
  eyebrow: "Cerita Kami",
  titleLead: "Lebih dari",
  titleAccent: "Sekadar Makan",
  paragraphs: [
    "Lingkar Setara lahir dari satu keyakinan sederhana: semangat bekerja bicara lebih keras daripada suara. Kami adalah ruang makan yang seluruh timnya teman Tuli, dan kami menuangkan energi itu ke dalam suasana yang senyaman rasa makanannya.",
    "Setiap piring kami perlakukan seperti kanvas. Tim dapur memastikan tidak ada detail yang terlewat, dan tim depan memastikan setiap tamu merasa dimengerti — bukan hanya dilayani.",
  ],
  cta: { label: "Kenali Perjalanan Kami", href: "/#dampak" },
  streetImage: "/images/kru-dapur-isyarat.jpg",
  streetAlt:
    "Dua anggota tim Lingkar Setara berbincang dengan bahasa isyarat di dapur restoran yang terang",
  roomImage: "/images/interior-restoran.jpg",
  roomAlt:
    "Interior ruang makan Lingkar Setara dengan sofa panjang, tanaman hijau, dan papan neon nama restoran",
  values: [
    {
      id: "bahasa-isyarat",
      title: "Bahasa Isyarat Dulu",
      description:
        "Semua pelayan menguasai BISINDO, jadi kamu bisa memesan tanpa harus mengulang.",
      icon: "signLanguage",
    },
    {
      id: "bahan-segar",
      title: "Bahan Segar Harian",
      description:
        "Belanja setiap pagi dari pasar langganan, diolah setelah dipesan.",
      icon: "freshLeaf",
    },
    {
      id: "ruang-inklusif",
      title: "Ruang Ramah Semua",
      description:
        "Meja rendah, jalur kursi roda, dan menu braille tersedia di pintu masuk.",
      icon: "inclusiveSpace",
    },
  ] satisfies ValuePoint[],
} as const;

export const menuSection = {
  eyebrow: "Menu Andalan",
  titleLead: "Signature",
  titleAccent: "Highlights",
  body: "Kurasi hidangan yang paling sering dipesan tamu, dibuat untuk membuat harimu lebih ringan.",
  cta: { label: "Lihat Menu Lengkap", href: "/menu" },
} as const;

/**
 * The four cards in the home "Signature Highlights" carousel.
 *
 * `slug` must be a real `MenuItem.id` from `data/menu.ts`, because the "+" button
 * adds that dish to the cart. These were re-pointed when the catalogue was rebuilt
 * around the supplied sign recordings; a slug with no menu entry would render a card
 * whose add button silently does nothing.
 */
export const menuItems: MenuItem[] = [
  {
    slug: "nasi-campur",
    name: "Nasi Campur",
    description:
      "Nasi hangat dengan ayam, tahu, tempe, dan sayur — porsi lengkap khas kedai.",
    price: "Rp 15.000",
    priceLabel: "lima belas ribu rupiah",
    badge: "Paling dipesan",
    image: "/images/menu/nasi-campur.jpg",
    alt: "Nasi campur dengan lauk ayam, tahu, tempe, dan sayur",
    spotlight: true,
  },
  {
    slug: "ayam-goreng",
    name: "Ayam Goreng",
    description: "Ayam goreng gurih, renyah di luar dan lembut di dalam.",
    price: "Rp 12.000",
    priceLabel: "dua belas ribu rupiah",
    badge: "Lauk favorit",
    image: "/images/menu/ayam-goreng.jpg",
    alt: "Potongan ayam goreng berwarna keemasan",
  },
  {
    slug: "sayur-kangkung",
    name: "Sayur Kangkung",
    description: "Kangkung tumis bawang putih, segar dan sedikit pedas.",
    price: "Rp 8.000",
    priceLabel: "delapan ribu rupiah",
    badge: "Segar",
    image: "/images/menu/sayur-kangkung.jpg",
    alt: "Kangkung tumis di piring putih",
  },
  {
    slug: "kopi",
    name: "Kopi",
    description: "Kopi seduh rumahan — pilih dingin atau hangat saat memesan.",
    price: "Rp 8.000",
    priceLabel: "delapan ribu rupiah",
    badge: "Pilih suhu",
    image: "/images/menu/kopi.jpg",
    alt: "Segelas kopi",
    spotlight: true,
  },
];

export const impactSection = {
  eyebrow: "Dampak",
  titleLead: "Setara Itu",
  titleAccent: "Bisa Diukur",
  body: "Kami mencatat dampaknya bukan untuk pamer, tapi supaya bisa terus diperbaiki bersama.",
  stats: [
    { id: "tim", value: "24", label: "teman Tuli bekerja penuh waktu" },
    { id: "tamu", value: "1.200+", label: "tamu dilayani setiap bulan" },
    { id: "kelas", value: "8 kelas", label: "BISINDO gratis setiap tahun" },
  ],
  quote:
    "Awalnya saya malu memesan karena takut tidak dimengerti. Di sini saya justru belajar isyarat dari pelayannya.",
  quoteAuthor: "Rani, tamu tetap sejak 2023",
} as const;

/**
 * The shop's WhatsApp line.
 *
 * This is the single source of truth: the footer link, the cart's quick-order
 * link, the checkout handoff and the payment instructions all read from here, so
 * the number cannot drift apart across screens. `waLink` gives the digits-only
 * form wa.me requires; `display` keeps the readable grouping for the UI.
 */
export const contact = {
  /** E.164 without punctuation, as wa.me expects. */
  whatsappDigits: "628991301389",
  /** How the number is written on screen. */
  whatsappDisplay: "+62 899-1301-389",
  email: "pkmpilingkarsetara@gmail.com",
} as const;

/** `wa.me` deep link with an optional prefilled message. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${contact.whatsappDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const closingCta = {
  eyebrow: "Ayo Berkunjung",
  titleLead: "Makan Enak,",
  titleAccent: "Pulang Membawa Teman",
  body: "Kami buka setiap hari. Meja bisa dipesan lewat WhatsApp atau langsung datang — papan tulis dan kertas pesanan selalu siap di meja.",
  cta: { label: "Hubungi Kami", href: "/#kontak" },
  /** Real address and accounts, taken from the Menu page footer. */
  address:
    "Jalan Tondano (Jl. Drs. H. Ahmad Arbie), Kelurahan Molosipat U, Kecamatan Sipatana, Kota Gorontalo",
  hours: "Selasa – Minggu: 10.00 – 22.00 WITA",
  whatsapp: contact.whatsappDisplay,
  email: contact.email,
} as const;

export type SocialAccount = {
  id: string;
  handle: string;
  href: string;
  icon: IconName;
};

export const social: SocialAccount[] = [
  {
    id: "instagram",
    handle: "@pkmpi_lingkarsetara",
    href: "https://instagram.com/pkmpi_lingkarsetara",
    icon: "instagram",
  },
  {
    id: "tiktok",
    handle: "KEDAI TULI GORONTALO",
    href: "https://tiktok.com/@kedaituligorontalo",
    icon: "tiktok",
  },
];

/** Footer shortcut links; the maps entry also drives the map button. */
export const footerContact = [
  {
    id: "maps",
    label: "Buka di Google Maps",
    href: "https://maps.app.goo.gl/kGPzESMaZrRAhnQC6",
    mapsHref: "https://maps.app.goo.gl/kGPzESMaZrRAhnQC6",
  },
  {
    id: "menu-lengkap",
    label: "Lihat menu lengkap",
    href: "/menu",
    mapsHref: "",
  },
] as const;

export const footerUtility = [
  "© 2024 Lingkar Setara Eatery. Dijalankan oleh teman Tuli.",
  "Aksesibilitas",
  "Kebijakan Privasi",
  "Keberlanjutan",
  "Karier",
] as const;
