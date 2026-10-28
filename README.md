# Lingkar Setara — Beranda, Menu & Belajar Isyarat

Three-page Next.js App Router site (TypeScript + Tailwind CSS v4) for a deaf-run
eatery.

The content comes from the supplied `PKM-PI Lingkar Setara` HTML pages, the UI
language is inherited from the `savor-by-areej` project in the same workspace,
and the colour palette is Lingkar Setara's own "Electric Ocean & Sage".

| Route | Who | Source |
|---|---|---|
| `/` | guest | `Home/Home.html` |
| `/menu` | guest | `Menu/Menu.html` |
| `/belajar-isyarat` | guest | `Belajar Isyarat/Belajar Isyarat.html` |
| `/pembayaran` | guest | added: three-step checkout |
| `/pesanan/<kode>` | guest | added: the customer's own order in sign language |
| `/kredit` | guest | added: photo attribution (licence requirement) |
| `/qr` | staff-ish | added: scannable code + printable table card |
| `/kasir/masuk` | staff | added: sign-in door |
| `/kasir` | staff | added: the counter monitor screen |
| `/kasir/daftar` | staff | added: order index + vocabulary progress |
| `/kasir/<kode>` | staff | added: sign playback for one order |
| `/kasir/rekaman` | staff | added: recording checklist |

Guest pages and staff pages are separate trees. Nothing under `/kasir` is linked
from a guest page — staff bookmark `/kasir`. All pages share one header, footer and
cart.

## API

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/orders` | public | record an order and compile its sign plan |
| `GET /api/isyarat/rencana/:id` | public | one order's sign plan, by id **or** printed code |
| `GET /api/orders` | staff | recent orders — lists every guest's name and phone |
| `DELETE /api/orders` | staff | clear the store, or one order with `?id=` |
| `PATCH /api/orders/:id` | staff | advance `status` (baru → dikonfirmasi → disiapkan → selesai) |
| `GET /api/kasir/antrean` | staff | the cashier feed; `?since=` makes it a long-poll |
| `GET /api/kasir/katalog` | staff | the vocabulary + which clips exist on disk |
| `POST`/`DELETE /api/kasir/sesi` | — | staff sign in / out |

“Public” means a guest may call it: `POST /api/orders` has to be open, and
`/api/isyarat/rencana/:id` is what the guest's own order page reads. Everything that
touches *other people's* orders needs a staff session — `GET /api/orders` is
staff-only precisely because it lists every guest's name and phone number.

The sign-plan endpoint keys off the order code, which is a weak identifier: anyone
who knows a code can read that one order's plan. That is acceptable at a shop
counter — the plan reveals no more than the guest already has — but codes are
public identifiers, not an authorisation boundary.

## Staff access

The cashier area sits behind a shared password, on its own URL tree.

```
/kasir          -> redirects to /kasir/masuk when there is no session
/kasir/masuk    -> the sign-in door
```

Setup:

```bash
cp .env.example .env.local
# then edit KASIR_PASSWORD in .env.local
```

| Variable | Meaning |
|---|---|
| `KASIR_PASSWORD` | **Required.** The shop's staff password. |
| `KASIR_SESSION_SECRET` | Optional. Cookie signing key; defaults to the password. |
| `KASIR_COOKIE_SECURE` | `true` **only** when served over HTTPS. |

How it works, and what it deliberately is not:

- The password is never stored in the cookie. The cookie is `<expiry>.<HMAC>`,
  valid 12 hours, `HttpOnly`, `SameSite=Lax`, and the comparison is constant-time.
- An unset `KASIR_PASSWORD` locks the area for **everyone** rather than opening it.
  Failing closed is the point: a locked door gets noticed, an open one does not.
- This is one shared password for one shop, **not** a user system. No accounts, no
  roles, no audit trail, and no rate limiting beyond a fixed delay on a wrong
  password. Fine for a single till on a private network; not enough for several
  staff who each need revoking.

Day to day: bookmark `/kasir` on the till device, sign in once, tap **Nyalakan
bunyi**, and leave the tab open.

### A redirect loop worth remembering

`app/kasir/layout.tsx` originally guarded **every** path under `/kasir` — including
`/kasir/masuk`, the sign-in page itself. The guard redirected that page to itself
until the browser gave up with *“redirected you too many times”*, which made the
whole area look broken while the checks all passed at the HTTP level.

The fix is a route group: the guard and all protected pages live in
`app/kasir/(terlindungi)/`, and the login page sits at `app/kasir/masuk/`, outside
that layout. Parentheses keep the segment out of the URL, so the public paths are
unchanged. **When adding a cashier page, put it inside `(terlindungi)/`** or it
will be served without a session check.

## Who sees what

The guest and the counter want opposite things from the same sign plan, so there
are two separate screens — and the customer can only reach their own.

| Screen | Audience | Behaviour |
|---|---|---|
| `/pesanan/<kode>` (from the success screen) | guest | manual: nothing plays on its own, no queue, no status buttons |
| `/kasir` | counter device, left open | watches for orders and opens each one by itself |
| `/kasir/<kode>` | staff | auto-play, advance, loop, status buttons |
| `/kasir/daftar` | staff | index of orders + vocabulary progress |
| `/kasir/rekaman` | the maker | recording checklist |

The guest's page and the cashier's page render the same player with different
props (`autoPlay`, `queue`), so a fix to the sign sequence benefits both, while the
*counter tooling* — queue, other orders, status buttons — only exists inside the
staff tree.

### The cashier screen

`/kasir` is how the **seller receives an order as sign language** rather than having
to go and find it. It long-polls `/api/kasir/antrean?since=<last seen>` and, the
moment an unseen order appears, navigates to that order's sign screen and plays it —
no tap required. Left open on a tablet at the till, that is the whole workflow:

1. Open `/kasir`, tap “Nyalakan bunyi” once so the browser permits audio.
2. Leave it open. The screen idles on “Menunggu pesanan masuk”.
3. A guest submits an order → the screen chimes and switches to it, playing the
   signs.
4. Tap **Tandai sudah disiapkan** to clear it from the queue.

The `since` cursor is kept in `localStorage`, so a page reload does not replay
orders the staff already handled. Sound is opt-in because browsers block autoplay
audio until the user interacts; the chime is generated with the Web Audio API, so
there is no audio file to 404.

Auto-play is muted and `playsInline`, which is what lets it start without a tap; if
a browser still refuses, the stage shows “Ketuk untuk mulai memutar” instead of
failing silently. If the session expires while the screen is open, the feed answers
`401` and the device is sent back to `/kasir/masuk` rather than polling in vain.

## Sign-language pipeline

This is the feature the shop is built around: an order placed by a hearing guest
becomes a sequence of sign-language clips that the counter plays.

```
order → compileSignPlan() → SignPlan{ segments[] } → SignPlayer
             ↑
   glossary.ts (vocabulary)  +  clip-inventory.ts (what is recorded)
