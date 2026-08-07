# Handoff Report: UI Component Survey (Notifications, Batch Drawer, Defect Cards)

## 1. Observation

### A. Notifications & Toast System
- **Toast Container Location**: `src/components/ToastsContainer.tsx` (Lines 9–76). Rendered with fixed DOM container `<div id="toasts" className="toasts-container">` at `position: fixed`, `bottom: 20px`, `right: 20px`, `zIndex: 1100`.
- **Toast Notification Items**: Standard toasts use inline styles `background: '#1098ad'` (cyan), `color: '#ffffff'`, `border: '1px solid #0c8599'`. Warning toasts (`toast.warn === true`) use `background: '#fff5f5'`, `color: '#c92a2a'`, `border: '1px solid #ffc9c9'`, and button with `className="tact"`.
- **State Management & Triggers**: `src/hooks/useQCState.ts` manages the `toasts` state array (`ToastNotice[]`).
  - `addToast(msg, warn, action)` auto-dismisses after `4200ms` (Line 132).
  - Triggers observed in `useQCState.ts`:
    - Line 174: `copySingleItem` -> `addToast('Copied: "..."')`
    - Line 188: `addToBatch` -> `addToast('Added to batch: "..."')`
    - Line 235: `copyBatch` -> `addToast('Copied batch (X items)')`
    - Line 250: `bulkImportBatch` -> `addToast('Bulk imported X items into batch queue')`
    - Lines 293, 307: `saveWordingItem` -> `addToast('Updated defect #N')` / `addToast('Added custom defect #N')`
    - Line 334: `deleteWordingItem` -> `addToast('Deleted item #N (...)', true, { label: 'Undo', fn: ... })`
    - Line 373: `exportChanges` -> `addToast('Exported wording changes')`
    - Lines 380, 395: `importChanges` -> `addToast('Imported wording changes successfully')` / `addToast('Invalid import file payload', true)`
    - Line 409: `resetAllChanges` -> `addToast('Reset all wording changes to default')`
- **Mantine Integration State**: `@mantine/notifications` package is installed (`^7.15.0` in `package.json:22`), imported in `App.tsx:11` (`import { Notifications, notifications } from '@mantine/notifications'`), rendered in `App.tsx:311` (`<Notifications position="top-right" zIndex={1000} />`), and used inside `Spotlight` actions (`App.tsx:137`). However, all primary app toast notifications bypass `@mantine/notifications` and use `ToastsContainer` rendering DOM elements matching `#toasts .toast`.

### B. Batch Drawer, Panel Overlay & Reorder/Copy Controls
- **Batch Drawer Component**: `src/components/BatchDrawer.tsx` (Lines 20–307). Uses Mantine v7 `Drawer` (`<Drawer opened={isOpen} onClose={onClose} position="right" size="md">`) around `<div id="batchDrawer" className={`batch-drawer ${isOpen ? 'open' : ''}`}>`.
- **Backdrop Overlay**: `BatchDrawer.tsx:47–61` renders a custom backdrop overlay `<div id="backdrop" className={`drawer-backdrop ${isOpen ? 'show' : ''}`}>` with inline style `background: 'rgba(0,0,0,0.4)'`, `zIndex: 998`.
- **DOM Identifiers & Controls**:
  - Header counters: `<Badge id="bbcount">` (Line 75) and `<Badge id="bcount">` (Line 95).
  - Close button: `<ActionIcon id="bclose">` (Line 98).
  - Settings bar: `<select id="joinSel">` for delimiter keys (`nl`, `comma`, `semi`, `space`) (Line 111) and `<input id="autoclear" type="checkbox">` (Line 134).
  - Item List Container: `<div id="blist">` (Line 146).
  - Queued item rows: `<Paper data-bi={idx} className="bitem">` (Line 164) with text `<Text className="bt">` (Line 176), single item copy button `<button data-bc={idx}>` (Line 182), remove button `<button data-rm={idx}>` (Line 204).
  - Action buttons: `<Button id="bcopy">` (Line 229) containing `<span id="bcopycount">` (Line 236), `<Button id="bclear">` (Line 242), `<Button id="bpaste">` (Line 254).
- **Missing Reorder Controls**: There are currently NO reorder controls (no up/down buttons, drag handles, or reorder callbacks in `useQCState.ts` or `BatchDrawer.tsx`).

