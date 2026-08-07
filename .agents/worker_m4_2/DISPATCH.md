## 2026-08-07T13:49:41Z
You are Worker 2 for Milestone 4 (Floating Toast Notifications & Copy Feedback - Iteration 2 Fixes).
Your working directory is: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m4_2.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Inputs:
1. Read ORIGINAL_REQUEST.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md.
2. Read PROJECT.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md.
3. Read SCOPE.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m4\SCOPE.md.
4. Read Reviewer 2 Handoff Report at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\reviewer_m4_2\handoff.md.
5. Read Forensic Auditor Handoff Report at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\auditor_m4_1\handoff.md.
6. Read Explorer Iteration 2 Handoff & Analysis Reports:
   - c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m4_it2\handoff.md
   - c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m4_it2\analysis.md

Your Scope / Deliverables:
Implement the exact fixes specified in `explorer_m4_it2/analysis.md` across `src/utils/notifications.ts`, `src/hooks/useQCState.ts`, `src/components/ToastsContainer.tsx`, `src/index.css`, and `tests/harness.js`:

1. Fix `src/utils/notifications.ts`:
   - Create named icon wrapper helper `createNamedIcon(TablerComponent, name)` so that returned icons have `type.name` matching contract expectations (`AlertTriangle`, `Copy`, `Plus`, `Trash`, `ArrowBackUp`, `Pencil`, `Download`, `Upload`, `Refresh`, `Check`).
2. Fix `src/hooks/useQCState.ts`:
   - Implement timer tracking for toast auto-dismissal using `toastTimersRef = useRef<Map<string, Timeout>>` so rapid dispatches do not drop active toasts out-of-order or purge queue state prematurely.
   - Refactor `deleteWordingItem` to perform targeted granular per-item filters (`setQcDels(prev => prev.filter(id => id !== item.id))`) on undo callback, preserving out-of-order undo actions.
3. Fix `tests/harness.js`:
   - Strip leading `#` in `getVisibleItems` (`replace(/^#/, '')`) so item numbers match test queries (e.g. `'9999'` instead of `'#9999'`).
   - Add harness helper method aliases `copyWording` and `addBatchItem` if needed by test suites.
4. Verification:
   - Run `npm run build` to confirm zero compilation errors.
   - Run `npm run test` (which executes `node --test tests/**/*.test.js`) to verify 100% test pass rate across ALL test suites (including challenger tests).
   - Record exact build and test command outputs in your handoff report.
5. Deliverables:
   - Create `changes.md` and `handoff.md` in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m4_2\`.
   - Send a message back to parent when complete referencing handoff.md path.
