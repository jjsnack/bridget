# Bridget Theme - File Index

This document provides a description of every file in the codebase.

## Root Configuration Files

- **`.eslintignore`** - Specifies files and directories to ignore for ESLint linting
- **`.eslintrc.json`** - ESLint configuration for JavaScript/TypeScript code quality and style rules
- **`.gitignore`** - Lists files and directories Git should ignore
- **`.hugo_build.lock`** - Hugo build lock file to track build state
- **`.prettierignore`** - Specifies files Prettier should not format
- **`.prettierrc.json`** - Prettier configuration for code formatting rules
- **`CLAUDE.md`** - Documentation for Claude Code with development commands and architecture overview
- **`CODE_OF_CONDUCT.md`** - Community code of conduct and behavior guidelines
- **`LICENSE`** - MIT license for the project
- **`README.md`** - Main project documentation with features, setup instructions, and usage
- **`go.mod`** - Go module file defining Hugo module dependencies
- **`package.json`** - npm package definition with scripts, dependencies, and project metadata
- **`pnpm-lock.yaml`** - Lockfile for pnpm package manager ensuring consistent dependency versions
- **`theme.toml`** - Hugo theme metadata including name, description, author, and minimum Hugo version
- **`tsconfig.json`** - TypeScript compiler configuration
- **`vite.config.ts`** - Vite build tool configuration for bundling TypeScript/Solid.js assets

## GitHub Configuration

### `.github/`

- **`codeql-config.yml`** - Configuration for GitHub CodeQL security analysis
- **`dependabot.yml`** - Dependabot configuration for automated dependency updates

### `.github/ISSUE_TEMPLATE/`

- **`bug_report.yaml`** - Template for bug report issues
- **`config.yml`** - Issue template configuration
- **`feature_request.yaml`** - Template for feature request issues

### `.github/workflows/`

- **`build.yml`** - GitHub Actions workflow for building and deploying the site
- **`codeql.yml`** - GitHub Actions workflow for security scanning with CodeQL
- **`eslint.yml`** - GitHub Actions workflow for running ESLint checks

## Hugo Archetypes

### `archetypes/`

- **`blog.md`** - Template for creating new blog posts with front matter
- **`collection.md`** - Template for creating new collection pages with front matter (type: collection, layout: list)
- **`default.md`** - Default template for new Hugo content
- **`gallery.md`** - Template for creating new photo galleries with navigation config
- **`tags.md`** - Template for creating tags page with front matter (type: tags, layout: list)

## Assets - SCSS Styles

### `assets/scss/_core/`

- **`_base.scss`** - Base HTML element styles and box-sizing reset
- **`_font.scss`** - Font-face declarations for Geist, Noto Sans CJK, and Tamil fonts
- **`_mixins.scss`** - Sass mixins for responsive breakpoints (width-based and aspect-ratio based)
- **`_reset.scss`** - CSS reset to normalize browser default styles
- **`_typography.scss`** - Typography styles for headings, paragraphs, links, and text elements

### `assets/scss/_partial/`

- **`_article.scss`** - Styles for article content containers and blog post layout
- **`_blog.scss`** - Specific styles for blog list and entry display
- **`_collection.scss`** - Styles for mobile collection view with sticky scrolling images
- **`_container.scss`** - Main container styles and scroll locking functionality
- **`_customCursor.scss`** - Custom cursor styles for desktop with text display
- **`_gallery.scss`** - Mobile gallery overlay styles with Swiper integration and nav positioning
- **`_nav.scss`** - Navigation bar styles with dynamic positioning (top/bottom) and responsive behavior
- **`_stage.scss`** - Desktop stage view styles for photo display and image scaling
- **`_stageNav.scss`** - Desktop stage navigation controls (prev/next/close) overlay

### `assets/scss/`

- **`_variables.scss`** - CSS custom properties for dynamic viewport presets and z-index layers
- **`collection.scss`** - Collection grid and tile styling with responsive layout and title rotation
- **`collection-single.scss`** - Collection single-item page styling with draggable elements, gallery overlay, and custom cursor
- **`critical.scss`** - Critical above-the-fold CSS loaded inline
- **`style.scss`** - Main stylesheet importing all partials and core styles
- **`tags.scss`** - Tags browser styling with filter UI, search, tag chips, image grid, and infinite scroll

## Assets - TypeScript/Solid.js

### `assets/ts/desktop/`

- **`customCursor.tsx`** - Custom cursor component that follows mouse and displays hover text
- **`layout.tsx`** - Main desktop layout coordinator managing stage, nav, and cursor state
- **`nav.tsx`** - Desktop navigation bar component (appears to be unused, HTML template used instead)
- **`stage.tsx`** - Photo stage component with image display, navigation, and GSAP animations
- **`stageNav.tsx`** - Stage navigation overlay with prev/next/close buttons and hover interactions

