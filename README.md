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
- **Cloud image CDN** (optional): production builds can serve gallery imagery from an on-the-fly image CDN (imgix / Cloudflare Images / Cloudinary) while local dev keeps using committed low-res copies — a single `hugo.IsProduction` + `cdnBase` switch, no template changes
- **Metadata-derived tags**: extract embedded IPTC/XMP keywords into `data/imagetags.yaml`, merged with hand-written front-matter tags to build the Archive filter — both sources survive re-extraction
- Multiple **analytics** services supported (Google, Fathom, Baidu, Umami, Plausible, Cloudflare, Splitbee)
- Search engine **verification** supported (Google, Bing, Yandex, Pinterest, Baidu, 360, Sogou)

### Content archetypes

- **Scatter gallery** — the default full-bleed, click-to-focus image collection
- **Posts** (`type: post` / `postlist`) — blog-style prose pages with an inline-image render hook and a click-to-open lightbox, plus a scattered post index
- **Archive** (`type: grid`) — a tag-filtered image grid with a full-screen, looping focus viewer

### Image pipeline (optional)

For a cloud-backed deploy, `pnpm images <masters-dir>` prepares photos in one pass: it extracts embedded keywords into `data/imagetags.yaml`, writes EXIF-stripped, orientation-baked full-res copies for CDN upload (GPS / serial / timestamps removed), and downscaled previews committed for local dev. Originals and upload copies stay out of git (`masters/`, `dist-images/`); only the previews and the tags file are committed. Set `cdnBase` plus `cdnHiQuery` / `cdnLoQuery` in params to serve the full-res copies from your CDN in production — leave `cdnBase` empty and the theme just Hugo-processes the local previews, so the pipeline is entirely opt-in.

## Credits

- Forked from [Sped0n/bridget](https://github.com/Sped0n/bridget), the upstream theme this build extends
- https://github.com/tylermcrobert/bridget-pictures-www
- https://www.youtube.com/watch?v=Jt3A2lNN2aE
- https://github.com/d4cho/bridget-pictures-clone
- https://www.solidjs.com/tutorial
- https://lmchabot.com
- https://gregorcollienne.com
