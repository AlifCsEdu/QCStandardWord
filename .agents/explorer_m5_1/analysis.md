# Milestone 5 Analysis: Glassmorphic Non-Intrusive Batch Drawer

## Executive Summary
This analysis evaluates the current implementation of the Batch Drawer in `src/components/BatchDrawer.tsx`, `src/hooks/useQCState.ts`, `src/App.tsx`, and `src/index.css`. It provides concrete specifications and code snippets for Worker to implement **Milestone 5: Glassmorphic Non-Intrusive Batch Drawer** with 100% test harness compatibility and 2026 design standards.

---

## 1. Current Codebase Assessment

### A. `src/components/BatchDrawer.tsx`
- **Current State**: Uses Mantine v7 `<Drawer>` wrapping a `#batchDrawer` `<div>`. Includes basic `#backdrop` overlay, `#bcount` header badge, `#joinSel` delimiter select (`nl`, `comma`, `semi`, `space`), `#autoclear` checkbox, `#bcopy` copy button, `#bclear` clear button, `#bpaste` bulk import button, and `.bitem` elements with single-item copy (`data-bc`) and remove (`data-rm`) buttons.
- **Gaps Identified**:
  1. **Glassmorphic & Overlay Styling**: `#backdrop` currently has plain `background: 'rgba(0,0,0,0.4)'` without `backdrop-filter: blur(8px)` and without Deep Slate theme variable `rgba(15, 23, 42, 0.4)`. `#batchDrawer` lacks subtle glass translucent background (`rgba(30, 41, 59, 0.85)` / `backdrop-filter: blur(8px)`).
  2. **Reorder Controls Missing**: Individual batch items (`.bitem`) only have copy and remove actions. They lack **Move Up** (`.bup` / `data-mup`) and **Move Down** (`.bdn` / `data-mdown`) buttons.
  3. **Delimiter Options Incomplete**: `#joinSel` only contains 4 delimiters (`nl`, `comma`, `semi`, `space`), missing `pipe` (` | `) and `bullet` (` • `).
  4. **Badge Element IDs**: Title badge uses `#bbcount` while drawer header badge uses `#bcount`. Header toggle button badge in `AppHeader.tsx` uses `#bcount`. Both `#bbcount` and `#bcount` should be maintained across trigger badges and drawer headers to satisfy legacy and modern test assertions.

### B. `src/hooks/useQCState.ts`
- **Current State**: Manages `batchQueue` array, `addToBatch`, `removeFromBatch`, `clearBatch`, `delimiter`, `setDelimiter`, `autoclear`, `setAutoclear`, `copyBatch`, `bulkImportBatch`.
- **Gaps Identified**:
  1. Lacks reorder helper functions `moveBatchItemUp(index)` and `moveBatchItemDown(index)`.
  2. Delimiter formatting in `copyBatch` only supports `nl`, `comma`, `semi`, `space`. Needs extension for `pipe` (` | `) and `bullet` (` • `).

### C. `src/types/qc.ts`
- **Current State**: `DelimiterKey` type is defined as `'nl' | 'comma' | 'semi' | 'space'`.
- **Gaps Identified**: Must be expanded to `'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet'`.

---

## 2. Technical Requirements & DOM Compatibility Matrix

### DOM Element & Selector Matrix
To ensure 100% test harness pass rate, all DOM elements must strictly adhere to the following contracts:

