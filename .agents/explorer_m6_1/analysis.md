# Milestone 6 Investigation & Architecture Analysis: High-Contrast Cards, Tables & Visual Differentiation

## Executive Summary
This analysis details the architectural findings and styling recommendations for **Milestone 6: High-Contrast Cards, Tables & Visual Differentiation** in the QC Standard Wording application.

The objective of Milestone 6 is to replace remaining legacy light-mode inline styles across defect cards, grid items, and table rows with the **2026 Deep Slate & Charcoal design system** (`#0f172a` background, `#1e293b` containers, `#334155` high-contrast borders, `#06b6d4` cyan accents). Furthermore, item rendering must integrate category-specific accent colors from `src/data/qcData.ts`, provide smooth 150ms hover elevation and border glow effects, establish bold typography hierarchy, and preserve 100% test suite compatibility with existing DOM class names and `data-id` attributes.

---

## 1. Current Codebase Investigation & Audit

### 1.1 Layout Container (`src/components/WordingContainer.tsx`)
- **Location**: `src/components/WordingContainer.tsx` (Lines 35-95)
- **Role**: Serves as the primary container for defect wording items.
- **Observations**:
  - Renders wrapper `div` with `#listwrap` and dynamic class names `listwrap ${layoutMode}` (`grid`, `list`, or `table`).
  - Delegates rendering to `WordingGrid`, `WordingTable`, or `WordingList` based on `layoutMode`.
  - Empty state (`#empty`) already uses high-contrast borders (`border: 2px dashed var(--border-contrast, #334155)`) and charcoal container background (`var(--container-charcoal, #1e293b)`).

### 1.2 View Components (`WordingGrid.tsx`, `WordingList.tsx`, `WordingTable.tsx`)
- **Locations**:
  - `src/components/WordingGrid.tsx` (Grid view, `.gcard`)
  - `src/components/WordingList.tsx` (List view, `.row`)
  - `src/components/WordingTable.tsx` (Table view, `.trow`)
- **Observations**:
  - **Code Duplication**: All three components duplicate item rendering logic (item numbers, wording text, category pills, pin/batch/edit/delete buttons).
  - **Inline Light-Theme Styles**: Items are currently styled with hardcoded light-theme hex colors:
    - Card/Row Borders: `border: '1px solid #e9ecef'` or `#edf2f7` (light grey).
    - Card/Row Backgrounds: `background: isPinned ? '#fff9db' : '#ffffff'` (light yellow/white).
    - Text Colors: `color: '#212529'` (dark text on white background) and `color: '#868e96'`.
    - Category Badges (`.rpill`): `background: '#f1f3f5'`, `color: '#495057'` (light grey badge).
    - Action Buttons (`.racts`): Hardcoded light borders (`#ced4da`, `#1971c2`, `#e7f5ff`).
  - **Hover Effects**: Missing interactive hover elevation, cyan border glow, and transition styling in Grid and Table views.

### 1.3 Component Inventory & Missing `DefectCard.tsx`
- **Observations**:
  - `PROJECT.md` (Line 55) and `DISPATCH.md` reference `src/components/DefectCard.tsx` as the single individual card/row component.
  - Currently, `src/components/DefectCard.tsx` does **not** exist in the repository; item rendering is scattered inline inside `WordingGrid`, `WordingList`, and `WordingTable`.
  - **Refactoring Opportunity**: Creating `src/components/DefectCard.tsx` as a shared component supporting `variant="grid" | "list" | "table"` will unify styling, eliminate code duplication, and enforce design token compliance across all view modes.

### 1.4 Category Colors (`src/data/qcData.ts`)
- **Location**: `src/data/qcData.ts` (Lines 145-236)
- **Observations**:
  - The `CATEGORIES` array defines 15 distinct category objects, each containing a designated `color` property:
    - `all`: `#8a8577` (Muted Slate)
    - `codes`: `#7048e8` (Deep Purple)
    - `screen`: `#1971c2` (Royal Blue)
    - `camera`: `#15aabf` (Cyan)
    - `buttons`: `#f59f00` (Amber Yellow)
    - `battery`: `#2f9e44` (Emerald Green)
    - `backcover`: `#b08020` (Warm Bronze)
    - `locks`: `#e03131` (Crimson Red)
    - `pen`: `#c2255c` (Magenta Rose)
    - `water`: `#0b7285` (Deep Teal)
    - `audio`: `#0ca678` (Teal Green)
    - `body`: `#64748b` (Slate Grey)
    - `system`: `#e8590c` (Vibrant Orange)
    - `pinned`: `#e8930c` (Gold)
    - `recent`: `#8a8577` (Grey)
  - **Integration Gap**: Current view components do not consume these category colors for `.rpill` rendering.

---

## 2. Test Suite & DOM Selector Audit

### 2.1 Harness Requirements (`tests/harness.js`)
Inspection of `tests/harness.js` (Lines 304-334) reveals exact DOM expectations for Feature 9:

