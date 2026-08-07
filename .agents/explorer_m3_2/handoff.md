# Handoff Report: Milestone 3 Focus Area 2 (AppHeader Refactoring & StatsDashboard Consolidation)

## 1. Observation

- **AppHeader.tsx (`src/components/AppHeader.tsx:1-183`)**: Currently renders title, version badge, and right-hand action buttons (`#editBtn`, `#batchBtn`, `#setBtn`, `#dlBtn`, `#themeBtn`). It lacks search input (`#search`), Spotlight trigger (`#spotlightBtn` / `data-testid="spotlight-trigger"`), and view mode switcher (`SegmentedControl`).
- **WordingContainer.tsx (`src/components/WordingContainer.tsx:43-108`)**: Currently renders search input (`#search`), clear search button (`#clearBtn`), and view switcher (`SegmentedControl`).
- **StatsDashboard.tsx (`src/components/StatsDashboard.tsx:82-115`)**: Currently contains duplicate Quick Search button (lines 82-95) and duplicate category breakdown badges (`categoriesToShow.map(...)`, lines 99-115) duplicating left sidebar category navigation.
- **App.tsx (`src/App.tsx:148-226`)**: Wraps component tree in `<AppShell>`.
- **Test Harness (`tests/harness.js:200-260, 654-657`)**: Tests expect header at `[data-testid="app-header"], #appHeader, header`, search input at `#search, [data-testid="header-search-input"]`, clear button at `#clearBtn, [data-testid="clear-search-btn"]`, spotlight trigger at `#spotlightBtn, [data-testid="spotlight-trigger"]`, view switcher at `[data-testid="view-switcher"], #setLayout`, and stats dashboard at `[data-testid="stats-dashboard"], #statsDashboard`.
- **Test Suite Status**: All test suites pass baseline execution (`npm test`).

---

## 2. Logic Chain

1. **Top Header Refactoring**:
   - `ORIGINAL_REQUEST.md` (lines 14) and `PROJECT.md` (lines 7) dictate moving the Cmd+K search bar and List/Grid/Table view switcher into `<AppShell.Header>`.
   - Moving search input `#search`, clear button `#clearBtn`, spotlight trigger `#spotlightBtn`, and `SegmentedControl` view switcher into `AppHeader.tsx` consolidates global controls in the top header.
   - Preserving exact HTML element IDs (`#search`, `#clearBtn`, `#spotlightBtn`, `#appHeader`, `#statsDashboard`, `data-testid="view-switcher"`) guarantees zero breakage for test harness DOM query selectors in `tests/harness.js`.

2. **StatsDashboard Consolidation**:
   - `SCOPE.md` (lines 7) and `PROJECT.md` (line 16) specify removing duplicate category badges and stats headers.
   - In `StatsDashboard.tsx`, category badges (`categoriesToShow.map`) duplicate the category chips in left sidebar navigation (`CategoryChips` / `SidebarNav`).
   - Removing `categoriesToShow.map(...)` and redundant Quick Search button transforms `StatsDashboard.tsx` into a streamlined **Active Inspection Status Bar**, showing active filters (Category, Sub-category, Search Query) and core summary counts (Matching, Pinned, Batch Queue).

3. **WordingContainer Streamlining**:
   - Removing duplicate search bar and `SegmentedControl` from `WordingContainer.tsx` eliminates redundant UI elements and allows `WordingContainer.tsx` to focus cleanly on displaying defect items (`WordingList`, `WordingGrid`, `WordingTable`).

---

## 3. Caveats

- **DOM Selectors for Tests**: Implementers must strictly maintain `#search`, `#clearBtn`, `#spotlightBtn`, `#appHeader`, `#statsDashboard`, and `data-testid="view-switcher"` attributes so JSDOM test harness helpers (`helpers.search()`, `helpers.getAppHeader()`, `helpers.getSegmentedControl()`, `helpers.getStatsDashboard()`) continue to resolve without errors.
- **Mobile Responsive Layout**: Header elements (`search`, `SegmentedControl`, action buttons) must use flex-wrap or responsive styling so they do not overflow on narrower viewports.

---

## 4. Conclusion

Focus Area 2 investigation is complete. The exact blueprint for refactoring `AppHeader.tsx`, `WordingContainer.tsx`, `StatsDashboard.tsx`, and `App.tsx` has been validated against all test contracts and specification documents. The implementation can proceed directly using the recommendations outlined in `analysis.md`.

---

## 5. Verification Method

1. **TypeScript Build Verification**:
   ```bash
   npm run build
   ```
   Must compile cleanly with 0 errors.

2. **Automated Test Suite Verification**:
   ```bash
   npm test
   ```
   Must pass 100% of tests across all tiers.

3. **DOM Selector & Component Verification**:
   Inspect mounted JSDOM tree to verify presence of:
   - Header container: `#appHeader` / `[data-testid="app-header"]`
   - Search input: `#search` / `[data-testid="header-search-input"]`
   - View switcher: `[data-testid="view-switcher"]`
   - Stats summary: `#statsDashboard` / `[data-testid="stats-dashboard"]`