### C. Defect Card/Row Components, Category Pills, Typography, Hover & Copy Feedback
- **Defect List/Grid/Table Components**:
  - Container: `src/components/WordingContainer.tsx:111` renders `<div id="listwrap" className={`listwrap ${layoutMode}`}>`.
  - Views: `src/components/WordingList.tsx` (`#listwrap .row`), `src/components/WordingGrid.tsx` (`#listwrap .gcard`), `src/components/WordingTable.tsx` (`#listwrap .trow`).
- **Defect Item Attributes & Elements**:
  - Container element: `data-id={item.id}`, `onClick={() => onCopyItem(item.t)}`.
  - Defect Number: `<span className="rnum">#{item.n}</span>`.
  - Defect Text: `<div className="rtxt">` displaying approximate symbol `<span className="fz">≈</span>` if fuzzy matched, and text in `<span dangerouslySetInnerHTML={{ __html: highlightedText || item.t }} />`.
  - Category Pill Badge: `<span className="rpill">{item.c}</span>`.
  - Action Buttons inside `<div className="racts">`:
    - Pin: `<button data-act="pin" className={`pin-btn ${isPinned ? 'pinned' : ''}`}>{isPinned ? '★' : '☆'}</button>`
    - Add to batch: `<button data-act="add" className="add-batch-btn">+ Batch</button>`
    - Edit (edit mode): `<button data-act="edit" className="edit-item-btn">Edit</button>`
    - Delete (edit mode): `<button data-act="del" className="del-item-btn">Del</button>`
- **Category Pill Styling**: Currently rendered as `<span className="rpill">` with generic gray background (`background: '#f1f3f5'`, `color: '#495057'`). They do not utilize category-specific accent colors defined in `qcData.ts:145–236`.
- **Typography & Theme Palette**:
  - Default font: `system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif` (`App.tsx:305`).
  - Item text: `0.95rem` / `0.875rem`, `fontWeight: 500`, `color: '#212529'` on `#ffffff` white card background or `#fff9db` yellow background when pinned.
  - Borders: Light gray `#e9ecef` or `#edf2f7`.
- **Hover & Transition**: Minimal inline CSS `transition: 'all 0.15s ease'`. Hover state relies on basic browser cursor styling (`cursor: 'pointer'`).
- **Copy Feedback Logic**:
  - Clicking card/row triggers `onCopyItem(item.t)` -> `copyToClipboard(text)` -> `pushRecent(text)` -> `triggerVibrate(20)` -> `addToast('Copied: "..."')`.
  - Purely toast-driven and haptic; no inline card/row feedback visual animation (such as checkmark flash or active ripple state) is present.

---

## 2. Logic Chain

1. **Observations on Test Suite Contracts**:
   - `tests/harness.js` queries specific DOM selectors: `#toasts .toast`, `.warn`, `.tact`, `#backdrop`, `#batchDrawer`, `#blist .bitem`, `[data-bi]`, `[data-bc]`, `[data-rm]`, `#joinSel`, `#autoclear`, `#bcopy`, `#bcopycount`, `#bclear`, `#listwrap .row`, `#listwrap .gcard`, `#listwrap .trow`, `[data-id]`, `.rnum`, `.rtxt`, `.rpill`, `[data-act="pin"]`, `[data-act="add"]`, `[data-act="edit"]`, `[data-act="del"]`.
   - Any UI overhaul MUST preserve all of these DOM IDs, data attributes, and class names to maintain 100% test suite compatibility (`npm test`).

2. **Observations on 2026 Theme Requirements (R1, R2)**:
   - R1 requires Deep Slate background (`#0f172a`), Charcoal containers (`#1e293b`), high-contrast borders (`#334155`), cool cyan accents (`#06b6d4` / `#0284c7`), category pill badges with theme colors, and visual hover states.
   - R2 requires floating glassmorphic toast notifications with category icons, subtle glow, copy feedback animations, and progress timers; plus a non-intrusive backdrop-filtered batch drawer (`backdrop-filter: blur(8px)`, `rgba(15, 23, 42, 0.4)` overlay) with batch reorder controls.

