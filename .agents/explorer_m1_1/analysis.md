# Comprehensive Analysis: E2E Test Infrastructure & Test Architecture

**Date**: 2026-08-09  
**Author**: Explorer Subagent (`explorer_m1_1`)  
**Track**: E2E Testing Track — Milestone 1 (Test Infra & Architecture)  
**Target Repository**: `QCStandardWording` (`c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`)  

---

## 1. Executive Summary

This report delivers a thorough investigation and architectural analysis of the test environment, test runner configuration, DOM emulation harness, existing test suites, and test coverage mapping for the **QC Standard Wording — Raycast Warm Stone UI Redesign** application.

### Key Investigation Findings
1. **Test Runner & Configuration**:
   - Tests are currently executed using Node's native test runner (`node:test` + `node:assert/strict`) invoked via `npx tsx --test "tests/**/*.{js,ts}"`.
   - `package.json` defines individual tier scripts (`npm run test:tier1` through `npm run test:tier5`).
   - **Vitest Configuration Note**: `vitest` is not currently installed in `package.json`, nor is a `vitest.config.ts` file present. The project currently relies on `tsx` + `node:test` + `jsdom` + `esbuild`. If Vitest migration is required, a `vitest.config.ts` can be added, or the `node:test` harness can be expanded while remaining 100% compliant with `npm run test`.
2. **DOM Environment & Harness**:
   - `tests/harness.js` provides a JSDOM-based browser emulator (`jsdom` v26.1.0) coupled with in-memory `esbuild` compilation of `src/main.tsx`.
   - The harness exposes an opaque DOM interaction API (`createAppInstance()`) containing helpers for search, category navigation, sub-code filtering, batch drawer operations, custom wording CRUD, floating toasts inspection, layout mode verification, and localStorage inspection.
3. **Coverage Gap vs. `TEST_INFRA.md` Specifications**:
   - `TEST_INFRA.md` dictates a minimum target of **138 test cases** across Tiers 1–4:
     - **Tier 1 (Feature Coverage)**: $\ge 5$ tests per feature across 12 features ($\ge 60$ tests). Currently ~23 assertions in `tier1-features.test.js`.
     - **Tier 2 (Boundary & Corner Cases)**: $\ge 5$ tests per feature across 12 features ($\ge 60$ tests). Currently ~12 assertions in `tier2-boundary.test.js`.
     - **Tier 3 (Cross-Feature Pairwise)**: $\ge 12$ pairwise test scenarios. Currently 3 pipelines in `tier3-combinations.test.js`.
     - **Tier 4 (Real-World Scenarios)**: $\ge 6$ application workload scenarios. Currently 3 workloads in `tier4-workloads.test.js`.
4. **Opaque-Box Architectural Imperative**:
   - All tests interact strictly via external UI boundaries, accessibility attributes, DOM selectors (`data-testid`, `#search`, `button`), and `localStorage` state contracts. Zero internal component state or implementation code is directly imported or modified by tests.

---

## 2. Analysis of Existing Codebase & Test Setup

