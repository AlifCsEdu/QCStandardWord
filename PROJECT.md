# Project: QC Standard Wording React Inspection Tool

## Architecture
- **Framework**: React 18/19 + Vite + TypeScript (STRICT mode)
- **UI & Styling**: Mantine UI v7 (`@mantine/core`, `@mantine/hooks`, `@tabler/icons-react`) with PostCSS & CSS modules (`postcss-preset-mantine`)
- **State Architecture**: Custom React hooks & `localStorage` persistence layer managing preferences, pins, batch queue, copy history, custom wording edits, and deleted items.
- **Search Engine**: Pure TypeScript fuzzy search engine (`Levenshtein`, token matching, sub-sequence scoring, alias expansion, query substring highlighting).
- **Offline / PWA**: `vite-plugin-pwa` with Workbox service worker and Web App Manifest.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | React + Vite + Mantine Setup | Initialize React, Vite, TS, Mantine v7, PostCSS configs | M1 | ORIGINAL_REQUEST §R1 |
| 2 | QC Defect Dataset & Types | 139+ defect entries, 13 categories, 2 virtual views | M2 | ORIGINAL_REQUEST §R2 |
| 3 | Typo-Tolerant Search Engine | Bounded Levenshtein, token matching, subseq, aliases | M2 | ORIGINAL_REQUEST §R2 |
| 4 | Panel Sub-category Chips | FCPB, FCPW, FCPC, RCPB, RCPW, RCPC, FCDS, RCDS, PC chips | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Substring Highlighting & Approx Indicator | Highlight matched query substrings, mark fuzzy matches with `≈` | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Mantine AppShell & Navigation | Header, Navbar, Drawer, Modal, Notifications shell | M3 | ORIGINAL_REQUEST §R1 |
| 7 | Dynamic Theme & Appearance | Light/Dark mode, 7 accents, 3 radii, 3 text sizes, Cozy/Compact density | M3 | ORIGINAL_REQUEST §R1 |
| 8 | 3 Layout View Modes | List view, Responsive Card Grid, Compact Table view | M3 | ORIGINAL_REQUEST §R1 |
| 9 | Single-item Copy & Toasts | Desktop/Mobile clipboard copy with visual feedback toast | M3 | ORIGINAL_REQUEST §R3 |
| 10 | Batch Drawer & Queue | Slide-out drawer, queue items, custom delimiters (\n, comma, semi, space) | M4 | ORIGINAL_REQUEST §R3 |
| 11 | Batch Operations | Item reordering, removal, auto-clear on copy, bulk import/export | M4 | ORIGINAL_REQUEST §R3 |
| 12 | Favorites & History Feed | Pinning system and quick re-copy history feed | M4 | ORIGINAL_REQUEST §R3 |
| 13 | Inline Edit Mode | Add, update, delete wording with 4.2s Undo toast, JSON import/export, hard reset | M4 | ORIGINAL_REQUEST §R3 |
| 14 | LocalStorage Persistence | Retain pins, batch queue, custom edits, history, theme preferences | M4 | ORIGINAL_REQUEST §R3 |
| 15 | PWA & Offline Support | PWA manifest, Workbox service worker, offline readiness | M5 | ORIGINAL_REQUEST §R3 |
| 16 | Production Build Verification | Zero TS/Lint/bundling errors on `npm run build` | M5 | ORIGINAL_REQUEST §R3 |
| 17 | E2E & Unit Test Suite | Opaque-box requirement-driven testing across Tiers 1-4 | E2E Track | ORIGINAL_REQUEST Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Setup & Scaffolding | package.json, vite.config.ts, tsconfig, PostCSS, index.html | none | DONE |
| M2 | Data & Fuzzy Search Engine | QC Dataset (139 items), Types, Panel Chips, Search Engine | M1 | DONE |
| M3 | UI Shell, Themes & Views | AppShell, MantineTheme, 3 View Modes, Copy Toasts | M2 | DONE |
| M4 | Power Inspection & State | Batch Drawer, Delimiters, Pins, History, Edit Mode, LocalStorage | M3 | DONE |
| M5 | PWA & Build Verification | vite-plugin-pwa, Service Worker, Production Build Pass | M4 | DONE |
| E2E | E2E & Unit Testing Track | Test infra, Tier 1-4 test cases, E2E test runner | M1 | DONE |

## Interface Contracts
### `src/types/qc.ts`
```ts
export type CategoryKey = 'all' | 'codes' | 'screen' | 'camera' | 'buttons' | 'battery' | 'backcover' | 'locks' | 'pen' | 'water' | 'audio' | 'body' | 'system' | 'pinned' | 'recent';

export type SubCategoryCode = 'ALL' | 'FCPB' | 'FCPW' | 'FCPC' | 'RCPB' | 'RCPW' | 'RCPC' | 'FCDS' | 'RCDS' | 'PC';

export interface QCItem {
  id: number;
  t: string; // Title / Wording text
  cat: CategoryKey;
  sub?: SubCategoryCode;
  custom?: boolean;
}

export interface SearchResult {
  item: QCItem;
  score: number;
  isApprox: boolean;
  highlightedText: string;
}
```

### `src/utils/searchEngine.ts`
```ts
export function searchQCItems(
  items: QCItem[],
  query: string,
  category: CategoryKey,
  subCategory: SubCategoryCode,
  pinsSet: Set<number>,
  recentsList: number[]
): SearchResult[];
```

## Code Layout
```
src/
├── assets/            # App icons & static assets
├── components/        # Mantine UI components
│   ├── AppHeader.tsx
│   ├── AppNavbar.tsx
│   ├── WordingList.tsx
│   ├── WordingGrid.tsx
│   ├── WordingTable.tsx
│   ├── BatchDrawer.tsx
│   ├── EditModal.tsx
│   ├── SettingsModal.tsx
│   └── CategoryChips.tsx
├── data/              # Default QC defect dataset & categories
│   └── qcData.ts
├── hooks/             # Custom state & storage management hooks
│   ├── useQCState.ts
│   └── useAppearance.ts
├── types/             # TypeScript definitions
│   └── qc.ts
├── utils/             # Search algorithm & clipboard utilities
│   ├── searchEngine.ts
│   └── clipboard.ts
├── App.tsx            # Main Mantine AppShell application
├── main.tsx           # Application entry point & MantineProvider
└── index.css          # PostCSS imports & global styles
```
