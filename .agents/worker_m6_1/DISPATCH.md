# Dispatch for Worker - Milestone 6 Implementation

## Task
Implement Milestone 6: High-Contrast Cards, Tables & Visual Differentiation of the QC Standard Wording application.

## Specifications & Requirements
1. **High-Contrast Border Outlines**:
   - Apply `#334155` border outlines to defect cards (`.gcard`), list rows (`.row`), and table rows (`.trow`).
   - Deep Slate background (`#0f172a`), Charcoal containers (`#1e293b`), contrast borders (`#334155`).

2. **Hover States & Animations**:
   - 150ms ease transition (`transition: all 0.15s ease` / `0.15s ease-in-out`).
   - Subtle elevation & border glow on hover (e.g. translateY(-3px), border cyan highlight `#06b6d4`, glow box-shadow).

3. **Category Pill Badges (`.rpill`)**:
   - Dynamic category theme colors derived from `CATEGORIES` in `src/data/qcData.ts`.
   - Distinct translucent background tint & category text color for all 15 categories (codes, screen, camera, buttons, battery, locks, pen, water, audio, etc.).

4. **Typography & Action Buttons Hierarchy**:
   - `.rnum`: Monospace font, 700 weight, item number.
   - `.rtxt`: Bold hierarchy (600/700 weight), readable line height.
   - `.racts`: Action buttons (`[data-act="pin"]`, `[data-act="add"]`, `[data-act="edit"]`, `[data-act="del"]`).

5. **DOM Test Harness Compatibility**:
   - MUST maintain exact class names: `.row`, `.gcard`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `.fz`.
   - MUST maintain `data-id={item.id}` on each item container.
   - MUST maintain `[data-act="pin"]`, `[data-act="add"]`, `[data-act="edit"]`, `[data-act="del"]` on action buttons.
   - MUST maintain `#listwrap` wrapper with mode classes (`listwrap list`, `grid`, `table`).

6. **Verification Requirements**:
   - Run `npm run build` to verify zero TypeScript or build errors.
   - Run `npm run test` to verify 100% test pass rate across all test suites.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your report to `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m6_1\changes.md` and deliver `handoff.md`.
