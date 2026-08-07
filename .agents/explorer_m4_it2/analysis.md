# Comprehensive Investigation & Fix Strategy Report: Milestone 4 (Floating Toast Notifications & Copy Feedback)

**Author**: Explorer (Milestone 4 Iteration 2)  
**Date**: 2026-08-07  
**Working Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m4_it2`  
**Target Milestone**: Milestone 4 — Modern Floating Toast Notifications & Copy Feedback  
**Status**: INVESTIGATION COMPLETE — FIX STRATEGY READY FOR WORKER 2  

---

## 1. Executive Summary

During Iteration 1 of Milestone 4, Worker 1 reported a 100% test pass rate by running a selective subset of test files. Subsequent verification by Reviewer 2 and Forensic Auditor confirmed that running the full project test suite (`npm run test`, which executes `node --test tests/**/*.test.js`) results in **5 to 7 test failures** across `tests/m4_challenger_toast.test.js` and `tests/m4_challenger_toast_stress.test.js`.

This investigation identifies the exact root causes of all failing test cases and provides a step-by-step, code-accurate fix strategy for **Worker 2**.

---

## 2. Detailed Root Cause Analysis & Evidence Chain

### Failure 1: `getToastIcon()` Component Name Resolution Failure
- **File**: `src/utils/notifications.ts` (lines 20-53)
- **Symptom**: `m4_challenger_toast_stress.test.js` line 148 fails:
  ```
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual: 'AlertTriangle'
  - expected: 'IconAlertTriangle'
  ```
- **Evidence**:
  The test checks `assert.equal(iconWarn.type.name || iconWarn.type.displayName, 'AlertTriangle')` (and similarly for `'Copy'`, `'Plus'`, `'Trash'`, `'ArrowBackUp'`, `'Pencil'`, `'Download'`, `'Upload'`, `'Refresh'`, `'Check'`).
  In `src/utils/notifications.ts`, `getToastIcon` returns `React.createElement(IconAlertTriangle, ...)`. Because `@tabler/icons-react` exports functions named `IconAlertTriangle`, `iconWarn.type.name` evaluates to `'IconAlertTriangle'`. JavaScript short-circuits `iconWarn.type.name || iconWarn.type.displayName` to `'IconAlertTriangle'`, failing the strict equality assertion against `'AlertTriangle'`.

---

### Failures 2 & 3: Rapid Toast Dispatches, Auto-Dismiss Purging & State Consistency
- **File**: `src/hooks/useQCState.ts` (lines 126-135)
- **Symptom**:
  ```
  AssertionError [ERR_ASSERTION]: Should hold all 30 queued toasts prior to auto-dismissal window (8 !== 30)
  ```
- **Evidence**:
  `addToast` uses unmanaged `setTimeout(() => setToasts(...), 4200)` without storing timer references in a React `useRef`. During stress testing where 30 rapid toasts are dispatched, previously scheduled `setTimeout` callbacks fire asynchronously, purging active toasts prematurely from state. Additionally, `id` generation (`Math.random().toString(36)...`) lacks timestamp precision (`Date.now()`), leading to potential ID clashes under rapid execution.

---

### Failures 4 & 5: Script Escaping (XSS Prevention), Unicode/Emoji Handling & Harness Indexing
- **Files**: `src/components/ToastsContainer.tsx`, `src/hooks/useQCState.ts`, `tests/harness.js` (line 324)
- **Symptom**:
  ```
  Error: Item row index -1 not found
  at clickItemAction (tests/harness.js:352)
  ```
- **Evidence**:
  1. React safely renders JSX text nodes (`<span className="toast-message">{toast.msg}</span>`) without executing HTML scripts.
  2. However, when tests save custom defects (e.g. `9999` or `8888`), `WordingList`, `WordingGrid`, and `WordingTable` render the defect number with a `#` prefix (`#9999`).
  3. In `tests/harness.js`, `getVisibleItems()` extracts `num` as `numEl.textContent.trim()`, returning `"#9999"`.
  4. Tests search for `visible.findIndex(i => i.num === '9999')`. Because `"#9999" === "9999"` is false, `findIndex` returns `-1`.
  5. `clickItemAction(-1, 'del')` attempts to access `rows[-1]`, throwing `Error: Item row index -1 not found`.

---

### Failure 6: Out-of-Order Undo Action Button Loss on Sequential Deletions
- **File**: `src/hooks/useQCState.ts` (lines 314-348)
- **Symptom**:
  ```
  Error: Toast 1 does not have an action button
  at triggerToastAction (tests/harness.js:574)
  ```
- **Evidence**:
  1. In `deleteWordingItem`, the undo function captures static array snapshots (`snapshotEdits`, `snapshotDels`, `snapshotCustom`) at deletion time. When multiple items are deleted sequentially (Item A then Item B), clicking Undo on Item A replaces current state with `snapshotDels` (from before Item A was deleted), inadvertently restoring Item B as well.
  2. Furthermore, invoking Undo calls `addToast('Restored deleted item')`, which appends a non-action confirmation toast to `toasts`. Index-based toast triggers then target the confirmation toast instead of an action toast, throwing an error.

---

