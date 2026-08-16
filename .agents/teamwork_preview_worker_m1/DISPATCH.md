## 2026-08-16T04:13:31Z

You are Worker 1 for Milestone 1 (Visual Language & Unified Surface Architecture).
Working directory for your metadata: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_worker_m1 (create if needed, write progress.md and handoff.md there).
Project root: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Authoritative request: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\ORIGINAL_REQUEST.md
Master Project Plan: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
Survey Analysis: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_explorer_survey_1\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Assigned Scope & Tasks:
1. Implement Warm Charcoal Multi-Layer Depth across the entire application:
   - **Layer 0 (Base Canvas)**: `#0e0e11` for body canvas, root background (`--background: #0e0e11;`, `--bg-deep-slate: #0e0e11;`).
   - **Layer 1 (Containers / Sidebar / Header)**: `#141418` for `AppHeader` (replace `bg-[#121214]`), `CategoryChips` sidebar, `StatsDashboard`, `HistoryBar`, `EditToolbar` (`--container-charcoal: #141418;`). Retain legacy alias `--color-warm-stone-dark: #121214;` in `src/index.css` for test backward compatibility.
   - **Layer 2 (Defect Cards / List Rows / Table Containers)**: `#1a1a20` with `border-stone-800/80` (`rgba(41, 37, 36, 0.8)`) for `.gcard`, `.row`, `.trow`, `.wording-table-wrapper`, and empty states (`--card: #1a1a20;`, `--defect-card-bg: #1a1a20;`, hover `--defect-card-bg-hover: #22222a;`, `--border: rgba(41, 37, 36, 0.8);`).
   - **Layer 3 (Popovers / Drawers / Modals)**: `#22222a` with `border-stone-700/60` (`rgba(68, 64, 60, 0.6)`) for `BatchDrawer` (replace `bg-[#18181b]`), `HistoryDrawer` (replace `bg-[#18181b]`), `EditModal`, `CategoryManagerModal`, `SettingsModal`, `CommandDialog` (Cmd+K) (`--popover: #22222a;`).
2. Harmonize Design Tokens & Border Radius Hierarchy:
   - `rounded-xl` for defect cards, table wrapper, modals, and drawers.
   - `rounded-lg` for interactive chips, subchips, primary action buttons (`+ Batch`, `★ Pin`, `Edit`, `Del`), search inputs, form controls.
   - `rounded-md` for monospace number badges (`.rnum`), active segmented pills, filter badges.
   - `rounded-full` for category pill badges (`.rpill`), floating toast capsules, round count badges.
3. Stone-Harmonized UI Primitives:
   - Update `src/components/ui/` primitives (`badge.tsx`, `button.tsx`, `card.tsx`, `command.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `select.tsx`, `sheet.tsx`, `textarea.tsx`, `toggle-group.tsx`, `tooltip.tsx`) replacing cool `zinc-*` classes with warm `stone-*` tokens and unified surface depth.
4. Ensure Category Accent Synchronization:
   - Preserve 4px left accent borders (`getCategoryLeftBorderStyle`) and pill badge backgrounds (`getCategoryBadgeStyle`) across Sidebar, Defect Cards, Table rows, and Drawers.
5. Verification:
   - Execute `npm test` and ensure all 378+ tests pass with 0 failures.
   - Execute `npm run build` and ensure clean compilation with 0 TypeScript errors.
6. Write your comprehensive report to `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_worker_m1\handoff.md`, then send a message to parent.
