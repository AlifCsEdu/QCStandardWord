# Handoff Report — Explorer 2: Layout & Navigation Survey

## 1. Observation

A comprehensive survey of the layout and navigation components in `QCStandardWording` was performed by examining source files in `src/` and `src/components/`.

### Component Map & Exact Locations
- **Top Header**: `src/components/AppHeader.tsx` (rendered in `src/App.tsx:150-158` inside `<AppShell.Header height={60}>`).
  - Contains: App title "QC Standard Wording v2.0", Edit Mode button (`#editBtn`), Batch Queue button (`#batchBtn`), Settings button (`#setBtn`), Download Offline Copy button (`#dlBtn`), and Dark/Light Theme toggle (`#themeBtn`).
  - Currently *lacks*: Search bar and View Switcher (List/Grid/Table).
- **Sticky Left Sidebar**: **Currently Missing**. `<AppShell.Navbar>` is not implemented in `src/App.tsx:148-299`.
- **Category Tabs**: `src/components/CategoryChips.tsx` (rendered in `src/App.tsx:179-186` inside `<AppShell.Main>`).
  - Contains an horizontal scroll container (`#chips`) rendering pills for 15 categories from `CATEGORIES` in `src/data/qcData.ts:145-236` (`all`, `codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`, `pinned`, `recent`).
  - Displays category name and item count badge (`categoryCounts`).
- **Sub-code Chips**: `src/components/CodeSubChips.tsx` (rendered in `src/App.tsx:189-193` inside `<AppShell.Main>`).
  - Contains horizontal scroll container (`#subchips`) rendering 10 panel code chips from `CODE_SUBS` in `src/data/qcData.ts:238-249` (`ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC`).
  - Toggled with `display: isVisible ? 'flex' : 'none'` based on `selectedCategory === 'codes'`.
- **Search Bar & Spotlight Trigger**:
  - Main search input: Located in `src/components/WordingContainer.tsx:45-89` (`<input id="search">`).
  - Spotlight modal trigger: Mantine Spotlight component in `src/App.tsx:268-276` with shortcut `['mod + k', 'ctrl + k']`. Triggered programmatically via `spotlight.open()` from `StatsDashboard.tsx:82-94`.
- **View Switcher (List/Grid/Table)**:
  - Mantine `SegmentedControl` in `src/components/WordingContainer.tsx:93-102` controlling `layoutMode` (`'list' | 'grid' | 'table'`).
  - Duplicated in `src/components/SettingsModal.tsx:64-85`.
- **Appearance Settings**:
  - `src/components/SettingsModal.tsx` (modal `#setmodal`) managed by `src/hooks/useAppearance.ts`.
  - Configures layout view mode, density (`cozy` / `compact`), border radius (`sharp` / `soft` / `round`), text size (`s` / `m` / `l`), motion (`full` / `reduced`), and accent palette (`indigo`, `blue`, `teal`, `green`, `orange`, `red`, `grape`).
- **Stats Dashboard & Duplicate Headers**:
  - `src/components/StatsDashboard.tsx` (rendered in `src/App.tsx:163-176`).
  - Renders a `<Paper id="statsDashboard">` container with an "Inspection Stats Dashboard" header, match counts, quick search button, active filter badge summary, and a hardcoded list of 8 category breakdown badges (`categoriesToShow: ['codes', 'screen', 'camera', 'buttons', 'battery', 'locks', 'audio', 'body']`).

### Category & Sub-code Rendering and Filtering Mechanics
1. **State Management**:
   - `selectedCategory` (`CategoryKey`) and `selectedSubCategory` (`SubCategoryCode`) are defined in `src/hooks/useQCState.ts:30-32`.
   - Category selection resets `selectedSubCategory` to `'ALL'`.
2. **Filtering Algorithm** (`src/utils/searchEngine.ts:230-366` `searchQCItems`):
   - **Category Filter**: `pinned` filters by `pinsSet` (`id` or `n`); `recent` filters by `recentsList` in historical order; specific categories (`screen`, `camera`, `codes`, etc.) filter by `item.c === category`; `all` includes all items.
   - **Sub-code Filter**: When `category === 'codes'` and `subCategory !== 'ALL'`, items are filtered by `item.sub === subCategory` or `norm(item.t).startsWith(subCategory.toLowerCase())`.
   - **Search Query Scoring**: Tokenizes query string, matches exact prefixes (score 100), applies synonym expansion (`ALIAS` in `src/data/qcData.ts:266-291`), and bounded Levenshtein distance (`lev()` in `src/utils/searchEngine.ts:20-47`).

