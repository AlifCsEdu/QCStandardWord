## 2026-08-07T13:40:55Z

You are Worker 1 for Milestone 3: Sticky Left Sidebar Navigation & Top Header Refactoring of QC Standard Wording.
Your working directory is c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m3_1.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Scope:
- Read ORIGINAL_REQUEST.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md
- Read PROJECT.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
- Read SCOPE.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m3\SCOPE.md
- Read Explorer handoff reports:
  - c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m3_1\handoff.md
  - c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m3_2\handoff.md
  - c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m3_3\handoff.md

Implementation Tasks:
1. `src/App.tsx`:
   - Configure AppShell navbar property (`navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}`).
   - Add `<AppShell.Navbar data-testid="app-navbar" id="sidebarNav" className="sidebar-nav">` hosting category tabs (`CategoryChips.tsx`) and sub-code chips (`CodeSubChips.tsx`).
2. `src/components/CategoryChips.tsx` & `src/components/CodeSubChips.tsx`:
   - Format `CategoryChips` to stack vertically in the sidebar while preserving container and button attributes (`id="nav"`, `id="chips"`, `data-cat`).
   - Place `CodeSubChips` cleanly inside navbar below category selection while preserving attributes (`id="subchips"`, `data-sub`, `className="subchips-container..."`). This eliminates the 45px vertical layout shift from `<AppShell.Main>`.
3. `src/components/AppHeader.tsx`:
   - Move search bar (`#search`, `data-testid="header-search-input"`), clear button (`#clearBtn`), Cmd+K Spotlight trigger button (`#spotlightBtn`, `data-testid="spotlight-trigger"`), and view switcher (`SegmentedControl`, `data-testid="view-switcher"`, `#setLayout`) into `AppHeader.tsx`.
4. `src/components/WordingContainer.tsx`:
   - Remove duplicate search bar and SegmentedControl view switcher.
5. `src/components/StatsDashboard.tsx`:
   - Consolidate/remove duplicate category badges (`categoriesToShow.map`) and search triggers to ensure a clean split layout with no redundant headers (`id="statsDashboard"`, `data-testid="stats-dashboard"`).

Verification Requirements:
- Run `npm run build` and `npm run test` to verify 0 build errors and 100% test pass rate.
- Document exact changes, build results, and test results in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m3_1\changes.md` and `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m3_1\handoff.md`.
- Send a message back to parent when complete.
