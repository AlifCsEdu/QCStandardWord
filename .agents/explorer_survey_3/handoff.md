# Step 0 Survey Handoff Report: State Management, Feature Inventory & UI Gap Analysis

**Agent**: Explorer 3 (State & Feature Explorer)  
**Working Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_survey_3`  
**Date**: 2026-08-09  

---

## 1. Observation

### 1.1 Project Structure & Codebase Overview
- **Root Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`
- **Source Files (`src/`)**:
  - `types/qc.ts`: Data types (`CategoryKey`, `SubCategoryCode`, `QCItem`, `CategoryInfo`, `CodeSubInfo`, `SearchResult`, `AppearanceSettings`, `ToastNotice`, etc.)
  - `data/qcData.ts`: 140 base defect wording items (`BASE_ITEMS`), 15 category definitions (`CATEGORIES`), 10 sub-category codes (`CODE_SUBS`), and search alias maps (`CATKEY`, `ALIAS`).
  - `hooks/useQCState.ts`: Primary application state hook managing pins, recents, batch queue, delimiters, autoclear, custom wording edits, deletions, custom items, and toasts.
  - `hooks/useAppearance.ts`: Display preferences hook managing theme, layout mode (`list`, `grid`, `table`), radius, text size, density, motion, accent, and sort option.
  - `utils/categoryColors.ts`: Category color mapping (`getCategoryColor`, `getCategoryBadgeStyle`).
  - `utils/searchEngine.ts`: Scoring & fuzzy match engine (`searchQCItems`).
  - `utils/clipboard.ts`: Haptic vibration and clipboard utilities.
  - `utils/notifications.ts`: Mantine notification wrapper.
  - `components/`: AppHeader, CategoryChips, CodeSubChips, DefectCard, WordingList, WordingGrid, WordingTable, WordingContainer, BatchDrawer, EditModal, EditToolbar, HistoryBar, SettingsModal, StatsDashboard, ToastsContainer.
  - `App.tsx`: Main React component wrapping MantineProvider, AppShell, Spotlight, Notifications, Affix, and custom UI components.
  - `package.json`: Dependencies include `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight`, `@tabler/icons-react`, `react`, `react-dom`. DevDependencies include `postcss-preset-mantine`, `vite`, `typescript`, `jsdom`, `wrangler`.

### 1.2 Data Structures & Defect Categories
1. **Defect Item (`QCItem`)**:
   ```ts
   // src/types/qc.ts:30-37
   export interface QCItem {
     id: string;            // Unique identifier e.g. "b2", "b31", "c17234..."
     n: number;             // Defect item number (1..140+)
     t: string;             // Defect wording text string
     c: CategoryKey;        // Category key identifier
     sub?: SubCategoryCode; // Optional sub-code for 'codes' category
     custom?: boolean;      // True if user-created custom item
   }
   ```
2. **Defect Categories (`CategoryKey`)** (15 total: 13 standard + 2 virtual):
   - Standard: `codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`, `all`
   - Virtual/Filters: `pinned`, `recent`
3. **Sub-Category Codes (`SubCategoryCode`)** (10 total for `codes` category):
   - `ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC`
4. **Base Defect Dataset (`BASE_ITEMS`)**:
   - 140 static defect wording records defined in `src/data/qcData.ts:3-143`.

### 1.3 Active `localStorage` Keys & Persistence Logic
The application persists state across **13 distinct `localStorage` keys**:

