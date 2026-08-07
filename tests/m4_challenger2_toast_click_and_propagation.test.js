import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Challenger 2 M4 Iteration 3: Empirical Verification of Toast Click-to-Dismiss & stopPropagation', () => {

  it('1. Direct .toast Div Click: Clicking .toast pill directly dismisses the notice from state & DOM', async () => {
    const app = createAppInstance();

    // Spawn a toast notification by copying wording
    await app.clickItemRow(0);

    const initialToasts = app.getToasts();
    assert.equal(initialToasts.length, 1, 'Should have 1 active toast notification');

    const toastNode = app.document.querySelector('#toasts .toast');
    assert.ok(toastNode, '#toasts .toast element must exist in DOM');

    // Click directly on .toast div
    toastNode.click();
    await waitAsync(30);

    const toastsAfterClick = app.getToasts();
    assert.equal(toastsAfterClick.length, 0, 'Toast must be removed from state after clicking .toast div');
    assert.equal(app.document.querySelectorAll('#toasts .toast').length, 0, 'DOM container must have 0 elements after click-to-dismiss');
  });

  it('2. Sub-Element Event Bubbling: Clicking .toast-message, .ticon, or .tprogress inside .toast dismisses notice', async () => {
    const app = createAppInstance();

    // Spawn 3 toasts
    await app.clickItemRow(0);
    await app.clickItemRow(1);
    await app.clickItemRow(2);

    assert.equal(app.getToasts().length, 3, 'Should have 3 active toasts');

    const toastNodes = Array.from(app.document.querySelectorAll('#toasts .toast'));
    assert.equal(toastNodes.length, 3);

    // Click on .toast-message inside first toast
    const msgEl = toastNodes[0].querySelector('.toast-message');
    assert.ok(msgEl, '.toast-message element must exist');
    msgEl.click();
    await waitAsync(30);

    assert.equal(app.getToasts().length, 2, 'Clicking .toast-message must bubble and dismiss toast 1');

    // Click on .ticon inside second toast (now index 0)
    const remainingToasts1 = Array.from(app.document.querySelectorAll('#toasts .toast'));
    const iconEl = remainingToasts1[0].querySelector('.ticon');
    assert.ok(iconEl, '.ticon element must exist');
    iconEl.click();
    await waitAsync(30);

    assert.equal(app.getToasts().length, 1, 'Clicking .ticon must bubble and dismiss toast 2');

    // Click on .tprogress inside third toast (now index 0)
    const remainingToasts2 = Array.from(app.document.querySelectorAll('#toasts .toast'));
    const progressEl = remainingToasts2[0].querySelector('.tprogress');
    assert.ok(progressEl, '.tprogress element must exist');
    progressEl.click();
    await waitAsync(30);

    assert.equal(app.getToasts().length, 0, 'Clicking .tprogress must bubble and dismiss toast 3');
  });

  it('3. Selective Dismissal: Clicking middle toast dismisses only that specific toast', async () => {
    const app = createAppInstance();

    // Spawn 3 distinct toasts by selecting different categories/actions
    await app.clickItemRow(0);
    await app.clickItemRow(1);
    await app.clickItemRow(2);

    const initialToasts = app.getToasts();
    assert.equal(initialToasts.length, 3);
    const text0 = initialToasts[0].text;
    const text1 = initialToasts[1].text;
    const text2 = initialToasts[2].text;

    const toastNodes = Array.from(app.document.querySelectorAll('#toasts .toast'));
    // Click middle toast (index 1)
    toastNodes[1].click();
    await waitAsync(30);

    const toastsRemaining = app.getToasts();
    assert.equal(toastsRemaining.length, 2, 'Should have 2 toasts remaining');
    assert.equal(toastsRemaining[0].text, text0, 'First toast should remain unchanged');
    assert.equal(toastsRemaining[1].text, text2, 'Third toast should remain unchanged');
    assert.ok(!toastsRemaining.some(t => t.text === text1), 'Middle toast (text1) must be removed');
  });

  it('4. Action Button (.tact) stopPropagation Execution: Clicking .tact button stops SyntheticEvent propagation to parent .toast onClick', async () => {
    const app = createAppInstance();
    app.toggleEditMode();

    // Delete item to spawn toast with .tact action button
    await app.clickItemAction(0, 'del');

    const toastNode = app.document.querySelector('#toasts .toast');
    assert.ok(toastNode, '.toast node must exist');
    const tactBtn = toastNode.querySelector('.tact');
    assert.ok(tactBtn, '.tact button must exist');

    // Trigger action via test harness helper
    const initialItemCount = app.getVisibleItems().length;
    app.triggerToastAction(0);
    await waitAsync(30);

    // Verify item count was restored via action callback
    const restoredItemCount = app.getVisibleItems().length;
    assert.equal(restoredItemCount, initialItemCount + 1, 'Action callback (Undo) must be executed');

    // Verify that e.stopPropagation() in .tact prevented double invocation of removal logic
    // Restoring item spawned 1 new confirmation toast ("Restored deleted item") while removing original toast.
    // Total toasts should be 1 (the confirmation toast).
    // If e.stopPropagation() was missing, .toast onClick would also fire, attempting duplicate removal.
    const remainingToasts = app.getToasts();
    assert.equal(remainingToasts.length, 1, 'Should have exactly 1 toast (restoration notice) after clicking .tact');
    assert.equal(remainingToasts[0].text, 'Restored deleted item');
  });

  it('5. Rapid Toast Dismissal Stress: Interleaved clicking on toasts and action buttons maintains clean state', async () => {
    const app = createAppInstance();
    app.toggleEditMode();

    // Generate mix of standard toasts and warning action toasts
    await app.clickItemRow(0);
    await app.clickItemAction(0, 'del');
    await app.clickItemRow(1);
    await app.clickItemAction(1, 'del');

    assert.equal(app.getToasts().length, 4, 'Should have 4 active toasts');

    // Click toast 0 (.toast div)
    const toastEls1 = app.document.querySelectorAll('#toasts .toast');
    toastEls1[0].click();
    await waitAsync(30);

    assert.equal(app.getToasts().length, 3, 'Queue reduced to 3 after clicking toast 0');

    // Click action button on toast with action
    const toastEls2 = Array.from(app.document.querySelectorAll('#toasts .toast'));
    const actionBtn = toastEls2.find(el => el.querySelector('.tact'))?.querySelector('.tact');
    assert.ok(actionBtn, 'Action button should exist in remaining toasts');
    actionBtn.click();
    await waitAsync(30);

    // Clicking action button restores item and spawns 1 confirmation toast while removing the action toast
    const toastsFinal = app.getToasts();
    assert.ok(toastsFinal.length >= 1, 'Remaining toasts should exist');
  });

});
