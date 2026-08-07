# Milestone 6 Analysis: High-Contrast Cards, Tables & Visual Differentiation

**Author:** Explorer 3 (Milestone 6 Analysis)  
**Date:** 2026-08-07  
**Target Milestone:** Milestone 6 (High-Contrast Cards, Tables & Visual Differentiation)  
**Working Directory:** `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m6_3`

---

## 1. Executive Summary

Milestone 6 focuses on transforming the defect card, list row, and table row components (`.gcard`, `.row`, `.trow`) to fit the **2026 Modern Deep Slate & Charcoal** design specification. Currently, `WordingList.tsx`, `WordingGrid.tsx`, and `WordingTable.tsx` rely on hardcoded light-theme inline styles (`#ffffff`, `#e9ecef`, `#212529`, `#868e96`, `#f1f3f5`), causing visual harshness, poor dark mode contrast, lack of hover border cyan glow, generic category badges, and unrefined typography hierarchy.

This report presents a complete technical analysis and exact CSS/React specification for implementing high-contrast border outlines (`#334155`), fluid hover states (`150ms ease`, elevation, cyan border glow), category-specific pill colors derived from `qcData.ts`, bold typography hierarchy (`.rtxt`, `.rnum`, `.racts`), and clean Mantine v7 theme integration without layout shift or build regressions.

---

## 2. Current State Audit & Problem Analysis

### 2.1 Audit of Existing Component Files
1. **`src/components/WordingList.tsx`**:
   - Renders list rows with `.row`.
   - Uses hardcoded inline styles:
     - Container border: `border: '1px solid #e9ecef'`
     - Container bg: `background: isPinned ? '#fff9db' : '#ffffff'`
     - Text colors: `.rnum` (`#868e96`), `.rtxt` (`#212529`)
     - Category pill (`.rpill`): `background: '#f1f3f5'`, `color: '#495057'`
     - Action buttons: hardcoded `#ced4da`, `#ffffff`, `#1971c2`, `#e7f5ff`, etc.
2. **`src/components/WordingGrid.tsx`**:
   - Renders grid cards with `.gcard`.
   - Uses identical inline hardcoded light theme colors as `WordingList.tsx`.
   - Lacks hover elevation, scale lift (`translateY(-3px)`), or border cyan glow (`#06b6d4`).
3. **`src/components/WordingTable.tsx`**:
   - Renders compact table rows with `.trow`.
   - Uses hardcoded inline border (`#edf2f7`), light background (`#ffffff`), and static category pill.
4. **`src/theme/tokens.ts` & `src/theme/index.ts`**:
   - Defined tokens: Deep Slate (`#0f172a`), Charcoal (`#1e293b`), Contrast border (`#334155`), Cyan accent (`#06b6d4`), Sky accent (`#0284c7`).
   - Defined CSS variables in `src/index.css`: `--bg-deep-slate`, `--container-charcoal`, `--border-contrast`, `--accent-cyan`, `--text-primary`, `--text-secondary`.
   - Problem: Defect card/row components currently ignore these CSS custom variables and theme tokens due to hardcoded inline React styles.

---

## 3. High-Contrast & Visual Differentiation Specification

### 3.1 CSS Custom Variables for Defect Items
In `src/index.css`, add/extend root tokens for defect card states:

```css
:root,
[data-theme='dark'],
[data-mantine-color-scheme='dark'] {
  --defect-card-bg: var(--container-charcoal, #1e293b);
  --defect-card-bg-hover: #24334a;
  --defect-card-bg-pinned: rgba(245, 159, 0, 0.12);
  --defect-card-border: var(--border-contrast, #334155);
  --defect-card-border-hover: var(--accent-cyan, #06b6d4);
  --defect-card-border-pinned: rgba(245, 159, 0, 0.45);
  --defect-card-glow-hover: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 14px rgba(6, 182, 212, 0.22);
  --defect-rnum-color: #64748b;
  --defect-rnum-hover: var(--accent-cyan, #06b6d4);
  --defect-rtxt-color: var(--text-primary, #f8fafc);
  --defect-act-btn-bg: rgba(51, 65, 85, 0.4);
  --defect-act-btn-border: #334155;
  --defect-act-btn-color: #94a3b8;
}

[data-theme='light'],
[data-mantine-color-scheme='light'] {
  --defect-card-bg: #ffffff;
  --defect-card-bg-hover: #f8fafc;
  --defect-card-bg-pinned: #fff9db;
  --defect-card-border: #e2e8f0;
  --defect-card-border-hover: var(--accent-sky, #0284c7);
  --defect-card-border-pinned: #ffe066;
  --defect-card-glow-hover: 0 4px 16px rgba(2, 132, 199, 0.15);
  --defect-rnum-color: #94a3b8;
  --defect-rnum-hover: #0284c7;
  --defect-rtxt-color: #0f172a;
  --defect-act-btn-bg: #f1f5f9;
  --defect-act-btn-border: #cbd5e1;
  --defect-act-btn-color: #64748b;
}
```

