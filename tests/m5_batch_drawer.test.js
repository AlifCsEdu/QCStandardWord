import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone 5: Glassmorphic Non-Intrusive Batch Drawer Tests', () => {
  it('should render glassmorphic non-intrusive backdrop and drawer panel with correct DOM IDs', async () => {
    const app = createAppInstance();
    await waitAsync(50);

    const backdrop = app.getBatchDrawerOverlay();
    assert.ok(backdrop, 'Backdrop overlay element #backdrop should exist in DOM');
    assert.strictEqual(backdrop.id, 'backdrop', 'Backdrop element should have id="backdrop"');

    const backdropStyle = backdrop.getAttribute('style') || '';
    assert.ok(
      backdropStyle.includes('rgba(15, 23, 42, 0.4)') || backdropStyle.includes('var(--drawer-backdrop-bg') || backdrop.classList.contains('drawer-backdrop'),
      'Backdrop style/class should contain glassmorphic overlay color'
    );
    assert.ok(
      backdrop.classList.contains('drawer-backdrop') || backdropStyle.includes('blur(8px)') || backdropStyle.includes('var(--drawer-backdrop-blur'),
      'Backdrop style/class should include glassmorphic backdrop filter blur'
    );

    const drawer = app.getBatchDrawer();
    assert.ok(drawer, 'Batch drawer panel #batchDrawer should exist');
  });

  it('should support item reordering (moveBatchItemUp and moveBatchItemDown) and update localStorage', async () => {
    const initialBatch = ['Defect Item 1', 'Defect Item 2', 'Defect Item 3'];
    const app = createAppInstance({
      initialStorage: {
        'qc-batch': JSON.stringify(initialBatch),
      },
    });
    await waitAsync(50);

    let items = app.getBatchItems();
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0].text, 'Defect Item 1');
    assert.strictEqual(items[1].text, 'Defect Item 2');
    assert.strictEqual(items[2].text, 'Defect Item 3');

    // Move index 1 (Defect Item 2) UP
    app.moveBatchItemUp(1);
    await waitAsync(50);

    items = app.getBatchItems();
    assert.strictEqual(items[0].text, 'Defect Item 2', 'Defect Item 2 should move to index 0');
    assert.strictEqual(items[1].text, 'Defect Item 1', 'Defect Item 1 should move to index 1');

    // Verify localStorage update
    const storedBatch = app.getStorageJSON('qc-batch');
    assert.deepStrictEqual(storedBatch, ['Defect Item 2', 'Defect Item 1', 'Defect Item 3']);

    // Move index 0 (Defect Item 2) DOWN
    app.moveBatchItemDown(0);
    await waitAsync(50);

    items = app.getBatchItems();
    assert.strictEqual(items[0].text, 'Defect Item 1');
    assert.strictEqual(items[1].text, 'Defect Item 2');
  });

  it('should support pipe (|) and bullet (•) delimiters during copyBatch', async () => {
    const initialBatch = ['First Line', 'Second Line'];
    const app = createAppInstance({
      initialStorage: {
        'qc-batch': JSON.stringify(initialBatch),
        'qc-autoclear': 'false',
      },
    });
    await waitAsync(50);

    // Set delimiter to pipe
    app.setDelimiter('pipe');
    await waitAsync(30);

    await app.copyBatch();
    assert.strictEqual(app.getCopiedText(), 'First Line | Second Line');

    // Set delimiter to bullet
    app.setDelimiter('bullet');
    await waitAsync(30);

    await app.copyBatch();
    assert.strictEqual(app.getCopiedText(), 'First Line • Second Line');
  });

  it('should maintain full DOM element compatibility matrix', async () => {
    const app = createAppInstance({
      initialStorage: {
        'qc-batch': JSON.stringify(['Item A', 'Item B']),
      },
    });
    await waitAsync(50);

    const doc = app.document;
    assert.ok(doc.querySelector('#batchDrawer'), '#batchDrawer must exist');
    assert.ok(doc.querySelector('#backdrop'), '#backdrop must exist');
    assert.ok(doc.querySelector('#bbcount'), '#bbcount must exist');
    assert.ok(doc.querySelector('#bcount'), '#bcount must exist');
    assert.ok(doc.querySelector('#joinSel'), '#joinSel must exist');
    assert.ok(doc.querySelector('#autoclear'), '#autoclear must exist');
    assert.ok(doc.querySelector('#bcopy'), '#bcopy must exist');
    assert.ok(doc.querySelector('#bclear'), '#bclear must exist');
    assert.ok(doc.querySelector('#bpaste'), '#bpaste must exist');

    const bitems = doc.querySelectorAll('.bitem');
    assert.strictEqual(bitems.length, 2, 'There should be 2 .bitem elements');
    assert.ok(doc.querySelector('[data-bi="0"]'), 'data-bi="0" element must exist');
    assert.ok(doc.querySelector('[data-mvup="0"], [data-mup="0"]'), 'Move up button must exist');
    assert.ok(doc.querySelector('[data-mvdn="0"], [data-mdown="0"]'), 'Move down button must exist');
    assert.ok(doc.querySelector('[data-bc="0"]'), 'Single item copy button must exist');
    assert.ok(doc.querySelector('[data-rm="0"]'), 'Single item remove button must exist');
  });
});