### 2.1 Package Configuration (`package.json`)
The relevant configuration in `package.json` (lines 6-19 & 39-53):

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "preview": "vite preview",
    "deploy": "npx wrangler pages deploy ./dist",
    "deploy:pages": "npx wrangler pages deploy ./dist",
    "test": "npx tsx --test \"tests/**/*.{js,ts}\"",
    "test:tier1": "node --test tests/tier1-features.test.js",
    "test:tier2": "node --test tests/tier2-boundary.test.js",
    "test:tier3": "node --test tests/tier3-combinations.test.js",
    "test:tier4": "node --test tests/tier4-workloads.test.js",
    "test:tier5": "node --test tests/tier5-hardening.test.js"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^26.1.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2",
    "vite": "^6.0.0",
    "vite-plugin-pwa": "^0.21.1",
    "wrangler": "^3.111.0"
  }
}
```

#### Key Findings from `package.json`:
- **Test Command**: `npm run test` executes `npx tsx --test "tests/**/*.{js,ts}"`.
- **Individual Tier Commands**: Use `node --test tests/<file>.test.js`.
- **Dependencies**: React 19 (`^19.2.8`), Vite 6 (`^6.0.0`), Radix UI primitives (`@radix-ui/react-*`), Lucide React (`^0.475.0`), Sonner (`^2.0.1`), Tailwind CSS v4.
- **Missing Packages for Vitest/RTL**: Vitest and `@testing-library/react` are not present in `package.json`. The codebase uses JSDOM + `esbuild` + `node:test`.

### 2.2 Test Harness (`tests/harness.js`)
`tests/harness.js` provides an opaque browser test environment:
- **Build Step**: Calls `esbuild.buildSync` on `src/main.tsx` to create an in-memory IIFE bundle (`compiledAppCodeCache`).
- **DOM Instantiation**: Instantiates `new JSDOM(htmlTemplate, { runScripts: 'dangerously', resources: 'usable' })`.
- **Browser Mocks**: Injects mocks for `matchMedia`, `scrollTo`, `localStorage` (`MockLocalStorage`), `navigator.clipboard`, `navigator.vibrate`, `URL.createObjectURL`, and `URL.revokeObjectURL`.
- **Opaque DOM Helpers exposed on `createAppInstance()`**:
  - Navbar & Header: `getAppNavbar()`, `getAppHeader()`, `getSegmentedControl()`, `getStatsDashboard()`
  - Search & Spotlight: `search(query)`, `submitSearch(query)`, `clearSearch()`, `openSpotlightModal()`, `isSpotlightOpen()`
  - Category & Sub-code Navigation: `selectCategory(catId)`, `selectSubCategory(subCode)`
  - Item Inspection: `getVisibleItems()`, `clickItemRow(index)`, `clickItemAction(index, action)`
  - Batch Queue Drawer: `getBatchDrawer()`, `getBatchDrawerOverlay()`, `getBatchItems()`, `getBatchCount()`, `setDelimiter(key)`, `toggleAutoClear(boolean)`, `copyBatch()`, `clearBatch()`, `removeBatchItem(index)`, `moveBatchItemUp(index)`, `moveBatchItemDown(index)`
  - Custom Wording CRUD & Edit Toolbar: `toggleEditMode()`, `isEditModeActive()`, `openAddModal()`, `saveModalForm(text, cat, num)`, `cancelModal()`, `exportChanges()`, `resetAllChanges()`
  - Notifications & Toasts: `getToasts()`, `triggerToastAction(index)`
  - View Switching & Layout Shift: `setLayoutView(mode)`, `getLayoutShiftMetrics()`
  - Storage Layer: `getStorageJSON(key)`

### 2.3 Inventory of Existing Test Files
1. `tests/tier1-features.test.js`: Tests basic mounting, left sidebar, header search, stats dashboard, subchip filtering, floating toasts, batch drawer, high-contrast views, recents & pinning, custom wording.
2. `tests/tier2-boundary.test.js`: Tests Levenshtein typos, empty/whitespace queries, regex meta-chars & XSS escaping, layout shift metrics, max batch queue (50+ items), rapid toasts, corrupted localStorage JSON.
3. `tests/tier3-combinations.test.js`: Pipelines combining sidebar + search + view switcher + batch drawer; custom edit + pin + theme persistence; batch queue + toasts + undo deletion + JSON export/import.
4. `tests/tier4-workloads.test.js`: Technician mobile inspection workflow, supervisor custom wording audit & model sync workflow, desktop vs mobile viewport layout integrity.
5. `tests/tier5-hardening.test.js`: Extreme localStorage corruption across all 14 keys, XSS payload in titles/folders, max folder capacity (55 folders), batch queue reordering, high-speed theme/density toggles.
6. `tests/m3-pin-folders.test.js`: Custom pin folder schema, auto-migration from legacy `qc-pins`, theme attribute management.
7. `tests/m3-challenger-verification.test.js`: View mode switcher stress, batch drawer operations, floating toast throttling, pin folder CRUD.
8. `tests/searchEngine.test.ts`: Search algorithm primitives (`lev`, `subseq`, `isApprox`, alias expansion).

---

## 3. Feature Inventory & Test Coverage Requirements

The test suite must validate 12 core features across Tiers 1 to 4 as specified in `TEST_INFRA.md` and `PROJECT.md`:

| # | Feature Name | Description | Spec Source | Tier 1 Target | Tier 2 Target | Tier 3 Target | Tier 4 Target |
|---|--------------|-------------|-------------|:-------------:|:-------------:|:-------------:|:-------------:|
| **F1** | Raycast Warm Stone Base Theme | Soft warm charcoal `#121214` dark / `#fcfcfc` light, warm grey borders `border-stone-800`/`200`, clean typography | `ORIGINAL_REQUEST §R1` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F2** | Complete Elimination of AI Tropes | Purged heavy glassmorphism blurs (`backdrop-blur-md`), neon cyan/purple gradients, glowing void halos | `ORIGINAL_REQUEST §R1` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F3** | Muted Semantic Color Pills | Soft Green (Battery), Muted Amber (Buttons), Steel Blue (Screen), Muted Plum (Pen), Rose (Locks), Slate (Codes/Other) | `ORIGINAL_REQUEST §R2` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F4** | Lucide Iconography System | Clean Lucide icons assigned across all 15 defect categories and toolbar action buttons | `ORIGINAL_REQUEST §R2` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F5** | Left Border Accent Indicators | Crisp `border-l-4` category indicators across List, Grid Cards, and Table view modes | `ORIGINAL_REQUEST §R2` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F6** | Sticky Left Sidebar Navigation | Category tabs (All, Codes, Screen, Camera, etc.), sub-code chips (`FCPB`, etc.), custom user pin folder manager | `ORIGINAL_REQUEST §R3` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F7** | Custom User Pin Folder Manager | Full CRUD for custom folders, multi-folder item starring, item count badges, `localStorage` persistence (`qc-pin-folders`) | `ORIGINAL_REQUEST §R3` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F8** | Clean Top Header & Spotlight Search | Search input with ⌘K / Ctrl+K Spotlight modal, View switcher (List, Grid, Table), Theme toggle, Settings modal trigger | `ORIGINAL_REQUEST §R3` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F9** | Floating Sonner Toasts & Batch Drawer | Minimalist floating Sonner toasts and clean slide-out batch drawer with solid subtle overlays (no heavy blurs) | `ORIGINAL_REQUEST §R3` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F10** | Type Safety & Performance | Zero layout shift, instant search responsiveness, 100% TypeScript type safety | `ORIGINAL_REQUEST §R4` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F11** | Cloudflare Pages Build Integrity | Static build asset generation in `dist/` via `npm run build` compliant with `wrangler.jsonc` | `ORIGINAL_REQUEST §R4` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |
| **F12** | Full E2E Test Suite Verification | Pass 100% of unit, integration, E2E, and Tier 5 test suites (`npm run test`) with zero failures | `ORIGINAL_REQUEST §R4` | $\ge 5$ | $\ge 5$ | Pairwise | Workload |

