# Bridget

Minimal Hugo theme for photographers/visual artists. Hugo (Go templates) drives content/routing; SolidJS (via Vite) drives interactive islands (custom cursor, gallery, stage nav). Theme is in **maintenance mode** — keep it minimal, don't add scope beyond what's asked.

## Stack

- **Hugo** — templates in `layouts/`, theme module mounts defined in `hugo.toml`. Demo/test content lives in `exampleSite/`.
- **SolidJS + TypeScript** — components in `assets/ts/`, split into `desktop/` and `mobile/` variants (separate layout trees, not just responsive CSS).
- **Vite** — bundles `assets/ts/main.tsx` and `assets/ts/critical.ts` into `bundled/js/`. `vite-plugin-solid` handles JSX.
- **Sass** — `assets/scss/`, split into `_core/` (foundation, reset, typography, mixins, fonts) and `_partial/` (one file per feature: nav, gallery, stage, stageNav, customCursor, collection, article, container, post, postList, grid). Note the split between `critical.scss` (server-rendered chrome: nav, container, post, postList, grid, …) and `style.scss` (JS-island partials: gallery, stage, customCursor, …).
- **GSAP** — used for animations (`stageAnimations.ts`, gallery transitions).
- **Swiper** — gallery/carousel.
- Package manager: **pnpm**.

## Commands

```
pnpm dev            # vite watch + hugo dev server (use while iterating)
pnpm build          # vite build + hugo build (production, minified) — run before calling any change done
pnpm server         # vite build (watch) + hugo server, production-like
pnpm lint           # eslint --fix + prettier --write
pnpm lint:check     # eslint + prettier --check (CI-equivalent, no writes)
pnpm images <dir>   # (optional) prep photos: extract tags, strip EXIF, write previews — run manually when adding images, NOT part of build
```

`bundled/` and `public/` are build output — generated, don't hand-edit. `exampleSite/` is the content used by `hugo:dev`/`hugo:build` to preview the theme.

## Architecture notes

