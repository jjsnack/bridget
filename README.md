# Bridget

[![Build](https://img.shields.io/github/actions/workflow/status/jjsnack/bridget/build.yml?branch=main&logo=github&label=build)](https://github.com/jjsnack/bridget/actions/workflows/build.yml)
[![Lint](https://img.shields.io/github/actions/workflow/status/jjsnack/bridget/lint.yml?branch=main&logo=github&label=lint)](https://github.com/jjsnack/bridget/actions/workflows/lint.yml)
[![Pages](https://img.shields.io/github/deployments/jjsnack/bridget/github-pages?logo=github&label=pages)](https://jjsnack.github.io/bridget/)
[![License: MIT](https://img.shields.io/github/license/jjsnack/bridget?color=blue)](LICENSE)
[![Hugo](https://img.shields.io/badge/Hugo-extended%20%E2%89%A5%200.121.2-ff4088?logo=hugo&logoColor=white)](https://gohugo.io)

Bridget is a minimal [Hugo](https://gohugo.io) theme for photographers/visual artists, based on [bridget-pictures-www](https://github.com/tylermcrobert/bridget-pictures-www).

![thumbnail](https://raw.githubusercontent.com/jjsnack/bridget/main/images/tn.jpg)

## About

Bridget treats the images as the content and keeps the UI out of the way — a white canvas, black chrome, no accent colour, so the photography supplies the only colour on the page. [Hugo](https://gohugo.io) renders the pages and routing; a handful of [SolidJS](https://www.solidjs.com) islands drive the interactive pieces — a custom cursor, the full-bleed scatter gallery, and the click-to-open focus/stage viewer. On top of the core galleries it adds blog-style **Posts** (prose with inline images and a lightbox) and a tag-filtered **Archive**.

This fork is growing Bridget from a gallery theme into a complete personal **portfolio site**: the galleries stay the centrepiece, with room around them for project write-ups, an about/info page, and the other pages a working portfolio needs — while holding the line on the minimal, image-first design. The [`exampleSite`](exampleSite/) is the living test bed for that direction and doubles as the [demo](https://jjsnack.github.io/bridget/).

## Getting Started

Head to this [documentation](https://github.com/jjsnack/bridget/blob/main/docs.md) for a complete guidance to get started with the theme.

## Features

- **Blazingly fast**: 100/100 on both desktop and mobile in [Google PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights)
- Powered by **[SolidJS](https://www.solidjs.com)**, a declarative, efficient, and flexible JavaScript library for building user interfaces
- JS **dynamic loading**
- Image **preloading** + **lazy loading**
- **Dynamic resolution** based on view mode
- **Cloud image CDN** (optional): production builds can serve gallery imagery from an on-the-fly image CDN (imgix / Cloudflare Images / Cloudinary) while local dev keeps using committed low-res copies — a single `hugo.IsProduction` + `cdnBase` switch, or one site partial (`cdnSrc.html`) for any other URL scheme; see [Images and a CDN](#images-and-a-cdn-optional)
- **Metadata-derived tags**: extract embedded IPTC/XMP keywords into `data/imagetags.yaml`, merged with hand-written front-matter tags to build the Archive filter — both sources survive re-extraction
- Multiple **analytics** services supported (Google, Fathom, Baidu, Umami, Plausible, Cloudflare, Splitbee)
- Search engine **verification** supported (Google, Bing, Yandex, Pinterest, Baidu, 360, Sogou)

### Content archetypes

- **Scatter gallery** — the default full-bleed, click-to-focus image collection
- **Posts** (`type: post` / `postlist`) — blog-style prose pages with an inline-image render hook and a click-to-open lightbox, plus a scattered post index
- **Archive** (`type: grid`) — a tag-filtered image grid with a full-screen, looping focus viewer; filter tags can be pinned first or hidden entirely via `[grid]` params (`pinTags` / `hideTags`)

### Images and a CDN (optional)

Without a CDN, the theme needs nothing extra: put images in the page bundle and Hugo resizes them at build time (`loResOpt` / `hiResOpt` in params). Keep the committed copies moderate (about 1600–2500 px wide), not camera originals.

Every image URL the theme emits (scatter gallery, Archive grid, post images, post-list tiles, mobile LCP preload) goes through one partial, `layouts/partials/function/imgSrc.html`. In a production build (`hugo.IsProduction`) with `cdnBase` set, it asks `function/cdnSrc.html` for the URL. If that returns no URL, the image is served from the bundle as above. `hugo server` and builds without `cdnBase` never touch the CDN.

**Query-string CDNs** (imgix, Cloudinary fetch, and similar): set the params and upload the full-size files under the same path as in `content/`, for example `grid/e1.jpg`. A resource's `cloudKey` param overrides that path.

```toml
cdnBase = "https://images.example.com"
cdnHiQuery = "?w=2500&fm=webp&q=75"
cdnLoQuery = "?w=800&fm=webp&q=60"
```

**Any other URL scheme, or only some images on the CDN**: override `cdnSrc.html` in your site (`layouts/partials/function/cdnSrc.html`). It gets the same arguments as `imgSrc` (`img`, `page`, `size` = `"hi"` or `"lo"`, optional `spec`). It returns `(dict "url" U "w" W "h" H)`, with `w`/`h` the size actually served, or an empty dict to use the bundle copy. This example sends only the full-size view to Cloudflare Image Transformations, for images listed in `data/cdn.json` (`{"<name>": {"w": 3000, "h": 2000}}`). Small sizes stay on your host, so first paint never waits on the CDN. On Hugo older than 0.156, use `site.Data` in place of `hugo.Data`.

```go-html-template
{{- $out := dict -}}
{{- $name := path.BaseName .img.Name -}}
{{- if eq .size "hi" -}}
  {{- with index (hugo.Data.cdn | default dict) $name -}}
    {{- $w := cond (lt .w 2500) .w 2500 -}}
    {{- $h := int (math.Round (mul (float .h) (div (float $w) (float .w)))) -}}
    {{- $url := printf "%s/cdn-cgi/image/width=%d,quality=75,format=auto/%s.jpg" site.Params.cdnBase $w $name -}}
    {{- $out = dict "url" $url "w" $w "h" $h -}}
  {{- end -}}
{{- end -}}
{{- return $out -}}
```

Upload files of about 3000 px rather than camera originals. A cold Cloudflare transform of a 60 MP original can time out (`cf-resized: err=9504`, HTTP 524), and that shows as a broken image.

`pnpm images <masters-dir>` prepares photos in one pass: it extracts embedded keywords into `data/imagetags.yaml`, writes EXIF-stripped, orientation-baked copies for upload (GPS, serial and timestamps removed), and writes the downscaled previews to commit. Originals and upload copies stay out of git (`masters/`, `dist-images/`).

## Credits

- Forked from [Sped0n/bridget](https://github.com/Sped0n/bridget), the upstream theme this build extends
- https://github.com/tylermcrobert/bridget-pictures-www
- https://www.youtube.com/watch?v=Jt3A2lNN2aE
- https://github.com/d4cho/bridget-pictures-clone
- https://www.solidjs.com/tutorial
- https://lmchabot.com
- https://gregorcollienne.com
