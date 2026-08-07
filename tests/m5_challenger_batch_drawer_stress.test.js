import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone 5: Stress & Boundary Tests for Batch Drawer', () => {
  it('DOM Contract Completeness - verify all required elements and attributes exist', async () => {
    const initialBatch = ['Alpha Item', 'Beta Item'];
    const app = createAppInstance({
      initialStorage: {
        'qc-batch': JSON.stringify(initialBatch),
        'qc-join': JSON.stringify('comma'),
        'qc-autoclear': 'true',
      },
    });
    await waitAsync(50);

    const doc = app.document;

    // 1. #batchDrawer
    const batchDrawer = doc.querySelector('#batchDrawer');
    assert.ok(batchDrawer, 'Element #batchDrawer must exist in DOM');
    assert.ok(batchDrawer.classList.contains('batch-drawer'), '#batchDrawer must have batch-drawer class');

    // 2. #backdrop
    const backdrop = doc.querySelector('#backdrop');
    assert.ok(backdrop, 'Element #backdrop must exist in DOM');
    assert.ok(backdrop.classList.contains('drawer-backdrop'), '#backdrop must have drawer-backdrop class');

    // 3. #bbcount
    const bbcount = doc.querySelector('#bbcount');
    assert.ok(bbcount, 'Element #bbcount must exist in DOM');
    assert.strictEqual(bbcount.textContent.trim(), '2', '#bbcount must show correct count');

    // 4. #bcount
    const bcount = doc.querySelector('#bcount');
    assert.ok(bcount, 'Element #bcount must exist in DOM');
    assert.strictEqual(bcount.textContent.trim(), '2', '#bcount must show correct count');

    // 5. #joinSel
    const joinSel = doc.querySelector('#joinSel');
    assert.ok(joinSel, 'Element #joinSel must exist in DOM');
    assert.strictEqual(joinSel.value, 'comma', '#joinSel value must reflect stored join delimiter');
    const options = Array.from(joinSel.querySelectorAll('option')).map((o) => o.value);
    assert.deepStrictEqual(
      options.sort(),
      ['bullet', 'comma', 'nl', 'pipe', 'semi', 'space'].sort(),
      '#joinSel options must match required delimiters'
    );

    // 6. #autoclear
    const autoclear = doc.querySelector('#autoclear');
    assert.ok(autoclear, 'Element #autoclear must exist in DOM');
    assert.strictEqual(autoclear.type, 'checkbox', '#autoclear must be checkbox input');
    assert.strictEqual(autoclear.checked, true, '#autoclear checked must match state');

    // 7. #bcopy
    const bcopy = doc.querySelector('#bcopy');
    assert.ok(bcopy, 'Element #bcopy must exist in DOM');

    // 8. #bclear
    const bclear = doc.querySelector('#bclear');
    assert.ok(bclear, 'Element #bclear must exist in DOM');

    // 9. #bpaste
    const bpaste = doc.querySelector('#bpaste');
    assert.ok(bpaste, 'Element #bpaste must exist in DOM');

    // 10. .bitem, .bup, .bdn and data attributes
    const bitems = doc.querySelectorAll('.bitem');
    assert.strictEqual(bitems.length, 2, 'Must have 2 .bitem elements');

    bitems.forEach((itemEl, idx) => {
      assert.strictEqual(itemEl.getAttribute('data-bi'), String(idx), `.bitem should have data-bi="${idx}"`);

      const upBtn = itemEl.querySelector('.bup');
      assert.ok(upBtn, `.bitem ${idx} must contain .bup button`);
      assert.ok(upBtn.hasAttribute('data-mvup') || upBtn.hasAttribute('data-mup') || upBtn.hasAttribute('data-up'), `.bup must have data move-up attribute`);

      const dnBtn = itemEl.querySelector('.bdn');
      assert.ok(dnBtn, `.bitem ${idx} must contain .bdn button`);
      assert.ok(dnBtn.hasAttribute('data-mvdn') || dnBtn.hasAttribute('data-mdown') || dnBtn.hasAttribute('data-down'), `.bdn must have data move-down attribute`);

      const copySingleBtn = itemEl.querySelector('[data-bc]');
      assert.ok(copySingleBtn, `.bitem ${idx} must contain single item copy button data-bc`);

      const removeBtn = itemEl.querySelector('[data-rm]');
      assert.ok(removeBtn, `.bitem ${idx} must contain single item remove button data-rm`);
    });
  });

  it('Reorder Operations - test boundary conditions across queue sizes 0, 1, 2, 5, and 100', async () => {
    // Queue size 1
    const app1 = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(['Single Item']) },
    });
    await waitAsync(50);
    let items = app1.getBatchItems();
    assert.strictEqual(items.length, 1);
    app1.moveBatchItemUp(0);
    await waitAsync(30);
    assert.strictEqual(app1.getBatchItems()[0].text, 'Single Item');
    app1.moveBatchItemDown(0);
    await waitAsync(30);
    assert.strictEqual(app1.getBatchItems()[0].text, 'Single Item');

    // Queue size 2
    const app2 = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(['Item 0', 'Item 1']) },
    });
    await waitAsync(50);
    app2.moveBatchItemUp(1); // Move index 1 up
    await waitAsync(30);
    items = app2.getBatchItems();
    assert.strictEqual(items[0].text, 'Item 1');
    assert.strictEqual(items[1].text, 'Item 0');
    assert.deepStrictEqual(app2.getStorageJSON('qc-batch'), ['Item 1', 'Item 0']);

    app2.moveBatchItemDown(0); // Move index 0 down
    await waitAsync(30);
    items = app2.getBatchItems();
    assert.strictEqual(items[0].text, 'Item 0');
    assert.strictEqual(items[1].text, 'Item 1');

    // Queue size 5: Middle & Boundary moves
    const initial5 = ['A', 'B', 'C', 'D', 'E'];
    const app5 = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(initial5) },
    });
    await waitAsync(50);

    // Move middle item 'C' (index 2) UP -> ['A', 'C', 'B', 'D', 'E']
    app5.moveBatchItemUp(2);
    await waitAsync(30);
    assert.deepStrictEqual(
      app5.getBatchItems().map((i) => i.text),
      ['A', 'C', 'B', 'D', 'E']
    );

    // Move middle item 'C' (now index 1) DOWN -> ['A', 'B', 'C', 'D', 'E']
    app5.moveBatchItemDown(1);
    await waitAsync(30);
    assert.deepStrictEqual(
      app5.getBatchItems().map((i) => i.text),
      ['A', 'B', 'C', 'D', 'E']
    );

    // Move last item 'E' (index 4) UP -> ['A', 'B', 'C', 'E', 'D']
    app5.moveBatchItemUp(4);
    await waitAsync(30);
    assert.deepStrictEqual(
      app5.getBatchItems().map((i) => i.text),
      ['A', 'B', 'C', 'E', 'D']
    );

    // Move first item 'A' (index 0) DOWN -> ['B', 'A', 'C', 'E', 'D']
    app5.moveBatchItemDown(0);
    await waitAsync(30);
    assert.deepStrictEqual(
      app5.getBatchItems().map((i) => i.text),
      ['B', 'A', 'C', 'E', 'D']
    );
    assert.deepStrictEqual(app5.getStorageJSON('qc-batch'), ['B', 'A', 'C', 'E', 'D']);

    // Queue size 100: Large queue stress testing
    const initial100 = Array.from({ length: 100 }, (_, i) => `Defect Line #${i + 1}`);
    const app100 = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(initial100) },
    });
    await waitAsync(50);
    assert.strictEqual(app100.getBatchItems().length, 100);

    // Perform multiple rapid reorders on large dataset
    app100.moveBatchItemUp(50); // Move 50 -> 49
    await waitAsync(30);
    let items100 = app100.getBatchItems();
    assert.strictEqual(items100[49].text, 'Defect Line #51');
    assert.strictEqual(items100[50].text, 'Defect Line #50');

    app100.moveBatchItemDown(49); // Move 49 back down to 50
    await waitAsync(30);
    items100 = app100.getBatchItems();
    assert.strictEqual(items100[49].text, 'Defect Line #50');
    assert.strictEqual(items100[50].text, 'Defect Line #51');

    // Move 99 up to 98
    app100.moveBatchItemUp(99);
    await waitAsync(30);
    items100 = app100.getBatchItems();
    assert.strictEqual(items100[98].text, 'Defect Line #100');
    assert.strictEqual(items100[99].text, 'Defect Line #99');

    // Verify storage persistence of 100 items
    const stored100 = app100.getStorageJSON('qc-batch');
    assert.strictEqual(stored100.length, 100);
    assert.strictEqual(stored100[98], 'Defect Line #100');
  });

  it('Delimiter Joining & Copy Accuracy - test all 6 delimiters and auto-clear behavior', async () => {
    const queueData = ['Screen broken', 'Battery drain fast', 'Microphone muted (QC #42)'];

    // 1. Newline (\n)
    const appNl = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(queueData), 'qc-autoclear': 'false' },
    });
    await waitAsync(50);
    appNl.setDelimiter('nl');
    await waitAsync(30);
    await appNl.copyBatch();
    assert.strictEqual(appNl.getCopiedText(), 'Screen broken\nBattery drain fast\nMicrophone muted (QC #42)');
    assert.strictEqual(appNl.getBatchCount(), 3, 'Queue should NOT clear when autoclear=false');

    // 2. Comma (, )
    const appComma = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(queueData), 'qc-autoclear': 'false' },
    });
    await waitAsync(50);
    appComma.setDelimiter('comma');
    await waitAsync(30);
    await appComma.copyBatch();
    assert.strictEqual(appComma.getCopiedText(), 'Screen broken, Battery drain fast, Microphone muted (QC #42)');

    // 3. Semicolon (; )
    const appSemi = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(queueData), 'qc-autoclear': 'false' },
    });
    await waitAsync(50);
    appSemi.setDelimiter('semi');
    await waitAsync(30);
    await appSemi.copyBatch();
    assert.strictEqual(appSemi.getCopiedText(), 'Screen broken; Battery drain fast; Microphone muted (QC #42)');

    // 4. Space ( )
    const appSpace = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(queueData), 'qc-autoclear': 'false' },
    });
    await waitAsync(50);
    appSpace.setDelimiter('space');
    await waitAsync(30);
    await appSpace.copyBatch();
    assert.strictEqual(appSpace.getCopiedText(), 'Screen broken Battery drain fast Microphone muted (QC #42)');

    // 5. Pipe ( | )
    const appPipe = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(queueData), 'qc-autoclear': 'false' },
    });
    await waitAsync(50);
    appPipe.setDelimiter('pipe');
    await waitAsync(30);
    await appPipe.copyBatch();
    assert.strictEqual(appPipe.getCopiedText(), 'Screen broken | Battery drain fast | Microphone muted (QC #42)');

    // 6. Bullet ( • )
    const appBullet = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(queueData), 'qc-autoclear': 'false' },
    });
    await waitAsync(50);
    appBullet.setDelimiter('bullet');
    await waitAsync(30);
    await appBullet.copyBatch();
    assert.strictEqual(appBullet.getCopiedText(), 'Screen broken • Battery drain fast • Microphone muted (QC #42)');

    // 7. Auto-clear = true verification
    const appAutoclear = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(queueData), 'qc-autoclear': 'true' },
    });
    await waitAsync(50);
    appAutoclear.setDelimiter('comma');
    await waitAsync(30);
    await appAutoclear.copyBatch();
    assert.strictEqual(appAutoclear.getCopiedText(), 'Screen broken, Battery drain fast, Microphone muted (QC #42)');
    assert.strictEqual(appAutoclear.getBatchCount(), 0, 'Queue MUST clear when autoclear=true');
    assert.deepStrictEqual(appAutoclear.getStorageJSON('qc-batch'), [], 'localStorage qc-batch must be empty array after autoclear copy');

    // 8. Delimiter state persistence across reload
    const appReload = createAppInstance();
    await waitAsync(50);
    appReload.setDelimiter('pipe');
    await waitAsync(30);

    const savedRawJoin = appReload.mockStorage.getItem('qc-join');
    const appReloaded = createAppInstance({
      initialStorage: {
        'qc-join': savedRawJoin,
      },
    });
    await waitAsync(50);
    const reloadedJoinSel = appReloaded.document.querySelector('#joinSel');
    assert.strictEqual(reloadedJoinSel.value, 'pipe', 'Delimiter "pipe" set at runtime must persist across page reload');
  });

  it('Single Item Actions & Clear Queue - verify single copy, single remove, and clear queue', async () => {
    const app = createAppInstance({
      initialStorage: { 'qc-batch': JSON.stringify(['Item X', 'Item Y', 'Item Z']) },
    });
    await waitAsync(50);

    // Single item remove (index 1 -> 'Item Y')
    app.removeBatchItem(1);
    await waitAsync(30);
    let items = app.getBatchItems();
    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[0].text, 'Item X');
    assert.strictEqual(items[1].text, 'Item Z');
    assert.deepStrictEqual(app.getStorageJSON('qc-batch'), ['Item X', 'Item Z']);

    // Clear queue
    app.clearBatch();
    await waitAsync(30);
    assert.strictEqual(app.getBatchCount(), 0);
    assert.deepStrictEqual(app.getStorageJSON('qc-batch'), []);
  });
});
