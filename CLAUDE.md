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
- `collection/list.html` - Collection grid view with Solid.js grid component
- `collection/single.html` - Individual collection page with draggable interactions and GSAP gallery
- `tags/list.html` - Tags browser page with filtering, search, and image grid
- `blog/` - Blog post templates
- `partials/` - Reusable template components

#### 2. Solid.js Frontend (`/assets/ts`)
- **Entry Points**:
  - `main.tsx` - Renders mobile vs desktop layouts with ViewportProvider (for gallery/blog pages)
  - `collection/collectionMain.tsx` - Renders collection grid component (for collections list page)
  - `collection/collectionSingle.tsx` - Renders single collection view (for individual collection pages)
  - `tags/tagsMain.tsx` - Renders tags browser component (for tags page)
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
- **Collection Components** (`/assets/ts/collection/`):
  - `grid.tsx` - Collection grid with responsive layout (grid/absolute positioning)
  - `tile.tsx` - Individual collection tile with image cycling and title rotation
  - `singleView.tsx` - Single collection view with draggable interactions
  - `layout.ts` - Seeded random positioning algorithm (Mulberry32 PRNG)
  - `types.ts` - Collection data interfaces
- **Tags Components** (`/assets/ts/tags/`):
  - `tagBrowser.tsx` - Main coordinator managing filtering, grid, and stage/gallery integration
  - `tagFilter.tsx` - Tag search/filter UI with autocomplete, chips, and expandable tag list
  - `imageGrid.tsx` - Image grid with infinite scroll and aspect ratio toggle
  - `gridTile.tsx` - Individual image tile in the grid
  - `types.ts` - Tags data interfaces
- **Core Systems**:
  - `viewport.tsx` - Aspect-ratio based viewport preset system
  - `presets.ts` - Configuration for mobile/portrait/square/landscape presets
  - `state.tsx` - Gallery state management (index, threshold)
- **Utilities**: `resources.ts`, `utils.ts`

#### 3. Build System
- **Vite Config**: Builds TypeScript/Solid.js to `/static/bundled` with multiple entry points:
  - `main.tsx` → `main.js` (gallery/blog pages)
  - `collection/collectionMain.tsx` → `collection.js` (collection grid page)
  - `tags/tagsMain.tsx` → `tags.js` (tags browser page)
- **SCSS Bundles**: Separate stylesheets for different page types:
  - `style.scss` → main styles
  - `collection.scss` → collection grid styles
  - `collection-single.scss` → collection detail page styles
  - `tags.scss` → tags browser styles
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

#### Collection System Architecture
The site includes a sophisticated collection/tagging system for organizing and browsing photo collections:

**Collection Grid Page** (`/collections/`):
- Uses `collectionMain.tsx` entry point rendering `CollectionGrid` component
- Hugo template embeds collection data as JSON in script tag
- **Responsive Layout Modes**:
  - **Mobile/Portrait presets**: CSS Grid layout with visible titles, no rotation
  - **Square/Landscape presets**: Absolute positioning with seeded random placement, rotated titles hidden until hover
- **Tile Features**:
  - Image cycling on hover (desktop) or touch (mobile) through collection images
  - Title rotation through 4 positions: bottom → right → top → left
  - Draggable tiles on desktop
  - Each tile displays hero image with low/high resolution loading

**Collection Single Page** (individual collection detail):
- Uses `collectionSingle.tsx` entry point (or inline script in Hugo template)
- **Draggable Content**: Text and info elements positioned with seeded random algorithm
- **Image Gallery**:
  - Custom cursor interaction for expanding images
  - GSAP animations for smooth expand/minimize transitions
  - Fullscreen overlay gallery with navigation
- **Seeded Random Positioning**:
  - Uses Mulberry32 PRNG with collection title as seed
  - Ensures deterministic, reproducible layouts per collection
  - Calculates tile positions, dimensions (8-12vw width, 1-2 aspect ratio), and z-index
  - Prevents overlaps and maintains viewport boundaries

**Integration with Viewport Presets**:
- Collection grid adapts layout strategy based on aspect ratio
- Title visibility and rotation controlled by body classes
- Spacing, gaps, and padding adjust per preset
- Mobile preset optimizes for vertical scrolling

**Data Flow**:
1. Hugo processes collection pages with `type: collection`
2. Hugo template generates JSON data structure with images and metadata
3. Solid.js components consume JSON and render interactive grid/single views
4. Collection data interface: `{ title, permalink, hero: {width, height}, images: [{loRes, hiRes, width, height}] }`