| # | Key | Type | Description & Management Logic | Code Reference |
|---|---|---|---|---|
| 1 | `qc-pins` | `(string \| number)[]` | Array of pinned item IDs/numbers. Updated via `togglePin`. | `useQCState.ts:36` |
| 2 | `qc-recents` | `string[]` | Array of recently copied defect wording strings (max 20 items). Updated via `pushRecent`. | `useQCState.ts:40` |
| 3 | `qc-history` | `string[]` | Backup storage key for copied wording history. Maintained in tandem with `qc-recents`. | `useQCState.ts:42,204` |
| 4 | `qc-batch` | `string[]` | Queued items in batch drawer. Validates type is Array on parse. | `useQCState.ts:49` |
| 5 | `qc-join` | `DelimiterKey` | Batch copy join delimiter (`'nl'`, `'comma'`, `'semi'`, `'space'`, `'pipe'`, `'bullet'`). | `useQCState.ts:66` |
| 6 | `qc-autoclear` | `boolean` | Flag to automatically clear batch queue upon copying (`'true'` / `'false'`). | `useQCState.ts:84` |
| 7 | `qc-edits` | `Record<string, {t, c, n}>` | Map of user edits to default `BASE_ITEMS` keyed by item ID. | `useQCState.ts:96` |
| 8 | `qc-dels` | `(string \| number)[]` | Array of deleted item IDs (soft deletions applied over base/custom items). | `useQCState.ts:100` |
| 9 | `qc-custom` | `QCItem[]` | Array of user-added custom defect wording items. | `useQCState.ts:104` |
| 10 | `qc-appearance` | `AppearanceSettings` | Serialized JSON of full display settings object. | `useAppearance.ts:46` |
| 11 | `qc-theme` | `string` | Saved color scheme preference (`'light'`, `'dark'`, `'auto'`). Set on `<html>` `data-theme`. | `useAppearance.ts:47,64` |
| 12 | `qc-density` | `string` | Saved density preference (`'cozy'`, `'compact'`). Set on `<html>` `data-density`. | `useAppearance.ts:48,65` |
| 13 | `qc-sort` | `SortOption` | Saved wording sort order (`'default'`, `'alpha'`, `'num'`). | `useAppearance.ts:58,77` |

---

## 2. Logic Chain

### 2.1 State Management & Data Flow Architecture
1. `useQCState` acts as the single source of truth for defect wording data. It reads `BASE_ITEMS` and merges active user edits (`qc-edits`), removes deleted items (`qc-dels`), and appends custom defect items (`qc-custom`) to produce `activeItems`.
2. `searchQCItems` takes `activeItems`, the current query string, category filter, sub-code filter, `pinsSet`, and `recents` to output `searchResults` with match highlights and approximate search scoring (`fz`).
3. User interactions (pinning, batching, copying, editing, deleting) update `localStorage` synchronously via safe wrapper helpers (`safeStorageSet`), ensuring offline persistence.

### 2.2 Feature Inventory
1. **Search & Navigation**: Top search bar with instant query matching, alias expansion (e.g. `display -> screen`, `spen -> pen`), clear button (`✕`), and Cmd+K / Ctrl+K Spotlight modal.
2. **Category & Sub-code Filtering**: Left sidebar navigation chips for 13 defect categories + 2 virtual categories (`pinned`, `recent`), plus conditional sub-code pill row (`CODE_SUBS`) when `codes` category is selected.
3. **View Switching**: Segmented control switching between `list`, `grid`, and `table` layouts.
4. **Wording Item Actions**: Single-click copy to clipboard with toast notification and recent history logging; toggle pin (`★`/`☆`); add to batch queue (`+ Batch`); inline Edit/Delete buttons in Edit Mode.
5. **Batch Drawer**: Right-side drawer managing queued defect lines, batch copy formatted by selected delimiter, item reordering (move up/down), single item removal, clear queue, auto-clear toggle, and bulk import text modal.
6. **Edit Mode Toolbar & Modals**: Global Edit Mode toggle, Add Custom Defect Modal, Edit Wording Item Modal, Export Wording Changes (JSON download), Import Wording Changes (JSON upload), and Reset Wording Changes to defaults.
7. **Appearance Preferences**: Settings Modal controlling theme, density, layout, border radius, text size, animation motion, and accent color.
8. **Toast Notifications & Utilities**: Sonner/Mantine toasts, copy history feed bar, and floating scroll-to-top affix button.

