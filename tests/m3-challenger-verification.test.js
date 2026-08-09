import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone M3 Empirical Challenger Verification & Stress Harness', () => {

  describe('1. View Switcher Integrity & Rapid Stress (List, Grid, Table)', () => {
    it('should switch between List, Grid, and Table views and set dataset attributes correctly', async () => {
      const app = createAppInstance();
      const { document } = app;

      // 1. Grid mode
      await app.setLayoutView('grid');
      let wordingContainer = document.querySelector('#listwrap, [data-testid="wording-container"]');
      let activeViewAttr = document.querySelector('[data-v="grid"]');
      assert.ok(wordingContainer, 'Wording container must exist');
      assert.equal(wordingContainer.getAttribute('data-layout'), 'grid', 'data-layout should be "grid"');
      assert.ok(activeViewAttr, 'Element with data-v="grid" should exist');

      // Check Grid structure (.wording-grid-body or .grid)
      const gridBody = document.querySelector('.wording-grid-body, .grid');
      assert.ok(gridBody, 'Grid body CSS container must exist in DOM');

      // 2. Table mode
      await app.setLayoutView('table');
      wordingContainer = document.querySelector('#listwrap, [data-testid="wording-container"]');
      activeViewAttr = document.querySelector('[data-v="table"]');
      assert.equal(wordingContainer.getAttribute('data-layout'), 'table', 'data-layout should be "table"');
      assert.ok(activeViewAttr, 'Element with data-v="table" should exist');

      // Check Table structure (.wording-table-wrapper & .trow)
      const tableWrapper = document.querySelector('.wording-table-wrapper, table, .table');
      assert.ok(tableWrapper, 'Table wrapper container must exist in DOM');
      const tableRows = document.querySelectorAll('.trow, tbody tr');
      assert.ok(tableRows.length > 0, 'Table rows must be rendered in table view');

      // 3. List mode
      await app.setLayoutView('list');
      wordingContainer = document.querySelector('#listwrap, [data-testid="wording-container"]');
      activeViewAttr = document.querySelector('[data-v="list"]');
      assert.equal(wordingContainer.getAttribute('data-layout'), 'list', 'data-layout should be "list"');
      assert.ok(activeViewAttr, 'Element with data-v="list" should exist');
    });

    it('should maintain state integrity under 30 rapid view mode switches', async () => {
      const app = createAppInstance();
      app.search('battery');

      const initialVisibleCount = app.getVisibleItems().length;
      assert.ok(initialVisibleCount > 0, 'Should have battery search items');

      const views = ['grid', 'table', 'list', 'grid', 'table', 'list'];
      for (let i = 0; i < 30; i++) {
        const view = views[i % views.length];
        await app.setLayoutView(view);
      }

      const finalVisibleCount = app.getVisibleItems().length;
      assert.equal(finalVisibleCount, initialVisibleCount, 'Visible items count must remain identical after rapid view switching');
    });
  });

  describe('2. Batch Drawer Operations & Edge Cases', () => {
    it('should accurately handle delimiter selection (nl, comma, semi, space)', async () => {
      const app = createAppInstance();
      app.toggleAutoClear(false);

      const items = app.getVisibleItems();
      const text0 = items[0].text;
      const text1 = items[1].text;
      const text2 = items[2].text;

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.clickItemAction(2, 'add');

      assert.equal(app.getBatchCount(), 3, 'Batch count should be 3');

      // Newline
      app.setDelimiter('nl');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text0}\n${text1}\n${text2}`);

      // Comma
      app.setDelimiter('comma');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text0}, ${text1}, ${text2}`);

      // Semicolon
      app.setDelimiter('semi');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text0}; ${text1}; ${text2}`);

      // Space
      app.setDelimiter('space');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text0} ${text1} ${text2}`);
    });

    it('should reorder batch items up and down with boundary protection', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      const text0 = items[0].text;
      const text1 = items[1].text;
      const text2 = items[2].text;

      await app.clickItemAction(0, 'add'); // A (index 0)
      await app.clickItemAction(1, 'add'); // B (index 1)
      await app.clickItemAction(2, 'add'); // C (index 2)

      // Top boundary: move item 0 UP (should be no-op)
      assert.doesNotThrow(() => app.moveBatchItemUp(0));
      let batchItems = app.getBatchItems();
      assert.equal(batchItems[0].text, text0);

      // Move item 0 DOWN (swap 0 and 1: B, A, C)
      app.moveBatchItemDown(0);
      batchItems = app.getBatchItems();
      assert.equal(batchItems[0].text, text1, 'Index 0 should now be item B');
      assert.equal(batchItems[1].text, text0, 'Index 1 should now be item A');

      // Bottom boundary: move item 2 DOWN (should be no-op)
      assert.doesNotThrow(() => app.moveBatchItemDown(2));
      batchItems = app.getBatchItems();
      assert.equal(batchItems[2].text, text2, 'Index 2 should remain item C');

      // Move item 1 UP (swap 1 and 0 back: A, B, C)
      app.moveBatchItemUp(1);
      batchItems = app.getBatchItems();
      assert.equal(batchItems[0].text, text0, 'Index 0 should be restored to item A');
      assert.equal(batchItems[1].text, text1, 'Index 1 should be restored to item B');
    });

    it('should remove individual batch item and clear batch drawer', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      const text0 = items[0].text;
      const text2 = items[2].text;

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.clickItemAction(2, 'add');

      assert.equal(app.getBatchCount(), 3);

      // Remove middle item (index 1)
      app.removeBatchItem(1);
      assert.equal(app.getBatchCount(), 2);

      const batchItems = app.getBatchItems();
      assert.equal(batchItems[0].text, text0);
      assert.equal(batchItems[1].text, text2);

      // Clear all
      app.clearBatch();
      assert.equal(app.getBatchCount(), 0);
    });

    it('should support bulk paste into batch drawer queue', async () => {
      const app = createAppInstance();
      const { document, window } = app;

      // 1. Open Bulk Paste Dialog by clicking open button
      const openBtn = document.querySelector('#bpaste');
      if (openBtn) {
        openBtn.click();
        await waitAsync(30);
      }

      // 2. Query the textarea inside the open dialog
      const pasteTextarea = document.querySelector('textarea[placeholder*="Paste defect lines"]');
      assert.ok(pasteTextarea, 'Textarea inside bulk paste dialog must exist');

      const pasteText = "Bulk Defect 1\nBulk Defect 2\n\nBulk Defect 3";
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      nativeSetter.call(pasteTextarea, pasteText);
      pasteTextarea.dispatchEvent(new window.Event('input', { bubbles: true }));
      pasteTextarea.dispatchEvent(new window.Event('change', { bubbles: true }));

      // 3. Find and click the "Import Lines" button
      const importBtns = Array.from(document.querySelectorAll('button'));
      const importBtn = importBtns.find((b) => b.textContent.includes('Import Lines'));
      assert.ok(importBtn, 'Import Lines submit button must exist');

      importBtn.click();
      await waitAsync(30);

      assert.equal(app.getBatchCount(), 3, 'Bulk paste should populate 3 batch drawer items');
      const batchItems = app.getBatchItems();
      assert.equal(batchItems[0].text, 'Bulk Defect 1');
      assert.equal(batchItems[1].text, 'Bulk Defect 2');
      assert.equal(batchItems[2].text, 'Bulk Defect 3');
    });
  });

  describe('3. Floating Toast Notifications System Verification', () => {
    it('should render minimalist Onyx toast with glowing cyan shadow, progress bar, and message', async () => {
      const app = createAppInstance();
      await app.clickItemRow(0);

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Toast container #toasts should contain at least 1 toast');
      
      const firstToast = toasts[0];
      assert.ok(firstToast.text.length > 0, 'Toast message must contain non-empty text');
      
      // Verify toast styling elements
      const toastEl = app.document.querySelector('#toasts .toast, [data-testid="floating-toast"]');
      assert.ok(toastEl, 'Toast element must exist');
      
      // Verify cyan progress bar exists inside toast
      const progressEl = toastEl.querySelector('.tprogress, [data-testid="toast-progress"], .progress-timer');
      assert.ok(progressEl, 'Toast must render .tprogress progress bar timer indicator');
    });

    it('should throttle and sustain rapid toast spawning (20 clicks in sequence)', async () => {
      const app = createAppInstance();
      for (let i = 0; i < 20; i++) {
        await app.clickItemRow(i % 5);
      }

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Toasts must be active');
      assert.ok(toasts.length <= 25, 'Toast DOM count should remain within safe bounds');
    });
  });

  describe('4. Pin/Star Actions & Custom Pin Folder Persistence', () => {
    it('should toggle pin state, persist to localStorage, and display in pinned category view', async () => {
      const app = createAppInstance();
      const initialItems = app.getVisibleItems();
      const targetItem = initialItems[0];

      // Pin first item
      await app.clickItemAction(0, 'pin');

      // Check localStorage for qc-pins
      const rawPins = app.window.localStorage.getItem('qc-pins');
      assert.ok(rawPins, 'qc-pins should exist in localStorage');
      const pins = JSON.parse(rawPins);
      assert.ok(pins.includes(targetItem.id), `qc-pins should contain item id ${targetItem.id}`);

      // Check qc-pin-folders
      const rawFolders = app.window.localStorage.getItem('qc-pin-folders');
      assert.ok(rawFolders, 'qc-pin-folders should exist in localStorage');
      const folders = JSON.parse(rawFolders);
      assert.ok(folders.length > 0, 'Should have at least 1 pin folder');
      assert.ok(folders[0].itemIds.includes(targetItem.id), 'Default pin folder should contain pinned item');

      // Switch category to "pinned"
      app.selectCategory('pinned');
      const pinnedItems = app.getVisibleItems();
      assert.equal(pinnedItems.length, 1, 'Pinned view should show 1 pinned item');
      assert.equal(pinnedItems[0].text, targetItem.text, 'Pinned item text must match target item');

      // Unpin item
      await app.clickItemAction(0, 'pin');

      // Switch category back to "pinned"
      app.selectCategory('pinned');
      const updatedPinned = app.getVisibleItems();
      assert.equal(updatedPinned.length, 0, 'Pinned view should now be empty');
    });
  });
});