---

## 4. Proposed Test Architecture Strategy (Tiers 1–4)

To satisfy the test coverage targets defined in `TEST_INFRA.md` ($\ge 138$ total test cases), the test suite should be structured modularly as follows:

### 4.1 Tier 1: Feature Coverage (Happy Path — $\ge 60$ Tests Total)
Structured cleanly into 12 feature suites (5+ test cases each):

1. **Suite 1.1: Warm Stone Base Theme (F1)** — 5 test cases
   - T1.1.1: Verify `#121214` dark surface background styling applied on root container.
   - T1.1.2: Verify `#fcfcfc` light surface background styling applied when light mode active.
   - T1.1.3: Verify warm grey border classes (`border-stone-800` / `border-stone-200`) on cards and containers.
   - T1.1.4: Verify font family and clean typography rendering without layout shifts.
   - T1.1.5: Verify theme state initialization from `localStorage` key `qc-theme`.

2. **Suite 1.2: Elimination of AI Tropes (F2)** — 5 test cases
   - T1.2.1: Verify 0 elements contain heavy backdrop blur classes (`backdrop-blur-md`, `backdrop-blur-xl`).
   - T1.2.2: Verify 0 elements contain cyan/purple neon gradient backgrounds (`bg-gradient-to-r from-cyan-500 to-purple-500`).
   - T1.2.3: Verify drawer overlay uses solid subtle backdrop overlay (`bg-stone-950/60` or `bg-black/50`).
   - T1.2.4: Verify modal overlays use subtle solid backdrop style without radial void glow halos.
   - T1.2.5: Verify toast notifications use minimalist solid Warm Stone card styling without glowing halos.

