# Milestone 4 - Notification & Floating Toast Test Suite Analysis

## Executive Summary
This analysis details all assertions, DOM elements, IDs, CSS classes, data attributes, text content, and interaction patterns evaluated by the automated test suite for Milestone 4 (Floating Toast Notifications & Copy Feedback). 

The test harness (`tests/harness.js`) and test suite (`tests/tier1-features.test.js`, `tests/tier2-boundary.test.js`, `tests/tier3-combinations.test.js`, `tests/tier4-workloads.test.js`) evaluate notifications via a dedicated helper `getToasts()` and `triggerToastAction()`.

---

## 1. Test Files Examined & Scope

| Test File | Description / Feature Scope | Toast-Related Test Cases |
|---|---|---|
| `tests/harness.js` | JSDOM test harness & helper functions | Defines `getToasts()` (lines 549–567) & `triggerToastAction()` (lines 569–578) |
| `tests/tier1-features.test.js` | Unit test for Feature 7 | Lines 149–158: `it('should trigger floating toast notification on item copy with category icon and progress feedback')` |
| `tests/tier2-boundary.test.js` | Boundary & throttling test | Lines 146–156: `it('should queue floating toasts gracefully without DOM flooding on rapid copy clicks')` |
| `tests/tier3-combinations.test.js` | End-to-End combination pipeline | Lines 68–113: `Pipeline 3: ... Step 3: Trigger Undo from Toast notification` |
| `tests/tier4-workloads.test.js` | Workload integration tests | Verifies toast actions during mobile tech workflows and delete/undo cycles |

---

## 2. Test Harness Selector & Property Mapping (`tests/harness.js`)

From `tests/harness.js` (lines 549–578):

```javascript
// Floating Toast Notifications (Feature 7)
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
},

triggerToastAction: (toastIndex = 0) => {
  runWithFlush(() => {
    const toasts = Array.from(document.querySelectorAll('#toasts .toast, [data-testid="floating-toast"], [data-testid="toast-pill"], .mantine-Notification-root, .toast-pill'));
    if (!toasts[toastIndex]) throw new Error(`Toast index ${toastIndex} not found`);
    const actionBtn = toasts[toastIndex].querySelector('.tact, [data-testid="toast-action"], button');
    if (!actionBtn) throw new Error(`Toast ${toastIndex} does not have an action button`);
    actionBtn.click();
  });
  return helpers;
}
```

---

## 3. Detailed DOM Elements & Attribute Inventory

### A. Toast Container
- **Primary Selector**: `#toasts` (or CSS class `.toasts-container`)
- **Supported Selectors**: `#toasts`
- **Positioning Expectation**: Fixed positioning (`position: fixed`, `bottom: 20px`, `right: 20px`, `z-index: 1100`).

### B. Toast Card / Item Element
- **Primary Selectors**: `#toasts .toast` or `.toast`
- **Alternative / Modern Selectors**:
  - `[data-testid="floating-toast"]`
  - `[data-testid="toast-pill"]`
  - `.toast-pill`
  - `.mantine-Notification-root`

### C. Toast Variant / Warning State (`isWarn`)
- **Primary Class**: `.warn` (e.g. `<div class="toast warn">`)
- **Alternative Attribute**: `[data-color="red"]`

### D. Toast Text Content (`text`)
- **Target Child Selectors**:
  - `span` (e.g. `<span>Message text</span>`)
  - `.mantine-Notification-description`
  - `.toast-message`
  - Direct `t.textContent` (fallback)
- **Observed Message Texts in App (`src/hooks/useQCState.ts`)**:
  - Item copy: `Copied: "${text.substring(0, 35)}..."`
  - Item delete: `Deleted item #${item.n} (${item.t})` (with `warn: true` and `action: { label: 'Undo', fn }`)
  - Add to batch: `Added to batch: "${text.substring(0, 30)}..."`
  - Copy batch: `Copied batch (${batchQueue.length} items)`
  - Bulk import: `Bulk imported ${lines.length} items into batch queue`
  - Edit defect: `Updated defect #${number}`
  - Add defect: `Added custom defect #${number}`