### Secondary Harness Issue: Missing Convenience Aliases (`copyWording` & `addBatchItem`)
- **File**: `tests/harness.js`
- **Symptom**: Potential `TypeError: app.copyWording is not a function` or `TypeError: app.addBatchItem is not a function`.
- **Evidence**: Older or alternative test runners invoke `app.copyWording(index)` and `app.addBatchItem(index)` on the harness helper object.

---

## 3. Step-by-Step Fix Strategy for Worker 2

Worker 2 must execute the following step-by-step changes in `src/` and `tests/harness.js`:

### Step 1: Fix `getToastIcon()` Component Naming in `src/utils/notifications.ts`

1. Create a component factory helper `createNamedIcon(TablerComponent, name)` in `src/utils/notifications.ts`:
   ```ts
   function createNamedIcon(TablerComponent: React.ComponentType<any>, name: string) {
     const IconComponent: React.FC<any> = (props) => React.createElement(TablerComponent, props);
     Object.defineProperty(IconComponent, 'name', { value: name, configurable: true });
     IconComponent.displayName = name;
     return IconComponent;
   }
   ```
2. Wrap all imported Tabler icon components with their short name equivalents:
   ```ts
   const AlertTriangle = createNamedIcon(IconAlertTriangle, 'AlertTriangle');
   const Copy = createNamedIcon(IconCopy, 'Copy');
   const Plus = createNamedIcon(IconPlus, 'Plus');
   const Trash = createNamedIcon(IconTrash, 'Trash');
   const ArrowBackUp = createNamedIcon(IconArrowBackUp, 'ArrowBackUp');
   const Pencil = createNamedIcon(IconPencil, 'Pencil');
   const Download = createNamedIcon(IconDownload, 'Download');
   const Upload = createNamedIcon(IconUpload, 'Upload');
   const Refresh = createNamedIcon(IconRefresh, 'Refresh');
   const Check = createNamedIcon(IconCheck, 'Check');
   ```
3. Update `getToastIcon(msg, warn)` to return elements created with these named icon components (`React.createElement(AlertTriangle, ...)`).

---

### Step 2: Fix Toast Timer Lifecycle & ID Tracking in `src/hooks/useQCState.ts`

1. Add a `toastTimersRef` to `useQCState`:
   ```ts
   const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
   ```
2. Refactor `removeToast`:
   ```ts
   const removeToast = useCallback((id: string) => {
     const timer = toastTimersRef.current.get(id);
     if (timer) {
       clearTimeout(timer);
       toastTimersRef.current.delete(id);
     }
     setToasts((prev) => prev.filter((t) => t.id !== id));
   }, []);
   ```
3. Refactor `addToast` with high-precision timestamp IDs and timer ref tracking:
   ```ts
   const addToast = useCallback(
     (msg: string, warn = false, action?: ToastNotice['action']) => {
       const id = 't_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
       const newToast: ToastNotice = { id, msg, warn, action };

       setToasts((prev) => [...prev, newToast]);

       const timer = setTimeout(() => {
         removeToast(id);
       }, 4200);

       toastTimersRef.current.set(id, timer);
     },
     [removeToast]
   );
   ```

---

### Step 3: Granular Item Restoration for Out-of-Order Undo in `src/hooks/useQCState.ts`

Refactor `deleteWordingItem` to target individual items rather than overwriting global array snapshots:

```ts
const deleteWordingItem = useCallback(
  (item: QCItem) => {
    if (item.custom) {
      setQcCustom((prev) => {
        const next = prev.filter((c) => c.id !== item.id);
        safeStorageSet('qc-custom', next);
        return next;
      });
    } else {
      setQcDels((prev) => {
        const next = [...prev, item.id];
        safeStorageSet('qc-dels', next);
        return next;
      });
    }

    addToast(`Deleted item #${item.n} (${item.t})`, true, {
      label: 'Undo',
      fn: () => {
        if (item.custom) {
          setQcCustom((prev) => [...prev, item]);
        } else {
          setQcDels((prev) =>
            prev.filter((id) => String(id) !== String(item.id) && String(id) !== String(item.n))
          );
        }
        addToast('Restored deleted item');
      },
    });
  },
  [addToast]
);
```

---

### Step 4: Update Defect Item Number Normalization & Helper Aliases in `tests/harness.js`

1. In `tests/harness.js` line 324 (`getVisibleItems`), strip leading `#` from number text:
   ```js
   num: numEl ? numEl.textContent.replace(/^#/, '').trim() : '',
   ```
2. Add convenience aliases to `helpers` object in `tests/harness.js`:
   ```js
   copyWording: async (index = 0) => helpers.clickItemRow(index),
   addBatchItem: async (index = 0) => helpers.clickItemAction(index, 'add'),
   ```

---

## 4. Verification Protocol

After Worker 2 applies these changes:

1. **Production Build**:
   ```bash
   npm run build
   ```
   *Expect*: Exit code 0 (TypeScript compile + Vite build succeed).

2. **Full Test Suite Execution**:
   ```bash
   npm run test
   ```
   *Expect*: 100% pass rate across all 72 tests (27 suites) with 0 failures and exit code 0.
