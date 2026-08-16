# Explorer 1 (Visual Design System & Tokens) — Handoff Report

**Target Milestone**: R1 — Cohesive Visual Language & Unified Surface Architecture  
**Role**: Explorer 1 (Visual Design System & Tokens)  
**Location**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_explorer_survey_1\handoff.md`  
**Full Analysis Report**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_explorer_survey_1\analysis.md`  
**Date**: 2026-08-16  

---

## 1. Observation

Direct code examination of visual styling, theme variables, and component implementation yielded the following verbatim findings:

1. **Global CSS Custom Properties (`src/index.css:7-50`)**:
   - Theme variables define `--color-warm-stone-dark: #121214;` (line 7), `--color-stone-card-dark: #18181b;` (line 9), `--color-warm-border-dark: #27272a;` (line 11).
   - `:root, [data-theme='dark'], .dark` defines `--background: #121214;`, `--card: #18181b;`, `--popover: #18181b;`, `--border: #27272a;`, `--bg-deep-slate: #121214;`, `--container-charcoal: #18181b;`.
   - Card variables (lines 562-574) define `--defect-card-bg: #18181b;`, `--defect-card-bg-hover: #27272a;`, `--defect-card-border: #27272a;`.
   - Batch drawer (line 522) hardcodes `background: #18181b;`.

2. **Hardcoded Inline Colors in App Shell & Drawers**:
   - `src/components/AppHeader.tsx:71`: `className="app-header sticky top-0 z-40 w-full border-b border-border bg-[#121214] px-4 sm:px-5 py-2.5 ..."`
   - `src/components/BatchDrawer.tsx:109`: `className="... fixed top-0 right-0 w-[420px] max-w-[92vw] h-full bg-[#18181b] border-l border-stone-800 z-[999] ..."`
   - `src/components/HistoryDrawer.tsx:96`: `className="history-drawer w-full sm:max-w-lg md:max-w-xl bg-[#18181b] border-stone-800 text-stone-100 p-0 ..."`
   - `src/components/CategoryManagerModal.tsx:165`: `className="max-w-3xl bg-[#18181b] border-stone-800 text-stone-100 p-6 ..."`
   - `src/components/EditModal.tsx:60`: `className="bg-[#18181b] border-stone-800 text-stone-100 max-w-md p-6"`
   - `src/components/SettingsModal.tsx:82`: `className="bg-stone-900 border-stone-800 text-stone-100 max-w-xl p-5 sm:p-6 ..."`

3. **Inconsistent Zinc vs. Stone Classes in UI Primitives**:
   - `src/components/ui/badge.tsx:12`: `secondary: 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'` vs `default: 'border-stone-700 bg-stone-800 text-stone-200'`.
   - `src/components/ui/button.tsx:16-20`: `outline: 'border border-zinc-800 bg-zinc-900/50 text-zinc-200'`, `secondary: 'bg-zinc-800 text-zinc-100'`, `ghost: 'text-zinc-300 hover:bg-zinc-800/80'`.
   - `src/components/ui/card.tsx:11`: `className="rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm transition-colors"`.
   - `src/components/ui/command.tsx:14,27,40`: `bg-zinc-900 text-zinc-100 border-zinc-800 text-zinc-400`.
   - `src/components/ui/input.tsx:13`: `className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 ..."`.
   - `src/components/ui/select.tsx:19,75`: `border-zinc-800 bg-zinc-900 text-zinc-100`.
   - `src/components/ui/sheet.tsx:31`: `bg-stone-900 ... border-stone-800 text-stone-100 ... ring-offset-zinc-950 data-[state=open]:bg-zinc-800`.

4. **Border Radiuses Across Components**:
   - Defect cards (`DefectCard.tsx:81`): `rounded-xl`.
   - Batch drawer items (`BatchDrawer.tsx:246`): `rounded-xl`.
   - History cards (`HistoryDrawer.tsx:182`): `rounded-lg` (should be unified `rounded-xl`).
   - Action buttons (`DefectCard.tsx:100,158`): `rounded-lg`.
   - Inputs (`Input.tsx:13`, `AppHeader.tsx:116`): `rounded-md` in primitive vs `rounded-lg` in header.
   - Number badges (`DefectCard.tsx:217`): `rounded` (should be `rounded-md`).
   - Category pill badges (`categoryColors.ts:211`, `DefectCard.tsx:222`): `rounded-full`.

5. **Category Color Accents**:
   - `src/utils/categoryColors.ts:136-144`: `getCategoryLeftBorderStyle(categoryKey)` returns `{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: color }`.
   - `src/utils/categoryColors.ts:122-131`: `getCategoryBadgeStyle(categoryKey)` calculates `backgroundColor: rgba(rgb, 0.18)` and `borderColor: rgba(rgb, 0.45)`.
   - Category palette defined in `src/data/qcData.ts:145-236` (15 categories mapped).

---

## 2. Logic Chain