```

**Vocabulary** — `src/server/sign/glossary.ts` is the single place a maker edits.
**29 concepts across 6 categories**, and every one is a real recording the shop
supplied: portions 1–10, ten dishes, two drinks, two ways of serving, two
temperatures, three condiment choices.

The footwear the recordings *do not* cover is as important as what they do: there
are no signs for greetings, payment, table numbers or delivery. So the order form
offers only **makan di sini** and **bawa pulang**, has no table-number field, and
records the payment method only for the WhatsApp handoff — never in the sign
sequence. The menu was rebuilt around this: a dish or a choice with no clip does not
exist in the product.

**Compiler** — `src/server/sign/sign-compiler.ts` turns an order into a plan. A
worked example (2 × nasi goreng with rica and kecap, 1 × kopi iced, takeaway):

```
 1. makanan-nasi-goreng    I WANT ORDER FRIED RICE   ← the dish's own sentence clip
 2. porsi-2                TWO PORTION               ← portions have one clip each
 3. kondimen-pakai-rica    WITH CHILI
 4. kondimen-kecap         SOY SAUCE
 5. minuman-kopi           I WANT ORDER DRINK COFFEE
 6. porsi-1                ONE PORTION
 7. suhu-dingin            COLD
 8. layanan-bawa-pulang    TAKEAWAY
