# Project: QC Standard Wording Design System & Smart Auto-Sessions Upgrade

## Architecture
- **Layer 0 (Base Canvas)**: `#0e0e11` for body, root background (`--background`, `--bg-deep-slate`).
- **Layer 1 (Containers / Sidebar / Header)**: `#141418` for `AppHeader`, `CategoryChips` sidebar, `StatsDashboard`, `HistoryBar`, `EditToolbar`.
- **Layer 2 (Defect Cards / List Rows / Table Containers)**: `#1a1a20` with `border-stone-800/80` (`rgba(41, 37, 36, 0.8)`) for `.gcard`, `.row`, `.trow`, `.wording-table-wrapper`, and empty states. Hover elevates to `#22222a`.
- **Layer 3 (Popovers / Drawers / Modals)**: `#22222a` with `border-stone-700/60` (`rgba(68, 64, 60, 0.6)`) for `BatchDrawer`, `HistoryDrawer`, `EditModal`, `CategoryManagerModal`, `SettingsModal`, `CommandDialog` (Cmd+K).
- **Design Tokens Hierarchy**:
  - `rounded-xl` for cards, table wrappers, drawers, and modal containers.
  - `rounded-lg` for interactive chips, subchips, primary action buttons (`+ Batch`, `★ Pin`, `Edit`, `Del`), search inputs.
  - `rounded-md` for monospace number badges (`.rnum`), active segmented pills, filter badges.
  - `rounded-full` for category pill badges (`.rpill`), floating toast capsules, and round count badges.
- **Category Accent Flow**: Seamless 4px left accent borders (`border-l-4`) and matching category pill badges (`rgba(rgb, 0.18)` background, `rgba(rgb, 0.45)` border) across Sidebar, Defect Cards, Table rows, History session items, and Batch drawers.
- **Smart Auto-Sessions History Engine**:
  - 30-minute idle gap threshold clustering copied defect items into dynamic session groups ("Current Session", "Session — HH:MM", "Earlier Today", "Yesterday", earlier dates).
  - Session-level bulk operations ("Copy All in Session", "Add Session to Batch Queue") and item-level re-copy/pin actions.
  - In-drawer category filtering and instant full-text search.
  - Zero-breaking backward compatibility with localStorage keys (`qc-history-entries`, `qc-recents`, `qc-history`).
- **Tablet Fluidity & Micro-Interactions**:
  - 44–48px ergonomic touch targets optimized for Samsung Tab S9+.
  - Active press scaling (`active:scale-95`), smooth transitions, and tactile feedback.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Warm Charcoal 4-Layer Depth | #0e0e11 base, #141418 containers, #1a1a20 cards with border-stone-800/80, #22222a popovers/drawers with border-stone-700/60 | M1 | Survey 1, ORIGINAL_REQUEST §R1 |
| F2 | Harmonized Design Tokens | Standardized border radiuses (rounded-xl, rounded-lg, rounded-md, rounded-full) and typography scaling | M1 | Survey 1, ORIGINAL_REQUEST §R1 |
| F3 | Unified UI Primitives | Stone-based dark palette replacing cool zinc tokens across all 14 Radix UI primitives | M1 | Survey 1, ORIGINAL_REQUEST §R1 |
| F4 | Category Accent Synchronization | Consistent category colors, left accent borders, and pill badges across all views | M1 | Survey 1, ORIGINAL_REQUEST §R1 |
| F5 | Time-Based Auto-Sessions Engine | Clustering history entries by 30-min idle threshold into Current Session, Session — HH:MM, Yesterday, etc. | M2 | Survey 2, ORIGINAL_REQUEST §R2 |
| F6 | History Category Filter & Search | Horizontal category filter chips with live item counts and instant search query matching | M2 | Survey 2, ORIGINAL_REQUEST §R2 |
| F7 | History Session Actions | "Copy All in Session" and "Add Session to Batch Queue" bulk actions per session group | M2 | Survey 2, ORIGINAL_REQUEST §R2 |
| F8 | History Item Accents & Controls | Category pill badge, icon, defect code, left accent border, 1-click re-copy, and pin action per item | M2 | Survey 2, ORIGINAL_REQUEST §R2 |
| F9 | Tablet Fluidity & Touch Targets | 44–48px minimum touch targets and tactile micro-states for Samsung Tab S9+ | M3 | Survey 3, ORIGINAL_REQUEST §R3 |
| F10 | Comprehensive Component Polish | Seamless visual integration across AppHeader, Sidebar, Grid/List/Table, History, Batch, Modals | M3 | Survey 3, ORIGINAL_REQUEST §R3 |
| F11 | Automated Test Suite Pass | 100% pass rate across all existing (378+) and new tests with TypeScript and Vite clean build | M4 | Survey 3, ORIGINAL_REQUEST §R4 |
| F12 | Adversarial Hardening | Edge cases, boundary conditions, rapid copying stress, and session gap transitions | M4 | Survey 3, ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Visual Language & Unified Surface Architecture | CSS custom properties, tokens.ts, UI primitives, card/container/drawer base styling | none | DONE |
| M2 | Smart Auto-Sessions History System | historySessions engine, useQCState enrichment, HistoryDrawer overhaul, session actions | M1 | DONE |
| M3 | Component Polish & Tablet Fluidity | Header, Sidebar, Grid/List/Table, Batch Drawer, Modals, 44-48px touch targets | M1, M2 | DONE |
| M4 | Test Suite Pass & Adversarial Hardening | E2E & unit test suites for auto-sessions, full test verification (100% pass), clean build | M1, M2, M3 | DONE |

## Interface Contracts
### `src/types/qc.ts` ↔ `src/utils/historySessions.ts` & `src/components/HistoryDrawer.tsx`
- `HistoryEntry`: `{ id: string; text: string; itemNumber?: string; category?: string; timestamp: number; source?: string }`
- `HistorySession`: `{ id: string; title: string; subtitle: string; startTime: number; endTime: number; isCurrentSession: boolean; entries: HistoryEntry[] }`
- `groupHistoryIntoSessions(entries: HistoryEntry[], now?: number): HistorySession[]`

### `src/hooks/useQCState.ts` ↔ Components
- `pushHistoryEntry(text: string, meta?: { itemNumber?: string; category?: string; source?: string }): void`
- `copySessionAll(session: HistorySession): Promise<void>`
- `addSessionToBatch(session: HistorySession): void`

## Code Layout
- `src/index.css`: Global theme tokens, 4-layer Warm Charcoal surface variables, CSS custom properties.
- `src/theme/tokens.ts`: Surface and token color definitions.
- `src/types/qc.ts`: TypeScript interfaces including `HistoryEntry` and `HistorySession`.
- `src/utils/historySessions.ts`: Auto-sessions grouping and timestamp clustering algorithms.
- `src/utils/categoryColors.ts`: Category color mapping, badge styles, and left accent border styles.
- `src/components/HistoryDrawer.tsx`: Upgraded Smart Auto-Sessions History drawer.
- `src/components/AppHeader.tsx`, `Sidebar.tsx`, `CategoryChips.tsx`, `CodeSubChips.tsx`: Shell components.
- `src/components/DefectCard.tsx`, `WordingContainer.tsx`, `WordingTable.tsx`: Content views.
- `src/components/BatchDrawer.tsx`, `SettingsModal.tsx`, `EditModal.tsx`, `CategoryManagerModal.tsx`: Drawers and modals.
- `src/components/ui/*.tsx`: Stone-harmonized Radix UI primitives.
- `tests/`: Automated test suites (`tests/r2-smart-sessions.test.ts`, etc.).
