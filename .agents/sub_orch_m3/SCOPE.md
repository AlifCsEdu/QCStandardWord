# Scope: Milestone 3 - Sticky Left Sidebar Navigation & Top Header Refactoring

## Architecture
- Refactor layout in `src/App.tsx` using Mantine `<AppShell>` (`<AppShell.Header>`, `<AppShell.Navbar>`, `<AppShell.Main>`).
- Navbar hosting sticky category tabs (`CategoryChips.tsx` or new `SidebarNav.tsx`) and sub-code chips (`CodeSubChips.tsx`).
- Top header (`AppHeader.tsx`) hosting search bar (Cmd+K Spotlight trigger), view switcher (List/Grid/Table `SegmentedControl`), and settings.
- Remove duplicate category badges & stats cards in `StatsDashboard.tsx` to maintain clean split layout without redundant headers.
- Eliminate 45px vertical layout shift by hosting `CodeSubChips` inside fixed navbar.

## Feature Inventory
| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 3 | Sticky Left Sidebar Navigation | Move category tabs and sub-code chips into sticky left sidebar `<AppShell.Navbar>` | DONE |
| 4 | Top Header Search & View Switcher | Move Cmd+K Spotlight search bar and List/Grid/Table view switcher to top header | DONE |
| 5 | Remove Duplicate Stats Header | Consolidate `StatsDashboard.tsx` to eliminate duplicate category badges & counts | DONE |
| 6 | Eliminate Layout Shift | Prevent 45px vertical jump when switching sub-code chips (placed in sidebar) | DONE |

## Sub-Milestones / Iteration Plan
| # | Task | Scope | Target Files | Status |
|---|------|-------|--------------|--------|
| M3.1 | AppShell Navbar & Sidebar Navigation | Add sticky navbar in `App.tsx` with `CategoryChips` & `CodeSubChips` | `src/App.tsx`, `src/components/SidebarNav.tsx` | DONE |
| M3.2 | Top Header Refactoring | Move search bar & view switcher into `AppHeader.tsx` | `src/components/AppHeader.tsx` | DONE |
| M3.3 | Stats Dashboard Consolidation | Clean up duplicate category stats headers | `src/components/StatsDashboard.tsx` | DONE |
| M3.4 | Layout Shift Elimination | Fix vertical jump with fixed height/container in Navbar | `src/App.tsx`, `src/components/CodeSubChips.tsx` | DONE |

## Interface Contracts
- `AppShell.Navbar` width: fixed 260px desktop, collapsible drawer mobile.
- Category selection updates `selectedCategory` state in `useQCState`.
- Sub-code selection updates `selectedSubCategory` state in `useQCState`.
- View switcher updates `layoutMode` state in `useQCState`.
