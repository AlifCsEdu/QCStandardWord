# Project: QC Standard Wording — Raycast Warm Stone UI Redesign

## Architecture
- **Framework & Build**: React 19 + Vite 6 + TypeScript 5 + Tailwind CSS v4 + Cloudflare Pages (`./dist`).
- **UI Stack**: `@radix-ui/react-*` primitives, `lucide-react`, `cmdk` (Spotlight), `sonner` (Toasts), `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`.
- **Design Palette**: Raycast Warm Stone Palette (Soft warm charcoal surfaces `#121214` dark / `#fcfcfc` light, warm grey borders `border-stone-800` / `border-stone-200`, tactile cards, zero heavy glassmorphism blurs, zero neon gradients or radial void halos).
- **Iconography & Accents**: Clean Lucide icons with muted semantic color pills (Soft Green for Battery, Muted Amber for Buttons, Steel Blue for Screen, Muted Plum for Pen, Rose for Locks) and left border accent indicators (`border-l-4`).
- **State & Data**: React hooks (`useQCState`, `useAppearance`), `localStorage` persistence across 14 keys (`qc-pins`, `qc-pin-folders`, `qc-recents`, `qc-history`, `qc-batch`, `qc-join`, `qc-autoclear`, `qc-edits`, `qc-dels`, `qc-custom`, `qc-appearance`, `qc-theme`, `qc-density`, `qc-sort`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Raycast Warm Stone Base Theme | Soft warm charcoal surfaces (#121214 dark / #fcfcfc light), warm grey borders (border-stone-800 / border-stone-200), clean typography | M1 | R1 |
| 2 | Complete Elimination of AI Tropes | Purge heavy glassmorphism blurs (backdrop-blur-md), radial neon halos, and cyan/purple glowing gradients. Solid subtle overlays for drawers/modals. | M1 | R1 |
| 3 | Muted Semantic Color Pills | Soft Green (Battery), Muted Amber (Buttons), Steel Blue (Screen), Muted Plum (Pen), Rose (Locks), Slate (Codes/Other) | M2 | R2 |
| 4 | Lucide Iconography System | Assign clean Lucide icons to all 15 defect categories and action buttons | M2 | R2 |
| 5 | Left Border Accent Indicators | Crisp border-l-4 category indicators across List, Grid Cards, and Table view modes | M2 | R2 |
| 6 | Sticky Left Sidebar Navigation | Category tabs (All, Codes, Screen, Camera, etc.), sub-code chips (FCPB, FCPW, etc.), and custom user pin folder manager | M3 | R3 |
| 7 | Custom User Pin Folder Manager | Full CRUD for custom folders, multi-folder item starring, item count badges, and localStorage persistence (qc-pin-folders) | M3 | R3 |
| 8 | Clean Top Header & Spotlight Search | Search input with ⌘K / Ctrl+K Spotlight modal trigger, View mode switcher (List, Grid, Table), Theme toggle, Settings modal trigger | M4 | R3 |
| 9 | Floating Sonner Toasts & Batch Drawer | Minimalist floating Sonner toasts and clean slide-out batch drawer with solid subtle overlays (no heavy blurs) | M4 | R3 |
| 10 | Type Safety & Performance | Zero layout shift, instant search responsiveness, 100% TypeScript type safety | M5 | R4 |
| 11 | Cloudflare Pages Build Integrity | Static build asset generation in dist/ via npm run build compliant with wrangler.jsonc | M5 | R4 |
| 12 | Full E2E & Tier 5 Test Suite Verification | Pass 100% of unit, integration, E2E, and Tier 5 hardening test suites (npm run test) | M5 | R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Warm Stone Base Theme & AI Tropes Elimination | Purge glassmorphism/neon gradients, configure #121214/#fcfcfc stone palette, warm grey borders, refactor inline styles | None | DONE |
| M2 | Muted Semantic Color-Coding & Iconography | Implement soft green/amber/steel blue/plum/rose pills, Lucide icon map, border-l-4 category left accent indicators | M1 | IN_PROGRESS |
| M3 | Sidebar Navigation & Pin Folder Manager | Sticky left sidebar category tabs, sub-code chips, custom user pin folder CRUD and persistence | M2 | PLANNED |
| M4 | Top Header, Spotlight, Drawer & Toasts | ⌘K Spotlight search modal, view switcher, settings modal, slide-out drawer with subtle solid overlay, floating toasts | M3 | PLANNED |
| M5 | E2E Test Suite Pass & Build Verification | Pass 100% test suite (Tiers 1-5), clean static build (npm run build), Cloudflare Pages compliance | M4 | PLANNED |
| M_REMEDIATION | Victory Audit Remediation | Fix 3 latency stress tests (<1000ms threshold) & purge all residual cyan/purple classes in UI primitives/components | M1-M5 | IN_PROGRESS |

## Interface Contracts
### `categoryColors.ts` ↔ Defect Component Layer
- `getCategoryBadgeStyle(category: CategoryKey)`: returns muted pill background, text color, and border styling
- `getCategoryLeftBorderStyle(category: CategoryKey)`: returns Tailwind `border-l-4 border-l-stone-*` or semantic color border
- `CATEGORY_ICON_MAP`: mapping of CategoryKey to Lucide icon component

### `useQCState` ↔ Pin Folder Layer
- `folders`: `CustomPinFolder[]`
- `createFolder`: `(name: string, color?: string) => string`
- `deleteFolder`: `(folderId: string) => void`
- `renameFolder`: `(folderId: string, newName: string) => void`
- `togglePinToFolder`: `(itemId: string, folderId: string) => void`
- `isPinnedInFolder`: `(itemId: string, folderId: string) => boolean`

## Code Layout
- `src/index.css`: CSS custom properties for Warm Stone palette (`#121214` dark / `#fcfcfc` light, `stone-800`/`stone-200` borders).
- `src/utils/categoryColors.ts`: Category color mapping, Lucide icon map, left border accent styles.
- `src/components/CategoryChips.tsx`: Left sidebar navigation, category tabs, sub-code chips, pin folder manager.
- `src/components/AppHeader.tsx`: Top navigation bar, search bar, Spotlight button, view toggle, settings.
- `src/components/DefectCard.tsx`, `WordingList.tsx`, `WordingGrid.tsx`, `WordingTable.tsx`: Cards/rows with category pills and left border accents.
- `src/components/BatchDrawer.tsx`: Slide-out batch queue drawer with solid subtle backdrop.
- `src/components/ToastsContainer.tsx`: Floating toast notifications.
