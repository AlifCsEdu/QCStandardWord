# TEST_READY: QC Standard Wording (Tablet S9+ & Raycast Overhaul)

## Executive Summary
Comprehensive automated testing infrastructure for the **QC Standard Wording** application overhaul. The suite validates touch ergonomics for Samsung Galaxy Tab S9+, 100% shadcn/ui and Radix UI styling, a 100% functional settings engine (theme, density, radius, font size, accent palettes, motion), category & sub-category management, and a dedicated rich inspection history drawer.

---

## Test Execution Commands

| Target | Command | Purpose |
|---|---|---|
| **Full Test Suite** | `npm test` | Executes all 23 test suites across Tiers 1-5 and specialized R1-R4 suites |
| **R1 Touch Ergonomics** | `npx tsx --test tests/r1-touch-ergonomics.test.js` | Minimum 44-48px touch targets, touch manipulation, sleek scrollbars, Radix primitives |
| **R2 Settings Engine** | `npx tsx --test tests/r2-settings-engine.test.js` | Theme (Dark/Light/Auto), Density, Radius, Font Size, 5 Accents, Reduced Motion |
| **R3 Category Manager** | `npx tsx --test tests/r3-category-manager.test.js` | Category & item CRUD, hybrid Lucide/Emoji picker, color derivation, reordering, sub-chips |
| **R4 History Drawer** | `npx tsx --test tests/r4-history-drawer.test.js` | Inspection history recording, timestamps, search, 1-click copy, batch coexistence, clear |
| **Tier 1 Feature Coverage** | `npm run test:tier1` | Feature-level functional validation across all primary UI modules |
| **Tier 2 Boundary Hardening** | `npm run test:tier2` | Boundary values, character limits, injection safety, spam clicks, memory safety |
| **Tier 3 Combinations** | `npm run test:tier3` | Pairwise cross-feature combinatorial pipelines |
| **Tier 4 Real-World Workloads**| `npm run test:tier4` | End-to-end quality inspector audit workflows on tablet |
| **Tier 5 Adversarial Hardening**| `npm run test:tier5` | 14-key localStorage corruption recovery, XSS sanitization, stress concurrency |

---

## Requirement Coverage Matrix

### R1: Samsung Tab S9+ Touch Ergonomics & 100% shadcn UI Styling
- **Touch Target Sizing**: Header controls (`#search`, `#spotlightBtn`, `#editBtn`, `#batchBtn`, `#setBtn`, `#themeBtn`), category tabs, and defect cards enforce comfortable touch target padding (`min-h-[44px]`, `min-h-[48px]`, `py-2`, `p-2.5`, `px-3`).
- **Tactile Feedback**: Active tap micro-states (`active:scale-95`, `active:scale-90`) on action buttons and drawer controls.
- **Scrollbar Styling**: Custom sleek WebKit and Firefox scrollbar rules across sidebar, defect container, and drawers.
- **Radix UI & shadcn Primitives**: Dialog, Sheet, Select, Checkbox, ToggleGroup, DropdownMenu, Tooltip, Badge, Card, Button.

### R2: 100% Functional Settings Engine
- **Theme Modes**: Dark (`data-theme="dark"`, `.dark`), Light (`data-theme="light"`), Auto (`matchMedia` system preference detection).
- **Density Modes**: Compact (`data-density="compact"`), Cozy (`data-density="cozy"`), Tablet.
- **Border Radius**: Sharp / 0px, Subtle / 6px, Medium / 10px, Rounded / 16px mapped to `--radius` and `data-radius`.
- **Text Size**: Small (13px), Normal (14px), Large (16px) mapped to `data-font-size` and `--font-size-base`.
- **Accent Colors**: 5 curated palettes (Warm Amber, Sage Emerald, Slate Stone, Rose Red, Ocean Blue) mapped to `data-accent` and `--accent-primary`.
- **Reduced Motion**: Full vs Reduced mode mapped to `data-motion="reduced"` with global animation/transition suppression.
- **Persistence & Sync**: Composite `qc-appearance` object and legacy keys `qc-theme`, `qc-density`, `qc-sort` preserved and synchronized in `localStorage`.

### R3: Category & Sub-Category Manager
- **Category & Defect CRUD**: Create, edit, and delete defect items/categories with localStorage persistence (`qc-custom`, `qc-edits`, `qc-dels`, `qc-categories`).
- **Hybrid Icon Selector**: Seamless mapping for 24 curated Lucide icons and custom emojis across sidebar navigation tabs and defect badge pills.
- **Category Colors**: High-contrast badge pill styles and left border accent indicators (`border-l-4`).
- **Category Organization**: Up/Down reordering and persistence in `qc-category-order` / `qc-categories`.
- **Sub-Category Code Editor**: Dynamic sub-code chips (FCPB, FCPW, FCPC, RCPB, RCPW, RCPC, FCDS, RCDS, PC) with live defect filtering.

### R4: Dedicated Rich History Panel / Inspection Log Drawer
- **Inspection Log Drawer**: Slide-out drawer feed displaying recent copy operations with relative timestamps ("Just now", "2m ago", "1h ago").
- **Search & Filter**: Search within history feed by defect wording, category, or item number.
- **One-Click Actions**: Re-copy directly from history chip/item with visual feedback; pin history item to custom folder; add all history items to batch queue.
- **Clear History**: Clear history action with confirmation dialog, synchronized to `qc-history-entries`, `qc-recents`, and `qc-history`.

---

## Test Infrastructure & Harness (`tests/harness.js`)
- **Execution Environment**: Node.js `node:test` + JSDOM with in-memory `esbuild` IIFE bundling of the full React 19 application.
- **Mocks**: In-memory `localStorage`, `navigator.clipboard`, `navigator.vibrate`, `matchMedia`, and `URL.createObjectURL`.
- **Dual-Mode Query Helpers**: Supports both legacy DOM selectors (`#search`, `#setmodal`, `#histbar`, `#hchips`, `#blist`, etc.) and modern `data-testid` selectors.
