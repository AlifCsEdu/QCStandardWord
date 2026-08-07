# Changes Summary — Milestone 5 (Worker 1)

## Files Modified / Created

1. **`src/types/qc.ts`**
   - Expanded `DelimiterKey` type to `'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet'`.

2. **`src/hooks/useQCState.ts`**
   - Added `moveBatchItemUp(index: number)`: swaps item at `index` with `index - 1` when `index > 0`, updates state and persists array to `localStorage['qc-batch']`.
   - Added `moveBatchItemDown(index: number)`: swaps item at `index` with `index + 1` when `index < batchQueue.length - 1`, updates state and persists array to `localStorage['qc-batch']`.
   - Updated `delimiter` initialization to handle both unquoted raw strings (e.g. `'comma'`) and JSON-quoted strings (e.g. `'"comma"'`) from `localStorage['qc-join']`.
   - Updated `batchQueue` initialization to trap corrupt non-array JSON values (`12345`, `"string"`, `{}` etc.) with a `TypeError`.
   - Updated `copyBatch()` delimiter separator formatting to support `'pipe'` (`' | '`) and `'bullet'` (`' • '`).
   - Exported `moveBatchItemUp` and `moveBatchItemDown` from `useQCState()` hook.

3. **`src/App.tsx`**
   - Retrieved `moveBatchItemUp` and `moveBatchItemDown` from `useQCState()`.
   - Passed `onMoveItemUp={moveBatchItemUp}` and `onMoveItemDown={moveBatchItemDown}` (plus aliases) to `<BatchDrawer>`.

4. **`src/components/BatchDrawer.tsx`**
   - Added `onMoveItemUp` and `onMoveItemDown` to `BatchDrawerProps`.
   - Updated `#backdrop` overlay element style to use `var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))` background, `var(--drawer-backdrop-blur, blur(8px))` filter with `WebkitBackdropFilter`, and `--drawer-backdrop-blur: 'blur(8px)'` custom variable.
   - Kept `#backdrop` non-intrusive by applying `display: 'none'` when closed.
   - Updated `#joinSel` options to include `Pipe ( | )` and `Bullet ( • )`.
   - Rendered Move Up (`.bup`, `data-mvup={idx}`) and Move Down (`.bdn`, `data-mvdn={idx}`) buttons on each `.bitem` element.
   - Preserved complete DOM element compatibility (`#batchDrawer`, `#backdrop`, `#bbcount`, `#bcount`, `#joinSel`, `#autoclear`, `#bcopy`, `#bclear`, `#bpaste`, `.bitem`, `.bup`, `.bdn`, `button[data-bc]`, `button[data-rm]`).

5. **`src/index.css`**
   - Added explicit `#backdrop`, `.drawer-backdrop`, `#batchDrawer`, and `.batch-drawer` CSS rules with glassmorphic backdrop filter (`blur(8px)`) and overlay (`rgba(15, 23, 42, 0.4)`).

6. **`tests/harness.js`**
   - Added `moveBatchItemUp(index)` and `moveBatchItemDown(index)` helper functions to test harness interface.

7. **`tests/m5_batch_drawer.test.js`** (New File)
   - Added unit/integration test suite for Milestone 5 verifying glassmorphic backdrop overlay styling, batch item reordering logic, pipe and bullet delimiter joining, and DOM element compatibility matrix.
