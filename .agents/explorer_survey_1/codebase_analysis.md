# Codebase Technical Analysis Report: QC Standard Wording Application

**Date**: 2026-08-09  
**Agent**: explorer_survey_1 (`teamwork_preview_explorer`)  
**Working Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_survey_1`  
**Target Project**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`  

---

## 1. Executive Summary & Architecture Overview

The **QC Standard Wording** application is a modern single-page React 19 web application built with Vite 6 and TypeScript 5. The project serves mobile technician smartphone QC inspection workflows by allowing technicians to quickly search, copy, batch-combine, and categorize standardized defect wording phrases.

### Primary Architectural Pillars
- **UI Component Framework**: Fully migrated from legacy Mantine UI to **shadcn/ui** patterns using `@radix-ui/react-*` primitives, `lucide-react` icons, `cmdk` (Spotlight modal), `sonner` (toasts), and Tailwind CSS v4.
- **Design System Palette**: Deep Zinc Dark Theme (`#09090b` background, `#18181b` surface containers, `#27272a` borders, `#06b6d4` cyan accent highlights).
- **State Management**: Centralized React custom hooks (`useQCState` and `useAppearance`) managing state and syncing across 14 persistent `localStorage` keys.
- **Data Models**: Structured datasets (`BASE_ITEMS`, `CATEGORIES`, `CODE_SUBS`) supporting 140 base defect items across 15 category groups and 10 panel sub-code categories.
- **Search Engine**: Custom fuzzy search engine with Bounded Levenshtein distance typo tolerance, alias expansion (`ALIAS`, `CATKEY`), sub-code filtering, and highlight segment computation.
- **Build & Deployment**: Vite 6 static bundle generator targetting Cloudflare Pages (`./dist` output dir configured in `wrangler.jsonc`).

---

## 2. Technology Stack & Package Dependencies

### Package Verification (`package.json`)
- **Mantine Removal**: Verified **0** `@mantine/*` or `@tabler/*` packages present in `package.json`.
- **Runtime Dependencies**:
  - `react` & `react-dom`: `^19.2.8`
  - `@radix-ui/react-checkbox`: `^1.1.4`
  - `@radix-ui/react-dialog`: `^1.1.6`
  - `@radix-ui/react-dropdown-menu`: `^2.1.6`
  - `@radix-ui/react-scroll-area`: `^1.2.3`
  - `@radix-ui/react-select`: `^2.1.6`
  - `@radix-ui/react-slot`: `^1.1.2`
  - `@radix-ui/react-toggle-group`: `^1.1.2`
  - `@radix-ui/react-tooltip`: `^1.1.8`
  - `class-variance-authority`: `^0.7.1`
  - `clsx`: `^2.1.1`
  - `cmdk`: `^1.0.0`
  - `lucide-react`: `^0.475.0`
  - `next-themes`: `^0.4.4`
  - `sonner`: `^2.0.1`
  - `tailwind-merge`: `^3.0.1`
- **Dev Dependencies**:
  - `tailwindcss` & `@tailwindcss/vite`: `^4.0.0`
  - `typescript`: `^5.7.2`
  - `vite`: `^6.0.0`
  - `vite-plugin-pwa`: `^0.21.1`
  - `wrangler`: `^3.111.0`
  - `jsdom`: `^26.1.0`

---

## 3. Project Structure & Directory Layout

