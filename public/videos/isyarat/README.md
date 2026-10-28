# Sign-language clips

These are the real recordings, one per sign. The filename **is** the wiring: the
gloss id in `src/server/sign/glossary.ts` must match the file stem.

```
public/videos/isyarat/
  makanan-nasi-campur.mp4   # the clip
  makanan-nasi-campur.jpg   # optional poster frame
  …
```

## What arrived and what was done to it

The shop supplied 30 recordings as **HEVC (hvc1) inside `.mov`**, 1920×1080 at
~56 fps and ~23 Mbps — 818 MB. Browsers refuse that: Chrome reports
`canPlayType('video/mp4; codecs="hvc1"') === ""`, so the player would silently skip
every clip.

`tools/transcode_sign_clips.py` re-encodes each one to **H.264 MP4, 1280 wide,
30 fps, no audio, `+faststart`**:

| | Before | After |
|---|---|---|
| Files used | 30 | 29 |
| Total | 818 MB | 105 MB |
| Codec | HEVC | H.264 (plays everywhere) |

The 30th file, `1–10 Porsi.mov` (200 MB), is the ten portion clips concatenated and
nothing uses it, so it was not transcoded.

The originals are kept in `video-sources/isyarat-asli/` — **outside `public/`**, so
they are not served over HTTP — in case a re-encode is needed at another quality.

## Naming

| Source file | Gloss id |
|---|---|
| `1 Porsi` … `10 Porsi` | `porsi-1` … `porsi-10` |
| `Saya Mau Pesan Nasi Campur` | `makanan-nasi-campur` |
| `Saya Mau Pesan Nasi Goreng` | `makanan-nasi-goreng` |
| `Ayam Goreng` | `makanan-ayam-goreng` |
| `Ikan Goreng` | `makanan-ikan-goreng` |
| `Tahu Goreng` | `makanan-tahu-goreng` |
| `Tempe Goreng` | `makanan-tempe-goreng` |
| `Sayur Campur` | `makanan-sayur-campur` |
| `Sayur Kangkung` | `makanan-sayur-kangkung` |
| `Saya Mau Pesan Pisang Goreng` | `makanan-pisang-goreng` |
| `Saya Mau Pesan Pisang Stik` | `makanan-pisang-stik` |
| `Saya Mau Pesan Minuman Kopi` | `minuman-kopi` |
| `Saya Mau Pesan Minuman Pop Ice` | `minuman-pop-ice` |
| `Makan Di sini` | `layanan-makan-sini` |
| `Bawa Pulang` | `layanan-bawa-pulang` |
| `Dingin` / `Hangat` | `suhu-dingin` / `suhu-hangat` |
| `Kecap` | `kondimen-kecap` |
| `Pakai Rica` / `Tidak Pakai Rica` | `kondimen-pakai-rica` / `kondimen-tanpa-rica` |

## Adding or replacing a clip

1. Drop the new file in, named after its gloss id (`.mp4`, `.mov`, `.webm` or
   `.m4v`; `.jpg`/`.png`/`.webp` for a poster).
2. If it is a new *concept*, add the gloss to `glossary.ts` too.
3. **Rebuild** — `npm run build`, then `npm start`.

Step 3 is not optional. `next start` serves `public/` from a manifest baked at build
time, so a file added afterwards returns **404** even though it is on disk. This was
observed here: posters generated after a build 404'd until the next build, while
older clips kept serving fine. The checklist and the plan API read the directory
directly, so they will list the new clip before the browser can actually fetch it —
which is exactly the confusing half-state to avoid.

(`next dev` picks new files up without a rebuild, but the dev server does not
hydrate in this environment — see the main README.)

## Poster frames

`tools/make_sign_posters.py` extracts one frame per clip (at 0.6 s) so the player
shows the signer instead of a black rectangle before playback starts.

```
python tools/make_sign_posters.py          # all clips
python tools/make_sign_posters.py --at 1.2 # later frame
```

Remember to rebuild afterwards, per step 3 above.

## Re-running the transcode

```
python tools/transcode_sign_clips.py                     # all 29
python tools/transcode_sign_clips.py --only porsi-1 --crf=26
```

## Why the media is not committed

`.gitignore` excludes `*.mp4`/`*.mov`/`*.webm` here (105 MB) and the whole
`video-sources/` folder (818 MB). Keep this README so the folder survives a clone,
and distribute the recordings separately.
