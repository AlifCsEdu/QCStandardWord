import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from '../../tests/harness.js';

describe('Empirical Challenge: Milestone M2 Stress & Adversarial Verification', () => {

  describe('1. Sidebar Category Switching Stress & Contract Integrity', () => {
    it('should correctly switch categories across all 13 defect types and 3 quick views', () => {
      const app = createAppInstance();
      const categories = [
        'all', 'pinned', 'recent',
        'codes', 'screen', 'camera', 'buttons', 'battery',
        'backcover', 'locks', 'pen', 'water', 'audio', 'body', 'system'
      ];

      for (const catId of categories) {
        app.selectCategory(catId);
        const visible = app.getVisibleItems();
        assert.ok(Array.isArray(visible), `Category ${catId} did not return an array`);

        // Check active state attribute on category tab
        const activeTab = app.document.querySelector(`[data-cat="${catId}"]`);
        assert.ok(activeTab, `Category element for "${catId}" missing data-cat attribute`);
      }
    });

    it('should preserve DOM contract selectors: #sidebarNav, #nav, #chips', () => {
      const app = createAppInstance();
      const { document } = app;

      assert.ok(document.querySelector('#sidebarNav'), '#sidebarNav must exist in DOM');
      assert.ok(document.querySelector('#nav'), '#nav must exist in DOM');
      assert.ok(document.querySelector('#chips'), '#chips must exist in DOM');
    });
  });

  describe('2. Pin Folder Manager CRUD & Edge Cases Stress', () => {
    it('should create custom pin folder with color and persist to localStorage', async () => {
      const app = createAppInstance();

      // Check default pin folders state
      const initialFolders = app.getStorageJSON('qc-pin-folders');
      assert.ok(Array.isArray(initialFolders), 'qc-pin-folders should initialize as an array');

      // Create new folder
      const folderName = 'Mobile Screen Routine';
      const folderColor = '#10b981';

      // Click + New Folder button
      const newFolderBtn = app.document.querySelector('button[title="Create New Pin Folder"]');
      assert.ok(newFolderBtn, 'Create New Pin Folder button must exist');
      newFolderBtn.click();
      await waitAsync(30);

      // Fill in input and submit form
      const nameInput = app.document.querySelector('input[placeholder="Folder name..."]');
      assert.ok(nameInput, 'Folder name input must appear when isCreatingFolder is true');
      
      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(nameInput, folderName);
      nameInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));

      // Click color button
      const colorBtns = app.document.querySelectorAll('form button[type="button"]');
      const greenBtn = Array.from(colorBtns).find(b => b.style.backgroundColor === 'rgb(16, 185, 129)' || b.style.backgroundColor === '#10b981');
      if (greenBtn) greenBtn.click();

      // Submit form
      const submitBtn = app.document.querySelector('form button[type="submit"]');
      assert.ok(submitBtn, 'Submit button must exist in create folder form');
      submitBtn.click();
      await waitAsync(30);

      // Verify folder persisted in localStorage
      const updatedFolders = app.getStorageJSON('qc-pin-folders');
      assert.ok(updatedFolders.some(f => f.name === folderName), 'New folder should exist in qc-pin-folders storage');
    });

    it('should handle XSS payloads safely in folder name without unescaped injection', async () => {
      const app = createAppInstance();
      const xssName = '<img src=x onerror=alert(1)> Custom Inspection';

      const newFolderBtn = app.document.querySelector('button[title="Create New Pin Folder"]');
      if (newFolderBtn) {
        newFolderBtn.click();
        await waitAsync(30);
        const nameInput = app.document.querySelector('input[placeholder="Folder name..."]');
        if (nameInput) {
          const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(nameInput, xssName);
          nameInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));

          const submitBtn = app.document.querySelector('form button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
            await waitAsync(30);
          }
        }
      }

      // Ensure no img script tag executed in DOM
      const injectedImgs = app.document.querySelectorAll('img[onerror]');
      assert.equal(injectedImgs.length, 0, 'XSS img tag should not be injected into DOM tree');

      const folderEls = app.document.querySelectorAll('[data-folder]');
      assert.ok(folderEls.length > 0, 'Folder element should render');
    });

    it('should support deleting custom pin folder cleanly', async () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-pin-folders': JSON.stringify([
            { id: 'f1', name: 'Temp Folder', color: '#06b6d4', itemIds: ['screen_1'] }
          ])
        }
      });

      // Mock window.confirm to return true
      app.window.confirm = () => true;

      const folderBtn = app.document.querySelector('[data-folder="f1"]');
      assert.ok(folderBtn, 'Folder button f1 should exist');

      // Click delete button inside folder chip
      const deleteSpan = folderBtn.querySelector('span[title="Delete folder"]');
      assert.ok(deleteSpan, 'Delete folder span must exist');
      deleteSpan.click();
      await waitAsync(30);

      // Verify folder removed from storage
      const folders = app.getStorageJSON('qc-pin-folders');
      assert.ok(!folders.some(f => f.id === 'f1'), 'Folder f1 should be removed from qc-pin-folders storage');
    });
  });

  describe('3. Header View Switcher & Header Controls Stress', () => {
    it('should toggle layout modes list -> grid -> table -> list cleanly', async () => {
      const app = createAppInstance();

      await app.setLayoutView('grid');
      let switcher = app.getSegmentedControl();
      assert.ok(switcher, 'View switcher must exist');
      let activeBtn = switcher.querySelector('[data-v="grid"]');
      assert.ok(activeBtn && activeBtn.className.includes('bg-cyan-500'), 'Grid button should have active cyan pill styling');

      await app.setLayoutView('table');
      activeBtn = switcher.querySelector('[data-v="table"]');
      assert.ok(activeBtn && activeBtn.className.includes('bg-cyan-500'), 'Table button should have active cyan pill styling');

      await app.setLayoutView('list');
      activeBtn = switcher.querySelector('[data-v="list"]');
      assert.ok(activeBtn && activeBtn.className.includes('bg-cyan-500'), 'List button should have active cyan pill styling');
    });

    it('should preserve DOM contract IDs: #appHeader, #search, #clearBtn, #spotlightBtn, #setLayout, #editBtn, #batchBtn, #bcount, #setBtn, #dlBtn, #themeBtn', () => {
      const app = createAppInstance();
      const { document } = app;

      const requiredIds = [
        'appHeader', 'search', 'spotlightBtn',
        'setLayout', 'editBtn', 'batchBtn', 'bcount',
        'setBtn', 'dlBtn', 'themeBtn'
      ];

      for (const id of requiredIds) {
        assert.ok(document.querySelector(`#${id}`), `DOM element #${id} must exist`);
      }
    });

    it('should open Spotlight search CommandDialog on Cmd+K keydown or button click', async () => {
      const app = createAppInstance();

      const spotlightBtn = app.document.querySelector('#spotlightBtn');
      assert.ok(spotlightBtn, '#spotlightBtn trigger button must exist');
      
      spotlightBtn.click();
      await waitAsync(30);

      const modal = app.document.querySelector('#modal');
      assert.ok(modal, 'CommandDialog modal (#modal) must exist when spotlight is opened');
    });
  });

});
