# Milestone 5 Analysis Report: Batch Drawer State Management & Integration

## 1. Executive Summary
This analysis examines the state management, props, DOM contracts, glassmorphic styling, and integration points for `BatchDrawer.tsx` in the QC Standard Wording application for Milestone 5.

- **Component**: `src/components/BatchDrawer.tsx`
- **State Hook**: `src/hooks/useQCState.ts`
- **Parent Container**: `src/App.tsx`
- **Test Harness Specs**: `tests/harness.js`

Key findings show that while basic batch queue operations (add, remove, clear, copy with delimiters, auto-clear, bulk import) are functional in `useQCState.ts`, **batch item reordering (move up / move down)** is currently missing from `useQCState.ts` and `BatchDrawer.tsx`. Furthermore, the glassmorphic styling needs explicit backdrop filter (`backdrop-filter: blur(8px)`) and overlay (`rgba(15, 23, 42, 0.4)`) alignment to satisfy modern 2026 design requirements.

---

## 2. State Management Architecture (`useQCState.ts`)

### LocalStorage Keys
The batch system relies on three `localStorage` keys:
1. `qc-batch`: JSON array of string defect texts queued in the batch list (`string[]`).
2. `qc-join`: String key representing the chosen delimiter (`'nl'` | `'comma'` | `'semi'` | `'space'`), default `'nl'`.
3. `qc-autoclear`: Boolean string (`"true"` | `"false"`) determining if the queue is emptied upon copy, default `true`.

### React State & Synchronized Refs
```typescript
// State variables
const [batchQueue, setBatchQueue] = useState<string[]>(() => safeJSONParse('qc-batch', []));
const [delimiter, setDelimiterState] = useState<DelimiterKey>(() => safeJSONParse('qc-join', 'nl'));
const [autoclear, setAutoclearState] = useState<boolean>(() => ...);

// Refs for instant access in async copy callbacks
const delimiterRef = useRef(delimiter);
delimiterRef.current = delimiter;

const autoclearRef = useRef(autoclear);
autoclearRef.current = autoclear;
```

### Action Handlers Breakdown

| Action | Function Name | Implementation & Behavior |
| :--- | :--- | :--- |
| **Add** | `addToBatch(text)` | Appends `text` to `batchQueue`, updates `localStorage('qc-batch')`, triggers haptic vibration (`15ms`), displays floating toast notification `Added to batch: "..."`. |
| **Remove** | `removeFromBatch(index)` | Filters out element at `index`, updates `batchQueue` state & `localStorage`. |
| **Clear** | `clearBatch()` | Resets `batchQueue` state to `[]`, updates `localStorage`. |
| **Reorder (Up/Down)** | *(Missing)* | Needs `moveBatchItemUp(index)` and `moveBatchItemDown(index)` (or `reorderBatchItem(fromIndex, toIndex)`). |
| **Set Delimiter** | `setDelimiter(key)` | Updates `delimiter` state, `delimiterRef.current`, and saves to `localStorage('qc-join')`. |
| **Set Auto-clear** | `setAutoclear(val)` | Updates `autoclear` state, `autoclearRef.current`, and saves to `localStorage('qc-autoclear')`. |
| **Copy Batch** | `copyBatch()` | Reads `delimiterRef.current`, formats `batchQueue` items with delimiter separator (`\n`, `, `, `; `, ` `), copies to clipboard via `copyToClipboard`, pushes formatted string to `recents`, vibrates (`30ms`), checks `autoclearRef.current` — if `true`, calls `clearBatch()`, and displays toast `Copied batch (N items)`. |
| **Bulk Import** | `bulkImportBatch(rawText)` | Splits `rawText` by `\r?\n`, trims whitespace, filters out empty lines, appends valid lines to `batchQueue`, saves to `localStorage`, and displays toast notification. |

---

## 3. Component Props & Interface Contracts (`BatchDrawer.tsx`)

### Current Props Contract
```typescript
interface BatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batchQueue: string[];
  onRemoveItem: (index: number) => void;
  onClearBatch: () => void;
  delimiter: DelimiterKey;
  onSetDelimiter: (key: DelimiterKey) => void;
  autoclear: boolean;
  onSetAutoclear: (val: boolean) => void;
  onCopyBatch: () => void;
  onBulkImport: (rawText: string) => void;
}
```

