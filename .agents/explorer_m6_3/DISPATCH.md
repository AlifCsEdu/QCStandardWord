# Dispatch for Explorer 3 - CSS & Mantine Theme Styling Focus

## Task
Investigate Mantine theme customization, CSS/Modules/Styles, and visual contrast specs for Milestone 6.

## Key Focus Areas
1. Read `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Inspect `src/theme/`, index CSS/Global CSS, and component styles.
3. Check how Mantine UI v7 components (`Card`, `Table`, `Badge`, `Text`, `Button`, etc.) are currently styled and how custom class names (`.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`) are applied.
4. Detail how to implement:
   - High-contrast border outlines (`#334155`) for `.gcard`, `.row`, `.trow`
   - Hover states (`150ms ease` transition, elevation/box-shadow, border glow)
   - Category pill badges (`.rpill`) with category-specific colors derived from `qcData.ts`
   - Bold typography hierarchy for `.rtxt`, `.rnum`, `.racts`
5. Detail how to integrate these styles cleanly with Mantine v7 without breaking existing theme or layouts.

Write your report to `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m6_3\analysis.md` and deliver `handoff.md`.