3. **Suite 1.3: Muted Semantic Color Pills (F3)** — 5 test cases
   - T1.3.1: Verify Soft Green pill badge style for Battery category items.
   - T1.3.2: Verify Muted Amber pill badge style for Buttons category items.
   - T1.3.3: Verify Steel Blue pill badge style for Screen category items.
   - T1.3.4: Verify Muted Plum pill badge style for Pen category items.
   - T1.3.5: Verify Rose pill badge style for Locks category items.

4. **Suite 1.4: Lucide Iconography System (F4)** — 5 test cases
   - T1.4.1: Verify Lucide icons render for screen (`Monitor`/`Smartphone`), battery (`Battery`), camera (`Camera`) badges.
   - T1.4.2: Verify Lucide icons render for buttons (`CircleDot`), pen (`PenTool`), locks (`Lock`), audio (`Volume2`).
   - T1.4.3: Verify Lucide icons render for backcover, water, body, system, and codes categories.
   - T1.4.4: Verify Lucide action icons render on defect item action buttons (Pin, Add to batch, Edit, Delete).
   - T1.4.5: Verify Lucide icons render on header controls (Search, View switcher, Theme toggle, Settings).

5. **Suite 1.5: Left Border Accent Indicators (F5)** — 5 test cases
   - T1.5.1: Verify `border-l-4` accent indicator class rendered on List view defect cards.
   - T1.5.2: Verify `border-l-4` accent indicator class rendered on Grid view defect cards.
   - T1.5.3: Verify `border-l-4` accent indicator class rendered on Table view defect rows.
   - T1.5.4: Verify category color matching on left border accent lines for Battery, Screen, Camera.
   - T1.5.5: Verify custom category items display correct category left border accent.

6. **Suite 1.6: Sticky Left Sidebar Navigation (F6)** — 5 test cases
   - T1.6.1: Verify left sidebar nav container mounts with sticky/fixed positioning.
   - T1.6.2: Verify filtering by all 13 standard category tabs (`codes`, `screen`, `camera`, `buttons`, etc.).
   - T1.6.3: Verify virtual category tabs (`pinned`, `recent`) filter items correctly.
   - T1.6.4: Verify item count badges rendered alongside category names in sidebar.
   - T1.6.5: Verify sub-code chips (`FCPB`, `FCPW`, `FCPS`, etc.) display when `codes` category active.

7. **Suite 1.7: Custom User Pin Folder Manager (F7)** — 5 test cases
   - T1.7.1: Verify creation of new custom pin folder with name and custom color picker.
   - T1.7.2: Verify deletion of custom pin folder and handling of items inside.
   - T1.7.3: Verify renaming of custom pin folder via inline edit/modal.
   - T1.7.4: Verify starring/pinning items into specific custom folders.
   - T1.7.5: Verify `localStorage` persistence of folders under key `qc-pin-folders`.

8. **Suite 1.8: Clean Top Header & Spotlight Search (F8)** — 5 test cases
   - T1.8.1: Verify top header rendering with search input, ⌘K badge, and view switcher.
   - T1.8.2: Verify search input filters items instantaneously by substring and prefix match.
   - T1.8.3: Verify term alias expansion (`display` $\to$ screen, `spen` $\to$ pen, `icloud` $\to$ locks).
   - T1.8.4: Verify ⌘K / Ctrl+K keyboard shortcut opens Spotlight modal search overlay.
   - T1.8.5: Verify term highlighting (`<mark>`) in rendered defect search results.

9. **Suite 1.9: Floating Sonner Toasts & Batch Drawer (F9)** — 5 test cases
   - T1.9.1: Verify clicking item copies text to clipboard and spawns Sonner floating toast.
   - T1.9.2: Verify adding items to batch queue updates batch count badge in header/drawer.
   - T1.9.3: Verify batch queue joins items with selected delimiters (newline, comma, semicolon, space).
   - T1.9.4: Verify slide-out batch drawer open/close transition and solid overlay backdrop.
   - T1.9.5: Verify individual item removal and clear all functionality in batch drawer.

10. **Suite 1.10: Type Safety & Performance (F10)** — 5 test cases
    - T1.10.1: Verify zero layout shift ($0\text{px}$ jump) when toggling sub-code chips in sidebar.
    - T1.10.2: Verify instant search filter response ($< 16\text{ms}$ execution time).
    - T1.10.3: Verify state hook updates (`useQCState`, `useAppearance`) trigger smooth re-renders.
    - T1.10.4: Verify density setting switching (`cozy`, `compact`, `spacious`) retains DOM integrity.
    - T1.10.5: Verify TypeScript compilation (`tsc --noEmit`) passes with 0 type errors.

