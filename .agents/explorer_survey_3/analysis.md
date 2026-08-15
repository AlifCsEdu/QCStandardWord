# Exploration Analysis Report: Milestone R3 & R4

**Focus Areas**:
- Milestone R3: Batch Drawer & Floating Toasts Architecture & Visual Interactions
- Milestone R4: Test Suite Architecture, Harness Mocking, Build System & Fragile Matchers

---

## 1. Executive Summary

This investigation analyzed the complete implementation, component structure, state management, test harness architecture, and build pipeline for QC Standard Wording.

- **Test Suite Verification**: Confirmed **203 tests across 58 test suites** running via `npx tsx --test "tests/**/*.{js,ts}"` with a **100% pass rate (203/203 passed, 0 failed, 0 skipped)** in ~83 seconds.
- **Build System Verification**: Confirmed `npm run build` (`tsc && vite build`) executes cleanly with **0 TypeScript errors**, bundling 1,693 modules with Vite PWA support for Cloudflare Pages static distribution.
- **Architecture Integrity**: Both Milestone R3 components (Batch Drawer & Floating Toasts) and the entire testing framework (Tiers 1-5 + Challenger Stress suites) are deeply mapped with all selector contracts, mock objects, and styling requirements cataloged below.

---

## 2. Milestone R3 Deep Component Mapping

### 2.1 Batch Drawer Architecture

- **Primary Source File**: `src/components/BatchDrawer.tsx`
- **State Hook**: `src/hooks/useQCState.ts` (lines 88–124, 420–468)
- **Container Styling**: `src/index.css` (lines 260–279)

#### Props & State Contract
| Prop / State | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Controls slide-out visibility (`translate-x-0` vs `translate-x-full`) |
| `onClose` | `() => void` | Closes batch drawer |
| `batchQueue` | `string[]` | Array of queued defect wording strings (synced to `qc-batch` in localStorage) |
| `delimiter` | `DelimiterKey` | Active delimiter (`nl`, `comma`, `semi`, `space`, `pipe`, `bullet`) |
| `onSetDelimiter`| `(key: DelimiterKey) => void` | Updates delimiter (synced to `qc-join` in localStorage) |
| `autoclear` | `boolean` | Auto-clears queue on copy (synced to `qc-autoclear` in localStorage) |
| `onSetAutoclear`| `(val: boolean) => void` | Toggles autoclear preference |
| `onCopyBatch` | `() => void` | Joins batch items by delimiter, copies to clipboard, and adds history item |
| `onClearBatch`| `() => void` | Empties batch queue |
| `onRemoveItem`| `(index: number) => void` | Removes specific item at index |
| `onMoveItemUp` / `moveBatchItemUp` | `(index: number) => void` | Reorders item up (boundary protected at index 0) |
| `onMoveItemDown` / `moveBatchItemDown` | `(index: number) => void` | Reorders item down (boundary protected at index N-1) |
| `onBulkImport`| `(rawText: string) => void` | Splits multiline text and appends non-empty lines to batchQueue |

#### Critical DOM Selectors & Data Attributes
- **Container**: `#batchDrawer`, `[data-testid="batch-drawer"]`, `.batch-drawer`
- **Backdrop Overlay**: `#backdrop`, `[data-testid="drawer-overlay"]`, `.drawer-backdrop`
- **Counter Badges**: `#bbcount` (visible pill), `#bcount` (`[data-testid="batch-count"]`)
- **Close Trigger**: `#bclose`
- **Delimiter Selector**: `#joinSel`, `[data-testid="delimiter-select"]`, `select[name="delimiter"]`
- **Autoclear Toggle**: `#autoclear`, `[data-testid="autoclear-checkbox"]`, `input[name="autoclear"]`
- **Item List**: `#blist`
- **Item Rows**: `.bitem`, `[data-testid="batch-item"]`, `[data-bi="{idx}"]`
- **Item Text**: `.bt`, `[data-testid="batch-item-text"]`
- **Reorder Buttons**:
  - Move Up: `.bup`, `[data-mvup="{idx}"]`, `[data-mup="{idx}"]`, `[data-up="{idx}"]`, `[data-act="moveup"]`, `[data-testid="move-up-{idx}"]`
  - Move Down: `.bdn`, `[data-mvdn="{idx}"]`, `[data-mdown="{idx}"]`, `[data-down="{idx}"]`, `[data-act="movedown"]`, `[data-testid="move-down-{idx}"]`
