# Project: QC Standard Wording (Tablet S9+ & Raycast Warm Stone Overhaul)

## Architecture
- **Framework**: React 19.2.8 + TypeScript 5.7.2 + Vite 6.0.0 + Tailwind CSS v4.0.0 + Radix UI Primitives + Lucide React.
- **Design System & Styling**:
  - Full shadcn/ui component primitive coverage (Dialog, DropdownMenu, Select, Sheet, ToggleGroup, Checkbox, Tooltip, ScrollArea, Badge, Button, Input, Card).
  - Dynamic CSS custom properties injected on `document.documentElement` (`--radius`, `--font-size-base`, `--touch-target-min`, `--accent-primary`, `--accent-ring`, `--spacing-density-card`, `--spacing-density-btn`).
  - Sleek custom scrollbars for WebKit & Firefox on all scrollable viewports.
  - Full Dark/Light/Auto theme support with semantic color tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`).
- **Data & State Persistence**:
  - Centralized hook architecture: `useQCState` and `useAppearance`.
  - 14 validated LocalStorage keys + new keys (`qc-categories`, `qc-category-order`, `qc-history-entries`).
  - Cross-tab synchronization via `storage` event listeners and defensive `safeJSONParse` fallbacks.
- **Testing Architecture**:
  - Node.js built-in runner (`node:test` via `tsx` with in-memory `esbuild` IIFE bundling + `JSDOM` harness in `tests/harness.js`).
  - 4-Tier test hierarchy + Tier 5 adversarial hardening suite + Specialized R1-R4 test suites.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Samsung Tab S9+ Touch Ergonomics | Min 44-48px touch targets, comfortable finger padding, `touch-manipulation`, `overscroll-behavior-y: contain` | M1 | ORIGINAL_REQUEST §1, Survey 1 |
| F2 | 100% shadcn/Radix Component Styling | Replace native `<select>`, `<input type="checkbox">`, and raw button lists with Radix Select, Checkbox, ToggleGroup, Sheet | M1 | ORIGINAL_REQUEST §1, Survey 1 |
| F3 | Custom Sleek Scrollbars | Custom touch-friendly scrollbars across sidebar, wording container, history and batch drawers | M1 | ORIGINAL_REQUEST §1, Survey 1 |
| F4 | Theme Engine (Dark/Light/Auto) | Live theme switcher with system preference detection and semantic color token fixes | M2 | ORIGINAL_REQUEST §2, Survey 2 |
| F5 | Density Modes (Compact/Cozy/Tablet) | 3 density levels scaling touch targets (36px, 44px, 48px), spacing, and padding | M2 | ORIGINAL_REQUEST §2, Survey 2 |
| F6 | Border Radius Customization | 0px (Sharp), 6px (Subtle), 10px (Medium), 16px (Rounded) mapped to `--radius` | M2 | ORIGINAL_REQUEST §2, Survey 2 |
| F7 | Root Font Size Scaling | Small (13px), Normal (14px), Large (16px) with dynamic `fontSize` root scaling | M2 | ORIGINAL_REQUEST §2, Survey 2 |
| F8 | Accent Color Palettes | 5 rich palettes: Warm Amber, Sage Emerald, Slate Stone, Rose Red, Ocean Blue | M2 | ORIGINAL_REQUEST §2, Survey 2 |
| F9 | Reduced Motion Toggle | Global animation and transition suppression via CSS override | M2 | ORIGINAL_REQUEST §2, Survey 2 |
| F10 | Category & Sub-Category Manager | Full CRUD for defect categories with position placement and localStorage persistence | M3 | ORIGINAL_REQUEST §3, Survey 3 |
| F11 | Hybrid Icon & Emoji Picker | Curated Lucide icons (24 items) OR custom emoji selector for category iconography | M3 | ORIGINAL_REQUEST §3, Survey 3 |
| F12 | Category Color Picker | 6 preset palette swatches + custom hex color picker for categories | M3 | ORIGINAL_REQUEST §3, Survey 3 |
| F13 | Category Reordering & Organization | Up/Down reordering and sorting persisted in `qc-category-order` / `qc-categories` | M3 | ORIGINAL_REQUEST §3, Survey 3 |
| F14 | Sub-Category Code Editor | Add, edit, remove sub-category code chips associated with categories | M3 | ORIGINAL_REQUEST §3, Survey 3 |
| F15 | Dedicated Inspection History Drawer | Slide-out Radix Sheet with interactive history feed, relative timestamps, search & filter | M4 | ORIGINAL_REQUEST §4, Survey 2 |
| F16 | History One-Click Copy & Pinning | 1-click copy with tactile/visual feedback, pin to custom folders directly from history | M4 | ORIGINAL_REQUEST §4, Survey 2 |
| F17 | History Bulk Actions & Clear Dialog | "Add all to batch queue" button, "Clear History" with Radix confirmation dialog | M4 | ORIGINAL_REQUEST §4, Survey 2 |
| F18 | Legacy Compatibility & Test Integrity | Preserve DOM test IDs (`#setmodal`, `#histbar`, `#hchips`, etc.) and all 14 legacy storage keys | M1-M5 | ORIGINAL_REQUEST §5, Surveys 1-3 |
| F19 | Automated Test Suite Expansion | Comprehensive test cases across Tiers 1-4 for touch, settings, category manager, and history | E2E Track | ORIGINAL_REQUEST §5, Survey 3 |
| F20 | Production Build & Adversarial Hardening | 100% test pass rate, clean `npm run build`, white-box gap analysis and forensic integrity audit | M5 | ORIGINAL_REQUEST §5, Surveys 1-3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite Track | Design & implement comprehensive automated tests for R1-R4 (Tiers 1-4) in `tests/` | None | DONE |
| M1 | Touch Ergonomics & shadcn Component Styling (R1) | 44-48px touch targets, custom scrollbars, Radix Select, Checkbox, Sheet, ToggleGroup, Light theme semantic tokens | None | DONE |
| M2 | 100% Functional Settings Engine (R2) | Live theme, density (compact/cozy/tablet), radius (0/6/10/16), font (13/14/16), 5 accents, motion toggle | M1 | DONE |
| M3 | Advanced Category & Sub-Category Manager (R3) | Category CRUD, hybrid Lucide/Emoji picker, color picker, reorder, sub-category chips, persistence | M1 | DONE |
| M4 | Dedicated Rich Inspection History Drawer (R4) | Slide-out Sheet, relative timestamps, search/filter, 1-click copy, pin to folder, batch add, clear dialog | M1 | DONE |
| M5 | 100% Test Pass, Build Verification & Adversarial Hardening (R5) | Full test suite execution (100% pass), clean `npm run build`, Tier 5 adversarial hardening, forensic audit | E2E, M1-M4 | DONE |