### E. Action Button (`actionBtn` / `actionLabel`)
- **Target Child Selectors**:
  - `.tact` (e.g. `<button class="tact">Undo</button>`)
  - `[data-testid="toast-action"]`
  - `button` (generic button inside toast)
- **Expected Label**: `"Undo"` (tested in `tests/tier3-combinations.test.js`, line 92).

### F. Category Icon (`hasIcon`)
- **Target Child Selectors**:
  - `.ticon`
  - `[data-testid="toast-icon"]`
  - `.mantine-Notification-icon`
- **Requirement R2 Specification**: Floating toast pills with category icons matching the defect item's category.

### G. Progress Timer Bar (`hasProgressTimer`)
- **Target Child Selectors**:
  - `.tprogress`
  - `[data-testid="toast-progress"]`
  - `.progress-timer`
- **Requirement R2 Specification**: Progress timers indicating toast auto-dismiss countdown.

---

## 4. Test Suite Assertions Breakdown

1. **`tests/tier1-features.test.js` (lines 149–158)**:
   ```javascript
   await app.clickItemRow(0);
   const toasts = app.getToasts();
   assert.ok(toasts.length > 0, 'Copying an item should spawn a floating toast notification');
   assert.ok(toasts[0].text.length > 0, 'Toast notification must contain descriptive text');
   ```
   - Checks that clicking an item row spawns at least 1 toast notification.
   - Checks that the toast notification contains non-empty descriptive text.

2. **`tests/tier2-boundary.test.js` (lines 146–156)**:
   ```javascript
   for (let i = 0; i < 5; i++) {
     await app.clickItemRow(i);
   }
   const toasts = app.getToasts();
   assert.ok(toasts.length > 0, 'Toast notifications should render for rapid copy clicks');
   ```
   - Checks rapid consecutive clicks (5 items in sequence).
   - Verifies the toast container handles rapid toast pushes without error or DOM flooding.

3. **`tests/tier3-combinations.test.js` (lines 68–113)**:
   ```javascript
   await app.clickItemAction(0, 'del');
   const toasts = app.getToasts();
   assert.ok(toasts.length > 0, 'Toast notification should be displayed');
   const undoToastIndex = toasts.findIndex((t) => t.actionLabel === 'Undo');
   assert.ok(undoToastIndex >= 0, 'Toast with "Undo" action button should exist');
   app.triggerToastAction(undoToastIndex);
   ```
   - Checks item deletion spawns warning toast with `"Undo"` action button (`.tact` or `[data-testid="toast-action"]`).
   - Verifies clicking the action button restores the deleted item.

---

## 5. Current Implementation Gap Analysis (`src/components/ToastsContainer.tsx`)

| Element / Feature | Test Harness Expectation | Current `ToastsContainer.tsx` Status | Gap / Requirement for M4 |
|---|---|---|---|
| Container ID | `#toasts` | Present (`id="toasts"`) | Compliant |
| Toast Class | `.toast` | Present (`className="toast"`) | Compliant |
| Warning Class | `.warn` | Present (`className="toast warn"`) | Compliant |
| Message Element | `span` | Present (`<span>{toast.msg}</span>`) | Compliant |
| Action Button Class | `.tact` | Present (`className="tact"`) | Compliant |
| Category Icon | `.ticon` / `[data-testid="toast-icon"]` | **Missing** | Need to render category icons in toast pills |
| Progress Timer Bar | `.tprogress` / `[data-testid="toast-progress"]` | **Missing** | Need to render progress bar / timer |
| Modern Styling | Floating glassmorphic pills, subtle glow, cyan accent | Basic inline styles | Needs 2026 Deep Slate / Charcoal theme updates with backdrop-filter / glow |

---

## 6. Recommendations for Implementation Team
1. Retain container `#toasts` and item class `.toast` (plus `.warn` and `.tact`).
2. Add `.ticon` (or `[data-testid="toast-icon"]`) for category icon rendering in `ToastsContainer.tsx`.
3. Add `.tprogress` (or `[data-testid="toast-progress"]`) for progress timer progress bar.
4. Enhance toast pill styling to align with 2026 Deep Slate (#0f172a) / Charcoal (#1e293b) theme with cyan glow effects (#06b6d4 / #0284c7).