- **Single Item Copy**: `.bcopy-item`, `[data-bc="{idx}"]`
- **Remove Item**: `.brm-item`, `[data-rm="{idx}"]`, `[data-testid="remove-batch-item-{idx}"]`
- **Footer Actions**:
  - Copy Batch All: `#bcopy`, `[data-testid="copy-batch-btn"]`, inner span `#bcopycount`
  - Clear Queue: `#bclear`, `[data-testid="clear-batch-btn"]`
  - Bulk Import Trigger: `#bpaste`
  - Bulk Import Dialog: `textarea[placeholder*="Paste defect lines"]`, button with text `"Import Lines"`

---

### 2.2 Floating Toasts & Feedback System

- **Primary Source Files**:
  - `src/components/ToastsContainer.tsx`
  - `src/utils/notifications.ts`
  - `src/hooks/useQCState.ts` (lines 205–228)
  - `src/index.css` (lines 97–258)
- **External Package**: `sonner` (`^2.0.1`)

#### Toast Architecture & Lifecycle
1. **Dispatcher**: `showNotice()`, `createToastNotice()`, and `showFloatingToast()` in `src/utils/notifications.ts`.
2. **Dual-Stack Delivery**:
   - Directly triggers Sonner `toast(message, options)` for top-level toasts.
   - Synchronizes with React state `toasts: ToastNotice[]` in `useQCState` for deterministic in-DOM rendering in `#toasts`.
3. **Auto-Dismiss & Progress Animation**:
   - Default timer: **4,200ms** (4.2s).
   - `.tprogress` animation: `toastProgress 4.2s linear forwards`.
   - Hover state pauses progress bar (`animation-play-state: paused`) and hover elevation gives `transform: translateY(-2px)`.
4. **Contextual Lucide Icon Resolution**:
   - `getToastIcon(msg, warn)` derives appropriate Lucide icon element based on message content:
     - Warning (`warn === true`): `AlertTriangle` (amber-500)
     - Copy (`"copied"`, `"copy"`): `Copy` (stone-200)
     - Pin (`"pinned"`, `"starred"`): `Pin` (amber-400)
     - Batch (`"added"`, `"batch"`): `Plus` (emerald-400)
     - Delete (`"deleted"`, `"remove"`, `"cleared"`): `Trash2` (red-400)
     - Undo (`"restored"`, `"undo"`): `ArrowBackUp` (blue-400)
     - Edit (`"saved"`, `"updated"`, `"edit"`): `Pencil` (stone-300)
     - Export / Import (`"export"`, `"download"`, `"import"`, `"upload"`): `Download` / `Upload` (stone-300)
     - Reset (`"reset"`): `Refresh` (zinc-400)
     - Default: `Check` (stone-200)

#### Critical DOM Selectors & Data Attributes
- **Toast Container**: `#toasts`, `.toasts-container`
- **Toast Item**: `.toast`, `.warn` (if error/warning), `[data-testid="floating-toast"]`, `[data-testid="toast-pill"]`
- **Icon Container**: `.ticon`, `[data-testid="toast-icon"]`
- **Message Content**: `.toast-message`, `span`
- **Action Button**: `.tact`, `[data-testid="toast-action"]` (e.g. "Undo" on delete)
- **Progress Timer**: `.tprogress`, `[data-testid="toast-progress"]`

---

## 3. Milestone R4 Test Suite Architecture & Build System

### 3.1 Test Suite Inventory & Structure

