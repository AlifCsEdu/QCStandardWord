# 5-Component Handoff Report: Milestone R1 Investigation

**Agent**: Explorer 1 (`explorer_survey_1`)  
**Mission**: Investigate QC Standard Wording codebase for Milestone R1 (Layout De-Cluttering & Unified Header)  
**Date**: 2026-08-16  
**Parent Agent**: `e8fdfef6-5ec0-4309-84b9-2563f5e9ac1e`  

---

## 1. Observation

Direct codebase inspection revealed the following files, line locations, and architectural patterns:

1. **Overall Page Layout (`src/App.tsx:199-398`)**:
   - `App.tsx` sets up a root container (`div.min-h-screen.bg-[#121214].text-stone-100`) containing `AppHeader` (line 202), `aside#sidebarNav[data-testid="app-navbar"]` (lines 223-246) at `w-[260px]`, and `main.flex-1.min-w-0.flex.flex-col.bg-[#121214]` (lines 249-395).
   - In `main`, four stacked horizontal elements are rendered in sequence before items appear:
     - `StatsDashboard` (lines 251-261)
     - `HistoryBar` (lines 264-268)
     - `EditToolbar` (lines 271-277)
     - `WordingContainer` (lines 280-298) with `div#countLabel` (line 44 in `WordingContainer.tsx`).

2. **StatsDashboard (`src/components/StatsDashboard.tsx:42-103`)**:
   - Renders a full `Card#statsDashboard[data-testid="stats-dashboard"]` (`m-4 border-stone-800 bg-stone-900 shadow-xs`) with nested `CardContent` (`p-3 sm:p-4`), rendering "Inspection Dashboard", `{totalFilteredCount} matching` badge, Active Filter badges (`Cat: ...`, `Sub: ...`, `Query: ...`), and Status badges (`Pinned: {pinnedCount}`, `Batch: {batchCount}`).
   - It takes 70-90px vertical height and largely duplicates info from the sidebar and header.

3. **Top Header (`src/components/AppHeader.tsx:43-274`)**:
   - Renders `header#appHeader[data-testid="app-header"]` (`sticky top-0 z-40 w-full border-b border-stone-800 bg-[#121214] px-4 py-2.5 min-h-[60px]`).
   - Contains:
     - Left: Mobile hamburger menu toggle (`Menu`), Title ("QC Standard Wording"), Version badge (`v2.0`).
     - Center: Input `#search[data-testid="header-search-input"]`, clear button `#clearBtn[data-testid="clear-search-btn"]`, Spotlight modal trigger button `#spotlightBtn[data-testid="spotlight-trigger"]` (`⌘K`).
     - Right: View switcher `#setLayout[data-testid="view-switcher"]` with buttons `data-v="list"`, `data-v="grid"`, `data-v="table"`, Edit button `#editBtn`, Batch button `#batchBtn` with `#bcount`, Settings `#setBtn`, Offline download `#dlBtn`, Theme toggle `#themeBtn`.

4. **Sticky Sidebar (`src/components/CategoryChips.tsx:40-381` and `src/components/CodeSubChips.tsx:11-42`)**:
   - `CategoryChips.tsx` renders three sections:
     - Quick Views: `all`, `pinned`, `recent` (`data-cat="..."`, `data-testid="category-tab-..."`).
     - Pin Folders: Accordion with folder count, `FolderPlus` create button, inline folder creation form, and folder list (`data-folder="..."`, `data-testid="pin-folder-..."`, color dots, hover rename `Pencil`, hover delete `Trash2`).
     - Defect Categories: 13 categories (`codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`) with Lucide icons (`getCategoryIconComponent`), `border-l-4` indicator styling, and count badges (`span.rounded-full`).
   - `CodeSubChips.tsx` renders subchips `ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC` with `data-sub="..."` inside `div#subchips[data-testid="code-sub-chips"]`.

5. **State & LocalStorage Layer (`src/hooks/useQCState.ts` and `src/hooks/useAppearance.ts`)**:
   - Pure React state with custom hooks, completely synchronizing 14 `localStorage` keys (`qc-pins`, `qc-pin-folders`, `qc-recents`, `qc-history`, `qc-batch`, `qc-join`, `qc-autoclear`, `qc-edits`, `qc-dels`, `qc-custom`, `qc-appearance`, `qc-theme`, `qc-density`, `qc-sort`).
   - Levenshtein typo-tolerant search in `src/utils/searchEngine.ts`.

