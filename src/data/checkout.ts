import type { IconName } from "@/data/icons";
import type { CartLine } from "@/components/cart/cart-store";
import { contact } from "@/data/content";
import { servings, type ServingId } from "@/data/menu";

/**
 * Checkout content.
 *
 * The serving options are not defined here: they come from `menu.ts`, because each
 * one has a recorded sign and the order form must not offer anything the vocabulary
 * cannot say. Payment methods live here because they are *not* signed — they exist
 * only for the WhatsApp handoff.
 */

export type ServiceType = ServingId;

export type PaymentMethodId = "qris" | "ewallet" | "transfer" | "cash";

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  /** One-line promise shown on the option card. */
  blurb: string;
  icon: IconName;
  /** Shown on the success screen: what the guest must do next. */
  instructions: string;
  /** Where the money goes. Illustrative — no provider is connected yet. */
  destination: string;
};

export type ServiceOption = {
  id: ServiceType;
  name: string;
  blurb: string;
  icon: IconName;
  /** Fee in rupiah added to the subtotal, or 0. */
  fee: number;
  feeLabel: string;
  /** Gloss id that represents this choice in sign language. */
  signId: string;
};

export type PlacedOrder = {
  code: string;
  createdAt: string;
  /** Server-side id, once the order has been recorded by /api/orders. */
  orderId?: string;
  lines: CartLine[];
  subtotal: number;
  serviceFee: number;
  total: number;
  itemCount: number;
  service: ServiceType;
  customer: { name: string; phone: string };
  notes: string;
  payment: PaymentMethodId;
  /**
   * Set when the order reached the backend, so the success screen can offer the
   * sign-language playback link. Absent means the record call did not complete.
   */
  signPlanPath?: string;
};

/* ── Service options ──────────────────────────────────────────────────────── */

/**
 * Both serving options are free and neither needs an address: the shop only has
 * recordings for "eat here" and "takeaway", and there is no delivery sign.
 */
export const serviceOptions: ServiceOption[] = servings.map((serving) => ({
  id: serving.id,
  name: serving.label,
  blurb: serving.blurb,
  icon: serving.icon,
  fee: 0,
  feeLabel: "Tanpa biaya tambahan",
  signId: serving.signId,
}));

/* ── Payment methods ──────────────────────────────────────────────────────── */

export const paymentMethods: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    blurb: "Pindai satu kode dari semua bank dan e-wallet.",
    icon: "qrCode",
    instructions:
      "Kode QRIS tampil di meja kasir dan di layar konfirmasi. Pindai, lalu tunjukkan bukti bayar ke kasir.",
    destination: "QRIS Kedai Tuli Bersama",
  },
  {
    id: "ewallet",
    name: "E-wallet",
    blurb: "GoPay, OVO, DANA, atau ShopeePay.",
    icon: "wallet",
    instructions:
      "Sebutkan nomor pesananmu di kasir, lalu bayar dari aplikasi e-wallet pilihanmu.",
    destination: `Kedai Tuli Bersama · ${contact.whatsappDisplay}`,
  },
  {
    id: "transfer",
    name: "Transfer bank",
    blurb: "BCA atau Mandiri, konfirmasi lewat WhatsApp.",
    icon: "bank",
    instructions:
      "Transfer sesuai total, lalu kirim bukti transfer ke WhatsApp kami dengan menyebut nomor pesanan.",
    destination: "BCA 1234567890 · a.n. Kedai Tuli Bersama",
  },
  {
    id: "cash",
    name: "Tunai di kasir",
    blurb: "Bayar saat pesanan diambil atau disajikan.",
    icon: "banknote",
    instructions:
      "Bayar tunai di kasir. Sebutkan nomor pesanan agar kasir menemukan pesananmu dengan cepat.",
    destination: "Kasir Kedai Tuli Bersama",
  },
];

/* ── Fees ─────────────────────────────────────────────────────────────────── */

/** No fees: the vocabulary has no fee sign, and neither serving option costs more. */
export function serviceFeeFor(service: ServiceType): number {
  return serviceOptions.find((option) => option.id === service)?.fee ?? 0;
}

export const paymentCopy = {
  eyebrow: "Pembayaran",
  title: "Selesaikan Pesananmu",
  body: "Tiga langkah singkat. Pilihan porsi, rica, kecap, dan suhu yang kamu buat di menu akan diputar sebagai isyarat di layar kasir.",
  steps: ["Pesanan", "Data & layanan", "Pembayaran"],
  draftNotice:
    "Keranjangmu tersimpan di perangkat ini, jadi kamu bisa menutup halaman dan melanjutkan nanti.",
  feeNotice:
    "Metode pembayaran tidak punya isyarat, jadi hanya ditulis di pesan WhatsApp — bukan di urutan isyarat.",
  emptyTitle: "Keranjang masih kosong",
  emptyBody: "Pilih hidangan dari menu, lalu kembali ke halaman ini untuk membayar.",
  emptyCta: { label: "Buka menu", href: "/menu" },
  successTitle: "Pesanan terkirim",
  successBody:
    "Kami sudah menerima rincianmu. Kasir akan mengonfirmasi lewat WhatsApp sebelum pesanan disiapkan.",
  orderCodeLabel: "Nomor pesanan",
  sendAgain: "Kirim ulang ke WhatsApp",
  /** Dismisses the stored order so the next order can be started. */
  dismissOrder: "Pesan lagi",
  /** Opens the guest's own sign-language view of this order. */
  openSignPlayer: "Lihat versi bahasa isyarat",
  /** Shown when the order never reached the backend. */
  notRecordedNotice:
    "Pesanan belum tersimpan di server, jadi versi bahasa isyaratnya belum bisa dibuka. Kirim ulang setelah koneksi membaik.",
} as const;