### 2.3 Requirement R2 Gap Analysis: Iconography & Category Color Coding
- **Current Finding**: Iconography relies on `@tabler/icons-react` (`IconSearch`, `IconCopy`, `IconTrash`, `IconFileImport`, `IconX`, `IconArrowUp`). Category chips and defect cards rely purely on colored text and background CSS opacity (`getCategoryBadgeStyle`).
- **Required Changes for R2**:
  - Replace `@tabler/icons-react` entirely with `lucide-react`.
  - Assign a specific Lucide icon to every category:
    - `screen`: `Monitor`
    - `camera`: `Camera`
    - `buttons`: `Sliders` / `ToggleLeft`
    - `battery`: `BatteryCharging`
    - `backcover`: `Smartphone`
    - `locks`: `Lock`
    - `pen`: `PenTool`
    - `water`: `Droplets`
    - `audio`: `Volume2`
    - `body`: `Cpu` / `Box`
    - `system`: `Activity`
    - `codes`: `QrCode` / `Hash`
    - `custom`: `FolderPlus`
    - `pinned`: `Star`
    - `recent`: `Clock`
  - Implement theme-aware visual badges with category icons and distinct left border accents (e.g., `border-l-4` with category color) for defect cards and table rows in the 2026 Zinc dark theme palette (`#09090b` background, `#18181b` cards, `#27272a` borders, `#06b6d4` cyan accent).

### 2.4 Requirement R3 Gap Analysis: Custom User Pin Categories & Favorites Folders
- **Current Finding**: Pinned items (`qc-pins`) are currently stored as a flat array of item IDs. Clicking `★` / `☆` toggles membership in a single global `pinned` set. There is no concept of named user folders or custom pin categories.
- **Required Changes for R3**:
  - **Data Schema Expansion**: Define `CustomPinFolder` interface:
    ```ts
    export interface CustomPinFolder {
      id: string;
      name: string;      // e.g. "Screen Inspection", "Common Defects"
      color?: string;
      itemIds: string[]; // List of QCItem IDs starred into this folder
    }
    ```
  - **Storage Key**: Introduce `qc-pin-folders` key in `localStorage` while preserving backward compatibility with legacy `qc-pins` (migrating legacy pins into a default "Starred" folder).
  - **User Experience & Management**:
    - Add UI to create, rename, and delete custom pin folders.
    - Enhance pin button action on defect cards (e.g. dropdown menu or quick-selector modal) allowing users to pin an item to a specific folder or multiple custom folders.
    - Render custom user pin folders in the sidebar navigation alongside standard categories with item count badges.
    - Filter defect wording display by active custom pin folder.

---

## 3. Caveats
- **Read-Only Scope**: This report is produced under read-only investigation rules. No source code modifications were performed by Explorer 3.
- **Legacy Test Suite**: The node test suite (`tests/`) uses JSDOM harness scripts (`tests/harness.js`) which search for specific Mantine components and HTML IDs. Migration to shadcn/ui and Radix components must retain required HTML IDs (`#search`, `#spotlightBtn`, `#batchDrawer`, `#bcount`, `#joinSel`, `#autoclear`, `#blist`, `#bcopy`, `#bclear`, `#bpaste`, etc.) to maintain test suite compatibility.

---

## 4. Conclusion
The QC Standard Wording codebase is well-structured with clear separation between state hooks (`useQCState`, `useAppearance`), data structures (`qcData.ts`, `qc.ts`), and presentation components.

To fulfill the project overhaul and Mantine to shadcn/ui migration:
1. **State Persistence**: Expand `useQCState` to manage `qc-pin-folders` for requirement R3 while preserving existing 13 localStorage keys.
2. **Iconography & Styling (R2)**: Replace `@tabler/icons-react` with `lucide-react`, map dedicated Lucide icons to all 15 categories, and add theme-aware category left border accents and badge styling.
3. **Custom Pin Folders (R3)**: Implement custom folder creation, folder renaming/deletion, multi-folder item starring, and sidebar tab integration.

---

## 5. Verification Method
1. **File Inspection**:
   - `src/types/qc.ts` (lines 1-90) for data structure definitions.
   - `src/hooks/useQCState.ts` (lines 35-106) for 13 localStorage keys.
   - `src/data/qcData.ts` (lines 145-236) for category definitions.
2. **Test Command Execution**:
   - Run `npm test` to verify current test suite execution.