3. **Inference & Requirement Gap Identification**:
   - **Toast Notifications**: `ToastsContainer.tsx` currently renders rectangular flat pills without category icons, glow effects, progress timer bars, or exit animations. Upgrading to floating glassmorphic pills with category icons while preserving `#toasts .toast` DOM structure will satisfy R2 without breaking test harness assertions.
   - **Batch Drawer**: `BatchDrawer.tsx` uses a simple dimming overlay `rgba(0,0,0,0.4)` without backdrop blur, light gray paper backgrounds, and lacks batch reorder controls (move up/down). Reorder functions must be added to `useQCState.ts` (e.g. `reorderBatchItem(fromIndex, toIndex)`) and exposed with control buttons in `BatchDrawer.tsx`.
   - **Defect Cards/Rows**: Currently use light mode white cards with `#e9ecef` borders and monochrome `.rpill` badges. Implementing the Deep Slate / Charcoal theme with `#334155` borders, category-specific pill badge colors (`cat.color` from `qcData.ts`), sharp 150ms hover feedback, and visual copy feedback will complete R1 and R3 requirements.

---

## 3. Caveats

- **Test Suite Reliance on Specific Class Names**: The test harness in `tests/harness.js` checks exact class names and structure (e.g., `#listwrap .row, #listwrap .gcard, #listwrap .trow`, `.rnum`, `.rtxt`, `.rpill`, `[data-act="pin"]`, `#toasts .toast`). When restyling components, HTML element hierarchy and data attributes must not be stripped or renamed.
- **Batch Reorder Contract**: Adding batch reorder controls (e.g., up/down buttons on `.bitem`) is a net-new UI addition. It will enhance UX without invalidating existing batch test cases in `tier1-features.test.js`.

---

## 4. Conclusion

The codebase provides a solid React 19 + Mantine 7 foundation with robust state management in `useQCState.ts`. The current implementation has the following specific baseline components and gap areas for the 2026 overhaul:

1. **Toast Notifications**: Managed via `useQCState.ts` (`addToast`, `removeToast`) and rendered in `src/components/ToastsContainer.tsx`. Requires upgrade to floating glassmorphic styling, category icons, glowing cyan border accents, and animated progress timers while preserving `#toasts .toast` DOM hooks.
2. **Batch Drawer**: Rendered in `src/components/BatchDrawer.tsx` with backdrop in `<div id="backdrop">`. Requires implementation of non-dimming glass backdrop (`rgba(15, 23, 42, 0.4)` + `backdrop-filter: blur(8px)`), Deep Slate/Charcoal panel theme, and quick batch reorder controls (up/down shift).
3. **Defect Cards/Rows**: Rendered in `WordingList.tsx`, `WordingGrid.tsx`, and `WordingTable.tsx`. Requires applying Deep Slate `#0f172a` & Charcoal `#1e293b` palette, `#334155` borders, distinct category pill badge colors (`qcData.ts`), high-contrast 150ms hover states, and visual copy feedback animation.

---

## 5. Verification Method

### Test Execution Commands
```powershell
# Run full suite of tier 1-4 automated tests
npm test

# Run individual test tiers
npm run test:tier1
npm run test:tier2
npm run test:tier3
npm run test:tier4

# Verify TypeScript build
npm run build
```

### Direct Inspection Files
- `src/components/ToastsContainer.tsx` — Verify toast DOM structure `#toasts .toast`, `.warn`, `.tact`.
- `src/components/BatchDrawer.tsx` — Verify drawer overlay `#backdrop`, `#batchDrawer`, `#blist`, `#joinSel`, `#autoclear`, `#bcopy`, `#bclear`.
- `src/components/WordingList.tsx`, `WordingGrid.tsx`, `WordingTable.tsx` — Verify `.row`, `.gcard`, `.trow`, `[data-id]`, `.rnum`, `.rtxt`, `.rpill`, `[data-act="pin"]`, `[data-act="add"]`.
- `src/hooks/useQCState.ts` — Verify state handlers for toasts, batch queue, copy, and future reorder logic.

### Invalidation Conditions
- Any changes to element IDs (`#toasts`, `#backdrop`, `#batchDrawer`, `#blist`, `#search`, `#listwrap`), class names (`.toast`, `.bitem`, `.row`, `.gcard`, `.trow`, `.rpill`, `.rnum`, `.rtxt`), or data attributes (`data-id`, `data-act`, `data-bi`, `data-bc`, `data-rm`, `data-cat`, `data-sub`) that break DOM selection in `tests/harness.js`.
