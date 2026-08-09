# QC Standard Wording — Comprehensive Requirements Specification

## 1. Executive Overview & System Mission
The **QC Standard Wording React + Vite Web Application** is a high-performance, mobile-first technician defect wording management system. Originally built on Mantine UI, the application has been completely migrated to a state-of-the-art 2026 design system inspired by **Linear.app, Vercel, and Apple** design standards, powered by **Tailwind CSS v4**, **Radix UI primitives**, **Lucide React Icons**, **cmdk (Spotlight Search)**, and **Sonner / Custom Floating Toasts**.

The system enables hardware inspection technicians and supervisors to rapidly search, filter, star/pin into custom folders, batch-queue, and copy standardized defect statements for smartphone, tablet, and electronics Quality Control (QC) routines.

---

## 2. High-Level Requirements Breakdown

### R1. Complete Migration to shadcn/ui & 2026 Aesthetic Engine
- **Mantine Removal**: 0 `@mantine/*` or `@tabler/*` packages remaining in `package.json`.
- **UI Stack**: `@radix-ui/react-*` primitives (Dialog, DropdownMenu, Select, ScrollArea, Checkbox, Textarea, Tooltip, ToggleGroup, Slot), `lucide-react`, `cmdk`, `sonner`, `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`.
- **Dark Void Palette**: Deep Void Midnight background (`#050608` / `#09090b`), Onyx surface containers (`#0c0e12` / `#18181b`), subtle 1px razor-sharp borders (`border-white/[0.08]` / `border-zinc-800` / `#27272a`), ambient cyan glow highlights (`from-cyan-500/20 to-blue-500/10` / `#06b6d4` / `#0284c7`), and crisp Geist/Inter + JetBrains Mono typography.
- **Micro-Details**: 150ms ease hover transitions, elevation + cyan glow hover state (`box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 14px rgba(6,182,212,0.22)`), left border category accents (`border-l-4`), category pill badges with theme-aware cyan/emerald accents.

### R2. Lucide Iconography & Enhanced Category Color Coding
- Dedicated Lucide icon assigned for every category (Screen, Camera, Buttons, Battery, Back Cover, Locks, Pen, Water Damage, Audio, Body, System, Codes, Pin Folders, Starred, Recent).
- Theme-aware visual badges (`.rpill`) and left border accents (`border-l-4`) for each defect category.

### R3. Custom User Pin Categories & Favorites Folders
- Custom user pin folder system enabling multi-folder item starring, CRUD operations (Create, Rename, Delete folders, Pin/Unpin items).
- Auto-migration of legacy starred items (`qc-pins`) into default `"Starred Defects"` folder.
- Persistent state layer across 14 `localStorage` keys (`qc-pins`, `qc-pin-folders`, `qc-recents`, `qc-history`, `qc-batch`, `qc-join`, `qc-autoclear`, `qc-edits`, `qc-dels`, `qc-custom`, `qc-appearance`, `qc-theme`, `qc-density`, `qc-sort`).

