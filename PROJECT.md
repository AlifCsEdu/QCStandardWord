# Project: QC Standard Wording 2026 UI/UX Overhaul

## Architecture
- Framework: React 18/19 + Vite + TypeScript
- Component Library: Mantine UI v7 (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight`, `@tabler/icons-react`)
- Theme System: Mantine custom theme overrides with Deep Slate (`#0f172a`) background, Charcoal (`#1e293b`) containers, high-contrast borders (`#334155`), cool cyan accents (`#06b6d4` / `#0284c7`)
- Layout Strategy: Split layout — Sticky left sidebar `<AppShell.Navbar>` for category tabs & sub-code chips; Top header `<AppShell.Header>` for Cmd+K search bar, List/Grid/Table view switcher, theme toggle, and settings.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dependency Updates | Update @mantine/* packages to latest available | M1 | R3 |
| 2 | Deep Slate & Charcoal Theme | Deep Slate (#0f172a) bg, Charcoal (#1e293b) containers, cyan accents (#06b6d4/#0284c7), high-contrast borders (#334155) | M2 | R1 |
| 3 | Sticky Left Sidebar Navigation | Move category tabs and sub-code chips into sticky left sidebar `<AppShell.Navbar>` | M3 | R1 |
| 4 | Top Header Search & View Switcher | Move Cmd+K Spotlight search bar and List/Grid/Table view switcher to top header | M3 | R1 |
| 5 | Remove Duplicate Stats Header | Consolidate `StatsDashboard.tsx` to eliminate duplicate category badges & counts | M3 | R1 |
| 6 | Eliminate Layout Shift | Prevent 45px vertical jump when switching sub-code chips (placed in sidebar) | M3 | R1, R3 |
| 7 | Floating Toast Notifications | Modern floating toast pills with category icons, subtle glow, copy feedback, and progress timers | M4 | R2 |
| 8 | Glassmorphic Batch Drawer | Backdrop-filtered slide-out drawer (blur(8px), rgba(15,23,42,0.4)), batch reorder & copy controls | M5 | R2 |
| 9 | High-Contrast Cards & Table Rows | Visual differentiation between defect cards/rows, clear hover states (150ms ease), category pill badges, bold typography | M6 | R1 |
| 10 | E2E & Integrity Verification | 100% build and test pass rate, zero layout shift, 100% responsive desktop/mobile support | M7 | AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Dependency Updates & Baseline Setup | Update Mantine dependencies, verify npm build/test baseline | None | DONE |
| 2 | M2: 2026 Deep Slate & Charcoal Theme Setup | Configure Mantine theme overrides, custom CSS tokens (#0f172a, #1e293b, #334155, cyan accent) | M1 | DONE |
| 3 | M3: Sticky Sidebar Navigation & Header Refactoring | Move navigation to sticky sidebar `<AppShell.Navbar>`, header search & view switcher, remove duplicate stats header | M2 | DONE |
| 4 | M4: Modern Floating Toast Notifications | Refactor notifications to floating glassmorphic toasts with category icons, subtle glow, progress timer | M2 | DONE |
| 5 | M5: Glassmorphic Non-Intrusive Batch Drawer | Refactor batch drawer with backdrop filter (blur 8px), non-dimming overlay, reorder/copy controls | M3, M4 | DONE |
| 6 | M6: High-Contrast Cards, Tables & Visual Differentiation | Style defect cards, grid items, and table rows with high-contrast borders, hover animations (150ms), pill badges | M2, M3 | DONE |
| 7 | M7: E2E Test Suite & Integrity Verification | Pass 100% E2E tests, zero layout shift verification, responsive desktop/mobile, forensic audit | M1-M6 | DONE |

## Interface Contracts
### AppShell ↔ Navigation
- AppShell Navbar width: fixed 260px desktop, collapsible drawer mobile.
- Category change updates `selectedCategory` state in `useQCState`.
- Sub-code selection updates `selectedSubCategory` state in `useQCState`.

### AppHeader ↔ Search & View Switcher
- Cmd+K opens Spotlight modal via `spotlight.open()`.
- View switcher (`SegmentedControl`) updates `layoutMode` (`list` | `grid` | `table`).

### Notifications System
- Custom floating toast helper: `showFloatingToast(message, type, categoryIcon)`.

## Code Layout
- `src/App.tsx`: Main AppShell layout (Header, Navbar, Main)
- `src/theme/`: Mantine theme definitions and 2026 color palette
- `src/components/AppHeader.tsx`: Top header with search bar, view switcher, settings
- `src/components/SidebarNav.tsx`: Sticky left sidebar with category tabs & sub-code chips
- `src/components/CategoryChips.tsx`: Category badges (sidebar-friendly)
- `src/components/CodeSubChips.tsx`: Sub-code badges (sidebar-friendly)
- `src/components/WordingContainer.tsx`: Defect items container (List / Grid / Table view)
- `src/components/DefectCard.tsx`: Individual card/row with high-contrast borders & hover states
- `src/components/BatchDrawer.tsx`: Glassmorphic batch queue drawer with backdrop-filter
- `src/utils/notifications.ts`: Floating toast notification triggers & icons
- `src/utils/searchEngine.ts`: Search & filtering logic
- `src/hooks/useQCState.ts`: State management and persistence
