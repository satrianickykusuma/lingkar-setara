/**
 * Copy for the cashier (staff) side of the sign-language feature.
 *
 * Kept apart from the guest-facing checkout copy because the two audiences want
 * different things: the guest gets a code and can learn the signs, the counter
 * gets a screen that reacts on its own.
 */

export const cashierCopy = {
  eyebrow: "Layar kasir",
  title: "Pesanan masuk otomatis",
  body: "Biarkan halaman ini terbuka di perangkat kasir. Begitu ada pesanan baru, layar berpindah sendiri dan memutar versi bahasa isyaratnya.",

  /** Waiting screen. */
  idleTitle: "Menunggu pesanan masuk",
  idleBody:
    "Layar ini memantau pesanan baru terus-menerus. Pastikan perangkat tetap menyala dan halaman tetap terbuka.",
  watching: "Memantau pesanan baru…",
  lastChecked: "Terakhir diperiksa",
  waitingNow: "sedang menunggu disiapkan",
  noOrdersYet:
    "Belum ada pesanan yang menunggu. Kirim satu lewat halaman pembayaran untuk mencoba.",
  openQueue: "Buka pesanan paling lama",
  tutorialLink: "Panduan menyalakan layar kasir",

  /** The display screen for one order. */
  nowServing: "Sedang ditampilkan",
  queueNext: "Berikutnya di antrean",
  queueEmpty: "Tidak ada antrean lain",
  markReady: "Tandai sudah disiapkan",
  markReadyDone: "Sudah disiapkan",
  markDone: "Tandai selesai",
  markDoneDone: "Selesai",
  autoPlayOn: "Putar otomatis aktif",
  autoPlayOff: "Putar otomatis nonaktif",
  autoPlayBody:
    "Urutan isyarat mulai sendiri saat rekaman tersedia. Segmen tanpa rekaman ditandai dan dilewati.",
  noClipYet:
    "Belum ada klip isyarat yang tersedia untuk pesanan ini, jadi tidak ada yang bisa diputar. Unggah rekaman di folder klip lalu muat ulang.",

  /** Sound alert. */
  soundOn: "Nyalakan bunyi",
  soundOff: "Matikan bunyi",
  soundBlocked:
    "Peramban memblokir bunyi sampai ada interaksi. Ketuk tombol ini sekali untuk mengaktifkan.",
  notified: "Pesanan baru",
} as const;
