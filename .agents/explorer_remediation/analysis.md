# Comprehensive Remediation Strategy & Architecture Analysis

**Agent**: Explorer Remediation (Audit Remediation & Feature Architecture Explorer)  
**Date**: 2026-08-07  
**Target Path**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`  

---

## 1. Executive Summary & Audit Finding Analysis

Following the Forensic Audit Report (`.agents/auditor_m1_2/subagent_audit_report.md`), three critical findings were identified:

1. **Production React Codebase Stub (`src/App.tsx`)**:
   - `src/App.tsx` is currently a 51-line static placeholder component rendering static placeholder text.
   - None of the required features from `ORIGINAL_REQUEST.md` (139+ QC defect entries, 13 categories, panel sub-category chips, typo-tolerant search engine, batch drawer, custom delimiters, pinning system, inline edit mode, layout view transitions, appearance/theme settings, or localStorage persistence) are implemented in React.

2. **Test Harness Decoupling (`tests/harness.js`)**:
   - `tests/harness.js` currently reads and parses `standardwording.html` (the legacy single-file HTML app) into JSDOM.
   - The React application in `src/` has 0% automated test coverage.

3. **Legacy Test Failures**:
   - In previous audit runs, `tests/tier3-combinations.test.js` failed 2 tests (`Pipeline 2` and `Pipeline 3`) when executing against `standardwording.html` due to legacy search scoring and DOM state synchronization bugs in `standardwording.html`.
   - Unit test verification of `src/utils/searchEngine.ts` confirms that the pure TypeScript search engine produces exact 1-item matches for `VIPCUSTOMDEFECT999` and correctly handles custom item deletion/undo restoration.

---

## 2. Complete React Application Architecture (`src/`)

The React application will be constructed under `src/` using React 18/19, Vite, TypeScript (STRICT mode), and Mantine UI v7 (`@mantine/core`, `@mantine/hooks`, `@tabler/icons-react`).

```
src/
├── types/
│   └── qc.ts                # Data models, category keys, search contracts, appearance types
├── data/
│   └── qcData.ts            # 140 base defect items, 15 categories, 10 code subchips, synonyms
├── utils/
│   ├── searchEngine.ts      # Bounded Levenshtein, subsequence matching, substring highlighting
│   └── clipboard.ts         # Clipboard write/read helpers with fallback
├── hooks/
│   ├── useQCState.ts        # Central state management hook with localStorage persistence
│   └── useAppearance.ts     # Theme (light/dark), accent color, radius, density, font size
├── components/
│   ├── AppHeader.tsx        # Top header, branding, edit mode toggle, settings, download
│   ├── AppNavbar.tsx        # Category navigation menu with item counters
│   ├── CategoryChips.tsx    # Scrollable category chips & panel sub-code chips
│   ├── WordingList.tsx      # List view layout rendering (.row)
│   ├── WordingGrid.tsx      # Responsive card grid layout rendering (.gcard)
│   ├── WordingTable.tsx     # Compact table view layout rendering (.trow)
│   ├── WordingContainer.tsx # Container switching between list, grid, table view modes
│   ├── BatchDrawer.tsx      # Slide-out batch operations drawer
│   ├── EditModal.tsx        # Add / Edit wording modal form
│   ├── SettingsModal.tsx    # Appearance & layout settings modal form
│   ├── ToastsContainer.tsx  # Toast feedback notifications with Undo action support
│   └── EditToolbar.tsx      # Edit mode action bar (Add, Export, Import, Reset)
├── App.tsx                  # Main Mantine AppShell application layout
├── main.tsx                 # Application root & MantineProvider setup
└── index.css                # CSS variables, PostCSS rules, animations
```

---

### Detailed Module Specifications

#### 2.1 Data Models & Contracts (`src/types/qc.ts`)
```ts
export type CategoryKey =
  | 'all'
  | 'codes'
  | 'screen'
  | 'camera'
  | 'buttons'
  | 'battery'
  | 'backcover'
  | 'locks'
  | 'pen'
  | 'water'
  | 'audio'
  | 'body'
  | 'system'
  | 'pinned'
  | 'recent';

export type SubCategoryCode =
  | 'ALL'
  | 'FCPB'
  | 'FCPW'
  | 'FCPC'
  | 'RCPB'
  | 'RCPW'
  | 'RCPC'
  | 'FCDS'
  | 'RCDS'
  | 'PC';

export interface QCItem {
  id: string;      // Base items: 'b2'..'b140'; Custom items: 'c' + timestamp
  n: number;       // Sequential entry display number
  t: string;       // Defect wording text
  c: CategoryKey;  // Category key
  sub?: SubCategoryCode; // Optional panel sub-category code
  custom?: boolean;      // True if user-created custom item
}

