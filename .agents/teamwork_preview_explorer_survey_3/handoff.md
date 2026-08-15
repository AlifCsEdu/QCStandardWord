# Phase 0 Survey Report: Category Manager & Testing Infrastructure Spec Mining

**Author**: Explorer 3 (Category Manager & Testing Infrastructure Spec Miner)  
**Date**: 2026-08-16  
**Working Directory**: `.agents/teamwork_preview_explorer_survey_3`  
**Target Project**: QC Standard Wording (Samsung Tab S9+ & Raycast Warm Stone Overhaul)  

---

## 1. Observation

### 1.1 Category & Sub-Category Data Models & Seed Data
- **File**: `src/types/qc.ts` (Lines 1–58)
  - `CategoryKey` is currently a closed union of 15 string literal types:
    ```typescript
    export type CategoryKey =
      | 'all' | 'codes' | 'screen' | 'camera' | 'buttons' | 'battery'
      | 'backcover' | 'locks' | 'pen' | 'water' | 'audio' | 'body'
      | 'system' | 'pinned' | 'recent';
    ```
  - `SubCategoryCode` is a union of 10 code identifiers:
    ```typescript
    export type SubCategoryCode =
      | 'ALL' | 'FCPB' | 'FCPW' | 'FCPC' | 'RCPB' | 'RCPW' | 'RCPC' | 'FCDS' | 'RCDS' | 'PC';
    ```
  - `QCItem` data structure:
    ```typescript
    export interface QCItem {
      id: string;
      n: number;
      t: string;
      c: CategoryKey;
      sub?: SubCategoryCode;
      custom?: boolean;
    }
    ```
  - `CategoryInfo` structure:
    ```typescript
    export interface CategoryInfo {
      id: CategoryKey;
      name: string;
      color: string;
      desc: string;
    }
    ```
  - `CustomPinFolder` structure:
    ```typescript
    export interface CustomPinFolder {
      id: string;
      name: string;
      color?: string;
      itemIds: (string | number)[];
      createdAt: number;
    }
    ```

- **File**: `src/data/qcData.ts` (Lines 1–250)
  - `BASE_ITEMS`: Contains **139 standard defect items** (IDs ranging from `b2` to `b140`, number `n` from 2 to 140; item `b1` is intentionally absent in seed data).
  - Item distribution across categories:
    - `codes`: 49 items (subdivided among FCPB [5], FCPW [5], RCPB [5], RCPW [5], FCDS [2], RCDS [2], RCPC [5], FCPC [5], PC [5])
    - `buttons`: 18 items
    - `body`: 14 items
    - `locks`: 13 items
    - `screen`: 12 items
    - `camera`: 8 items
    - `pen`: 5 items
    - `backcover`: 5 items
    - `audio`: 5 items
    - `system`: 4 items
    - `battery`: 3 items
    - `water`: 3 items
  - `CATEGORIES`: Contains **15 predefined categories** (All `#78716c`, Codes `#64748b`, Screen `#4682b4`, Camera `#4682b4`, Buttons `#d97706`, Battery `#38a169`, Back Cover `#b45309`, Locks `#f43f5e`, Pen `#9d4edd`, Water Damage `#0284c7`, Audio & Mic `#059669`, Body & Parts `#64748b`, System `#ea580c`, Pinned `#f59e0b`, Recent `#78716c`).
  - `CODE_SUBS`: `["ALL", "FCPB", "FCPW", "FCPC", "RCPB", "RCPW", "RCPC", "FCDS", "RCDS", "PC"]`.

### 1.2 Category UI, Icons, Colors, Ordering & CRUD State
- **File**: `src/components/CategoryChips.tsx` (Lines 1–381)
  - Renders 3 collapsible sidebar sections:
    1. **Quick Views**: `all` (All Defects), `pinned` (Starred Defects), `recent` (Recent History)
    2. **Pin Folders**: Custom folders with inline creation form, color picker (`FOLDER_COLORS = ['#78716c', '#10b981', '#71717a', '#f59e0b', '#ef4444', '#3b82f6']`), inline rename, delete confirmation.
    3. **Defect Categories**: Renders static list mapped from `CATEGORIES`.
  - **Identified Gap**: Defect Categories are **static and read-only**. There is no category creation, editing, deleting, or reordering functionality in the current codebase.
