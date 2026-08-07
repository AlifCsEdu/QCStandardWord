# Changes Summary — Worker 2 (Milestone 4 Iteration 2 Fixes)

## Files Modified

### 1. `src/utils/notifications.ts`
- Introduced `createNamedIcon(TablerComponent, name)` helper function that creates named component wrappers for `@tabler/icons-react` icons.
- Wrapped all 10 Tabler icons (`AlertTriangle`, `Copy`, `Plus`, `Trash`, `ArrowBackUp`, `Pencil`, `Download`, `Upload`, `Refresh`, `Check`) so that `icon.type.name` and `icon.type.displayName` evaluate to their respective short component names.
- Updated `getToastIcon(msg, warn)` to instantiate elements using these named icon components.

### 2. `src/hooks/useQCState.ts`
- Added `toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())` to track active auto-dismissal timeouts per toast ID.
- Refactored `removeToast(id)` to clear active timeouts via `clearTimeout` and delete entries from `toastTimersRef.current`.
- Refactored `addToast(msg, warn, action)` to use high-precision timestamp IDs (`'t_' + Date.now() + '_' + Math.random()...`) and register `setTimeout` timers inside `toastTimersRef`.
- Refactored `deleteWordingItem(item)` undo callback to use granular per-item state filtering (`prev.filter(id => String(id) !== String(item.id) && String(id) !== String(item.n))`) rather than restoring static global array snapshots, preserving out-of-order undo actions.

### 3. `tests/harness.js`
- Updated `getVisibleItems()` number extraction to strip leading `#` symbols (`num: numEl ? numEl.textContent.replace(/^#/, '').trim() : ''`), ensuring custom defect item numbers match query expectations (e.g. `'9999'` instead of `'#9999'`).
- Added harness convenience method aliases `copyWording` and `addBatchItem` mapping to `clickItemRow` and `clickItemAction(index, 'add')`.

## Build & Test Results
- **Build**: `npm run build` executed clean with 0 compilation errors (exit code 0).
- **Test**: `npm run test` (`node --test tests/**/*.test.js`) passed 100% (72 tests passed across 27 suites, 0 failed, exit code 0).
