# Analysis Report: Milestone 4 - Floating Toast Notifications

**Author**: Explorer 1 (Milestone 4)  
**Date**: 2026-08-07  
**Working Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m4_1`  
**Target Scope**: Refactoring notification system to floating glassmorphic toasts with category icons, subtle glow, copy feedback, and progress timers while preserving test harness DOM compatibility (`#toasts .toast`, `.warn`, `.tact`, `.ticon`, `.tprogress`).

---

## 1. Overview & Codebase Architecture

The toast notification system provides immediate, non-intrusive feedback when users perform actions such as copying defect wording, adding items to the batch queue, deleting/restoring items, editing defects, or performing import/export/reset operations.

Currently, the notification flow spans three primary files:
- **`src/types/qc.ts`** (lines 81–89): Defines the `ToastNotice` type interface.
- **`src/hooks/useQCState.ts`** (lines 87, 126–140): Manages state `toasts`, `addToast`, `removeToast`, and auto-dismiss timer.
- **`src/components/ToastsContainer.tsx`** (lines 1–78): React container rendering toast elements into DOM element `#toasts`.
- **`src/App.tsx`** (lines 101, 265): Mounts `<ToastsContainer toasts={toasts} onRemoveToast={removeToast} />`.

Note: `src/utils/notifications.ts` is referenced in project spec documents (`PROJECT.md`) as the intended location for `showFloatingToast` helper triggers & category icons, but **does not exist yet** in the current codebase.
Additionally, `src/index.css` imports `@mantine/notifications/styles.css` on line 3, but contains zero custom CSS rules targeting `#toasts`, `.toast`, `.warn`, `.tact`, `.ticon`, or `.tprogress`.

---

## 2. Toast Data Model & Triggers

### 2.1 Interface Definition (`src/types/qc.ts`)

```typescript
// src/types/qc.ts (lines 81-89)
export interface ToastNotice {
  id: string;
  msg: string;
  warn?: boolean;
  action?: {
    label: string;
    fn: () => void;
  };
}
```

### 2.2 Toast Creation & Auto-Dismissal (`src/hooks/useQCState.ts`)

```typescript
// src/hooks/useQCState.ts (lines 126-139)
const addToast = useCallback((msg: string, warn = false, action?: ToastNotice['action']) => {
  const id = 't_' + Math.random().toString(36).substring(2, 9);
  const newToast: ToastNotice = { id, msg, warn, action };
  setToasts((prev) => [...prev, newToast]);

  // Auto dismiss after 4.2 seconds
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 4200);
}, []);

const removeToast = useCallback((id: string) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
}, []);
```

### 2.3 Comprehensive Catalog of Current Triggers

`addToast` is called across `src/hooks/useQCState.ts` in 9 distinct user action pathways:

| Action | Function | Line # | Message Format / Parameters | Type / Warn | Action Button |
|---|---|---|---|---|---|
| Copy Item Wording | `copyText(text)` | 174 | `Copied: "${text.substring(0, 35)}..."` | Normal (`warn: false`) | None |
| Add Item to Batch | `addToBatch(text)` | 188 | `Added to batch: "${text.substring(0, 30)}..."` | Normal (`warn: false`) | None |
| Copy Batch | `copyBatch()` | 235 | `Copied batch (${batchQueue.length} items)` | Normal (`warn: false`) | None |
| Bulk Import Batch | `bulkImportBatch(lines)` | 250 | `Bulk imported ${lines.length} items into batch queue` | Normal (`warn: false`) | None |
| Save Defect Edit | `saveEdit(...)` | 293 | `Updated defect #${number}` | Normal (`warn: false`) | None |
| Add Custom Defect | `saveEdit(...)` | 307 | `Added custom defect #${number}` | Normal (`warn: false`) | None |
| Delete Defect | `deleteItem(item)` | 334 | `Deleted item #${item.n} (${item.t})` | Warning (`warn: true`) | `{ label: 'Undo', fn: () => restoreItem(item.id) }` |
| Restore Defect | `restoreItem(id)` | 343 | `Restored deleted item` | Normal (`warn: false`) | None |
| Export Changes | `exportWording()` | 373 | `Exported wording changes` | Normal (`warn: false`) | None |
| Invalid Import File | `importWording(payload)` | 380 | `Invalid import file payload` | Warning (`warn: true`) | None |
| Successful Import | `importWording(payload)` | 395 | `Imported wording changes successfully` | Normal (`warn: false`) | None |
| Reset All Wording | `resetWording()` | 409 | `Reset all wording changes to default` | Normal (`warn: false`) | None |

---

## 3. Current Container & Component Implementation (`ToastsContainer.tsx`)

`src/components/ToastsContainer.tsx` currently renders toasts using inline CSS styles:

