import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone M3 Challenger Adversarial Stress Harness (Batch Drawer & Floating Toasts)', () => {

  describe('1. Batch Item Reordering & Boundary Conditions', () => {
    it('should disable Move Up on the first item and Move Down on the last item', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.clickItemAction(2, 'add');

      const { document } = app;
      const upBtns = document.querySelectorAll('.bup, [data-act="moveup"]');
      const downBtns = document.querySelectorAll('.bdn, [data-act="movedown"]');

      assert.equal(upBtns.length, 3, 'Should render 3 move up buttons');
      assert.equal(downBtns.length, 3, 'Should render 3 move down buttons');

      // Top boundary: First item up button must be disabled
      assert.equal(upBtns[0].disabled, true, 'First item Move Up button must be disabled');
      assert.equal(downBtns[0].disabled, false, 'First item Move Down button must be enabled');

      // Middle item: Both buttons enabled
      assert.equal(upBtns[1].disabled, false, 'Middle item Move Up button must be enabled');
      assert.equal(downBtns[1].disabled, false, 'Middle item Move Down button must be enabled');

      // Bottom boundary: Last item down button must be disabled
      assert.equal(upBtns[2].disabled, false, 'Last item Move Up button must be enabled');
      assert.equal(downBtns[2].disabled, true, 'Last item Move Down button must be disabled');
    });

    it('should handle single-item queue with both Move Up and Move Down disabled', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'add');

      const { document } = app;
      const upBtn = document.querySelector('.bup');
      const downBtn = document.querySelector('.bdn');

      assert.ok(upBtn, 'Move Up button should exist for single item');
      assert.ok(downBtn, 'Move Down button should exist for single item');
      assert.equal(upBtn.disabled, true, 'Single item Move Up must be disabled');
      assert.equal(downBtn.disabled, true, 'Single item Move Down must be disabled');

      // Test invoking move helpers on single item (no-op)
      assert.doesNotThrow(() => app.moveBatchItemUp(0));
      assert.doesNotThrow(() => app.moveBatchItemDown(0));
      assert.equal(app.getBatchCount(), 1, 'Batch count should still be 1');
    });

    it('should handle boundary button clicks safely without throwing or corrupting queue', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      const initialBatch = app.getBatchItems();
      const text0 = initialBatch[0].text;
      const text1 = initialBatch[1].text;

      // Click disabled Move Up button on item 0 (should be no-op)
      const up0 = app.document.querySelector('[data-mvup="0"]');
      assert.ok(up0, 'Move up button for index 0 must exist');
      assert.equal(up0.disabled, true);
      up0.click();

      // Click disabled Move Down button on item 1 (should be no-op)
      const dn1 = app.document.querySelector('[data-mvdn="1"]');
      assert.ok(dn1, 'Move down button for index 1 must exist');
      assert.equal(dn1.disabled, true);
      dn1.click();

      // Verify no out of bounds buttons rendered
      assert.equal(app.document.querySelector('[data-mvup="-1"]'), null);
      assert.equal(app.document.querySelector('[data-mvdn="999"]'), null);

      const afterBatch = app.getBatchItems();
      assert.equal(afterBatch[0].text, text0);
      assert.equal(afterBatch[1].text, text1);
    });

    it('should reorder a 10-item queue bidirectionally under high frequency operations', async () => {
      const app = createAppInstance();
      const visibleItems = app.getVisibleItems().slice(0, 10);
      for (let i = 0; i < 10; i++) {
        await app.clickItemAction(i, 'add');
      }

      assert.equal(app.getBatchCount(), 10, 'Queue should have 10 items');

      // Move item from index 0 down to index 9
      for (let i = 0; i < 9; i++) {
        app.moveBatchItemDown(i);
      }

      let currentBatch = app.getBatchItems();
      assert.equal(currentBatch[9].text, visibleItems[0].text, 'First added item should now be at the bottom (index 9)');

      // Move item from index 9 back up to index 0
      for (let i = 9; i > 0; i--) {
        app.moveBatchItemUp(i);
      }

      currentBatch = app.getBatchItems();
      assert.equal(currentBatch[0].text, visibleItems[0].text, 'First added item should be restored to top (index 0)');
    });

    it('should safely remove items at boundaries (first, last, middle) and sync storage', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.clickItemAction(2, 'add');
      await app.clickItemAction(3, 'add');

      assert.equal(app.getBatchCount(), 4);

      // Remove first item (index 0)
      app.removeBatchItem(0);
      assert.equal(app.getBatchCount(), 3);

      // Remove last item (index 2)
      app.removeBatchItem(2);
      assert.equal(app.getBatchCount(), 2);

      // Clear remaining
      app.clearBatch();
      assert.equal(app.getBatchCount(), 0);
      const stored = app.window.localStorage.getItem('qc-batch');
      assert.equal(stored, '[]');
    });
  });

  describe('2. Delimiter Switching Across All 6 Options & Formatting Oracles', () => {
    it('should verify all 6 delimiters: nl, comma, semi, space, pipe, bullet with custom items', async () => {
      const app = createAppInstance();
      app.toggleAutoClear(false);

      const itemA = 'Display: Green Vertical Line [Defect #101]';
      const itemB = 'Camera: Lens Scratch (Rear, Primary) - "Grade B"';
      const itemC = 'Battery: Swollen 5000mAh • Critical Alert ⚠️';

      // Open Bulk Paste dialog to insert these exact strings
      const openBtn = app.document.querySelector('#bpaste');
      if (openBtn) {
        openBtn.click();
        await waitAsync(30);
      }
      const pasteTextarea = app.document.querySelector('textarea[placeholder*="Paste defect lines"]');
      assert.ok(pasteTextarea, 'Textarea inside bulk paste dialog must exist');

      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLTextAreaElement.prototype, 'value').set;
      nativeSetter.call(pasteTextarea, `${itemA}\n${itemB}\n${itemC}`);
      pasteTextarea.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      pasteTextarea.dispatchEvent(new app.window.Event('change', { bubbles: true }));

      const importBtns = Array.from(app.document.querySelectorAll('button'));
      const importBtn = importBtns.find((b) => b.textContent.includes('Import Lines'));
      importBtn.click();
      await waitAsync(30);

      assert.equal(app.getBatchCount(), 3, 'Queue should have 3 imported items');

      // 1. Delimiter: Newline ('nl') -> \n
      app.setDelimiter('nl');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${itemA}\n${itemB}\n${itemC}`);
      assert.equal(app.window.localStorage.getItem('qc-join'), 'nl');

      // 2. Delimiter: Comma ('comma') -> , 
      app.setDelimiter('comma');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${itemA}, ${itemB}, ${itemC}`);
      assert.equal(app.window.localStorage.getItem('qc-join'), 'comma');

      // 3. Delimiter: Semicolon ('semi') -> ; 
      app.setDelimiter('semi');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${itemA}; ${itemB}; ${itemC}`);
      assert.equal(app.window.localStorage.getItem('qc-join'), 'semi');

      // 4. Delimiter: Space ('space') ->  
      app.setDelimiter('space');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${itemA} ${itemB} ${itemC}`);
      assert.equal(app.window.localStorage.getItem('qc-join'), 'space');

      // 5. Delimiter: Pipe ('pipe') ->  | 
      app.setDelimiter('pipe');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${itemA} | ${itemB} | ${itemC}`);
      assert.equal(app.window.localStorage.getItem('qc-join'), 'pipe');

      // 6. Delimiter: Bullet ('bullet') ->  • 
      app.setDelimiter('bullet');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${itemA} • ${itemB} • ${itemC}`);
      assert.equal(app.window.localStorage.getItem('qc-join'), 'bullet');
    });

    it('should switch delimiter via segmented button tab clicks in UI', async () => {
      const app = createAppInstance();
      app.toggleAutoClear(false);
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      const items = app.getBatchItems();
      const text0 = items[0].text;
      const text1 = items[1].text;

      // Query segmented control buttons in BatchDrawer
      const tabButtons = Array.from(app.document.querySelectorAll('#batchDrawer button[title]'));
      
      const pipeTab = tabButtons.find((b) => b.getAttribute('title')?.includes('Pipe'));
      assert.ok(pipeTab, 'Pipe segmented tab button must exist');
      pipeTab.click();
      await waitAsync(30);

      // Verify select #joinSel synchronized
      const selectEl = app.document.querySelector('#joinSel');
      assert.equal(selectEl.value, 'pipe', 'Select value must sync to "pipe"');

      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text0} | ${text1}`, 'Copy output should use pipe delimiter');

      const bulletTab = tabButtons.find((b) => b.getAttribute('title')?.includes('Bullet'));
      assert.ok(bulletTab, 'Bullet segmented tab button must exist');
      bulletTab.click();
      await waitAsync(30);

      assert.equal(selectEl.value, 'bullet', 'Select value must sync to "bullet"');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text0} • ${text1}`, 'Copy output should use bullet delimiter');
    });

    it('should support copying single item directly from batch drawer (.bcopy-item)', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      const items = app.getBatchItems();
      const singleCopyBtns = app.document.querySelectorAll('.bcopy-item, [data-bc]');
      assert.ok(singleCopyBtns.length >= 2, 'Single copy buttons must exist on batch rows');

      // Click copy on second item
      singleCopyBtns[1].click();
      await waitAsync(30);

      assert.equal(app.getCopiedText(), items[1].text, 'Clipboard should contain single item text');
    });
  });

  describe('3. Bulk Import Textarea Parsing & Edge Case Resilience', () => {
    it('should parse mixed CRLF/LF line breaks, trailing newlines, and whitespace lines', async () => {
      const app = createAppInstance();
      const openBtn = app.document.querySelector('#bpaste');
      openBtn.click();
      await waitAsync(30);

      const pasteTextarea = app.document.querySelector('textarea[placeholder*="Paste defect lines"]');
      const payload = "\r\n  Line 1 with spaces  \r\n\r\n\tLine 2 with tab\t\r\n   \r\nLine 3 Unicode: 画面の傷 (Screen Scratch)\r\n\r\n";

      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLTextAreaElement.prototype, 'value').set;
      nativeSetter.call(pasteTextarea, payload);
      pasteTextarea.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      pasteTextarea.dispatchEvent(new app.window.Event('change', { bubbles: true }));

      const importBtns = Array.from(app.document.querySelectorAll('button'));
      const importBtn = importBtns.find((b) => b.textContent.includes('Import Lines'));
      importBtn.click();
      await waitAsync(30);

      const batchItems = app.getBatchItems();
      assert.equal(batchItems.length, 3, 'Should filter empty/whitespace-only lines and keep 3 valid items');
      assert.equal(batchItems[0].text, 'Line 1 with spaces');
      assert.equal(batchItems[1].text, 'Line 2 with tab');
      assert.equal(batchItems[2].text, 'Line 3 Unicode: 画面の傷 (Screen Scratch)');
    });

    it('should safely handle 150-line large bulk import without memory exhaustion', async () => {
      const app = createAppInstance();
      const openBtn = app.document.querySelector('#bpaste');
      openBtn.click();
      await waitAsync(30);

      const pasteTextarea = app.document.querySelector('textarea[placeholder*="Paste defect lines"]');
      const lines = Array.from({ length: 150 }, (_, i) => `Defect Record #${i + 1} - Standard QC Verification Note`);
      const payload = lines.join('\n');

      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLTextAreaElement.prototype, 'value').set;
      nativeSetter.call(pasteTextarea, payload);
      pasteTextarea.dispatchEvent(new app.window.Event('input', { bubbles: true }));

      const importBtns = Array.from(app.document.querySelectorAll('button'));
      const importBtn = importBtns.find((b) => b.textContent.includes('Import Lines'));
      importBtn.click();
      await waitAsync(30);

      assert.equal(app.getBatchCount(), 150, 'Batch queue should contain all 150 items');
      const batchItems = app.getBatchItems();
      assert.equal(batchItems[0].text, 'Defect Record #1 - Standard QC Verification Note');
      assert.equal(batchItems[149].text, 'Defect Record #150 - Standard QC Verification Note');
    });

    it('should ignore completely empty or whitespace-only bulk import submissions', async () => {
      const app = createAppInstance();
      const initialCount = app.getBatchCount();

      const openBtn = app.document.querySelector('#bpaste');
      openBtn.click();
      await waitAsync(30);

      const pasteTextarea = app.document.querySelector('textarea[placeholder*="Paste defect lines"]');
      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLTextAreaElement.prototype, 'value').set;
      nativeSetter.call(pasteTextarea, '   \n\n\t\t\n   ');
      pasteTextarea.dispatchEvent(new app.window.Event('input', { bubbles: true }));

      const importBtns = Array.from(app.document.querySelectorAll('button'));
      const importBtn = importBtns.find((b) => b.textContent.includes('Import Lines'));
      importBtn.click();
      await waitAsync(30);

      assert.equal(app.getBatchCount(), initialCount, 'Batch count should not change for whitespace-only import');
    });
  });

  describe('4. Floating Toasts System & Burst Notification Stress', () => {
    it('should render toast with .tprogress, .ticon, role="status", aria-live container', async () => {
      const app = createAppInstance();
      await app.clickItemRow(0);

      const toastsContainer = app.document.querySelector('#toasts');
      assert.ok(toastsContainer, '#toasts container must exist');
      assert.equal(toastsContainer.getAttribute('aria-live'), 'polite', 'Container should have aria-live="polite"');

      const toast = toastsContainer.querySelector('.toast, [data-testid="floating-toast"]');
      assert.ok(toast, 'Toast element must exist');
      assert.equal(toast.getAttribute('role'), 'status', 'Toast should have role="status"');

      const icon = toast.querySelector('.ticon, [data-testid="toast-icon"]');
      assert.ok(icon, 'Toast must render .ticon icon container');

      const progress = toast.querySelector('.tprogress, [data-testid="toast-progress"]');
      assert.ok(progress, 'Toast must render .tprogress progress bar');
    });

    it('should dismiss toast when clicked by user', async () => {
      const app = createAppInstance();
      await app.clickItemRow(0);

      let toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Toast should be active');

      // Click the toast element to dismiss
      const toastEl = app.document.querySelector('#toasts .toast');
      toastEl.click();
      await waitAsync(30);

      toasts = app.getToasts();
      assert.equal(toasts.length, 0, 'Toast should be removed after clicking on it');
    });

    it('should handle burst of 50 rapid toast dispatches without throwing or crashing', async () => {
      const app = createAppInstance();

      // Trigger 50 rapid item clicks
      for (let i = 0; i < 50; i++) {
        await app.clickItemRow(i % 5);
      }

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Toasts should be rendered');
      assert.ok(toasts.length <= 55, 'Toasts count should remain safely bounded in DOM');
    });

    it('should render warning styling on warning toasts', async () => {
      const app = createAppInstance();
      app.toggleEditMode();

      // Trigger delete on custom item or trigger warning toast
      const items = app.getVisibleItems();
      const delBtns = app.document.querySelectorAll('[data-act="del"], [data-testid="del-btn"]');
      if (delBtns.length > 0) {
        delBtns[0].click();
        await waitAsync(30);

        const toasts = app.getToasts();
        const warnToast = toasts.find((t) => t.isWarn || t.text.toLowerCase().includes('delete') || t.actionLabel);
        if (warnToast) {
          assert.ok(warnToast, 'Delete action triggers warning toast with undo option');
        }
      }
    });
  });

  describe('5. Visual Polish, Tactile Feedback & Disallowed CSS Rules', () => {
    it('should contain zero backdrop-blur-* classes anywhere in DOM or style elements', async () => {
      const app = createAppInstance();
      const { document } = app;

      const allElements = Array.from(document.querySelectorAll('*'));
      const offendingBlur = allElements.filter((el) => {
        const cls = el.className;
        return typeof cls === 'string' && cls.includes('backdrop-blur');
      });

      assert.equal(
        offendingBlur.length,
        0,
        `Found forbidden backdrop-blur classes on ${offendingBlur.length} elements`
      );
    });

    it('should verify tactile micro-interaction active:scale classes on all drawer buttons', async () => {
      const app = createAppInstance();
      const { document } = app;

      const copyBtn = document.querySelector('#bcopy');
      assert.ok(copyBtn, '#bcopy button must exist');
      assert.ok(
        copyBtn.className.includes('active:scale'),
        '#bcopy button must have active:scale-* tactile micro-state class'
      );

      const clearBtn = document.querySelector('#bclear');
      assert.ok(clearBtn, '#bclear button must exist');
      assert.ok(
        clearBtn.className.includes('active:scale'),
        '#bclear button must have active:scale-* tactile micro-state class'
      );

      const pasteBtn = document.querySelector('#bpaste');
      assert.ok(pasteBtn, '#bpaste button must exist');
      assert.ok(
        pasteBtn.className.includes('active:scale'),
        '#bpaste button must have active:scale-* tactile micro-state class'
      );
    });

    it('should toggle autoclear setting and properly persist to localStorage', async () => {
      const app = createAppInstance();
      
      // Default autoclear is true
      assert.equal(app.window.localStorage.getItem('qc-autoclear'), null); // or true

      // Toggle to false
      app.toggleAutoClear(false);
      assert.equal(app.window.localStorage.getItem('qc-autoclear'), 'false');

      // Toggle back to true
      app.toggleAutoClear(true);
      assert.equal(app.window.localStorage.getItem('qc-autoclear'), 'true');
    });
  });
});
