# Handoff Report — Residual Cyan/Purple Tropes Purge (Explorer 2)

## 1. Observation

A systematic grep search across `src/components/ui/` and global style/theme files revealed multiple lingering cyan (`cyan-*`, `focus:ring-cyan-500`, `bg-cyan-500`, `--accent-cyan`, `cyanAccent`) and purple (`text-purple-400`) classes.

Below are the verbatim findings per file:

### A. UI Primitives (`src/components/ui/`)

1. **`src/components/ui/badge.tsx`**
   - Line 6: `focus:ring-cyan-500` in badge base ring styles.
   - Line 11: `'border-cyan-500/30 bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25'` in default badge variant.

2. **`src/components/ui/button.tsx`**
   - Line 7: `focus-visible:ring-cyan-500` in button base focus ring styles.
   - Line 12: `'bg-cyan-500 text-zinc-950 shadow hover:bg-cyan-400 font-semibold'` in default button variant.
   - Line 22: `'text-cyan-400 underline-offset-4 hover:underline'` in link button variant.

3. **`src/components/ui/checkbox.tsx`**
   - Line 13: `focus-visible:ring-cyan-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 data-[state=checked]:text-zinc-950` in checkbox primitive styling.

4. **`src/components/ui/dialog.tsx`**
   - Line 44: `focus:ring-cyan-500` on DialogClose button.

5. **`src/components/ui/dropdown-menu.tsx`**
   - Line 107: `text-cyan-400` on Check icon in `DropdownMenuCheckboxItem`.
   - Line 130: `fill-cyan-400 text-cyan-400` on Circle icon in `DropdownMenuRadioItem`.

6. **`src/components/ui/input.tsx`**
   - Line 13: `focus-visible:ring-cyan-500` in input focus ring styles.

7. **`src/components/ui/select.tsx`**
   - Line 19: `focus:ring-cyan-500` in select trigger focus ring styles.
   - Line 125: `text-cyan-400` on Check icon in `SelectItem`.

8. **`src/components/ui/sheet.tsx`**
   - Line 65: `focus:ring-cyan-500` on SheetClose button.

9. **`src/components/ui/textarea.tsx`**
   - Line 12: `focus-visible:ring-cyan-500` in textarea focus ring styles.

10. **`src/components/ui/toggle-group.tsx`**
    - Line 7: `focus-visible:ring-cyan-500 data-[state=on]:bg-cyan-500/20 data-[state=on]:text-cyan-400 data-[state=on]:border-cyan-500/40` in toggle group item base styles.

### B. Global Styles, Theme & Notification Utils

11. **`src/index.css`**
    - Line 44: `--accent-cyan: #d4d4d8;` in dark theme custom variables.
    - Line 77: `--accent-cyan: #27272a;` in light theme custom variables.

12. **`src/theme/tokens.ts`**
    - Line 16: `cyanAccent: MantineColorTuple;` in colors type definition.
    - Lines 31-42: `cyanAccent: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0284c7', '#0369a1', '#075985']` tuple values.

13. **`src/theme/index.ts`**
    - Line 4: `primaryColor: 'cyanAccent',` in theme configuration.

14. **`src/utils/notifications.ts`**
    - Line 49: `return React.createElement(Copy, { size: 18, className: 'toast-icon-svg text-cyan-400' });`
    - Line 64: `return React.createElement(Pencil, { size: 18, className: 'toast-icon-svg text-purple-400' });`
    - Line 76: `return React.createElement(Check, { size: 18, className: 'toast-icon-svg text-cyan-400' });`

---

## 2. Logic Chain

1. **Requirement Analysis**: Requirement R1 mandates the complete elimination of neon cyan/purple design tropes and replacing them with the Raycast Warm Stone palette (`#121214` dark / `#fcfcfc` light, warm stone grey borders/focus rings `stone-400`/`stone-500`/`stone-700`/`stone-800`).
2. **Identification**: UI primitives currently rely on legacy `cyan-500` for focus rings across all form controls (input, textarea, select, checkbox, button, dialog close, sheet close, toggle group) and `bg-cyan-500`/`text-cyan-400` for default badges and primary action buttons.
3. **Replacement Strategy**:
   - Focus rings (`focus:ring-cyan-500`, `focus-visible:ring-cyan-500`) -> `focus:ring-stone-400` / `focus-visible:ring-stone-400` (provides crisp, tactile warm stone focus feedback).
   - Primary button (`bg-cyan-500 text-zinc-950 shadow hover:bg-cyan-400`) -> `bg-stone-100 text-stone-900 shadow hover:bg-stone-200 dark:bg-stone-200 dark:text-stone-950 dark:hover:bg-stone-300 font-semibold`.
   - Default badge (`border-cyan-500/30 bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25`) -> `border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700`.
   - Checkbox checked state (`data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 data-[state=checked]:text-zinc-950`) -> `data-[state=checked]:bg-stone-100 data-[state=checked]:border-stone-100 data-[state=checked]:text-stone-950`.
   - Checkbox / Radio item indicators (`text-cyan-400`, `fill-cyan-400`) -> `text-stone-200`, `fill-stone-200 text-stone-200`.
   - Toggle group active item (`data-[state=on]:bg-cyan-500/20 data-[state=on]:text-cyan-400 data-[state=on]:border-cyan-500/40`) -> `data-[state=on]:bg-stone-800 data-[state=on]:text-stone-100 data-[state=on]:border-stone-700`.
   - CSS variables & theme tokens (`--accent-cyan`, `cyanAccent`) -> `--accent-stone`, `stoneAccent` with Warm Stone palette tones.
   - Toast notification icons (`text-cyan-400`, `text-purple-400`) -> `text-stone-300` / `text-stone-200`.

---

## 3. Caveats

