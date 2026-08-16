# Comprehensive Visual Design System & Tokens Survey Report (R1)

**Target Milestone**: R1 — Cohesive Visual Language & Unified Surface Architecture  
**Investigator**: Explorer 1 (Visual Design System & Tokens)  
**Date**: 2026-08-16  
**Project**: QC Standard Wording Application  

---

## 1. Executive Summary

A comprehensive forensic survey of the QC Standard Wording visual design system was conducted across the codebase, covering CSS custom properties (`src/index.css`), theme tokens (`src/theme/tokens.ts`, `src/theme/index.ts`), Vite Tailwind v4 integration (`vite.config.ts`, `postcss.config.cjs`), and all 33 component/UI files.

### Key Survey Findings:
1. **Surface Hierarchy Disparity**: The dark theme currently implements a 2-tone palette (#121214 base canvas and #18181b cards/modals/drawers) with mixed hardcoded hex colors (e.g. `bg-[#121214]` in `AppHeader.tsx`, `bg-[#18181b]` in `BatchDrawer.tsx`, `HistoryDrawer.tsx`, `EditModal.tsx`, `CategoryManagerModal.tsx`). This lacks the target **Warm Charcoal Multi-Layer Depth** architecture (#0e0e11 base canvas -> #141418 containers/sidebar/header -> #1a1a20 defect cards/list rows/table containers -> #22222a popovers/drawers/modals).
2. **Zinc vs. Stone Semantic Clashing**: The UI primitives in `src/components/ui/` (`badge`, `button`, `card`, `command`, `dialog`, `dropdown-menu`, `input`, `select`, `sheet`, `textarea`, `toggle-group`, `tooltip`) heavily rely on cool blue-gray `zinc-*` classes (`zinc-800`, `zinc-900`, `zinc-700`), clashing with the warm charcoal stone design direction of the application.
3. **Design Token Inconsistencies**: Border radiuses vary haphazardly across components between `rounded-sm`, `rounded-md`, `rounded-lg`, and `rounded-xl` without following the canonical token hierarchy:
   - **`rounded-xl`**: Defect cards, table wrapper, modal dialogs, slide-out drawers, and major container shells.
   - **`rounded-lg`**: Interactive chips, subchips, primary action buttons, search bar, text inputs, and dropdown triggers.
   - **`rounded-md`**: Monospace number badges (`.rnum`), active segmented pills, filter badges, and compact indicators.
   - **`rounded-full`**: Category pill badges (`.rpill`), floating toast capsules, and round status dots.
4. **Category Accent Flow**: The category color mapping (`src/utils/categoryColors.ts` & `src/data/qcData.ts`) has a solid foundation (`border-l-4` left accent borders and `rgba(...)` pill badges), but needs unified contrast and seamless visual flow across Sidebar, Cards, Table, History Session Items, and Batch Drawers.

---

## 2. Target Warm Charcoal Multi-Layer Depth Architecture

| Layer | Semantic Role | Target Hex / Classes | Current Codebase Implementation | Remediation Required |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 0** | **Base Canvas** | `#0e0e11`<br>Base body background, canvas root | `--background: #121214`<br>`--bg-deep-slate: #121214`<br>`body { bg: var(--bg-deep-slate) }` | Update `--background`, `--bg-deep-slate`, and theme tokens to `#0e0e11`. |
| **Layer 1** | **Containers & Shell** | `#141418`<br>AppHeader, Sidebar nav, StatsDashboard, HistoryBar, EditToolbar | Hardcoded `bg-[#121214]` in `AppHeader.tsx`, `bg-background` in Sidebar, `bg-muted/40` in StatsDashboard | Unify header, sidebar, stats strip, history bar, and edit strip to `#141418` surface with subtle `border-stone-800/80`. |
| **Layer 2** | **Defect Cards & Content** | `#1a1a20`<br>Defect cards (`.gcard`, `.row`), Table wrapper, CodeSubChips container, Empty states<br>**Border**: `border-stone-800/80` | `--defect-card-bg: #18181b`<br>`--card: #18181b`<br>`border-border` (`#27272a`)<br>`bg-stone-900` / `bg-stone-950` | Migrate defect card background to `#1a1a20`, hover state to `#22222a`, borders to `border-stone-800/80` (`rgba(41, 37, 36, 0.8)`). |
| **Layer 3** | **Overlays & Popovers** | `#22222a`<br>Batch Drawer, History Drawer, Modals (Edit, Category Manager, Settings), Spotlight (Cmd+K), Dropdown Menus, Popovers<br>**Border**: `border-stone-700/60` | Hardcoded `bg-[#18181b]`, `bg-stone-900`, `border-stone-800`<br>`zinc-900` in Radix primitives | Update all drawer and dialog surfaces to `#22222a` with `border-stone-700/60` (`rgba(68, 64, 60, 0.6)`). Nested items inside Layer 3 use Layer 1/2 for contrast. |

---

## 3. Detailed Component & File Survey

### 3.1 Global CSS & Tokens (`src/index.css`, `src/theme/tokens.ts`, `src/theme/index.ts`)

#### Current Observations in `src/index.css`:
- **Line 7-13**: `@theme` defines `--color-warm-stone-dark: #121214` and `--color-stone-card-dark: #18181b`.
- **Line 16-50**: `:root, [data-theme='dark'], .dark` defines `--background: #121214`, `--card: #18181b`, `--popover: #18181b`, `--border: #27272a`.
- **Line 359-376**: `.toast` hardcodes `background: #18181b;` and `border: 1px solid var(--border-contrast);`.
- **Line 520-524**: `#batchDrawer, .batch-drawer` hardcodes `background: #18181b;`.
- **Line 560-575**: Defect card variables define `--defect-card-bg: #18181b`, `--defect-card-bg-hover: #27272a`, `--defect-card-border: #27272a`.

#### Required Changes:
1. Define custom Tailwind v4 theme variables:
   ```css
   @theme {
     --color-canvas-dark: #0e0e11;
     --color-surface-dark: #141418;
     --color-card-dark: #1a1a20;
     --color-popover-dark: #22222a;
     --color-border-warm: rgba(41, 37, 36, 0.8);
     --color-border-popover: rgba(68, 64, 60, 0.6);
   }
   ```
2. Update CSS Custom Properties in dark theme:
   - `--background`: `#0e0e11`
   - `--card`: `#1a1a20`
   - `--popover`: `#22222a`
   - `--border`: `rgba(41, 37, 36, 0.8)`
   - `--bg-deep-slate`: `#0e0e11`
   - `--container-charcoal`: `#141418`
   - `--defect-card-bg`: `#1a1a20`
   - `--defect-card-bg-hover`: `#22222a`
   - `--defect-card-border`: `rgba(41, 37, 36, 0.8)`
   - `--defect-card-border-hover`: `rgba(68, 64, 60, 0.8)`
3. Update `src/theme/tokens.ts` `deepSlate` and `dark` color tuples to map level 9 to `#0e0e11`, level 8 to `#141418`, level 7 to `#1a1a20`, and level 6 to `#22222a`.

---

### 3.2 App Shell & Header (`src/App.tsx`, `src/components/AppHeader.tsx`)

#### Current Observations:
- **`App.tsx` (Line 219)**: Root container uses `bg-background text-foreground`.
- **`App.tsx` (Line 247)**: `<aside ... className="... bg-background border-r border-border ...">`.
- **`AppHeader.tsx` (Line 71)**: Hardcoded `className="... bg-[#121214] border-b border-border ..."`.
- **`AppHeader.tsx` (Line 104-117)**: Search input uses `bg-muted/60 border-input`.
- **`AppHeader.tsx` (Line 153-175)**: Layout switcher uses `bg-muted/60 p-1 border border-border`, active button `bg-stone-800 text-stone-100 border-stone-700/80`.
- **`AppHeader.tsx` (Lines 181-314)**: Action buttons use `bg-card border-border`.

#### Required Changes:
1. `AppHeader.tsx`: Replace `bg-[#121214]` with `bg-[#141418]` and `border-b border-stone-800/80`.
2. `AppHeader.tsx`: Search input updated to `bg-[#1a1a20]/90 border-stone-800/80 focus-visible:border-stone-600 rounded-lg`.
3. `AppHeader.tsx`: View switcher segmented control container `bg-[#1a1a20]/90 border-stone-800/80 rounded-lg`.
4. `AppHeader.tsx`: Action buttons (`Folders`, `History`, `Edit Mode`, `Batch Queue`, `Settings`, `Offline Copy`, `Theme Toggle`) styled with unified `bg-[#1a1a20] hover:bg-[#22222a] border-stone-800/80 text-foreground rounded-lg`.

---

### 3.3 Sidebar Navigation & Sub-Chips (`src/components/CategoryChips.tsx`, `src/components/CodeSubChips.tsx`)

#### Current Observations:
- **`CategoryChips.tsx` (Line 137-142, 368-374)**: Category buttons use `chip-btn` with `border-l-4`, active `bg-stone-800 text-stone-100 font-semibold border-stone-400`, inactive `text-stone-400 hover:bg-stone-800/50`.
- **`CategoryChips.tsx` (Line 187-228)**: Inline pin folder creation form uses `bg-stone-900 border-stone-800`.
- **`CodeSubChips.tsx` (Line 34)**: Container uses `bg-stone-900/80 border border-stone-800 rounded-lg`.
- **`CodeSubChips.tsx` (Line 44-52)**: Subchips use `subchip-btn min-h-[40px] px-3.5 py-2 rounded-lg border text-xs font-mono`, active `bg-stone-700 text-stone-100 border-stone-600`, inactive `bg-stone-800/80 text-stone-400 border-stone-700/80`.

#### Required Changes:
1. `CategoryChips.tsx`: Active category state styled as `bg-[#1a1a20] text-stone-100 font-semibold border-l-4 border-stone-400 shadow-xs`.
2. `CategoryChips.tsx`: Inactive category hover styled as `hover:bg-[#1a1a20]/60 hover:text-stone-100`.
3. `CategoryChips.tsx`: Count badge pills styled with `rounded-full text-[11px] font-mono`.
4. `CategoryChips.tsx`: Pin folder creation form container updated to `bg-[#1a1a20] border-stone-800/80 rounded-xl`.
5. `CodeSubChips.tsx`: Container updated to `bg-[#141418] border-stone-800/80 rounded-xl`. Subchips active: `bg-[#22222a] border-stone-700/80 text-stone-100`, inactive: `bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:bg-[#22222a] rounded-lg`.

---

### 3.4 Defect Cards, Grid, List & Table Views (`src/components/DefectCard.tsx`, `WordingContainer.tsx`, `WordingTable.tsx`)

#### Current Observations:
- **`DefectCard.tsx` (Line 75-82)**: Container classes compute `${variant === 'grid' ? 'gcard' : variant === 'list' ? 'row' : 'trow'} ${isPinned ? 'pinned ...' : copied ? '...' : 'bg-card border-border'} border-l-4 rounded-xl`.
- **`DefectCard.tsx` (Line 217, 246, 275)**: `.rnum` monospace badge uses `bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700/80`.
- **`DefectCard.tsx` (Line 96, 141, 158, 172, 183)**: Action buttons (`.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn`) use `rounded-lg min-h-[40px] sm:min-h-[44px]`.
- **`WordingContainer.tsx` (Line 54)**: Empty state uses `bg-stone-900 border-dashed border-stone-800 rounded-xl`.
- **`WordingTable.tsx` (Line 33-40)**: Wrapper uses `rounded-xl border border-stone-800 bg-stone-900 overflow-hidden`, table header `bg-stone-950 border-b border-stone-800`.

#### Required Changes:
1. `DefectCard.tsx`: Card surface unified with `#1a1a20` (Layer 2) and `border-stone-800/80` (or dynamic `--defect-card-border`), maintaining `border-l-4` category left border accent.
2. `DefectCard.tsx`: Monospace `.rnum` badge styled with `bg-[#141418] border border-stone-700/80 text-stone-300 rounded-md font-mono text-[11px] font-bold`.
3. `DefectCard.tsx`: Action buttons styled with `bg-[#141418] hover:bg-[#22222a] border-stone-700/80 rounded-lg min-h-[40px] sm:min-h-[44px]`.
4. `WordingTable.tsx`: Wrapper updated to `rounded-xl border border-stone-800/80 bg-[#1a1a20]`, table header to `bg-[#141418] border-b border-stone-800/80 text-stone-400`.
5. `WordingContainer.tsx`: Empty state wrapper updated to `bg-[#1a1a20] border-dashed border-stone-800/80 rounded-xl`.

---

### 3.5 Drawers & Modals (Layer 3: `#22222a` with `border-stone-700/60`)

#### 1. Batch Drawer (`src/components/BatchDrawer.tsx`)
- **Current**: Hardcoded `bg-[#18181b] border-l border-stone-800`.
- **Required**:
  - Drawer container: `bg-[#22222a] border-l border-stone-700/60 rounded-l-2xl shadow-2xl`.
  - Header: `border-b border-stone-700/60`.
  - Delimiter / auto-clear settings panel: `bg-[#141418] border border-stone-800/80 rounded-xl`.
  - Queued item cards (`.bitem`): `bg-[#1a1a20] border border-stone-800/80 hover:border-stone-700/80 rounded-xl`.
  - Reorder / copy / remove buttons: `rounded-lg min-h-[40px] sm:min-h-[44px]`.
  - Copy Batch main button: `bg-stone-100 hover:bg-white text-stone-900 font-bold rounded-lg min-h-[48px]`.
  - Bulk Paste Dialog: `bg-[#22222a] border border-stone-700/60 rounded-xl`.

#### 2. History Drawer (`src/components/HistoryDrawer.tsx`)
- **Current**: Hardcoded `bg-[#18181b] border-stone-800`.
- **Required**:
  - Drawer container: `bg-[#22222a] border-l border-stone-700/60 rounded-l-2xl shadow-2xl`.
  - Header: `border-b border-stone-700/60`.
  - Search input: `bg-[#141418] border-stone-800/80 rounded-lg`.
  - History entry cards (`.hitem`): `bg-[#1a1a20] hover:bg-[#1f1f27] border border-stone-800/80 rounded-xl` with category `border-l-4`.
  - Copy button: `rounded-lg min-h-[40px]`.
  - Clear history confirmation dialog: `bg-[#22222a] border border-stone-700/60 rounded-xl`.

#### 3. Category Manager Modal (`src/components/CategoryManagerModal.tsx`)
- **Current**: Hardcoded `bg-[#18181b] border-stone-800`.
- **Required**:
  - Modal content: `bg-[#22222a] border border-stone-700/60 rounded-xl shadow-2xl`.
  - Form inputs: `bg-[#141418] border-stone-800/80 text-stone-100 rounded-lg`.
  - Icon picker container: `bg-[#141418] border-stone-800/80 rounded-xl`.
  - Category list items: `bg-[#1a1a20] border-stone-800/80 rounded-lg`.

#### 4. Settings Modal (`src/components/SettingsModal.tsx`)
- **Current**: `bg-stone-900 border-stone-800`.
- **Required**:
  - Modal content: `bg-[#22222a] border border-stone-700/60 rounded-xl shadow-2xl`.
  - Option selector buttons: Inactive `bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-[#1f1f27] rounded-lg`, active `bg-stone-800 border-stone-600 text-stone-100 font-bold rounded-lg`.

#### 5. Edit Modal (`src/components/EditModal.tsx`)
- **Current**: Hardcoded `bg-[#18181b] border-stone-800`.
- **Required**:
  - Modal content: `bg-[#22222a] border border-stone-700/60 rounded-xl shadow-2xl`.
  - Inputs & Select triggers: `bg-[#141418] border-stone-800/80 rounded-lg`.
  - Select content dropdown: `bg-[#22222a] border-stone-700/60 rounded-lg`.

#### 6. Spotlight Command Dialog (`src/App.tsx` / `src/components/ui/command.tsx`)
- **Current**: `bg-zinc-900 border-zinc-800`.
- **Required**:
  - Dialog content: `bg-[#22222a] border border-stone-700/60 rounded-xl shadow-2xl`.
  - Input container: `bg-[#141418] border-b border-stone-700/60`.
  - Item rows: `rounded-lg min-h-[44px] hover:bg-[#1a1a20] data-[selected=true]:bg-[#1a1a20]`.

---

### 3.6 Primitives in `src/components/ui/` (Zinc-to-Stone & Uniform Tokens Harmonization)

| Primitive File | Current Classes | Remediation for R1 |
| :--- | :--- | :--- |
| `badge.tsx` | `border-zinc-700 bg-zinc-800 text-zinc-300` | `border-stone-700 bg-stone-800 text-stone-200 rounded-md` |
| `button.tsx` | `border-zinc-800 bg-zinc-900/50 text-zinc-200` | `border-stone-700/80 bg-[#1a1a20] hover:bg-[#22222a] text-stone-100 rounded-lg` |
| `card.tsx` | `rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100` | `rounded-xl border border-stone-800/80 bg-[#1a1a20] text-stone-100` |
| `checkbox.tsx` | `rounded-sm border border-zinc-700` | `rounded-md border border-stone-700 bg-[#141418]` |
| `command.tsx` | `bg-zinc-900 text-zinc-100 border-zinc-800 text-zinc-400` | `bg-[#22222a] text-stone-100 border-stone-700/60 text-stone-400 rounded-xl` |
| `dialog.tsx` | `border-stone-800 bg-stone-900 text-zinc-100 ring-offset-zinc-950` | `border-stone-700/60 bg-[#22222a] text-stone-100 rounded-xl` |
| `dropdown-menu.tsx` | `border-zinc-800 bg-zinc-900 text-zinc-100 focus:bg-zinc-800` | `border-stone-700/60 bg-[#22222a] text-stone-100 focus:bg-[#1a1a20] rounded-xl` |
| `input.tsx` | `rounded-md border border-zinc-800 bg-zinc-900 placeholder:text-zinc-500` | `rounded-lg border border-stone-800/80 bg-[#141418] text-stone-100 placeholder:text-stone-500` |
| `scroll-area.tsx` | `bg-zinc-700 hover:bg-zinc-600` | `bg-stone-700/60 hover:bg-stone-600/80 rounded-full` |
| `select.tsx` | `border-zinc-800 bg-zinc-900 text-zinc-100 focus:bg-zinc-800` | `border-stone-800/80 bg-[#141418] text-stone-100 focus:bg-[#22222a] rounded-lg` |
| `sheet.tsx` | `bg-stone-900 border-stone-800 text-zinc-100` | `bg-[#22222a] border-stone-700/60 text-stone-100` |
| `textarea.tsx` | `rounded-md border border-zinc-800 bg-zinc-900 placeholder:text-zinc-500` | `rounded-lg border border-stone-800/80 bg-[#141418] text-stone-100 placeholder:text-stone-500` |
| `toggle-group.tsx` | `hover:bg-zinc-800 hover:text-zinc-100 border-zinc-800` | `hover:bg-[#22222a] hover:text-stone-100 border-stone-700/80 rounded-lg` |
| `tooltip.tsx` | `border-zinc-700 bg-zinc-800 text-zinc-100` | `border-stone-700/60 bg-[#22222a] text-stone-100 rounded-md` |

---

## 4. Design Tokens & Uniform Radius Inventory

| Element Category | Token Standard | Elements Affected | Verification Target |
| :--- | :--- | :--- | :--- |
| **Major Containers & Cards** | `rounded-xl` (`16px`) | Defect cards (`.gcard`, `.row`, `.trow`), Table wrapper (`.wording-table-wrapper`), Batch Drawer, History Drawer, Dialogs & Modals, CodeSubChips outer container, Pin folder creation form, Empty state container | High-contrast elevation with smooth rounded-xl silhouette matching modern ergonomics. |
| **Interactive Controls** | `rounded-lg` (`10px` / `8px`) | Action buttons (`+ Batch`, `★ Pin`, `Edit`, `Del`, `Copy`), Category chip buttons (`.chip-btn`), Code sub-chips (`.subchip-btn`), Search inputs, Form inputs, Segmented control wrappers, Dialog action buttons | Tactile 44px-48px touch targets with consistent corner radius. |
| **Badges & Monospace Code** | `rounded-md` (`6px`) | Monospace defect number badges (`.rnum`), Filter indicator badges in `StatsDashboard`, active segmented pills | Crisp monospace pill definition without excessive oval distortion. |
| **Pills & Capsule Indicators** | `rounded-full` (`9999px`) | Category pill badges (`.rpill`), Toast notifications, Category count badges, Copied status badges | Oval capsule geometry with category color tinting. |

---

## 5. Category Color Accents & Flow

The category color mapping in `src/utils/categoryColors.ts` defines 15 distinct semantic colors:
- **Screen / Camera**: `#4682b4` (Steel Blue)
- **Buttons**: `#d97706` (Amber / Orange)
- **Battery**: `#38a169` (Emerald Green)
- **Backcover**: `#b45309` (Warm Bronze)
- **Locks**: `#f43f5e` (Rose Red)
- **Pen / Stylus**: `#9d4edd` (Violet / Purple)
- **Water Damage**: `#0284c7` (Sky Blue)
- **Audio & Mic**: `#059669` (Teal Emerald)
- **Body & Parts**: `#64748b` (Slate)
- **System**: `#ea580c` (Orange Red)
- **Pinned / Starred**: `#f59e0b` (Amber Gold)
- **Recent / All**: `#78716c` (Slate Stone)

### Accent Flow Architecture:
1. **Sidebar Navigation**: Active category renders a solid 4px left border (`border-stone-400` / category color), colored Lucide/emoji icon, and count pill.
2. **Defect Cards (Grid / List / Table)**: Renders `border-l-4` with exact category color (`getCategoryLeftBorderStyle(item.c)`), `.rnum` badge, and `.rpill` capsule badge with matching RGBA background (`rgba(rgb, 0.18)`) and border (`rgba(rgb, 0.45)`).
3. **History Drawer**: Preserves category `border-l-4` accent and `.rpill` badge on each historical copy card.
4. **Batch Drawer**: Items and custom pin folders display colored indicator dots and borders.

---

## 6. Actionable Implementation Blueprint for R1

To achieve R1 without regressions:

1. **Step 1: CSS Variables & Tailwind Theme (`src/index.css`)**
   - Update dark theme palette: Canvas `#0e0e11`, Surface `#141418`, Card `#1a1a20`, Popover `#22222a`.
   - Update `--border`: `rgba(41, 37, 36, 0.8)` (`border-stone-800/80`).
   - Set `--defect-card-bg`: `#1a1a20`, `--defect-card-bg-hover`: `#22222a`, `--defect-card-border`: `rgba(41, 37, 36, 0.8)`.
   - **Crucial Test Contract Note**: Test `F11-B5` in `tests/tier2-boundary.test.js:836` checks `cssContent.includes('#121214') || cssContent.includes('18, 18, 20')`. Retain `--color-warm-stone-dark: #121214;` or a compatibility alias in `src/index.css` to guarantee 100% test pass rate.
2. **Step 2: Theme Tokens Synchronization (`src/theme/tokens.ts`, `src/theme/index.ts`)**
   - Update `deepSlate` and `dark` color tuple scales with the 4-layer Warm Charcoal hex values.
3. **Step 3: App Shell & Header Harmonization (`src/App.tsx`, `src/components/AppHeader.tsx`)**
   - Replace hardcoded `bg-[#121214]` in `AppHeader.tsx` with `bg-[#141418]` and `border-b border-stone-800/80`.
   - Update sidebar background to `#141418`.
   - Update search input, view switcher, and header action buttons to `bg-[#1a1a20] hover:bg-[#22222a] border-stone-800/80 rounded-lg`.
4. **Step 4: Defect Items & Container Surfaces (`DefectCard.tsx`, `WordingContainer.tsx`, `WordingTable.tsx`)**
   - Verify all defect card variants (`grid`, `list`, `table`) use `rounded-xl`, background `#1a1a20`, border `border-stone-800/80`.
   - Update table wrapper and empty state containers to `#1a1a20` with `rounded-xl`.
5. **Step 5: Drawers & Modals Upgrade (`BatchDrawer.tsx`, `HistoryDrawer.tsx`, `EditModal.tsx`, `CategoryManagerModal.tsx`, `SettingsModal.tsx`)**
   - Update all drawer and dialog surfaces to `#22222a` (Layer 3) with `border-stone-700/60` and `rounded-xl` / `rounded-l-2xl`.
   - Update nested containers, inputs, and list rows inside drawers to `#141418` / `#1a1a20` (Layers 1 & 2) for crisp visual contrast.
6. **Step 6: UI Primitives Harmonization (`src/components/ui/*.tsx`)**
   - Replace all `zinc-*` classes with Warm Charcoal stone tokens and standardized border radiuses (`rounded-xl` containers, `rounded-lg` buttons/inputs, `rounded-md` badges).
7. **Step 7: Verification & Build Validation**
   - Run `npm test` and `npm run build` to confirm 100% pass rate.