### 3.2 Hover States & Animations (150ms ease)
- **Grid Cards (`.gcard`)**:
  - Border: `1px solid var(--defect-card-border)` (`#334155`).
  - Transition: `transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease`.
  - Hover effect:
    ```css
    .gcard:hover {
      transform: translateY(-3px);
      border-color: var(--defect-card-border-hover);
      box-shadow: var(--defect-card-glow-hover);
    }
    ```
- **List Rows (`.row`)**:
  - Transition: `transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease`.
  - Hover effect:
    ```css
    .row:hover {
      transform: translateY(-1px);
      border-color: var(--defect-card-border-hover);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3), 0 0 12px rgba(6, 182, 212, 0.18);
    }
    ```
- **Table Rows (`.trow`)**:
  - Transition: `border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease`.
  - Hover effect:
    ```css
    .trow:hover {
      border-color: var(--defect-card-border-hover);
      background-color: var(--defect-card-bg-hover);
    }
    ```

---

## 4. Dynamic Category Pill Styling (`.rpill`)

### 4.1 Color Definition from `qcData.ts`
Each category defined in `src/data/qcData.ts` has a specific color hex code. We map these to badge styling tokens:

| Category ID | Name | Theme Color Hex | Pill Dark Background | Pill Dark Border | Pill Text Color |
|---|---|---|---|---|---|
| `codes` | Codes | `#7048e8` | `rgba(112, 72, 232, 0.2)` | `rgba(112, 72, 232, 0.45)` | `#b197fc` |
| `screen` | Screen | `#1971c2` | `rgba(25, 113, 194, 0.2)` | `rgba(25, 113, 194, 0.45)` | `#74c0fc` |
| `camera` | Camera | `#15aabf` | `rgba(21, 170, 191, 0.2)` | `rgba(21, 170, 191, 0.45)` | `#66d9e8` |
| `buttons` | Buttons | `#f59f00` | `rgba(245, 159, 0, 0.2)` | `rgba(245, 159, 0, 0.45)` | `#ffd43b` |
| `battery` | Battery | `#2f9e44` | `rgba(47, 158, 68, 0.2)` | `rgba(47, 158, 68, 0.45)` | `#8ce99a` |
| `backcover` | Back Cover | `#b08020` | `rgba(176, 128, 32, 0.2)` | `rgba(176, 128, 32, 0.45)` | `#ffe066` |
| `locks` | Locks | `#e03131` | `rgba(224, 49, 49, 0.2)` | `rgba(224, 49, 49, 0.45)` | `#ff8787` |
| `pen` | Pen | `#c2255c` | `rgba(194, 37, 92, 0.2)` | `rgba(194, 37, 92, 0.45)` | `#f783ac` |
| `water` | Water Damage | `#0b7285` | `rgba(11, 114, 133, 0.2)` | `rgba(11, 114, 133, 0.45)` | `#3bc9db` |
| `audio` | Audio & Mic | `#0ca678` | `rgba(12, 166, 120, 0.2)` | `rgba(12, 166, 120, 0.45)` | `#63e6be` |
| `body` | Body & Parts | `#64748b` | `rgba(100, 116, 139, 0.2)`| `rgba(100, 116, 139, 0.45)`| `#cbd5e1` |
| `system` | System | `#e8590c` | `rgba(232, 89, 12, 0.2)` | `rgba(232, 89, 12, 0.45)` | `#ff922b` |

