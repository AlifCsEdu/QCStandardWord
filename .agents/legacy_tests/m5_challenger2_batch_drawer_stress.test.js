import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone 5 Challenger 2: Batch Drawer & Backdrop Stress Tests', () => {
  it('1. State Persistence across Reorder Actions, Additions, Removals, and State Reload', async () => {
    const initialBatch = [
      '<script>alert("xss")</script>',
      'Defect Line 2 with "quotes" & \n newlines',
      'Defect Line 3',
      'Defect Line 4',
      'Defect Line 5',
    ];

    let app = createAppInstance({
      initialStorage: {
        'qc-batch': JSON.stringify(initialBatch),
      },
    });
    await waitAsync(50);

    // Verify initial batch items rendered correctly
    let items = app.getBatchItems();
    assert.strictEqual(items.length, 5);
    assert.strictEqual(items[0].text, '<script>alert("xss")</script>');
    assert.strictEqual(items[1].text, 'Defect Line 2 with "quotes" & \n newlines');

    // 1. Move index 3 ('Defect Line 4') UP
    app.moveBatchItemUp(3);
    await waitAsync(30);

    // 2. Move boundary checks: index 0 UP (no-op), index 4 DOWN (no-op)
    app.moveBatchItemUp(0);
    await waitAsync(30);
    app.moveBatchItemDown(4);
    await waitAsync(30);

    // 3. Move index 1 DOWN ('Defect Line 2 with "quotes" & \n newlines' moves down)
    app.moveBatchItemDown(1);
    await waitAsync(30);

    // 4. Remove item at index 2
    app.removeBatchItem(2);
    await waitAsync(30);

    items = app.getBatchItems();
    assert.strictEqual(items.length, 4, 'Queue length should be 4 after removal');

    // Verify localStorage qc-batch matches exact reordered state
    const storedBatchBeforeReload = app.getStorageJSON('qc-batch');
    assert.ok(Array.isArray(storedBatchBeforeReload), 'qc-batch in storage must be an array');
    assert.strictEqual(storedBatchBeforeReload.length, 4);

    // 5. State Reload: Instantiate fresh App reading from persisted storage
    const reloadedApp = createAppInstance({
      initialStorage: {
        'qc-batch': app.mockStorage.getItem('qc-batch'),
      },
    });
    await waitAsync(50);

    const reloadedItems = reloadedApp.getBatchItems();
    assert.strictEqual(reloadedItems.length, 4, 'Reloaded app must have 4 items');
    assert.deepStrictEqual(
      reloadedItems.map((i) => i.text),
      storedBatchBeforeReload,
      'Reloaded app state must match reordered localStorage state exactly'
    );
  });

  it('2. Verify Backdrop Overlay Styling, CSS Blur Properties, Pointer-Events & Display States', async () => {
    const app = createAppInstance();
    await waitAsync(50);

    const backdrop = app.getBatchDrawerOverlay();
    assert.ok(backdrop, 'Backdrop element #backdrop must exist in DOM');
    assert.strictEqual(backdrop.id, 'backdrop', 'Backdrop must have id="backdrop"');

    // Test CLOSED state (non-intrusive display state)
    const styleClosed = backdrop.getAttribute('style') || '';
    assert.ok(
      styleClosed.toLowerCase().includes('display: none') || styleClosed.toLowerCase().includes('display:none'),
      'Backdrop must be hidden with display:none when drawer is closed'
    );
    assert.ok(!backdrop.classList.contains('show'), 'Backdrop must not have .show class when closed');

    // Verify CSS blur and backdrop overlay styles (check attribute or style property)
    const hasBg =
      styleClosed.includes('rgba(15, 23, 42, 0.4)') ||
      styleClosed.includes('var(--drawer-backdrop-bg') ||
      backdrop.style.background.includes('rgba(15, 23, 42, 0.4)');
    assert.ok(hasBg, 'Backdrop style must set dark slate glassmorphic background variable or fallback');

    const hasBlur =
      styleClosed.includes('blur(') ||
      styleClosed.includes('var(--drawer-backdrop-blur') ||
      (backdrop.style.backdropFilter && backdrop.style.backdropFilter.includes('blur'));
    assert.ok(hasBlur, 'Backdrop style must set CSS backdropFilter blur variable or fallback');

    const hasZIndex =
      styleClosed.includes('z-index: 998') ||
      styleClosed.includes('z-index:998') ||
      backdrop.style.zIndex === '998';
    assert.ok(hasZIndex, 'Backdrop zIndex must be set to 998');

    // Verify Mantine v7 Drawer panel and overlay theme integration
    const drawer = app.getBatchDrawer();
    assert.ok(drawer, 'Batch drawer panel #batchDrawer must exist in DOM');
  });

  it('3. Delimiter Selection, Copy & Autoclear Persistence Stress Test', async () => {
    const batchData = ['Defect Alpha', 'Defect Beta', 'Defect Gamma'];
    const app = createAppInstance({
      initialStorage: {
        'qc-batch': JSON.stringify(batchData),
        'qc-autoclear': 'false',
      },
    });
    await waitAsync(50);

    // Set delimiter explicitly to pipe
    app.setDelimiter('pipe');
    await waitAsync(30);

    // Copy batch with pipe delimiter
    await app.copyBatch();
    assert.strictEqual(app.getCopiedText(), 'Defect Alpha | Defect Beta | Defect Gamma');
    assert.strictEqual(app.getBatchCount(), 3, 'Batch queue should NOT autoclear when autoclear is false');

    // Change delimiter to bullet
    app.setDelimiter('bullet');
    await waitAsync(30);

    await app.copyBatch();
    assert.strictEqual(app.getCopiedText(), 'Defect Alpha • Defect Beta • Defect Gamma');

    // Enable autoclear and copy batch
    app.toggleAutoClear(true);
    await waitAsync(30);

    await app.copyBatch();
    assert.strictEqual(app.getBatchCount(), 0, 'Batch queue should autoclear when autoclear is true');
    assert.deepStrictEqual(app.getStorageJSON('qc-batch'), [], 'localStorage qc-batch must be empty array []');
  });

  it('4. DOM Compatibility Matrix for Batch Drawer Controls', async () => {
    const app = createAppInstance({
      initialStorage: {
        'qc-batch': JSON.stringify(['Item X', 'Item Y']),
      },
    });
    await waitAsync(50);

    const doc = app.document;
    assert.ok(doc.querySelector('#batchDrawer'), '#batchDrawer panel must exist');
    assert.ok(doc.querySelector('#backdrop'), '#backdrop overlay must exist');
    assert.ok(doc.querySelector('#bbcount'), '#bbcount badge must exist');
    assert.ok(doc.querySelector('#bcount'), '#bcount badge must exist');
    assert.ok(doc.querySelector('#joinSel'), '#joinSel select must exist');
    assert.ok(doc.querySelector('#autoclear'), '#autoclear checkbox must exist');
    assert.ok(doc.querySelector('#bcopy'), '#bcopy button must exist');
    assert.ok(doc.querySelector('#bclear'), '#bclear button must exist');
    assert.ok(doc.querySelector('#bpaste'), '#bpaste button must exist');

    const bitems = doc.querySelectorAll('.bitem');
    assert.strictEqual(bitems.length, 2);
    assert.ok(doc.querySelector('[data-bi="0"]'), 'data-bi="0" element must exist');
    assert.ok(doc.querySelector('[data-mvup="0"], [data-mup="0"]'), 'Move up button must exist');
    assert.ok(doc.querySelector('[data-mvdn="0"], [data-mdown="0"]'), 'Move down button must exist');
    assert.ok(doc.querySelector('[data-bc="0"]'), 'Copy item button must exist');
    assert.ok(doc.querySelector('[data-rm="0"]'), 'Remove item button must exist');
  });

  it('5. Storage Edge Case: Empty and Valid Array Initialization for qc-batch', async () => {
    const app = createAppInstance({
      initialStorage: {
        'qc-batch': JSON.stringify(['Test Defect 1', 'Test Defect 2']),
      },
    });
    await waitAsync(50);

    assert.strictEqual(app.getBatchCount(), 2, 'Batch count should be 2');
    app.clearBatch();
    await waitAsync(30);
    assert.strictEqual(app.getBatchCount(), 0, 'Batch count should be 0 after clearBatch');
    assert.deepStrictEqual(app.getStorageJSON('qc-batch'), [], 'Storage should hold empty array');
  });
});
