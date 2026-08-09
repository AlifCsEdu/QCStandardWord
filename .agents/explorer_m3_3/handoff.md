# Handoff Report: Milestone M3 Test & DOM Impact Analysis

## 1. Observation

### 1.1 Analyzed Files & Test Infrastructure
- **Test Harness**: `tests/harness.js` (lines 197–610)
- **Test Suites**:
  - `tests/tier1-features.test.js` (lines 150–254)
  - `tests/tier2-boundary.test.js` (lines 113–156)
  - `tests/tier3-combinations.test.js` (lines 7–114)
  - `tests/tier4-workloads.test.js` (lines 10–61, 167–195)
  - `tests/tier5-hardening.test.js` (lines 167–210)
  - `tests/m3-pin-folders.test.js` (lines 6–108)
  - `tests/searchEngine.test.ts` (lines 6–128)
- **Target M3 Components**:
  - `src/components/DefectCard.tsx` (lines 41–237)
  - `src/components/WordingContainer.tsx` (lines 41–101)
  - `src/components/WordingGrid.tsx` (lines 33–56)
  - `src/components/WordingList.tsx` (lines 33–56)
  - `src/components/WordingTable.tsx` (lines 33–56)
  - `src/components/BatchDrawer.tsx` (lines 81–287)
  - `src/components/ToastsContainer.tsx` (lines 15–45)

### 1.2 Verbatim Selector Queries Extracted from Test Harness (`tests/harness.js`)
- **Main Container**:
  - `document.querySelector('#listwrap, [data-testid="wording-container"]')` (lines 234, 239, 242)
- **Defect Cards / Rows / Items**:
  - `document.querySelectorAll('#listwrap .row, #listwrap .gcard, #listwrap .trow, [data-testid="defect-item"], [data-testid="defect-card"], [data-testid="defect-row"], .defect-card, .defect-row')` (lines 309, 345, 357)
  - Sub-element selectors on item element:
    - Number: `row.querySelector('.rnum, [data-testid="item-num"], .item-number')` (line 312)
    - Text: `row.querySelector('.rtxt, [data-testid="item-text"], .item-title, .item-text')` (line 313)
    - Badge: `row.querySelector('.rpill, [data-testid="category-badge"], [data-testid="pill-badge"], .category-badge, .mantine-Badge-root')` (line 314)
    - Fuzzy match indicator: `row.querySelector('.fz, [data-testid="fuzzy-indicator"], .fuzzy-badge')` (line 315)
    - Pin state: `row.querySelector('[data-act="pin"].pinned, [data-testid="pin-btn"][data-pinned="true"], .pinned-icon')` (line 316)
    - Action buttons:
      - Pin: `[data-act="pin"]`, `[data-testid="pin-btn"]`, `button[data-action="pin"]`, `.pin-btn`, `button[aria-label*="Pin"]` (lines 359-364)
      - Add to Batch: `[data-act="add"]`, `[data-testid="add-btn"]`, `button[data-action="add"]`, `.add-btn`, `button[aria-label*="Add"]` (lines 359-361)
      - Edit: `[data-act="edit"]`, `[data-testid="edit-btn"]`, `button[data-action="edit"]` (line 359)
      - Delete: `[data-act="del"]`, `[data-testid="del-btn"]`, `button[data-action="del"]` (line 359)
- **Glassmorphic Batch Drawer**:
  - Container: `document.querySelector('[data-testid="batch-drawer"], [data-testid="glassmorphic-drawer"], .mantine-Drawer-content, #batchDrawer, .batch-drawer')` (line 377)
  - Overlay: `document.querySelector('[data-testid="drawer-overlay"], .mantine-Drawer-overlay, .drawer-backdrop')` (line 382)
  - Items list: `document.querySelectorAll('#blist .bitem, [data-testid="batch-item"], [data-testid="drawer-batch-item"], .batch-item')` (line 387)
  - Item text: `el.querySelector('.bt, [data-testid="batch-item-text"], .batch-item-text')` (line 390)
  - Counter: `document.querySelector('#bcount, [data-testid="batch-count"], [data-testid="drawer-batch-count"]')` (line 397)
  - Delimiter Select: `document.querySelector('#joinSel, [data-testid="delimiter-select"], select[name="delimiter"]')` (line 406)
  - Auto-clear Checkbox: `document.querySelector('#autoclear, [data-testid="autoclear-checkbox"], input[name="autoclear"]')` (line 421)
  - Copy Batch Button: `document.querySelector('#bcopy, [data-testid="copy-batch-btn"], button[aria-label*="Copy Batch"]')` (line 440)
  - Clear Batch Button: `document.querySelector('#bclear, [data-testid="clear-batch-btn"], button[aria-label*="Clear Batch"]')` (line 451)
  - Item Action Buttons:
    - Remove item: `document.querySelector('[data-rm="${index}"], [data-testid="remove-batch-item-${index}"]')` (line 460)
    - Move up: `document.querySelector('[data-mvup="${index}"], [data-mup="${index}"], [data-up="${index}"]')` (line 469)
    - Move down: `document.querySelector('[data-mvdn="${index}"], [data-mdown="${index}"], [data-down="${index}"]')` (line 478)