### Identified Deficiencies (R1 & R3 Context)
1. **Duplicate Stats Header**: `StatsDashboard.tsx` duplicates category badges and count displays already provided in `CategoryChips.tsx` and `WordingContainer.tsx`, creating visual noise and multiple competing header blocks.
2. **Layout Shift Issue**: Rendering `CodeSubChips.tsx` inline inside `AppShell.Main` with dynamic display toggling (`display: isVisible ? 'flex' : 'none'`) causes vertical content jump (~45px height shift) when switching between `codes` and other categories.
3. **Non-Compliant Navigation Layout**: Navigation is currently rendered as top horizontal chip carousels in `AppShell.Main` rather than a unified sticky left sidebar navigation (`<AppShell.Navbar>`).

---

## 2. Logic Chain

1. **Observation**: `src/App.tsx` defines `<AppShell header={{ height: 60 }}>` without a `navbar` prop or `<AppShell.Navbar>` element. `CategoryChips.tsx` and `CodeSubChips.tsx` are mounted directly inside `<AppShell.Main>`.
2. **Reasoning Step**: Requirement R1 explicitly specifies: *"Sidebar & Header Layout: Clean split layout — sticky left sidebar for category tabs (All, Codes, Screen, Camera, etc.) and sub-code chips (FCPB, FCPW, etc.); top header for search bar (Cmd+K Spotlight modal trigger), view switcher (List, Grid, Table), and appearance settings."*
3. **Observation**: In `src/components/CodeSubChips.tsx:23`, `display: isVisible ? 'flex' : 'none'` dynamically adds/removes 45px of height above the main defect list in `AppShell.Main`.
4. **Reasoning Step**: Shifting content downward when selecting the "Codes" category causes a visible vertical layout shift (CLS). Moving category tabs and sub-code chips into a fixed-width left sidebar eliminates vertical shifts during category changes.
5. **Observation**: `StatsDashboard.tsx` (lines 60-148) renders an extra paper card containing a hardcoded list of category badges (`categoriesToShow`) and active filter summaries above `CategoryChips.tsx`.
6. **Reasoning Step**: Having `StatsDashboard` and `CategoryChips` both render category pills and count badges creates duplicate stats headers. Removing or merging `StatsDashboard` into a unified sidebar/header design satisfies the R1 acceptance criterion: *"Unified sticky left sidebar navigation with no duplicate stats headers."*

---

## 3. Caveats

No caveats. All layout components, filtering logic, and component interactions were fully inspected in the codebase.

---

## 4. Conclusion

The current application structure lacks a sticky left sidebar, displays duplicate category stats headers, and suffers from layout shifts due to inline category/sub-chip toggling in `AppShell.Main`.

### Recommended Architectural Changes for Implementation Team:
1. **AppShell Structure Update**: Add `<AppShell.Navbar width={{ base: 260 }}>` in `src/App.tsx` to host category tabs and sub-code chips stickily on the left.
2. **Header Streamlining**: Relocate the search input bar and `SegmentedControl` view switcher into `AppHeader.tsx` so the top header handles global search and layout controls.
3. **Eliminate Duplicate Stats Headers**: Remove or consolidate `StatsDashboard.tsx` so stats counters are clean, unobtrusive, and integrated into the sidebar or top header without duplicating category pills.
4. **Eliminate Layout Shifts**: Embed `CodeSubChips` cleanly within the left sidebar under the "Codes" tab so category switching does not push or shift main content.

---

## 5. Verification Method

### Automated Tests
- Command: `npm test`
- Scope: `src/utils/searchEngine.test.ts` (verifies category filtering, sub-code filtering, typo tolerance, alias expansion, and score calculation).

### Build Verification
- Command: `npm run build`
- Scope: TypeScript type checking (`tsc -b`) and Vite production bundle generation.

### File Locations to Inspect
- `src/App.tsx`
- `src/components/AppHeader.tsx`
- `src/components/CategoryChips.tsx`
- `src/components/CodeSubChips.tsx`
- `src/components/StatsDashboard.tsx`
- `src/components/WordingContainer.tsx`