```tsx
// src/components/ToastsContainer.tsx (lines 14-75)
<div
  id="toasts"
  className="toasts-container"
  style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1100,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pointerEvents: 'none',
  }}
>
  {toasts.map((toast) => (
    <div
      key={toast.id}
      className={`toast ${toast.warn ? 'warn' : ''}`}
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '6px',
        background: toast.warn ? '#fff5f5' : '#1098ad',
        color: toast.warn ? '#c92a2a' : '#ffffff',
        border: toast.warn ? '1px solid #ffc9c9' : '1px solid #0c8599',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '0.875rem',
        fontWeight: 500,
        maxWidth: '360px',
      }}
    >
      <span>{toast.msg}</span>

      {toast.action && (
        <button
          className="tact"
          onClick={() => {
            toast.action?.fn();
            onRemoveToast(toast.id);
          }}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            border: toast.warn ? '1px solid #e03131' : '1px solid #ffffff',
            background: toast.warn ? '#e03131' : '#ffffff',
            color: toast.warn ? '#ffffff' : '#0c8599',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  ))}
</div>
```

---

## 4. Test Harness Inspection & Selection Logic (`tests/harness.js`)

The test harness in `tests/harness.js` inspects toasts via DOM queries. It expects specific element structures and class names:

```javascript
// tests/harness.js (lines 549-566)
getToasts: () => {
  ensureFlushed();
  const toasts = Array.from(document.querySelectorAll('#toasts .toast, [data-testid="floating-toast"], [data-testid="toast-pill"], .mantine-Notification-root, .toast-pill'));
  return toasts.map((t) => {
    const text = t.querySelector('span, .mantine-Notification-description, .toast-message')?.textContent || t.textContent || '';
    const isWarn = t.classList.contains('warn') || t.getAttribute('data-color') === 'red';
    const actionBtn = t.querySelector('.tact, [data-testid="toast-action"], button');
    const iconEl = t.querySelector('.ticon, [data-testid="toast-icon"], .mantine-Notification-icon');
    const progressTimerEl = t.querySelector('.tprogress, [data-testid="toast-progress"], .progress-timer');
    return {
      text: text.trim(),
      isWarn,
      actionLabel: actionBtn ? actionBtn.textContent.trim() : null,
      actionBtn,
      hasIcon: !!iconEl,
      hasProgressTimer: !!progressTimerEl
    };
  });
}
```

### Key Compatibility Requirements Extracted from Harness:
1. **Container Selector**: `#toasts`
2. **Toast Element Selector**: `.toast` (or `[data-testid="floating-toast"]`, `[data-testid="toast-pill"]`, `.toast-pill`)
3. **Text Element Selector**: `span` or `.toast-message`
4. **Warning Flag**: Must include `.warn` class when `warn: true` (or `data-color="red"`)
5. **Action Button**: Must include `.tact` class (or `[data-testid="toast-action"]`)
6. **Category Icon Element**: Must include `.ticon` class (or `[data-testid="toast-icon"]`)
7. **Progress Timer Element**: Must include `.tprogress` class (or `[data-testid="toast-progress"]`, `.progress-timer`)

---

## 5. Identified Gaps & Refactoring Blueprint for Milestone 4

| Feature Requirement | Current Implementation | Gap & Missing Capability | Proposed Implementation Strategy |
|---|---|---|---|
| **`src/utils/notifications.ts`** | Missing file | Helper module `showFloatingToast` specified in `PROJECT.md` is absent. | Create `src/utils/notifications.ts` exporting helper functions, icon maps (Tabler icons like `IconCopy`, `IconPlus`, `IconTrash`, `IconCheck`, `IconInfoTriangle`), and notification triggers. |
| **Category Icons (`.ticon`)** | Not rendered | No icon elements present inside `.toast` pills. | Add category/type icons with class `ticon` / `data-testid="toast-icon"` in `<ToastsContainer />`. |
| **Progress Timer (`.tprogress`)** | Not rendered | Pure JavaScript `setTimeout` dismisses toasts after 4.2s without visual timer bar. | Add a progress bar element with class `tprogress` / `data-testid="toast-progress"` animated over 4200ms using CSS `@keyframes`. |
| **Glassmorphic Styling & Glow** | Hardcoded legacy colors (`#1098ad` teal, `#fff5f5` red) | Does not match 2026 Deep Slate & Charcoal theme (`#0f172a`, `#1e293b`, `#334155`, cyan `#06b6d4` glow). | Update styling in `src/index.css` or `ToastsContainer.tsx` using custom CSS variables (`var(--container-charcoal)`, `var(--accent-cyan)`, `backdrop-filter: blur(12px)`). |
| **Entrance / Exit Animations** | Immediate pop-in and abrupt disappear | No transition or animation when toasts appear or dismiss. | Add CSS keyframe slide-in/fade-in animations (`@keyframes toastSlideIn`, `@keyframes progressCountdown`). |
