# Project: QC Standard Wording UI/UX Overhaul & Visual Refinement

## Architecture
The application is a high-performance React + TypeScript + Vite + Tailwind CSS PWA for quality control defect standard wording inspection and batch aggregation.
- **State Layer**: Custom hook `useQCState` synchronizing 14 `localStorage` keys (`qc-pins`, `qc-pin-folders`, `qc-recents`, `qc-history`, `qc-batch`, `qc-join`, `qc-autoclear`, `qc-edits`, `qc-dels`, `qc-custom`, `qc-appearance`, `qc-theme`, `qc-density`, `qc-sort`).
- **Search Engine**: Typo-tolerant Levenshtein search engine in `src/utils/searchEngine.ts`.
- **Presentation Layer**:
  - `src/App.tsx`: App shell orchestrating header, sticky sidebar navigation, main content, and batch drawer.
  - `src/components/AppHeader.tsx`: Unified top navigation with Spotlight ⌘K search, view switcher, and compact action controls.
  - `src/components/StatsDashboard.tsx`: Integrated status summary strip (`139 Defects • 12 Categories • 3 Starred`).
  - `src/components/CategoryChips.tsx` & `src/components/CodeSubChips.tsx`: Sticky sidebar with quick views, pin folders, and defect categories.
  - `src/components/DefectCard.tsx` (and `WordingGrid`, `WordingList`, `WordingTable`, `WordingContainer`): Defect card/row/table rendering with inline 'Copied ✓' micro-interactions, elevated typography, and tactile buttons.
  - `src/components/BatchDrawer.tsx`: Slide-out queue with delimiter segmented tabs (\n, ,, ;, space), reordering, and prominent Copy All.
  - `src/components/ToastsContainer.tsx` & `src/utils/notifications.ts`: Minimalist floating toast notifications.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1.1: De-Clutter Horizontal Strips | Consolidate bulky StatsDashboard card into a sleek, integrated status summary strip preserving `#statsDashboard` and `[data-testid="stats-dashboard"]` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | R1.2: Modernized Unified Header | Balanced 3-column header with logo, centered hero ⌘K spotlight search, view switcher, and clean action group preserving all button IDs | M1 | ORIGINAL_REQUEST §R1 |
| 3 | R1.3: Polished Sticky Sidebar | Sidebar category buttons with smooth indicator bars, Lucide icons, count pills, and Pin Folders accordion | M1 | ORIGINAL_REQUEST §R1 |
| 4 | R2.1: Defect Card Typography & Hierarchy | Elevated typography, font weights, line-heights, contrast, and `#code` capsule pill styling across List, Grid, Table | M2 | ORIGINAL_REQUEST §R2 |
| 5 | R2.2: Inline Copy Micro-Interactions | Localized click feedback with subtle emerald border pulse and inline `Copied ✓` badge alongside floating toast | M2 | ORIGINAL_REQUEST §R2 |
| 6 | R2.3: Tactile Action Buttons | Physical click feel (`active:scale-95`), Star (★/☆) folder dropdown, and sleek + Batch button | M2 | ORIGINAL_REQUEST §R2 |
| 7 | R3.1: Batch Drawer Polish & Segmented Tabs | Slide-out panel with delimiter segmented tabs (\n, ,, ;, space) synced with `#joinSel`, smooth reordering, and prominent Copy All | M3 | ORIGINAL_REQUEST §R3 |
| 8 | R3.2: Floating Toast Notifications | Sleek floating Sonner toast styling with progress bar, copy preview, and auto-dismiss | M3 | ORIGINAL_REQUEST §R3 |
| 9 | R4.1: Test Suite & Build Verification | Maintain 100% test pass rate across all 203 test suites and 0 build errors (`npm test` & `npm run build`) | M4 | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Layout De-Cluttering & Unified Header | De-clutter horizontal strips, modernize top header (⌘K spotlight & view switchers), polish sticky sidebar | None | DONE |
| M2 | Defect Cards, List Rows & Inline Copy | Defect card/row/table typography, `#code` badges, tactile buttons, inline 'Copied ✓' micro-interaction & border pulse | M1 | DONE |
| M3 | Batch Drawer & Floating Toasts Polish | Delimiter segmented tabs (\n, ,, ;, space), item reorder micro-states, prominent Copy All, sleek floating toast styling | M2 | DONE |
| M4 | Final Integration, Test Hardening & Forensic Audit | Verification across all 203 test suites, 0 build errors, adversarial review, and forensic integrity audit | M1, M2, M3 | DONE |

