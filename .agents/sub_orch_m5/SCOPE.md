# Scope: Milestone 5 — Glassmorphic Non-Intrusive Batch Drawer

## Architecture
- React component: `src/components/BatchDrawer.tsx`
- CSS / Tailwind glassmorphic styling: backdrop-filter blur(8px), overlay rgba(15, 23, 42, 0.4), slide-out panel, non-intrusive backdrop click/touch handling.
- DOM element IDs and classes matching test harness specs:
  - `#batchDrawer`: Main drawer container
  - `#backdrop`: Overlay/backdrop element
  - `#bbcount`: Batch count in badge/button
  - `#bcount`: Batch count inside drawer header/counter
  - `#joinSel`: Delimiter select dropdown (newline, comma, space, pipe, bullet, etc.)
  - `#autoclear`: Auto-clear checkbox
  - `#bcopy`: Copy batch items button
  - `#bclear`: Clear batch button
  - `#bpaste`: Paste into active field button
  - `.bitem`: Class for individual batch item cards/rows
  - Move up / move down buttons per item for quick batch reorder controls

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Glassmorphic Drawer | Slide-out panel (`#batchDrawer`) with backdrop blur (8px) and non-dimming overlay `rgba(15, 23, 42, 0.4)` | M5 | R2 / ORIGINAL_REQUEST |
| 2 | Non-intrusive Backdrop | Backdrop handling (`#backdrop`) allowing seamless dismiss without blocking UI interactions | M5 | R2 |
| 3 | Batch Reorder Controls | Quick move up / move down controls for each `.bitem` | M5 | R2 |
| 4 | Batch Copy & Delimiter | Delimiter select (`#joinSel`), copy button (`#bcopy`), clear button (`#bclear`), paste button (`#bpaste`), auto-clear checkbox (`#autoclear`) | M5 | R2 |
| 5 | DOM Compatibility | Full test harness DOM element compatibility (#batchDrawer, #backdrop, #bbcount, #bcount, #joinSel, #autoclear, #bcopy, #bclear, #bpaste, .bitem) | M5 | R2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M5 | Glassmorphic Batch Drawer | Implement BatchDrawer.tsx + glassmorphism + reorder + DOM IDs | M1-M4 | DONE |

## Interface Contracts
- Props / State: Batch items array, drawer open state, moveUp/moveDown, copy, clear, paste, setJoinDelimiter, autoClear state.