### R4. Cloudflare Pages, Build Integrity & Testing
- Static asset compilation (`dist/`) configured for Cloudflare Pages via `wrangler.jsonc` (`"pages_build_output_dir": "./dist"`).
- 100% pass rate on TypeScript compilation (`npm run build` with 0 `tsc` errors).
- 100% pass rate on E2E test suites across Tiers 1–4 (`npm run test` with 19 test suites and 41 assertions).

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Architecture | Mantine-Free UI Stack | Clean React 19 + Vite 6 build with Tailwind CSS v4 and Radix UI primitives | `package.json` | Optimized production bundle in `dist/` | Build fails if legacy `@mantine/*` imported | `package.json`, `ORIGINAL_REQUEST.md` |
| 2 | Aesthetic | 2026 Dark Void Theme | Deep Void `#050608` / `#09090b` palette with `#18181b` containers, `#27272a` borders, and `#06b6d4` cyan glow | CSS vars / Tailwind classes | Dark mode UI with cyan accents & 150ms transitions | Fallback to default dark slate variables | `src/index.css`, `PROJECT.md` |
| 3 | Typography | Geist/Inter + JetBrains Mono | Sans typography for UI text and monospace for defect numbers (`#...`) & code badges | Font stylesheets, Tailwind classes | Styled UI headers, cards, and code badges | Fallback to system-ui / monospace | `ORIGINAL_REQUEST.md`, `src/index.css` |
| 4 | Navigation | Sticky Left Sidebar Navigation | Sticky sidebar with category Lucide icons, count pills, sub-category code chips, and custom user pin folder manager | Category key click, folder click | Category filtering & sub-category filtering | Resets sub-category to 'ALL' | `src/components/AppHeader.tsx`, `CategoryChips.tsx` |
| 5 | Search | Spotlight Quick Search Modal | Cmd+K / Ctrl+K keyboard shortcut trigger or top header button to search defects in command dialog | `⌘K`, `Ctrl+K`, button click, text input | CommandDialog modal showing top 15 matching defects | Displays "No matching QC wording defects found" | `src/components/AppHeader.tsx`, `App.tsx` |
| 6 | Navigation | Hero Search & Instant Clear | Top header search input with instant filtering and clear (`X`) button | Search text query | Filtered defect list, `<mark>` match highlighting | Empty query shows all category items | `src/components/AppHeader.tsx`, `src/utils/searchEngine.ts` |
| 7 | Layout | Multi-View Switcher | View switcher supporting List, Grid Cards, and Table layouts | Layout mode toggle (`list`, `grid`, `table`) | Renders `WordingList`, `WordingGrid`, or `WordingTable` | Defaults to `list` view mode | `src/components/WordingContainer.tsx`, `useAppearance.ts` |
| 8 | Folders | Custom User Pin Category Folders | User-created custom named folders with custom colors for organizing defect items | Folder name, color picker, item star toggle | Custom pin folders in sidebar, item starring per folder | Empty name defaults to "New Folder" | `src/hooks/useQCState.ts`, `CategoryChips.tsx` |
| 9 | Folders | Legacy Pins Auto-Migration | Automatic migration of legacy `qc-pins` array into default "Starred Defects" folder | `localStorage['qc-pins']` | Migrated `qc-pin-folders` array | Safe fallback to empty array if invalid JSON | `src/hooks/useQCState.ts` |
| 10 | Iconography | Lucide Category Icon System | Dedicated Lucide icon for each of the 15 defect categories | Category ID key | Lucide icon element (Monitor, Camera, Sliders, Battery, etc.) | Fallback to `Folder` icon | `src/utils/categoryColors.ts` |
| 11 | Color Accents | Category Left Border & Pill Badges | Theme-aware left border accents (`border-l-4`) and background badges (`.rpill`) | Category ID key | Inline style / Tailwind class with hex/RGB color | Fallback to slate `#64748b` | `src/utils/categoryColors.ts` |
| 12 | Queue | Glassmorphic Side Drawer | Slide-out Batch Drawer for queueing multiple defect lines, setting delimiter, and copying | Drawer toggle click, `+ Batch` button click | Batch drawer overlay & item list | Empty drawer shows helper message | `src/components/BatchDrawer.tsx`, `src/index.css` |
| 13 | Queue | Batch Queue Item Reordering | Up/Down reordering controls (`▲` / `▼`) for batch queue items | Move button clicks | Reordered batch array in state & `localStorage` | Top item disables Move Up; bottom disables Move Down | `src/components/BatchDrawer.tsx` |
| 14 | Queue | Delimiter Selection | Multi-delimiter support for batch copy: Newline, Comma, Semicolon, Space, Pipe, Bullet | Delimiter dropdown select | Joined text string on copy | Defaults to Newline (`\n`) | `src/components/BatchDrawer.tsx` |
| 15 | Queue | Auto-Clear & Bulk Import | Toggleable auto-clear batch on copy, plus multi-line text bulk import modal | Checkbox toggle, textarea paste | Batch state updated, toast notification fired | Empty lines ignored during import | `src/components/BatchDrawer.tsx` |
| 16 | Notifications | Floating Toast Notifications System | Minimalist floating pill toasts with glowing cyan/amber/red progress bars (`.tprogress`) and actions | Toast dispatch (copy, pin, edit, delete, error) | Glassmorphic floating toast notification | Throttled auto-dismiss at 4.2s | `src/components/ToastsContainer.tsx`, `notifications.ts` |
| 17 | Notifications | Toast Action Button & Undo | Action button inside toast for instant operations like Undo item deletion | Action button click | Restores deleted defect item | Action function executes and toast closes | `src/hooks/useQCState.ts`, `ToastsContainer.tsx` |
| 18 | Dashboard | Inspection Stats Dashboard | Live header card displaying matching counts, active category/subcategory/query badges, pinned count, batch count | Active filter state | Visual summary card above defect list | Hides sub/query badges if not active | `src/components/StatsDashboard.tsx` |
| 19 | History | Copy History Feed Bar | Horizontally scrollable bar showing recently copied defect strings with one-click recopy and clear | Item copy action | Recent item chip added to top of feed | Capped at 20 recent items | `src/components/HistoryBar.tsx` |
| 20 | Editor | Custom Wording Editor Mode | Toggleable Edit Mode providing Inline Add, Edit, Delete, Export JSON, Import JSON, Reset | Edit Mode toggle, form inputs | Modified `qcEdits`, `qcDels`, `qcCustom` state | Validates non-empty wording text | `src/components/EditToolbar.tsx`, `EditModal.tsx` |
| 21 | Persistence | 14 LocalStorage State Keys | Full state sync across 14 distinct localStorage keys | State changes | Synced localStorage entries | Safe JSON parsing resilience on invalid string | `src/hooks/useQCState.ts`, `useAppearance.ts` |
| 22 | Search Engine | Bounded Levenshtein Typo Engine | Bounded fuzzy matching engine accommodating typos (e.g. `batery` -> `battery`, `scren` -> `screen`) | Search query string | Scored SearchResult array with `≈` indicators | Distance cap filtering suppresses irrelevant results | `src/utils/searchEngine.ts` |
| 23 | Search Engine | Regex & HTML Escaping Safety | Protection against regex meta-character injection and XSS via `escapeHtml` | Meta-characters (`[ ] * + ? ^ $`), HTML script tags | Safe string highlighting in `<mark>` tags | Special characters treated as literal text | `src/utils/searchEngine.ts` |
| 24 | Offline | Offline Copy Download | One-click download of self-contained single-file offline HTML application | Button click (`#dlBtn`) | `qc-standard-wording-offline.html` download | Revokes blob URL after trigger | `src/components/AppHeader.tsx` |
| 25 | Build | Cloudflare Pages Deploy Config | Automated static asset build in `./dist` compatible with Cloudflare Pages | `npm run build` | Assets in `./dist`, `wrangler.jsonc` validated | Build fails if TypeScript errors exist | `wrangler.jsonc`, `package.json` |