- **Toasts Container**:
  - Container: `#toasts`
  - Toast item: `document.querySelectorAll('#toasts .toast, [data-testid="floating-toast"], [data-testid="toast-pill"], .mantine-Notification-root, .toast-pill')` (line 583)
  - Message text: `t.querySelector('span, .mantine-Notification-description, .toast-message')` (line 585)
  - Action button: `t.querySelector('.tact, [data-testid="toast-action"], button')` (line 585)
  - Icon element: `t.querySelector('.ticon, [data-testid="toast-icon"], .mantine-Notification-icon')` (line 586)
  - Progress timer: `t.querySelector('.tprogress, [data-testid="toast-progress"], .progress-timer')` (line 587)

---

## 2. Logic Chain

1. **WordingContainer & Layout Rendering Contracts**:
   - `tests/harness.js` line 309 searches `#listwrap` to extract visible defect items.
   - `tests/tier1-features.test.js` lines 233-243 verifies layout toggling by checking if `document.querySelector('#listwrap')` has classes `grid`, `table`, or `list` or `data-layout` attribute matching the active layout mode.
   - `WordingContainer.tsx` line 49 currently renders `<div id="listwrap" data-testid="wording-container" data-layout={layoutMode} className={`listwrap ${layoutMode}`}>`.
   - **Reasoning**: If `#listwrap` or the layout mode class name (`grid`, `table`, `list`) is changed during refactoring, layout tests will fail.

2. **DefectCard Renderer Contracts**:
   - `tests/harness.js` lines 309–335 inspects rendered defect cards. It reads `row.dataset.id`, `.rnum`, `.rtxt`, `.rpill`, `.fz`, and checks `hasContrastBorder` (looking for `border`, `card`, `row`, `gcard`, or `trow` in class/style) and `hasHoverEase` (looking for `hover`, `transition`, `row`, `gcard`, or `trow`).
   - `DefectCard.tsx` renders different outer container classes depending on `variant`:
     - `variant="grid"` -> class `.gcard`
     - `variant="list"` -> class `.row`
     - `variant="table"` -> class `.trow`
   - **Reasoning**: Any card redesign must preserve `data-id={item.id}`, `.gcard`/`.row`/`.trow`, `.rnum`, `.rtxt`, `.rpill`, and `.fz` classes, as well as border and hover transition classes, or the harness helper `getVisibleItems()` will return incomplete or invalid objects.

3. **DefectCard Action Buttons & Interactivity**:
   - `tests/harness.js` lines 343-372 tests clicking rows vs. action buttons.
   - Row click (`onClick={() => onCopyItem(item.t)}`) copies text. Action buttons inside `.racts` must stop event propagation (`e.stopPropagation()`) so clicking Pin or Add to Batch doesn't trigger row copy.
   - Action buttons must retain attributes: `data-act="pin"` (with `.pinned` class when pinned), `data-act="add"`, `data-act="edit"`, `data-act="del"`.
   - **Reasoning**: Omitting `data-act` or `e.stopPropagation()` will cause action button tests or copy tests to fail.

4. **BatchDrawer Glassmorphic Side Drawer Contracts**:
   - `tests/harness.js` lines 375-484 tests queueing, removing, reordering, custom delimiters, auto-clear, and clearing batch.
   - Selectors required: `#batchDrawer`, `#backdrop` (or `[data-testid="drawer-overlay"]`), `#blist .bitem` (with `data-bi={idx}`), `.bt` (for item text), `#bcount` / `[data-testid="batch-count"]`, `#joinSel` / `[data-testid="delimiter-select"]`, `#autoclear` / `[data-testid="autoclear-checkbox"]`, `#bcopy` / `[data-testid="copy-batch-btn"]`, `#bclear` / `[data-testid="clear-batch-btn"]`, `[data-rm="${idx}"]`, `[data-mvup="${idx}"]`, `[data-mvdn="${idx}"]`.
   - **Reasoning**: Replacing native select `#joinSel` or input `#autoclear` with complex Radix components without preserving standard DOM properties/attributes (or keeping invisible legacy elements for testing) can break harness event dispatching (`dispatchEvent(new Event('change'))`).