| # | Test File | Test Suite Name | Test Count | Key Coverage Focus |
|---|---|---|:---:|---|
| 1 | `tests/tier1-features.test.js` | Tier 1: Feature Coverage Tests (Features 1–12) | 63 | F1–F12 happy path (Theme, Tropes, Pills, Icons, Borders, Nav, Folders, Header, Toasts & Batch, Type Safety, Build, E2E) |
| 2 | `tests/tier2-boundary.test.js` | Tier 2: Boundary & Corner Case Hardening Suite | 64 | F1-B1 to F12-B5 boundary edge cases (corrupt storage, boundary reorder, 50+ queue, XSS, fuzzy match, leak prevention) |
| 3 | `tests/tier3-combinations.test.js` | Tier 3: Cross-Feature Pairwise Combination Tests | 12 | Pipelines 1–12 pairwise feature cross-talk (e.g. Theme + Pin Folders, Color Pills + Batch Drawer, Spotlight + Batch) |
| 4 | `tests/tier4-workloads.test.js` | Tier 4: Real-World Workload & Application Scenarios | 6 | Scenarios 1–6 end-to-end user workflows (Full Quality Inspector Audit, Multi-Category Batch Export, Spotlight search) |
| 5 | `tests/tier5-hardening.test.js` | Tier 5: White-Box Adversarial Stress Testing | 9 | Extreme localStorage corruption recovery, XSS sanitization, 50+ folder scale, batch concurrency reordering, theme toggle |
| 6 | `tests/m3-challenger-verification.test.js` | Milestone M3 Empirical Challenger Verification | 8 | View switcher stress (30x), delimiter testing, reorder boundaries, Onyx toast progress bar, pin folder persistence |
| 7 | `tests/m3-pin-folders.test.js` | Milestone 3: Custom Pin Folders & State Layer | 5 | Legacy `qc-pins` auto-migration, `qc-pin-folders` loading, 14-key preservation, theme class attribute management |
| 8 | `tests/m2-challenger-stress.test.ts` | Milestone 2 Empirical Challenger Stress Harness | 8 | Hex colors integrity, dirty strings/case lookup stress, badge styling RGBA, Lucide map, DOM selector integrity |
| 9 | `tests/m2-empirical-stress-harness.test.ts` | Milestone 2 Iteration 3 Empirical Challenger Stress | 5 | Whitespace trimming on colors, 10k lookup loop, 30x rapid view toggle, whitespace query fuzzing |
| 10 | `tests/m2-challenger-latency-stress.test.ts` | Milestone 2 Iteration 3 Latency Stress Tests | 3 | Scenario 6 per-op latency (<1000ms), 15 category rapid switch latency (<1000ms), single search latency (<1000ms) |
| 11 | `tests/searchEngine.test.ts` | Milestone 2 Search Engine Unit Tests | 14 | Lev distance, subseq matching, approx flag, category filters, code sub-chips, typo tolerance, alias expansion |
| 12 | `src/utils/searchEngine.test.ts` | Unit tests for search engine algorithm | 6 | Levenshtein primitives, approximate score boundaries, alias mappings |
| **TOTAL** | **12 test files** | **58 test suites** | **203** | **100% Pass Rate (203/203 pass, 0 fail, 0 skipped)** |

---

### 3.2 Test Harness Execution Architecture (`tests/harness.js`)

1. **JSDOM React Bundling**:
   - `getCompiledAppCode()` bundles `src/main.tsx` into an IIFE using `esbuild.buildSync` with ES2020 target and cached memory bundle.
   - Script element is injected into JSDOM instance with `runScripts: 'dangerously'`.
2. **Mock Injections**:
   - `window.matchMedia`: Injected before parse with no-op listener mocks.
   - `window.scrollTo`: No-op function mock.
   - `window.localStorage`: Injected `MockLocalStorage` class with key-value map and `getItem`/`setItem`/`removeItem`/`clear`.
   - `window.navigator.clipboard`: Mock with `writeText(text)` and `readText()` recording into `copiedText`.
   - `window.navigator.vibrate`: Mock recording invocation count into `vibrateCount`.
   - `window.URL.createObjectURL` / `revokeObjectURL`: Mock returning `'blob:mock-export-url'`.
   - `window.flushSync`: Attached React 19 DOM flush helper to execute state updates synchronously within JSDOM.

---

### 3.3 Strict LocalStorage 14-Key Schema Registry

All 14 localStorage keys are strictly asserted across Tiers 1, 2, 3, 5, and M3 tests:

| Storage Key | Schema Type | Default / Fallback | Tested In |
|---|---|---|---|
| `qc-pins` | `Array<string \| number>` | `[]` | F7.4, F10.5, M3, T5 |
| `qc-pin-folders` | `Array<CustomPinFolder>` | `[{ id: 'starred', name: 'Starred Defects', ... }]` | F7.1–F7.5, M3, T3, T5 |
| `qc-recents` | `Array<string>` | `[]` | F10.5, T5 |
| `qc-history` | `Array<string>` | `[]` | F10.5, T5 |
| `qc-batch` | `Array<string>` | `[]` | F9.2, F10.5, T2, T5 |
| `qc-join` | `string` (`DelimiterKey`) | `'nl'` | F9.3, F10.5, T2 |
| `qc-autoclear` | `boolean` | `true` | F9.4, F10.5, T2 |
| `qc-edits` | `Record<string, { t, c, n }>`| `{}` | F10.5, T5 |
| `qc-dels` | `Array<string \| number>` | `[]` | F10.5, T5 |
| `qc-custom` | `Array<QCItem>` | `[]` | F10.5, T5 |
| `qc-appearance` | `Object` | `{ theme, layout, radius, density, ... }` | F10.5, T5 |
| `qc-theme` | `string` (`'dark' \| 'light' \| 'auto'`) | `'dark'` | F1.5, F10.5, M3, T5 |
| `qc-density` | `string` (`'cozy' \| 'compact' \| 'spacious'`) | `'cozy'` | F10.3, F10.5, T5 |
| `qc-sort` | `string` | `'num'` | F10.5, T5 |