- Desktop and mobile are genuinely separate component trees (`assets/ts/desktop/*`, `assets/ts/mobile/*`), each with their own `state.ts` — not a single responsive component. Check `main.tsx` / `layout.tsx` in both trees before assuming a change applies to one only.
- `configState.tsx` / `imageState.tsx` hold shared reactive state consumed by both trees.
- Gallery navigation, "stage" (single-image) view, and custom cursor are the three interactive centerpieces — most feature work touches one of these.
- SCSS partials map roughly 1:1 to the TSX components under `_partial/`; keep that pairing when adding new components (new component → new partial, not appended to an existing one).
- **Post archetype** (`type: post`, `layouts/post/single.html`) is a separate blog-style flow from the scatter gallery: server-rendered prose + a click-to-open lightbox (`assets/ts/post.tsx`), with an optional desktop-only drag flourish (`postDrag.ts`). `type: postlist` (`layouts/postlist/single.html`) is the scattered index of posts, hover-cycling on desktop (`postList.ts`) and a static column on mobile (no JS). Inline post images go through the `render-image.html` render hook (size keyword in the markdown title) and the `row` shortcode for side-by-side layout.
- **Grid archetype** (`type: grid`, `layouts/grid/single.html`, `assets/ts/grid.tsx`) is a tag-filtered image grid + full-screen viewer. Per-image `tags` (set via `resources` front matter) build a **multi-select** filter bar (a fixed white top bar mirroring the nav; a caret discloses the tag list, tags OR together — an empty selection means "all"); the multicol masonry scatter's column count is set by a nav stepper (`--grid-cols`, 1–5, `data-cols` special-cases the 1- and 5-column layouts, persisted in `sessionStorage`). Clicking a frame opens the viewer: a **free-scrolling looping thumbnail rail** (wheel-driven, seamless via a repeat-and-rebase loop — see `RAIL_REPEAT`) beside a stage that tracks the centred thumb; thumbs **rise out of the strip** on proximity (JS transform + CSS damping transition, `RAIL_GROW`/`RAIL_LIFT`/`RAIL_FADE`). The nav's right cluster overlays a column stepper (browsing) / image counter (viewing) on the gallery nav's hidden threshold+index slots, so grid nav layout matches the gallery exactly (`body.gridViewing` toggles which shows). Single JS module like post/postlist — no desktop/mobile split.
- `main.tsx` reads `data-page` off `.container` (`post` / `postlist` / `grid` / `404` / unset) to decide which module to boot instead of always mounting the gallery `<Main />`. `isMobile()` is centralized in `utils.ts` and shared across all entry paths.
- `layouts/_default/single.html` picks the nav variant per page: image-bearing pages get the full gallery `nav.html`; text-only pages (Info, post, postlist) and the grid get the quiet `postNav.html` (which grows the grid stepper/counter overlays when `.Type` is `grid`).
- **Image sourcing seam** (`layouts/partials/function/imgSrc.html`) — the single source-URL abstraction, a returning partial. Call `(dict "img" R "page" P "size" "hi"|"lo" ["spec" S])`, get `(dict "url" U "w" W "h" H)`. In production **with `site.Params.cdnBase` set** it emits an on-the-fly image-CDN URL `{cdnBase}/{key}{cdnHiQuery|cdnLoQuery}`; otherwise (dev, or no `cdnBase`) it Hugo-processes the committed low-res copy via `.Resize`. `key` = content-relative image path (`path.Join $page.File.Dir $img.Name`, e.g. `grid/e1.jpg`), overridable per-resource with a `cloudKey` param. **All five image emitters route through it** — `grid/single.html`, `_markup/render-image.html`, `postlist/single.html`, `_default/single.json`, and `head/preload-lcp.html` — so a CDN switch is config-only, and the mobile-LCP preload URL always mirrors the scatter's `moUrl`. Empty `cdnBase` = current local behavior at zero cost; keep this partial as the only place image URLs are built.
- **Metadata tags (Archive)** — the grid filter unions two tag sources per image: extracted IPTC/XMP keywords in `data/imagetags.yaml` (read via `hugo.Data.imagetags`, keyed by content-relative path) **plus** hand-written `resources[].params.tags` front matter, deduped — both survive re-extraction. `scripts/prep-images.mjs` (`pnpm images <masters>`) generates the data file, strips EXIF + bakes orientation (`magick -auto-orient -strip`) into CDN-upload copies, and writes committed previews. `masters/` (originals) and `dist-images/` (upload copies) are git-ignored — originals never committed, previews always are. CDN config (`cdnBase`, `cdnHiQuery`, `cdnLoQuery`) lives in `params.toml`.
- **Subpath-safe deploy + LCP** (the PageSpeed pass, PR #11): `head/favicon.html` renders favicon links subpath-safe so they survive a non-root base URL; `head/preload-lcp.html` preloads the mobile scatter's first image straight from the HTML (coarse-pointer only, mirrors `single.json`'s `moUrl` via `imgSrc`); `vite.config.ts` fixes dynamic-import chunk paths so Vite's lazy chunks resolve under a subpath deploy.

## Design system (existing, don't reinvent)

This is a photography portfolio theme — **the images are the content, UI must recede**.

- **Palette**: white background (`_core/_base.scss`), black type/chrome, no accent color. Full-bleed imagery supplies the only color on the page.
- **Type**: `Geist` (sans, self-hosted via `_core/_font.scss`) for body copy, `FW` (sans, condensed/utility) for buttons/controls. Base `16px`, scaling to `18px`/`19px` at tablet/laptop breakpoints (`_core/_typography.scss`). Don't introduce a third family.
- **Chrome stays quiet**: nav, cursor, and stage-nav are thin overlays over imagery, not boxed UI — no cards, no shadows, no rounded-corner containers competing with photos.
- **Motion**: GSAP-driven, used for gallery/stage transitions and cursor follow — orchestrated, not decorative. New motion should serve navigation (moving between images/views), not sit on top as flourish.
- **Custom cursor** replaces the system cursor in interactive zones — treat it as a first-class UI element, not a gimmick; keep it legible against both light and dark photos.

When touching UI, use the `frontend-design`/`frontend-ui-engineering` skills to stay consistent with this system rather than introducing new tokens. SolidJS-specific correctness (signals/stores/reactivity, not styling) is covered by the `solid-*` skills — reach for those when reactivity looks off rather than guessing.

## graphify

`.graphifyignore` excludes `bundled/`, `exampleSite/`, `public/`, `.claude/` — build output and test fixtures, not theme source. Keep it that way so graph queries stay scoped to `layouts/` and `assets/`.

## Conventions

- TypeScript + ESLint (`eslint-config-love`, `eslint-plugin-solid`) + Prettier (`prettier-plugin-organize-imports`, `prettier-plugin-go-template` for Go templates). Run `pnpm lint` before considering frontend work done.
- Go templates in `layouts/` are also formatted by Prettier — don't hand-diverge from its formatting.
- **New features go on a feature branch**, never directly on `main`.
- **Never push or open PRs to `upstream`/parent repo (`Sped0n/bridget`).** This is a fork — push only to `origin` (`jjsnack/bridget`). `gh pr create` defaults its base to the parent; always target `origin`/the `jjsnack` fork explicitly.
- **After building a feature, add an example for it in `exampleSite/`** (content in `exampleSite/content/`, config in `exampleSite/config/`) so `pnpm hugo:dev`/`pnpm dev` can exercise it — this is the test fixture for the theme, not just a demo.

## Before calling any change done

1. `pnpm lint:check` (or `pnpm lint` to autofix).
2. `pnpm build` — must complete clean (Vite + Hugo). This is the final verification step for every change in this repo, not optional.