- **Scope boundary**: This investigation covered `src/components/ui/`, `src/index.css`, `src/theme/`, and `src/utils/notifications.ts`. Higher-level feature components (`src/App.tsx`, `src/components/StatsDashboard.tsx`) were cataloged by grep search and will be remediated in tandem or by designated implementers.
- **Theme backwards compatibility**: If external Mantine components inspect `theme.primaryColor`, renaming `cyanAccent` to `stoneAccent` requires keeping `stoneAccent` in `colors`.

---

## 4. Conclusion & Recommended Replacements

Every cyan and purple occurrence in UI primitives and global styles must be remediated with exact Raycast Warm Stone classes:

| Target File | Line(s) | Original Code Snippet | Recommended Replacement | Rationale |
|---|---|---|---|---|
| `src/components/ui/badge.tsx` | 6 | `focus:ring-cyan-500` | `focus:ring-stone-400` | Warm stone focus ring |
| `src/components/ui/badge.tsx` | 11 | `'border-cyan-500/30 bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25'` | `'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700'` | Warm stone dark badge |
| `src/components/ui/button.tsx` | 7 | `focus-visible:ring-cyan-500` | `focus-visible:ring-stone-400` | Warm stone focus ring |
| `src/components/ui/button.tsx` | 12 | `'bg-cyan-500 text-zinc-950 shadow hover:bg-cyan-400 font-semibold'` | `'bg-stone-100 text-stone-900 shadow hover:bg-stone-200 font-semibold dark:bg-stone-200 dark:text-stone-950 dark:hover:bg-stone-300'` | Human-crafted tactile button |
| `src/components/ui/button.tsx` | 22 | `'text-cyan-400 underline-offset-4 hover:underline'` | `'text-stone-300 hover:text-stone-100 underline-offset-4 hover:underline'` | Warm stone link text |
| `src/components/ui/checkbox.tsx` | 13 | `focus-visible:ring-cyan-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 data-[state=checked]:text-zinc-950` | `focus-visible:ring-stone-400 data-[state=checked]:bg-stone-100 data-[state=checked]:border-stone-100 data-[state=checked]:text-stone-950` | Crisp Warm Stone checkbox state |
| `src/components/ui/dialog.tsx` | 44 | `focus:ring-cyan-500` | `focus:ring-stone-400` | Warm stone dialog close focus |
| `src/components/ui/dropdown-menu.tsx` | 107 | `text-cyan-400` | `text-stone-200` | Warm stone checkmark icon |
| `src/components/ui/dropdown-menu.tsx` | 130 | `fill-cyan-400 text-cyan-400` | `fill-stone-200 text-stone-200` | Warm stone radio indicator |
| `src/components/ui/input.tsx` | 13 | `focus-visible:ring-cyan-500` | `focus-visible:ring-stone-400` | Warm stone input focus ring |
| `src/components/ui/select.tsx` | 19 | `focus:ring-cyan-500` | `focus:ring-stone-400` | Warm stone select focus ring |
| `src/components/ui/select.tsx` | 125 | `text-cyan-400` | `text-stone-200` | Warm stone checkmark |
| `src/components/ui/sheet.tsx` | 65 | `focus:ring-cyan-500` | `focus:ring-stone-400` | Warm stone sheet close focus ring |
| `src/components/ui/textarea.tsx` | 12 | `focus-visible:ring-cyan-500` | `focus-visible:ring-stone-400` | Warm stone textarea focus ring |
| `src/components/ui/toggle-group.tsx` | 7 | `focus-visible:ring-cyan-500 data-[state=on]:bg-cyan-500/20 data-[state=on]:text-cyan-400 data-[state=on]:border-cyan-500/40` | `focus-visible:ring-stone-400 data-[state=on]:bg-stone-800 data-[state=on]:text-stone-100 data-[state=on]:border-stone-700` | Warm stone active toggle item |
| `src/index.css` | 44 | `--accent-cyan: #d4d4d8;` | `--accent-stone: #d4d4d8;` | Rename legacy cyan CSS var |
| `src/index.css` | 77 | `--accent-cyan: #27272a;` | `--accent-stone: #27272a;` | Rename legacy cyan CSS var |
| `src/theme/tokens.ts` | 16, 31 | `cyanAccent: MantineColorTuple;` / `cyanAccent: [...]` | `stoneAccent: MantineColorTuple;` / `stoneAccent: ['#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c', '#292524', '#1c1917', '#0c0a09']` | Replace cyan palette with stone |
| `src/theme/index.ts` | 4 | `primaryColor: 'cyanAccent'` | `primaryColor: 'stoneAccent'` | Update primary theme key |
| `src/utils/notifications.ts` | 49 | `text-cyan-400` (Copy icon) | `text-stone-300` | Soft muted icon color |
| `src/utils/notifications.ts` | 64 | `text-purple-400` (Edit icon) | `text-stone-300` | Soft muted icon color |
| `src/utils/notifications.ts` | 76 | `text-cyan-400` (Check icon) | `text-stone-200` | Soft muted icon color |

---

## 5. Verification Method

To verify after implementation:

1. **Grep Search Verification**:
   Run grep search for any remaining `cyan` or `purple` in `src/components/ui/` and global theme/style files:
   ```pwsh
   grep -rn "cyan" src/components/ui/ src/index.css src/theme/ src/utils/notifications.ts
   grep -rn "purple" src/components/ui/ src/index.css src/theme/ src/utils/notifications.ts
   ```
   Expect zero matches.

2. **TypeScript & Build Verification**:
   Run static check and build:
   ```pwsh
   npm run build
   ```
   Must pass without any TypeScript or Tailwind compilation errors.

3. **Test Suite Verification**:
   ```pwsh
   npm run test
   ```
   All test suites must pass 100%.