- **File**: `src/components/CodeSubChips.tsx` (Lines 1–47)
  - Renders horizontal subcategory filter chips when `selectedCategory === 'codes'`.
  - **Identified Gap**: Sub-categories are hardcoded to `CODE_SUBS` and only available for `codes`. There is no subcategory CRUD or ability to manage subcategories for other defect groups.
- **File**: `src/utils/categoryColors.ts` (Lines 1–145)
  - Iconography: Maps 15 categories to Lucide icons via `CATEGORY_ICON_MAP`:
    - `screen` / `monitor` → `Monitor`
    - `camera` → `Camera`
    - `buttons` → `Sliders`
    - `battery` → `Battery`
    - `backcover` → `Smartphone`
    - `locks` → `Lock`
    - `pen` → `PenTool`
    - `water` → `Droplets`
    - `audio` → `Volume2`
    - `body` → `Cpu`
    - `system` → `Settings`
    - `codes` → `Code`
    - `pinned` → `Star`
    - `recent` → `History`
    - Default/unknown fallback → `Folder`
  - Colors & Left Border: Generates inline style objects with `getCategoryColor`, `getCategoryBadgeStyle`, and `getCategoryLeftBorderStyle` (`border-left: 4px solid <color>`).
  - **Identified Gap**: No hybrid selector supporting custom emoji or user-selected Lucide icons for categories.
- **File**: `src/components/EditModal.tsx` (Lines 1–142)
  - Provides modal for editing wording text, number, and selecting category from hardcoded `<select id="mcat">`.

### 1.3 State Management & LocalStorage Persistence
- **File**: `src/hooks/useQCState.ts` (Lines 1–708)
  - Synchronizes **14 LocalStorage keys**:
    1. `qc-pins`: `(string | number)[]`
    2. `qc-pin-folders`: `CustomPinFolder[]`
    3. `qc-recents`: `string[]`
    4. `qc-history`: `string[]`
    5. `qc-batch`: `string[]`
    6. `qc-join`: `'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet'`
    7. `qc-autoclear`: `boolean`
    8. `qc-edits`: `Record<string, { t: string; c: CategoryKey; n: number }>`
    9. `qc-dels`: `(string | number)[]`
    10. `qc-custom`: `QCItem[]`
    11. `qc-appearance`: `AppearanceSettings` (layout, radius, textsize, accent, density, motion, theme)
    12. `qc-theme`: `'light' | 'dark' | 'auto'`
    13. `qc-density`: `'cozy' | 'compact'`
    14. `qc-sort`: `'default' | 'alpha' | 'num'`
  - **Identified Gap**: No storage key exists yet for custom categories or category display order (e.g. `qc-categories` / `qc-category-order`).

