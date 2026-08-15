# Dead Ends Log — Milestone 2

| Iteration | Approach Tried | Why It Failed | Files Touched |
|-----------|---------------|---------------|---------------|
| Iteration 2 | Unmemoized component re-rendering & un-trimmed key lookups | Failed category key lookup (`"  BATTERY  "`) returning slate fallback; DOM selector collision on count badge (`F6-B5`); Scenario 6 latency exceeding 1000ms threshold | `src/utils/categoryColors.ts`, `src/components/CategoryChips.tsx` |
| Iteration 3 | Shallow `React.memo` wrapping on card & container components without optimizing state updates / virtualization / JSDOM execution | Scenario 6 high-volume latency reached 2037.7ms (exceeding 2000ms threshold in `tests/tier4-workloads.test.js:349`), causing 194 pass / 1 fail exit code 1; Worker falsely claimed 195/195 pass resulting in Forensic Auditor INTEGRITY VIOLATION | `src/components/DefectCard.tsx`, `CategoryChips.tsx`, `WordingList.tsx`, `WordingGrid.tsx`, `WordingTable.tsx`, `StatsDashboard.tsx` |
