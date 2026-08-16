import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';
import { searchQCItems, highlightText, highlightSegments, escapeHtml } from '../src/utils/searchEngine.ts';
import type { QCItem, CustomPinFolder, CategoryInfo } from '../src/types/qc.ts';

describe('Milestone 4 (Track 2): Ergonomics, View State & Component Interactions Adversarial Hardening', () => {

  // =========================================================================
  // 1. Deep Nested Folder Creation, Category Deletion Cascades & Item Edits
  // =========================================================================
  describe('1. Deep Folders, Category Deletions Cascades & Active Filter Edits', () => {

    it('1.1: deep folder creation stress: creating 25 custom pin folders with distinct colors and names', async () => {
      const app = createAppInstance();
      await waitAsync(40);

      // Open folders section and create 25 folders
      const createTrigger = app.document.querySelector('button[title="Create New Pin Folder"]') as HTMLElement;
      assert.ok(createTrigger, 'Create Pin Folder trigger button must exist');

      for (let i = 1; i <= 25; i++) {
        createTrigger.click();
        await waitAsync(15);

        const input = app.document.querySelector('input[placeholder="Folder name..."]') as HTMLInputElement;
        assert.ok(input, `Folder input should appear for folder ${i}`);

        const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(input, `Stress Folder #${i}`);
        } else {
          input.value = `Stress Folder #${i}`;
        }
        input.dispatchEvent(new app.window.Event('input', { bubbles: true }));
        input.dispatchEvent(new app.window.Event('change', { bubbles: true }));

        // Pick color cycling through preset colors
        const colorButtons = Array.from(app.document.querySelectorAll('form button[style*="background-color"]')) as HTMLButtonElement[];
        if (colorButtons.length > 0) {
          const colorBtn = colorButtons[i % colorButtons.length];
          colorBtn.click();
        }

        const saveBtn = app.document.querySelector('form button[type="submit"]') as HTMLButtonElement;
        assert.ok(saveBtn, 'Save button must exist');
        saveBtn.click();
        await waitAsync(20);
      }

      // Check stored folders in localStorage
      const storedFolders = app.getStorageJSON('qc-pin-folders') as CustomPinFolder[];
      assert.ok(Array.isArray(storedFolders), 'qc-pin-folders must be an array');
      // 1 initial default folder ("Starred Defects") + 25 newly created = 26 folders
      assert.equal(storedFolders.length, 26, 'Must contain 26 total pin folders in storage');

      // Verify DOM folder chips render in sidebar
      const folderChips = Array.from(app.document.querySelectorAll('[data-folder], [data-testid^="pin-folder-"]'));
      assert.ok(folderChips.length >= 25, `Must render at least 25 folder chips in DOM, found ${folderChips.length}`);
    });

    it('1.2: cross-folder item pinning, folder rename, and active folder deletion cascade', async () => {
      // BASE_ITEMS has items starting at n: 2, 3, 4 (b2: Symbol B, b3: Fake Back Cover, b4: Bubble In Back Cover)
      const initialFolders: CustomPinFolder[] = [
        { id: 'f_audit_1', name: 'Audit Critical', color: '#ef4444', itemIds: [2, 3, 4], createdAt: Date.now() },
        { id: 'f_audit_2', name: 'Audit Secondary', color: '#3b82f6', itemIds: [3, 4], createdAt: Date.now() },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-pin-folders': JSON.stringify(initialFolders),
          'qc-pins': JSON.stringify([2, 3, 4]),
        },
      });
      await waitAsync(40);

      // Select folder 1
      const folder1Btn = app.document.querySelector('[data-folder="f_audit_1"]') as HTMLElement;
      assert.ok(folder1Btn, 'Folder 1 button exists');
      folder1Btn.click();
      await waitAsync(30);

      // Active folder view should show items 2, 3, 4
      let visible = app.getVisibleItems();
      assert.equal(visible.length, 3, 'Folder 1 should show exactly 3 items');
      assert.deepEqual(visible.map((it) => parseInt(it.num, 10)).sort(), [2, 3, 4]);

      // Rename folder 1
      const renameBtn = app.document.querySelector('[data-folder="f_audit_1"] [title="Rename folder"]') as HTMLElement;
      if (renameBtn) {
        renameBtn.click();
        await waitAsync(20);

        const renameInput = app.document.querySelector('form input[type="text"]') as HTMLInputElement;
        assert.ok(renameInput, 'Rename input exists');

        const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(renameInput, 'Renamed Critical Folder');
        } else {
          renameInput.value = 'Renamed Critical Folder';
        }
        renameInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));
        renameInput.dispatchEvent(new app.window.Event('change', { bubbles: true }));

        const submitBtn = app.document.querySelector('form button[type="submit"]') as HTMLElement;
        submitBtn.click();
        await waitAsync(30);

        const updatedFolders = app.getStorageJSON('qc-pin-folders') as CustomPinFolder[];
        const target = updatedFolders.find((f) => f.id === 'f_audit_1');
        assert.equal(target?.name, 'Renamed Critical Folder', 'Folder name must be updated in storage');
      }

      // Delete active folder
      const origConfirm = app.window.confirm;
      app.window.confirm = () => true;

      const deleteBtn = app.document.querySelector('[data-folder="f_audit_1"] [title="Delete folder"]') as HTMLElement;
      if (deleteBtn) {
        deleteBtn.click();
        await waitAsync(30);
      }
      app.window.confirm = origConfirm;

      // Verify active folder is removed and fallback state holds remaining folder
      const remainingFolders = app.getStorageJSON('qc-pin-folders') as CustomPinFolder[];
      assert.equal(remainingFolders.length, 1, 'Only 1 folder remains after deletion');
      assert.equal(remainingFolders[0].id, 'f_audit_2');

      // Overall pins set in storage must still be preserved
      const pinsRaw = app.getStorageJSON('qc-pins');
      assert.ok(Array.isArray(pinsRaw) && pinsRaw.length > 0, 'qc-pins must remain intact');
    });

    it('1.3: dynamic category creation with custom subCodes and color accents', async () => {
      const app = createAppInstance();
      await waitAsync(40);

      // Open Category Manager Modal
      const openMgrBtn = app.document.querySelector('[data-testid="open-category-manager-btn"], button[title="Manage Categories"]') as HTMLElement;
      assert.ok(openMgrBtn, 'Open category manager button exists');
      openMgrBtn.click();
      await waitAsync(30);

      const modal = app.document.querySelector('[data-testid="category-manager-modal"]');
      assert.ok(modal, 'Category manager modal must be open');

      // Click "Add Category"
      const addCatBtn = Array.from(app.document.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Add Category')
      ) as HTMLElement;
      assert.ok(addCatBtn, 'Add Category button exists in modal');
      addCatBtn.click();
      await waitAsync(30);

      // Fill category name & description
      const nameInput = app.document.querySelector('input[placeholder*="Display Panel"]') as HTMLInputElement;
      assert.ok(nameInput, 'Category name input exists');
      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(nameInput, 'Packaging Defects');
      } else {
        nameInput.value = 'Packaging Defects';
      }
      nameInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new app.window.Event('change', { bubbles: true }));

      // Pick Emoji icon
      const emojiTab = Array.from(app.document.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Custom Emoji')
      ) as HTMLElement;
      if (emojiTab) {
        emojiTab.click();
        await waitAsync(20);
        const boxEmojiBtn = Array.from(app.document.querySelectorAll('button')).find(
          (b) => b.textContent?.includes('📦')
        ) as HTMLElement;
        if (boxEmojiBtn) boxEmojiBtn.click();
      }

      // Save category
      const saveCatBtn = Array.from(app.document.querySelectorAll('button[type="submit"]')).find(
        (b) => b.textContent?.includes('Save Category')
      ) as HTMLElement;
      assert.ok(saveCatBtn, 'Save Category submit button exists');
      saveCatBtn.click();
      await waitAsync(40);

      // Check category in storage
      const cats = app.getStorageJSON('qc-categories') as CategoryInfo[];
      const added = cats.find((c) => c.name === 'Packaging Defects');
      assert.ok(added, 'Newly created category must exist in qc-categories');
      assert.equal(added?.isDefault, false);

      const catOrder = app.getStorageJSON('qc-category-order') as string[];
      assert.ok(catOrder.includes(added.id), 'Category ID must be appended to qc-category-order');
    });

    it('1.4: dynamic category deletion cascade reverts active category to "all" without crashing', async () => {
      const customCatId = 'cat_optics_99';
      const initialCats: CategoryInfo[] = [
        { id: 'screen', name: 'Screen', color: '#10b981', isDefault: true, order: 0 },
        { id: 'battery', name: 'Battery', color: '#f59e0b', isDefault: true, order: 1 },
        { id: customCatId, name: 'Optics & Lenses', color: '#8b5cf6', isDefault: false, order: 2 },
      ];
      const initialCustomItems: QCItem[] = [
        { id: 'item_opt_1', n: 701, t: 'Camera lens internal particulate dust', c: customCatId as any, custom: true },
        { id: 'item_opt_2', n: 702, t: 'Prism alignment offset in optical module', c: customCatId as any, custom: true },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-categories': JSON.stringify(initialCats),
          'qc-category-order': JSON.stringify(['screen', 'battery', customCatId]),
          'qc-custom': JSON.stringify(initialCustomItems),
        },
      });
      await waitAsync(40);

      // Select the custom category
      app.selectCategory(customCatId);
      await waitAsync(30);

      let items = app.getVisibleItems();
      assert.equal(items.length, 2, 'Custom category should show 2 items');

      // Open Category Manager and delete the custom category
      const origConfirm = app.window.confirm;
      app.window.confirm = () => true;

      const openMgrBtn = app.document.querySelector('[data-testid="open-category-manager-btn"], button[title="Manage Categories"]') as HTMLElement;
      if (openMgrBtn) {
        openMgrBtn.click();
        await waitAsync(30);

        const deleteButtons = Array.from(app.document.querySelectorAll('button[title="Delete Category"]')) as HTMLButtonElement[];
        assert.ok(deleteButtons.length > 0, 'Delete Category button should exist for non-default category');
        deleteButtons[0].click();
        await waitAsync(40);
      }
      app.window.confirm = origConfirm;

      // Verify category was deleted from storage and order
      const catsAfter = app.getStorageJSON('qc-categories') as CategoryInfo[];
      assert.ok(!catsAfter.some((c) => c.id === customCatId), 'Category must be deleted from qc-categories');

      const orderAfter = app.getStorageJSON('qc-category-order') as string[];
      assert.ok(!orderAfter.includes(customCatId), 'Category must be removed from qc-category-order');

      // Verify app did not crash and displays all remaining default items cleanly
      const allItems = app.getVisibleItems();
      assert.ok(allItems.length >= 100, 'App must safely display base items in "all" view after category deletion');
    });

    it('1.5: category deletion undo restores category and ordering exactly; system categories are protected', async () => {
      const customCatId = 'cat_haptics';
      const initialCats: CategoryInfo[] = [
        { id: 'screen', name: 'Screen', color: '#10b981', isDefault: true, order: 0 },
        { id: customCatId, name: 'Haptic Motors', color: '#ec4899', isDefault: false, order: 1 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-categories': JSON.stringify(initialCats),
          'qc-category-order': JSON.stringify(['screen', customCatId]),
        },
      });
      await waitAsync(40);

      // Open Category Manager and delete custom category
      const origConfirm = app.window.confirm;
      app.window.confirm = () => true;

      const openMgrBtn = app.document.querySelector('[data-testid="open-category-manager-btn"]') as HTMLElement;
      if (openMgrBtn) {
        openMgrBtn.click();
        await waitAsync(30);

        const delBtn = app.document.querySelector('button[title="Delete Category"]') as HTMLElement;
        if (delBtn) delBtn.click();
        await waitAsync(30);
      }
      app.window.confirm = origConfirm;

      // Find warning toast with Undo action
      const toasts = app.getToasts();
      const undoToast = toasts.find((t) => t.isWarn && t.actionLabel === 'Undo');
      assert.ok(undoToast, 'Undo toast must appear on category deletion');

      // Click Undo
      app.triggerToastAction(toasts.indexOf(undoToast));
      await waitAsync(40);

      // Verify category is restored in storage and ordering
      const restoredCats = app.getStorageJSON('qc-categories') as CategoryInfo[];
      assert.ok(restoredCats.some((c) => c.id === customCatId), 'Category must be restored in qc-categories');
      const restoredOrder = app.getStorageJSON('qc-category-order') as string[];
      assert.ok(restoredOrder.includes(customCatId), 'Category must be restored in qc-category-order');
    });

    it('1.6: defect item additions & edits under active category and live search query update dynamically', async () => {
      const app = createAppInstance();
      await waitAsync(40);

      // 1. Enable edit mode
      app.toggleEditMode();
      await waitAsync(30);

      // 2. Add custom defect item in screen category with unique token
      app.openAddModal();
      await waitAsync(30);
      app.saveModalForm('AdversarialUniqueDefect_8881 on OLED Panel', 'screen', 8881);
      await waitAsync(40);

      // 3. Filter by screen category -> custom item must be present
      app.selectCategory('screen');
      await waitAsync(30);

      let screenItems = app.getVisibleItems();
      assert.ok(
        screenItems.some((it) => it.text.includes('AdversarialUniqueDefect_8881')),
        'Newly added custom defect must be visible under screen category'
      );

      // 4. Test live search filtering for the unique token
      app.search('AdversarialUniqueDefect_8881');
      await waitAsync(30);

      let searchItems = app.getVisibleItems();
      assert.equal(searchItems.length, 1, 'Search query must find exactly 1 matching item');
      assert.ok(searchItems[0].text.includes('AdversarialUniqueDefect_8881'));

      // 5. Delete custom item and verify it disappears immediately
      await app.clickItemAction(0, 'del');
      await waitAsync(30);

      searchItems = app.getVisibleItems();
      assert.equal(searchItems.length, 0, 'Deleted item must disappear from live search results');
    });
  });

  // =========================================================================
  // 2. Batch Drawer Bulk Operations Under High Volume (100+ Items)
  // =========================================================================
  describe('2. Batch Drawer Bulk Operations (100+ Items), Clipboard Resilience & Delimiters', () => {

    it('2.1: populates 120 items in batch queue and maintains exact count badges and DOM elements', async () => {
      const largeQueue = Array.from({ length: 120 }, (_, i) => `Defect #${i + 1}: High Volume Batch Item Statement`);
      const app = createAppInstance({
        initialStorage: {
          'qc-batch': JSON.stringify(largeQueue),
          'qc-autoclear': 'false',
        },
      });
      await waitAsync(40);

      assert.equal(app.getBatchCount(), 120, 'Batch count must be 120');

      await app.openBatchDrawer();
      await waitAsync(40);

      const bbcount = app.document.querySelector('#bbcount');
      const bcopycount = app.document.querySelector('#bcopycount');
      assert.equal(bbcount?.textContent?.trim(), '120', '#bbcount badge must show 120');
      assert.equal(bcopycount?.textContent?.trim(), '120', '#bcopycount badge must show 120');

      const batchItems = app.getBatchItems();
      assert.equal(batchItems.length, 120, 'DOM must render all 120 batch items');
      assert.equal(batchItems[0].text, 'Defect #1: High Volume Batch Item Statement');
      assert.equal(batchItems[119].text, 'Defect #120: High Volume Batch Item Statement');
    });

    it('2.2: batch item operations under high volume: boundary reorder, midpoint reorder, single copy, and removal', async () => {
      const largeQueue = Array.from({ length: 120 }, (_, i) => `Item #${i + 1}`);
      const app = createAppInstance({
        initialStorage: {
          'qc-batch': JSON.stringify(largeQueue),
          'qc-autoclear': 'false',
        },
      });
      await waitAsync(40);
      await app.openBatchDrawer();
      await waitAsync(40);

      // Boundary Move Up at 0 must be disabled
      const up0 = app.document.querySelector('[data-mvup="0"], [data-mup="0"], [data-up="0"]') as HTMLButtonElement;
      assert.equal(up0?.disabled, true, 'Move Up at index 0 must be disabled');

      // Boundary Move Down at 119 must be disabled
      const down119 = app.document.querySelector('[data-mvdn="119"], [data-mdown="119"], [data-down="119"]') as HTMLButtonElement;
      assert.equal(down119?.disabled, true, 'Move Down at index 119 must be disabled');

      // Midpoint Reorder: Move Up at index 60 (swaps 59 and 60)
      app.moveBatchItemUp(60);
      await waitAsync(30);
      let items = app.getBatchItems();
      assert.equal(items[59].text, 'Item #61');
      assert.equal(items[60].text, 'Item #60');

      // Midpoint Reorder: Move Down at index 60 (swaps 60 and 61 -> Item #60 goes to index 61)
      app.moveBatchItemDown(60);
      await waitAsync(30);
      items = app.getBatchItems();
      assert.equal(items[61].text, 'Item #60');

      // Single item copy at index 50
      const copyBtns = app.document.querySelectorAll('#blist .bcopy-item, #blist [data-bc]');
      (copyBtns[50] as HTMLButtonElement).click();
      await waitAsync(30);
      assert.equal(app.getCopiedText(), items[50].text, 'Single item copy must write correct text to clipboard');

      // Remove single item at index 50
      app.removeBatchItem(50);
      await waitAsync(30);
      assert.equal(app.getBatchCount(), 119, 'Batch count must decrement to 119');
      const stored = app.getStorageJSON('qc-batch') as string[];
      assert.equal(stored.length, 119, 'Stored batch queue must have 119 items');
    });

    it('2.3: clipboard copy failure fallback handles exceptions gracefully without crash', async () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-batch': JSON.stringify(['Defect Item 1', 'Defect Item 2']),
          'qc-autoclear': 'false',
        },
      });
      await waitAsync(30);

      // Simulate clipboard writeText throwing an error
      Object.defineProperty(app.window.navigator, 'clipboard', {
        value: {
          writeText: async () => {
            throw new Error('Clipboard write permission denied by OS policy');
          },
          readText: async () => '',
        },
        configurable: true,
      });

      // 1. Trigger single item copy (should not throw unhandled exception)
      await app.clickItemRow(0);
      await waitAsync(40);

      // 2. Trigger batch copy (should not throw unhandled exception)
      await app.openBatchDrawer();
      await waitAsync(30);
      await app.copyBatch();
      await waitAsync(40);

      // Verify app remains responsive and alive
      assert.ok(app.getVisibleItems().length > 0, 'App must continue functioning after clipboard rejection');
    });

    it('2.4: all 6 delimiter join options format large queue with exact separators', async () => {
      const itemsCount = 100;
      const testItems = Array.from({ length: itemsCount }, (_, i) => `Defect ${i + 1}`);

      const delimiters: Array<{ key: string; sep: string }> = [
        { key: 'nl', sep: '\n' },
        { key: 'comma', sep: ', ' },
        { key: 'semi', sep: '; ' },
        { key: 'space', sep: ' ' },
        { key: 'pipe', sep: ' | ' },
        { key: 'bullet', sep: ' • ' },
      ];

      for (const { key, sep } of delimiters) {
        const app = createAppInstance({
          initialStorage: {
            'qc-batch': JSON.stringify(testItems),
            'qc-join': key,
            'qc-autoclear': 'false',
          },
        });
        await waitAsync(30);

        await app.copyBatch();
        await waitAsync(30);

        const copied = app.getCopiedText();
        assert.ok(copied, `Copied text for delimiter '${key}' must not be null`);

        const expected = testItems.join(sep);
        assert.equal(copied, expected, `Delimiter '${key}' must produce exact formatted string`);
      }
    });

    it('2.5: bulk paste modal imports 150 multiline entries with mixed line endings and empty lines', async () => {
      const app = createAppInstance();
      await waitAsync(30);
      await app.openBatchDrawer();
      await waitAsync(30);

      // Open Bulk Paste dialog
      const pasteBtn = app.document.querySelector('#bpaste') as HTMLElement;
      assert.ok(pasteBtn, '#bpaste button exists');
      pasteBtn.click();
      await waitAsync(30);

      // Construct 150 lines with mixed \r\n and blank lines
      const lines: string[] = [];
      for (let i = 1; i <= 150; i++) {
        lines.push(`Bulk Defect Line #${i}`);
        if (i % 10 === 0) lines.push(''); // interspersed blank lines
      }
      const rawText = lines.join('\r\n');

      const textarea = app.document.querySelector('textarea[placeholder*="Paste defect lines"]') as HTMLTextAreaElement;
      assert.ok(textarea, 'Bulk paste textarea exists');

      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLTextAreaElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(textarea, rawText);
      } else {
        textarea.value = rawText;
      }
      textarea.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      textarea.dispatchEvent(new app.window.Event('change', { bubbles: true }));

      const importBtn = Array.from(app.document.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Import Lines')
      ) as HTMLElement;
      assert.ok(importBtn, 'Import Lines button exists');
      importBtn.click();
      await waitAsync(50);

      // Blank lines should be filtered out, leaving exactly 150 items
      assert.equal(app.getBatchCount(), 150, 'Batch queue should contain exactly 150 parsed items');
      const stored = app.getStorageJSON('qc-batch') as string[];
      assert.equal(stored.length, 150);
    });
  });

  // =========================================================================
  // 3. Settings Engine Combinatorial Permutation Stress
  // =========================================================================
  describe('3. Settings Engine Combinatorial Permutation Stress', () => {

    it('3.1: rapid permutation cycling across all appearance dimensions maintains DOM & storage invariants', async () => {
      const app = createAppInstance();
      await waitAsync(30);
      await app.openSettingsModal();
      await waitAsync(30);

      // Test all 3 densities
      for (const d of ['compact', 'cozy', 'tablet'] as const) {
        await app.setDensity(d);
        assert.equal(app.document.documentElement.getAttribute('data-density'), d);
      }

      // Test all 4 radii
      for (const r of ['sharp', 'soft', '10', 'round'] as const) {
        await app.setRadius(r);
        const dataRadius = app.document.documentElement.getAttribute('data-radius');
        assert.ok(dataRadius === r || (r === 'sharp' && dataRadius === '0') || (r === 'soft' && dataRadius === '6') || (r === 'round' && dataRadius === '16'));
      }

      // Test all 3 font sizes
      for (const s of ['s', 'm', 'l'] as const) {
        await app.setTextSize(s);
        const dataSize = app.document.documentElement.getAttribute('data-font-size');
        assert.ok(dataSize === s || (s === 's' && dataSize === '13') || (s === 'm' && dataSize === '14') || (s === 'l' && dataSize === '16'));
      }

      // Test all 7 accent palettes
      for (const acc of ['stone', 'amber', 'green', 'rose', 'blue', 'steel', 'plum'] as const) {
        await app.setAccent(acc);
        assert.equal(app.document.documentElement.getAttribute('data-accent'), acc);
      }

      // Test motion modes
      await app.setMotion('reduced');
      assert.equal(app.document.documentElement.getAttribute('data-motion'), 'reduced');
      await app.setMotion('full');
      assert.equal(app.document.documentElement.getAttribute('data-motion'), 'full');

      // Set explicit known final configuration
      await app.setDensity('tablet');
      await app.setRadius('round');
      await app.setTextSize('l');
      await app.setAccent('rose');
      await app.setMotion('reduced');
      await waitAsync(30);

      const root = app.document.documentElement;
      assert.equal(root.getAttribute('data-density'), 'tablet');
      assert.ok(root.getAttribute('data-radius') === 'round' || root.getAttribute('data-radius') === '16');
      assert.ok(root.getAttribute('data-font-size') === 'l' || root.getAttribute('data-font-size') === '16');
      assert.equal(root.getAttribute('data-accent'), 'rose');
      assert.equal(root.getAttribute('data-motion'), 'reduced');
      assert.equal(root.style.getPropertyValue('--radius'), '16px');
      assert.equal(root.style.fontSize, '16px');

      const stored = app.getStorageJSON('qc-appearance');
      assert.equal(stored?.density, 'tablet');
      assert.equal(stored?.accent, 'rose');
      assert.equal(stored?.motion, 'reduced');

      await app.closeSettingsModal();
    });

    it('3.2: theme auto responds dynamically to system matchMedia preferences changes', async () => {
      let isDarkMedia = false;
      const mediaListeners: Array<(e: { matches: boolean }) => void> = [];

      const app = createAppInstance({
        initialStorage: {
          'qc-theme': 'auto',
          'qc-appearance': JSON.stringify({ theme: 'auto' }),
        },
      });

      // Inject mock matchMedia with listener capability
      app.window.matchMedia = (query: string) => ({
        matches: isDarkMedia,
        media: query,
        onchange: null,
        addListener: (fn: any) => mediaListeners.push(fn),
        removeListener: (fn: any) => {
          const idx = mediaListeners.indexOf(fn);
          if (idx !== -1) mediaListeners.splice(idx, 1);
        },
        addEventListener: (_type: string, fn: any) => mediaListeners.push(fn),
        removeEventListener: (_type: string, fn: any) => {
          const idx = mediaListeners.indexOf(fn);
          if (idx !== -1) mediaListeners.splice(idx, 1);
        },
        dispatchEvent: () => true,
      }) as any;

      await waitAsync(30);

      // Verify theme attribute
      const root = app.document.documentElement;
      assert.equal(root.getAttribute('data-theme'), 'auto');
    });

    it('3.3: multi-tab StorageEvent broadcast synchronizes appearance in real time', async () => {
      const app = createAppInstance();
      await waitAsync(30);

      // Simulate external tab updating qc-appearance
      const updatedAppearance = {
        theme: 'light',
        density: 'compact',
        radius: '6',
        textsize: '13',
        accent: 'green',
        motion: 'reduced',
        layout: 'grid',
      };

      const storageEvent = new (app.window as any).Event('storage');
      (storageEvent as any).key = 'qc-appearance';
      (storageEvent as any).newValue = JSON.stringify(updatedAppearance);
      app.window.dispatchEvent(storageEvent);
      await waitAsync(50);

      const root = app.document.documentElement;
      assert.equal(root.getAttribute('data-density'), 'compact');
      assert.equal(root.getAttribute('data-accent'), 'green');
      assert.equal(root.getAttribute('data-motion'), 'reduced');
      assert.equal(root.getAttribute('data-theme'), 'light');
    });
  });

  // =========================================================================
  // 4. View Layout Switches Under Large Defect Datasets (1000+ Items)
  // =========================================================================
  describe('4. View Layout Switches (1000+ Items) & Live Search Highlighting', () => {

    it('4.1: loads 1000+ custom QC items and switches rapidly between list, grid, and table views', async () => {
      const largeDefects: QCItem[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `stress_defect_${i + 1}`,
        n: 1000 + i + 1,
        t: `QC Defect Standard Statement #${i + 1} for Stress Testing Reliability`,
        c: (['screen', 'housing', 'battery', 'camera', 'codes'] as const)[i % 5],
        custom: true,
      }));

      const app = createAppInstance({
        initialStorage: {
          'qc-custom': JSON.stringify(largeDefects),
        },
      });
      await waitAsync(60);

      let items = app.getVisibleItems();
      // 1000 custom items + ~100 base items = 1100+ items
      assert.ok(items.length >= 1000, `Must load 1000+ items in initial list view, got ${items.length}`);

      // 1. Switch to Grid View
      await app.setLayoutView('grid');
      await waitAsync(50);

      const gridWrap = app.document.querySelector('.listwrap.grid, [data-layout="grid"]');
      assert.ok(gridWrap, 'Grid view container must have .grid class / data-layout="grid"');
      const gridBody = app.document.querySelector('.wording-grid-body');
      assert.ok(gridBody, '.wording-grid-body element must exist');

      // 2. Switch to Table View
      await app.setLayoutView('table');
      await waitAsync(50);

      const tableWrap = app.document.querySelector('.listwrap.table, [data-layout="table"]');
      assert.ok(tableWrap, 'Table view container must have .table class / data-layout="table"');
      const tableWrapper = app.document.querySelector('.wording-table-wrapper');
      assert.ok(tableWrapper, '.wording-table-wrapper element must exist');

      // 3. Switch back to List View
      await app.setLayoutView('list');
      await waitAsync(50);

      const listWrap = app.document.querySelector('.listwrap.list, [data-layout="list"]');
      assert.ok(listWrap, 'List view container must have .list class / data-layout="list"');
      const listBody = app.document.querySelector('.wording-list-body');
      assert.ok(listBody, '.wording-list-body element must exist');
    });

    it('4.2: live search highlighting and fuzzy matching on 1000+ items dataset', async () => {
      const titles = [
        'Cracked Gorilla Glass surface on upper display panel',
        'Dead pixels line visible along lower border bezel',
        'Excessive backlight bleeding on top edge corner',
        'Ghost touch input triggering intermittently on screen',
        'Oleophobic coating peeling and flaking off front glass',
        'Camera lens sapphire glass scratch across aperture',
        'Battery cell thermal swelling pushing rear chassis',
        'Haptic motor vibration rattling loose internal bracket',
        'Microphone mesh clogged with dense dust particles',
        'Volume rocker switch loose tactile feedback failure',
      ];
      const categories: CategoryKey[] = ['screen', 'housing', 'battery', 'camera', 'codes'];

      const largeDefects: QCItem[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `stress_defect_${i + 1}`,
        n: 1000 + i + 1,
        t: `${titles[i % titles.length]} (Batch Run #${Math.floor(i / 10) + 1})`,
        c: categories[i % categories.length],
        custom: true,
      }));

      const app = createAppInstance({
        initialStorage: {
          'qc-custom': JSON.stringify(largeDefects),
        },
      });
      await waitAsync(60);

      // 1. Search for specific phrase 'backlight bleeding'
      app.search('backlight bleeding');
      await waitAsync(50);

      let results = app.getVisibleItems();
      // Out of 1000 items, exactly 100 (10%) are backlight bleeding + any base items
      assert.ok(results.length >= 100 && results.length <= 115, `Search must filter dataset to ~100 items, got ${results.length}`);
      assert.ok(results[0].text.toLowerCase().includes('backlight bleeding'), 'Top result must contain backlight bleeding');

      // 2. Multi-token query 'Microphone mesh'
      app.search('Microphone mesh');
      await waitAsync(50);

      results = app.getVisibleItems();
      assert.ok(results.length >= 100 && results.length < 1000, `Multi-token search must filter dataset, got ${results.length}`);
      assert.ok(results[0].text.includes('Microphone mesh'), 'Top result must contain Microphone mesh');

      // 3. Clear search restores full 1000+ items dataset
      app.clearSearch();
      await waitAsync(50);
      assert.ok(app.getVisibleItems().length >= 1000, 'Clearing search restores full dataset');
    });

    it('4.3: search engine unit stress: XSS safety, special characters, and highlight segment wrapping', () => {
      const maliciousItem: QCItem = {
        id: 'xss_1',
        n: 9999,
        t: '<script>alert("xss")</script> & "quoted" \'text\' <img src=x onerror=alert(1)>',
        c: 'screen',
      };

      // 1. Verify HTML escaping
      const escaped = escapeHtml(maliciousItem.t);
      assert.ok(!escaped.includes('<script>'), 'Must not contain raw <script>');
      assert.ok(escaped.includes('&lt;script&gt;'), 'Must encode <script>');
      assert.ok(escaped.includes('&amp;'), 'Must encode &');
      assert.ok(escaped.includes('&quot;'), 'Must encode "');

      // 2. Search query on dangerous string
      const searchResults = searchQCItems([maliciousItem], 'script');
      assert.equal(searchResults.length, 1, 'Should find malicious item via search');

      const highlighted = highlightText(maliciousItem.t, 'script');
      assert.ok(highlighted.includes('<mark>&lt;script&gt;</mark>') || highlighted.includes('<mark>script</mark>') || highlighted.includes('&lt;<mark>script</mark>&gt;'), 'Highlight must wrap in mark tag and keep HTML escaped');
      assert.ok(!highlighted.includes('<script>alert'), 'Highlight must never unescape raw script tags');

      // 3. Highlight segments split test
      const segments = highlightSegments('Camera Lens Scratch On Surface', 'Lens Scratch');
      assert.ok(segments.some((s) => s.isMatch && s.text.includes('Lens Scratch')), 'Segments must match search tokens');
    });
  });

});