### 1.4 Testing Infrastructure & Build Pipeline
- **Package.json Scripts**:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "preview": "vite preview",
    "deploy": "npx wrangler pages deploy ./dist",
    "deploy:pages": "npx wrangler pages deploy ./dist",
    "test": "npx tsx --test --test-concurrency=1 \"tests/**/*.{js,ts}\"",
    "test:tier1": "node --test tests/tier1-features.test.js",
    "test:tier2": "node --test tests/tier2-boundary.test.js",
    "test:tier3": "node --test tests/tier3-combinations.test.js",
    "test:tier4": "node --test tests/tier4-workloads.test.js",
    "test:tier5": "node --test tests/tier5-hardening.test.js"
  }
  ```
- **Test Architecture (`tests/harness.js`)**:
  - Uses `esbuild` to compile `src/main.tsx` into an IIFE bundle cached in memory (`compiledAppCodeCache`).
  - Executes tests inside `JSDOM` with Node.js built-in test runner `node:test` and `node:assert/strict`.
  - Injects mocks for `localStorage`, `navigator.clipboard`, `navigator.vibrate`, `matchMedia`, `scrollTo`, `URL.createObjectURL`, `ResizeObserver`.
  - Provides opaque helper methods for DOM interactions (`search`, `selectCategory`, `selectSubCategory`, `getVisibleItems`, `clickItemRow`, `clickItemAction`, `getBatchDrawer`, `copyBatch`, `getToasts`, `setLayoutView`, `exportChanges`, `resetAllChanges`).
- **Empirical Execution Results**:
  - `npm test`: **304 tests across 99 suites — 304 passed, 0 failed, 0 errors** (duration ~232s).
  - `npm run build`: **0 errors, 0 warnings** (TypeScript strict check clean, Vite production bundle generated in 4.58s to `./dist`).

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Category Model | Static Category Keys | Closed set of 15 category keys (`all`, `codes`, `screen`, `camera`, etc.) | `CategoryKey` union | Category identifiers | Unknown keys fall back to Slate `#64748b` & `Folder` icon | `src/types/qc.ts:1-16` |
| 2 | Category Model | Sub-Category Codes | 10 panel code chips (`ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC`) | `SubCategoryCode` union | Code chips under `codes` tab | Ignored if category is not `codes` | `src/types/qc.ts:18-28` |
| 3 | Seed Data | Baseline 139 Defects | 139 standard defect phrases preloaded with ID b2..b140 | None (static array) | `BASE_ITEMS` dataset | Missing item b1 handled transparently | `src/data/qcData.ts:3-143` |
| 4 | Seed Data | 15 Predefined Category Infos | Array with id, name, hex color, description | `CATEGORIES` array | Category definitions | Fallback styles applied if missing | `src/data/qcData.ts:145-236` |
| 5 | Seed Data | Search Keyword & Alias Dictionaries | Maps category keywords (`CATKEY`) and aliases (`ALIAS`) for search engine | Search query string | Expanded query terms | Falls back to exact substring match | `src/data/qcData.ts:251-292` |
| 6 | Navigation | Quick Views Navigation | Sidebar tabs for All Defects, Starred Defects, and Recent History | Tab click (`all`, `pinned`, `recent`) | Filtered wording list | Empty view state if 0 items | `src/components/CategoryChips.tsx:22-26` |
| 7 | Navigation | Custom Pin Folder Manager | Full CRUD for custom user pin folders with color pill badges | Folder name, color selection | Created folder in sidebar & dropdown | Empty name rejected; confirms on delete | `src/components/CategoryChips.tsx:56-96` |
| 8 | Navigation | Defect Category Filtering | Sidebar button selection filtering active defect items | Category click | Updates `selectedCategory`, resets subcategory to `ALL` | No items view if category empty | `src/components/CategoryChips.tsx:319-376` |
| 9 | Navigation | Sub-Category Chip Filtering | Horizontal chip selector for panel code groups under `codes` | Sub-category click | Filters items where `item.sub === selectedSubCategory` | No error; returns empty if unmatched | `src/components/CodeSubChips.tsx:1-47` |
| 10 | Styling | Lucide Iconography System | Category to Lucide icon component mapping | Category key | Lucide SVG React node | Unknown keys default to `Folder` icon | `src/utils/categoryColors.ts:30-52` |
| 11 | Styling | Muted Semantic Color Badges | Dynamic RGB alpha badge styles derived from category hex | Category key | Badge style object `{backgroundColor, borderColor, color}` | Defaults to slate `#64748b` | `src/utils/categoryColors.ts:57-90` |
| 12 | Styling | Left Border Accent Indicators | 4px solid left border styling on defect cards/rows | Category key | CSS properties `{borderLeftWidth: '4px', borderLeftColor: hex}` | Defaults to slate `#64748b` | `src/utils/categoryColors.ts:95-106` |
| 13 | Wording Linkage | Wording Item Storage & Edits | Merges `BASE_ITEMS` with `qc-edits`, `qc-dels`, and `qc-custom` | LocalStorage mutations | Active items dataset | Corrupt storage recovers to default | `src/hooks/useQCState.ts:150-168` |
| 14 | Wording CRUD | Add/Edit Wording Modal | Modal to edit wording text, category selection, and defect number | Form inputs (`text`, `category`, `number`) | Saved item in `qc-custom` or `qc-edits` | Empty text ignored | `src/components/EditModal.tsx:1-142` |
| 15 | Testing Infra | In-Memory JSDOM App Harness | Fast headless test execution with esbuild IIFE compilation | Test script commands | Mounted React DOM instance | Clean teardown without memory leaks | `tests/harness.js:1-721` |
| 16 | Testing Infra | Tier 1: Feature Coverage Suite | 65 automated tests verifying Features 1–12 | `npm run test:tier1` | Test report & exit code 0 | Assert errors if DOM/logic mismatches | `tests/tier1-features.test.js` |
| 17 | Testing Infra | Tier 2: Boundary & Corner Case Suite | 65 automated tests verifying boundaries, nulls, spamming | `npm run test:tier2` | Test report & exit code 0 | Assert errors on boundary regression | `tests/tier2-boundary.test.js` |
| 18 | Testing Infra | Tier 3: Pairwise Cross-Feature Suite | 12 automated pipeline tests covering feature interactions | `npm run test:tier3` | Test report & exit code 0 | Assert errors if cross-flows break | `tests/tier3-combinations.test.js` |
| 19 | Testing Infra | Tier 4: Real-World Workload Scenarios | 6 end-to-end inspector audit workflows | `npm run test:tier4` | Test report & exit code 0 | Assert errors on workflow interruption | `tests/tier4-workloads.test.js` |
| 20 | Testing Infra | Tier 5: Adversarial Hardening Suite | 11 tests verifying corruption recovery and XSS protection | `npm run test:tier5` | Test report & exit code 0 | Assert errors if security or state fails | `tests/tier5-hardening.test.js` |
| 21 | Build Pipeline | Vite + TypeScript Strict Build | Production compilation with PWA generation | `npm run build` | Static bundle in `./dist` | Exit code > 0 on compile/type errors | `package.json:8` |