6. **Test Suite Baseline**:
   - Executing `npx tsx --test "tests/**/*.{js,ts}"` runs 203 tests across 58 suites: **203 passing, 0 failing, 0 errors**.
   - Executing `npm run build` runs `tsc && vite build`: **0 errors**, transforms 1693 modules, outputs PWA bundle.

---

## 2. Logic Chain

1. **De-Cluttering & Vertical Real Estate**:
   - *Observation 1 & 2*: `StatsDashboard` renders a heavy card container with multiple duplicate badges (`Cat`, `Sub`, `Query`, `Batch`, `Pinned`).
   - *Reasoning*: Converting `StatsDashboard` into a compact, integrated status summary strip (e.g. `139 Defects • 12 Categories • 3 Starred`) that retains `id="statsDashboard"` and `data-testid="stats-dashboard"` eliminates the stacked toolbar clutter and saves ~60-80px vertical height without breaking test queries.

2. **Top Header Unification**:
   - *Observation 3*: Header right action group contains 7 separate buttons that wrap awkwardly on medium viewports (`flex-wrap`).
   - *Reasoning*: A modernized 3-column layout (Brand / Centered Hero Search + ⌘K / View Switcher + Compact Action Cluster) will create an uncluttered, premium feel. Maintaining all DOM IDs (`#search`, `#clearBtn`, `#spotlightBtn`, `#setLayout`, `#editBtn`, `#batchBtn`, `#bcount`, `#setBtn`, `#dlBtn`, `#themeBtn`) preserves test harness compatibility.

3. **Sidebar Interaction Polish**:
   - *Observation 4*: Sidebar uses `border-l-4` indicators and count pills.
   - *Reasoning*: Refining active tab contrast, icon color alignment, smooth accordion transitions, and count pill typography will elevate the visual hierarchy while keeping `data-cat`, `data-sub`, `data-folder`, and `span.rounded-full` selectors intact.

---

## 3. Caveats

- **DOM Selectors Contract**: Automated test suites in `tests/` specifically query `#appHeader`, `[data-testid="app-header"]`, `#search`, `[data-testid="header-search-input"]`, `#clearBtn`, `[data-testid="clear-search-btn"]`, `#spotlightBtn`, `[data-testid="spotlight-trigger"]`, `#setLayout`, `[data-testid="view-switcher"]`, `data-v="list|grid|table"`, `data-value="list|grid|table"`, `#editBtn`, `#batchBtn`, `#bcount`, `#setBtn`, `#dlBtn`, `#themeBtn`, `[data-testid="app-navbar"]`, `#sidebarNav`, `.sidebar-nav`, `button[data-cat="..."]`, `[data-testid="category-tab-..."]`, `border-l-4`, `span.rounded-full`, `[data-folder="..."]`, `[data-testid="pin-folder-..."]`, `#subchips`, `[data-testid="code-sub-chips"]`, `button[data-sub="..."]`, and `[data-testid="stats-dashboard"]`. Any visual refactoring must strictly preserve these selectors.
- **Scope Limit**: Investigation focused on Milestone R1 (Layout De-Cluttering & Unified Header). Defect card micro-interactions (R2) and batch drawer enhancements (R3) should build upon this refined layout foundation.

---

## 4. Conclusion

The application is well-architected and primed for visual de-cluttering and header/sidebar unification. The transition from bulky stacked cards to a compact inline status summary (`StatsDashboard`), coupled with a centered hero search header (`AppHeader`) and polished sidebar (`CategoryChips`), will significantly enhance user productivity while maintaining 100% test integrity (203/203 tests passing).

---

## 5. Verification Method

To verify the codebase and validate future changes:

1. **Run Full Test Suite**:
   ```bash
   npm test
   # Expected output: 203 pass, 0 fail, 58 suites
   ```

2. **Run Static Typecheck & Build**:
   ```bash
   npm run build
   # Expected output: tsc && vite build completes with 0 errors
   ```

3. **Inspect Key Component Files**:
   - `src/App.tsx`
   - `src/components/AppHeader.tsx`
   - `src/components/StatsDashboard.tsx`
   - `src/components/CategoryChips.tsx`
   - `src/components/CodeSubChips.tsx`