## Interface Contracts

### AppHeader ↔ App
- Preserves all element IDs and data-testids: `#appHeader`, `#search`, `[data-testid="header-search-input"]`, `#clearBtn`, `#spotlightBtn`, `[data-testid="spotlight-trigger"]`, `#setLayout`, `[data-testid="view-switcher"]`, `data-v="list|grid|table"`, `#editBtn`, `#batchBtn`, `#bcount`, `#setBtn`, `#dlBtn`, `#themeBtn`.
- Emits standard callbacks: `onSearchChange`, `onClearSearch`, `onOpenSpotlight`, `onLayoutChange`, `onToggleEditMode`, `onOpenBatchDrawer`, `onOpenSettings`, `onDownloadOffline`, `onToggleTheme`.

### StatsDashboard ↔ App
- Element: `#statsDashboard[data-testid="stats-dashboard"]`.
- Props: `totalFilteredCount`, `totalAllCount`, `activeCategory`, `activeSub`, `searchQuery`, `pinnedCount`, `batchCount`, `categoryMap`.
- Output: Compact, clean single-line status bar with badges and filter pills.

### CategoryChips ↔ App
- Elements: `#sidebarNav[data-testid="app-navbar"]`, `button[data-cat="..."]`, `[data-testid="category-tab-..."]`, `[data-folder="..."]`, `[data-testid="pin-folder-..."]`, `border-l-4`, `span.rounded-full`.
- Props: `activeCat`, `onSelectCat`, `pinnedCount`, `recentCount`, `allCount`, `categoryCounts`, `folders`, `activeFolder`, `onSelectFolder`, `onCreateFolder`, `onRenameFolder`, `onDeleteFolder`.

### DefectCard ↔ Container
- Container Elements: `.gcard` (grid), `.row` (list), `.trow` (table), with `data-id={item.id}`, `border-l-4`.
- Internal Elements: `.rnum` (code label), `.rtxt` (text), `.rpill` (category pill), `.racts` (actions container), `.pin-btn` (`data-act="pin"`), `.add-batch-btn` (`data-act="add"`), `.edit-item-btn` (`data-act="edit"`), `.del-item-btn` (`data-act="del"`).
- Micro-Interaction: Local state `copied` (1200ms) adding `ring-2 ring-emerald-500/40 border-emerald-500/70` and inline `Copied ✓` badge while executing `onCopyItem(item.t)`.

### BatchDrawer ↔ App
- Element: `#batchDrawer`, `#joinSel[data-testid="delimiter-select"]` (synchronized with visual segmented tabs), `#autoclear`, `#bcopy`, `#bcopycount`, `#bclear`, `#blist .bitem[data-bi]`, `[data-rm]`, `[data-mvup]`, `[data-mvdn]`, `#bpaste`.

## Code Layout
- `src/App.tsx`: Layout composition and root view state.
- `src/components/AppHeader.tsx`: Header component.
- `src/components/StatsDashboard.tsx`: Compact status summary bar.
- `src/components/CategoryChips.tsx`: Sticky sidebar category and pin folder navigation.
- `src/components/CodeSubChips.tsx`: Subcategory chips.
- `src/components/DefectCard.tsx`: Card, row, and table row renderer.
- `src/components/WordingContainer.tsx`: List and layout wrapper.
- `src/components/BatchDrawer.tsx`: Batch drawer panel.
- `src/components/ToastsContainer.tsx`: Floating toasts renderer.
- `src/utils/notifications.ts`: Sonner toast dispatch and icon mapping.
- `src/index.css`: Global styles and animation keyframes.
- `tests/`: 58 test suites (203 tests across Tiers 1-5, Challenger, Stress, Latency).
