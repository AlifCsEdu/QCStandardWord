import assert from 'node:assert';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';

describe('Tier 1: Feature Coverage', () => {
  describe('1. Dataset & Category Coverage', () => {
    it('should initialize with full QC defect dataset (139+ items) under "All Categories"', () => {
      const app = createAppInstance();
      const visible = app.getVisibleItems();
      assert.ok(visible.length >= 139, `Expected >= 139 items, got ${visible.length}`);
    });

    it('should correctly filter defect items for all 13 standard categories', () => {
      const app = createAppInstance();
      const categories = [
        'codes', 'screen', 'camera', 'buttons', 'battery',
        'backcover', 'locks', 'pen', 'water', 'audio', 'body', 'system'
      ];

      for (const cat of categories) {
        app.selectCategory(cat);
        const visible = app.getVisibleItems();
        assert.ok(visible.length > 0, `Category ${cat} returned 0 items`);
        for (const item of visible) {
          if (cat !== 'codes') {
            assert.equal(item.categoryPill.toLowerCase(), cat, `Item ${item.id} category mismatch`);
          }
        }
      }
    });

    it('should initialize virtual categories ("pinned", "recent") correctly when empty', () => {
      const app = createAppInstance();
      
      app.selectCategory('pinned');
      let visible = app.getVisibleItems();
      assert.equal(visible.length, 0, 'Pinned category should be empty initially');

      app.selectCategory('recent');
      visible = app.getVisibleItems();
      assert.equal(visible.length, 0, 'Recent category should be empty initially');
    });
  });

  describe('2. Fuzzy Search Engine & Alias Expansion', () => {
    it('should perform exact and prefix substring search matching', () => {
      const app = createAppInstance();

      app.search('battery');
      let visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Search for "battery" returned 0 items');
      assert.ok(visible.every((i) => i.text.toLowerCase().includes('battery') || i.categoryPill.toLowerCase() === 'battery'));

      app.search('crease');
      visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Search for "crease" returned 0 items');
    });

    it('should expand search aliases for common terminology ("display" -> screen, "spen" -> pen)', () => {
      const app = createAppInstance();

      app.search('display');
      let visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Search for alias "display" returned 0 items');
      assert.ok(visible.some((i) => i.categoryPill.toLowerCase() === 'screen' || i.text.toLowerCase().includes('screen')));

      app.search('spen');
      visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Search for alias "spen" returned 0 items');
      assert.ok(visible.some((i) => i.categoryPill.toLowerCase() === 'pen' || i.text.toLowerCase().includes('pen')));
    });

    it('should highlight search query terms in visible results', () => {
      const app = createAppInstance();

      app.search('camera');
      const { document } = app;
      const marks = document.querySelectorAll('#listwrap mark');
      assert.ok(marks.length > 0, 'Search results should contain <mark> tags for query term');
    });
  });

  describe('3. Sub-Category Chip Filtering', () => {
    it('should render panel code sub-category chips only when "codes" category is active', () => {
      const app = createAppInstance();
      const { document } = app;

      app.selectCategory('screen');
      let subchips = document.querySelector('#subchips');
      assert.ok(!subchips.classList.contains('show'), 'Subchips should be hidden for "screen" category');

      app.selectCategory('codes');
      subchips = document.querySelector('#subchips');
      assert.ok(subchips.classList.contains('show'), 'Subchips should be visible for "codes" category');
    });

    it('should filter code items when sub-category chips are clicked (e.g. FCPB, FCPW)', () => {
      const app = createAppInstance();

      app.selectCategory('codes');
      const initialCount = app.getVisibleItems().length;

      app.selectSubCategory('FCPB');
      const fcpbItems = app.getVisibleItems();
      assert.ok(fcpbItems.length > 0 && fcpbItems.length < initialCount, 'Subcategory FCPB filtering failed');
      assert.ok(fcpbItems.every((i) => i.text.startsWith('FCPB') || i.text.toLowerCase().includes('fcpb')));
    });
  });

  describe('4. View Mode Layout Transitions', () => {
    it('should toggle layout modes between list, grid, and table', () => {
      const app = createAppInstance();
      const { document } = app;

      app.setLayoutView('grid');
      let listwrap = document.querySelector('#listwrap');
      assert.ok(listwrap.classList.contains('grid'), 'Layout container should have "grid" class');

      app.setLayoutView('table');
      listwrap = document.querySelector('#listwrap');
      assert.ok(listwrap.classList.contains('table'), 'Layout container should have "table" class');

      app.setLayoutView('list');
      listwrap = document.querySelector('#listwrap');
      assert.ok(listwrap.classList.contains('list'), 'Layout container should have "list" class');
    });
  });

  describe('5. Batch Queue & Custom Delimiters', () => {
    it('should add items to batch queue and update batch counter', async () => {
      const app = createAppInstance();

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      assert.equal(app.getBatchCount(), 2, 'Batch count should be 2 after adding 2 items');
      const batchItems = app.getBatchItems();
      assert.equal(batchItems.length, 2, 'Batch list should render 2 queued items');
    });

    it('should join batch items with custom delimiters (newline, comma, semicolon, space)', async () => {
      const app = createAppInstance();
      const visible = app.getVisibleItems();
      const text1 = visible[0].text;
      const text2 = visible[1].text;

      app.toggleAutoClear(false);

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      // 1. Newline (nl)
      app.setDelimiter('nl');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text1}\n${text2}`, 'Newline delimiter formatting failed');

      // 2. Comma (comma)
      app.setDelimiter('comma');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text1}, ${text2}`, 'Comma delimiter formatting failed');

      // 3. Semicolon (semi)
      app.setDelimiter('semi');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text1}; ${text2}`, 'Semicolon delimiter formatting failed');

      // 4. Space (space)
      app.setDelimiter('space');
      await app.copyBatch();
      assert.equal(app.getCopiedText(), `${text1} ${text2}`, 'Space delimiter formatting failed');
    });

    it('should respect autoclear setting when copying batch queue', async () => {
      const app = createAppInstance();

      await app.clickItemAction(0, 'add');
      app.toggleAutoClear(false);
      await app.copyBatch();
      assert.strictEqual(app.getBatchCount(), 1, 'Batch queue should be retained when autoclear is false');
    });

    it('should allow removing individual batch items and clearing entire queue', async () => {
      const app = createAppInstance();

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      assert.equal(app.getBatchCount(), 2);

      app.removeBatchItem(0);
      assert.equal(app.getBatchCount(), 1, 'Batch count should decrease to 1 after removing single item');

      app.clearBatch();
      assert.equal(app.getBatchCount(), 0, 'Batch count should be 0 after clearBatch()');
    });
  });

  describe('6. Copy & History Feed', () => {
    it('should copy single item text and record in recent history', async () => {
      const app = createAppInstance();
      const visible = app.getVisibleItems();
      const targetText = visible[0].text;

      await app.clickItemRow(0);
      assert.equal(app.getCopiedText(), targetText, 'Clipboard should match clicked item text');

      const recentItems = app.getRecentHistoryItems();
      assert.ok(recentItems.some((r) => r.text === targetText), 'Recent history feed should include copied item text');
    });

    it('should allow re-copying items directly from recent history feed', async () => {
      const app = createAppInstance();
      const visible = app.getVisibleItems();
      const text1 = visible[0].text;
      const text2 = visible[1].text;

      await app.clickItemRow(0);
      await app.clickItemRow(1);

      const recentItems = app.getRecentHistoryItems();
      assert.ok(recentItems.length >= 2, 'Recent history should contain 2 items');

      app.resetCopiedText();
      await app.clickRecentHistoryChip(1);
      assert.ok(app.getCopiedText() !== null, 'Clicking recent history chip should copy text');
    });
  });

  describe('7. Favorites / Pinning System', () => {
    it('should pin an item, persist to localStorage, and display in Pinned view', async () => {
      const app = createAppInstance();
      const visible = app.getVisibleItems();
      const pinnedItemId = visible[0].id;

      await app.clickItemAction(0, 'pin');

      const pinsStorage = app.getStorageJSON('qc-pins');
      assert.ok(pinsStorage && pinsStorage.includes(pinnedItemId), 'Pinned item ID should be saved to localStorage (qc-pins)');

      app.selectCategory('pinned');
      const pinnedVisible = app.getVisibleItems();
      assert.equal(pinnedVisible.length, 1, 'Pinned view should show 1 pinned item');
    });
  });

  describe('8. Edit Mode & Storage Persistence', () => {
    it('should add custom wording entry and save to localStorage (qc-custom)', () => {
      const app = createAppInstance();
      const uniqueWording = `Custom Test Defect ${Date.now()}`;

      app.toggleEditMode();
      assert.ok(app.isEditModeActive(), 'Edit mode should be active after toggleEditMode()');

      app.openAddModal();
      app.saveModalForm(uniqueWording, 'screen', 999);

      const customsStorage = app.getStorageJSON('qc-custom');
      assert.ok(Array.isArray(customsStorage), 'qc-custom in storage should be an array');
      assert.ok(customsStorage.some((c) => c.t === uniqueWording), 'New custom wording should exist in qc-custom storage');
    });
  });
});
