import type { IconName } from "@/data/icons";
import { contact } from "@/data/content";

/**
 * The menu, derived from the sign recordings.
 *
 * Every dish here has a matching sign clip, and every optional choice maps to a
 * recorded sign (`porsi-1`…`porsi-10`, `kondimen-*`, `suhu-*`). That is the
 * constraint the catalogue is built on: a dish without a sign, or an option the
 * vocabulary cannot express, is left out rather than silently unsupported.
 *
 * The supplied footage has no greeting, payment or delivery signs, so the order
 * form offers only **makan di sini** and **bawa pulang**.
 */

export type MenuCategoryId = "nasi" | "lauk" | "sayur" | "camilan" | "minuman";

/** Which choices a dish accepts. Each maps to a recorded sign. */
export type ItemOptions = {
  /** Dingin / hangat — drinks only. */
  temperature: boolean;
  /** Pakai rica / tidak pakai rica — savoury food. */
  chili: boolean;
  /** Pakai kecap — savoury food. */
  soy: boolean;
};

export type MenuItem = {
  /** Stable id, also the cart line key. */
  id: string;
  name: string;
  description: string;
  /** Whole rupiah, so the cart can sum without parsing the display string. */
  price: number;
  /** Printed on the menu card and shown next to the sign-language icon. */
  code: string;
  category: MenuCategoryId;
  /** Display labels for the card. */
  tags: string[];
  badge?: { label: string; icon: IconName };
  image: string;
  alt: string;
  /**
   * Gloss id of this dish's recording. Must exist in `server/sign/glossary.ts`;
   * `tools/check_vocabulary.py` verifies the pairing.
   */
  signId: string;
  options: ItemOptions;
};

export type MenuFilterId = "all" | "chili" | "soy" | "temperature";

export type MenuFilter = {
  id: MenuFilterId;
  label: string;
  icon: IconName;
  /** Shown only when it explains something about the choice. */
  hint: string;
};

/** Only the two ways of serving that have a recorded sign. */
export type ServingId = "makan-sini" | "bawa-pulang";

export type Serving = {
  id: ServingId;
  label: string;
  blurb: string;
  icon: IconName;
  /** Gloss id in the vocabulary. */
  signId: string;
};

export const servings: Serving[] = [
  {
    id: "makan-sini",
    label: "Makan di sini",
    blurb: "Disajikan di piring, langsung di meja.",
    icon: "restaurantMenu",
    signId: "layanan-makan-sini",
  },
  {
    id: "bawa-pulang",
    label: "Bawa pulang",
    blurb: "Dibungkus rapi untuk dibawa pergi.",
    icon: "takeawayBag",
    signId: "layanan-bawa-pulang",
  },
];

/** Portions 1–10, each with its own recording. */
export const PORSI_MIN = 1;
export const PORSI_MAX = 10;

export type ChiliChoice = "pakai" | "tanpa";

export type TemperatureChoice = "dingin" | "hangat";

export const chiliChoice = {
  question: "Rica (sambal)",
  options: [
    { id: "pakai" as ChiliChoice, label: "Pakai rica", signId: "kondimen-pakai-rica" },
    { id: "tanpa" as ChiliChoice, label: "Tidak pakai", signId: "kondimen-tanpa-rica" },
  ],
} as const;

export const soyChoice = {
  question: "Kecap",
  label: "Pakai kecap",
  signId: "kondimen-kecap",
} as const;

export const temperatureChoice = {
  question: "Suhu",
  options: [
    { id: "dingin" as TemperatureChoice, label: "Dingin", signId: "suhu-dingin" },
    { id: "hangat" as TemperatureChoice, label: "Hangat", signId: "suhu-hangat" },
  ],
} as const;

export function porsiSignId(porsi: number): string {
  const clamped = Math.min(PORSI_MAX, Math.max(PORSI_MIN, Math.round(porsi)));
  return `porsi-${clamped}`;
}

export const menuCategories: { id: MenuCategoryId | "all"; label: string }[] = [
  { id: "all", label: "Semua Menu" },
  { id: "nasi", label: "Nasi" },
  { id: "lauk", label: "Lauk Goreng" },
  { id: "sayur", label: "Sayur" },
  { id: "camilan", label: "Camilan" },
  { id: "minuman", label: "Minuman" },
];