11. **Suite 1.11: Cloudflare Pages Build Integrity (F11)** — 5 test cases
    - T1.11.1: Verify static build command `npm run build` completes successfully.
    - T1.11.2: Verify generated bundle output exists in `./dist/index.html` and `./dist/assets/`.
    - T1.11.3: Verify `wrangler.jsonc` contains `"pages_build_output_dir": "./dist"`.
    - T1.11.4: Verify static asset redirects file `./dist/_redirects` created properly.
    - T1.11.5: Verify PWA manifest `./dist/manifest.webmanifest` and service worker present.

12. **Suite 1.12: Full E2E Test Suite Verification (F12)** — 5 test cases
    - T1.12.1: Verify `npm run test` executes all test files without throwing exceptions.
    - T1.12.2: Verify 100% test pass rate with exit code 0.
    - T1.12.3: Verify 0 unhandled promise rejections or async memory leaks.
    - T1.12.4: Verify all 14 `localStorage` keys maintain schema validity during execution.
    - T1.12.5: Verify clean test completion time under 15 seconds.

---

### 4.2 Tier 2: Boundary & Corner Cases ($\ge 60$ Tests Total)
Structured into 12 feature boundary suites (5+ test cases each):

1. **Boundary 2.1: Warm Stone Theme Extremes (F1)** — 5 tests
   - High-frequency theme toggling (50 switches in 100ms).
   - System theme media query changes (`prefers-color-scheme: dark/light`).
   - Unrecognized theme values in `localStorage` fallback to dark.
   - Missing CSS variables fallback test.
   - High contrast mode accessibility check.

2. **Boundary 2.2: AI Tropes & Style Injection Defense (F2)** — 5 tests
   - Verify dynamic style injection cannot introduce glassmorphic blurs.
   - Verify third-party library elements do not inject glowing neon gradients.
   - Drawer overlay clicks outside close drawer without backdrop distortion.
   - Modal keydown Escape key dismisses overlay without style leak.
   - Screen resize during drawer open maintains overlay boundary.

3. **Boundary 2.3: Category Pill Boundary Cases (F3)** — 5 tests
   - Custom categories with missing color keys fallback to Slate pill styling.
   - Long category names ellipsis truncation without overflowing pill bounds.
   - Category pill click handling under rapid double-clicking.
   - Pill badge rendering with special characters in category name.
   - Zero-length category pill fallback.

4. **Boundary 2.4: Iconography Edge Cases (F4)** — 5 tests
   - Icon load failure / missing category icon key fallback to default `FileText` icon.
   - Icon component rendering inside small button viewports ($16\text{px}\times16\text{px}$).
   - SVG icon accessibility attributes (`aria-hidden="true"`).
   - Icon color inheritance from parent Warm Stone theme classes.
   - Dynamic icon swap when category is edited.

5. **Boundary 2.5: Left Accent Border Boundaries (F5)** — 5 tests
   - Accent border rendering when item title spans multiple lines.
   - Accent border visual contrast ratio against `#121214` dark background.
   - Accent border alignment in Table view mode with hidden columns.
   - Accent border rendering in Grid card view under dense layout.
   - Dynamic left border color updates upon category change.

6. **Boundary 2.6: Sidebar Navigation & Sub-chip Boundaries (F6)** — 5 tests
   - Sidebar collapse/expand boundary behavior.
   - Sub-chip selection with 0 matching defects displays empty state message.
   - Rapid switching between sub-code chips (`FCPB` $\to$ `FCPW` $\to$ `FCPS` $\to$ `ALL`).
   - Long sub-code chip overflow scrolling in container.
   - Sidebar item count badge updates dynamically when items are deleted.

7. **Boundary 2.7: Pin Folder Manager Edge Cases (F7)** — 5 tests
   - Max pin folder limit stress test (creating 50+ custom pin folders).
   - Empty folder name prevention / default name fallback.
   - Deleting a folder containing starred items retains items in general pins.
   - Duplicate folder name handling.
   - Folder starring state sync across multiple custom folders.

