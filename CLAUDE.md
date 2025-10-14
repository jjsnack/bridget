# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

I have provided you with two files:
- The file \@general_index.md contains a list of all the files in the codebase along with a simple description of what it does.
This index may or may not be up to date.

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
- **Entry Point**: `main.tsx` - Renders mobile vs desktop layouts with ViewportProvider
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
- **Core Systems**:
  - `viewport.tsx` - Aspect-ratio based viewport preset system
  - `presets.ts` - Configuration for mobile/portrait/square/landscape presets
  - `state.tsx` - Gallery state management (index, threshold)
- **Utilities**: `resources.ts`, `utils.ts`

#### 3. Build System
- **Vite Config**: Builds TypeScript/Solid.js to `/static/bundled`
- **Output**: ES modules with code splitting and terser minification
- **Watch Mode**: Automatic rebuilds during development

### Key Architectural Patterns

#### Viewport Preset System (Dynamic Responsive Design)
The site uses an aspect-ratio based preset system that adapts layout in real-time:

**Presets** (`presets.ts`):
- **Mobile** (ratio < 0.6): Very narrow screens, nav at top, compact spacing
- **Portrait** (0.6-0.9): Tablet portrait, nav at bottom, moderate spacing
- **Square** (0.9-1.2): Balanced viewports, nav at bottom, standard spacing
- **Landscape** (> 1.2): Wide screens, nav at bottom, expanded spacing

**How It Works**:
1. `ViewportProvider` (in `viewport.tsx`) wraps the app in `main.tsx`
2. Calculates viewport aspect ratio on load and resize (debounced 150ms)
3. Determines active preset and applies configuration via:
   - CSS custom properties (--nav-height, --nav-font-size, --collection-gap, etc.)
   - Body classes (nav-top/nav-bottom, preset-mobile/portrait/square/landscape)
4. All layouts respond to these variables with smooth 300ms transitions

**Configuration** (`presets.ts`):
- All dynamic values centralized (nav height, font size, image scales, gaps, padding)
- Easy to tune presets without touching component code
- Type-safe TypeScript interfaces

**CSS Integration**:
- `_variables.scss` defines CSS custom properties updated by JS
- `_mixins.scss` provides aspect-ratio media query mixins
- Component SCSS files use CSS variables for dynamic sizing
- Body classes control navbar position and element visibility

#### Device Detection & Rendering
- `main.tsx` detects mobile devices using hover capability and user agent
- Lazy loads appropriate layout components (Desktop vs Mobile)
- Mobile detection: `window.matchMedia('(hover: none)').matches`
- Works independently of viewport preset system

#### Dynamic Navbar Positioning
- **Top position** (mobile/portrait presets): White background, content starts below
- **Bottom position** (square/landscape presets): Transparent background, content uses full viewport
- Position controlled by body classes set by `ViewportProvider`
- Stage, gallery, and collection boundaries adjust automatically
- Mobile gallery hides internal nav when main nav is at top

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

#### Viewport & Responsive System
- **Viewport presets** automatically adjust all layout dimensions based on aspect ratio
- CSS custom properties in `:root` are updated by `ViewportProvider` via JavaScript
- Body classes (nav-top/nav-bottom, preset-*) control conditional styling
- 300ms transitions provide smooth preset changes
- Debounced resize handler (150ms) prevents performance issues

#### Navigation Bar
- Dynamic positioning: top (mobile/portrait) or bottom (square/landscape)
- Background: white when at top, transparent when at bottom
- Text: black, uppercase, no wrapping
- Height/font-size/padding adjust per preset
- Internal gallery nav hidden when main nav is at top

#### Layout Boundaries
- **Stage**: Positioned below nav when at top, uses full viewport when nav at bottom
- **Gallery**: Starts below nav when at top, internal nav hidden; full viewport when nav at bottom
- **Collection**: Margin/sticky positioning adjusts based on nav position
- All boundaries transition smoothly between presets

#### Gallery System
- Photo galleries use `type: gallery` and `layout: single` in front matter
- Blog posts use standard markdown with image support
- Solid.js state management for scroll control and image loading states
- Desktop layout includes custom cursor functionality
- Mobile layout uses Swiper for touch-optimized navigation

#### Performance Considerations
- Viewport calculations debounced to reduce resize event overhead
- CSS transitions only on specific properties (height, font-size, padding, etc.)
- GPU-accelerated transforms (translate3d, scale) for animations
- Lazy loading for desktop/mobile layout components
- Dynamic library loading (GSAP, Swiper) on user interaction