```

Verified end to end: those eight clips decode and play in that order in Chrome
(`readyState 4`, no errors).

**Publishing a recording is dropping a file in.** No code change, no registry
edit:

```
public/videos/isyarat/<glossId>.mp4      # the clip
public/videos/isyarat/<glossId>.jpg      # optional poster
```

`clip-inventory.ts` reads that folder, and every consumer — the plan API, the
player page and the checklist — reports from disk, so they cannot disagree about
what is ready. A segment with no file is shown as “rekaman belum tersedia” and
skipped during playback. See `public/videos/isyarat/README.md`.

**Adding a clip needs a rebuild.** `next start` serves `public/` from a manifest
baked at build time, so a file dropped in afterwards answers **404** until the next
`npm run build`. The checklist and the plan API read the directory directly, so they
will show the new clip before the browser can fetch it — a confusing half-state, and
the reason the step is spelled out here.

### The recordings had to be transcoded

They arrived as **HEVC in `.mov`**, which browsers refuse — Chrome answers
`canPlayType('video/mp4; codecs="hvc1"') === ""`. `tools/transcode_sign_clips.py`
re-encodes each to H.264 MP4 at 1280 wide / 30 fps / no audio / `+faststart`:
**818 MB → 105 MB across 29 clips**. The originals are kept in
`video-sources/isyarat-asli/`, outside `public/` so they are never served.

**Dish photos are real, and carry a licence obligation.** There were no photographs
of the new dishes, so `tools/fetch_dish_photos.py` pulls 12 from **Wikimedia
Commons** — every one CC BY, CC BY-SA or CC0 — and crops them to the card's 16:11
ratio. Those licences allow commercial use **only with credit**, so:

- `src/data/photo-credits.ts` records photographer, licence and source per dish.
- `/kredit` renders that list, and the footer links to it from every page.
- `public/images/menu/CREDITS.md` keeps the same table next to the files.

Cropping is an adaptation, so the cropped files stay under their original licence —
stated on the credits page rather than left implicit. **Replace these with the
shop's own photos before going live**; own photos remove the obligation entirely.
Overwrite `public/images/menu/<dishId>.jpg`, drop the entry from `photo-credits.ts`,
and rebuild.

**Orders are stored** in `.data/orders.ndjson` (append-only, atomic rename,
writes serialised). It is gitignored because it holds customer details. Swapping
`order-repository.ts` for a real database should not touch the compiler or the
routes.

### What a maker still needs to provide

1. **Own photos of the dishes.** The current 12 are CC-licensed stand-ins from
   Wikimedia Commons and need attribution (see `/kredit`). Real photos of the shop's
   own cooking are better on every axis — accuracy and licensing both.
2. Clips for anything not yet recorded: greetings, payment, table numbers,
   delivery. Add the gloss to `glossary.ts`, drop the file in, then extend the order
   form so it can use the new choice.

After adding clips, both of these are required — the first updates the bundle, the
second publishes the files:

```bash
python tools\make_clip_manifest.py
npm run build
```

Until then the pipeline runs end to end with every clip marked `pending`.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

`pnpm` works the same way (`pnpm build`, `pnpm start`, …).

`next build` skips type checking on purpose (`next.config.ts`): `typecheck` runs
the same check as its own step, and `workerThreads` keeps prerendering from forking
child processes.

### Running build and start together

**`npm run build && npm start` fails in Windows PowerShell 5.1** — the `&&`
separator only exists from PowerShell 7. The error is not from the project:

```
The token '&&' is not a valid statement separator in this version.
```

Any of these work instead:

```powershell
npm run build; if ($?) { npm start }   # PowerShell 5.1 and 7
npm run build                          # or simply, one per line:
npm start
cmd /c "npm run build && npm start"    # hand it to cmd
```

Check which shell you have with `$PSVersionTable.PSVersion`.

> Use the **production** build for anything interactive (`npm run build`, then
> `npm start`). `npm run dev` serves the page correctly but does not hydrate it in
> this environment, so every button is dead — see “Dev server does not hydrate”
> below before debugging a click.

## QR code for the site

`/qr` shows a scannable code, the address it points at, and a printable A5 table
card. Generated by `tools/make_qr.py`.

```bash
python tools/make_qr.py                    # auto-detects this machine's LAN IP
python tools/make_qr.py --port 3001        # when the server runs on another port
python tools/make_qr.py --url http://10.0.0.5:3000
```

Output in `public/qr/`: `web.svg` / `web.png` (site root), `menu.svg` / `menu.png`
(ordering page), `kartu-meja.png` (A4/A5 card with logo, heading and the URL in
plain text), and `qr-meta.json` recording what was encoded.

**The URL must be the LAN address, not `localhost`.** A code containing
`localhost` resolves on the phone, not on the server, so it opens nothing. The
script takes the machine's LAN address for exactly that reason.

**Error correction is level H (30%)**, so the code survives a small print, a crease,
or a phone held at an angle. Verified by decoding the generated files — not by eye:

```bash
python tools/verify_qr.py     # decodes each PNG with OpenCV and compares the payload
```

### The address will change, and a printed card cannot

A LAN IP is handed out by the router. When it changes, every printed code stops
working. Two defences:

1. **Give the server a fixed address** (DHCP reservation in the router). Do this
   before printing cards in quantity.
2. `/qr` compares the encoded address with the one it is being served on. Opening it
   at `localhost` is reported as normal (the code is for other devices); a genuine
   LAN mismatch is flagged in red, with the command to regenerate.

`tools/fix-ip.ps1` pins the address from Windows when you cannot log in to the
router. It previews by default and only touches the network with `-Apply`:

```powershell
# preview: shows the adapter, its MAC, the current IP and the exact commands
powershell -ExecutionPolicy Bypass -File tools\fix-ip.ps1

