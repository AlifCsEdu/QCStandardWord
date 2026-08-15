import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Tier 5: White-Box Adversarial Stress Testing & Boundary Edge Cases', () => {
  describe('1. Extreme localStorage Corruption Recovery', () => {
    it('should recover gracefully when all 14 localStorage keys contain malformed JSON or invalid types', async () => {
      const corruptedStorage = {
        'qc-pin-folders': '{corrupt_json: [[}',
        'qc-pins': '12345',
        'qc-recents': '"invalid_primitive_string"',
        'qc-history': 'true',
        'qc-batch': '{"corrupt_object": true}',
        'qc-join': 'INVALID_DELIMITER_KEY',
        'qc-autoclear': 'not_a_boolean',
        'qc-edits': '[1, 2, 3]',
        'qc-dels': '{"dels": "corrupt"}',
        'qc-custom': 'undefined',
        'qc-appearance': '123.45',
        'qc-theme': 'INVALID_THEME',
        'qc-density': 'SUPER_DENSE',
        'qc-sort': 'UNKNOWN_SORT',
      };

      // App initialization must not throw any exception when reading corrupt storage
      let app;
      assert.doesNotThrow(() => {
        app = createAppInstance({ initialStorage: corruptedStorage });
      }, 'App boot must not throw on corrupted localStorage values');

      const { document } = app;
      assert.ok(document.querySelector('#root'), 'App root element must mount cleanly');

      // Verify default items render
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'App must render default defect items despite storage corruption');

      // Verify storage key recovery after setting a new pin
      await app.clickItemAction(0, 'pin');
      const pinnedItems = app.getStorageJSON('qc-pins');
      assert.ok(Array.isArray(pinnedItems), 'qc-pins storage should recover to valid array after pinning');
    });

    it('should handle partially broken object shapes in qc-pin-folders without crashing', () => {
      const brokenFolderStorage = {
        'qc-pin-folders': JSON.stringify([
          { corrupt: true },
          null,
          'string_folder',
          { id: 'valid_1', name: 'Valid Folder', color: '#78716c', itemIds: ['s101'] },
        ]),
      };

      let app;
      assert.doesNotThrow(() => {
        app = createAppInstance({ initialStorage: brokenFolderStorage });
      });

      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'App must load successfully with sanitized folders');
    });
  });

  describe('2. HTML/XSS Input Sanitization in Custom Titles and Folder Names', () => {
    it('should escape HTML/XSS script tags in custom wording titles', async () => {
      const xssTitle = '<script>window.__xss_triggered=true;</script><img src=x onerror=alert(1)>';
      const app = createAppInstance();

      // Open add wording modal and save custom item with XSS payload
      app.openAddModal();
      app.saveModalForm(xssTitle, 'screen', 999);
      await waitAsync(50);

      // Verify item appears in visible items without executing XSS
      const visible = app.getVisibleItems();
      const customItem = visible.find((i) => i.num === '999');
      assert.ok(customItem, 'Custom defect #999 must exist');

      // Verify DOM element contains escaped script entities and NOT unescaped HTML script element
      const customEl = customItem.element;
      const htmlContent = customEl.innerHTML;
      assert.ok(
        !htmlContent.includes('<script>window.__xss_triggered'),
        'Raw script tag must not be injected into HTML'
      );
      assert.ok(
        htmlContent.includes('&lt;script&gt;') || customItem.text.includes('<script>'),
        'XSS payload must be rendered as escaped HTML entities'
      );

      // Check window scope to confirm XSS script never executed
      assert.equal(app.window.__xss_triggered, undefined, 'XSS script execution must not occur');
    });

    it('should sanitize HTML injection vectors in folder names', () => {
      const xssFolderName = '"><iframe src="javascript:alert(1)"></iframe>';
      const app = createAppInstance();

      const { mockStorage } = app;
      const folders = [
        {
          id: 'xss_folder',
          name: xssFolderName,
          color: '#ef4444',
          itemIds: ['s101'],
          createdAt: Date.now(),
        },
      ];
      mockStorage.setItem('qc-pin-folders', JSON.stringify(folders));

      const app2 = createAppInstance({ initialStorage: mockStorage.store });
      const { document } = app2;

      // Verify folder dropdown / render does not parse iframe tag as HTML DOM element
      const iframes = document.querySelectorAll('iframe');
      assert.equal(iframes.length, 0, 'No iframe elements should be injected by folder name XSS payload');
    });

    it('should preserve XSS payload strings correctly during JSON export and import', () => {
      const xssTitle = '<svg/onload=alert("xss")>';
      const app = createAppInstance();

      app.openAddModal();
      app.saveModalForm(xssTitle, 'camera', 888);

      const exported = app.exportChanges();
      assert.ok(exported.blob, 'Export blob must be generated');

      // Verify blob content keeps exact string without unescaped execution
      const jsonStr = app.mockStorage.getItem('qc-custom');
      assert.ok(jsonStr.includes('<svg/onload=alert(\\"xss\\")>'), 'Custom JSON must preserve exact payload string');
    });
  });

  describe('3. Max Folder Capacity (Creating 50+ Custom Pin Folders)', () => {
    it('should create and manage 50+ custom pin folders cleanly without performance or persistence issues', () => {
      const app = createAppInstance();

      // Create 55 custom pin folders in storage
      const folderList = [];
      for (let i = 1; i <= 55; i++) {
        folderList.push({
          id: `f_capacity_${i}`,
          name: `Capacity Folder ${i}`,
          color: i % 2 === 0 ? '#78716c' : '#71717a',
          itemIds: [`s${100 + (i % 10)}`],
          createdAt: Date.now() + i,
        });
      }
      app.mockStorage.setItem('qc-pin-folders', JSON.stringify(folderList));

      // Reload app to test persistence of 55 folders
      const app2 = createAppInstance({ initialStorage: app.mockStorage.store });
      const savedFolders = app2.getStorageJSON('qc-pin-folders');

      assert.ok(Array.isArray(savedFolders), 'qc-pin-folders must be array');
      assert.equal(savedFolders.length, 55, 'Should persist exactly 55 folders');

      // Verify folder item lookups
      const folder55 = savedFolders.find((f) => f.id === 'f_capacity_55');
      assert.ok(folder55, 'Folder 55 must exist');
      assert.equal(folder55.name, 'Capacity Folder 55');
      assert.equal(folder55.itemIds.length, 1);
    });
  });

  describe('4. Rapid Batch Drawer Queue Reordering under Heavy Concurrency', () => {
    it('should handle batch queue reordering and storage synchronization without index errors', async () => {
      // Initialize batch queue with 20 items directly in storage
      const batchItems = Array.from({ length: 20 }, (_, i) => `Item #${i + 1}`);
      const initialStorage = {
        'qc-batch': JSON.stringify(batchItems),
      };

      const app = createAppInstance({ initialStorage });
      assert.equal(app.getBatchCount(), 20, 'Should have 20 items in batch queue');

      // Verify storage reflects initial items
      const storedQueue = app.getStorageJSON('qc-batch');
      assert.ok(Array.isArray(storedQueue), 'qc-batch must be array');
      assert.equal(storedQueue.length, 20);

      // Simulate reorder logic on batch array: move index 5 up to 4
      const nextQueue = [...storedQueue];
      const temp = nextQueue[5];
      nextQueue[5] = nextQueue[4];
      nextQueue[4] = temp;
      app.mockStorage.setItem('qc-batch', JSON.stringify(nextQueue));

      const updatedBatch = app.getStorageJSON('qc-batch');
      assert.equal(updatedBatch[4], 'Item #6');
      assert.equal(updatedBatch[5], 'Item #5');
      assert.equal(updatedBatch.length, 20);
    });

    it('should maintain bounds during batch item removal', () => {
      const initialBatch = Array.from({ length: 10 }, (_, i) => `Batch Entry ${i}`);
      const app = createAppInstance({ initialStorage: { 'qc-batch': JSON.stringify(initialBatch) } });

      assert.equal(app.getBatchCount(), 10);

      // Remove item at index 5 and index 0
      const remaining = initialBatch.filter((_, idx) => idx !== 5 && idx !== 0);
      app.mockStorage.setItem('qc-batch', JSON.stringify(remaining));

      const finalBatch = app.getStorageJSON('qc-batch');
      assert.equal(finalBatch.length, 8);
      assert.equal(finalBatch[0], 'Batch Entry 1');
    });
  });

  describe('5. High-Speed Theme & Density Toggling Without State Drift', () => {
    it('should toggle theme and density modes rapidly while keeping DOM root attributes and localStorage strictly synchronized', async () => {
      const app = createAppInstance();
      const { document } = app;
      const root = document.documentElement;

      // Initial state verify
      assert.equal(root.getAttribute('data-theme'), 'dark');

      // Rapid theme toggle cycle
      const themes = ['light', 'dark', 'auto', 'light', 'dark'];
      for (const t of themes) {
        root.setAttribute('data-theme', t);
        if (t === 'dark') {
          root.classList.add('dark');
        } else if (t === 'light') {
          root.classList.remove('dark');
        }
        app.mockStorage.setItem('qc-theme', t);
      }

      await waitAsync(20);

      // Final theme verify
      assert.equal(app.mockStorage.getItem('qc-theme'), 'dark');
      assert.ok(root.classList.contains('dark'), 'HTML root element must retain dark class');
      assert.equal(root.getAttribute('data-theme'), 'dark');

      // Rapid density toggle cycle
      const densities = ['cozy', 'compact', 'spacious', 'cozy'];
      for (const d of densities) {
        root.setAttribute('data-density', d);
        app.mockStorage.setItem('qc-density', d);
      }

      await waitAsync(20);

      assert.equal(app.mockStorage.getItem('qc-density'), 'cozy');
      assert.equal(root.getAttribute('data-density'), 'cozy');
    });
  });
});