```
QCStandardWording/
├── .agents/                      # Agent metadata (plans, briefings, reports)
├── dist/                         # Cloudflare Pages build output target
├── public/                       # Static web assets and icons
├── src/                          # Application source code
│   ├── components/               # Application UI components
│   │   ├── ui/                   # Primitive Radix/shadcn components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── command.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   └── tooltip.tsx
│   │   ├── AppHeader.tsx         # Top bar with hero search, view switcher & drawer triggers
│   │   ├── BatchDrawer.tsx       # Glassmorphic slide-out batch queue drawer
│   │   ├── CategoryChips.tsx     # Left sidebar category & custom folder navigation
│   │   ├── CodeSubChips.tsx      # Sub-category code filter chips (FCPB, FCPW, etc.)
│   │   ├── DefectCard.tsx        # Grid view defect item card component
│   │   ├── EditModal.tsx         # Modal for adding/editing wording items
│   │   ├── EditToolbar.tsx       # Toolbar for custom wording edit mode
│   │   ├── HistoryBar.tsx        # Horizontal recent copy history bar
│   │   ├── SettingsModal.tsx     # Appearance and settings modal dialog
│   │   ├── StatsDashboard.tsx    # Header summary metrics dashboard
│   │   ├── ToastsContainer.tsx   # Sonner floating toast container
│   │   ├── WordingContainer.tsx  # Main content wording list/grid/table wrapper
│   │   ├── WordingGrid.tsx       # Grid layout for defect cards
│   │   ├── WordingList.tsx       # Compact list layout for defect items
│   │   └── WordingTable.tsx      # High-density tabular layout for defect items
│   ├── data/
│   │   └── qcData.ts             # BASE_ITEMS (140 defects), CATEGORIES (15), CODE_SUBS (10), ALIAS
│   ├── hooks/
│   │   ├── useAppearance.ts      # Theme, layout mode, radius, density settings hook
│   │   └── useQCState.ts         # Main state hook for 14 localStorage keys
│   ├── lib/
│   │   └── utils.ts              # Class merging helper cn()
│   ├── theme/
│   │   ├── index.ts              # Theme tokens export
│   │   └── tokens.ts             # Theme color definitions
│   ├── types/
│   │   └── qc.ts                 # TypeScript type definitions (QCItem, CustomPinFolder, etc.)
│   ├── utils/
│   │   ├── categoryColors.ts     # Category Lucide icon map, badge & border styling
│   │   ├── clipboard.ts          # Async clipboard write & haptic vibration helpers
│   │   ├── notifications.ts      # Sonner toast wrapper utilities
│   │   └── searchEngine.ts       # Fuzzy search engine with Levenshtein distance
│   ├── App.tsx                   # Main root application layout component
│   ├── main.tsx                  # React DOM root mounting entrypoint
│   └── index.css                 # Tailwind CSS v4 imports and root CSS variables
├── tests/                        # E2E Test Suite (Node.js test runner + JSDOM)
│   ├── harness.js                # JSDOM DOM emulator & esbuild bundler harness
│   ├── m3-pin-folders.test.js    # Pin folder unit tests
│   ├── searchEngine.test.ts      # Search engine unit tests
│   ├── tier1-features.test.js    # Tier 1 happy path feature coverage
│   ├── tier2-boundary.test.js    # Tier 2 boundary, typo distance, stress tests
│   ├── tier3-combinations.test.js# Tier 3 multi-feature integration pipelines
│   ├── tier4-workloads.test.js   # Tier 4 real-world inspection scenario workloads
│   └── tier5-hardening.test.js   # Tier 5 white-box stress & corruption edge cases
├── package.json                  # Dependencies and npm scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite 6 build configuration
└── wrangler.jsonc                # Cloudflare Pages deployment configuration
```

---

## 4. Data Structures & Models (`src/types/qc.ts`)

### `QCItem`
```typescript
export interface QCItem {
  id: string;          // Unique item ID (e.g. "b2", "c172345678")
  n: number;           // Defect code number (e.g. 2, 83)
  t: string;           // Defect wording text (e.g. "Screen Crease")
  c: CategoryKey;      // Primary category key (e.g. "screen", "camera", "codes")
  sub?: SubCategoryCode;// Panel sub-category code if category === "codes"
  custom?: boolean;    // Flag indicating custom user-created wording
}
```

