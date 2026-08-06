import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAppInstance, waitAsync } from './harness.js';

describe('Tier 4: Real-World Workload Scenarios', () => {

  it('Workload 1: Complete QC Mobile Technician Smartphone Inspection Workflow', async () => {
    const app = createAppInstance();

    // Step 1: Initial setup - set layout view to compact table
    app.setLayoutView('table');
    const { document } = app;
    assert.ok(document.querySelector('#listwrap').classList.contains('table'));

    // Step 2: Screen Defect Inspection (Direct copy with typo search)
    app.search('scren scratch');
    let visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Searching typo "scren scratch" should find screen defects');
    const screenDefectText = visible[0].text;

    await app.clickItemRow(0);
    assert.equal(app.getCopiedText(), screenDefectText, 'Copied text should match clicked screen defect');

    let recents = app.getRecentHistoryItems();
    assert.ok(recents.length > 0, 'Recents list should contain copied screen defect');
    assert.equal(recents[0].text, screenDefectText);

    // Step 3: Battery Defect Inspection (Add to batch)
    app.clearSearch();
    app.selectCategory('battery');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0);
    const batteryDefectText = visible[0].text;
    await app.clickItemAction(0, 'add');

    // Step 4: Camera Defect Inspection (Add to batch)
    app.selectCategory('camera');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0);
    const cameraDefectText = visible[0].text;
    await app.clickItemAction(0, 'add');

    // Step 5: Panel Code Inspection (Subcategory FCPB -> Add to batch)
    app.selectCategory('codes');
    app.selectSubCategory('FCPB');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0);
    const codeDefectText = visible[0].text;
    await app.clickItemAction(0, 'add');

    assert.equal(app.getBatchCount(), 3, 'Batch count should equal 3 defect items');

    // Step 6: Finalize report - format batch with newline delimiter and copy
    app.setDelimiter('nl');
    app.toggleAutoClear(true);
    await app.copyBatch();

    const expectedBatchOutput = `${batteryDefectText}\n${cameraDefectText}\n${codeDefectText}`;
    assert.equal(app.getCopiedText(), expectedBatchOutput, 'Formatted batch copy output mismatch');
    assert.equal(app.getBatchCount(), 0, 'Batch queue should be auto-cleared after copy');
  });

  it('Workload 2: QC Supervisor Custom Wording Audit & Model Sync Workflow', async () => {
    const app = createAppInstance();

    const customItems = [
      { text: 'FOLDABLEHINGEGAP01', cat: 'body', num: 901 },
      { text: 'AICHIPOVERHEAT02', cat: 'system', num: 902 },
      { text: 'UNDERDISPLAYCAMFOG03', cat: 'camera', num: 903 }
    ];

    // Step 1: Enable Edit mode and create 3 custom defects for new model
    app.toggleEditMode();
    assert.ok(app.isEditModeActive(), 'Edit mode should be active');

    for (const item of customItems) {
      app.openAddModal();
      app.saveModalForm(item.text, item.cat, item.num);
    }

    // Step 2: Verify custom items are saved in localStorage
    const customsStorage = app.getStorageJSON('qc-custom');
    assert.equal(customsStorage.length, 3, 'qc-custom in storage should contain 3 entries');

    // Step 3: Verify searchability of custom items
    for (const item of customItems) {
      app.search(item.text);
      const visible = app.getVisibleItems();
      assert.equal(visible.length, 1, `Custom item "${item.text}" should be found in search`);
      assert.equal(visible[0].text, item.text);
    }

    // Step 4: Export changes payload
    const { filename } = app.exportChanges();
    assert.equal(filename, 'qc-wording-changes.json');

    // Step 5: Reset all changes back to original canonical state
    app.resetAllChanges();
    await waitAsync(30);

    const resetCustoms = app.getStorageJSON('qc-custom');
    assert.equal(resetCustoms.length, 0, 'qc-custom should be empty after resetAllChanges');

    app.search('FOLDABLEHINGEGAP01');
    let visibleAfterReset = app.getVisibleItems();
    assert.equal(visibleAfterReset.length, 0, 'Custom items should no longer exist after reset');

    // Step 6: Import exported JSON payload to restore supervisor configuration
    const importPayload = {
      edits: {},
      dels: [],
      customs: customsStorage
    };

    const fileReaderMock = {
      result: JSON.stringify(importPayload),
      onload: null,
      readAsText() {
        if (this.onload) this.onload();
      }
    };

    // Simulate import file input change event
    const { document, window } = app;
    const fileInput = document.querySelector('#importFile');

    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'qc-wording-changes.json' }],
      writable: true
    });

    const origFileReader = window.FileReader;
    window.FileReader = function () {
      return fileReaderMock;
    };

    fileInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    window.FileReader = origFileReader;
    await waitAsync(30);

    // Step 7: Verify imported entries are fully restored and searchable
    for (const item of customItems) {
      app.search(item.text);
      const visible = app.getVisibleItems();
      assert.equal(visible.length, 1, `Imported custom item "${item.text}" should be restored and searchable`);
      assert.equal(visible[0].text, item.text);
    }
  });
});