### `assets/ts/mobile/`

- **`collection.tsx`** - Mobile collection scroll view with sticky image positioning
- **`gallery.tsx`** - Mobile gallery overlay with Swiper slider and GSAP slide animations
- **`galleryImage.tsx`** - Individual gallery image component with lazy loading
- **`galleryNav.tsx`** - Gallery navigation bar showing image counter and close button
- **`layout.tsx`** - Mobile layout coordinator managing collection and gallery views

### `assets/ts/collection/`

- **`collectionMain.tsx`** - Entry point for collection grid page (renders CollectionGrid component)
- **`collectionSingle.tsx`** - Entry point for collection single-item view page
- **`grid.tsx`** - Collection grid component with responsive layout switching (grid/absolute positioning)
- **`layout.ts`** - Seeded random positioning algorithm using Mulberry32 PRNG for deterministic tile placement
- **`singleView.tsx`** - Single collection item view component with draggable interactions
- **`tile.tsx`** - Individual collection tile with image cycling, title rotation, and hover effects
- **`types.ts`** - TypeScript interfaces for collection data (CollectionImage, CollectionData, TilePosition, TileBounds)

### `assets/ts/tags/`

- **`tagsMain.tsx`** - Entry point for tags browser page (renders TagBrowser component)
- **`tagBrowser.tsx`** - Main coordinator component managing filtering, grid, and stage/gallery integration
- **`tagFilter.tsx`** - Tag search/filter UI with autocomplete, tag chips, and expandable tag list
- **`imageGrid.tsx`** - Image grid component with infinite scroll in square layout
- **`gridTile.tsx`** - Individual image tile in the tags grid (always square aspect ratio)
- **`scrollToTop.tsx`** - Scroll-to-top button that appears when user scrolls down
- **`types.ts`** - TypeScript interfaces for tags data (TaggedImage, FilterState, TagsData)

### `assets/ts/`

- **`main.tsx`** - Application entry point with device detection, ViewportProvider, and layout rendering
- **`presets.ts`** - Viewport aspect-ratio preset configurations (mobile/portrait/square/landscape)
- **`resources.ts`** - Fetches image JSON data from Hugo-generated endpoints
- **`state.tsx`** - Solid.js context for gallery state management (index, threshold, navigation)
- **`utils.ts`** - Utility functions for navigation, formatting, and dynamic library loading
- **`viewport.tsx`** - ViewportProvider component managing aspect-ratio detection and preset switching

## Documentation

### `doc/`

- **`getStarted.md`** - Complete setup and configuration guide for theme installation and customization

## Example Site Configuration

### `exampleSite/config/_default/`

- **`hugo.toml`** - Main Hugo site configuration with base URL, title, and module settings
- **`markup.toml`** - Markdown rendering configuration with code highlighting
- **`outputs.toml`** - Defines output formats (HTML, RSS, JSON) for different page types
- **`params.toml`** - Theme parameters including favicon, image processing, analytics, and verification
- **`sitemap.toml`** - Sitemap generation configuration

### `exampleSite/`

- **`.hugo_build.lock`** - Hugo build lock file for example site
- **`go.mod`** - Go module file for example site Hugo module dependencies

## Example Site Content

### `exampleSite/content/blog/`

- **`_index.md`** - Blog section index page configuration
- **`first-post.md`** - Example blog post demonstrating markdown content
- **`second-post.md`** - Another example blog post
- **`photography-tips/index.md`** - Blog post with multiple images demonstrating gallery functionality
- **`photography-tips/example1.jpg`** - Example image for blog post
- **`photography-tips/example2.jpg`** - Example image for blog post
- **`photography-tips/example3.jpg`** - Example image for blog post

### `exampleSite/content/collections/`

- **`_index.md`** - Collections section index page configuration
- **`Erwitt/index.md`** - Example collection metadata and configuration
- **`Erwitt/1.jpg` through `Erwitt/4.jpg`** - Sample collection images
- **`Gruyaert/index.md`** - Example collection metadata and configuration
- **`Gruyaert/1.jpg` through `Gruyaert/4.jpg`** - Sample collection images
- **`Webb/index.md`** - Example collection metadata and configuration
- **`Webb/1.jpg` through `Webb/4.jpg`** - Sample collection images

### `exampleSite/content/Erwitt/`

- **`index.md`** - Gallery configuration and metadata for Erwitt photo collection
- **`1.jpg` through `25.jpg`** - Photo gallery images

### `exampleSite/content/Gruyaert/`

- **`index.md`** - Gallery configuration and metadata for Gruyaert photo collection
- **`1.jpg` through `35.jpg`** - Photo gallery images

### `exampleSite/content/Webb/`

