# Panduan deploy: Netlify + Upstash

Ditulis untuk kondisi di komputer ini: **Windows, PowerShell, tanpa Git**. Karena
itu jalur utamanya memakai **Netlify CLI**, yang mengunggah langsung dari folder —
tidak perlu GitHub dan tidak perlu zip.

Kalau nanti ingin deploy otomatis setiap kali kode berubah, lihat **Lampiran: jalur
GitHub** di bagian akhir.

---

## 0. Yang sudah selesai (jangan diulang)

- [x] Database Upstash dibuat dan **diuji**: `PING`, `HSET`, `HGET`, `HGETALL`,
      `HDEL`, `DEL` semuanya lulus
- [x] Kredensial tersimpan di `lingkar-setara/.env.local` (gitignored)
- [x] Pesanan asli diuji ujung-ke-ujung: masuk ke Redis, muncul di antrean kasir,
      isyarat 8/8 segmen siap, lalu dihapus kembali
- [x] `.gitignore` diperbaiki — klip isyarat tidak lagi dikecualikan
- [x] `netlify.toml` berisi build command, plugin Next.js, Node 22, cache, noindex

Yang tersisa: **membuat situs di Netlify, mengisi 5 environment variable, deploy.**

---

## 1. Masuk ke Netlify dari terminal

```powershell
cd C:\Users\Admin\Documents\deepseek-harness\default-workspace\lingkar-setara
npx netlify-cli login
```

Browser akan terbuka. Klik **Authorize**. Setelah muncul "Logged in", tutup tabnya
dan kembali ke terminal.

Kalau `npx` menanyakan "Need to install the following packages…", jawab **y**.

> Tidak perlu `npm install -g`. `npx` menjalankan versi terbaru tanpa memasangnya
> permanen.

---

## 2. Buat situsnya (deploy pertama)

```powershell
npx netlify-cli deploy --build --prod
```

Perintah ini akan:

1. Bertanya **"No site linked. Create a new site?"** → pilih **Create & configure a
   new site**
2. Bertanya nama tim/akun → pilih akun Anda (biasanya nama Anda)
3. Bertanya nama situs → tekan **Enter** untuk nama acak, atau isi misalnya
   `kedai-tuli-bersama` (kalau sudah dipakai orang lain, ganti)
4. Menjalankan `npm run build` (2–3 menit, karena 107 MB klip)
5. Mengunggah dan memberi Anda URL, misalnya
   `https://kedai-tuli-bersama.netlify.app`

**Deploy pertama ini memang belum lengkap** — environment variable belum ada. Itu
normal dan akan diperbaiki di langkah berikutnya. Jangan bagikan URL-nya dulu.

---

## 3. Isi 5 environment variable

Jalankan satu per satu, **ganti bagian dalam tanda kutip**:

```powershell
npx netlify-cli env:set ORDERS_STORAGE "redis"

npx netlify-cli env:set UPSTASH_REDIS_REST_URL "https://inviting-grouse-240721.upstash.io"

npx netlify-cli env:set UPSTASH_REDIS_REST_TOKEN "TOKEN_ANDA"

npx netlify-cli env:set KASIR_PASSWORD "SANDI_KASIR_BARU_ANDA"

npx netlify-cli env:set KASIR_COOKIE_SECURE "true"
```

`TOKEN_ANDA` adalah token 62 karakter dari `.env.local`
(`UPSTASH_REDIS_REST_TOKEN=...`).

### Membuat sandi kasir yang kuat

