# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
- `pnpm dev` - Start development server (runs Vite in dev mode + Hugo server)
- `pnpm run hugo:dev` - Run only Hugo dev server with live reload
- `pnpm run vite:dev` - Build assets in development mode

### Building
- `pnpm build` - Full production build (Vite build + Hugo build)
- `pnpm run vite:build` - Build and minify assets only
- `pnpm run hugo:build` - Build Hugo site only

### Linting & Formatting
- `pnpm lint` - Run ESLint with auto-fix and Prettier formatting
- `pnpm run lint:check` - Check linting and formatting without fixing

### Preview & Testing
- `pnpm server` - Run production server locally
- `pnpm run hugo:preview` - Hugo server with draft content enabled

## Architecture Overview

**Bridget** is a minimal Hugo theme for photographers/visual artists with a modern TypeScript/Solid.js frontend.

### Core Technologies
- **Hugo** (extended version required, min 0.114.0) - Static site generator
- **Solid.js** - Reactive UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **SCSS** - Styling with Sass preprocessing
- **GSAP** - Animation library
- **Swiper** - Touch slider component

### Architecture Layers

#### 1. Hugo Template Layer (`/layouts`)
- `baseof.html` - Base template with HTML structure
- `gallery/single.html` - Photo gallery viewer with Solid.js container
- `blog/` - Blog post templates
- `partials/` - Reusable template components

#### 2. Solid.js Frontend (`/assets/ts`)
- **Entry Point**: `main.tsx` - Renders mobile vs desktop layouts
- **Desktop Components** (`/assets/ts/desktop/`):
  - `layout.tsx` - Main desktop layout coordinator
  - `stage.tsx` - Photo viewing stage with navigation
  - `nav.tsx` - Navigation bar
  - `customCursor.tsx` - Custom cursor with text
  - `stageNav.tsx` - Photo navigation controls
- **Mobile Components** (`/assets/ts/mobile/`):
  - `layout.tsx` - Mobile-optimized layout
  - `gallery.tsx` - Touch-optimized gallery
  - `collection.tsx` - Collection viewer
- **Utilities**: `resources.ts`, `utils.ts`, `state.tsx`

#### 3. Build System
- **Vite Config**: Builds TypeScript/Solid.js to `/static/bundled`
- **Output**: ES modules with code splitting and terser minification
- **Watch Mode**: Automatic rebuilds during development

### Key Architectural Patterns

#### Device Detection & Rendering
- `main.tsx` detects mobile devices using hover capability and user agent
- Lazy loads appropriate layout components (Desktop vs Mobile)
- Mobile detection: `window.matchMedia('(hover: none)').matches`

#### Image Processing Pipeline
- Hugo's image processing generates multiple resolutions (`loResOpt`, `hiResOpt` in config)
- Dynamic resolution loading based on view mode
- Preloading and lazy loading strategies

#### Content Architecture
- **Galleries**: Photo collections in `/content/[collection-name]/`
- **Blog Posts**: Standard blog content in `/content/blog/`
- **Info Pages**: Static content pages
- **Each gallery** requires `index.md` with navigation configuration

### File System Conventions

#### Content Structure
```
content/
├── [collection-name]/
│   ├── index.md (navigation config)
│   └── *.jpg (photos)
├── blog/
│   ├── _index.md
│   └── [post-name].md
└── Info/
    └── index.md
```

#### Asset Structure
```
assets/
├── ts/ (TypeScript/Solid.js source)
├── scss/ (Sass stylesheets)
└── → builds to static/bundled/
```

#### Template Structure
```
layouts/
├── _default/baseof.html (base template)
├── gallery/ (photo gallery layouts)
├── blog/ (blog layouts)
└── partials/ (reusable components)
```

### Hugo-Specific Patterns

#### Module System
- Theme available as Hugo module: `github.com/Sped0n/bridget/v2`
- Local development uses `replacements` in hugo.toml
- Production deployments should remove `replacements`

#### Image Processing
- Uses Hugo's built-in image processing with WebP conversion
- Configured via `loResOpt` and `hiResOpt` parameters
- Images automatically generate multiple sizes for responsive loading

#### Multilingual Support
- Built-in i18n for: English, Chinese (Simplified/Traditional), Japanese, Korean, German, Spanish, Italian, Tamil
- Language files in `/i18n/`
- Language detection via `defaultContentLanguage` in config

### Development Workflow
1. Run `pnpm install` to install dependencies
2. Use `pnpm dev` for development with hot reload
3. Vite watches `/assets` and rebuilds automatically
4. Hugo server provides live reload for content/template changes
5. Final build with `pnpm build` generates optimized assets

### Critical Implementation Details
- Photo galleries use `type: gallery` and `layout: single` in front matter
- Blog posts use standard markdown with image support
- Solid.js state management for scroll control and image loading states
- Desktop layout includes custom cursor functionality
- Mobile layout uses Swiper for touch-optimized navigation