- **`index.md`** - Gallery configuration and metadata for Webb photo collection
- **`1.jpg` through `30.jpg`** - Photo gallery images

### `exampleSite/content/Info/`

- **`index.md`** - Info/About page content

## Example Site Static Assets

### `exampleSite/static/`

- **`dot.png`** - Fallback PNG favicon
- **`dot.svg`** - SVG favicon

## Hugo Layouts

### `layouts/_default/`

- **`baseof.html`** - Base template defining HTML structure, head, and body blocks
- **`single.html`** - Default single page template for content pages
- **`single.json`** - JSON output format for single pages

### `layouts/blog/`

- **`list.html`** - Blog list page template showing all blog posts
- **`single.html`** - Individual blog post template with article content

### `layouts/collection/`

- **`list.html`** - Collection listing page with Solid.js grid component and embedded JSON data
- **`single.html`** - Individual collection detail page with draggable content, image gallery, custom cursor, and inline GSAP script

### `layouts/gallery/`

- **`single.html`** - Photo gallery template with Solid.js container and image JSON data

### `layouts/tags/`

- **`list.html`** - Tags browser page with Solid.js tag filter, image grid, and embedded JSON data of all tagged images

### `layouts/partials/function/`

- **`currentMenuItem.html`** - Helper function to determine current active menu item
- **`getImageSlice.html`** - Helper function to get slice of images for gallery
- **`langCode.html`** - Helper function to normalize language codes for font loading

### `layouts/partials/head/`

- **`favicon.html`** - Favicon link tags with SVG and PNG fallback
- **`link.html`** - Additional link tags (RSS, sitemap, etc.)
- **`meta.html`** - Meta tags for charset, viewport, and description
- **`seo.html`** - SEO meta tags including Open Graph and Twitter Cards

### `layouts/partials/plugin/`

- **`analytics.html`** - Analytics integration (Google, Fathom, Baidu, Umami)
- **`script.html`** - JavaScript bundle inclusion from Vite build
- **`style.html`** - CSS bundle inclusion from Vite build and Hugo SCSS processing

### `layouts/partials/`

- **`nav.html`** - Main navigation bar template with menu items, index counter, and threshold controls

### `layouts/shortcodes/`

- **`year.html`** - Shortcode to display current year

### `layouts/`

- **`404.html`** - 404 error page template
- **`robots.txt`** - Dynamic robots.txt template
- **`sitemap.xml`** - Custom sitemap.xml template

## Internationalization

### `i18n/`

- **`de.toml`** - German translations for UI strings
- **`en.toml`** - English translations for UI strings
- **`es.toml`** - Spanish translations for UI strings
- **`fr.toml`** - French translations for UI strings
- **`it.toml`** - Italian translations for UI strings
- **`ja.toml`** - Japanese translations for UI strings
- **`ko.toml`** - Korean translations for UI strings
- **`ta.toml`** - Tamil translations for UI strings
- **`zh-cn.toml`** - Simplified Chinese (China) translations
- **`zh-hk.toml`** - Traditional Chinese (Hong Kong) translations
- **`zh-mo.toml`** - Traditional Chinese (Macau) translations
- **`zh-sg.toml`** - Simplified Chinese (Singapore) translations
- **`zh-tw.toml`** - Traditional Chinese (Taiwan) translations

## Theme Images

### `images/`

- **`screenshot.jpg`** - Theme screenshot for Hugo theme showcase
- **`tn.jpg`** - Theme thumbnail image

## Static Font Files

### `static/lib/fonts/`

- **`fw.woff2`** - Framework font file
- **`GeistVF.woff2`** - Geist variable font for Latin scripts
- **`NotoSans-Regular.woff2`** - Noto Sans regular font
- **`NotoSansCJKjp-Regular.woff2`** - Noto Sans CJK Japanese font
- **`NotoSansCJKkr-Regular.woff2`** - Noto Sans CJK Korean font
- **`NotoSansCJKsc-Regular.woff2`** - Noto Sans CJK Simplified Chinese font
- **`NotoSansCJKtc-Regular.woff2`** - Noto Sans CJK Traditional Chinese font
- **`NotoSansTamil-Regular.woff2`** - Noto Sans Tamil font

## Build Output (Generated)

### `public/` and `public/bundled/`

These directories contain generated build artifacts from Vite and Hugo:
- **CSS files** - Compiled and minified stylesheets
- **JS files** - Bundled and minified JavaScript modules
- **Font files** - Copied font assets
- **Critical CSS** - Above-the-fold CSS with source maps
- **Sitemap** - Generated sitemap.xml

Note: These are build artifacts and should not be edited directly.

## Claude Code Configuration

### `.claude/`

- **`settings.local.json`** - Local Claude Code settings and preferences