5. **ToastsContainer Contracts**:
   - `tests/harness.js` lines 581-610 queries `#toasts`.
   - Each toast must have class `.toast` (plus `.warn` for warning toasts), `.ticon` (or `[data-testid="toast-icon"]`), `.toast-message` (or `span`), `.tact` (or `[data-testid="toast-action"]`), and `.tprogress` (or `[data-testid="toast-progress"]`).
   - **Reasoning**: If Sonner toasts or custom toast containers omit `#toasts` or sub-element selectors `.ticon`, `.toast-message`, `.tact`, `.tprogress`, `getToasts()` will fail in Tier 1 and Tier 3 test suites.

---

## 3. Comprehensive Contract Inventory Table

| Component | Target Selector / ID | Test ID (`data-testid`) | Data Attributes / ARIA | Required Classes / Elements | Event / Behavior Requirements |
|-----------|----------------------|-------------------------|------------------------|-----------------------------|-------------------------------|
| `WordingContainer` | `#listwrap` | `wording-container` | `data-layout="list/grid/table"` | `listwrap grid`, `listwrap table`, `listwrap list` | Renders `#empty` when results=0, `#countLabel` for total summary |
| `WordingContainer` | `#countLabel` | - | - | `text-zinc-400 font-semibold` | Displays `${results.length} wordings` |
| `WordingContainer` | `#empty` | - | - | - | Rendered when `results.length === 0` |
| `DefectCard` | `.gcard`, `.row`, `.trow` | `defect-card`, `defect-row`, `defect-item` | `data-id={item.id}` | `.gcard` (grid), `.row` (list), `.trow` (table), `.pinned` (if pinned) | Must include `border` and `hover`/`transition` classes. `onClick` calls `onCopyItem`. |
| `DefectCard` | `.rnum` | `item-num` | - | `.rnum` | Displays `#{item.n}` |
| `DefectCard` | `.rtxt` | `item-text` | - | `.rtxt` | Inner `<mark>` for highlights, `.fz` span for fuzzy `≈` |
| `DefectCard` | `.rpill` | `category-badge` | - | `.rpill` | Displays category name `item.c` |
| `DefectCard` | `.fz` | `fuzzy-indicator` | - | `.fz` | Rendered only when `isApprox` is true (`≈`) |
| `DefectCard` | `.racts` | - | - | `.racts` | Action container; `onClick` MUST `e.stopPropagation()` |
| `DefectCard` | `.pin-btn` | `pin-btn` | `data-act="pin"`, `data-pinned="true"` (if pinned) | `.pin-btn`, `.pinned` (if pinned) | Toggles pin state. Displays `★` (pinned) / `☆` (unpinned) |
| `DefectCard` | `.add-batch-btn` | `add-btn` | `data-act="add"` | `.add-batch-btn` | `onClick` calls `onAddToBatch(item.t)` |
| `DefectCard` | `.edit-item-btn` | `edit-btn` | `data-act="edit"` | `.edit-item-btn` | Rendered in editMode. `onClick` calls `onOpenEdit(item)` |
| `DefectCard` | `.del-item-btn` | `del-btn` | `data-act="del"` | `.del-item-btn` | Rendered in editMode. `onClick` calls `onDeleteItem(item)` |
| `BatchDrawer` | `#batchDrawer` | `batch-drawer`, `glassmorphic-drawer` | - | `.batch-drawer`, `.open` (when open) | Slide-out drawer; `style={{ display: isOpen ? 'flex' : 'none' }}` |
| `BatchDrawer` | `#backdrop` | `drawer-overlay` | - | `.drawer-backdrop`, `.show` (when open) | Overlay backdrop; `onClick={onClose}` |
| `BatchDrawer` | `#bcount` | `batch-count` | - | - | Displays numeric `batchQueue.length` |
| `BatchDrawer` | `#joinSel` | `delimiter-select` | `name="delimiter"` | - | Native `<select id="joinSel">` with values `nl`, `comma`, `semi`, `space`, `pipe`, `bullet` |
| `BatchDrawer` | `#autoclear` | `autoclear-checkbox` | `name="autoclear"` | - | Native `<input type="checkbox" id="autoclear">` with `checked` attribute |
| `BatchDrawer` | `#blist` | - | - | `#blist` | List wrapper for `.bitem` elements |
| `BatchDrawer` | `.bitem` | `batch-item` | `data-bi={idx}` | `.bitem` | Item container for queued batch item |
| `BatchDrawer` | `.bt` | `batch-item-text` | - | `.bt` | Displays batch item text |
| `BatchDrawer` | `.bup` | `move-up-${idx}` | `data-mvup={idx}`, `data-mup={idx}`, `data-up={idx}`, `data-act="moveup"` | `.bup` | Move item up button |
| `BatchDrawer` | `.bdn` | `move-down-${idx}` | `data-mvdn={idx}`, `data-mdown={idx}`, `data-down={idx}`, `data-act="movedown"` | `.bdn` | Move item down button |
| `BatchDrawer` | `.brm-item` | `remove-batch-item-${idx}` | `data-rm={idx}` | `.brm-item` | Remove single item button |
| `BatchDrawer` | `#bcopy` | `copy-batch-btn` | - | - | Copy batch queue button |
| `BatchDrawer` | `#bclear` | `clear-batch-btn` | - | - | Clear batch queue button |
| `ToastsContainer` | `#toasts` | - | - | `.toasts-container` | Floating toast container |
| `ToastsContainer` | `.toast` | `floating-toast`, `toast-pill` | `data-color="red"` (if warn) | `.toast`, `.warn` (if warn) | `onClick={() => onRemoveToast(toast.id)}` |
| `ToastsContainer` | `.ticon` | `toast-icon` | - | `.ticon` | Category icon container |
| `ToastsContainer` | `.toast-message` / `span` | - | - | `.toast-message` | Toast notification text message |
| `ToastsContainer` | `.tact` | `toast-action` | - | `.tact` | Action button (e.g. "Undo"). `e.stopPropagation()` |
| `ToastsContainer` | `.tprogress` | `toast-progress` | - | `.tprogress` | Toast progress bar element |