Jangan pakai `KedaiTuliBersama` — itu sudah tertulis di panduan ini dan di komputer
Anda. Buat yang baru:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
```

Salin hasilnya (24 karakter acak) dan pakai sebagai `KASIR_PASSWORD`. **Catat di
tempat aman** — kalau hilang, Anda harus menggantinya lewat `env:set` lagi.

### Periksa sudah masuk semua

```powershell
npx netlify-cli env:list
```

Harus muncul kelima-limanya. `KASIR_COOKIE_SECURE` wajib bernilai `true` (huruf
kecil) — kode memeriksa nilainya apa adanya, dan tanpa ini login kasir akan gagal
terus di HTTPS.

---

## 4. Deploy ulang

Environment variable dibaca saat function berjalan, jadi deploy ulang membuat
situsnya memakai database:

```powershell
npx netlify-cli deploy --build --prod
```

Tunggu sampai muncul **"Deploy is live!"** beserta URL-nya. **Inilah URL final
Anda** — catat.

---

## 5. Uji sampai benar-benar jalan

Buka URL itu di browser, lalu periksa berurutan:

| Uji | Harapan |
|---|---|
| `/` dan `/menu` | halaman tampil, 12 foto hidangan muncul |
| `/menu` → atur porsi → **Pesan** → checkout → **Kirim pesanan** | nomor `LS-…` terbit |
| Klik **Lihat versi bahasa isyarat** | video isyarat benar-benar diputar |
| `/kasir` → masuk dengan sandi baru | pesanan tadi muncul di antrean |
| `/kredit` | daftar atribusi foto tampil |

Kalau semua lolos, **deploy selesai.**

---

## 6. Buat QR untuk domain Netlify

QR yang ada sekarang masih menunjuk `192.168.1.9:3001` dan tidak berguna setelah
pindah. Ganti:

```powershell
cd C:\Users\Admin\Documents\deepseek-harness\default-workspace
python tools\make_qr.py --url https://URL-SITUS-ANDA.netlify.app
cd lingkar-setara
npm run build
npx netlify-cli deploy --build --prod
```

Lalu buka `/qr` di situs. Harus bertuliskan **"Kode ini cocok dengan alamat yang
sedang Anda buka."** Kalau masih merah, alamat di perintah tadi belum sama persis
dengan domain situs.

Setelah itu kartu meja (`/qr/kartu-meja.png`) siap dicetak.

---

## 7. Ganti token Upstash (penting)

Token yang Anda pakai sekarang pernah tertulis di riwayat percakapan. Setelah situs
jalan dan teruji:

1. Upstash → database → tab **REST API** → **Rotate token**
2. Salin token baru
3. Perbarui di dua tempat:

```powershell
npx netlify-cli env:set UPSTASH_REDIS_REST_TOKEN "TOKEN_BARU"
npx netlify-cli deploy --build --prod
```

Dan di `.env.local` lokal (baris `UPSTASH_REDIS_REST_TOKEN=`).

4. Pastikan masih tersambung:

```powershell
cd C:\Users\Admin\Documents\deepseek-harness\default-workspace
python tools\check_upstash.py
```

Harus berakhir dengan **"Database siap dipakai aplikasi."**

---

## Kalau ada yang gagal

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| Build sukses tapi semua rute **404** | plugin Next.js tidak aktif | pastikan `netlify.toml` ada di folder yang di-deploy; cek log build ada baris `@netlify/plugin-nextjs` |
| Semua segmen isyarat **"belum ada rekaman"** | klip tidak terunggah | `netlify.toml`/`public/` hilang? Cek `public/videos/isyarat` berisi 29 `.mp4` di komputer ini |
| Pesanan terkirim, `/kasir` **kosong** | env Upstash belum terbaca | `npx netlify-cli env:list`, lalu deploy ulang |
| `POST /api/orders` balas **500** | token salah / sudah dirotasi | `python tools\check_upstash.py`, lalu `env:set` token baru |
| `/kasir` **balik ke login terus** | `KASIR_PASSWORD` kosong, atau `KASIR_COOKIE_SECURE` bukan `true` | perbaiki, deploy ulang |
| `npx netlify-cli` **diblokir** | kebijakan PowerShell | jalankan `Set-ExecutionPolicy -Scope Process Bypass` lalu ulangi |
| Deploy **lama sekali** | 107 MB klip, unggahan pertama | normal; deploy berikutnya hanya mengirim yang berubah |

Melihat log deploy dari terminal:

```powershell
npx netlify-cli status
```

---

## Lampiran: jalur GitHub (opsional, untuk auto-deploy)

Hanya kalau nanti ingin Netlify build otomatis setiap `git push`. Butuh
**instal Git for Windows** dulu (<https://git-scm.com/download/win>) — di komputer
ini belum ada.

```powershell
git init
git add .
git commit -m "Kedai Tuli Bersama"
git remote add origin https://github.com/USERNAME/lingkar-setara.git
git branch -M main
git push -u origin main
```

Lalu Netlify → **Add new site** → **Import an existing project** → pilih repo.
`netlify.toml` mengatur build command, publish directory, dan plugin; Anda hanya
perlu mengisi environment variable yang sama seperti langkah 3.

`.gitignore` sudah diperbaiki, jadi klip isyarat ikut ter-commit. Verifikasi:

```powershell
git ls-files public/videos/isyarat | Measure-Object | Select-Object -ExpandProperty Count
```

Harus **29** (jumlah klip `.mp4`).
