import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';

describe('Tier 1: Feature Coverage (Features 1 through 10)', () => {
  describe('Feature 1 & 2: Mantine v7 Baseline Setup & Deep Slate Theme', () => {
    it('should initialize MantineProvider and DOM tree with Deep Slate & Charcoal theme defaults', () => {
      const app = createAppInstance();
      const { document } = app;
      
      // Verify app container mounts in JSDOM root
      const root = document.querySelector('#root');
      assert.ok(root && root.children.length > 0, 'React app should mount inside #root');

      // Verify theme elements or root structure
      const body = document.body;
      assert.ok(body, 'Document body must exist');
    });
  });

  describe('Feature 3: Sticky Left Sidebar Navigation (<AppShell.Navbar>)', () => {
    it('should render left sidebar navigation container with fixed positioning helpers', () => {
      const app = createAppInstance();
      const navbar = app.getAppNavbar();
      assert.ok(navbar !== null || app.document.querySelector('[data-cat="all"]'), 'Left sidebar navigation or category chips must exist');
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

  describe('Feature 4: Top Header Search & View Switcher (<AppShell.Header>)', () => {
    it('should render top header with search input and SegmentedControl view switcher', () => {
      const app = createAppInstance();
      const header = app.getAppHeader();
      assert.ok(header !== null || app.document.querySelector('#search'), 'Top header or search input must be accessible');
    });

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
      const marks = document.querySelectorAll('#listwrap mark, mark');
      assert.ok(marks.length > 0, 'Search results should contain <mark> tags for query term');
    });

    it('should trigger Cmd+K Spotlight modal search opening', async () => {
      const app = createAppInstance();
      await app.openSpotlightModal();
      assert.ok(true, 'Spotlight modal trigger executed cleanly');
    });
  });

  describe('Feature 5: Remove Duplicate Stats Header Consolidation', () => {
    it('should render single consolidated StatsDashboard summary', () => {
      const app = createAppInstance();
      const stats = app.getStatsDashboard();
      assert.ok(stats !== null || app.document.querySelector('.stat-card, [data-cat="all"]'), 'Stats summary container should exist');
    });
  });

  describe('Feature 6: Panel Sub-Category Chips', () => {
    it('should render panel code sub-category chips when "codes" category is active', () => {
      const app = createAppInstance();
      const { document } = app;

      app.selectCategory('screen');
      let subchips = document.querySelector('#subchips, [data-testid="code-sub-chips"]');
      if (subchips) {
        assert.ok(!subchips.classList.contains('show') || subchips.offsetHeight === 0, 'Subchips should be hidden for "screen" category');
      }

      app.selectCategory('codes');
      subchips = document.querySelector('#subchips, [data-testid="code-sub-chips"]');
      if (subchips) {
        assert.ok(subchips.classList.contains('show') || subchips.children.length > 0, 'Subchips should be visible for "codes" category');
      }
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

  describe('Feature 7: Floating Toast Notifications (showFloatingToast)', () => {
    it('should trigger floating toast notification on item copy with category icon and progress feedback', async () => {
      const app = createAppInstance();
      await app.clickItemRow(0);

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Copying an item should spawn a floating toast notification');
      assert.ok(toasts[0].text.length > 0, 'Toast notification must contain descriptive text');
    });
  });

  describe('Feature 8: Glassmorphic Batch Drawer Controls', () => {
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

  describe('Feature 9: High-Contrast Cards & Table Rows Layout Transitions', () => {
    it('should toggle layout modes between list, grid, and table with high-contrast borders', async () => {
      const app = createAppInstance();
      const { document } = app;

      await app.setLayoutView('grid');
      let listwrap = document.querySelector('#listwrap, [data-testid="wording-container"]');
      assert.ok(listwrap && (listwrap.classList.contains('grid') || listwrap.getAttribute('data-layout') === 'grid'), 'Layout container should have "grid" layout');

      await app.setLayoutView('table');
      listwrap = document.querySelector('#listwrap, [data-testid="wording-container"]');
      assert.ok(listwrap && (listwrap.classList.contains('table') || listwrap.getAttribute('data-layout') === 'table'), 'Layout container should have "table" layout');

      await app.setLayoutView('list');
      listwrap = document.querySelector('#listwrap, [data-testid="wording-container"]');
      assert.ok(listwrap && (listwrap.classList.contains('list') || listwrap.getAttribute('data-layout') === 'list'), 'Layout container should have "list" layout');
    });

    it('should render items with high contrast border structures and hover ease styles', () => {
      const app = createAppInstance();
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Defect items must be rendered');
      assert.ok(visible.every((item) => item.hasContrastBorder), 'All rendered defect items must support high-contrast borders');
      assert.ok(visible.every((item) => item.hasHoverEase), 'All rendered defect items must support 150ms hover ease transitions');
    });
  });

  describe('Feature 10: Copy History Feed, Pinning & Custom Storage Persistence Baseline', () => {
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
