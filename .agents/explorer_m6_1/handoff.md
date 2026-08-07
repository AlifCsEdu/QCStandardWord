# Handoff Report: Milestone 6 High-Contrast Cards, Tables & Visual Differentiation

## 1. Observation
Direct findings from inspecting codebase files, theme tokens, data definitions, test harness, and build/test outputs:

1. **View Components & Inline Styles**:
   - `src/components/WordingGrid.tsx`: Cards rendered with `.gcard` class and `data-id={item.id}` (lines 40-41), using hardcoded inline light styles: `border: '1px solid #e9ecef'`, `background: isPinned ? '#fff9db' : '#ffffff'`, `color: '#212529'`, `background: '#f1f3f5'`.
   - `src/components/WordingList.tsx`: List items rendered with `.row` class and `data-id={item.id}` (lines 33-34), using hardcoded inline light styles: `border: '1px solid #e9ecef'`, `background: isPinned ? '#fff9db' : '#ffffff'`.
   - `src/components/WordingTable.tsx`: Table rows rendered with `.trow` class and `data-id={item.id}` (lines 33-34), using hardcoded inline light styles: `border: '1px solid #edf2f7'`, `background: isPinned ? '#fff9db' : '#ffffff'`.
2. **Component Architecture & Missing `DefectCard.tsx`**:
   - `PROJECT.md` (line 55) and `DISPATCH.md` (line 7) list `src/components/DefectCard.tsx` as the component for defect cards/rows.
   - `src/components/DefectCard.tsx` does not exist on disk; item rendering is triply duplicated inline across `WordingGrid`, `WordingList`, and `WordingTable`.
3. **Category Color Definitions**:
   - `src/data/qcData.ts` (lines 145-236): Defines `CATEGORIES` array containing 15 category definitions with distinct color hex strings (`codes`: `#7048e8`, `screen`: `#1971c2`, `camera`: `#15aabf`, `buttons`: `#f59f00`, `battery`: `#2f9e44`, `backcover`: `#b08020`, `locks`: `#e03131`, `pen`: `#c2255c`, `water`: `#0b7285`, `audio`: `#0ca678`, `body`: `#64748b`, `system`: `#e8590c`, `pinned`: `#e8930c`, `all`/`recent`: `#8a8577`).
   - `.rpill` badges in current components do not consume these category colors and display generic light grey (`#f1f3f5`/`#495057`).
4. **Theme CSS Tokens**:
   - `src/index.css` (lines 5-19) and `src/theme/tokens.ts` (lines 14-55): Establish CSS custom properties `--bg-deep-slate: #0f172a`, `--container-charcoal: #1e293b`, `--border-contrast: #334155`, `--accent-cyan: #06b6d4`, `--accent-sky: #0284c7`, `--text-primary: #f8fafc`, `--text-secondary: #94a3b8`.
5. **Test Harness & DOM Requirements**:
   - `tests/harness.js` (lines 307-321): Queries `#listwrap .row, #listwrap .gcard, #listwrap .trow`, expects `data-id` attribute, `.rnum` (item number), `.rtxt` (item text), `.rpill` (category badge), `.fz` (fuzzy badge `≈`), `[data-act="pin"]`, `[data-act="add"]`, `[data-act="edit"]`, `[data-act="del"]`.
   - `harness.js` line 319 verifies `hasContrastBorder`: `className.includes('border') || className.includes('card') || className.includes('trow') || className.includes('row') || computedStyle.includes('border')`.
   - `harness.js` line 320 verifies `hasHoverEase`: `className.includes('hover') || className.includes('transition') || className.includes('row') || className.includes('gcard') || className.includes('trow')`.
6. **Command Execution Baseline**:
   - Executed command `npm run build && npm run test`.
   - Build output: `vite v6.4.1 building for production... ✓ built in 5.37s`.
   - Test output: `32 passed, 32 total` across 19 suites in 405ms.

---

## 2. Logic Chain
- **Step 1** (supported by Observation 1 & 4): The current defect item rendering components (`WordingGrid`, `WordingList`, `WordingTable`) use light-theme inline styles (`#ffffff`, `#e9ecef`, `#edf2f7`) that conflict with the 2026 Deep Slate (`#0f172a`) & Charcoal (`#1e293b`) color scheme and `#334155` border tokens.
- **Step 2** (supported by Observation 2): Because `DefectCard.tsx` is listed in `PROJECT.md` and item rendering logic is triply duplicated across view modes, creating `src/components/DefectCard.tsx` as a shared component will unify item rendering, remove code duplication, and enforce design token compliance across Grid, List, and Table views.
- **Step 3** (supported by Observation 3): `qcData.ts` defines clear hex colors for all 15 categories, but current `.rpill` badges use hardcoded grey inline styles. Connecting `.rpill` background/border/text styling to category colors will provide sharp visual differentiation.
- **Step 4** (supported by Observation 5): The test harness checks for specific classes (`.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `[data-act="..."]`) and `data-id` attributes, alongside `hasContrastBorder` and `hasHoverEase`. All refactored components must retain these exact DOM attributes and class names.
- **Step 5** (supported by Observation 6): The build and test suite currently pass 100%. Implementing the recommended styling and component architecture will preserve this 100% pass rate.

---

## 3. Caveats
- No code modifications were made to `src/` files during this read-only investigation, per agent role constraints.
- Implementation must ensure that hover transitions (`transition: 150ms ease`) do not introduce layout shifts or break `jsdom` test parsing in node test runners.

---

## 4. Conclusion
Milestone 6 is fully mapped out and ready for implementation. The recommended path is:
1. Create `src/components/DefectCard.tsx` to handle item rendering for Grid (`.gcard`), List (`.row`), and Table (`.trow`) views.
2. Update `src/index.css` with 2026 Deep Slate & Charcoal card/row styles (`border: 1px solid var(--border-contrast, #334155)`, `background: var(--container-charcoal, #1e293b)`, `transition: all 150ms ease`, hover translateY(-2px) / cyan glow).
3. Add a category color lookup utility (`getCategoryColor`) in `qcData.ts` or `DefectCard.tsx` to style `.rpill` category badges with category-specific colors.
4. Refactor `WordingGrid.tsx`, `WordingList.tsx`, and `WordingTable.tsx` to render `DefectCard`, maintaining exact DOM attributes (`data-id`, `.rnum`, `.rtxt`, `.rpill`, `[data-act="..."]`).

---

## 5. Verification Method
To verify the implementation independently:

1. **Build & Test Command**:
   ```bash
   npm run build && npm run test
   ```
   *Expected Output*: Build succeeds without TypeScript errors; 32/32 tests pass (including `Feature 9: High-Contrast Cards & Table Rows Layout Transitions`).

2. **DOM & Styling Code Inspection**:
   - Inspect `src/components/DefectCard.tsx`, `WordingGrid.tsx`, `WordingList.tsx`, `WordingTable.tsx`.
   - Verify top-level elements retain `.gcard`, `.row`, `.trow` class names and `data-id` attributes.
   - Inspect `src/index.css` for high-contrast border (`#334155`), charcoal background (`#1e293b`), and hover transitions (`150ms ease`, cyan glow `#06b6d4`).