### `CustomPinFolder`
```typescript
export interface CustomPinFolder {
  id: string;               // Folder ID (e.g. "starred", "f_172345678")
  name: string;             // Folder display name (e.g. "Screen Inspection")
  color?: string;           // Accent hex color (e.g. "#06b6d4")
  itemIds: (string | number)[]; // List of pinned item IDs inside this folder
  createdAt: number;        // Creation Unix timestamp
}
```

### `CategoryInfo` & `SubCategoryCode`
- **15 Categories**: `all`, `codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`, `pinned`, `recent`.
- **10 Code Sub-Categories**: `ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC`.

---

## 5. State Management & Persistent LocalStorage Layer

The application state is encapsulated in `useQCState` and `useAppearance` hooks, synchronizing state across **14 distinct `localStorage` keys**:

| # | LocalStorage Key | Data Type | Default / Fallback | Description |
|---|-------------------|-----------|--------------------|-------------|
| 1 | `qc-pin-folders` | `CustomPinFolder[]` | `[{ id: 'starred', name: 'Starred Defects', color: '#06b6d4', itemIds: [] }]` | User custom pin folders |
| 2 | `qc-pins` | `(string\|number)[]` | `[]` | Flattened list of all pinned item IDs |
| 3 | `qc-recents` | `string[]` | `[]` | Last 20 copied wording phrases |
| 4 | `qc-history` | `string[]` | `[]` | Copy history alias for backward compatibility |
| 5 | `qc-batch` | `string[]` | `[]` | Batch queue items for bulk export |
| 6 | `qc-join` | `DelimiterKey` | `'nl'` | Batch delimiter (`'nl'`, `'comma'`, `'semi'`, `'space'`, `'pipe'`, `'bullet'`) |
| 7 | `qc-autoclear` | `boolean` | `true` | Auto-clear batch queue on copy |
| 8 | `qc-edits` | `Record<string, ...>`| `{}` | Edits made to base wording items |
| 9 | `qc-dels` | `(string\|number)[]` | `[]` | Deleted base item IDs |
| 10 | `qc-custom` | `QCItem[]` | `[]` | Custom user-created defect items |
| 11 | `qc-appearance` | `AppearanceSettings` | `{ layout: 'list', radius: 'soft', ... }` | Visual preferences object |
| 12 | `qc-theme` | `'light'\|'dark'\|'auto'`| `'dark'` | Theme setting synced to `document.documentElement` `.dark` class |
| 13 | `qc-density` | `'cozy'\|'compact'` | `'cozy'` | Layout density mode |
| 14 | `qc-sort` | `'default'\|'alpha'\|'num'`| `'default'` | Wording sort order |

---

## 6. Search Engine & Typo Tolerance (`src/utils/searchEngine.ts`)

- **Matching Logic**:
  1. Exact substring match (score = 0).
  2. Prefix match (score = 1).
  3. Alias match (expands terms like `display` -> `screen`, `spen` -> `pen`, `batt` -> `battery`) (score = 2).
  4. Bounded Levenshtein distance fuzzy match (max distance 2 for terms >= 4 chars) (score = 10 + distance).
- **Sub-code Filtering**: When category === `codes` and sub-category !== `ALL`, items are strictly filtered by matching `sub` code.
- **Search Highlighting**: Computes match segments (`HighlightSegment[]`) to render highlighted query text in item titles.

---

## 7. UI Components & Layout Switchers

- **AppHeader (`AppHeader.tsx`)**:
  - Hero search bar with Cmd+K / Ctrl+K keyboard shortcut trigger.
  - Segmented control layout switcher (`List`, `Grid Cards`, `Table`).
  - Batch drawer open button with badge counter pill.
  - Theme toggle button (`Dark` / `Light`).
  - Custom pin folder indicator count.
- **CategoryChips (`CategoryChips.tsx`)**:
  - Sticky left sidebar navigation (`#sidebarNav`).
  - Lucide icons for all 15 category types.
  - Pin folder manager: Create folder, edit folder name, delete folder, select active folder.