#### Tags System Architecture
The site includes a powerful tag-based filtering and browsing system for discovering photos across all galleries and collections:

**Tags Browser Page** (`/tags/`):
- Unified page that aggregates all tagged images from across the entire site
- Hugo template iterates through all pages, collects images with tags, and embeds as JSON
- Uses `tagsMain.tsx` entry point rendering `TagBrowser` component
- **Filter UI Features**:
  - **Search bar with autocomplete**: Type to search tags with dropdown suggestions
  - **Tag chips**: Selected tags appear as removable chips
  - **Expandable tag list**: "Open tags" button reveals all available tags
  - **Multi-select filtering**: Select multiple tags to filter images (AND logic)
- **Image Grid**:
  - Displays all images matching selected tag filters
  - **Infinite scroll**: Loads 30 images initially, more as user scrolls
  - **Aspect ratio toggle**: Switch between natural aspect ratio (masonry grid) and square aspect ratio (uniform grid)
  - Shows image count and source gallery/collection name on hover
  - Click image to open in stage (desktop) or gallery (mobile)

**Stage/Gallery Integration**:
- **Desktop**: Reuses existing `Stage` and `StageNav` components
- **Mobile**: Reuses existing `Gallery` component (Swiper-based)
- Filtered images are converted to `ImageJSON[]` format for compatibility
- Navigate through filtered subset of images in stage/gallery view
- Close stage returns to grid with filters preserved

**Tag Data Collection**:
- Hugo iterates through all site pages checking for `tags` parameter in front matter
- Collects images from pages with tags (both galleries and collections)
- Each image stores: URLs, dimensions, alt text, source info, tags array, source index
- All unique tags extracted and sorted for filter UI
- Data structure: `{ images: TaggedImage[], allTags: string[] }`

**Filtering Logic**:
- Client-side filtering using Solid.js reactive primitives
- When tags selected: show only images where ALL selected tags are present
- Empty selection: show all tagged images
- Search filters available tags in autocomplete and tag list
- Filter state preserved when opening/closing stage/gallery

**Integration with Viewport Presets**:
- Tags page responds to viewport preset system
- Grid layout adapts spacing and columns per preset
- Filter UI sticky positioning adjusts based on nav position
- Mobile-optimized filter controls and grid on narrow screens

**Performance Optimizations**:
- Infinite scroll reduces initial render load
- Lazy loading of stage/gallery components
- Image tiles preload low-res, then upgrade to high-res
- Filter calculations memoized with Solid.js `createMemo`
- Intersection Observer for efficient scroll detection

#### Content Architecture
- **Galleries**: Photo collections in `/content/[collection-name]/`
- **Collections**: Themed photo groups in `/content/collections/[collection-name]/` (browsable grid view)
- **Tags**: Unified browsing page at `/tags/` aggregating all tagged images across galleries and collections
- **Blog Posts**: Standard blog content in `/content/blog/`
- **Info Pages**: Static content pages
- **Each gallery** requires `index.md` with navigation configuration
- **Each collection** requires `index.md` with `type: collection` front matter
- **Tags page** requires `index.md` with `type: tags` and `layout: list` front matter
- **Any gallery or collection** can have `tags: [tag1, tag2]` in front matter to be included in tags browser

### File System Conventions

#### Content Structure
```
content/
├── [gallery-name]/
│   ├── index.md (type: gallery, navigation config, optional tags: [])
│   └── *.jpg (photos)
├── collections/
│   ├── _index.md
│   └── [collection-name]/
│       ├── index.md (type: collection, optional tags: [])
│       └── *.jpg (collection photos)
├── tags/
│   └── index.md (type: tags, layout: list)
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
- Collections use `type: collection` and can have either `layout: list` (grid view) or `layout: single` (detail page)
- Blog posts use standard markdown with image support
- Solid.js state management for scroll control and image loading states
- Desktop layout includes custom cursor functionality
- Mobile layout uses Swiper for touch-optimized navigation
- Collection pages support draggable interactions and GSAP-powered animations

#### Performance Considerations
- Viewport calculations debounced to reduce resize event overhead
- CSS transitions only on specific properties (height, font-size, padding, etc.)
- GPU-accelerated transforms (translate3d, scale) for animations
- Lazy loading for desktop/mobile layout components
- Dynamic library loading (GSAP, Swiper) on user interaction
- Collection tile positioning calculated once on mount using seeded PRNG (deterministic, no re-calculations)
- GSAP Draggable plugin loaded dynamically only on collection single pages
- Collection grid switches between CSS Grid (mobile/portrait) and absolute positioning (square/landscape) for optimal performance