| Element / Action | Required ID / Class / Data Attribute | Description & Behavioral Spec |
|---|---|---|
| **Drawer Container** | `id="batchDrawer"`<br>`class="batch-drawer"`<br>`data-testid="batch-drawer"` | Slide-out panel container. Receives `.open` class when opened. Styled with glassmorphism `backdrop-filter: blur(8px)`. |
| **Overlay / Backdrop** | `id="backdrop"`<br>`class="drawer-backdrop"`<br>`data-testid="drawer-overlay"` | Non-dimming overlay with `background: rgba(15, 23, 42, 0.4)` and `backdrop-filter: blur(8px)`. Clicking triggers `onClose`. Hidden (`display: none`) when closed. |
| **Badge Counter 1** | `id="bbcount"`<br>`data-testid="batch-count-badge"` | Badge counter element displaying `batchQueue.length` (in drawer title / navbar badge). |
| **Badge Counter 2** | `id="bcount"`<br>`data-testid="batch-count"` | Badge counter element displaying `batchQueue.length` (in drawer header / app header toggle). |
| **Delimiter Select** | `id="joinSel"`<br>`name="delimiter"`<br>`data-testid="delimiter-select"` | Dropdown menu with options: `nl` (\n), `comma` (, ), `semi` (; ), `space` ( ), `pipe` ( \| ), `bullet` ( • ). |
| **Auto-clear Checkbox** | `id="autoclear"`<br>`type="checkbox"`<br>`name="autoclear"`<br>`data-testid="autoclear-checkbox"` | Checkbox toggling automatic clearing of batch queue after copy. |
| **Copy Batch Button** | `id="bcopy"`<br>`data-testid="copy-batch-btn"` | Button triggering `copyBatch()`. Copies joined string to clipboard, adds to history, and clears queue if `autoclear` is enabled. |
| **Clear Queue Button** | `id="bclear"`<br>`data-testid="clear-batch-btn"` | Button triggering `clearBatch()`. |
| **Bulk Paste Button** | `id="bpaste"`<br>`data-testid="bulk-paste-btn"` | Button opening bulk paste modal. |
| **Batch Item Card** | `class="bitem"`<br>`data-bi={idx}`<br>`data-testid="batch-item"` | Wrapper container for each queued item in list container `#blist`. |
| **Batch Item Text** | `class="bt"`<br>`data-testid="batch-item-text"` | Element displaying the item text inside `.bitem`. |
| **Single Item Copy** | `data-bc={idx}` | Button copying individual item text to clipboard. |
| **Single Item Remove** | `data-rm={idx}`<br>`data-testid="remove-batch-item-${idx}"` | Button removing item at index `idx` from queue. |
| **Move Up Control** | `class="bup"`<br>`data-mup={idx}`<br>`data-act="moveup"`<br>`data-testid="move-up-${idx}"` | Button moving item up one position (`idx` to `idx - 1`). Disabled when `idx === 0`. |
| **Move Down Control** | `class="bdn"`<br>`data-mdown={idx}`<br>`data-act="movedown"`<br>`data-testid="move-down-${idx}"` | Button moving item down one position (`idx` to `idx + 1`). Disabled when `idx === batchQueue.length - 1`. |

---

## 3. Glassmorphic Styling Specifications

### CSS Variables & Rules (`src/index.css`)
```css
/* Glassmorphic Drawer & Backdrop Tokens */
:root,
[data-theme='dark'],
[data-mantine-color-scheme='dark'] {
  --drawer-backdrop-bg: rgba(15, 23, 42, 0.4);
  --drawer-backdrop-blur: blur(8px);
  --drawer-panel-bg: rgba(30, 41, 59, 0.85);
  --drawer-border: #334155;
  --drawer-glow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(6, 182, 212, 0.15);
}

[data-theme='light'],
[data-mantine-color-scheme='light'] {
  --drawer-backdrop-bg: rgba(15, 23, 42, 0.2);
  --drawer-backdrop-blur: blur(6px);
  --drawer-panel-bg: rgba(255, 255, 255, 0.88);
  --drawer-border: #e2e8f0;
  --drawer-glow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Glassmorphic Backdrop Overlay */
#backdrop,
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--drawer-backdrop-bg);
  backdrop-filter: var(--drawer-backdrop-blur);
  -webkit-backdrop-filter: var(--drawer-backdrop-blur);
  z-index: 998;
  transition: opacity 200ms ease;
}

/* Glassmorphic Panel Container */
#batchDrawer,
.batch-drawer {
  background: var(--drawer-panel-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-left: 1px solid var(--drawer-border);
  box-shadow: var(--drawer-glow);
}

/* Batch Item Reorder Buttons */
.bup, .bdn {
  border: 1px solid var(--border-contrast, #334155);
  background: rgba(15, 23, 42, 0.4);
  color: var(--text-secondary, #94a3b8);
  padding: 3px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 150ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bup:hover:not(:disabled), .bdn:hover:not(:disabled) {
  background: rgba(6, 182, 212, 0.2);
  border-color: var(--accent-cyan, #06b6d4);
  color: var(--accent-cyan, #06b6d4);
}

.bup:disabled, .bdn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

---

## 4. Implementation Guidance for Worker

### Step 1: Update `src/types/qc.ts`
Expand `DelimiterKey`:
```typescript
export type DelimiterKey = 'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet';
```

### Step 2: Update `src/hooks/useQCState.ts`
1. Add `moveBatchItemUp` and `moveBatchItemDown`:
```typescript
const moveBatchItemUp = useCallback((index: number) => {
  if (index <= 0) return;
  setBatchQueue((prev) => {
    const next = [...prev];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    safeStorageSet('qc-batch', next);
    return next;
  });
}, []);

