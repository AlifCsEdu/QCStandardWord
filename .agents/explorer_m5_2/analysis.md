# Milestone 5 Technical Analysis Report: Glassmorphic Non-Intrusive Batch Drawer

**Agent**: Explorer 2 (`explorer_m5_2`)  
**Target Component**: `src/components/BatchDrawer.tsx`, `src/hooks/useQCState.ts`, `src/index.css`, `src/theme/index.ts`  
**Date**: 2026-08-07  

---

## 1. Executive Summary

Milestone 5 focuses on delivering a modern, glassmorphic, non-intrusive **Batch Drawer** panel for the QC Standard Wording application. This investigation performed a comprehensive audit of the DOM structure, CSS/Tailwind glassmorphism styles, non-intrusive backdrop overlay handling, batch item reordering state & UI controls, and test harness compatibility.

### Key Findings Summary:
1. **DOM ID Compatibility**: 9 out of 10 required DOM IDs/selectors are already present (`#batchDrawer`, `#backdrop`, `#bbcount`, `#bcount`, `#joinSel`, `#autoclear`, `#bcopy`, `#bclear`, `#bpaste`, `.bitem`). However, attributes on individual `.bitem` elements are missing Move Up / Move Down buttons for reordering.
2. **Glassmorphism & Overlay Styling**: `src/theme/index.ts` configures Mantine Drawer overlay with `var(--drawer-backdrop-bg)` (`rgba(15, 23, 42, 0.4)`) and `var(--drawer-backdrop-blur)` (`blur(8px)`). However, the legacy `#backdrop` element in `BatchDrawer.tsx` uses hardcoded `background: 'rgba(0,0,0,0.4)'` and lacks `backdropFilter: 'blur(8px)'` inline styling.
3. **Non-Intrusive Backdrop Click Handling**: Backdrop dismiss works via `onClick={onClose}`. When `isOpen === false`, `#backdrop` has `display: 'none'` and Mantine Drawer unmounts, successfully unblocking page interactions.
4. **Batch Item Reordering Gap**: State management in `useQCState.ts` lacks `moveBatchItemUp` and `moveBatchItemDown` functions. `BatchDrawer.tsx` lacks UI buttons (`data-mvup` and `data-mvdn`) on `.bitem` elements.

---

## 2. DOM Structure & Element ID Verification

An audit of `src/components/BatchDrawer.tsx` against `SCOPE.md` and test harness requirements (`tests/harness.js`):