---

## 3. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Category Color Derivation | Unknown/missing category key (e.g. `"nonexistent"`, `""`, `null`) | Derives fallback hex `#64748b` (Slate) and default badge/border styles without throwing. |
| 2 | Category Color Whitespace | Untrimmed/uppercase category key (`"  BATTERY  "`) | `getCategoryColor` and `getCategoryBadgeStyle` normalize with `.trim().toLowerCase()` and correctly match `#38a169`. |
| 3 | Category Icon Mapping | Unknown category key passed to `getCategoryIconComponent` | Returns fallback Lucide `Folder` icon component. |
| 4 | Sub-Category Filtering | Switching from `codes` category with active sub-code `FCPB` to `screen` | `handleSelectCategory` automatically resets `selectedSubCategory` to `'ALL'`, preventing filtering anomalies. |
| 5 | Baseline Item ID Gaps | Baseline dataset has IDs `b2`..`b140` (139 items; `b1` is omitted) | App and search engine seamlessly process 139 items; `#statsDashboard` accurately reports 139 total baseline defects. |
| 6 | Custom Pin Folder Lifecycle | Creating 50+ custom folders; folder with 200+ characters; folder with XSS payload `<script>` | Folders are created with unique IDs; strings are safely escaped in DOM; survives storage roundtrips. |
| 7 | Custom Pin Folder Deletion | Deleting a folder while items are pinned in multiple folders | Item IDs are removed from that specific folder; items remain pinned in any remaining folders and in Starred view. |
| 8 | Corrupted LocalStorage | Malformed JSON in `qc-pin-folders` or `qc-appearance` | `safeJSONParse` catches JSON parse exceptions and falls back to default empty/initial state without crashing. |
| 9 | Rapid Re-Clicking / Micro-Interactions | Clicking defect cards 10 times in 200ms | Timer resets cleanly on `copiedTimerRef.current`, avoiding race conditions or leaked timeout callbacks. |
| 10 | Unmounting Mid-Animation | Copying a card and immediately switching view mode (List → Grid) or typing in search | Cleanup in `useEffect` clears active timeout, preventing memory leaks or unmounted state update errors. |
| 11 | Batch Delimiters | Joining batch items with `pipe`, `bullet`, `space`, `semi`, `comma`, `nl` | Synchronized across both the visual segmented tabs and the underlying `#joinSel` `<select>` element. |
| 12 | Bulk Import Parsing | Pasting 150 lines with mixed CRLF/LF, trailing blanks, and whitespace lines | Filters empty lines and imports valid lines into batch queue without memory exhaustion. |