# apply (needs Administrator)
powershell -ExecutionPolicy Bypass -File tools\fix-ip.ps1 -Apply

# hand it back to DHCP if something goes wrong
powershell -ExecutionPolicy Bypass -File tools\fix-ip.ps1 -Dhcp -Apply
```

A **DHCP reservation is safer than a static address**: with a static IP inside the
router's pool, another device can be handed the same address and both drop off the
network. Only use `-Apply` with an address outside the pool, or when the router is
out of reach.

**Same router or nothing.** The QR encodes a private address; a phone on mobile data
or a different Wi-Fi cannot reach it. That is not a bug to work around — it is how
private addressing works. For customers on their own networks, the site has to be
hosted publicly instead (see the deployment notes).

Regenerating is quick, but it needs a **rebuild** afterwards — `next start` serves
`public/` from a build-time manifest, so new files are 404 until the next
`npm run build`.

> `pip` hangs in this development environment even though PyPI is reachable, so
> `segno` (QR encoder) and `opencv-python-headless` (QR *decoder*, for verification)
> are fetched as wheels and unpacked by `tools/vendor_segno.py` and
> `tools/vendor_opencv.py` into `.tools/`, which is gitignored.

## Deploying publicly

Running on the shop's own machine is enough for guests sitting inside the shop, on
the shop's Wi-Fi. A QR cannot work from any other network: it encodes a private
address. Making the site reachable from anywhere means hosting it, and hosting means
giving up the assumption that there is a disk.

### What had to change

| Was | Now | Why |
|---|---|---|
| Orders appended to `.data/orders.ndjson` | `storage/` with a **file** and a **Redis** backend | Serverless filesystems are read-only and per-invocation |
| Clip folder read with `readdir` at request time | Generated module `src/data/clip-manifest.ts` | `public/` is CDN-served; there is no folder to scan |
| `/qr` read `qr-meta.json` from disk | Generated module `src/data/qr-meta.ts` | Same reason |

Nothing above those three points changed: the compiler, the player and the cashier
screens are untouched.

### Upstash (order storage on a host without a disk)

1. Create a free database at <https://console.upstash.com> → **REST API**.
2. Set the environment variables on the host:

```
ORDERS_STORAGE=redis
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx
KASIR_PASSWORD=<long passphrase>
KASIR_COOKIE_SECURE=true
```

The adapter talks to Upstash over plain `fetch`, so there is no client dependency to
install and it works in any runtime. If `ORDERS_STORAGE=redis` is set but the
credentials are missing, the app **logs a loud warning and falls back to the file**
rather than failing every request — deliberate, because a misconfigured deploy should
still show the menu.

Layout is one hash, `lingkar-setara:orders`, field = order id. A shop has hundreds of
orders, not millions; when that stops being true, the fix belongs inside
`storage/redis-storage.ts`.

### Netlify

`netlify.toml` is included: build command, `@netlify/plugin-nextjs`, Node 22,
long-lived caching for clips and images, and `X-Robots-Tag: noindex` on `/kasir/*`.
The plugin is what turns API routes and dynamic pages into functions — without it
Netlify would try to serve `.next` as a folder and every route would 404.

```
netlify deploy --build --prod
```

### Before you expose this to the internet

The cashier area is protected by **one shared password** and a fixed delay on a wrong
guess. On a LAN that is reasonable. On the public internet it is thin:

- Use a long passphrase, not a word.
- Rate limiting is per-instance and in-memory, so it resets and does not span
  functions. Put Netlify's own rate limiting (or Cloudflare) in front.
- There are no accounts, roles, or audit trail. If several staff each need access —
  or one needs revoking — this needs real auth before it goes live.

`GET /api/orders` lists every guest's name and phone number, and it is staff-only for
that reason. `/pesanan/<kode>` is public by design: the code is a weak identifier, so
anyone who knows it can see that one order's sign plan.

## Dev server does not hydrate

Observed here: under `next dev` the HTML is served, every client chunk returns 200,
the React runtime loads, and there are **no** console errors — yet no element has a
`__reactFiber$` property and no click does anything. The identical code under
`next build && next start` hydrates normally (verified: `__reactFiber$` present on
the button, a click increments the badge, the cart persists to `localStorage`).

So `next dev` is **not** a trustworthy way to try the cart, checkout or sign flow.
Symptoms if you debug there:

- Buttons do nothing, so the cart looks like it ignores clicks.
- The cart badge shows the server-rendered value while `localStorage` stays empty,
  which reads as “the cart already has items I never ordered”.
- `/api/*` still works, so an order can be created by a direct request while the UI
  stays frozen — a success screen can appear without a matching order, and its
  “Lihat versi bahasa isyarat” link then has nothing to open.

## Structure

```
src/
├─ app/
│  ├─ layout.tsx              # fonts, metadata, Header + Footer + cart provider
│  ├─ page.tsx                # Beranda
│  ├─ menu/page.tsx           # Menu
│  ├─ belajar-isyarat/page.tsx# Belajar Isyarat
│  └─ globals.css             # @theme tokens, gradient band, glass/hover utilities
├─ components/
│  ├─ ui/                     # Button, Eyebrow, Icon, LineArt
│  ├─ layout/                 # Header, Nav, Brand, Footer
│  ├─ cart/                   # CartProvider, cart-store, CartDrawer, CartTrigger, FloatingCart
│  └─ sections/               # Hero, Story, Menus, MenuCarousel, Impact, ClosingCta,
│                             # MenuHero, MenuCatalog, BelajarHero, OrderSteps,
│                             # SignGallery, TutorialPlayer, CheatSheet, PracticeCta
└─ public/images/             # local copies of the photography (no hotlinks)
```

Client components: `Header`, `Nav`, `MenuCarousel`, `MenuCatalog`, `SignGallery`,
and the cart (`CartProvider`, `CartDrawer`, `CartTrigger`, `FloatingCart`).
Everything else is server-rendered.

## Sections

| Section | Source on the reference page |
|---|---|
| Header (glass bar) | Menu page: logo, nav, "Layanan Isyarat & Visual" chip, cart button |
| Hero `/` | Home "Small Voice, Big Impact" band |
| Cerita Kami `/` | Home "More Than a Meal" story + two offset photos |
| Menu Andalan `/` | Home "Signature Highlights" carousel |
| Dampak `/` | added: numbers + guest quote |
| Menu hero `/menu` | Menu headline + "Pemesanan Nyaman" assist card |
| Katalog `/menu` | Menu search, requirement chips, category pills, 12-dish grid with portion and choice controls |
| Belajar hero `/belajar-isyarat` | Belajar headline, accessibility chips, spotlight slot |
| Alur 5 tahap `/belajar-isyarat` | "Alur Cepat Memesan di Kasir" |
| Galeri isyarat `/belajar-isyarat` | "Galeri Isyarat Menu & Interaksi" + category filters |
| Kamus kilat `/belajar-isyarat` | "4 Gestur Utama Saat Bertemu Kawan Tuli" |
| Praktik di kedai `/belajar-isyarat` | closing invitation + link to the menu |
| Cart | Menu page drawer + floating summary, with working state |
| Footer (all) | gradient band, cream ornaments, address, socials, map |

## Header / footer band

`Header` and `Footer` share the `.band-gradient` / `.band-gradient-header`
utilities: sage (`#E4EBD8`) blending into cream (`#FBF7EF`) with a soft radial
bloom, so the band reads as one gradient rather than two flat halves. Contrast
was checked for the ink text both ways — `#171C1F` on cream is 16:1 and on sage
14.5:1, far above AA.

## Ornaments

Two decorative families fill the "active whitespace" the brand spec asks for.
Both are `aria-hidden` and neither animates, so reduced-motion users are
unaffected.

**Abstract line art** — `LineArt` (`ripples`, `botanical`, `wave`, `sparkle`,
`orbit`) in sage, ocean or cream. Used in the header, the footer and as
section-level decoration.

**Cooking ingredients** — `Ingredient` and `Ingredient3D`, sharing one set of
hand-authored paths:

| Component | Treatment |
|---|---|
| `Ingredient` | stroke-only line art, 200×200 viewBox, 2.6 stroke |
| `Ingredient3D` | same paths, shaded: body gradient, offset contact shadow, rim light and interior strokes |

Twelve shapes: chili, garlic, tomato, onion, lemon, lime, mushroom, leaf, herb,
avocado, shrimp, eggplant.

The shaded variant exists so the ornaments carry some depth without pulling
generated raster images into the bundle — it is vector shading, not a rendered
3D asset. Its pigments live in a documented `Illustration pigments` token block
and are deliberately desaturated so the drawings stay inside the sage-and-cream
range instead of introducing a fourth loud accent.

Two rules kept these decorations from turning into clutter:

- **Each ornament is placed in a measured gap, not on top of content.** Several
  iterations moved them out of a section heading's right column and away from
  the photo grid after screenshots showed them colliding.
- **Every ornamented section clips horizontally** (`overflow-x-clip`). Without it
  the outward-hanging art widened the document and produced a horizontal
  scrollbar at ≥1600px, which was caught by measuring `scrollWidth` against
  `innerWidth` at 1280/1440/1600/1920.

## Cart

`cart-store.ts` keeps the persisted lines and exposes them through
`useSyncExternalStore`, so React stays in sync with `localStorage` without
setting state inside an effect. The header badge, the floating bar, the drawer
and the checkout page all read the same store. The drawer is a real
`role="dialog"` with `aria-modal`, Escape-to-close and a body scroll lock.

### Add-to-cart feedback

Every add control — the catalog button and the "+" on the home carousel's dish
cards — calls `requestFlyToCart()`. `CartFX` then clones the dish photo, animates
it into the header cart button with the Web Animations API (transform + opacity
only) and pulses the badge when it lands. Motion is opt-in: under
`prefers-reduced-motion` the flight is skipped and only the badge pulses, which
the reduced-motion block already neutralises.

The carousel buttons used to be decorative; they now add the dish and run the
same effect. That was the reported "Pesan does nothing" bug.

## Checkout (`/pembayaran`)

`CheckoutFlow.tsx` is a three-step flow with a live order summary:

1. **Pesanan** — review, and choose how it is served: makan di tempat (needs a
   table number), bawa pulang, or diantar (needs an address plus a minimum order).
2. **Data & layanan** — name (required), optional WhatsApp number and notes.
3. **Pembayaran** — QRIS, e-wallet, bank transfer or cash.

Each step validates before it advances, and failures are announced through an
`aria-live` region as well as inline `role="alert"` text. Verified by driving the
stepper in a browser: an empty table number, an empty name and an unselected
payment method all block the step with the right message.

On submit the order is saved to `localStorage` as a `PlacedOrder`, the cart is
cleared, and a fully composed WhatsApp message opens — the same handoff the
eatery already uses for orders.

**No payment is processed.** No gateway, no keys, no server call. The success
screen shows the order code and method-specific instructions instead, and it can
be dismissed so the next order can be started.

Fees (ongkir Rp 8.000, delivery minimum Rp 50.000) are illustrative amounts,
labelled as such on screen, because the brand has not supplied a rate card.

## A design-token bug worth remembering

The page surface token was originally named `--color-base`. Tailwind turns every
`--color-*` token into colour utilities, so that also produced a `.text-base`
rule setting `color: #f5fafe` — colliding with Tailwind's *font-size* utility of
the same name and silently overriding it on 23 elements across 8 files. It
surfaced as an unreadable "Total" label, but it had also been flattening the type
scale site-wide (`text-base`, `sm:text-base`, `md:text-base`).

The token is now `--color-surface-base`, and the compiled CSS is checked to
confirm `.text-base` carries `font-size` again. Avoid `--color-*` names that
collide with Tailwind's own utility namespaces (`base`, `sm`, `lg`, `xl`, …).

## Design tokens

Lingkar Setara palette (Ocean Punch `#0066FF`, Mint Electric `#00FF9D`, Sky Vivid
`#00BFFF`, Sage Energy `#2ECC40`, navy `#0F2F57`, sage surfaces) with the Savor
by Areej structure: one `@theme` block, pill buttons, 8/16/24px radius scale,
two-layer shadows, 4→96px spacing scale, and `prefers-reduced-motion` support.
No component contains a hex literal or an inline `style`.

Two tokens deviate from the source design system on purpose:

- `--color-ink-muted` is `#363A49` rather than `#424656`: 14–16px body copy
  needs AA on both the light blue and the sage band.
- Hero copy is navy on a light wash instead of white on the photo, so the
  headline clears AA without leaning on a heavy overlay.

## Assets

`tools/download_lingkar_assets.py` (Home), `tools/download_lingkar_menu_assets.py`
(Menu) and `tools/download_lingkar_belajar_assets.py` (Belajar Isyarat) copy the
photography into `public/images/`. All three append `=w1600` for the ~1400px
render, because the CDN serves 512px by default.

The CDN has two generations and only one still works:

| Path | Status |
|---|---|
| `/aida-public/<token>` | served; accepts `=w1600` |
| `/aida/<token>` | permanently 403, no size variants |

Where a card pointed at the dead generation, the downloader substitutes an
existing photo of the same dish and prints the swap. Current substitutions:

| Card | Substituted with |
|---|---|
| Citrus Bloom Quinoa Bowl (Menu) | Home `salad-citrus-bloom.jpg` |
| Minty Matcha Superbowl (Menu) | Home `matcha-zen-bowl.jpg` |
| Artisan Grilled Veggie Sandwich (Menu) | Home `platter-harvest.jpg` (same dish) |
| Isyarat Citrus Bloom (Belajar) | Menu `citrus-bloom-quinoa-bowl.jpg` |
| Isyarat Minty Matcha (Belajar) | Menu `minty-matcha-superbowl.jpg` |

`banana-almond-crunch-bowl.jpg` is only 512×279 — the CDN ignored the size
request for that asset, so it is softer than the others.

## Tutorial videos

No sign-language footage is bundled with this project. `TutorialPlayer` therefore
renders each tutorial as a poster still labelled "Segera hadir", instead of a
play button that does nothing. Pass `videoSrc` on a `SignVideo` entry in
`src/data/belajar.ts` and the same component renders a real `<video>` with native
controls — no other change needed.

## Contact details

The WhatsApp line lives in **one** place — `contact` in `src/data/content.ts`:

```ts
export const contact = {
  whatsappDigits: "628991301389",      // wa.me form
  whatsappDisplay: "+62 899-1301-389", // what the guest reads
  email: "pkmpilingkarsetara@gmail.com",
};
```

`whatsappHref(message?)` builds every deep link from it: the footer link, the
cart's quick-order handoff, the checkout submission and the e-wallet payment
instruction all call that helper. Change the number once and every screen
follows — they cannot drift apart, which was the failure mode when the same
number was repeated across four files.

## Still placeholder

- Impact numbers, the guest quote and the opening hours are illustrative.
- The map is a hand-drawn SVG (`peta-gorontalo.svg`) marked "bukan skala
  sebenarnya"; the "Buka di Maps" button links to the real Google Maps entry.
- The footer's utility links (Aksesibilitas, Kebijakan Privasi, Keberlanjutan,
  Karier) have no destination pages yet.
