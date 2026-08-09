# Project: QC Standard Wording 2026 Visual & UX Overhaul

## Architecture
- Tech Stack: React 19 + Vite + TypeScript + Tailwind CSS v4 + Radix UI Primitives + Lucide Icons + CMDK + Sonner
- Deployment Target: Cloudflare Pages (`dist/` directory configured in `wrangler.jsonc`)
- Dark Palette Theme Engine: Deep Void Midnight (`#050608`), Onyx surfaces (`#0c0e12`), 1px razor-sharp borders (`border-white/[0.08]` / `border-zinc-800`), ambient cyan glow highlights (`from-cyan-500/20 to-blue-500/10`), Geist/Inter sans typography, JetBrains Mono code badges.
- State & Persistence: 14 `localStorage` keys, `useQCState` and `useAppearance` hooks.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 2026 Aesthetic Engine & Theme Tokens | Refactor `index.css` theme tokens to Deep Void `#050608` & Onyx `#0c0e12`, purge legacy `--mantine-color-body` variables, implement Geist/Inter + JetBrains Mono font system | M1 | ORIGINAL_REQUEST |
| 2 | Hardcoded Light Inline Style Purge | Convert inline light styles in `HistoryBar.tsx` (`#fff9db`), `EditToolbar.tsx` (`#e7f5ff`), and `CodeSubChips.tsx` (`#7048e8`) to dark-mode Tailwind classes | M1 | ORIGINAL_REQUEST |
| 3 | Sticky Left Sidebar & Custom Pin Folder Manager | Sticky navigation sidebar with Lucide category icons, count pills, custom pin folder CRUD manager, and collapsible groups | M2 | ORIGINAL_REQUEST |
| 4 | Top Header, Hero Search Bar & View Switcher | Top header navbar with Spotlight search modal (`⌘K`/`Ctrl+K`), custom view switcher (List, Grid Cards, Table), edit mode, and batch drawer toggle | M2 | ORIGINAL_REQUEST |
| 5 | Card Grid & Table View Redesign | Defect card grid and table view polish with glowing hover states, theme-aware cyan/emerald pill badges, `<mark>` match highlighting, and clean action menus | M3 | ORIGINAL_REQUEST |
| 6 | Minimalist Floating Toasts & Glassmorphic Drawer | Toasts container refinement with progress bar, glassmorphic batch side drawer (`backdrop-blur-xl bg-zinc-950/85`) with delimiter controls and drag/drop reorder | M3 | ORIGINAL_REQUEST |
| 7 | Full E2E & Tier 5 Hardening Verification | Cloudflare Pages static build (`npm run build`) and 100% test pass rate across Tier 1-5 test suites (`npm test`) | M4 | ORIGINAL_REQUEST |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Aesthetic Engine, Theme Tokens & Styling Purge | `src/index.css`, font variables, `HistoryBar.tsx`, `EditToolbar.tsx`, `CodeSubChips.tsx` | none | DONE |
| 2 | M2: Sidebar, Top Header, Search Modal & Pin Manager | `CategoryChips.tsx`, `AppHeader.tsx`, `CommandDialog` (`App.tsx`), `useQCState.ts` folder state | M1 | DONE |
| 3 | M3: Grid/Table Views, Glassmorphic Drawer & Toasts | `DefectCard.tsx`, `WordingContainer.tsx`, `BatchDrawer.tsx`, `ToastsContainer.tsx` | M2 | DONE |
| 4 | M4: Performance, Build & E2E Test Suite Hardening | TypeScript verification, `npm run build`, `npm test` (Tiers 1-5), Cloudflare Pages compliance | M3 | DONE |

## Interface Contracts & Test Preservation
- DOM Selector IDs MUST be preserved: `#appHeader`, `#sidebarNav`, `#histbar`, `#editstrip`, `#toasts`, `#batchDrawer`, `#modal`, `#setmodal`
- View switcher data attribute MUST be preserved: `data-v="list|grid|table"`
- Category & Pin Folder data attributes MUST be preserved: `data-cat`, `data-testid`
- All 14 `localStorage` keys must maintain schema compatibility.

## Code Layout
- `src/index.css` - Global theme tokens, typography, keyframe animations
- `src/App.tsx` - Main app shell, layout grid, command dialog
- `src/components/AppHeader.tsx` - Top navigation, search, view switcher
- `src/components/CategoryChips.tsx` - Left sticky sidebar, pin folder manager
- `src/components/CodeSubChips.tsx` - Category sub-code chip panel
- `src/components/HistoryBar.tsx` - Recents & search history strip
- `src/components/EditToolbar.tsx` - Wording customizer / edit strip
- `src/components/DefectCard.tsx` - Wording card (List, Grid, Table renderers)
- `src/components/WordingContainer.tsx` - Main content container
- `src/components/BatchDrawer.tsx` - Glassmorphic side drawer for batch copy
- `src/components/ToastsContainer.tsx` - Toast notification container
- `src/hooks/useQCState.ts` - LocalStorage & app state hook
- `src/hooks/useAppearance.ts` - Appearance state hook
- `src/utils/categoryColors.ts` - Lucide icon map, badge styling helpers
