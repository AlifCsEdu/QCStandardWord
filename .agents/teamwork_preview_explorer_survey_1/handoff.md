# Phase 0 Survey: UI & Touch Ergonomics Specialist Report

**Target Workspace**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`  
**Authoritative Request**: `ORIGINAL_REQUEST.md`  
**Target Device Profile**: Samsung Galaxy Tab S9+ (12.4" Dynamic AMOLED 2X, 2800×1752, 16:10, Stylus + Touch Ergonomics)  
**Survey Agent**: Explorer 1 (UI & Touch Ergonomics Specialist)  
**Date**: 2026-08-16  

---

## 1. Observation

### 1.1 UI Framework & Dependency Stack
Directly observed in `package.json` (lines 20-53):
- **Core Framework**: React 19.2.8, React DOM 19.2.8, TypeScript 5.7.2, Vite 6.0.0.
- **Styling Engine**: Tailwind CSS v4.0.0 (`@tailwindcss/vite` 4.0.0, `tailwindcss` 4.0.0) with `@import "tailwindcss";` and `@theme` blocks in `src/index.css`.
- **Component Primitives**: Radix UI packages installed:
  - `@radix-ui/react-checkbox` (^1.1.4)
  - `@radix-ui/react-dialog` (^1.1.6)
  - `@radix-ui/react-dropdown-menu` (^2.1.6)
  - `@radix-ui/react-scroll-area` (^1.2.3)
  - `@radix-ui/react-select` (^2.1.6)
  - `@radix-ui/react-slot` (^1.1.2)
  - `@radix-ui/react-toggle-group` (^1.1.2)
  - `@radix-ui/react-tooltip` (^1.1.8)
- **Utility / UI Libraries**:
  - `lucide-react` (^0.475.0)
  - `cmdk` (^1.0.0)
  - `class-variance-authority` (^0.7.1), `clsx` (^2.1.1), `tailwind-merge` (^3.0.1)
  - `next-themes` (^0.4.4), `sonner` (^2.0.1)
- **PWA & Offline**: `vite-plugin-pwa` (^0.21.1)

### 1.2 Component Structure & Inventory
Directly observed in `src/components/` and `src/components/ui/`:

| Component Path | Underlying Primitive / Library | Role & Current State | Non-Shadcn / Inconsistent Patterns |
|---|---|---|---|
| `src/components/ui/button.tsx` | Radix Slot + CVA | Reusable button with standard variants | Touch targets: `sm` is 32px (`h-8`), default is 36px (`h-9`), below 44px tablet minimum |
| `src/components/ui/card.tsx` | Pure Tailwind wrapper | Card header, content, footer | Semantic styling present |
| `src/components/ui/checkbox.tsx` | Radix Checkbox | Styled checkbox | Available but not used in `BatchDrawer.tsx` |
| `src/components/ui/dialog.tsx` | Radix Dialog | Modal dialogues (`SettingsModal`, `EditModal`) | Wrapped in custom outer divs for test IDs |
| `src/components/ui/dropdown-menu.tsx` | Radix DropdownMenu | Pin-to-folder dropdown on defect cards | Functional and stops event propagation |
| `src/components/ui/input.tsx` | HTML input + Tailwind | Text inputs | `h-9` (36px) default |
| `src/components/ui/scroll-area.tsx` | Radix ScrollArea & Scrollbar | Custom scrollbar container | Available but **0 usages** in actual application views |
| `src/components/ui/select.tsx` | Radix Select | Custom Select dropdown with viewport | Available but **not used** in `EditModal.tsx` or `BatchDrawer.tsx` |
| `src/components/ui/sheet.tsx` | Radix Dialog (Sheet) | Slide-out panel (left/right/top/bottom) | Available but **not used** in `BatchDrawer.tsx` |
| `src/components/ui/toggle-group.tsx` | Radix ToggleGroup | Segmented toggle control | Available but **not used** in `AppHeader` or `SettingsModal` |
| `src/components/ui/badge.tsx` | CVA Badge | Badges | Used in `StatsDashboard.tsx` |
| `src/components/AppHeader.tsx` | Custom header + `Button`, `Input` | 3-column sticky top bar | Hardcoded `bg-[#121214]`, raw `<button>` segmented controls, `h-8`/`h-9` buttons |
| `src/components/StatsDashboard.tsx` | Custom strip + `Badge` | Compact status summary bar | Hardcoded `bg-stone-900/50` |
| `src/components/CategoryChips.tsx` | Custom buttons + Lucide SVG | Sticky sidebar category & pin folder nav | Raw `<button>` tabs with `py-1.5` (~30px height), lacks category management |
| `src/components/CodeSubChips.tsx` | Custom buttons | Subcategory chips for 'codes' | Raw `<button>` with `px-2.5 py-1 text-xs` (~26px height) |
| `src/components/DefectCard.tsx` | Custom card/row + `DropdownMenu` | Defect item renderer (grid/list/table) | Internal action buttons (`.pin-btn`, `.add-batch-btn`) are `py-1` (~26px height) |
| `src/components/BatchDrawer.tsx` | Custom fixed `div` with manual overlay | Slide-out batch queue panel | Custom `translate-x-full` div, raw `<select>` and `<input type="checkbox">` |
| `src/components/HistoryBar.tsx` | Custom horizontal strip | Top recent copy strip | Tiny horizontal chips, lacks rich inspection drawer, timestamps, search |
| `src/components/SettingsModal.tsx` | Radix `Dialog` + raw `<button>` grids | Appearance settings modal | Raw button grids, missing 'tablet' density, missing 5 accent themes |
| `src/components/EditModal.tsx` | Radix `Dialog` + raw `<select>` | Add/Edit defect modal | Native `<select id="mcat">` instead of Radix `Select` |
| `src/components/EditToolbar.tsx` | Custom strip + raw `<button>` | Edit mode controls | Raw `<button>` elements with `py-1.5` (~28px height) |

### 1.3 CSS, Theme Variables, and Styling Infrastructure
Directly observed in `src/index.css` and `src/theme/`:
1. **CSS Root Theme Variables**:
   - `src/index.css` (lines 15-84) defines `--background`, `--foreground`, `--card`, `--border`, `--input`, `--ring`, `--radius: 0.5rem` for `:root`, `[data-theme='dark']`, and `[data-theme='light']`.
   - However, application components (`App.tsx`, `AppHeader.tsx`, `CategoryChips.tsx`, `DefectCard.tsx`, `BatchDrawer.tsx`, `SettingsModal.tsx`) heavily use hardcoded utility classes like `bg-[#121214]`, `bg-stone-900`, `bg-stone-950`, `border-stone-800`, `text-stone-100`.
   - Consequence: When `data-theme="light"` is activated, `App.tsx` container (`bg-[#121214]`), `AppHeader.tsx` (`bg-[#121214]`), and `sidebarNav` (`bg-[#121214]`) stay dark because hardcoded hex/stone classes override semantic tokens.
2. **Scrollbar Configuration**:
   - `src/index.css` does not declare a global custom sleek scrollbar rule (`::-webkit-scrollbar` / `scrollbar-width: thin`).
   - Browser default scrollbars are visible on `#sidebarNav`, `#blist`, `#hchips`, causing visual clunkiness on desktop and Android tablet browsers.
3. **Mantine Legacy Tokens**:
   - `src/theme/tokens.ts` and `src/theme/index.ts` contain remnants of Mantine tuple structures (e.g. `deepSlate: MantineColorTuple`) that are no longer used by the Radix/Tailwind pipeline.

### 1.4 Touch Ergonomics & Samsung Galaxy Tab S9+ Specialist Findings
Directly observed across component layouts:
1. **Touch Target Dimensions**:
   - Standard minimum for finger touch targets (Apple HIG, Google Material 3, Samsung One UI): **44px × 44px to 48px × 48px**.
   - Codebase measurements:
     - Header buttons (`#editBtn`, `#batchBtn`, `#setBtn`, `#dlBtn`, `#themeBtn`): `h-8` (32px) × variable width.
     - Search Clear button (`#clearBtn`): `p-1` (~20px × 20px hit area).
     - View switcher buttons (`#setLayout button`): `py-1` (~24px height).
     - Sidebar category tabs (`.chip-btn`): `py-1.5` (~30-32px height).
     - Card action buttons (`.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn`): `px-2.5 py-1 text-xs` (~26-28px height).
     - Batch queue item actions (`.bup`, `.bdn`, `.bcopy-item`, `.brm-item`): `p-1.5` (~26px × 26px).
   - Finding: On a 12.4" high-DPI touch display (Samsung Tab S9+), buttons under 36px create frequent mis-taps, especially inside defect cards where tapping "+ Batch" or "★" can accidentally trigger the full card copy action (`onClick={handleCopy}`).
2. **Touch Scrolling & Inertial Physics**:
   - Scroll containers (`#sidebarNav`, `#blist`, `#wordingContainer`) lack `-webkit-overflow-scrolling: touch` and `overscroll-behavior-y: contain`.
   - On Android Chrome/Samsung Internet, fast vertical flings can cause pull-to-refresh or entire viewport rubber-banding.
   - Missing `touch-action: manipulation` on buttons to prevent 300ms double-tap delay.
3. **Tablet Thumb Reach Zones & Layout Densities**:
   - Landscape tablet usage (Galaxy Tab S9+): lateral grip places thumbs on left and right borders.
   - Left sidebar and right slide-out drawers (Batch Queue and new History Drawer) align well with natural thumb zones.
   - Currently, density options in `useAppearance.ts` and `src/types/qc.ts` are limited to `'cozy' | 'compact'`. The required `'tablet'` density (with 48px touch targets, larger tap padding, and scaled fonts) is not implemented.

### 1.5 Non-shadcn / Inconsistent UI Elements Requiring Standardization
1. **`EditModal.tsx:85`**: Native `<select id="mcat">` instead of Radix `Select` primitive.
2. **`BatchDrawer.tsx:214`**: Native `<input id="autoclear" type="checkbox">` instead of shadcn `Checkbox`.
3. **`BatchDrawer.tsx:105`**: Custom `div` overlay instead of shadcn `Sheet` / `SheetContent` component.
4. **`AppHeader.tsx:146` & `SettingsModal.tsx:51,75,98,121,144,167`**: Raw `<button>` lists instead of shadcn `ToggleGroup` / `ToggleGroupItem`.
5. **`HistoryBar.tsx`**: Tiny horizontal chip strip instead of rich slide-out History Drawer (`Sheet`).
6. **Scrollbars**: Native standard scrollbars across sidebar and drawer instead of shadcn `ScrollArea` and custom CSS sleek scrollbars.

---

## 2. Logic Chain

1. **Premise 1 (Requirement R1 & Touch Ergonomics)**: The user requires 100% touch-screen friendliness optimized for Samsung Galaxy Tab S9+ (min 44-48px touch targets, comfortable finger padding, smooth touch scrolling, 100% shadcn/ui component styling, custom sleek scrollbars).
2. **Observation Step**: In `AppHeader.tsx`, `CategoryChips.tsx`, `DefectCard.tsx`, and `BatchDrawer.tsx`, buttons have explicit CSS classes `h-8` (32px), `py-1` (24-28px), and `p-1.5` (26px). In `index.css`, no touch scrolling rules (`overscroll-behavior-y: contain`, `touch-action: manipulation`) or custom scrollbar rules exist.
3. **Inference 1**: Touch targets must be scaled up to at least 44px (cozy) / 48px (tablet density), with `touch-action: manipulation` added to all interactive elements, and custom scrollbar rules (`::-webkit-scrollbar` and `ScrollArea`) integrated across all panels.
4. **Premise 2 (Requirement R2 & Settings Engine)**: The user requires a 100% functional settings engine supporting Theme (Dark/Light/Auto), Density (Compact/Cozy/Tablet), Radius (0/6/10/16px), Font Size (Small 13px/Normal 14px/Large 16px), Accent Colors (Warm Amber/Sage Emerald/Slate Stone/Rose Red/Ocean Blue), and Reduced Motion toggle.
5. **Observation Step**: In `src/types/qc.ts` (lines 71-87), `DensityMode` is only `'cozy' | 'compact'`, `RadiusOption` is `'sharp' | 'soft' | 'round'`, `TextSizeOption` is `'s' | 'm' | 'l'`, and `src/index.css` lacks CSS variable declarations for the 5 accent palettes and dynamic font scaling. Hardcoded `bg-[#121214]` in `App.tsx` prevents Light theme from displaying correctly.
6. **Inference 2**: `useAppearance.ts`, `qc.ts`, and `index.css` must be expanded to support 3 density levels (including `tablet`), 4 radius values (0, 6, 10, 16px), 3 font sizes (13, 14, 16px), 5 rich accent palettes with live CSS variables (`--accent`, `--primary`, `--ring`), and reduced motion overrides. `App.tsx` and all components must replace hardcoded `bg-[#121214]` with theme-aware tokens (`bg-background`, `bg-card`, etc.).
7. **Premise 3 (Requirement R3 & Category Manager)**: The user requires an Advanced Category & Sub-Category Manager with Edit Mode (Create & Edit categories with hybrid icon selector [curated Lucide OR custom emoji], color picker, position placement; Reorder & Organize with localStorage persistence; Sub-Category Editor to add/edit/remove sub-code chips).
8. **Observation Step**: In `src/data/qcData.ts` (lines 145-236), `CATEGORIES` and `CODE_SUBS` are static immutable arrays. `CategoryChips.tsx` only allows CRUD on custom pin folders, not on defect categories or sub-code chips.
9. **Inference 3**: `useQCState.ts` must introduce dynamic category management (`qc-categories`, `qc-subcategories`) with initial seed from `CATEGORIES`/`CODE_SUBS`, a Category Manager Dialog/Drawer featuring a hybrid Lucide/Emoji picker and color picker, reordering controls, and sub-category chip editor.
10. **Premise 4 (Requirement R4 & Rich History Drawer)**: The user requires redesigning the History section from `#histbar` into a dedicated slide-out Inspection History Drawer with relative timestamps, search & filter, one-click copy, pin to folder, "Add all to batch queue", and clear history with confirmation.
11. **Observation Step**: `HistoryBar.tsx` is a simple horizontal strip storing `string[]` in `qc-recents`. It lacks timestamp metadata, search, filtering, pin actions, batch add, and confirmation dialogs.
12. **Inference 4**: A dedicated `HistoryDrawer.tsx` (using shadcn `Sheet` / `ScrollArea`) must be built with rich entry schema (`{ id, text, timestamp, category?, itemNumber? }`), search/filter bar, relative timestamp formatting ("Just now", "5m ago"), one-click copy, pin to folder dropdown, "Add All to Batch" button, and a Radix confirmation Dialog for clearing history, while keeping `#histbar` / `#hchips` compatible for backward compatibility.
13. **Premise 5 (Requirement R5 & Test Stability)**: The test harness in `tests/harness.js` boots the app in JSDOM and expects existing DOM IDs (`#appHeader`, `#search`, `#clearBtn`, `#spotlightBtn`, `#setLayout`, `#editBtn`, `#batchBtn`, `#bcount`, `#setBtn`, `#dlBtn`, `#themeBtn`, `#sidebarNav`, `#subchips`, `#statsDashboard`, `#wordingContainer`, `#listwrap`, `#batchDrawer`, `#joinSel`, `#autoclear`, `#bcopy`, `#bclear`, `#setmodal`, `#modal`, `#toasts`).
14. **Inference 5**: All DOM element IDs, data-attributes, and test IDs must be strictly preserved during all refactorings and standardizations to ensure 100% test pass rate across all 304 existing tests.

---

## 3. Caveats

1. **Test Harness Compatibility with Radix Select**:
   - In JSDOM, Radix Select renders portal overlays and pointer events that require specific event dispatching.
   - Recommendation: For `<select id="mcat">` and `<select id="joinSel">`, preserve a visually hidden fallback `<select className="sr-only">` alongside the interactive Radix `Select` / `SegmentedControl` so JSDOM automated tests querying `select#mcat` or `select#joinSel` continue to function without flaky timing issues.
2. **Backward Compatibility of Storage Keys**:
   - `qc-recents` and `qc-history` currently store `string[]` in existing tests.
   - When introducing rich timestamped history items (`HistoryEntry[]`), the state manager must support both legacy string arrays and structured history objects seamlessly.
3. **Tailwind v4 `@theme` vs CSS Variables**:
   - Tailwind v4 uses CSS variables natively in `@theme`. All dynamic styling (radius, font-size, density, accents) should be applied via root CSS variables on `document.documentElement` (`--radius`, `--font-size-base`, `--accent-color`, `--spacing-multiplier`) rather than requiring full CSS re-compilation.

---

## 4. Conclusion & Implementation Blueprint

### 4.1 Touch Ergonomics & UI Standardization Architecture
1. **Touch Target Dimensions**:
   - `compact`: 40px min touch height.
   - `cozy`: 44px min touch height (standard default).
   - `tablet`: 48px min touch height with 12px finger padding between adjacent interactive elements.
   - Add `touch-manipulation` to all buttons, chips, and card items to eliminate 300ms mobile touch delay.
   - Add `-webkit-overflow-scrolling: touch` and `overscroll-behavior-y: contain` to all scrollable viewports.
2. **100% shadcn / Radix Component Standardization**:
   - Replace raw `<select>` in `EditModal.tsx` with Radix `Select` + `SelectTrigger` + `SelectContent`.
   - Replace raw `<input type="checkbox">` in `BatchDrawer.tsx` with shadcn `Checkbox`.
   - Wrap `BatchDrawer.tsx` and new `HistoryDrawer.tsx` in shadcn `Sheet` / `SheetContent` / `ScrollArea`.
   - Standardize segmented controls in `AppHeader` and `SettingsModal` to shadcn `ToggleGroup`.
   - Replace hardcoded `bg-[#121214]` with `bg-background` / `bg-card` / `border-border` semantic tokens across the entire codebase to fix Light theme.
   - Add global sleek custom scrollbars in `src/index.css` via WebKit & Firefox CSS rules.

### 4.2 Settings Engine Architecture (R2)
- **Theme**: `dark` | `light` | `auto` with flawless semantic color mapping in `index.css`.
- **Density**: `compact` (36-40px targets) | `cozy` (44px targets) | `tablet` (48-52px targets, generous finger padding).
- **Radius**: `0` (0px) | `6` (6px) | `10` (10px) | `16` (16px) mapped to `--radius`.
- **Font Size**: `small` (13px) | `normal` (14px) | `large` (16px) mapped to `--base-font-size`.
- **Accent Colors**: 5 rich palettes with CSS variable tokens:
  - Warm Amber: `--primary: #f59e0b; --ring: #f59e0b;`
  - Sage Emerald: `--primary: #10b981; --ring: #10b981;`
  - Slate Stone: `--primary: #78716c; --ring: #78716c;`
  - Rose Red: `--primary: #f43f5e; --ring: #f43f5e;`
  - Ocean Blue: `--primary: #0ea5e9; --ring: #0ea5e9;`
- **Reduced Motion**: `full` | `reduced` with CSS `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important;`.

### 4.3 Category & Sub-Category Manager Architecture (R3)
- Dynamic Category Store in `useQCState` synced to `qc-categories` and `qc-subcategories`.
- Category Editor Dialog with:
  - Hybrid Icon Picker (24 curated Lucide icons + Emoji text input / quick emoji palette).
  - Color Picker (6 preset swatches + custom hex).
  - Category name, description, and position ordering.
  - Sub-Category Editor with chip adder/remover for sub-codes.

### 4.4 Rich History Drawer Architecture (R4)
- Slide-out `HistoryDrawer.tsx` (using shadcn `Sheet` / `ScrollArea`):
  - Search & filter history items by wording or category.
  - Relative timestamps ("Just now", "2m ago", "1h ago", "Yesterday").
  - One-click copy with tactile `Copied ✓` feedback.
  - "Pin to Folder" dropdown for each history item.
  - "Add All to Batch" button to bulk add recent history into the batch queue.
  - "Clear History" button with Radix Dialog confirmation.
  - Preserves `#histbar`, `#hchips`, `data-hcopy`, and `#hclearAll` DOM hooks.

---

## 5. Verification Method

### 5.1 Automated Test Execution
Run the full test suite verifying 100% pass rate:
```bash
npm test
```
Target: 0 failures across all 304 existing unit, integration, stress, and adversarial test cases, plus new test suites for R1-R4 features.

### 5.2 Build & Bundle Verification
Run production build to ensure zero TypeScript errors and clean PWA bundle generation:
```bash
npm run build
```
Target: 0 TypeScript errors, bundle generated in `./dist` with `sw.js` and `manifest.webmanifest`.

### 5.3 Touch Ergonomics & Responsive Verification
1. Inspect computed CSS on touch targets (`AppHeader`, `CategoryChips`, `DefectCard`, `BatchDrawer`, `HistoryDrawer`) verifying bounding boxes `>= 44px × 44px` on cozy mode and `>= 48px × 48px` on tablet density.
2. Verify `touch-action: manipulation` on all interactive buttons and `overscroll-behavior-y: contain` on scrollable containers.
3. Verify Light theme toggle switches all surfaces to `#fcfcfc` / `#ffffff` with dark text and no remaining hardcoded dark containers.
4. Verify custom sleek scrollbars render cleanly on `#sidebarNav`, `#blist`, and main containers.