- **WordingContainer (`WordingContainer.tsx`)**:
  - Dynamically renders items based on selected layout mode:
    - `WordingList`: High-density list row representation.
    - `WordingGrid`: Visual grid of defect cards (`DefectCard`).
    - `WordingTable`: Tabular layout with table headers and row hover highlights.
- **BatchDrawer (`BatchDrawer.tsx`)**:
  - Glassmorphic Radix `Sheet` component.
  - Reorder batch queue items up/down, remove single item, clear all.
  - Custom delimiter selector (Newline, Comma, Semicolon, Space, Pipe, Bullet).
  - Bulk text import modal & direct copy.
- **CommandDialog (`App.tsx`)**:
  - `cmdk` Spotlight search modal triggered by Cmd+K / Ctrl+K or top bar button.
- **ToastsContainer (`ToastsContainer.tsx`)**:
  - Floating toast notification system wrapping `sonner` dispatches.

---

## 8. Category Iconography & Color-Coding (`src/utils/categoryColors.ts`)

Lucide icon mapping for all categories:
- `screen` / `monitor`: `Monitor`
- `camera`: `Camera`
- `buttons`: `Sliders`
- `battery`: `Battery`
- `backcover`: `Smartphone`
- `locks`: `Lock`
- `pen`: `PenTool`
- `water`: `Droplets`
- `audio`: `Volume2`
- `body`: `Cpu`
- `system`: `Settings`
- `codes`: `Code`
- `folders` / `all`: `Folder`
- `pinned` / `favorites`: `Star`
- `recent`: `History`

Theme-aware left border accents (`border-l-4`) and badges are computed using category hex color definitions with RGB opacity highlights.

---

## 9. Build Pipeline & Cloudflare Pages Configuration

- **Build Script**: `npm run build` (`tsc && vite build`)
  - Compiles TypeScript without errors (`tsc --noEmit`).
  - Generates optimized static assets into `./dist/`.
  - Integrates `vite-plugin-pwa` for service worker offline capability (`sw.js`).
- **Cloudflare Pages Configuration (`wrangler.jsonc`)**:
  ```jsonc
  {
    "name": "qc-standard-wording",
    "pages_build_output_dir": "./dist"
  }
  ```

---

## 10. Test Suite & Verification Results

### Test Execution Commands & Status

| Test Command | Scope | Test Suites | Results |
|--------------|-------|-------------|---------|
| `npm run build` | TypeScript compilation & Vite bundle | Build target `./dist` | **SUCCESS** (1696 modules transformed) |
| `npm test` | Full E2E Test Suite (Tiers 1-4) | 22 test suites | **PASS** (100% success rate) |
| `npm run test:tier1` | Tier 1: Feature Coverage (Happy Path) | 10 test suites | **PASS** |
| `npm run test:tier2` | Tier 2: Boundary & Edge Case Resilience | 6 test suites | **PASS** |
| `npm run test:tier3` | Tier 3: Cross-Feature Pipelines | 3 test suites | **PASS** |
| `npm run test:tier4` | Tier 4: Real-World Inspection Workloads | 3 test suites | **PASS** |
| `npm run test:tier5` | Tier 5: Adversarial Hardening & Stress | 5 test suites | **PASS** |

### Verified DOM & Test Selectors
The following required test DOM selectors are present and fully functional:
- `#appHeader`: Top application header bar
- `#sidebarNav`: Left category navigation sidebar
- `#setLayout`: View switcher toggle control
- `#batchDrawer`: Batch queue slide-out drawer
- `#toasts`: Toast notification container
- `#search`: Hero search input field
- `[data-testid="..."]`: Test harness markers across app elements

---

## Conclusion
The QC Standard Wording application codebase is robust, fully migrated to shadcn/ui and Tailwind CSS v4, maintainable, type-safe, and passes 100% of all build and testing requirements.