---

## 4. Fragile Matchers & Selector Safety Analysis

When implementing UI/UX polish across Milestones R1–R3, the following selectors and text matchers must be preserved:

| Component / Area | Fragile Selectors & Text Matchers to Preserve | Why It Matters |
|---|---|---|
| **Delimiter Selector** | `#joinSel`, `[data-testid="delimiter-select"]`, `select[name="delimiter"]` with options `nl`, `comma`, `semi`, `space`, `pipe`, `bullet` | `harness.js` `setDelimiter()` directly sets value on this select element. |
| **Autoclear Toggle** | `#autoclear`, `[data-testid="autoclear-checkbox"]`, `input[name="autoclear"]` | `harness.js` `toggleAutoClear()` queries this checkbox element. |
| **Batch Reorder Buttons** | `[data-mvup]`, `[data-mup]`, `[data-up]`, `[data-mvdn]`, `[data-mdown]`, `[data-down]`, `[data-act="moveup"]`, `[data-act="movedown"]` | Reordering tests invoke `app.moveBatchItemUp(i)` / `app.moveBatchItemDown(i)` which query these attributes. |
| **Bulk Paste Dialog** | Button `#bpaste`, `textarea[placeholder*="Paste defect lines"]`, button with text `"Import Lines"` | `tests/m3-challenger-verification.test.js` line 160–190 queries by placeholder and button text. |
| **Toast Structure** | `#toasts .toast`, `.warn`, `.ticon`, `[data-testid="toast-icon"]`, `.tprogress`, `[data-testid="toast-progress"]`, `.tact`, `[data-testid="toast-action"]` | `harness.js` `getToasts()` and `triggerToastAction()` query these exact classnames and test IDs. |
| **Defect Cards / Rows** | `.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.fz`, `[data-act="pin"]`, `[data-act="add"]` | `harness.js` `getVisibleItems()`, `clickItemRow()`, `clickItemAction()` rely on these container classnames and action buttons. |
| **View Switcher** | `#setLayout`, `[data-testid="view-switcher"]`, buttons with `[data-v="list|grid|table"]`, `[data-value="list|grid|table"]` | `harness.js` `setLayoutView()` and test assertions check `data-v` attributes and container `data-layout`. |
| **Search Bar & Spotlight**| `#search`, `[data-testid="header-search-input"]`, `#clearBtn`, `[data-testid="clear-search-btn"]`, `#spotlightBtn`, `[data-testid="spotlight-trigger"]` | `harness.js` `search()`, `clearSearch()`, `openSpotlightModal()` query these elements. |
| **Folder Manager UI** | `button[title="Create New Pin Folder"]`, `input[placeholder="Folder name..."]`, `form button[type="submit"]` | Tier 3 and Tier 4 folder creation helpers rely on these exact titles and placeholders. |

---

## 5. Proposed Design Recommendations for Milestone R3

1. **Batch Drawer Polish**:
   - **Segmented Control Delimiter UI**: Provide sleek segmented buttons (`\n`, `,`, `;`, `space`) for visual UX while keeping the underlying `#joinSel` `<select>` synchronized for test harness compatibility.
   - **Tactile Reordering & Micro-Interactions**: Smooth hover effects on arrow reorder buttons and delete buttons, clean spacing, and clear item index chips.
   - **Prominent 'Copy All' Action**: High-contrast, tactile CTA button with count badge and keyboard shortcut indicator.

2. **Floating Toasts Polish**:
   - **Minimalist Pill Design**: Refined warm stone pill geometry with subtle border accent, crisp Lucide icon, and smooth progress timer bar.
   - **Copy Preview & Auto-Dismiss**: Ensure clear copy text snippet preview (up to 35 characters) with smooth 4.2s timer countdown.

3. **Inline Micro-Interactions (R2)**:
   - When defect card/row is clicked, trigger a subtle border pulse and display a temporary inline `Copied ✓` badge transition that fades smoothly, complementing the floating toast.

---

## 6. Build & Test Verification Commands

- **Run All Tests**: `npm run test`
- **Run Individual Tiers**:
  - `npm run test:tier1`
  - `npm run test:tier2`
  - `npm run test:tier3`
  - `npm run test:tier4`
  - `npm run test:tier5`
- **Run TypeScript Lint Check**: `npm run lint` (`tsc --noEmit`)
- **Run Full Production Build**: `npm run build` (`tsc && vite build`)
