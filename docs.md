### Contents

- [Prequisites](#prequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
  - [As a Git Submodule (Recommended)](#as-a-git-submodule-recommended)
  - [Clone Into `themes/`](#clone-into-themes)
- [Content Management](#content-management)
  - [`index.md`](#indexmd)
    - [Front Matter](#front-matter)
    - [Markdown Content](#markdown-content)
  - [Archetypes](#archetypes)
  - [Favicon](#favicon)
- [Configuration](#configuration)
  - [`hugo.toml`](#hugotoml)
  - [`markup.toml`](#markuptoml)
  - [`outputs.toml`](#outputstoml)
  - [`params.toml`](#paramstoml)
  - [`sitemap.toml`](#sitemaptoml)
- [Deployment](#deployment)
  - [GitHub Pages](#github-pages)
- [Usage](#usage)
- [Customizations](#customizations)
  - [Change Font](#change-font)
  - [Add an Analytics Script](#add-an-analytics-script)

---

## Prequisites

_[Contents](#contents)_

- [Hugo (extended)](https://gohugo.io/installation/), minimum required version can be seen in the [`theme.toml`](https://github.com/jjsnack/bridget/blob/main/theme.toml)

  ```bash
  ❯ hugo version
  hugo v0.152.2+extended+withdeploy darwin/arm64 BuildDate=unknown VendorInfo=nixpkgs
  ```

- [pnpm](https://pnpm.io/installation) and [Node.js](https://nodejs.org/en/download), please note that these two are only needed for customizations or development.

  ```bash
  ❯ pnpm --version && node --version
  10.20.0
  v22.20.0
  ```

## Quick Start

_[Contents](#contents)_

This fork is **not published to the Hugo module registry**, so it is consumed as a
**local theme via a Git submodule** (not `hugo mod get`). From an empty directory:

```bash
# 1. create a Git repo for your site
git init my-site && cd my-site

# 2. add this theme as a submodule under themes/
git submodule add https://github.com/jjsnack/bridget themes/bridget

# 3. copy the sample config as your starting point
mkdir -p config
cp -r themes/bridget/exampleSite/config/_default config/_default

# 4. install the toolchain (only needed to (re)build the JS/CSS bundle — see below)
cd themes/bridget && pnpm install && pnpm build && cd ../..

# 5. edit config/_default/hugo.toml (baseURL, title) and the module block below,
#    then add some content (see Content Management) and serve
hugo server
```

> [!NOTE]
> The theme ships its compiled JS/CSS under `themes/bridget/bundled/`, which is
> committed to the repo — so a plain `hugo server` works without Node/pnpm. You
> only need step 4 if you change the theme's TypeScript/SCSS.

## Installation

_[Contents](#contents)_

### As a Git Submodule (Recommended)

_[Contents](#contents)_

From the root of your Hugo site's Git repository:

```bash
git submodule add https://github.com/jjsnack/bridget themes/bridget
```

The theme is a [Hugo module](https://gohugo.io/hugo-modules/), so point Hugo at the
submodule with a module **replacement** in your site config. The module path stays
`github.com/Sped0n/bridget/v2` (the fork keeps the upstream module path); the
replacement maps it to the checked-out submodule directory:

```toml
# config/_default/hugo.toml
[module]
# map the module path to the local submodule — no network / `hugo mod` needed
replacements = "github.com/Sped0n/bridget/v2 -> themes/bridget"
[[module.imports]]
path = "github.com/Sped0n/bridget/v2"
```

To update the theme later:

```bash
git submodule update --remote themes/bridget
```

### Clone Into `themes/`

_[Contents](#contents)_

If you don't want a submodule, clone the fork instead (same `module` config as above):

```bash
git clone https://github.com/jjsnack/bridget themes/bridget
```

## Content Management

_[Contents](#contents)_

The content is where the pictures/text is stored, while the static refers to the website icons.

```
.
├── content
│  ├── Erwitt
│  │  ├── 1.jpg
│  │  ├── ***
│  │  └── index.md
│  ├── Gruyaert
│  │  ├── 1.jpg
│  │  ├── ***
│  │  └── index.md
│  ├── Info
│  │  └── index.md
│  └── Webb
│     ├── 1.jpg
│     ├── ***
│     └── index.md
└── static
   ├── dot.png
   └── dot.svg
```

### `index.md`

_[Contents](#contents)_

#### Front Matter

_[Contents](#contents)_

Inside each index.md file, there is a front matter like this:

```markdown
---
type: _default # just copy
layout: single # just copy
url: /erwitt/
menu:
  main:
    weight: 3
    identifier: Erwitt
    title: Erwitt
unifiedAlt: '© Elliott Erwitt'
build:
  publishResources: false # just copy
---
```

- `url` is the href link to this page, in this case, you can visit this page with `blabla.com/erwitt`;
- `main` is the entry to `menu`;
  - `weight` determines the position of this link in the navigation bar, with the first one being 1, the second one being 2, and so on;
  - `identifier` should be the **same** as the name of the **upper-level directory**;
  - `title` refers to the text that appears on the navigation bar;
- `unifiedAlt` is **optional**, If you left it empty, the alt attribute of the image will default to its file name; if it is set, the alt attributes of all images will be unified to the value you have set;

#### Markdown Content

_[Contents](#contents)_

- If this is a **showcase** page:
  - No need to write anything in index.md.
  - Place the images in the same directory as `index.md`.
- If this is an **information** page:
  - You can write anything in index.md, and it will be rendered as HTML.
  - However, please note that the CSS for the information page **only provides simple styling for text**. If you have any requirements beyond text and the browser rendering does not meet your expectations, please modify [`_article.scss`](https://github.com/jjsnack/bridget/blob/main/assets/scss/_partial/_article.scss).

### Archetypes

_[Contents](#contents)_

Beyond the default full-bleed **scatter gallery** (a directory of images with a
bare `index.md`), the theme ships three content archetypes. The `type` front-matter
field selects the layout. See `themes/bridget/exampleSite/content/` for complete,
working examples of each.

| `type`     | URL in example | What it is                                                                           |
| ---------- | -------------- | ------------------------------------------------------------------------------------ |
| `_default` | `/erwitt/`     | Scatter gallery — a directory of images, click any to open the focus view            |
| `post`     | `/posts/*/`    | A blog-style prose page: Markdown body with inline images + a click-to-open lightbox |
| `postlist` | `/posts/`      | The scattered index of every `post` (discovered by `type: post`, no manual linking)  |
| `grid`     | `/archive/`    | A tag-filtered image grid with a full-screen, looping focus viewer                   |

**Posts (`post` / `postlist`).** A post is a leaf bundle (`content/posts/<slug>/index.md`)
with its images alongside. Inline images take a size keyword as their Markdown title
(`small`, `medium`, `large`, `wide`, `full`), and the `row` shortcode lays two side by
side:

```markdown
---
type: post
layout: single
outputs: ['HTML']
title: 'On Alex Webb'
date: 2026-07-14
url: /posts/webb/
lede: 'A one-line standfirst under the title.'
---

Prose here. Drop an image with a size keyword as its title:

![Alt text, also the caption](photo.jpg 'wide')

{{</* row */>}}
![](left.jpg 'small')
![](right.jpg 'large')
{{</* /row */>}}
```

The `postlist` page is a separate leaf bundle whose `type` is `postlist`; it renders
the index of all posts automatically. Give it a menu entry so it appears in the nav.

**Archive (`grid`).** A single leaf bundle whose per-image `tags` (set via the
`resources` front matter) build a multi-select filter bar; an empty selection means
"all". Each `resources` entry maps a file in the bundle to its tags + caption:

```toml
---
type: grid
layout: single
outputs: ['HTML']
title: 'Archive'
url: /archive/
resources:
  - src: 'w1.jpg'
    params:
      tags: ['Webb']
      caption: 'Six things at once'
  - src: 'g1.jpg'
    params:
      tags: ['Gruyaert']
      caption: 'Colour as weather'
build:
  publishResources: false
---
```

To use `hugo new` scaffolding for these, the theme provides matching archetype
templates under `themes/bridget/archetypes/` (`post.md`, `grid.md`).

### Favicon

_[Contents](#contents)_

As for the **website icon**, place the files under `static` directory and then go to [config](#configuration) part for further reading.

## Configuration

_[Contents](#contents)_

You can simply copy `exampleSite/config` to the root directory, with some minor modifications and you should be good to go.

```
.
└── config
   └── _default
      ├── hugo.toml
      ├── markup.toml
      ├── outputs.toml
      ├── params.toml
      └── sitemap.toml
```

### `hugo.toml`

_[Contents](#contents)_

First, what you need to modify is the `baseURL` and `title`:

```toml
# timeout
timeout = "1200s"
# your website url
baseURL = 'https://jjsnack.github.io/bridget/' # <-- MODIFY ME
# website title
title = 'Bridget' # <-- MODIFY ME
# don't touch this
disableKinds = ["section", "taxonomy", "term", "home"]
# robots.txt
enableRobotsTXT = true
```

Then the `module` section points Hugo at the theme submodule (see [Installation](#installation)):

```toml
[module]
# map the upstream module path to the local submodule/clone under themes/
replacements = "github.com/Sped0n/bridget/v2 -> themes/bridget"
[[module.imports]]
path = "github.com/Sped0n/bridget/v2"
```

> [!NOTE]
> The theme's own `exampleSite` uses `replacements = "github.com/Sped0n/bridget/v2 -> ../.."`
> instead, because from inside `exampleSite/` the theme root is two directories up.
> For a real site with the theme under `themes/bridget`, use the mapping above.

### `markup.toml`

_[Contents](#contents)_

**Just copy it.**

### `outputs.toml`

_[Contents](#contents)_

**Just copy it.**

### `params.toml`

_[Contents](#contents)_

Detailed description in the comments.

By default, Bridget auto-orients gallery images from EXIF orientation before resizing. This behavior is enabled when `autoOrient` is omitted; only explicit `false` disables it:

```toml
# config/_default/params.toml
autoOrient = false
```

### `sitemap.toml`

_[Contents](#contents)_

https://gohugo.io/templates/sitemap-template/#configuration

## Deployment

_[Contents](#contents)_

### GitHub Pages

_[Contents](#contents)_

This repository includes a ready-to-use workflow, [`.github/workflows/pages.yml`](.github/workflows/pages.yml),
that builds the `exampleSite` and publishes it to **GitHub Pages** on every push to
`main`. To turn it on:

1. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main` (or run the workflow manually via **Actions → Deploy to GitHub Pages → Run workflow**).
3. The site publishes at `https://<user>.github.io/<repo>/` — e.g. `https://jjsnack.github.io/bridget/`.

The workflow overrides `baseURL` with the Pages URL at build time (via
`actions/configure-pages`), so you don't need to hard-code it in `hugo.toml`. It
installs Node/pnpm/Hugo with [mise](https://mise.jdx.dev), runs `pnpm build`, and
uploads `exampleSite/public`.

**Deploying your own site (not this repo):** point the same steps at your site
directory instead of `exampleSite/`, and set `baseURL` to your Pages URL (project
sites live under a `/<repo>/` subpath — pass `--baseURL` to `hugo` to match, exactly
as the workflow does).

## Usage

_[Contents](#contents)_

Bridget will work as a normal Hugo theme (if you don't have needs to customize), https://gohugo.io/getting-started/usage/ is a great start.

For further reading, you can refer to the `scripts` field of `package.json`.

## Customizations

_[Contents](#contents)_

> [!IMPORTANT]
> Please make sure you installed the theme [with Git](#installation) so you have its source to edit.
>
> If you want to try some changes on the `exampleSite`, below are some commands you might need:
>
> - `pnpm install` to install dependencies.
> - `pnpm run dev` to start a dev server (`http://localhost:1313`).
> - `pnpm run build` to update artifacts.

### Change Font

_[Contents](#contents)_

The theme uses two self-hosted families: **Geist** (`GeistVF.woff2`) for body copy and
**FW** (`fw.woff2`) for buttons/controls. To swap either, touch these places:

- `assets/scss/_core/_font.scss` (`@font-face`)
- `assets/scss/_core/_typography.scss` (`body.font-family`)
- `layouts/partials/head/link.html` (`preload`)
- `static/lib/fonts/GeistVF.woff2` / `static/lib/fonts/fw.woff2` (the font files themselves)

### Add an Analytics Script

_[Contents](#contents)_

Analytics are **built in** — no template editing needed. Set the provider(s) you use
under `[analytics]` in `config/_default/params.toml` and toggle the master `enable`
flag. The theme ships support for Google, Fathom, Baidu, Umami, Plausible, Cloudflare,
and Splitbee (see `plugin/analytics.html`); leaving an id empty skips that provider.

```toml
# config/_default/params.toml
[analytics]
enable = true
[analytics.google]
id = "G-XXXXXXXXXX"
anonymizeIP = true
[analytics.plausible]
data_domain = "example.com"
src = "https://plausible.io/js/script.js"
```

For a provider not listed above, add your snippet to `plugin/analytics.html` — it is
already wired into `baseof.html` (the `<div class="analytics">`).
