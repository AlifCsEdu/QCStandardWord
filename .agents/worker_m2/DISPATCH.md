## 2026-08-16T00:48:25+08:00
You are Worker M2 implementing Milestone R2: Defect Cards, List Rows, Table View & Inline Copy Micro-Interactions for the QC Standard Wording application.

Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Your agent metadata directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m2
Original Request: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md
Project Spec: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
Explorer Findings: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_survey_2\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Files You Own Exclusively:
- `src/components/DefectCard.tsx`
- `src/components/WordingContainer.tsx`
- `src/components/WordingGrid.tsx`
- `src/components/WordingList.tsx`
- `src/components/WordingTable.tsx`
- `src/index.css` (for any supporting animation keyframes)

Implementation Requirements:
1. Instant Copy Micro-Interactions:
   - Introduce localized `copied` state in `DefectCard.tsx` (with ~1200ms auto-reset).
   - On container click / copy trigger, activate a subtle border pulse and emerald ring glow (`ring-2 ring-emerald-500/40 border-emerald-500/70 bg-emerald-950/20`).
   - Render an animated inline `<span className="inline-copied-badge ...">Copied ✓</span>` badge with smooth entry/exit alongside `.rnum` and `.rpill`.
   - Ensure the global floating toast notification via `onCopyItem(item.t)` continues to fire seamlessly.
2. Typography & Visual Polish:
   - Enhance `.rnum` with an elevated capsule pill (`bg-stone-800/80 border border-stone-700/80 text-stone-300 font-mono text-[11px] font-bold`).
   - Elevate `.rtxt` text contrast (`text-stone-100 group-hover:text-white font-medium`) and clean line-height.
   - Refine spacing and layout alignment across Grid (`.gcard`), List (`.row`), and Table (`.trow`) views.
3. Tactile Action Buttons:
   - Add tactile click micro-states (`active:scale-90` / `active:scale-95`, warm amber active glow on star, stone-700/500 border transitions) to `.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn`.
4. Strict DOM Preservation:
   - Strictly PRESERVE all DOM query selectors and attributes: `.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `.pin-btn`, `.add-batch-btn`, `[data-id]`, `[data-act]`, `border-l-4`, inline `style.borderLeftColor`.
   - Ensure no forbidden `backdrop-blur-*` classes are introduced.
5. Verification:
   - Run `npm test` and ensure all test suites pass with 100% success rate (232+/232).
   - Run `npm run build` and ensure TypeScript compilation and Vite production build succeed with 0 errors.
6. Reporting:
   - Write your implementation details to `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m2\changes.md`.
   - Write your full handoff report to `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m2\handoff.md`.
   - Send a message back to parent with summary and test results.