## Interface Contracts
### Appearance & Settings (`src/types/qc.ts`, `src/hooks/useAppearance.ts`, `src/index.css`)
- `AppearanceSettings`: `{ layout: LayoutMode, radius: RadiusOption, textsize: TextSizeOption, accent: AccentOption | string, density: DensityMode, motion: MotionMode, theme: ThemeMode }`
- Density values: `'compact' | 'cozy' | 'tablet'`
- Radius values: `'0' | '6' | '10' | '16' | 'sharp' | 'soft' | 'round'`
- TextSize values: `'13' | '14' | '16' | 's' | 'm' | 'l'`
- Accent values: `'amber' | 'emerald' | 'stone' | 'rose' | 'blue' | string`
- Theme values: `'dark' | 'light' | 'auto'`
- Motion values: `'full' | 'reduced'`
- DOM attributes applied on `<html>`: `data-theme`, `data-density`, `data-radius`, `data-font-size`, `data-accent`, `data-motion`, `.dark` class.

### Category & Sub-Category Store (`src/types/qc.ts`, `src/hooks/useQCState.ts`)
- `CategoryInfo`: `{ id: string, name: string, color: string, desc: string, iconType?: 'lucide' | 'emoji', iconValue?: string, subCodes?: string[], order?: number, isDefault?: boolean }`
- Storage keys: `qc-categories`, `qc-category-order` (and backward-compatible seed fallback to `CATEGORIES`).
- Actions: `addCategory`, `updateCategory`, `deleteCategory`, `reorderCategories`, `addSubCategoryCode`, `removeSubCategoryCode`.

### History Entry & Drawer Store (`src/types/qc.ts`, `src/hooks/useQCState.ts`, `src/components/HistoryDrawer.tsx`)
- `HistoryEntry`: `{ id: string, text: string, itemNumber?: number, category?: string, timestamp: number, source?: 'single' | 'batch' }`
- Storage keys: `qc-history-entries`, synced to legacy string arrays `qc-recents` and `qc-history`.
- Actions: `addHistoryEntry`, `clearHistoryEntries`, `copyHistoryEntry`, `pinHistoryEntryToFolder`, `addAllHistoryToBatch`.

## Code Layout
- `src/components/ui/`: Radix UI & shadcn primitives (button, card, dialog, dropdown-menu, select, sheet, scroll-area, toggle-group, checkbox, badge, tooltip, input).
- `src/components/`:
  - `AppHeader.tsx`: Header with touch targets, search, theme/settings/batch/history triggers.
  - `CategoryChips.tsx`: Sidebar with Quick Views, Pin Folders, Defect Categories, and "Manage Categories" trigger.
  - `CategoryManagerModal.tsx`: Dedicated modal/drawer for creating, editing, reordering categories, picking icons/emojis/colors, and editing subcategory chips.
  - `CodeSubChips.tsx`: Horizontal subcategory chip bar supporting dynamic sub-codes.
  - `DefectCard.tsx`: Touch-friendly defect cards/rows with 44-48px touch targets and isolated action buttons.
  - `BatchDrawer.tsx`: Batch queue drawer standardized with shadcn Sheet, Checkbox, and custom scrollbar.
  - `HistoryDrawer.tsx`: Dedicated slide-out Inspection History Drawer with search, timestamps, batch add, pin, and confirmation dialog.
  - `HistoryBar.tsx`: Compact/backward-compatible history bar.
  - `SettingsModal.tsx`: Full settings dialog with Theme, Density, Radius, Font Size, 5 Accents, and Motion controls.
  - `EditModal.tsx`: Add/Edit defect modal standardized with Radix Select.
  - `StatsDashboard.tsx`: Touch-friendly status strip.
- `src/hooks/`:
  - `useQCState.ts`: Master state hook managing items, pins, folders, categories, history, batch, and edits.
  - `useAppearance.ts`: Appearance hook managing settings, DOM attribute injection, and CSS variables.
- `src/utils/`:
  - `categoryColors.ts`: Category color derivation, badge styling, left borders, and hybrid Lucide/Emoji icon renderer.
  - `timeUtils.ts`: Relative timestamp formatting ("Just now", "2m ago", "1h ago").
- `src/index.css`: Tailwind v4 theme variables, density spacing, radius rules, accent palettes, sleek scrollbars, reduced motion overrides.
- `tests/`: Automated test suites across Tiers 1-5 verifying all requirements.