### 4.2 Clean Helper Implementation
Create `src/utils/categoryColors.ts`:
```typescript
import { CATEGORIES } from '../data/qcData.ts';

const CATEGORY_COLOR_MAP: Record<string, string> = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id.toLowerCase()] = cat.color;
  return acc;
}, {} as Record<string, string>);

export function getCategoryBadgeStyle(categoryKey: string) {
  const hex = CATEGORY_COLOR_MAP[categoryKey.toLowerCase()] || '#64748b';
  return {
    backgroundColor: `color-mix(in srgb, ${hex} 20%, transparent)`,
    borderColor: `color-mix(in srgb, ${hex} 50%, transparent)`,
    color: hex,
  };
}
```
In `.rpill` CSS:
```css
.rpill {
  display: inline-flex;
  align-items: center;
  font-size: 0.725rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid transparent;
  letter-spacing: 0.02em;
  text-transform: capitalize;
  transition: all 150ms ease;
}
```

---

## 5. Typography Hierarchy & Action Buttons Specification

### 5.1 Typography Hierarchy (`.rtxt`, `.rnum`)
- **`.rnum` (Defect Item Number)**:
  - Font: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  - Size: `0.85rem` (List/Grid), `0.8rem` (Table)
  - Weight: `700`
  - Color: `var(--defect-rnum-color)` (`#64748b`)
  - Hover: `color: var(--defect-rnum-hover)` (`#06b6d4`)
- **`.rtxt` (Defect Wording Title)**:
  - Font-size: `0.95rem` (List/Grid), `0.875rem` (Table)
  - Font-weight: `600`
  - Line-height: `1.4`
  - Color: `var(--defect-rtxt-color)` (`#f8fafc` dark / `#0f172a` light)
  - Fuzzy Search Indicator (`.fz`): `color: #f59f00; font-weight: 800; margin-right: 6px`

### 5.2 Action Buttons (`.racts`)
- **Pin Button (`.pin-btn`)**:
  - Default: Border `1px solid var(--defect-act-btn-border)`, background `var(--defect-act-btn-bg)`, color `#94a3b8`.
  - Hover: Border `#06b6d4`, color `#06b6d4`, background `rgba(6, 182, 212, 0.15)`.
  - Pinned State (`.pinned`): Border `1px solid #f59f00`, background `rgba(245, 159, 0, 0.2)`, color `#f59f00`.
- **Add to Batch Button (`.add-batch-btn`)**:
  - Default: Border `1px solid rgba(6, 182, 212, 0.4)`, background `rgba(6, 182, 212, 0.15)`, color `#38bdf8`, font-size `0.75rem`, font-weight `600`, border-radius `6px`.
  - Hover: Background `rgba(6, 182, 212, 0.3)`, border-color `#06b6d4`, color `#ffffff`.
- **Edit & Delete Buttons (`.edit-item-btn`, `.del-item-btn`)**:
  - Edit: Border `1px solid rgba(245, 159, 0, 0.5)`, background `rgba(245, 159, 0, 0.15)`, color `#ffd43b`.
  - Delete: Border `1px solid rgba(239, 68, 68, 0.5)`, background `rgba(239, 68, 68, 0.15)`, color `#fca5a5`.

---

## 6. Implementation Plan for Implementer

1. **CSS Updates in `src/index.css`**:
   - Add `.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn` rules with full dark slate/charcoal support and 150ms ease hover transitions.
2. **Refactor `src/components/WordingList.tsx`**:
   - Remove inline hardcoded hex values (`#e9ecef`, `#fff9db`, `#ffffff`, `#212529`, `#868e96`, `#f1f3f5`).
   - Use CSS classes (`row`, `rnum`, `rtxt`, `rpill`, `racts`) and dynamic category pill colors.
3. **Refactor `src/components/WordingGrid.tsx`**:
   - Remove inline hardcoded hex values.
   - Use CSS classes (`gcard`, `rnum`, `rtxt`, `rpill`, `racts`) and dynamic category pill colors.
4. **Refactor `src/components/WordingTable.tsx`**:
   - Remove inline hardcoded hex values.
   - Use CSS classes (`trow`, `rnum`, `rtxt`, `rpill`, `racts`) and dynamic category pill colors.
5. **Add Category Color Utility `src/utils/categoryColors.ts`**:
   - Export helper for badge colors.

---

## 7. Verification Method

- **Build Check**: `npm run lint` (`tsc --noEmit`) and `npm run build` (`tsc && vite build`).
- **Test Suite**: `npm test` (`node --test tests/**/*.test.js`).
- **DOM Verification**: Ensure test harness `getVisibleItems()` verifies `hasContrastBorder` and `hasHoverEase` for all items across list, grid, and table layout modes.
