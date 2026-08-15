# Scope: Milestone 1 — Warm Stone Base Theme & AI Tropes Elimination

## Architecture
- Raycast Warm Stone palette (`#121214` dark background / `#fcfcfc` light background, warm grey borders `border-stone-800` / `border-stone-200`, tactile card surfaces).
- Zero generic AI design tropes: 0 heavy glassmorphism blurs, 0 neon cyan/purple gradients, 0 glowing halos. Solid subtle overlays for drawers/modals.
- Refactor hardcoded inline styles in `HistoryBar.tsx` (`#fff9db`), `EditToolbar.tsx` (`#e7f5ff`), and `CodeSubChips.tsx` into Tailwind dark-theme Warm Stone classes.

## Scope Breakdown
| # | Work Item | Status | Key Deliverables |
|---|-----------|--------|------------------|
| 1 | Warm Stone CSS variables & Tailwind config | DONE | `src/index.css`, `@theme` setup |
| 2 | Eliminate AI design tropes | DONE | Purged 48 tropes across 14 component files |
| 3 | Refactor inline styles | DONE | Purged redundant `style={{ display: ... }}` and hex colors |
| 4 | Verification | DONE | Clean `npm run build` and 121/121 `npm run test` pass |

## Interface Contracts
- CSS custom properties in `src/index.css` define theme colors used across components (`--background`, `--card`, `--border`).
- Interactive element DOM IDs (`#histbar`, `#editstrip`, `#subchips`, `#modal`, `#setmodal`, `#batchDrawer`) and dataset attributes (`data-hcopy`, `data-sub`, `data-testid`) preserved 100%.
