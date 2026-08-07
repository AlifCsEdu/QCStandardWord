# Focus Area 2 Analysis: AppHeader Refactoring & StatsDashboard Consolidation

## 1. Executive Summary

Milestone 3 Focus Area 2 requires:
1. Moving the search bar (with Cmd+K Spotlight trigger) and the view switcher (`SegmentedControl` for List/Grid/Table) into the top header (`AppHeader.tsx`).
2. Consolidating `StatsDashboard.tsx` to eliminate duplicate category badges and search triggers, transforming it into a clean, single-source active status bar.
3. Maintaining 100% test compatibility with all DOM contract helpers in `tests/harness.js` and ensuring zero vertical layout shift.

---

## 2. Evidence & Current State Findings

### A. Current Placement Analysis

#### 1. `src/components/AppHeader.tsx`
- **Current File Location**: `src/components/AppHeader.tsx:1-183`
- **Current Content**: Renders logo/title `QC Standard Wording v2.0` on left; action buttons (`#editBtn`, `#batchBtn`, `#setBtn`, `#dlBtn`, `#themeBtn`) on right.
- **Deficits**: Lacks search bar input, Cmd+K Spotlight trigger button, and view mode switcher (`SegmentedControl`).

#### 2. `src/components/WordingContainer.tsx`
- **Current File Location**: `src/components/WordingContainer.tsx:43-108`
- **Current Content**: Hosts the search input (`#search`), clear search button (`#clearBtn`), and view switcher (`SegmentedControl`).
- **Deficits**: Placing search and view toggle in main content body causes unnecessary vertical space usage and separates global search/view controls from top navigation header.

#### 3. `src/components/StatsDashboard.tsx`
- **Current File Location**: `src/components/StatsDashboard.tsx:99-115` & lines 82-95
- **Current Content**: Contains:
  - Header: "Inspection Stats Dashboard" with matching count badge & "Quick Search" button (`⌘K / Ctrl+K`).
  - Category Breakdown Badges: `categoriesToShow.map(...)` rendering 8 category pill badges (`Panel Codes`, `Screen & Display`, `Camera Systems`, `Physical Buttons`, `Battery & Power`, `Security & Locks`, `Audio & Speakers`, `Body & Housing`).
  - Active Filter Summary Banner: Category indicator, Sub-category indicator, Search Query indicator, Pinned count, Batch count.
- **Deficits / Duplications**:
  - The category breakdown badges in lines 99-115 duplicate category navigation tabs already hosted in the left sidebar navigation (`CategoryChips` / `SidebarNav`).
  - The Quick Search button in lines 82-95 duplicates the top header search bar.

#### 4. `src/App.tsx`
- **Current File Location**: `src/App.tsx:148-226`
- **Current Layout**: `<AppShell header={{ height: 60 }}>` -> `<AppHeader>` -> `<StatsDashboard>` -> `<CategoryChips>` -> `<CodeSubChips>` -> `<HistoryBar>` -> `<EditToolbar>` -> `<WordingContainer>`.
- **Deficits**: Layout passes search state to `WordingContainer` and `StatsDashboard`, but not to `AppHeader`.

---

## 3. DOM & Test Harness Contract Requirements

In `tests/harness.js`:
- `getAppHeader()` looks for: `[data-testid="app-header"], .mantine-AppShell-header, #appHeader, header`
- `getSegmentedControl()` looks for: `[data-testid="view-switcher"], [data-testid="segmented-control-view"], .mantine-SegmentedControl-root, #setLayout`
- `search()` looks for: `#search, [data-testid="search-input"], [data-testid="header-search-input"], .mantine-Spotlight-search, input[type="search"], input[placeholder*="Search"]`
- `clearSearch()` looks for: `#clearBtn, [data-testid="clear-search-btn"], button[aria-label*="Clear"]`
- `openSpotlightModal()` looks for: `[data-testid="spotlight-trigger"], #spotlightBtn, #cmdKBtn, button[aria-label*="Search"]`
- `getStatsDashboard()` looks for: `[data-testid="stats-dashboard"], #statsHeader, .stats-dashboard, [data-testid="stats-summary"]`

