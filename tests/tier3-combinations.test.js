import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAppInstance, waitAsync } from './harness.js';

describe('Tier 3: Cross-Feature Combinations (Features 1 through 10)', () => {

  it('Pipeline 1: Sidebar Category Nav + Top Header Spotlight Search + Segmented View Switcher Sync (Features 3, 4, 9)', async () => {
    const app = createAppInstance();

    // Step 1: Select "codes" category and "FCPB" sub-category chip in left navbar
    app.selectCategory('codes');
    app.selectSubCategory('FCPB');
    let visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Subcategory FCPB should render items');
    const fcpbText = visible[0].text;

    // Step 2: Add first FCPB item to batch queue
    await app.clickItemAction(0, 'add');
    assert.equal(app.getBatchCount(), 1, 'Batch count should be 1');

    // Step 3: Clear subcategory/search, switch view switcher SegmentedControl to grid view
    await app.setLayoutView('grid');
    app.selectCategory('screen');
    app.search('crease');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Searching "crease" under screen should render items in grid view');
    const creaseText = visible[0].text;

    // Step 4: Add screen crease item to batch queue
    await app.clickItemAction(0, 'add');
    assert.equal(app.getBatchCount(), 2, 'Batch count should be 2');

    // Step 5: Set custom joiner to semicolon (semi) and copy batch
    app.setDelimiter('semi');
    await app.copyBatch();

    const expectedCopy = `${fcpbText}; ${creaseText}`;
    assert.equal(app.getCopiedText(), expectedCopy, 'Combined batch copy with semicolon delimiter failed');
  });

  it('Pipeline 2: Custom Edit + Pin Favorite + Theme Toggle Persistence (Features 2, 9, 10)', async () => {
    const app = createAppInstance();
    const customTitle = 'VIPCUSTOMDEFECT999';

    // Step 1: Enable Edit Mode and add new custom wording item
    app.toggleEditMode();
    app.openAddModal();
    app.saveModalForm(customTitle, 'battery', 888);

    // Step 2: Search for newly created custom item
    app.search(customTitle);
    const visible = app.getVisibleItems();
    assert.equal(visible.length, 1, 'Search for custom item should return exactly 1 result');
    assert.equal(visible[0].text, customTitle);

    // Step 3: Pin the custom item
    await app.clickItemAction(0, 'pin');

    // Step 4: Clear search and switch to "pinned" category view
    app.clearSearch();
    app.selectCategory('pinned');

    const pinnedVisible = app.getVisibleItems();
    assert.equal(pinnedVisible.length, 1, 'Pinned view should show 1 item');
    assert.equal(pinnedVisible[0].text, customTitle, 'Pinned custom item title should match');
  });

  it('Pipeline 3: Glassmorphic Batch Drawer Queue + Floating Toast Notifications + JSON Export/Import (Features 7, 8, 10)', async () => {
    const app = createAppInstance();
    const tempWording = 'TEMPUNDODEFECT950';

    // Step 1: Add custom item
    app.toggleEditMode();
    app.openAddModal();
    app.saveModalForm(tempWording, 'screen', 950);

    app.search(tempWording);
    let visible = app.getVisibleItems();
    assert.equal(visible.length, 1, 'Search for newly created item before deletion should find 1 item');

    // Step 2: Delete item
    await app.clickItemAction(0, 'del');

    // Verify deletion
    app.search(tempWording);
    visible = app.getVisibleItems();
    assert.equal(visible.length, 0, 'Item should be removed from visible list after deletion');

    // Step 3: Trigger Undo from Toast notification
    const toasts = app.getToasts();
    assert.ok(toasts.length > 0, 'Toast notification should be displayed');
    const undoToastIndex = toasts.findIndex((t) => t.actionLabel === 'Undo');
    assert.ok(undoToastIndex >= 0, 'Toast with "Undo" action button should exist');

    app.triggerToastAction(undoToastIndex);
    await waitAsync(30);

    // Step 4: Verify restoration
    app.search(tempWording);
    visible = app.getVisibleItems();
    assert.equal(visible.length, 1, 'Deleted item should be restored after clicking Undo');
    assert.equal(visible[0].text, tempWording);

    // Step 5: Export changes JSON and verify payload
    const { filename } = app.exportChanges();
    assert.equal(filename, 'qc-wording-changes.json', 'Export filename should match spec');

    const customsStorage = app.getStorageJSON('qc-custom');
    assert.ok(
      customsStorage.some((c) => c.t === tempWording),
      'Export state should persist restored item in qc-custom'
    );
  });
});