8. **Boundary 2.8: Search Engine & Spotlight Boundaries (F8)** — 5 tests
   - Bounded Levenshtein distance typo tolerance (`batery` $\to$ `battery`, `scren` $\to$ `screen`).
   - Approximate match flag (`≈`) thresholding (score $< 80$).
   - Distance cap filtering (unrelated query `xyzqwerty` returns 0 results).
   - Regex meta-character query safety (`[ ] ( ) * + ? ^ $ \ . |`).
   - HTML / XSS meta-character escaping in search query (`<script>alert(1)</script>`).

9. **Boundary 2.9: Toast & Drawer Capacity Stress (F9)** — 5 tests
   - Maximum batch queue capacity stress (50+ queued items).
   - Rapid toast dispatch throttling (spawning 20 toasts in sequence without DOM flooding).
   - Batch queue delimiter change with empty queue.
   - Removing non-existent item index from batch queue gracefully ignored.
   - Toast action button execution after toast timeout grace period.

10. **Boundary 2.10: Type & Storage Corruption Resilience (F10)** — 5 tests
    - Booting gracefully when all 14 `localStorage` keys contain malformed JSON syntax.
    - `localStorage` `QuotaExceededError` handling on export/save operations.
    - Reading primitive values (`string`, `number`, `boolean`) when JSON array expected.
    - Storage state recovery after clearing browser cache mid-session.
    - Concurrent state mutations in hooks.

11. **Boundary 2.11: Cloudflare Static Build Constraints (F11)** — 5 tests
    - Build output directory `./dist` cleanly purged before rebuild.
    - Large asset file size limits verification ($< 5\text{MB}$ single asset bundle).
    - Relative path asset loading integrity in static build.
    - PWA service worker registration handling offline fallback.
    - Header security policy compatibility check.

12. **Boundary 2.12: Hardening & Memory Leaks (F12)** — 5 tests
    - 100 repeated mounting/unmounting app cycles without memory leak.
    - Unhandled event listener cleanup on unmount.
    - High-frequency timer cleanup in toasts container.
    - Large dataset loading (1,000+ custom wording entries).
    - Null pointer / undefined property safety in component renders.

---

### 4.3 Tier 3: Cross-Feature Pairwise Combinations ($\ge 12$ Test Cases)

Tier 3 validates interaction pipelines between pairs of major application features:

1. **Pipeline 1 (F6 $\times$ F8 $\times$ F9)**: Sidebar Category Nav + Top Header Spotlight Search + Segmented View Switcher Sync.
2. **Pipeline 2 (F1 $\times$ F7 $\times$ F8)**: Warm Stone Theme Switching + Custom Pin Folder Management + Spotlight Search.
3. **Pipeline 3 (F7 $\times$ F9 $\times$ F10)**: Batch Drawer Queue + Toast Notifications + Undo Deletion + JSON Export/Import.
4. **Pipeline 4 (F3 $\times$ F5 $\times$ F8)**: Muted Color Pills + Left Border Accents + Search Filtering in Grid Mode.
5. **Pipeline 5 (F4 $\times$ F6 $\times$ F7)**: Lucide Icon Badges + Sub-chip Navigation + Folder Multi-Starring.
6. **Pipeline 6 (F8 $\times$ F9 $\times$ F10)**: ⌘K Spotlight Trigger + Batch Queue Selection + Delimiter Formatting.
7. **Pipeline 7 (F1 $\times$ F2 $\times$ F9)**: Warm Stone Solid Overlay + Slide-out Batch Drawer + Floating Toasts.
8. **Pipeline 8 (F6 $\times$ F7 $\times$ F10)**: Pin Folder CRUD + `localStorage` Auto-Migration + Storage Corruption Recovery.
9. **Pipeline 9 (F8 $\times$ F9 $\times$ F11)**: Search Query Filter + Bulk Paste into Batch Queue + Cloudflare Pages Asset Route.
10. **Pipeline 10 (F3 $\times$ F4 $\times$ F5)**: Category Color Mapping + Lucide Icon Resolver + Left Accent Border in Table View.
11. **Pipeline 11 (F7 $\times$ F8 $\times$ F10)**: Custom Wording Edit Mode + Spotlight Term Highlighting + `qc-custom` Storage Persistence.
12. **Pipeline 12 (F1 $\times$ F10 $\times$ F12)**: Density Preference Toggle + Zero Layout Shift Check + Full Test Runner Verification.

---

### 4.4 Tier 4: Real-World Application Workload Scenarios ($\ge 6$ Scenarios)

