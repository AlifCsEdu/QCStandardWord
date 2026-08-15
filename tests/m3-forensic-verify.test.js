import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone M3 Deep Forensic & Adversarial Stress Tests', () => {

  describe('1. Segmented Delimiter Control & Select Sync', () => {
    it('should two-way synchronize segmented delimiter button clicks and select element', async () => {
      const app = createAppInstance();
      const { document } = app;

      const delimiterKeys = [
        { key: 'nl', title: 'Newline' },
        { key: 'comma', title: 'Comma' },
        { key: 'semi', title: 'Semicolon' },
        { key: 'space', title: 'Space' },
        { key: 'pipe', title: 'Pipe' },
        { key: 'bullet', title: 'Bullet' },
      ];

      const selectEl = document.querySelector('#joinSel');
      assert.ok(selectEl, '#joinSel element must exist');
      assert.equal(selectEl.getAttribute('name'), 'delimiter');
      assert.equal(selectEl.getAttribute('data-testid'), 'delimiter-select');

      for (const delim of delimiterKeys) {
        // 1. Find the button for this delimiter
        const buttons = Array.from(document.querySelectorAll('#batchDrawer button[type="button"]'));
        const targetBtn = buttons.find((b) => b.getAttribute('title')?.includes(delim.title));
        assert.ok(targetBtn, `Segmented button for ${delim.title} must exist`);

        // 2. Click button
        targetBtn.click();
        await waitAsync(10);

        // 3. Verify select element value updated
        assert.equal(selectEl.value, delim.key, `Select value should be ${delim.key} after clicking button`);

        // 4. Verify target button has active classes
        assert.ok(targetBtn.className.includes('bg-stone-800'), `${delim.title} button should have active bg class`);
      }

      // 5. Test reverse sync: setting select element updates buttons
      for (const delim of delimiterKeys) {
        app.setDelimiter(delim.key);
        await waitAsync(10);

        const buttons = Array.from(document.querySelectorAll('#batchDrawer button[type="button"]'));
        const targetBtn = buttons.find((b) => b.getAttribute('title')?.includes(delim.title));
        assert.ok(targetBtn.className.includes('bg-stone-800'), `${delim.title} button should be active when select is set to ${delim.key}`);
      }
    });
  });

  describe('2. Batch Item Reordering & Action Button Micro-States', () => {
    it('should reorder items with full boundary protection and maintain tactile micro-classes', async () => {
      const app = createAppInstance();
      const { document } = app;

      // Add 4 items
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.clickItemAction(2, 'add');
      await app.clickItemAction(3, 'add');

      assert.equal(app.getBatchCount(), 4);

      const itemsBefore = app.getBatchItems();
      const t0 = itemsBefore[0].text;
      const t1 = itemsBefore[1].text;
      const t2 = itemsBefore[2].text;
      const t3 = itemsBefore[3].text;

      // Check first item buttons
      const firstRow = itemsBefore[0].element;
      const upBtn0 = firstRow.querySelector('.bup');
      const downBtn0 = firstRow.querySelector('.bdn');
      assert.ok(upBtn0.disabled, 'First item Move Up button must be disabled');
      assert.equal(downBtn0.disabled, false, 'First item Move Down button must NOT be disabled');

      // Check last item buttons
      const lastRow = itemsBefore[3].element;
      const upBtn3 = lastRow.querySelector('.bup');
      const downBtn3 = lastRow.querySelector('.bdn');
      assert.equal(upBtn3.disabled, false, 'Last item Move Up button must NOT be disabled');
      assert.ok(downBtn3.disabled, 'Last item Move Down button must be disabled');

      // Move item 1 down -> order should be t0, t2, t1, t3
      app.moveBatchItemDown(1);
      await waitAsync(10);
      let reordered = app.getBatchItems();
      assert.equal(reordered[0].text, t0);
      assert.equal(reordered[1].text, t2);
      assert.equal(reordered[2].text, t1);
      assert.equal(reordered[3].text, t3);

      // Move item 2 up -> order should be t0, t1, t2, t3
      app.moveBatchItemUp(2);
      await waitAsync(10);
      reordered = app.getBatchItems();
      assert.equal(reordered[0].text, t0);
      assert.equal(reordered[1].text, t1);
      assert.equal(reordered[2].text, t2);
      assert.equal(reordered[3].text, t3);
    });

    it('should support single item copy within batch queue with inline feedback', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'add');

      const items = app.getBatchItems();
      const firstItem = items[0];
      const copyBtn = firstItem.element.querySelector('.bcopy-item, [data-bc="0"]');
      assert.ok(copyBtn, 'Single item copy button should exist in batch row');

      copyBtn.click();
      await waitAsync(20);

      assert.equal(app.getCopiedText(), firstItem.text);
      assert.ok(copyBtn.textContent.includes('Copied') || copyBtn.textContent.includes('Copy'));
    });
  });

  describe('3. Delimiter Formatting Verification', () => {
    it('should format delimiters accurately for newline, comma, semicolon, space, pipe, bullet', async () => {
      const app = createAppInstance();
      app.toggleAutoClear(false);

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      const items = app.getBatchItems();
      const a = items[0].text;
      const b = items[1].text;

      // Newline
      app.setDelimiter('nl');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${a}\n${b}`);

      // Comma
      app.setDelimiter('comma');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${a}, ${b}`);

      // Semicolon
      app.setDelimiter('semi');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${a}; ${b}`);

      // Space
      app.setDelimiter('space');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${a} ${b}`);

      // Pipe
      app.setDelimiter('pipe');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${a} | ${b}`);

      // Bullet
      app.setDelimiter('bullet');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${a} • ${b}`);
    });
  });

  describe('4. Autoclear Setting Verification', () => {
    it('should clear queue on copy when autoclear is true, and preserve queue when autoclear is false', async () => {
      const app = createAppInstance();
      
      // Case 1: autoclear = false
      app.toggleAutoClear(false);
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      assert.equal(app.getBatchCount(), 2);
      await app.copyBatch();
      assert.equal(app.getBatchCount(), 2, 'Batch queue should be preserved when autoclear is false');

      // Case 2: autoclear = true
      app.toggleAutoClear(true);
      await app.copyBatch();
      assert.equal(app.getBatchCount(), 0, 'Batch queue should be cleared when autoclear is true');
    });
  });

  describe('5. Toasts Container & Action Handlers', () => {
    it('should handle toast dismiss on click and action triggers', async () => {
      const app = createAppInstance();
      const { document } = app;

      // Click card to trigger copy toast
      await app.clickItemRow(0);
      let toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Should have at least 1 toast');

      // Click toast to dismiss
      const toastEl = document.querySelector('#toasts .toast');
      assert.ok(toastEl, 'Toast element must exist');
      toastEl.click();
      await waitAsync(30);

      // Verify removed
      const remainingToasts = document.querySelectorAll('#toasts .toast');
      assert.equal(remainingToasts.length, 0, 'Toast should be removed after clicking');
    });
  });
});