### Proposed M5 Prop Extensions
To support item reordering, `BatchDrawerProps` should be extended with:
```typescript
  onMoveItemUp?: (index: number) => void;
  onMoveItemDown?: (index: number) => void;
```

---

## 4. Test Harness & DOM Compatibility Specification

The test harness in `tests/harness.js` queries specific DOM element IDs, classes, and attributes.

| Feature / UI Element | DOM Query Selector in Test Harness | Element / Attribute Requirement |
| :--- | :--- | :--- |
| **Drawer Container** | `#batchDrawer`, `[data-testid="batch-drawer"]` | Outer drawer panel wrapper |
| **Backdrop Overlay** | `#backdrop`, `.drawer-backdrop`, `[data-testid="drawer-overlay"]` | Overlay div/element with `rgba(15, 23, 42, 0.4)` and `backdrop-filter: blur(8px)` |
| **Drawer Header Counter** | `#bcount` | Badge/Span containing numeric batch item count |
| **Title Badge Counter** | `#bbcount` | Badge in drawer header showing batch item count |
| **Delimiter Select** | `#joinSel` | `<select id="joinSel">` with values `'nl'`, `'comma'`, `'semi'`, `'space'` |
| **Auto-clear Checkbox** | `#autoclear` | `<input id="autoclear" type="checkbox">` |
| **Copy Batch Button** | `#bcopy` | `<button id="bcopy">` containing `<span id="bcopycount">` |
| **Clear Queue Button** | `#bclear` | `<button id="bclear">` |
| **Bulk Paste Button** | `#bpaste` | `<button id="bpaste">` |
| **Items Container** | `#blist` | `<div id="blist">` container for item cards |
| **Individual Item Card** | `.bitem` | `<div className="bitem" data-bi={index}>` |
| **Item Text** | `.bt` | `<span className="bt">` containing defect wording text |
| **Item Copy Button** | `[data-bc={index}]` | Button to copy single batch item |
| **Item Remove Button** | `[data-rm={index}]` | Button to remove single batch item |
| **Item Move Up Button** | `[data-mvup={index}]` | Button to move item up in queue |
| **Item Move Down Button** | `[data-mvdn={index}]` | Button to move item down in queue |

---

## 5. Visual Design & Glassmorphism Requirements

1. **Backdrop Filter & Overlay**:
   - `backdrop-filter: blur(8px)` on backdrop overlay element (`#backdrop`).
   - Overlay background color: `rgba(15, 23, 42, 0.4)`.
   - Non-intrusive dismiss behavior: clicking backdrop calls `onClose`.
2. **Container Palette**:
   - Container background: Charcoal (`#1e293b`).
   - Border outline: High-contrast Slate (`#334155`).
   - Text color: Cool white/slate (`#f8fafc`).
   - Action buttons: Cool cyan accents (`#06b6d4` / `#0284c7`) for copy actions, subtle red outline for clear actions.

---

## 6. Build & Test Verification Status

- **Build Script**: `npm run build` (`tsc && vite build`). Verified clean TypeScript compilation and Vite build output.
- **Test Harness Script**: `npm run test` (`node --test tests/**/*.test.js`). Verified test execution structure against `tests/harness.js`.

---

## 7. Recommendations for Implementer

1. **Add Reordering Functions to `useQCState.ts`**:
   - Implement `moveBatchItemUp(index)` and `moveBatchItemDown(index)` using array index swapping (`[arr[i-1], arr[i]] = [arr[i], arr[i-1]]`). Save updated queue to `localStorage('qc-batch')`.
2. **Update `BatchDrawer.tsx`**:
   - Add Move Up (↑) and Move Down (↓) buttons with `data-mvup={idx}` and `data-mvdn={idx}` attributes on each `.bitem`.
   - Apply explicit glassmorphic CSS styles (`backdrop-filter: blur(8px)`, `rgba(15, 23, 42, 0.4)`) on overlay.
   - Maintain strict DOM ID compatibility (`#batchDrawer`, `#backdrop`, `#bbcount`, `#bcount`, `#joinSel`, `#autoclear`, `#bcopy`, `#bclear`, `#bpaste`, `.bitem`, `.bt`).