1. **Scenario 1: Mobile QC Technician Smartphone Inspection Routine (F6, F7, F8, F9)**
   - Technician sets layout view to compact table mode.
   - Searches for screen defect with typo (`scren crease`), copies wording, verifies recent history.
   - Navigates sidebar to Battery, Camera, and Code subchips (`FCPB`), queuing 3 defects into batch drawer.
   - Opens batch drawer, sets delimiter to newline (`\n`), enables autoclear, copies complete formatted inspection report.

2. **Scenario 2: QC Supervisor Custom Wording Audit & Model Sync (F7, F8, F10)**
   - Supervisor enables Edit Mode, adds 3 new custom defects for upcoming foldable smartphone model.
   - Verifies items are saved to `qc-custom` storage and searchable via Spotlight.
   - Exports changes payload (`qc-wording-changes.json`).
   - Resets state back to canonical default, then imports JSON file to restore custom wording audit configuration.

3. **Scenario 3: High-Volume Desktop Defect Categorization & Multi-Folder Pinning (F4, F6, F7, F9)**
   - Desktop user creates 3 custom pin folders ("Priority Screen", "Battery Recalls", "Hinge Issues").
   - Multi-stars defects across categories into specific custom folders.
   - Filters sidebar by custom folder views, verifies item count badges, and exports combined batch report.

4. **Scenario 4: Dark/Light Warm Stone Theme Switching & Density Preference Persistence (F1, F2, F8, F10)**
   - User switches between `#121214` Dark theme and `#fcfcfc` Light theme using top header toggle.
   - Changes density mode from `cozy` to `compact` to `spacious`.
   - Reloads application instance, verifying theme and density persistence across `localStorage` (`qc-theme`, `qc-density`).

5. **Scenario 5: Spotlight Navigation & Cross-View Audit (F5, F8, F9, F10)**
   - User triggers Spotlight modal via ⌘K keyboard shortcut.
   - Executes search queries with aliases (`spen` $\to$ Pen, `display` $\to$ Screen).
   - Switches between List, Grid Cards, and Table views, verifying left border accent indicators (`border-l-4`) and zero layout shift.

6. **Scenario 6: E2E Static Build & Hardening Verification (F10, F11, F12)**
   - Full end-to-end execution validating TypeScript compilation (`tsc`), Vite static build output (`./dist`), Cloudflare Pages config (`wrangler.jsonc`), and 100% test suite pass rate across all tiers.

---

## 5. Verification & Test Execution Strategy

### 5.1 Test Commands
All test commands run from project root `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`:

- **Run Full Test Suite**:
  ```bash
  npm run test
  ```
- **Run Tier 1 (Feature Coverage)**:
  ```bash
  npm run test:tier1
  ```
- **Run Tier 2 (Boundary & Corner Cases)**:
  ```bash
  npm run test:tier2
  ```
- **Run Tier 3 (Cross-Feature Combinations)**:
  ```bash
  npm run test:tier3
  ```
- **Run Tier 4 (Real-World Scenarios)**:
  ```bash
  npm run test:tier4
  ```
- **Run Tier 5 (Hardening & Stress)**:
  ```bash
  npm run test:tier5
  ```
- **Build Verification**:
  ```bash
  npm run build
  ```

---

## 6. Recommendations for Implementer Agent

1. **Maintain Opaque Test Harness Architecture**:
   - Continue utilizing `tests/harness.js` (`createAppInstance()`) to test the React app opaques via DOM interactions and `localStorage` contracts.
   - Do NOT import internal React components directly into test files to maintain true opaque-box, requirement-driven E2E test integrity.
2. **Expand Test Suites to Meet Thresholds**:
   - Expand `tests/tier1-features.test.js` to contain $\ge 60$ distinct test cases mapped cleanly across Suites 1.1 to 1.12.
   - Expand `tests/tier2-boundary.test.js` to contain $\ge 60$ distinct test cases mapped across Boundary Suites 2.1 to 2.12.
   - Expand `tests/tier3-combinations.test.js` to contain $\ge 12$ cross-feature pipelines.
   - Expand `tests/tier4-workloads.test.js` to contain $\ge 6$ real-world application scenarios.
3. **Preserve 100% Pass Rate**:
   - Ensure all assertions succeed cleanly with exit code 0 and zero unhandled rejections.