---

## 4. Logic Chain

1. **Requirement Mapping**:
   - The user request specifies:
     - **R3**: Advanced Category & Sub-Category Manager with Edit Mode (Create & Edit categories with hybrid icon selector [Lucide OR custom emoji], color picker, position placement; Reorder & Organize with localStorage persistence; Sub-Category Editor to add/edit/remove sub-code chips).
     - **R5**: Test Suite & Build Verification (100% test pass rate across existing and new test suites with clean production build `npm run build` and `npm run test`).
2. **Current Codebase State vs. R3 Gap Analysis**:
   - **What exists**:
     - Pre-existing static category list (`CATEGORIES`) and static subcategory list (`CODE_SUBS`).
     - Fully functional Custom Pin Folder Manager (`qc-pin-folders`) with creation, rename, delete, and color selection.
     - Custom defect wording item creation and editing (`qc-custom`, `qc-edits`, `qc-dels`).
   - **What is missing for R3**:
     - Category CRUD: Creating custom categories, renaming/editing categories, deleting categories.
     - Icon Selector: Hybrid selector allowing curated Lucide icons OR emoji picker.
     - Category Color Picker: Custom hex/palette selection per category.
     - Category Reordering: Drag-and-drop or reorder controls persisted in localStorage.
     - Sub-Category Editor: Adding, editing, and removing subcategory codes and associating them with categories.
     - Type System Extension: `CategoryKey` is currently a closed union. It must be made open (`string & {}` or dynamic `string`) to accommodate custom category IDs while preserving type safety.
3. **Testing Infrastructure Assessment**:
   - The project has a complete, robust opaque-box testing harness in `tests/harness.js` using `esbuild` + `JSDOM` + Node's built-in `node:test` runner.
   - All 304 tests across Tiers 1–5, Challenger, Stress, and Forensic suites pass with 100% success rate.
   - Production build `npm run build` executes cleanly in ~4.58 seconds with 0 TypeScript or bundler errors.

---

## 5. Caveats

1. **CategoryKey Type Extension**: Because `CategoryKey` is currently a strict union type in `src/types/qc.ts`, extending it for dynamic user categories requires ensuring that existing tests (which check strict category IDs) do not encounter type regressions.
2. **Test Runner Concurrency**: `npm test` must run with `--test-concurrency=1` due to JSDOM in-memory resource contention when executing large suites.
3. **Touch Target Dimensions**: Touch ergonomics (minimum 44–48px hit areas for Samsung Galaxy Tab S9+) must be verified on all newly introduced Category Manager buttons, chips, and drag handles.

---

## 6. Conclusion

- **Category & Sub-Category Manager**: The current system has static seed data (139 items, 15 categories, 10 subcodes) and a working custom Pin Folder manager, but **lacks the required Category & Sub-Category Manager** (creation, hybrid icon selector, color picker, reordering, subcode editor).
- **Testing Infrastructure**: The test infrastructure is **exceptionally healthy and fully operational**, with 304/304 passing tests and a clean production build (`npm run build`).
- **Path Forward**: Future implementation of R3 should follow the established pattern in `useQCState` (persisting to a new localStorage key, e.g., `qc-categories` / `qc-category-order`), provide a sleek shadcn/ui modal or drawer for category and subcategory management, and introduce new Tier tests without regressing any of the 304 existing test cases.

---

## 7. Verification Method

To independently verify all findings in this report:

1. **Verify TypeScript & Production Build**:
   ```bash
   npm run build
   ```
   *Expected result*: Exit code 0, 0 errors, `./dist` bundle compiled successfully.

2. **Verify Full Test Suite Pass Rate**:
   ```bash
   npm test
   ```
   *Expected result*: Exit code 0, 304 tests passed, 0 failed, 99 suites passed.

3. **Verify Tier-Specific Test Suites**:
   ```bash
   npm run test:tier1
   npm run test:tier2
   npm run test:tier3
   npm run test:tier4
   npm run test:tier5
   ```
   *Expected result*: All tier commands exit with code 0.
