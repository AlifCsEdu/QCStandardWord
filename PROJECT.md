# Project: QC Standard Wording Overhaul & shadcn/ui Migration

## Architecture
- **Framework & Build**: React 19 + Vite 6 + TypeScript 5 + Tailwind CSS v4 + Cloudflare Pages (`./dist`).
- **UI Stack**: `@radix-ui/react-*` primitives, `lucide-react`, `cmdk` (Spotlight), `sonner` (Toasts), `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`.
- **Design Palette**: Deep Zinc Dark Theme (`#09090b` bg, `#18181b` card/containers, `#27272a` borders, `#06b6d4` cool cyan accent highlight).
- **State & Data**: React hooks (`useQCState`, `useAppearance`), `localStorage` persistence across 14 keys (`qc-pins`, `qc-pin-folders`, `qc-recents`, `qc-history`, `qc-batch`, `qc-join`, `qc-autoclear`, `qc-edits`, `qc-dels`, `qc-custom`, `qc-appearance`, `qc-theme`, `qc-density`, `qc-sort`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Package Migration & CSS Setup | Remove `@mantine/*` & `@tabler/*`, install Tailwind CSS v4 + Radix UI + Lucide + Sonner + CMDK | M1 | R1 |
| 2 | Zinc Dark Palette Styling | Configure `#09090b` bg, `#18181b` cards, `#27272a` borders, `#06b6d4` cyan accents | M1 | R1 |
| 3 | Core UI Primitives | Build `Button`, `Input`, `Badge`, `Card`, `Dialog`, `Select`, `Checkbox`, `Textarea`, `Tooltip`, `DropdownMenu`, `Sheet`, `Command`, `ToggleGroup`, `ScrollArea` | M2 | R1 |
| 4 | Lucide Iconography System | Assign dedicated Lucide icons to all 15 defect categories & replace Tabler icons | M2 | R2 |
| 5 | Category Color Accents & Badges | Implement theme-aware category badges and left border accents (`border-l-4`) | M2 | R2 |
| 6 | Custom User Pin Categories & Folders | Implement `CustomPinFolder` schema, CRUD operations, multi-folder item starring, & navigation | M3 | R3 |
| 7 | State Persistence Layer | Update `useQCState` and `useAppearance` for 14 `localStorage` keys & dark theme management | M3 | R3 |
| 8 | Application Shell & Layout Migration | Migrate `App.tsx`, `AppHeader`, `CategoryChips`, `CodeSubChips`, `WordingContainer`, `BatchDrawer`, `SettingsModal`, `StatsDashboard` | M4 | R1, R2, R3 |
| 9 | DOM & Test ID Preservation | Preserve `#appHeader`, `#sidebarNav`, `#setLayout`, `#batchDrawer`, `#toasts`, `#search`, `data-testid` markers | M4 | R4 |
| 10 | Static Asset Build & Cloudflare Config | Clean `npm run build` (`dist/`), `wrangler.jsonc` validation | M5 | R4 |
| 11 | Full Test Suite Execution | Pass 100% of unit/integration tests (`npm test`) & E2E suite | M5 | R4 |
| 12 | Adversarial Coverage Hardening | Tier 5 white-box stress testing and edge-case validation | M5 | R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Package & Styling Infrastructure | Remove `@mantine/*` & `@tabler/*`, install Tailwind v4 + Radix UI stack, configure Zinc Dark Theme | None | DONE |
| M2 | UI Component Primitives & Iconography | Implement shadcn/ui primitives (`Sheet`, `Command`, `Dialog`, `Button`, `Card`, etc.), Lucide icon map, Sonner toasts | M1 | DONE |
| M3 | Custom Pin Folders & State Layer | Implement `CustomPinFolder` schema, `qc-pin-folders` localStorage key, `useQCState` & `useAppearance` updates | M2 | DONE |
| M4 | Application Layout & Component Overhaul | Migrate `App.tsx`, `AppHeader`, `BatchDrawer`, `CategoryChips`, `DefectCard`, `SettingsModal`, `EditModal` to shadcn/ui | M3 | DONE |
| M5 | Final E2E Test Suite Pass & Hardening | Pass 100% unit & E2E tests, clean `npm run build`, zero `@mantine` packages remaining, Tier 5 hardening | M4 | DONE |

## Interface Contracts
### `useQCState` ↔ Component Layer
- `folders`: `CustomPinFolder[]`
- `createFolder`: `(name: string, color?: string) => string`
- `deleteFolder`: `(folderId: string) => void`
- `renameFolder`: `(folderId: string, newName: string) => void`
- `togglePinToFolder`: `(itemId: string, folderId: string) => void`
- `isPinnedInFolder`: `(itemId: string, folderId: string) => boolean`

### Toast Notifications Interface (`src/utils/notifications.ts`)
- `showNotice(notice: { type: 'copy'|'pin'|'batch'|'edit'|'custom'|'info'|'warning'|'delete', text: string }) => void`
- Wraps `sonner.toast` with Lucide icons (`Copy`, `Pin`, `Plus`, `Pencil`, `Trash2`, `AlertTriangle`).

## Code Layout
- `src/components/ui/`: Target shadcn/ui primitives (`button.tsx`, `card.tsx`, `dialog.tsx`, `sheet.tsx`, `command.tsx`, `select.tsx`, `checkbox.tsx`, `textarea.tsx`, `badge.tsx`, `toggle-group.tsx`, `scroll-area.tsx`).
- `src/lib/utils.ts`: Utility function `cn(...inputs: ClassValue[])`.
- `src/types/qc.ts`: Expanded types (`CustomPinFolder`, `QCItem`, `CategoryInfo`, etc.).
- `src/hooks/useQCState.ts`: State hook with 14 `localStorage` keys.
- `src/hooks/useAppearance.ts`: Theme hook with dark mode class toggle.