export const menuFilters: MenuFilter[] = [
  { id: "all", label: "Semua", icon: "eco", hint: "Tampilkan seluruh menu" },
  { id: "chili", label: "Bisa pilih rica", icon: "flame", hint: "Ada isyarat pakai / tidak pakai rica" },
  { id: "soy", label: "Bisa pakai kecap", icon: "bottle", hint: "Ada isyarat kecap" },
  { id: "temperature", label: "Bisa dingin / hangat", icon: "snow", hint: "Ada isyarat suhu" },
];

const FOOD_ONLY: ItemOptions = { temperature: false, chili: true, soy: true };
const DRINK_ONLY: ItemOptions = { temperature: true, chili: false, soy: false };

export const menuCatalog: MenuItem[] = [
  {
    id: "nasi-campur",
    name: "Nasi Campur",
    description: "Nasi putih dengan aneka lauk rumahan: ayam, tahu, tempe, dan sayur.",
    price: 15000,
    code: "NC-01",
    category: "nasi",
    tags: ["Porsi lengkap", "Lauk campur"],
    badge: { label: "Isyarat tersedia", icon: "signLanguage" },
    image: "/images/menu/nasi-campur.jpg",
    alt: "Nasi campur dengan lauk ayam, tahu, tempe, dan sayur",
    signId: "makanan-nasi-campur",
    options: FOOD_ONLY,
  },
  {
    id: "nasi-goreng",
    name: "Nasi Goreng",
    description: "Nasi goreng kampung dengan bumbu bawang dan sedikit kecap.",
    price: 15000,
    code: "NG-02",
    category: "nasi",
    tags: ["Digoreng", "Bumbu kampung"],
    image: "/images/menu/nasi-goreng.jpg",
    alt: "Sepiring nasi goreng kampung dengan irisan telur",
    signId: "makanan-nasi-goreng",
    options: FOOD_ONLY,
  },
  {
    id: "ayam-goreng",
    name: "Ayam Goreng",
    description: "Potongan ayam goreng gurih, renyah di luar dan lembut di dalam.",
    price: 12000,
    code: "AG-03",
    category: "lauk",
    tags: ["Lauk", "Gorengan"],
    image: "/images/menu/ayam-goreng.jpg",
    alt: "Potongan ayam goreng berwarna keemasan",
    signId: "makanan-ayam-goreng",
    options: FOOD_ONLY,
  },
  {
    id: "ikan-goreng",
    name: "Ikan Goreng",
    description: "Ikan goreng segar dengan bumbu kunyit dan garam.",
    price: 13000,
    code: "IG-04",
    category: "lauk",
    tags: ["Lauk", "Ikan"],
    image: "/images/menu/ikan-goreng.jpg",
    alt: "Ikan goreng utuh dengan bumbu kunyit",
    signId: "makanan-ikan-goreng",
    options: FOOD_ONLY,
  },
  {
    id: "tahu-goreng",
    name: "Tahu Goreng",
    description: "Tahu goreng hangat, cocok sebagai lauk atau camilan.",
    price: 3000,
    code: "TG-05",
    category: "lauk",
    tags: ["Lauk", "Nabati"],
    image: "/images/menu/tahu-goreng.jpg",
    alt: "Beberapa potong tahu goreng keemasan",
    signId: "makanan-tahu-goreng",
    options: FOOD_ONLY,
  },
  {
    id: "tempe-goreng",
    name: "Tempe Goreng",
    description: "Tempe goreng gurih, digoreng hingga kecokelatan.",
    price: 3000,
    code: "TM-06",
    category: "lauk",
    tags: ["Lauk", "Nabati"],
    image: "/images/menu/tempe-goreng.jpg",
    alt: "Irisan tempe goreng berwarna keemasan",
    signId: "makanan-tempe-goreng",
    options: FOOD_ONLY,
  },
  {
    id: "sayur-campur",
    name: "Sayur Campur",
    description: "Aneka sayur ditumis bersama bumbu rumahan.",
    price: 8000,
    code: "SC-07",
    category: "sayur",
    tags: ["Sayur", "Tumis"],
    image: "/images/menu/sayur-campur.jpg",
    alt: "Semangkuk sayur campur tumis berwarna segar",
    signId: "makanan-sayur-campur",
    options: FOOD_ONLY,
  },
  {
    id: "sayur-kangkung",
    name: "Sayur Kangkung",
    description: "Kangkung tumis dengan bawang putih dan sedikit rica.",
    price: 8000,
    code: "SK-08",
    category: "sayur",
    tags: ["Sayur", "Tumis"],
    image: "/images/menu/sayur-kangkung.jpg",
    alt: "Kangkung tumis di piring putih",
    signId: "makanan-sayur-kangkung",
    options: FOOD_ONLY,
  },
  {
    id: "pisang-goreng",
    name: "Pisang Goreng",
    description: "Pisang goreng hangat dengan balutan tepung tipis.",
    price: 10000,
    code: "PG-09",
    category: "camilan",
    tags: ["Camilan", "Manis"],
    image: "/images/menu/pisang-goreng.jpg",
    alt: "Pisang goreng keemasan di atas piring",
    signId: "makanan-pisang-goreng",
    options: FOOD_ONLY,
  },
  {
    id: "pisang-stik",
    name: "Pisang Stik",
    description: "Pisang stik renyah, cocok untuk teman minum.",
    price: 10000,
    code: "PS-10",
    category: "camilan",
    tags: ["Camilan", "Renyah"],
    image: "/images/menu/pisang-stik.jpg",
    alt: "Pisang stik renyah berwarna keemasan",
    signId: "makanan-pisang-stik",
    options: FOOD_ONLY,
  },
  {
    id: "kopi",
    name: "Kopi",
    description: "Kopi seduh rumahan, bisa dingin atau hangat.",
    price: 8000,
    code: "KP-11",
    category: "minuman",
    tags: ["Minuman", "Pilih suhu"],
    badge: { label: "Pilih suhu", icon: "snow" },
    image: "/images/menu/kopi.jpg",
    alt: "Segelas kopi",
    signId: "minuman-kopi",
    options: DRINK_ONLY,
  },
  {
    id: "pop-ice",
    name: "Pop Ice",
    description: "Minuman serbuk rasa buah, disajikan dingin.",
    price: 7000,
    code: "PI-12",
    category: "minuman",
    tags: ["Minuman", "Dingin"],
    image: "/images/menu/pop-ice.jpg",
    alt: "Segelas pop ice warna buah dengan es",
    signId: "minuman-pop-ice",
    options: DRINK_ONLY,
  },
];

