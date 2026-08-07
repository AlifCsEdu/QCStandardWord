# Dispatch for Explorer 1 - Milestone 6 Architecture & Styling Investigation

## Task
Investigate the codebase for Milestone 6: High-Contrast Cards, Tables & Visual Differentiation.

## Key Focus Areas
1. Examine `src/components/WordingContainer.tsx`, `src/components/DefectCard.tsx` (or any other rendering components for Grid, List, Table views).
2. Examine `src/data/qcData.ts` (or wherever categories and category colors are defined).
3. Examine existing CSS files, Mantine theme configuration (`src/theme/`), and class names (`.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`).
4. Examine existing tests (`src/__tests__` or similar) to identify exact DOM class and `data-id` requirements expected by the test harness.
5. Formulate concrete recommendations for:
   - High-contrast border outlines (`#334155`) for `.gcard`, `.row`, and `.trow`.
   - Hover states (150ms ease transition) with subtle elevation & border glow.
   - Category pill badges (`.rpill`) with category-specific colors from `qcData.ts`.
   - Bold typography hierarchy for `.rtxt`, `.rnum`, and `.racts`.
   - Preserving DOM attributes (`data-id`, classes) for tests.

Write your report to `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m6_1\analysis.md` and deliver `handoff.md`.