| Selector / Element | Required ID / Class | Existing Implementation Location | Status | Recommendations / Gaps |
|-------------------|-------------------|--------------------------------|--------|------------------------|
| Main Drawer Panel | `#batchDrawer` | `src/components/BatchDrawer.tsx:84` (`<div id="batchDrawer" className={`batch-drawer ${isOpen ? 'open' : ''}`}>`) | **VERIFIED** | Present inside Mantine Drawer |
| Backdrop Overlay | `#backdrop` | `src/components/BatchDrawer.tsx:48` (`<div id="backdrop" className={`drawer-backdrop ${isOpen ? 'show' : ''}`}>`) | **VERIFIED WITH GAPS** | Change `rgba(0,0,0,0.4)` to `rgba(15, 23, 42, 0.4)` or `var(--drawer-backdrop-bg)` and add `backdropFilter: 'blur(8px)'` |
| Drawer Header Title Badge | `#bbcount` | `src/components/BatchDrawer.tsx:75` (`<Badge id="bbcount">`) | **VERIFIED** | Present in Drawer title prop |
| Drawer Body Badge | `#bcount` | `src/components/BatchDrawer.tsx:95` (`<Badge id="bcount">`) | **VERIFIED** | Present in drawer control bar |
| Header Button Badge | `#bcount` | `src/components/AppHeader.tsx:230` (`<span id="bcount">`) | **VERIFIED** | Syncs with `batchQueue.length` |
| Delimiter Select | `#joinSel` | `src/components/BatchDrawer.tsx:111` (`<select id="joinSel">`) | **VERIFIED** | Options: `nl`, `comma`, `semi`, `space` |
| Auto-Clear Checkbox | `#autoclear` | `src/components/BatchDrawer.tsx:134` (`<input id="autoclear" type="checkbox">`) | **VERIFIED** | Toggles auto-clear state |
| Copy Batch Button | `#bcopy` | `src/components/BatchDrawer.tsx:229` (`<Button id="bcopy">`) | **VERIFIED** | Includes inner `<span id="bcopycount">` |
| Clear Batch Button | `#bclear` | `src/components/BatchDrawer.tsx:242` (`<Button id="bclear">`) | **VERIFIED** | Clears queue state |
| Bulk Paste Button | `#bpaste` | `src/components/BatchDrawer.tsx:254` (`<Button id="bpaste">`) | **VERIFIED** | Opens bulk import modal |
| Batch Item Card | `.bitem` | `src/components/BatchDrawer.tsx:165` (`<Paper className="bitem" data-bi={idx}>`) | **VERIFIED** | Displays text span `.bt` |
| Single Item Copy Button | `data-bc={idx}` | `src/components/BatchDrawer.tsx:182` (`<button data-bc={idx}>`) | **VERIFIED** | Copies item to clipboard |
| Single Item Remove Button | `data-rm={idx}` | `src/components/BatchDrawer.tsx:204` (`<button data-rm={idx}>`) | **VERIFIED** | Removes item from queue |
| Move Up Reorder Button | `data-mvup={idx}` | **NOT IMPLEMENTED** | ❌ **MISSING** | Add `<button data-mvup={idx}>` to each `.bitem` |
| Move Down Reorder Button | `data-mvdn={idx}` | **NOT IMPLEMENTED** | ❌ **MISSING** | Add `<button data-mvdn={idx}>` to each `.bitem` |

---

## 3. Glassmorphic Styling & Non-Intrusive Overlay Audit

### A. Glassmorphism Design Tokens
- **CSS Variables** (`src/index.css:15-16`, `30-31`):
  - Dark mode: `--drawer-backdrop-bg: rgba(15, 23, 42, 0.4);` and `--drawer-backdrop-blur: blur(8px);`
  - Light mode: `--drawer-backdrop-bg: rgba(15, 23, 42, 0.2);` and `--drawer-backdrop-blur: blur(4px);`
- **Mantine Theme Override** (`src/theme/index.ts:45-48`):
  ```ts
  overlay: {
    backgroundColor: 'var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))',
    backdropFilter: 'var(--drawer-backdrop-blur, blur(8px))',
  }
  ```
- **Discrepancy in `BatchDrawer.tsx`**:
  Line 58 of `BatchDrawer.tsx` uses inline style `background: 'rgba(0,0,0,0.4)'` instead of `var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))` and omits `backdropFilter: 'blur(8px)'` (and `-webkit-backdrop-filter: blur(8px)`).
  
  *Remediation*: Update `#backdrop` inline style:
  ```tsx
  style={{
    display: isOpen ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))',
    backdropFilter: 'var(--drawer-backdrop-blur, blur(8px))',
    WebkitBackdropFilter: 'var(--drawer-backdrop-blur, blur(8px))',
    zIndex: 998,
  }}
  ```

### B. Non-Intrusive Backdrop Interaction
- When `isOpen === true`: `#backdrop` and Mantine `Drawer` overlay are active. Clicking `#backdrop` calls `onClose()`.
- When `isOpen === false`: `#backdrop` has `display: 'none'` (pointer-events omitted/hidden) and Mantine `Drawer` unmounts or hides. Background page elements (left sidebar nav, search bar, defect cards, scroll-to-top button) remain 100% interactive with zero blocking overlays.

---

## 4. Batch Reordering State Management & UI Controls

### A. State Management Gaps in `useQCState.ts`
Currently `useQCState.ts` provides:
- `batchQueue`, `addToBatch`, `removeFromBatch`, `clearBatch`, `setDelimiter`, `setAutoclear`, `copyBatch`, `bulkImportBatch`.

