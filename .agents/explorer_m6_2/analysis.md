# Milestone 6: Test Suite & DOM Compatibility Analysis

**Explorer**: Explorer 2 (Test Suite & DOM Compatibility Analyst)  
**Date**: 2026-08-07  
**Target Milestone**: M6 — High-Contrast Cards, Tables & Visual Differentiation  
**Target Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m6_2`

---

## 1. Executive Summary

This report presents a thorough audit of the test suite (`npm run test`) and DOM compatibility requirements for Milestone 6.
The primary objective of Milestone 6 is to achieve 2026-standard visual differentiation across List, Grid, and Table views — incorporating Deep Slate & Charcoal container contrast (`#0f172a` / `#1e293b`), sharp border outlines (`#334155`), smooth hover transitions (`150ms ease`), distinct category pill badges, and bold typography hierarchy — while ensuring **100% pass rate across all existing unit, empirical, stress, and workload tests**.

---

## 2. Test Suite Architecture & Targets

Running `npm test` executes:
```bash
node --test tests/**/*.test.js
```
The test suite consists of 9 test target files executed sequentially:

| Test File | Focus Area | Key DOM/Feature Assertions |
|---|---|---|
| `tests/m2_challenger_theme.test.js` | Theme Tokens & Mantine setup | CSS custom properties (`--bg-deep-slate`, `--container-charcoal`, `--border-contrast`, etc.), `data-mantine-color-scheme`, `data-theme` |
| `tests/m3_challenger_header_layout.test.js` | AppHeader & SegmentedControl | View mode switching (`list`, `grid`, `table`), search input `#search`, clear button `#clearBtn`, Spotlight trigger `#spotlightBtn` |
| `tests/m3_challenger_layout_and_resilience.test.js` | Sticky Navbar & Zero Layout Shift | `#subchips`, Navbar container, AppShell Main padding stability |
| `tests/m4_challenger_toast.test.js` | Floating Toast Notifications | `#toasts`, `.toast`, `.warn`, `.ticon`, `.toast-message`, `.tact`, `.tprogress` |
| `tests/m4_challenger_toast_stress.test.js` | Toast Stress & Undo Workflows | Auto-dismiss timer, icon mapping, XSS escaping, rapid action queuing |
| `tests/tier1-features.test.js` | End-to-End Feature Coverage (F1-F10) | `#listwrap`, `.row`, `.gcard`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `hasContrastBorder`, `hasHoverEase` |
| `tests/tier2-boundary.test.js` | Typos, Boundary & Resilience | Search typo distance, `<mark>` tag highlighting, `≈` fuzzy indicator pill `.fz`, XSS escaping |
| `tests/tier3-combinations.test.js` | Cross-Feature Pipelines | Grid view item selection, semicolon batch joiner, custom wording edits, undo from toast |
| `tests/tier4-workloads.test.js` | Technician & Supervisor Workloads | Table view compact layout, batch formatting with `\n`, export/import JSON, viewport metrics |

All test DOM querying occurs through `tests/harness.js`, which mounts `src/main.tsx` inside JSDOM using `esbuild.buildSync`.

---

## 3. Mandatory DOM Selectors, CSS Classes & Data Attributes Matrix

To maintain 100% test compatibility, all rendered wording components MUST expose the exact selectors and data attributes defined below:

### A. Layout Container & View Switcher
- **Container**: `<div id="listwrap" className={`listwrap ${layoutMode}`}>`
  - Required classes / attributes: `#listwrap`, `listwrap`, `grid` | `table` | `list` (or `data-layout="grid"|"table"|"list"`).
  - Test harness query: `document.querySelector('#listwrap, [data-testid="wording-container"]')`.
- **Empty State**: `<div id="empty">...</div>`.

### B. Defect Item Containers
- **List View Item**: `<div className="row" data-id={item.id}>` (or `[data-testid="defect-row"]`, `[data-testid="defect-item"]`, `.defect-row`).
- **Grid View Item**: `<div className="gcard" data-id={item.id}>` (or `[data-testid="defect-card"]`, `.defect-card`).
- **Table View Item**: `<div className="trow" data-id={item.id}>` (or `[data-testid="defect-row"]`, `.defect-table`).
- **Item ID Attribute**: `data-id={item.id}` (e.g. `data-id="b83"` or `data-id="b2"`). Mandatory for item selection.
- **Click Behavior**: Clicking the outer container MUST trigger item copy (`onCopyItem(item.t)`).

### C. Child Elements inside Item Container
| Child Element | Required Class Name | Fallback Test Selectors | Description & Content |
|---|---|---|---|
| Item Number | `.rnum` | `[data-testid="item-num"]`, `.item-number` | Displays defect number e.g. `#83` or `#b83` |
| Item Text | `.rtxt` | `[data-testid="item-text"]`, `.item-title`, `.item-text` | Displays defect title text. Supports `dangerouslySetInnerHTML` for `<mark>` search highlighting. |
| Fuzzy Indicator | `.fz` | `[data-testid="fuzzy-indicator"]`, `.fuzzy-badge` | Rendered inside `.rtxt` when `isApprox` is true. Contains text `≈`. |
| Category Badge | `.rpill` | `[data-testid="category-badge"]`, `[data-testid="pill-badge"]`, `.category-badge`, `.mantine-Badge-root` | Category pill badge displaying `item.c` e.g. `screen`, `battery`. |
| Actions Group | `.racts` | N/A | Flex wrapper for item action buttons. |