export interface CategoryInfo {
  id: CategoryKey;
  name: string;
  color: string;
  desc: string;
}

export interface SearchResult {
  item: QCItem;
  score: number;
  isApprox: boolean;
  highlightedText: string;
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export type LayoutMode = 'list' | 'grid' | 'table';
export type RadiusOption = 'sharp' | 'soft' | 'round';
export type TextSizeOption = 's' | 'm' | 'l';
export type DensityMode = 'cozy' | 'compact';
export type MotionMode = 'full' | 'reduced';
export type DelimiterKey = 'nl' | 'comma' | 'semi' | 'space';

export interface AppearanceSettings {
  layout: LayoutMode;
  radius: RadiusOption;
  textsize: TextSizeOption;
  accent: string;
  density: DensityMode;
  motion: MotionMode;
}

export interface ToastNotice {
  id: string;
  msg: string;
  warn?: boolean;
  action?: {
    label: string;
    fn: () => void;
  };
}
```

---

#### 2.2 QC Dataset & Categories (`src/data/qcData.ts`)
- Retains all 140 base items (`b2` through `b140`).
- Defines 15 category descriptors:
  - 13 main categories: `all`, `codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`.
  - 2 virtual categories: `pinned` (user starred items) and `recent` (copy history feed).
- 10 panel code subchips: `ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC`.
- Synonym and alias dictionaries: `CATKEY` and `ALIAS` maps.

---

#### 2.3 Typo-Tolerant Search Engine (`src/utils/searchEngine.ts`)
- `lev(a, b, cap)`: Bounded Levenshtein distance algorithm capped at `cap`.
- `subseq(t, h)`: Sub-sequence matching for character skips.
- `norm(s)`: String normalization (lowercasing, whitespace removal).
- `isApprox(score)`: Evaluates if match score is fuzzy (`0 < score < 80`).
- `enrichItem(item)`: Pre-calculates tokens for search acceleration.
- `highlightSegments(text, query)`: Yields array of text segments with matching flags for UI `<mark>` rendering.
- `highlightText(text, query)`: Returns HTML string with `<mark>` tags around matched tokens.
- `searchQCItems(items, query, category, subCategory, pinsSet, recentsList)`:
  - Filters by category (including `pinned` and `recent` virtual views).
  - Filters by panel code subcategory when `codes` is active.
  - Scores exact matches, token hits, alias expansions, and fuzzy Levenshtein distance.
  - Returns sorted array of `SearchResult`.

---

#### 2.4 Central State Management Hook (`src/hooks/useQCState.ts`)
Manages all dynamic application state and persists changes to `localStorage`:
- **State Keys**:
  - `qc-pins`: `string[]` (Set of item IDs).
  - `qc-batch`: `string[]` (Ordered list of wording texts queued in batch).
  - `qc-recents`: `string[]` (History list of up to 20 copied wording texts).
  - `qc-custom`: `QCItem[]` (Array of user-created custom entries).
  - `qc-edits`: `Record<string, { t: string; c: CategoryKey; n: number }>` (Base item modifications).
  - `qc-dels`: `string[]` (Deleted base item IDs).
  - `qc-join`: `DelimiterKey` (`'nl'`, `'comma'`, `'semi'`, `'space'`).
  - `qc-autoclear`: `boolean` (Auto clear batch queue after copy).
  - `qc-sort`: `'default' | 'alpha' | 'num'`.
  - `qc-density`: `DensityMode` (`'cozy'` | `'compact'`).
  - `qc-theme`: `'light'` | `'dark'` | `'auto'`.
  - `qc-appearance`: `AppearanceSettings`.

- **Exposed Actions**:
  - `activeItems`: Computes final dataset by applying `qc-dels` exclusions and `qc-edits` overrides to `BASE_ITEMS`, then appending `qc-custom`.
  - `searchResults`: Result of running `searchQCItems(activeItems, searchQuery, selectedCategory, selectedSubCategory, pinsSet, recentsList)`.
  - `togglePin(id)`: Adds/removes item ID in `qc-pins`.
  - `addToBatch(text)`: Pushes wording text to `qc-batch` if not already present.
  - `removeFromBatch(index)`: Removes item at index from `qc-batch`.
  - `clearBatch()`: Empties `qc-batch`.
  - `copyBatch()`: Formats queue using selected delimiter (`\n`, `, `, `; `, `' '`), copies to clipboard via `navigator.clipboard.writeText`, clears queue if `autoclear` is enabled.
  - `copySingleItem(text)`: Writes to clipboard, updates `qc-recents`, triggers success toast notification.
  - `pushRecent(text)`: Prepends `text` to `qc-recents` (capped at 20 items).
  - `clearRecents()`: Resets `qc-recents` to empty array.
  - `toggleEditMode()`: Toggles inline edit mode state.
  - `saveWordingItem(targetItem, text, category, number)`: Creates new item in `qc-custom` or updates existing item in `qc-edits` / `qc-custom`.
  - `deleteWordingItem(item)`: Deletes custom item or adds base item ID to `qc-dels`. Shows toast with 4.2s "Undo" action.
  - `undoDelete(snapshot)`: Restores state from snapshot.
  - `exportChanges()`: Serializes `qc-edits`, `qc-dels`, and `qc-custom` into downloadable JSON file named `qc-wording-changes.json`.
  - `importChanges(jsonPayload)`: Merges imported JSON payload into `qc-edits`, `qc-dels`, `qc-custom`.
  - `resetAllChanges()`: Resets `qc-edits`, `qc-dels`, `qc-custom` to default state.

---

#### 2.5 Component Hierarchy & DOM Structure Standards

To ensure complete compatibility with the test suite:

1. **`AppHeader.tsx`**:
   - Header bar with app title, version badge.
   - Theme toggle button (Light/Dark).
   - Edit mode button: `#editBtn` (toggles class `.on`).
   - Settings modal button: `#setBtn`.
   - Download offline copy button: `#dlBtn`.

2. **`AppNavbar.tsx` & `CategoryChips.tsx`**:
   - Category navigation: `#nav` container, with buttons having `data-cat="${catId}"`.
   - Category chips: `#chips` container, with chips having `data-cat="${catId}"`.
   - Panel code subchips: `#subchips` container, with chips having `data-sub="${subCode}"`.
     - Container must have class `.show` when `selectedCategory === 'codes'`.
   - History bar: `#histbar` container (flex when `recents.length > 0`), `#hchips` container with `.hchip` elements having `data-hcopy="${text}"` and `.htxt` text. Clear history button: `#hclearAll`.

3. **`EditToolbar.tsx`**:
   - Toolbar strip: `#editstrip` container (has class `.show` when edit mode is active).
   - Add button: `#addBtn`.
   - Export button: `#exportBtn`.
   - Import button: `#importBtn` (triggers hidden `#importFile` file input).
   - Reset button: `#resetBtn` (implements two-stage confirmation: first tap adds `.arm` class and changes text to `"Tap again to confirm"`, second tap executes reset).

4. **`WordingContainer.tsx` / `WordingList.tsx` / `WordingGrid.tsx` / `WordingTable.tsx`**:
   - List wrapper: `#listwrap` container with classes `listwrap ${layoutMode}` (`list`, `grid`, or `table`).
   - Item elements:
     - List view: `.row` elements with `data-id="${item.id}"`.
     - Grid view: `.gcard` elements with `data-id="${item.id}"`.
     - Table view: `.trow` elements with `data-id="${item.id}"`.
   - Internal row structure:
     - `.rnum`: `#${item.n}` or `${item.n}`.
     - `.rtxt`: text with `<mark>` highlighted substring and fuzzy match indicator `.fz` (`≈`) when `isApprox` is true.
     - `.rpill`: category name badge.
     - `.racts`: action buttons wrapper:
       - `[data-act="pin"]`: Pin button (has class `.pinned` when pinned).
       - `[data-act="add"]`: Add to batch queue button.
       - `[data-act="edit"]`: Edit wording button (rendered when edit mode is active).
       - `[data-act="del"]`: Delete wording button (rendered when edit mode is active).
   - Search input: `#search` input element.
   - Search clear button: `#clearBtn` (adds class `.show` when search query is non-empty).
   - Count label: `#countLabel`.
   - Empty state label: `#empty`.

5. **`BatchDrawer.tsx`**:
   - Slide-out drawer or overlay.
   - Batch counter badges: `#bcount`, `#bbcount`, `#bcopycount`.
   - Batch list container: `#blist`.
     - Items: `.bitem` elements with `data-bi="${index}"`.
     - Item copy button: `[data-bc="${index}"]`.
     - Item remove button: `[data-rm="${index}"]`.
   - Delimiter select dropdown: `#joinSel` (values: `'nl'`, `'comma'`, `'semi'`, `'space'`).
   - Auto-clear checkbox: `#autoclear`.
   - Batch actions: `#bcopy`, `#bclear`, `#bclearTop`, `#bpaste`.
   - Drawer toggle buttons: `#batchBtn` (opens drawer), `#bclose` and `#backdrop` (close drawer).

6. **`EditModal.tsx`**:
   - Modal wrapper: `#modal` (has class `.open` when open).
   - Modal title: `#mtitle`.
   - Text input: `#mtext`.
   - Category select: `#mcat`.
   - Number input: `#mnum`.
   - Save button: `#msave`.
   - Cancel button: `#mcancel`.

7. **`SettingsModal.tsx`**:
   - Modal wrapper: `#setmodal` (has class `.open` when open).
   - Layout selector: `#setLayout` container with `[data-v="list"]`, `[data-v="grid"]`, `[data-v="table"]` buttons.
   - Segmented selectors: `#setRadius`, `#setDensity`, `#setText`, `#setMotion`, `#setAccent`.
   - Done button: `#setdone`.

8. **`ToastsContainer.tsx`**:
   - Toast container: `#toasts`.
   - Toast elements: `.toast` (with `.warn` class for warnings/deletions).
   - Action button: `.tact` (e.g., `"Undo"`).

---

## 3. Test Harness Refactoring Strategy (`tests/harness.js`)

To eliminate the dependency on legacy `standardwording.html` and achieve 100% test coverage over `src/`:

### 3.1 JSDOM & React Mounting Architecture

`tests/harness.js` will be updated to:
1. Boot JSDOM with an HTML template containing `<div id="root"></div>`.
2. Bundle/transpile `src/App.tsx` and dependencies on-the-fly using `esbuild` (`esbuild.buildSync` with ESM format and JSX transform).
3. Import the compiled React module dynamically.
4. Mount the React application into JSDOM `<div id="root"></div>` using `ReactDOMClient.createRoot`:
   ```js
   const root = ReactDOMClient.createRoot(dom.window.document.getElementById('root'));
   root.render(React.createElement(MantineProvider, null, React.createElement(App)));
   ```
5. Configure React event synthetic triggers in JSDOM:
   - Input event dispatchers using `Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set`.
   - Microtask flushing via `await waitAsync(30)` after user events.

### 3.2 Helper API Preservation

All existing helper methods in `tests/harness.js` will be preserved verbatim so that `tier1-features.test.js`, `tier2-boundary.test.js`, `tier3-combinations.test.js`, and `tier4-workloads.test.js` run without modification:
- `search(query)`
- `submitSearch(query)`
- `clearSearch()`
- `selectCategory(catId)`
- `selectSubCategory(subCode)`
- `getVisibleItems()`
- `clickItemRow(index)`
- `clickItemAction(index, action)`
- `getBatchItems()`
- `getBatchCount()`
- `setDelimiter(joinerKey)`
- `toggleAutoClear(checked)`
- `copyBatch()`
- `clearBatch()`
- `removeBatchItem(index)`
- `getRecentHistoryItems()`
- `clickRecentHistoryChip(index)`
- `clearRecentHistory()`
- `toggleEditMode()`
- `isEditModeActive()`
- `openAddModal()`
- `saveModalForm(text, category, number)`
- `cancelModal()`
- `getToasts()`
- `triggerToastAction(toastIndex)`
- `exportChanges()`
- `resetAllChanges()`
- `setLayoutView(layoutMode)`
- `getStorageJSON(key)`
- `getCopiedText()`
- `resetCopiedText()`
- `getVibrateCount()`

---

## 4. Remediation Implementation Steps

### Phase 1: Modular Component Construction (`src/`)
1. Refactor `src/types/qc.ts` to include full type definitions.
2. Verify `src/data/qcData.ts` and `src/utils/searchEngine.ts`.
3. Create `src/hooks/useQCState.ts` and `src/hooks/useAppearance.ts`.
4. Build Mantine UI components under `src/components/`:
   - `AppHeader.tsx`
   - `AppNavbar.tsx`
   - `CategoryChips.tsx`
   - `EditToolbar.tsx`
   - `WordingList.tsx`, `WordingGrid.tsx`, `WordingTable.tsx`, `WordingContainer.tsx`
   - `BatchDrawer.tsx`
   - `EditModal.tsx`
   - `SettingsModal.tsx`
   - `ToastsContainer.tsx`
5. Connect all components inside `src/App.tsx` using Mantine `AppShell`.

### Phase 2: Test Harness Refactoring (`tests/harness.js`)
1. Update `tests/harness.js` to bundle `src/App.tsx` via `esbuild` and render React into JSDOM.
2. Ensure input setters invoke native prototypes so React controlled state updates correctly.
3. Add `waitAsync` delays where React state updates process asynchronously.

### Phase 3: Verification & Build Pass
1. Run `npm run test` -> Verify all 32+ tests across Tier 1, Tier 2, Tier 3, Tier 4, and searchEngine pass cleanly.
2. Run `npm run build` -> Verify zero TypeScript compilation errors and clean Vite bundle output.

---

## 5. Verification Commands

1. **Test Suite Verification**:
   ```powershell
   npm run test
   ```
   *Success Condition*: All 32+ unit and integration tests pass with 0 failures.

2. **Production Build Verification**:
   ```powershell
   npm run build
   ```
   *Success Condition*: `tsc` passes without errors and `vite build` generates production assets in `dist/`.
