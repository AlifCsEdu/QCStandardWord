# Handoff Report: UI/UX Architecture & Feature Engine Specification

**From**: Explorer 3 (UI/UX & Feature Engine Explorer)  
**To**: Orchestrator / Implementer  
**Date**: 2026-08-07  

---

## 1. Observation

- **Original Legacy HTML File**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\standardwording.html` (3,946 lines, 150,505 bytes).
  - Lines 1–110: Root CSS custom properties (`:root[data-accent="..."]`, `:root[data-radius="..."]`, `:root[data-textsize="..."]`, `[data-theme="dark"]`).
  - Lines 2500–2574: 139+ QC defect wording entries defined in `BASE` array across 13 categories (`codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`).
  - Lines 2576–2667: 15 category descriptors (`CATS` array) and sub-category panel codes (`CODE_SUBS` array: `ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC`).
  - Lines 2782–2810: State management object containing query `q`, category `cat`, sub-category `sub`, view `layout`, `appearance`, `theme`, `density`, `pins` set, `recents`, `history`, `batch`, `join`, `autoclear`.
  - Lines 2860–2963: Search & ranking engine using `ALIAS` dictionary (`display: "screen"`, `stylus: "pen"`, `icloud: "lock"`, etc.), bounded Levenshtein distance `lev(a, b, cap)`, sub-sequence matching `subseq(t, h)`, and score-based ranking `rank(list, q)`.
  - Lines 3309–3326: Dual-strategy clipboard copy implementation (`navigator.clipboard.writeText` with off-screen `document.execCommand("copy")` fallback).
  - Lines 3444–3618: Inline Edit Mode, modal creation/update, deletion with 4.2s Undo toast, JSON import/export, and 2-step armed reset button.
  - Lines 3733–3839: Batch drawer joining with delimiters (`nl`, `comma`, `semi`, `space`), auto-clear toggle, single-item copying, item removal, and bulk clipboard paste parsing.
- **Original User Request**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md` specifying migration to React + Vite + Mantine UI v7 (`@mantine/core`, `@mantine/hooks`, `@tabler/icons-react`).

---

## 2. Logic Chain

1. **From Observation of CSS custom properties (lines 31–110)**: The legacy application relied on manual CSS variables for accent colors, radius, text sizes, and theme modes.  
   *Reasoning*: In Mantine v7, these are mapped directly into `MantineProvider` theme overrides (`colors`, `radius`, `fontSizes`) and `useMantineColorScheme()`, allowing type-safe customization without manual DOM data-attribute wrangling.
2. **From Observation of search engine logic (lines 2860–2963)**: The search implementation uses custom token matching, alias lookup, bounded Levenshtein distance, sub-sequence evaluation, and highlight markup.  
   *Reasoning*: This entire algorithm can be encapsulated into a standalone, pure TypeScript utility (`src/utils/searchEngine.ts`) with memoized execution, keeping React render loops ultra-fast and sub-millisecond.
3. **From Observation of layout view modes & batch drawer (lines 3138–3204, 3733–3839)**: The user switches between List, Grid, and Table layouts while appending defect items to a batch queue drawer.  
   *Reasoning*: Mantine v7's `AppShell` with `Drawer`, `SegmentedControl`, and responsive Grid layout components match these exact UI paradigms cleanly with zero custom CSS hackery.
4. **From Observation of state persistence (lines 2767–2810)**: All user preferences, pins, history, batch queue, custom edits, and deleted items are stored in 13 separate `localStorage` keys (`qc-appearance`, `qc-pins`, `qc-batch`, `qc-edits`, etc.).  
   *Reasoning*: Modern state management (such as Zustand with `persist` middleware or custom React hooks wrapping `localStorage`) will provide clean reactive state updates across all components while retaining exact key compatibility.

---

## 3. Caveats

- **PWA Capabilities**: Service Worker registration requires Vite's `vite-plugin-pwa` configuration. In local dev mode (`npm run dev`), PWA service workers are typically bypassed unless previewed with `npm run preview`.
- **Clipboard Permissions**: Bulk pasting from clipboard (`navigator.clipboard.readText`) requires user permission in modern browsers. Fallback error toast handling must be provided when browser blocks clipboard access.
- **No caveats regarding UI or algorithm specifications.**

---

## 4. Conclusion

The UI/UX architecture and feature engine specifications have been fully designed and documented in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_3\analysis.md`. The design leverages React 18/19, Vite, and Mantine v7 to provide:
1. Complete AppShell layout with dark/light theme switching, 7 accent palettes, 3 component radius levels, 3 text sizes, and cozy/compact density controls.
2. 3 View Modes: List view, Responsive Card Grid, and Compact Table view.
3. High-performance Fuzzy Search Engine with Levenshtein distance, token matching, sub-sequence scoring, alias expansion, substring highlighting, and approximate match indicators (`≈`).
4. Full Batch Clipboard Drawer supporting custom delimiters, item reordering/removal, auto-clear on copy, and bulk clipboard import/export.
5. Persistent State Layer with Pinning/Favorites, copy history feed, full inline Edit Mode (add, update, delete with Undo, JSON import/export, reset fallback), and PWA offline readiness.

---

## 5. Verification Method

To verify the specifications and subsequent implementation:
1. **Inspect Analysis Specification**:
   - Open `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_3\analysis.md` and check all 6 detailed sections.
2. **Implementation Build & Type Verification**:
   - Run `npm run build` once the codebase is generated to verify clean compilation without TypeScript errors.
3. **Algorithm Verification**:
   - Test search queries in the new app:
     - Query `"scrn crse"` -> Matches "Screen Crease" (Levenshtein fuzzy match).
     - Query `"icloud"` -> Matches "Screen Locked by Owner" / lock entries (Alias expansion match).
     - Query `"fcpb 1"` with "Codes" category -> Matches Front Cover Panel Black code 1.
4. **Invalidation Conditions**:
   - If search results fail to return typo matches within 5ms.
   - If clipboard copy fails on mobile Safari or Android Chrome.
   - If `localStorage` data fails to persist after browser page reload.
