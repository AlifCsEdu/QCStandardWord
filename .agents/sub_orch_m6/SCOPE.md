# Scope: Milestone 6 - High-Contrast Cards, Tables & Visual Differentiation

## Objective
Implement Requirement R1 visual contrast & differentiation across defect cards (`.gcard`), list rows (`.row`), and table rows (`.trow`), category pill badges (`.rpill`), bold typography hierarchy (`.rtxt`, `.rnum`, `.racts`), clear hover states with 150ms ease transition, elevation & border glow, while maintaining 100% DOM class and data-attribute compatibility for testing.

## Work Items & Requirements
1. High-contrast border outlines (`#334155`) for defect cards (`.gcard`), list rows (`.row`), and table rows (`.trow`). [DONE]
2. Clear hover states (150ms ease transition) with subtle elevation & border glow. [DONE]
3. Category pill badges (`.rpill`) with distinct category-specific theme colors derived from `qcData.ts`. [DONE]
4. Bold typography hierarchy for titles (`.rtxt`), item numbers (`.rnum`), and action buttons (`.racts`). [DONE]
5. Maintain full test harness DOM compatibility (`.row`, `.gcard`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `data-id`). [DONE]
6. Zero build errors (`npm run build`) and 100% test pass rate (`npm run test`). [DONE]

## Milestones Status
| # | Name | Scope | Status |
|---|------|-------|--------|
| M6 | High-Contrast Cards, Tables & Visual Differentiation | Style defect cards, list rows, table rows, category pills, typography, hover transitions, test DOM compatibility | DONE |

## Interface & DOM Contracts
- Defect Card (Grid view): `.gcard`, contains `.rnum`, `.rtxt`, `.rpill`, `.racts`, `data-id`
- List Row (List view): `.row`, contains `.rnum`, `.rtxt`, `.rpill`, `.racts`, `data-id`
- Table Row (Table view): `.trow`, contains `.rnum`, `.rtxt`, `.rpill`, `.racts`, `data-id`
