## 2026-08-09T14:42:21Z
You are Worker 4 for Milestone 2 Iteration 4.
Your working directory is: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m2_4.
You MUST read:
- c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md
- c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m2_2_iter4\handoff.md
- c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m2_3_iter4\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task is to implement the consolidated Iteration 4 performance remediation package to bring Scenario 6 latency safely under threshold (<1000ms target, <2000ms limit) and achieve 100% test pass (195/195 tests, Exit Code 0):

1. `src/components/DefectCard.tsx`:
   - Avoid mounting full Radix DropdownMenuContent trees for all 140 cards when closed (render DropdownMenuContent conditionally or lazy-mount on open).
   - Wrap `DefectCard` in `React.memo` with custom comparison function checking props (`item.id`, `item.t`, `item.c`, `item.n`, `isPinned`, `isApprox`, `editMode`, `highlightedText`, `variant`).

2. `src/App.tsx`, `src/components/WordingContainer.tsx`, `AppHeader.tsx`, `CategoryChips.tsx`, `StatsDashboard.tsx`, `WordingList.tsx`, `WordingGrid.tsx`, `WordingTable.tsx`:
   - Wrap `WordingContainer`, `AppHeader`, `CategoryChips`, `StatsDashboard`, `WordingList`, `WordingGrid`, `WordingTable` in `React.memo`.
   - Wrap inline callbacks in `App.tsx` (`onClearSearch`, `onOpenBatchDrawer`, `onOpenSettings`, `onToggleMobile`, `handleToggleTheme`) in `useCallback` hooks.
   - Conditionally render `<CommandDialog>` in `App.tsx` only when `spotlightOpen` is true (`{spotlightOpen && <CommandDialog ... />}`).

3. `src/utils/searchEngine.ts` & `src/hooks/useQCState.ts`:
   - Cache `enrichItem` regex tokenization results for static `BASE_ITEMS`.
   - Short-circuit empty query processing (`query.trim() === ''`).
   - Wrap `activeItems`, `pinsSet`, and category counts in `useMemo` hooks.

4. Preserve existing normalization in `src/utils/categoryColors.ts` (.trim().toLowerCase()) and selector precision in `CategoryChips.tsx`.

5. Verification Execution:
   - First run `npm run build` using run_command to generate `dist/index.html`.
   - Next run `npx tsx --test "tests/**/*.{js,ts}"` using run_command.
   - Verify 100% test pass (195/195 tests, Exit Code 0, Scenario 6 latency < 2000ms / target < 1000ms).

6. Deliver a comprehensive handoff.md in c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m2_4\handoff.md with:
   - Observation: Exact changes made.
   - Logic Chain: Why each change resolves the issues.
   - Verification Results: Verbatim terminal output of npm run build and npm run test.
   - Conclusion & Status.

When finished, send a message back with your completion status and handoff file path.
