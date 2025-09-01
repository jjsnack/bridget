# Bridget

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/Sped0n/bridget/build.yml?logo=github) ![GitHub deployments](https://img.shields.io/github/deployments/Sped0n/bridget/Production?logo=vercel&label=deploy)

Bridget is a minimal [Hugo](https://gohugo.io) theme for photographers/visual artists, powered by [Solid.js](https://www.solidjs.com).

Based on the https://github.com/tylermcrobert/bridget-pictures-www.

![thumbnail](images/tn.jpg)

## [Demo Site](https://bridget-demo.sped0n.com)

To see this theme in action, here is a live [demo site](https://bridget-demo.sped0n.com) which is rendered with **Bridget** theme.

## Getting Started

Head to this [documentation](https://github.com/Sped0n/bridget/blob/main/doc/getStarted.md) for a complete guidance to get started with the Bridget theme.

### Blog Functionality

This theme now includes blog functionality with a clean, minimal design matching the photography galleries.

#### Creating a New Blog Post

1. Create a new blog post using Hugo's archetype:
   ```bash
   hugo new blog/my-post-title.md
   ```

2. This will create a new file at `content/blog/my-post-title.md` with the proper front matter.

3. Edit the file to add your content using standard Markdown.

#### Adding Photos to Blog Posts

**Single Photo:**
```markdown
![Photo description](photo.jpg)
```

**Multiple Photos (Gallery/Carousel):**
For a gallery of photos in a blog post, place your images in the same directory as your blog post and reference them:

1. Create a directory structure like this:
   ```
   content/blog/my-post-with-photos/
   ├── index.md
   ├── photo1.jpg
   ├── photo2.jpg
   └── photo3.jpg
   ```

2. In your `index.md`, use standard Markdown image syntax:
   ```markdown
   +++
   title = "My Post with Photos"
   date = 2024-01-01T12:00:00Z
   +++

   Here's my blog post content.

   ![First photo](photo1.jpg)
   ![Second photo](photo2.jpg)
   ![Third photo](photo3.jpg)
   ```

The theme's responsive image handling will automatically optimize and display your photos appropriately.

## Features

- **Blazingly fast**: 100/100 on both desktop and mobile in [Google PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights)
- Powered by **[Solid.js](https://www.solidjs.com)**, a declarative, efficient, and flexible JavaScript library for building user interfaces
- JS **dynamic loading** (powered by ESM)
- Image **Preloading**/**Lazy loading**
- **Dynamic resolution** based on view mode
- Multiple **analytics** services supported
- Search engine **verification** supported (Google, Bind, Yandex and Baidu)

## Multilingual and i18n

Bridget supports the following languages:

- English
- Simplified Chinese
- Traditional Chinese
- Japanese
- Korean
- Deutsch
- Spanish
- Italian
- Tamil
- [Contribute with a new language](https://github.com/Sped0n/bridget/pulls)

## Credits

- https://github.com/tylermcrobert/bridget-pictures-www
- https://www.youtube.com/watch?v=Jt3A2lNN2aE
- https://github.com/d4cho/bridget-pictures-clone
- https://www.solidjs.com/tutorial
