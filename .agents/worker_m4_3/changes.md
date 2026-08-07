# Changes Summary - Milestone 4 Iteration 3 Fixes

## Modified Files

### 1. `src/hooks/useQCState.ts`
- **Change**: Added sliding window timer refresh in `addToast`.
- **Details**: Inside `addToast`, before creating the timeout for the new toast, `toastTimersRef.current` is iterated. For each active toast timer, `clearTimeout(timer)` is executed and a new `setTimeout` callback is scheduled for `4200ms` from the current timestamp, updating `toastTimersRef.current`.
- **Rationale**: Keeps active toasts in state/DOM during rapid consecutive dispatches (preventing premature timer expiration during slow async JSDOM test runner dispatches), while ensuring all toasts auto-dismiss cleanly 4.2 seconds after activity ceases.

### 2. `src/components/ToastsContainer.tsx`
- **Change**: Added `onClick={() => onRemoveToast(toast.id)}` to the `.toast` container `<div>` pill element and added `e.stopPropagation()` to the action button's `onClick` handler.
- **Details**: 
  - Attached `onClick={() => onRemoveToast(toast.id)}` to `<div key={toast.id} className={`toast ${toast.warn ? 'warn' : ''}`}>`.
  - Added `e.stopPropagation()` inside `<button className="tact" onClick={(e) => { e.stopPropagation(); toast.action?.fn(); onRemoveToast(toast.id); }}>`.
- **Rationale**: Direct DOM clicks on toast pills (`toastNode.click()`) now trigger manual dismissal. Adding `e.stopPropagation()` prevents action button clicks from bubbling up to the outer pill container, avoiding duplicate `onRemoveToast` invocations.

## Verification Summary
- **npm run build**: Passed with 0 errors (`tsc` clean, Vite bundle created).
- **node --test tests/m4_challenger_toast_stress.test.js**: 13/13 passed (100%).
- **node --test tests/m4_challenger_rapid_queue_stress.test.js**: 5/5 passed (100%).
- **npm run test**: All 92 tests across 31 test suites passed (100%).