| Target Element | Required Selector / Attribute | Test Assertion / Purpose |
|----------------|------------------------------|--------------------------|
| Item Container | `#listwrap .row`, `#listwrap .gcard`, `#listwrap .trow` | Row element detection in List, Grid, Table modes |
| Dataset ID | `data-id={item.id}` | Primary item identifier in `getVisibleItems()` |
| Item Number | `.rnum` | Extracts `item.n` formatted string |
| Item Wording Text | `.rtxt` | Extracts `item.t` text content |
| Approximate Badge | `.fz` (containing `≈`) | Detects fuzzy search results |
| Category Badge | `.rpill` | Extracts category pill text (`item.c`) |
| Contrast Border | `hasContrastBorder` | Checked via `className.includes('border'|'card'|'row'|'trow')` or `style.includes('border')` |
| Hover Transition | `hasHoverEase` | Checked via `className.includes('hover'|'transition'|'row'|'gcard'|'trow')` |
| Pin Action | `[data-act="pin"]` | Button toggles pin state (`.pinned` class when active) |
| Add Batch Action | `[data-act="add"]` | Adds item wording to batch drawer queue |
| Edit Action | `[data-act="edit"]` | Opens edit modal (when edit mode active) |
| Delete Action | `[data-act="del"]` | Deletes item (when edit mode active) |

### 2.2 Test Results Baseline
Running `npm run build && npm run test` completes in ~0.4s with **32/32 tests passing (100% success rate)**. The design overhaul for Milestone 6 must maintain 100% pass rate.

---

## 3. Concrete Recommendations for Milestone 6 Implementation

### Recommendation 1: Create Shared Component `src/components/DefectCard.tsx`
Create `DefectCard.tsx` to encapsulate single item rendering for Grid, List, and Table layouts:
```tsx
export interface DefectCardProps {
  item: QCItem;
  variant: 'grid' | 'list' | 'table';
  isPinned: boolean;
  isApprox?: boolean;
  highlightedText?: string;
  editMode: boolean;
  onCopyItem: (text: string) => void;
  onTogglePin: (id: string | number) => void;
  onAddToBatch: (text: string) => void;
  onOpenEdit: (item: QCItem) => void;
  onDeleteItem: (item: QCItem) => void;
}
```
- **Grid Variant**: Renders top-level container `<div className="gcard hover-transition" data-id={item.id}>`.
- **List Variant**: Renders top-level container `<div className="row hover-transition" data-id={item.id}>`.
- **Table Variant**: Renders top-level container `<div className="trow hover-transition" data-id={item.id}>`.

### Recommendation 2: High-Contrast Dark Slate & Charcoal Styling (`#334155` Borders)
Replace inline light-mode colors with CSS variables or dark slate design tokens:
- **Card/Row Background**: `var(--container-charcoal, #1e293b)`
- **Border Outline**: `1px solid var(--border-contrast, #334155)`
- **Pinned State**:
  - `background: rgba(232, 147, 12, 0.12)`
  - `border-color: rgba(232, 147, 12, 0.6)`
  - Subtle gold tint providing visual prominence without harsh light yellow backgrounds.

### Recommendation 3: Smooth 150ms Hover Elevation & Cyan Border Glow
Add dedicated CSS classes in `src/index.css` for item hover dynamics:
```css
/* Milestone 6 High-Contrast Defect Cards & Rows Styling */
.gcard, .row, .trow {
  background: var(--container-charcoal, #1e293b);
  border: 1px solid var(--border-contrast, #334155);
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.gcard:hover, .row:hover, .trow:hover {
  border-color: var(--accent-cyan, #06b6d4);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(6, 182, 212, 0.2);
}

.gcard:hover {
  transform: translateY(-2px);
}

.row:hover {
  transform: translateX(2px);
}

.trow:hover {
  background: rgba(30, 41, 59, 0.95);
}
```

### Recommendation 4: Category-Specific Pill Badges (`.rpill`)
Create a helper function `getCategoryColor(categoryKey: string): string` utilizing `CATEGORIES` in `src/data/qcData.ts`:
```typescript
export const getCategoryColor = (categoryKey: string): string => {
  const cat = CATEGORIES.find((c) => c.id === categoryKey.toLowerCase());
  return cat ? cat.color : '#64748b';
};
```
Apply category color accents to `.rpill`:
- **Badge Style**: Pill shape (`border-radius: 9999px`), subtle background fill (`background: `${color}25``), solid border (`border: 1px solid ${color}80`), and high-contrast text (`color: ${color}`).

### Recommendation 5: Bold Typography Hierarchy & Action Control Buttons
- **`.rnum`**: Font weight `700`, color `var(--accent-cyan, #06b6d4)` (or cool slate `#94a3b8`), monospace/bold styling (`#item.n`).
- **`.rtxt`**: Primary wording text in `var(--text-primary, #f8fafc)`, font weight `500`/`600`.
- **`.racts` Action Buttons**:
  - `[data-act="pin"]`: Dark slate button with amber star highlight (`★` pinned / `☆` unpinned), `transition: all 150ms ease`.
  - `[data-act="add"]`: Cyan accent button (`+ Batch`), dark translucent background with cyan border glow.
  - `[data-act="edit"]` & `[data-act="del"]`: Orange/Red styled action controls for edit mode.

---

## 4. Verification & Implementation Plan
1. **Implement `DefectCard.tsx`**: Create component and refactor `WordingGrid`, `WordingList`, `WordingTable`.
2. **Add CSS Rule System**: Update `src/index.css` with `.gcard`, `.row`, `.trow`, `.rpill`, and `.racts` styling.
3. **Execute Build & Test Verification**: Run `npm run build && npm run test` to guarantee 100% pass rate.