---

## 4. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Search Engine | Typo input `batery` | Fuzzy engine scores match at score 72, displays `≈` indicator pill, highlights title. |
| 2 | Search Engine | Typo input `scren` | Fuzzy engine matches `screen` defect items, displays `≈` pill. |
| 3 | Search Engine | Regex meta-characters `[ ] * + ? ^ $ \` | Handled safely without throw/crash, treated as literal characters. |
| 4 | Search Engine | XSS input `<script>alert(1)</script>` | Escaped via `escapeHtml()`, rendered safely inside `<mark>` tags without execution. |
| 5 | Search Engine | Whitespace-only query `"   "` | Trimmed to empty string, returns 100% score for all category items without highlighting. |
| 6 | Pin Folders | Corrupted `localStorage['qc-pin-folders']` (`"{{invalid json"`) | Caught by `safeJSONParse`, gracefully falls back to default `"Starred Defects"` folder. |
| 7 | Pin Folders | Deleting active folder | Folder removed, `activeFolderId` reset to `null` (reverting view to main categories). |
| 8 | Pin Folders | Empty folder name on creation | Automatically defaults folder name to `"New Folder"`. |
| 9 | Batch Drawer | Queue item count > 50 items | ScrollArea container handles overflow cleanly; batch count badge updates dynamically. |
| 10 | Batch Drawer | Moving top item UP or bottom item DOWN | Button state disabled; no array out-of-bounds error. |
| 11 | Notifications | Rapid consecutive dispatches (10+ toasts in < 1s) | Existing toast timers refreshed, notifications stacked cleanly in container without overlap. |
| 12 | State Persistence | Corrupted `qc-edits` / `qc-dels` localStorage values | Safe JSON parse returns `{}` / `[]`, application loads default `BASE_ITEMS`. |
| 13 | Layout | Viewport resize (Desktop to 360px Mobile) | Sidebar collapses into mobile drawer (controlled via burger button), top header wraps cleanly without horizontal scroll shift. |
| 14 | Offline Export | Blob creation on environment without `URL.createObjectURL` | Graceful fallback without throwing unhandled exceptions. |

---

## 5. Visual & Aesthetic Specifications

### Color Palette & Design Tokens
- **Background Deep Void**: `#050608` / `#09090b`
- **Surface Onyx Containers**: `#0c0e12` / `#18181b`
- **Borders & Dividers**: `border-white/[0.08]` / `border-zinc-800` / `#27272a`
- **Cyan Accent Highlight**: `#06b6d4` (Primary Cyan), `#0284c7` (Sky Accent), `from-cyan-500/20 to-blue-500/10`
- **Text Primary**: `#f8fafc` (Zinc 50)
- **Text Secondary / Muted**: `#94a3b8` (Zinc 400) / `#64748b` (Zinc 500)
- **Amber / Pin Highlight**: `#f59f00` / `#ffd43b` / `rgba(245, 159, 0, 0.12)`
- **Destructive / Alert**: `#ef4444` / `#f87171`