### D. Action Buttons inside `.racts`
| Action | Required Data Attribute | Class Name / Additional Attributes | Title / Text |
|---|---|---|---|
| Pin / Unpin | `data-act="pin"` | `className={`pin-btn ${isPinned ? 'pinned' : ''}`}` | `★` when pinned, `☆` when unpinned |
| Add to Batch | `data-act="add"` | `className="add-batch-btn"` | `+ Batch` |
| Edit (EditMode) | `data-act="edit"` | `className="edit-item-btn"` | `Edit` |
| Delete (EditMode)| `data-act="del"` | `className="del-item-btn"` | `Del` |

> **IMPORTANT**: In `clickItemAction(index, action)`, `harness.js` executes `rows[index].querySelector('[data-act="${action}"]')`. The `data-act` attributes (`pin`, `add`, `edit`, `del`) are **STRICTLY MANDATORY**.

---

## 4. View Components Architecture (List, Grid, Table)

Currently, wording items are rendered by three separate view components under `src/components/`:

1. **`WordingList.tsx`** (List View):
   - Outer container: `<div className="wording-list-body">`
   - Item container: `<div className="row" data-id={item.id}>`
   - Styling: Flex column, `padding: 10px 16px`, `border: 1px solid #e9ecef`, `transition: all 0.15s ease`.
2. **`WordingGrid.tsx`** (Grid View):
   - Outer container: `<div className="wording-grid-body">` (CSS Grid: `gridTemplateColumns: repeat(auto-fill, minmax(280px, 1fr))`, `gap: 12px`).
   - Item container: `<div className="gcard" data-id={item.id}>`
   - Styling: Flex column, card layout, `padding: 12px`, `border: 1px solid #e9ecef`.
3. **`WordingTable.tsx`** (Table View):
   - Outer container: `<div className="wording-table-body">`
   - Item container: `<div className="trow" data-id={item.id}>`
   - Styling: Compact row layout, `padding: 6px 12px`, `border: 1px solid #edf2f7`.

---

## 5. Category Pill Color System & Visual Differentiation

### Current Baseline vs M6 Target
- Currently, `.rpill` in all 3 components hardcodes `#f1f3f5` background and `#495057` text.
- In `src/data/qcData.ts`, `CATEGORIES` defines a distinct color palette for every category:
  - `codes`: `#7048e8` (Purple)
  - `screen`: `#1971c2` (Blue)
  - `camera`: `#15aabf` (Cyan)
  - `buttons`: `#f59f00` (Yellow/Amber)
  - `battery`: `#2f9e44` (Green)
  - `backcover`: `#b08020` (Gold)
  - `locks`: `#e03131` (Red)
  - `pen`: `#c2255c` (Magenta)
  - `water`: `#0b7285` (Teal)
  - `audio`: `#0ca678` (Emerald)
  - `body`: `#64748b` (Slate)
  - `system`: `#e8590c` (Orange)
  - `pinned`: `#e8930c` (Gold Orange)
  - `recent`: `#8a8577` (Muted)

### Implementation Strategy for Category Badges
Workers should map `item.c` (category ID) to category theme colors or Mantine badge color variants.
For Deep Slate dark mode (`#0f172a` bg, `#1e293b` container):
- Category pills should feature semi-transparent background tints with high-contrast text and border accent (e.g. `background: rgba(cyan, 0.15)`, `color: #38bdf8`, `border: 1px solid rgba(cyan, 0.3)`).
- Ensure `.rpill` class name remains intact for test harness inspection.

---

## 6. High-Contrast Border & Hover State Technical Requirements

Feature 9 (`tests/tier1-features.test.js`, lines 246-253) evaluates item DOM nodes as follows:
```js
const computedStyle = row.getAttribute('style') || '';
const className = row.className || '';
const hasContrastBorder = className.includes('border') || className.includes('card') || className.includes('trow') || className.includes('row') || computedStyle.includes('border');
const hasHoverEase = className.includes('hover') || className.includes('transition') || className.includes('row') || className.includes('gcard') || className.includes('trow');
```

### Contrast & Hover Requirements for M6:
1. **Container Colors**: Dark Slate container background `#1e293b` (Charcoal) or Mantine surface overrides.
2. **High-Contrast Border**: `border: 1px solid var(--border-contrast, #334155)` or `border: 1px solid #334155`.
3. **Hover Animation**: `transition: all 0.15s ease` (or `150ms ease-in-out`), with subtle transform `translateY(-2px)` or hover glow `box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15)` and border color shift to cyan (`#06b6d4`).
4. **Pinned Items**: Highlight pinned cards/rows with subtle amber/gold border tint (`border-color: #f59f00`, `background: rgba(245, 159, 0, 0.08)`).

---

## 7. Actionable Implementation Guidelines for Worker (Implementer)

### DO's:
1. **DO keep all DOM class names intact**: `.row`, `.gcard`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `.fz`, `.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn`.
2. **DO keep `data-id={item.id}`** on every item root container (`.row`, `.gcard`, `.trow`).
3. **DO keep `data-act` attributes** on action buttons (`data-act="pin"`, `data-act="add"`, `data-act="edit"`, `data-act="del"`).
4. **DO keep `#listwrap`** with layout mode class (`listwrap list`, `listwrap grid`, `listwrap table`).
5. **DO apply category color mapping** to `.rpill` elements so categories are visually distinct.
6. **DO ensure 150ms ease hover transition** and high contrast border (`#334155`) on `.row`, `.gcard`, and `.trow`.
7. **DO test with `npm test`** before finishing.

### DON'Ts:
1. **DON'T remove `<span className="fz">≈</span>`** when `isApprox` is true.
2. **DON'T strip `dangerouslySetInnerHTML`** or remove `<mark>` search query highlights inside `.rtxt`.
3. **DON'T alter button event stopPropagation** (`e.stopPropagation()`) — otherwise clicking action buttons will accidentally trigger full-row copy.
4. **DON'T break `e2e` test harness query helpers**.