1. **From Observation 1 & 2**: The current dark theme relies on flat 2-tone colors (`#121214` and `#18181b`) with multiple scattered hardcoded strings (`bg-[#121214]`, `bg-[#18181b]`). This does not provide the visual layering required by R1 for depth perception.
2. **From Logic Step 1**: Updating CSS Custom Properties (`--background`, `--bg-deep-slate`, `--container-charcoal`, `--card`, `--popover`, `--border`, `--defect-card-bg`) and component background classes to the 4-layer Warm Charcoal palette (#0e0e11 Layer 0 -> #141418 Layer 1 -> #1a1a20 Layer 2 with `border-stone-800/80` -> #22222a Layer 3 with `border-stone-700/60`) will establish a unified multi-layer elevation system across the entire application.
3. **From Observation 3**: The UI primitive library in `src/components/ui/` mixes cool `zinc-*` classes with warm `stone-*` classes, creating visual dissonance between Radix wrappers and application pages.
4. **From Logic Step 3**: Harmonizing `src/components/ui/*.tsx` to use the Warm Charcoal stone tokens and CSS variables will ensure cohesive styling across all dialogs, dropdowns, inputs, buttons, and badges.
5. **From Observation 4**: Token radiuses currently mix `rounded-sm`, `rounded-md`, `rounded-lg`, and `rounded-xl` without standardized rules.
6. **From Logic Step 5**: Enforcing `rounded-xl` for cards/drawers/modals, `rounded-lg` for interactive buttons/chips/inputs, `rounded-md` for monospace code badges/filters, and `rounded-full` for category pills/toasts establishes a clean token hierarchy matching modern tablet touch ergonomics.
7. **From Observation 5**: The category color mapping mechanism (`getCategoryLeftBorderStyle` and `getCategoryBadgeStyle`) is functionally complete and well-tested, providing consistent category accent flow across sidebar tabs, defect cards, table rows, and drawer items.

---

## 3. Caveats

- **Test Suite Contracts**: Tests in `tests/` explicitly assert certain CSS class names (e.g. `border-l-4`, `gcard`, `row`, `trow`, `rnum`, `rpill`, `chip-btn`, `bup`, `bdn`, `pin-btn`, `add-batch-btn`). All token and color enhancements must strictly preserve these existing CSS class names, test IDs, and DOM attributes.
- **`F11-B5` Test Contract**: `tests/tier2-boundary.test.js:836` checks that `src/index.css` includes `#121214` or `18, 18, 20` and `#fcfcfc` or `252, 252, 252`. When updating `src/index.css` to add the new Layer 0 `#0e0e11` and Layer 1 `#141418` variables, retain `--color-warm-stone-dark: #121214;` or equivalent variable/comment in `src/index.css` to ensure 100% test pass rate.
- **Light Theme Compatibility**: While R1 focuses on Warm Charcoal multi-layer depth for dark mode, all changes to `src/index.css` and primitives must preserve light theme contrast (`--background: #fcfcfc`, `--card: #ffffff`, `--border: #e4e4e7`).
- **Dynamic Appearance Settings**: The settings modal allows users to dynamically alter density (`compact`, `cozy`, `tablet`), radius (`0`, `6`, `10`, `16`), text size (`13`, `14`, `16`), motion (`full`, `reduced`), and accent colors. Token updates must integrate seamlessly with these root CSS variable overrides (`data-density`, `data-radius`, `data-text-size`, `data-accent`).

---

## 4. Conclusion

The visual system survey is complete. The codebase has a clean component structure that can readily adopt the **Warm Charcoal Multi-Layer Depth** architecture (#0e0e11 -> #141418 -> #1a1a20 -> #22222a) and uniform token hierarchy (`rounded-xl` cards/drawers, `rounded-lg` interactive chips/buttons, `rounded-md` badges, `rounded-full` pills) through targeted updates to:
1. `src/index.css` (CSS Custom Properties & theme definitions)
2. `src/theme/tokens.ts` (theme color tuples)
3. `src/components/AppHeader.tsx` (header surface & controls)
4. `src/components/CategoryChips.tsx` & `CodeSubChips.tsx` (sidebar surfaces & chips)
5. `src/components/DefectCard.tsx`, `WordingContainer.tsx`, `WordingTable.tsx` (card & table surfaces)
6. `src/components/BatchDrawer.tsx`, `HistoryDrawer.tsx`, `SettingsModal.tsx`, `EditModal.tsx`, `CategoryManagerModal.tsx` (Layer 3 drawers/modals)
7. `src/components/ui/*.tsx` (primitive token harmonization)

---

## 5. Verification Method

To verify the visual design system updates independently:

1. **Automated Test Suite**:
   ```bash
   npm test
   ```
   Must pass 100% of test suites across tier 1-5 features, latency stress, adversarial edge cases, and history drawer tests without regressions.

2. **TypeScript & Production Build Verification**:
   ```bash
   npm run build
   ```
   Must compile cleanly with zero TypeScript errors or asset bundling warnings.

3. **Visual Inspection Targets**:
   - Inspect `AppHeader.tsx` background: verify `#141418` container elevation.
   - Inspect `DefectCard.tsx` (`.gcard`, `.row`, `.trow`): verify `#1a1a20` background with `border-stone-800/80` and `border-l-4` category color accent.
   - Inspect `BatchDrawer.tsx` and `HistoryDrawer.tsx`: verify `#22222a` Layer 3 surface with `border-stone-700/60` and `rounded-l-2xl`.
   - Inspect `SettingsModal.tsx`, `EditModal.tsx`, `CategoryManagerModal.tsx`: verify `#22222a` modal surface with `rounded-xl`.
   - Inspect border radius tokens across cards (`rounded-xl`), buttons (`rounded-lg`), badges (`rounded-md`), and pills (`rounded-full`).