/** Fast lookup for the cart, which stores only ids and choices. */
export const menuById: Record<string, MenuItem> = Object.fromEntries(
  menuCatalog.map((item) => [item.id, item]),
);

export const menuHero = {
  badge: "Menu Isyarat",
  title: "Menu Kedai Tuli Bersama",
  body: "Setiap hidangan dan setiap pilihan di halaman ini punya rekaman isyaratnya sendiri. Pesanan Anda nanti diputar kembali sebagai isyarat di layar kasir.",
  assistTitle: "Pemesanan Nyaman",
  assistSteps: "Pilih • Atur porsi • Isyarat",
  assistBody:
    "Semua pilihan yang tersedia — porsi, rica, kecap, dan suhu — sudah tersedia dalam bentuk isyarat, sehingga pesanan bisa disampaikan tanpa suara.",
  catalogTitle: "Katalog Hidangan",
  /** The button already draws a plus icon, so the label must not repeat it. */
  addLabel: "Pesan",
  searchPlaceholder: "Cari nasi, lauk, sayur, atau minuman…",
} as const;

export const cartCopy = {
  triggerLabel: "Keranjang belanja",
  title: "Keranjang Anda",
  emptyTitle: "Keranjang masih kosong",
  emptyBody: "Pilih hidangan dari katalog, atur porsinya, lalu tekan “+ Pesan”.",
  subtotalLabel: "Subtotal",
  taxNote: "Belum termasuk pajak. Pembayaran di kasir.",
  /** Primary path: the three-step checkout at /pembayaran. */
  payLabel: "Lanjut ke pembayaran",
  /** Secondary path, kept for guests who already know what they want. */
  quickOrderLabel: "atau kirim cepat lewat WhatsApp",
  checkoutLabel: "Kirim Pesanan via WhatsApp",
  clearLabel: "Kosongkan keranjang",
  closeLabel: "Tutup keranjang",
  floatingEmptyTitle: "Pesanan masih kosong",
  floatingEmptyBody: "Pilih menu favorit Anda",
  addLabel: "+ Pesan",
  /**
   * Read from `contact` in data/content.ts instead of repeated here, so the cart,
   * the footer and the checkout can never disagree about the number.
   */
  whatsappDigits: contact.whatsappDigits,
} as const;
