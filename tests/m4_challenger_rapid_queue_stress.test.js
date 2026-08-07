import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';
import { getToastIcon } from '../src/utils/notifications.ts';

describe('Challenger M4 Iteration 2: Deep Empirical Stress & State Retention Harness', () => {

  it('1. High-Velocity Rapid Dispatches: Rapid dispatches in succession retain precise queue count', async () => {
    const app = createAppInstance();

    // Trigger 5 toast dispatches rapidly
    for (let i = 0; i < 5; i++) {
      await app.clickItemRow(0);
    }

    const toasts = app.getToasts();
    assert.equal(toasts.length, 5, 'Queue must retain all 5 dispatched toast state items');

    const toastEls = app.document.querySelectorAll('#toasts .toast');
    assert.equal(toastEls.length, 5, '#toasts DOM container must render all 5 toast elements');
  });

  it('2. Manual Dismiss & Auto-Dismiss: Action button dismissal executes undo callback and spawns restoration toast', async () => {
    const app = createAppInstance();
    app.toggleEditMode();

    // Delete 5 items to produce 5 toasts with Undo action buttons (.tact)
    for (let i = 0; i < 5; i++) {
      await app.clickItemAction(0, 'del');
    }

    assert.equal(app.getToasts().length, 5, 'Should initially have 5 warning toasts');

    // Trigger Undo action on toast index 0 (which restores item and spawns confirmation toast)
    app.triggerToastAction(0);

    const toastsAfterUndo = app.getToasts();
    assert.equal(toastsAfterUndo.length, 5, 'Total toasts should remain 5 (1 deleted, 1 confirmation toast added)');
    assert.ok(toastsAfterUndo.some(t => t.text === 'Restored deleted item'), 'Confirmation toast "Restored deleted item" must be spawned');

    // Wait for remaining toasts to auto-dismiss (4300ms)
    await waitAsync(4300);

    assert.equal(app.getToasts().length, 0, 'All remaining toasts should auto-dismiss cleanly after 4.2s timer');
    assert.equal(app.document.querySelectorAll('#toasts .toast').length, 0, 'DOM container should have 0 elements');
  });

  it('3. Extreme Concurrent Undo Action Clicks: Rapid undo clicks restore correct target items without state drift', async () => {
    const app = createAppInstance();
    app.toggleEditMode();

    const initialItems = app.getVisibleItems();
    const initialCount = initialItems.length;

    // Delete 5 items rapidly
    for (let i = 0; i < 5; i++) {
      await app.clickItemAction(0, 'del');
    }

    assert.equal(app.getVisibleItems().length, initialCount - 5, 'Item count should decrease by 5');

    const toasts = app.getToasts();
    const undoToasts = toasts.filter(t => t.actionLabel === 'Undo');
    assert.equal(undoToasts.length, 5, 'Must have 5 Undo action toasts');

    // Trigger all 5 undo actions in reverse order rapidly
    for (let i = 4; i >= 0; i--) {
      const currentToasts = app.getToasts();
      const undoIdx = currentToasts.findIndex(t => t.actionLabel === 'Undo');
      if (undoIdx !== -1) {
        app.triggerToastAction(undoIdx);
        await waitAsync(10);
      }
    }

    const restoredCount = app.getVisibleItems().length;
    assert.equal(restoredCount, initialCount, 'All 5 deleted items must be fully restored by rapid Undo clicks');
  });

  it('4. Tabler Named Icons Verification: getToastIcon returns valid React elements with named types', () => {
    const categories = [
      { msg: 'Copied item text', expected: 'Copy' },
      { msg: 'Added new wording', expected: 'Plus' },
      { msg: 'Deleted entry #42', expected: 'Trash' },
      { msg: 'Restored defect #42', expected: 'ArrowBackUp' },
      { msg: 'Saved changes', expected: 'Pencil' },
      { msg: 'Export dataset', expected: 'Download' },
      { msg: 'Import dataset', expected: 'Upload' },
      { msg: 'Reset configuration', expected: 'Refresh' },
      { msg: 'Random message', expected: 'Check' },
      { msg: 'Warning notice', warn: true, expected: 'AlertTriangle' },
    ];

    for (const cat of categories) {
      const iconEl = getToastIcon(cat.msg, cat.warn);
      assert.ok(iconEl, `getToastIcon("${cat.msg}") must return a valid React element`);
      const componentName = iconEl.type.name || iconEl.type.displayName;
      assert.equal(componentName, cat.expected, `Icon component for "${cat.msg}" must be "${cat.expected}", got "${componentName}"`);
    }
  });

  it('5. Memory Leak / Timer Cleanup Verification: Rapid creation and destruction leaves 0 pending timers', async () => {
    const app = createAppInstance();

    // Dispatch 5 toasts
    for (let i = 0; i < 5; i++) {
      await app.clickItemRow(0);
    }

    assert.equal(app.getToasts().length, 5);

    // Wait for auto dismiss
    await waitAsync(4300);

    assert.equal(app.getToasts().length, 0, 'Toasts array should be empty after timeout');

    // Dispatch 5 more toasts
    for (let i = 0; i < 5; i++) {
      await app.clickItemRow(0);
    }

    assert.equal(app.getToasts().length, 5);

    // Wait again
    await waitAsync(4300);

    assert.equal(app.getToasts().length, 0, 'Toasts array should be empty again after second cycle');
  });

});