### Typography System
- **Main Font**: Geist / Inter (`font-sans`, `system-ui, -apple-system, sans-serif`)
- **Code / Monospace**: JetBrains Mono (`font-mono`, `ui-monospace, SFMono-Regular, Consolas`)
  - Used for defect index numbers (`.rnum`, e.g. `#31`, `#105`), sub-code badges (`FCPB`, `RCPW`), and keyboard shortcut triggers (`⌘K`).
- **Text Size Modes**: `s` (Small), `m` (Medium / Default), `l` (Large) configurable in Settings.

### Contrast & Hover Micro-Interactions
- **Transition Duration**: 150ms ease transition on hover states.
- **Card Hover State**: `transform: translateY(-3px)`, `border-color: #06b6d4`, `box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 14px rgba(6,182,212,0.22)`.
- **Row Hover State**: `transform: translateY(-1px)`, `box-shadow: 0 4px 18px rgba(0,0,0,0.3), 0 0 12px rgba(6,182,212,0.18)`.
- **Table Row Hover State**: `background-color: #24334a`, `border-color: #06b6d4`.

---

## 6. UI Component Architecture & Interface Specifications

```
App.tsx
├── AppHeader (Sticky Header, Logo, v2.0 Badge, Hero Search, ⌘K Spotlight Trigger, View Switcher, Edit Mode, Batch Drawer Button, Settings, Offline Copy, Theme Toggle)
├── SidebarNav (Sticky Left Sidebar)
│   ├── CategoryChips (15 Category Lucide Icons + Count Pills + Pin Folders Manager)
│   └── CodeSubChips (Panel Code Filters: ALL, FCPB, FCPW, FCPC, RCPB, RCPW, RCPC, FCDS, RCDS, PC)
├── Main Content
│   ├── StatsDashboard (Active Filter Summary, Total Matching, Pinned Count, Batch Count)
│   ├── HistoryBar (Scrollable Recent Copy Chips, Clear History Button)
│   ├── EditToolbar (Add Defect Button, Export JSON, Import JSON, Reset Changes)
│   ├── WordingContainer
│   │   ├── WordingGrid / WordingList / WordingTable
│   │   └── DefectCard (Code Badge, Title Text, Highlighted Mark, Approx Indicator, Pin Dropdown, + Batch Button, Edit/Del Buttons)
│   ├── BatchDrawer (Slide-out Glassmorphic Drawer, Delimiter Selector, Auto-clear Toggle, Reorder Items, Copy Batch, Clear Queue, Bulk Paste Dialog)
│   ├── EditModal (Add / Edit Defect Dialog)
│   ├── SettingsModal (Layout, Density, Border Radius, Text Size, Motion, Accent Palette Dialog)
│   ├── CommandDialog (Cmd+K / Ctrl+K Spotlight Quick Search Modal)
│   ├── ToastsContainer (Sonner & Floating Toast Pills with Progress Bar)
│   └── ScrollToTopButton (Floating Action Button when scrollY > 100)
```

---

## 7. Data Models & State Persistence Specifications