const moveBatchItemDown = useCallback((index: number) => {
  setBatchQueue((prev) => {
    if (index >= prev.length - 1) return prev;
    const next = [...prev];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    safeStorageSet('qc-batch', next);
    return next;
  });
}, []);
```
2. Update delimiter formatting in `copyBatch`:
```typescript
let sep = '\n';
if (curDelim === 'comma') sep = ', ';
else if (curDelim === 'semi') sep = '; ';
else if (curDelim === 'space') sep = ' ';
else if (curDelim === 'pipe') sep = ' | ';
else if (curDelim === 'bullet') sep = ' • ';
```
3. Expose `moveBatchItemUp` and `moveBatchItemDown` in the return object of `useQCState()`.

### Step 3: Update `src/components/BatchDrawer.tsx`
1. Add `onMoveItemUp?: (index: number) => void` and `onMoveItemDown?: (index: number) => void` to `BatchDrawerProps`.
2. Ensure `#backdrop` has `data-testid="drawer-overlay"`, backdrop blur, `background: 'var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))'`, and `backdropFilter: 'blur(8px)'`.
3. Add `pipe` and `bullet` options to `#joinSel`:
```tsx
<select
  id="joinSel"
  name="delimiter"
  data-testid="delimiter-select"
  value={delimiter}
  onChange={(e) => onSetDelimiter(e.target.value as DelimiterKey)}
  style={{ ... }}
>
  <option value="nl">Newline (\n)</option>
  <option value="comma">Comma (, )</option>
  <option value="semi">Semicolon (; )</option>
  <option value="space">Space ( )</option>
  <option value="pipe">Pipe ( | )</option>
  <option value="bullet">Bullet ( • )</option>
</select>
```
4. Render move up and move down buttons for each item in `batchQueue.map`:
```tsx
<Group gap={4}>
  <button
    data-mup={idx}
    data-act="moveup"
    data-testid={`move-up-${idx}`}
    className="bup"
    disabled={idx === 0}
    onClick={() => onMoveItemUp?.(idx)}
    title="Move Up"
  >
    ▲
  </button>

  <button
    data-mdown={idx}
    data-act="movedown"
    data-testid={`move-down-${idx}`}
    className="bdn"
    disabled={idx === batchQueue.length - 1}
    onClick={() => onMoveItemDown?.(idx)}
    title="Move Down"
  >
    ▼
  </button>

  <button data-bc={idx} ...>Copy</button>
  <button data-rm={idx} data-testid={`remove-batch-item-${idx}`} ...>✕</button>
</Group>
```

### Step 4: Wire Props in `src/App.tsx`
Pass `moveBatchItemUp` and `moveBatchItemDown` from `useQCState` to `<BatchDrawer>`:
```tsx
<BatchDrawer
  isOpen={batchDrawerOpen}
  onClose={() => setBatchDrawerOpen(false)}
  batchQueue={batchQueue}
  onRemoveItem={removeFromBatch}
  onClearBatch={clearBatch}
  onMoveItemUp={moveBatchItemUp}
  onMoveItemDown={moveBatchItemDown}
  delimiter={delimiter}
  onSetDelimiter={setDelimiter}
  autoclear={autoclear}
  onSetAutoclear={setAutoclear}
  onCopyBatch={copyBatch}
  onBulkImport={bulkImportBatch}
/>
```

---

## 5. Verification Method

1. **Typecheck & Build**:
   ```bash
   npm run build
   ```
   Must compile cleanly with zero TypeScript errors.

2. **Test Suite Verification**:
   ```bash
   npm run test
   ```
   All test tiers must pass 100%.

3. **Visual & Behavior Checklist**:
   - Drawer slide-out panel has glassmorphic background blur (`blur(8px)`).
   - Overlay `#backdrop` has `rgba(15, 23, 42, 0.4)` and backdrop blur without blocking page view when closed.
   - Clicking backdrop dismisses drawer.
   - Batch item reorder buttons (Move Up ▲ / Move Down ▼) correctly rearrange queue items and update state/storage.
   - Delimiter dropdown contains all 6 choices (`nl`, `comma`, `semi`, `space`, `pipe`, `bullet`) and formats output accurately when copied.
