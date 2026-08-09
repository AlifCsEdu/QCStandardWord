import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';
import { getToastIcon, createToastNotice, showFloatingToast } from '../src/utils/notifications.ts';

describe('Milestone 4 Challenger: Floating Toast Notifications Empirical Stress Harness', () => {

  describe('1. Rapid Action Stress Testing', () => {
    it('should handle rapid toast queueing and render all active toast pills in DOM container', { timeout: 120000 }, async () => {
      const app = createAppInstance();

      // Rapidly add 5 batch items
      for (let i = 0; i < 5; i++) {
        await app.clickItemAction(i % 2, 'add');
      }

      const toasts = app.getToasts();
      assert.equal(toasts.length, 5, 'Should hold all 5 queued toasts in active state');

      // Verify DOM container #toasts contains 5 toast elements
      const toastEls = app.document.querySelectorAll('#toasts .toast');
      assert.equal(toastEls.length, 5, '#toasts DOM container must render 5 toast pill elements');

      // Verify all toasts render category icon and progress timer bar
      assert.ok(toasts.every((t) => t.hasIcon), 'Every toast must render a category icon');
      assert.ok(toasts.every((t) => t.hasProgressTimer), 'Every toast must render a progress timer bar');
    });

    it('should cleanly auto-dismiss all toasts after 4.2 seconds timer window expires', { timeout: 120000 }, async () => {
      const app = createAppInstance();

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      assert.equal(app.getToasts().length, 2, 'Should have 2 active toasts initially');

      // Wait 4300ms for timers to fire
      await waitAsync(4300);

      assert.equal(app.getToasts().length, 0, 'All toasts must be auto-dismissed after 4.2 seconds');
      const toastEls = app.document.querySelectorAll('#toasts .toast');
      assert.equal(toastEls.length, 0, '#toasts container should be empty in DOM');
    });

    it('should handle rapid creation of 100 ToastNotice objects via showFloatingToast utility', () => {
      const notices = [];
      for (let i = 0; i < 100; i++) {
        notices.push(showFloatingToast(`Test notice #${i}`, i % 2 === 0 ? 'info' : 'warn'));
      }

      assert.equal(notices.length, 100);
      const uniqueIds = new Set(notices.map((n) => n.id));
      assert.equal(uniqueIds.size, 100, 'All 100 generated toast notices must have unique IDs');
    });
  });

  describe('2. Long Message & Boundary Input Stress Testing', () => {
    it('should render extremely long text messages (500+ and 5000+ chars) in toast notices', () => {
      const longMessage500 = 'A'.repeat(500);
      const longMessage5000 = 'B'.repeat(5000);

      const notice1 = showFloatingToast(longMessage500, 'info');
      const notice2 = showFloatingToast(longMessage5000, 'warn');

      assert.equal(notice1.msg.length, 500);
      assert.equal(notice2.msg.length, 5000);
      assert.equal(notice2.warn, true);
    });

    it('should truncate single item copy text to 35 chars with ellipsis in toast notifications', async () => {
      const app = createAppInstance();
      const longTextItem = 'This is a very long defect description exceeding thirty five characters in total length';

      // Add custom item with long text
      app.toggleEditMode();
      app.openAddModal();
      app.saveModalForm(longTextItem, 'screen', 7777);

      // Copy long item single
      const visible = app.getVisibleItems();
      const longItemIndex = visible.findIndex((i) => i.text.includes('This is a very long defect'));
      assert.ok(longItemIndex !== -1, 'Custom long defect item must be visible');

      await app.clickItemRow(longItemIndex);

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0);
      const copyToastText = toasts[toasts.length - 1].text;
      assert.ok(copyToastText.includes('Copied: "This is a very long defect descript...'), `Copy toast text "${copyToastText}" must truncate long text at 35 chars with ellipsis`);
    });

    it('should safely render HTML strings as plain text without XSS script execution', async () => {
      const app = createAppInstance();
      const injectionPayload = '<script id="xss-test">window.__xss_executed=true;</script>';

      app.toggleEditMode();
      app.openAddModal();
      app.saveModalForm(injectionPayload, 'screen', 9999);

      // Trigger deletion of this item to get toast with item text
      const visible = app.getVisibleItems();
      const targetIndex = visible.findIndex((i) => i.num.includes('9999'));
      assert.ok(targetIndex !== -1, 'Custom item #9999 must exist in visible items');
      await app.clickItemAction(targetIndex, 'del');

      const toasts = app.getToasts();
      const delToast = toasts[toasts.length - 1];

      assert.ok(delToast.text.includes('<script id="xss-test">'), 'Toast message should contain raw string payload');
      assert.equal(app.window.__xss_executed, undefined, 'Script tag MUST NOT execute inside DOM');
      assert.equal(app.document.querySelector('#xss-test'), null, 'Script tag MUST NOT be injected into DOM element tree');
    });

    it('should preserve unicode, emojis, and special control characters in toast notifications', async () => {
      const app = createAppInstance();
      const unicodePayload = '🔥 Defect Alert ⚠️';

      app.toggleEditMode();
      app.openAddModal();
      app.saveModalForm(unicodePayload, 'camera', 8888);

      const visible = app.getVisibleItems();
      const targetIndex = visible.findIndex((i) => i.num.includes('8888'));
      assert.ok(targetIndex !== -1, 'Custom item #8888 must exist in visible items');
      await app.clickItemAction(targetIndex, 'del');

      const toasts = app.getToasts();
      assert.ok(toasts[toasts.length - 1].text.includes('🔥 Defect Alert ⚠️'), 'Toast must preserve unicode emoji characters');
    });
  });

  describe('3. Warning Toast & Contextual Icon Stress Testing', () => {
    it('should apply warning CSS class (.warn) and warning state for deleted items', async () => {
      const app = createAppInstance();

      app.toggleEditMode();
      await app.clickItemAction(0, 'del');

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0);
      const warnToast = toasts[toasts.length - 1];

      assert.equal(warnToast.isWarn, true, 'Deleted item toast must have isWarn=true');
      assert.equal(warnToast.actionLabel, 'Undo', 'Deleted item toast must have "Undo" action button');

      const warnDomEl = app.document.querySelector('#toasts .toast.warn');
      assert.ok(warnDomEl !== null, 'DOM container must render .toast.warn element');
    });

    it('should map message keywords to correct Tabler icon components in getToastIcon()', () => {
      const iconWarn = getToastIcon('Warning test', true);
      assert.equal(iconWarn.type.name || iconWarn.type.displayName, 'AlertTriangle');

      const iconCopy = getToastIcon('Copied to clipboard');
      assert.equal(iconCopy.type.name || iconCopy.type.displayName, 'Copy');

      const iconAdd = getToastIcon('Added item to batch');
      assert.equal(iconAdd.type.name || iconAdd.type.displayName, 'Plus');

      const iconDel = getToastIcon('Deleted defect #123');
      assert.equal(iconDel.type.name || iconDel.type.displayName, 'Trash');

      const iconUndo = getToastIcon('Restored item');
      assert.equal(iconUndo.type.name || iconUndo.type.displayName, 'ArrowBackUp');

      const iconSave = getToastIcon('Saved item #45');
      assert.equal(iconSave.type.name || iconSave.type.displayName, 'Pencil');

      const iconExport = getToastIcon('Exported json changes');
      assert.equal(iconExport.type.name || iconExport.type.displayName, 'Download');

      const iconImport = getToastIcon('Imported changes successfully');
      assert.equal(iconImport.type.name || iconImport.type.displayName, 'Upload');

      const iconReset = getToastIcon('Reset all wording changes');
      assert.equal(iconReset.type.name || iconReset.type.displayName, 'Refresh');

      const iconDefault = getToastIcon('Something else random');
      assert.equal(iconDefault.type.name || iconDefault.type.displayName, 'Check');
    });

    it('should handle interleaving of warning toasts and normal toasts cleanly', async () => {
      const app = createAppInstance();

      // Add 2 batch items (2 normal toasts)
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      // Delete 2 items (2 warning toasts)
      app.toggleEditMode();
      await app.clickItemAction(0, 'del');
      await app.clickItemAction(0, 'del');

      const toasts = app.getToasts();
      assert.equal(toasts.length, 4, 'Should contain 4 active toasts');

      const warnToasts = toasts.filter((t) => t.isWarn);
      const normalToasts = toasts.filter((t) => !t.isWarn);

      assert.equal(warnToasts.length, 2, 'Should contain 2 warning toasts');
      assert.equal(normalToasts.length, 2, 'Should contain 2 normal toasts');
    });
  });

  describe('4. Undo Action Triggers & Callback Stress Testing', () => {
    it('should execute Undo action callback, restore deleted item, and spawn confirmation toast', async () => {
      const app = createAppInstance();
      const initialItems = app.getVisibleItems();
      const deletedItemText = initialItems[0].text;
      const initialCount = initialItems.length;

      app.toggleEditMode();

      // Delete item 0
      await app.clickItemAction(0, 'del');
      let afterDelItems = app.getVisibleItems();
      assert.equal(afterDelItems.length, initialCount - 1, 'Item should be removed after deletion');

      const toastsBeforeUndo = app.getToasts();
      const delToastIndex = toastsBeforeUndo.findIndex((t) => t.actionLabel === 'Undo');
      assert.ok(delToastIndex !== -1, 'Delete toast with Undo action button must exist');

      // Click Undo action button
      app.triggerToastAction(delToastIndex);
      await waitAsync(30);

      const restoredItems = app.getVisibleItems();
      assert.equal(restoredItems.length, initialCount, 'Item count should return to initialCount after Undo');
      assert.ok(restoredItems.some((i) => i.text === deletedItemText), 'Deleted item text should be restored in visible items');

      const toastsAfterUndo = app.getToasts();
      assert.ok(toastsAfterUndo.some((t) => t.text === 'Restored deleted item'), 'Confirmation toast "Restored deleted item" must be shown after Undo');
    });

    it('should handle sequential deletions and undo restorations cleanly', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      const initialCount = items.length;

      app.toggleEditMode();

      // Delete item 0
      await app.clickItemAction(0, 'del');
      assert.equal(app.getVisibleItems().length, initialCount - 1);

      // Undo deletion
      let toasts = app.getToasts();
      let undoIndex = toasts.findIndex((t) => t.actionLabel === 'Undo');
      app.triggerToastAction(undoIndex);
      await waitAsync(30);

      assert.equal(app.getVisibleItems().length, initialCount);

      // Delete item 1
      await app.clickItemAction(1, 'del');
      assert.equal(app.getVisibleItems().length, initialCount - 1);

      // Undo deletion
      toasts = app.getToasts();
      undoIndex = toasts.findIndex((t) => t.actionLabel === 'Undo');
      app.triggerToastAction(undoIndex);
      await waitAsync(30);

      assert.equal(app.getVisibleItems().length, initialCount);
    });

    it('should safely handle rapid action clicks without crashing', async () => {
      const app = createAppInstance();
      app.toggleEditMode();

      await app.clickItemAction(0, 'del');
      const toasts = app.getToasts();
      const undoIndex = toasts.findIndex((t) => t.actionLabel === 'Undo');
      assert.ok(undoIndex !== -1);

      assert.doesNotThrow(() => {
        app.triggerToastAction(undoIndex);
      });
      await waitAsync(30);
    });
  });
});
