## 2026-08-07T14:09:55Z
You are Worker 1 for Milestone 5: Glassmorphic Non-Intrusive Batch Drawer of the QC Standard Wording application.
Your working directory is c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m5_1. Create this directory if it doesn't exist and write your artifacts (changes.md, handoff.md) here.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Scope:
Read ORIGINAL_REQUEST.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md, PROJECT.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md, SCOPE.md at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m5\SCOPE.md, and Explorer reports:
- c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m5_1\analysis.md
- c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m5_2\analysis.md
- c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m5_3\analysis.md

Tasks:
1. Update `src/hooks/useQCState.ts`:
   - Add `moveBatchItemUp(index: number)` and `moveBatchItemDown(index: number)` to state hook.
   - `moveBatchItemUp(index)` swaps element at `index` with `index - 1` when `index > 0`, updating state and saving updated `batchQueue` to `localStorage['qc-batch']`.
   - `moveBatchItemDown(index)` swaps element at `index` with `index + 1` when `index < batchQueue.length - 1`, updating state and saving updated `batchQueue` to `localStorage['qc-batch']`.
   - Ensure delimiter selection handles options `nl` (\n), `comma` (, ), `semi` (; ), `space` (' '), `pipe` ( | ), `bullet` ( • ).

2. Update `src/App.tsx`:
   - Retrieve `moveBatchItemUp` and `moveBatchItemDown` from `useQCState()`.
   - Pass `moveBatchItemUp` and `moveBatchItemDown` as props to `<BatchDrawer>`.

3. Update `src/components/BatchDrawer.tsx`:
   - Update backdrop overlay style on `#backdrop` to use `rgba(15, 23, 42, 0.4)` (or `var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))`) and backdrop filter `backdrop-filter: blur(8px)` (and `WebkitBackdropFilter: blur(8px)`).
   - Ensure non-intrusive backdrop handling when drawer is closed.
   - Maintain full DOM element compatibility:
     - `#batchDrawer`
     - `#backdrop`
     - `#bbcount`
     - `#bcount`
     - `#joinSel` (with options: newline, comma, semi, space, pipe, bullet)
     - `#autoclear`
     - `#bcopy`
     - `#bclear`
     - `#bpaste`
     - `.bitem` (with `data-bi={idx}`)
     - Move Up button (`.bup` or with `data-mvup={idx}`) per `.bitem` (calling `moveBatchItemUp(idx)`).
     - Move Down button (`.bdn` or with `data-mvdn={idx}`) per `.bitem` (calling `moveBatchItemDown(idx)`).
     - Copy button (`button[data-bc={idx}]` or `.bcopy-item`) per `.bitem`.
     - Remove button (`button[data-rm={idx}]` or `.brm-item`) per `.bitem`.

4. Verification:
   - Run `npm run build` and verify 0 compilation/type errors.
   - Run `npm run test` (or test scripts) and verify 100% test pass rate.
   - Include complete build and test execution logs in `handoff.md`.

5. Write changes summary to c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m5_1\changes.md and report to handoff.md. Send a message to parent (sub_orch_m5) when done.