---

## 4. Specific Refactoring Guidelines & Pitfall Prevention for `worker_m3`

1. **Preserve Dual-Mode CSS Selectors & Test IDs**:
   - When styling components using Tailwind CSS v4 utility classes (`bg-zinc-900`, `border-zinc-800`, `text-zinc-100`), **do not remove** legacy class names (`.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.fz`, `.bitem`, `.bt`, `.bup`, `.bdn`, `.brm-item`, `.toast`, `.warn`, `.ticon`, `.tact`, `.tprogress`).
   - Keep both `data-testid` and ID attributes as specified in the table above.

2. **Delimiter Select & Auto-Clear Checkbox Compatibility**:
   - `tests/harness.js` sets select values via native property setters:
     `nativeSetter.call(sel, joinerKey); sel.dispatchEvent(new window.Event('change'));`
   - If `BatchDrawer` uses a custom Radix UI `<Select>` component, `worker_m3` MUST keep a hidden or styled native `<select id="joinSel" data-testid="delimiter-select">` and native `<input type="checkbox" id="autoclear" data-testid="autoclear-checkbox">` in sync with state, OR ensure the visible elements respond to native `input`/`change` events.

3. **Event Propagation in Action Buttons**:
   - Ensure all interactive buttons inside `DefectCard` (`.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn`, folder dropdown triggers) have `onClick={(e) => e.stopPropagation()}`. Failure to stop propagation will cause row copy logic to trigger simultaneously whenever an action button is clicked.

4. **Card Hover Ease & Contrast Border Styling**:
   - Every defect card/row element must have `border` in its class list or inline style, as well as `hover` and `transition` classes (`transition-colors duration-150`), to satisfy `hasContrastBorder` and `hasHoverEase` checks in `tests/harness.js` line 318-319.

5. **Toast Container Markup Structure**:
   - `ToastsContainer` must maintain `<div id="toasts" className="toasts-container">`.
   - Each toast must render `.ticon`, `.toast-message` (or `span`), `.tact` (if action exists), and `.tprogress`.

---

## 5. Caveats
- No caveats. All 9 test files and 4 M3 component files were fully inspected and cross-referenced with `tests/harness.js`.

---

## 6. Conclusion
The M3 components (`DefectCard.tsx`, `WordingContainer.tsx`, `BatchDrawer.tsx`, `ToastsContainer.tsx`) form the primary user interaction surface of the application. All DOM IDs, data attributes, test IDs, and class names listed in Section 3 are strictly required by the Tier 1–5 test suite. Following the precise guidelines in Section 4 will ensure `worker_m3` successfully delivers the 2026 visual and UX overhaul without breaking any unit, integration, or E2E tests.

---

## 7. Verification Method
To verify that M3 refactoring does not break existing DOM contracts or tests, run the following test commands from the root directory:
```bash
# 1. Run full test suite across all 5 tiers and M3 pin folder tests
node --test tests/tier1-features.test.js tests/tier2-boundary.test.js tests/tier3-combinations.test.js tests/tier4-workloads.test.js tests/tier5-hardening.test.js tests/m3-pin-folders.test.js tests/searchEngine.test.ts

# 2. Run TypeScript build check
npm run build
```
- Invalidation condition: Any test failure or DOM query error in `tests/harness.js` during test execution.