All corresponding `id` attributes and `data-testid` attributes MUST be present in the refactored components to guarantee 100% test pass rate.

---

## 4. Formulation of Implementation Changes

### Recommendation 1: Refactor `src/components/AppHeader.tsx`

Update `AppHeaderProps` interface:
```ts
export interface AppHeaderProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  batchCount: number;
  onOpenBatchDrawer: () => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark' | 'auto';
  onToggleTheme: () => void;
  // Focus Area 2 New Props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onOpenSpotlight: () => void;
  layoutMode: LayoutMode;
  onSetLayout: (layout: LayoutMode) => void;
}
```

Header JSX Structure:
- Container: `<header className="app-header" id="appHeader" data-testid="app-header" ...>`
- **Left**: Logo & App Title `QC Standard Wording v2.0`.
- **Center**: Combined Search Bar:
  - Input: `<input id="search" data-testid="header-search-input" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search QC defects (Cmd+K)..." />`
  - Clear button if query present: `<button id="clearBtn" data-testid="clear-search-btn" onClick={onClearSearch}>✕</button>`
  - Spotlight shortcut trigger: `<button id="spotlightBtn" data-testid="spotlight-trigger" onClick={onOpenSpotlight}>⌘K</button>`
- **Right**:
  - View Switcher: `<SegmentedControl data-testid="view-switcher" size="xs" value={layoutMode} onChange={(val) => onSetLayout(val as LayoutMode)} data={[{ label: 'List', value: 'list' }, { label: 'Grid', value: 'grid' }, { label: 'Table', value: 'table' }]} />`
  - Action buttons: Edit Mode (`#editBtn`), Batch Queue (`#batchBtn`), Settings (`#setBtn`), Offline Copy (`#dlBtn`), Theme Toggle (`#themeBtn`).

---

### Recommendation 2: Refactor `src/components/WordingContainer.tsx`

- Remove search input bar and `SegmentedControl` view switcher from top of `WordingContainer`.
- Retain `#countLabel` indicator above `#listwrap` or directly within the view area.
- Keep `#listwrap` with current list, grid, and table rendering logic.

---

### Recommendation 3: Consolidate `src/components/StatsDashboard.tsx`

- **Remove duplicate category breakdown cards/badges** (`categoriesToShow.map(...)`).
- **Remove Quick Search button** (`⌘K / Ctrl+K`).
- **Transform into Single Consolidated Active Status Bar**:
  - Container: `<Paper id="statsDashboard" data-testid="stats-dashboard" ...>`
  - Render compact single-row status bar:
    - Status icon & title: `IconDashboard` "Inspection Status"
    - Total matching count badge: `{totalFilteredCount} matching`
    - Active Filter indicators:
      - Category badge: `Cat: {CATEGORY_NAMES[selectedCategory] || selectedCategory}`
      - Sub-category badge (if `codes` & not `ALL`): `Sub: {selectedSubCategory}`
      - Search query badge (if active): `Query: "{searchQuery}"`
    - Metric summary badges on right:
      - `Pinned: {pinnedCount}`
      - `Batch: {batchCount}`

---

### Recommendation 4: Update `src/App.tsx` Integration

- Pass `searchQuery`, `onSearchChange`, `onClearSearch`, `onOpenSpotlight`, `layoutMode`, and `onSetLayout` to `<AppHeader>`.
- Pass consolidated status props to `<StatsDashboard>`.
- Maintain clean split layout inside `<AppShell>`.

---

## 5. Verification Plan

1. **Build Verification**: Run `npm run build` to ensure zero TypeScript errors.
2. **Test Suite Verification**: Run `npm test` to verify all 7 feature tiers pass.
3. **DOM Attribute Inspection**: Confirm `#search`, `#clearBtn`, `#spotlightBtn`, `data-testid="view-switcher"`, `#appHeader`, and `#statsDashboard` exist in JSDOM output.