### Interface Schema (`src/types/qc.ts`)
```typescript
export interface QCItem {
  id: string;
  n: number;
  t: string;
  c: CategoryKey;
  sub?: SubCategoryCode;
  custom?: boolean;
}

export interface CustomPinFolder {
  id: string;
  name: string;
  color?: string;
  itemIds: (string | number)[];
  createdAt: number;
}

export interface AppearanceSettings {
  layout: 'list' | 'grid' | 'table';
  radius: 'sharp' | 'soft' | 'round';
  textsize: 's' | 'm' | 'l';
  accent: string;
  density: 'cozy' | 'compact';
  motion: 'full' | 'reduced';
  theme: 'light' | 'dark' | 'auto';
}
```

### 14 LocalStorage Keys
1. `qc-pins`: `(string | number)[]` (Synced starred defect item IDs)
2. `qc-pin-folders`: `CustomPinFolder[]` (Custom named folders array)
3. `qc-recents`: `string[]` (Recent copied wording strings)
4. `qc-history`: `string[]` (Historical copy entries fallback)
5. `qc-batch`: `string[]` (Batch drawer queue items)
6. `qc-join`: `DelimiterKey` (`'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet'`)
7. `qc-autoclear`: `boolean` (Auto-clear batch on copy setting)
8. `qc-edits`: `Record<string, { t: string; c: CategoryKey; n: number }>` (Modified base items)
9. `qc-dels`: `(string | number)[]` (Deleted item IDs)
10. `qc-custom`: `QCItem[]` (User-created custom defect items)
11. `qc-appearance`: `Partial<AppearanceSettings>` (Appearance settings JSON)
12. `qc-theme`: `'light' | 'dark' | 'auto'` (Theme preference)
13. `qc-density`: `'cozy' | 'compact'` (Density mode)
14. `qc-sort`: `'default' | 'alpha' | 'num'` (Sorting preference)

---

## 8. Search Engine & Fuzzy Matching Specifications

### Search Algorithm Pipeline (`src/utils/searchEngine.ts`)
1. **Category & Sub-category Filter**: Filters active dataset by selected category (`screen`, `camera`, `codes`, `pinned`, `recent`, etc.) and sub-category code (`FCPB`, `RCPW`, etc.).
2. **Exact & Alias Expansion**: Maps search tokens to alias terms (e.g. `display` -> `screen`, `batt` -> `battery`, `cam` -> `camera`, `spen` -> `pen`).
3. **Enrichment**: Enriches each item with lowercased text (`hay`), normalized text without spaces (`normText`), and tokenized words (`words`).
4. **Scoring**:
   - Exact prefix match: `score = 100`
   - Substring match: `score = 92 - min(index, 24) * 0.3`
   - Normalized substring match: `score = 82`
   - Bounded Levenshtein match (tolerance capped by length): `score = 72 - dist * 18`
   - Subsequence match: `score = 65` or `38`
5. **Fuzzy Indicator Threshold**: Scores between `1` and `79` (`isApprox = true`) trigger the golden `≈` fuzzy indicator pill in the UI.
6. **Text Highlighting & Escaping**: Matches are wrapped in `<mark>` tags using `highlightSegments()`, with HTML special characters escaped via `escapeHtml()`.

---

## 9. Build, Performance & Testing Integrity

### Build Requirements
- `npm run build`: Compiles TypeScript (`tsc`) and bundles assets via Vite into `./dist`. Must pass with 0 errors.
- `wrangler.jsonc`: Must configure `"pages_build_output_dir": "./dist"`.

### Test Architecture (`npm test`)
- Runner: `node --test tests/**/*.test.js`
- Test Suites: 19 test suites across 4 Tiers.
- Total Assertions: 41 assertions with 100% pass rate.
  - **Tier 1 (Happy Path)**: 10 suites, 23 assertions (Mantine removal, Dark theme, AppShell elements, Lucide icons, Cmd+K Spotlight, Sonner toasts, Batch queue, view transitions, persistence).
  - **Tier 2 (Boundary & Hardening)**: 6 suites, 12 assertions (Levenshtein typo tolerance, fuzzy `≈` pills, empty search, regex meta-character safety, XSS escaping, 0px layout shift, max batch capacity, toast throttling, corrupted JSON resilience).
  - **Tier 3 (Cross-Feature Pipelines)**: 3 suites, 3 assertions (Nav + Spotlight + Switcher sync; Edit + Pin + Theme sync; Batch + Toast + Undo + Export/Import sync).
  - **Tier 4 (Real-World Workloads)**: 3 suites, 3 assertions (Mobile technician inspection routine; QC supervisor audit & model sync; Desktop vs mobile viewport switch).

---