Functions required for item reordering:
```ts
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

### B. UI Control Additions in `BatchDrawer.tsx`
Add Move Up (`▲`) and Move Down (`▼`) action buttons to each `.bitem`:
```tsx
<button
  data-mvup={idx}
  disabled={idx === 0}
  onClick={() => onMoveUpItem(idx)}
  title="Move item up"
  style={{
    border: 'none',
    background: idx === 0 ? 'rgba(51, 65, 85, 0.2)' : 'rgba(6, 182, 212, 0.15)',
    color: idx === 0 ? '#64748b' : '#38bdf8',
    padding: '4px 6px',
    borderRadius: '4px',
    cursor: idx === 0 ? 'not-allowed' : 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
  }}
>
  ▲
</button>

<button
  data-mvdn={idx}
  disabled={idx === batchQueue.length - 1}
  onClick={() => onMoveDownItem(idx)}
  title="Move item down"
  style={{
    border: 'none',
    background: idx === batchQueue.length - 1 ? 'rgba(51, 65, 85, 0.2)' : 'rgba(6, 182, 212, 0.15)',
    color: idx === batchQueue.length - 1 ? '#64748b' : '#38bdf8',
    padding: '4px 6px',
    borderRadius: '4px',
    cursor: idx === batchQueue.length - 1 ? 'not-allowed' : 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
  }}
>
  ▼
</button>
```

---

## 5. Test Suite & Test Harness Compatibility

### Existing Test Suite Review:
- `tests/harness.js` provides batch drawer helper methods:
  - `getBatchDrawer()`
  - `getBatchDrawerOverlay()`
  - `getBatchItems()`
  - `getBatchCount()`
  - `setDelimiter()`
  - `toggleAutoClear()`
  - `copyBatch()`
  - `clearBatch()`
  - `removeBatchItem()`
- `tests/tier1-features.test.js` tests adding items to batch, setting delimiters (`nl`, `comma`, `semi`, `space`), checking `autoclear`, removing item, clearing batch.
- `tests/m2_theme_tokens_challenge.test.ts` tests `Drawer` overlay backdrop background color `rgba(15, 23, 42, 0.4)` and backdrop filter `blur(8px)`.

### Recommended Test Helpers & Tests for Challenger M5 Suite:
Add helper methods in test harness for batch item reordering:
```js
moveBatchItemUp: (index) => {
  runWithFlush(() => {
    const btn = document.querySelector(`[data-mvup="${index}"], [data-up="${index}"]`);
    if (!btn) throw new Error(`Move up button for index ${index} not found`);
    btn.click();
  });
  return helpers;
},

moveBatchItemDown: (index) => {
  runWithFlush(() => {
    const btn = document.querySelector(`[data-mvdn="${index}"], [data-down="${index}"]`);
    if (!btn) throw new Error(`Move down button for index ${index} not found`);
    btn.click();
  });
  return helpers;
}
```

---

## 6. Actionable Proposals for Implementation Worker

1. **Update `src/hooks/useQCState.ts`**:
   - Implement `moveBatchItemUp` and `moveBatchItemDown` callbacks.
   - Return `moveBatchItemUp` and `moveBatchItemDown` from `useQCState()`.

2. **Update `src/App.tsx`**:
   - Destructure `moveBatchItemUp` and `moveBatchItemDown` from `useQCState()`.
   - Pass `onMoveUpItem={moveBatchItemUp}` and `onMoveDownItem={moveBatchItemDown}` to `<BatchDrawer>`.

3. **Update `src/components/BatchDrawer.tsx`**:
   - Extend `BatchDrawerProps` interface with `onMoveUpItem?: (index: number) => void` and `onMoveDownItem?: (index: number) => void`.
   - Update `#backdrop` inline style to use `var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))` and `backdropFilter: 'var(--drawer-backdrop-blur, blur(8px))'`.
   - Render Move Up (`data-mvup={idx}`) and Move Down (`data-mvdn={idx}`) buttons inside each `.bitem`.

---
*Report compiled by Explorer 2 for Milestone 5.*
