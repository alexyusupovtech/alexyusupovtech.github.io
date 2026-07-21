# Alex Yusupov — Portfolio

A dark, sci-fi / deep-space portfolio built with [Astro](https://astro.build).
Graphic Design · Video · Special Effects · Illustration.

---

## Running it locally

```bash
npm run dev            # live preview at http://localhost:4321
```

Background server controls (this project uses Astro's background mode):

```bash
npx astro dev status   # is it running? what URL?
npx astro dev logs     # recent logs
npx astro dev stop     # stop it
npm run build          # build the final site into /dist for deploying
```

---

## Where to put your images & videos

Everything lives in the **`assets/`** folder, organized by tab. Whatever you
drop in a folder shows up on that page automatically — in filename order, no
code needed.

```
assets/
├─ work/
│  ├─ Design/          → the DESIGN page
│  ├─ Motion/          → the MOTION page
│  ├─ VFX/             → the VFX page
│  └─ Illustration/    → the ILLUSTRATION page
├─ hero/               → drop ONE video here = full-screen home splash reel
├─ bg/                 → drop ONE image here = the site background
└─ brand/              → drop your photo/logo = top-left icon + favicon
```

- **Any filename works** — you don't need to name anything specific. The site
  picks up whatever is in each folder. (`hero/` and `bg/` use the first file;
  the gallery folders show everything.)
- **Order:** prefix with `01-`, `02-`, … to control the sequence.
- **Images:** `.jpg .png .webp .gif .svg`  •  **Videos:** `.mp4 .webm .mov` …
- Videos in the galleries and the hero autoplay muted and loop.
- Until you add files, each page shows a tasteful placeholder / empty state.

### After dropping files, run the optimizer

```bash
npm run optimize
```

This makes any dropped asset "just work": it compresses big videos to
web-friendly H.264 (so they play everywhere and load fast), shrinks huge images
to WebP, and cleans up filenames with spaces/symbols. It's safe to run anytime —
already-optimized files are skipped.

---

## Editing your details

Your name, slogan, email, location, social links and the four tab names all live
in one file: **`src/site.ts`**. Edit there and it updates everywhere.

---

## A note on the font

The design calls for **Futura**. True Futura is a paid, licensed font that can't
be embedded for free, so the site uses **Jost** — a free, near-identical
geometric typeface — and falls back to real Futura automatically for any visitor
who has it installed. If you own a Futura web license, drop me the files and I'll
self-host the real thing.

---

## Project structure

```
portfolio-website/
├─ assets/                 ← your media (served at the site root)
├─ src/
│  ├─ site.ts              ← name, contact, socials, tabs   (edit me)
│  ├─ lib/media.ts         ← auto-discovers dropped files
│  ├─ styles/global.css    ← the space design system (colors, type, glow)
│  ├─ layouts/BaseLayout.astro
│  ├─ components/          ← Header, Footer, Media
│  └─ pages/
│     ├─ index.astro       ← video splash
│     ├─ [discipline].astro← the 4 gallery pages
│     └─ contact.astro
└─ astro.config.mjs
```
