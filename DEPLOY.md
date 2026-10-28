# Panduan deploy: Netlify + Upstash

> ## Status: jangan pakai `netlify deploy --build`
>
> `netlify deploy --build --prod` **gagal** di proyek ini dengan
> `MissingBlobsEnvironmentError` pada langkah *Uploading blobs*. Penyebabnya bukan
> kode aplikasi, melainkan Netlify: runtime Next.js membutuhkan **Blobs context**
> yang hanya disuntikkan ketika build berjalan **di server Netlify**. Build lokal
> lewat CLI tidak mendapatkannya.
>
> Sudah dipastikan: CLI 27.15.0 (versi terbaru) juga gagal, dan pengguna lain
> melaporkan hal sama —
> [CLI deploys only](https://answers.netlify.com/t/missingblobsenvironmenterror-502-on-cli-deploys-only-persists-after-the-sydney-blobs-incident-fix/164135),
> [fresh sites](https://answers.netlify.com/t/missingblobsenvironmenterror-on-fresh-sites/164777).
>
> **Karena itu build harus dilakukan di server Netlify, dan itu hanya bisa lewat
> repo Git.** Jalur di bawah sudah disesuaikan.

Ditulis untuk kondisi di komputer ini: **Windows, PowerShell, tanpa Git terpasang**.
Lihat lampiran untuk memasang Git tanpa hak admin.

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

## 1. Aktifkan Git dan GitHub CLI untuk sesi ini

Keduanya portable, tidak masuk PATH, jadi tambahkan per jendela PowerShell:

```powershell
$env:PATH = "C:\Users\Admin\Documents\deepseek-harness\default-workspace\.tools\git\cmd;C:\Users\Admin\Documents\deepseek-harness\default-workspace\.tools\gh\bin;" + $env:PATH

cd C:\Users\Admin\Documents\deepseek-harness\default-workspace\lingkar-setara
git --version
gh --version
```

## 2. Masuk ke GitHub

Repo lokal **sudah di-commit**, jadi tinggal diunggah. Butuh akun GitHub (gratis);
kalau belum punya, `gh auth login` akan mengarahkan ke pendaftaran.

```powershell
gh auth login
```

Jawab berurutan:

1. **GitHub.com**
2. **HTTPS**
3. **Login with a web browser**
4. Catat kode 8 karakter yang muncul (mis. `A1B2-C3D4`)
5. Tekan **Enter** → browser terbuka → tempel kode → **Authorize**

Tidak perlu Personal Access Token.

## 3. Buat repo dan unggah

```powershell
gh repo create lingkar-setara --public --source . --remote origin --push
```

Satu perintah ini membuat repo, memasang remote, dan mengunggah 188 berkas termasuk
29 klip. Tunggu sampai selesai (112 MB).

Verifikasi:

```powershell
gh repo view --web
```

## 4. Sambungkan repo ke situs Netlify yang sudah ada

Jangan buat situs baru — situs Anda sudah terbuat (`siteId 28e5557a-…`), jadi URL-nya
tetap.

> Buka <https://app.netlify.com> → pilih situs Anda → **Site configuration** →
> **Build & deploy** → **Continuous deployment** → **Link repository** →
> **GitHub** → pilih `lingkar-setara`

Build settings otomatis dari `netlify.toml` (command `npm run build`, publish
`.next`, plugin Next.js). Deploy pertama akan langsung berjalan di server Netlify —
di sinilah error Blobs tadi hilang.

---

## 5. Isi 5 environment variable

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

## 6. Deploy ulang

Environment variable dibaca saat function berjalan, jadi deploy ulang membuat
situsnya memakai database. Sekarang deploy terjadi lewat Git — Netlify build di
servernya sendiri:

```powershell
git commit --allow-empty -m "Terapkan environment variable"
git push
```

Atau dari dashboard: **Deploys** → **Trigger deploy** → **Deploy site**.

Tunggu sampai selesai. **Inilah URL final Anda** — catat.

---

## 7. Uji sampai benar-benar jalan

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

## 8. Buat QR untuk domain Netlify

QR yang ada sekarang masih menunjuk `192.168.1.9:3001` dan tidak berguna setelah
pindah. Ganti:

```powershell
cd C:\Users\Admin\Documents\deepseek-harness\default-workspace
python tools\make_qr.py --url https://URL-SITUS-ANDA.netlify.app
cd lingkar-setara
git add .
git commit -m "QR untuk domain Netlify"
git push
```

Lalu buka `/qr` di situs. Harus bertuliskan **"Kode ini cocok dengan alamat yang
sedang Anda buka."** Kalau masih merah, alamat di perintah tadi belum sama persis
dengan domain situs.

Setelah itu kartu meja (`/qr/kartu-meja.png`) siap dicetak.

---

## 9. Ganti token Upstash (penting)

Token yang Anda pakai sekarang pernah tertulis di riwayat percakapan. Setelah situs
jalan dan teruji:

1. Upstash → database → tab **REST API** → **Rotate token**
2. Salin token baru
3. Perbarui di dua tempat:

```powershell
npx netlify-cli env:set UPSTASH_REDIS_REST_TOKEN "TOKEN_BARU"
git commit --allow-empty -m "Token Upstash baru"
git push
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

## Lampiran: memasang Git tanpa admin

Installer Git for Windows dan `winget install Git.Git` sama-sama gagal di komputer
ini (butuh elevation: `0x8A150001`). Solusinya **PortableGit** — cukup diekstrak, tidak
ada instalasi sistem:

```powershell
# unduh sekali, lalu ekstrak (tanpa admin)
# https://github.com/git-for-windows/git/releases → PortableGit-*-64-bit.7z.exe
& "$env:USERPROFILE\Downloads\PortableGit-2.56.0.4-64-bit.7z.exe" -y -o"C:\path\git"
```

Di mesin ini sudah terpasang di:

```
C:\Users\Admin\Documents\deepseek-harness\default-workspace\.tools\git\cmd\git.exe
```

Karena tidak masuk PATH, tambahkan per sesi:

```powershell
$env:PATH = "C:\Users\Admin\Documents\deepseek-harness\default-workspace\.tools\git\cmd;" + $env:PATH
git --version
```

GitHub CLI juga tersedia portable, sehingga **tidak perlu Personal Access Token**:

```
C:\Users\Admin\Documents\deepseek-harness\default-workspace\.tools\gh\bin\gh.exe
```

```powershell
$env:PATH = "C:\Users\Admin\Documents\deepseek-harness\default-workspace\.tools\gh\bin;" + $env:PATH
gh auth login                                  # browser + kode sekali pakai
gh repo create lingkar-setara --public --source . --remote origin --push
```

Repo lokalnya sudah di-commit (`72bc9cf`, 188 berkas, 29 klip), jadi `gh repo create`
langsung mengunggah semuanya.

---

## Lampiran lama: jalur GitHub manual

Hanya kalau ingin mengurus remote sendiri tanpa `gh`:

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
git ls-files "public/videos/isyarat/*.mp4" | Measure-Object | Select-Object -ExpandProperty Count
```

Harus **29** (jumlah klip `.mp4`).
