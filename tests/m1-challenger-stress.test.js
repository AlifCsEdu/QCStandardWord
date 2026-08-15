import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';
import { CATEGORIES, CODE_SUBS } from '../src/data/qcData.ts';

describe('Milestone 1 Empirical Challenger 2 Stress Harness', () => {
  describe('1. Unified Header & Controls Adversarial Stress', () => {
    it('1.1: Header renders with all 3 columns and preserved DOM attributes', () => {
      const app = createAppInstance();
      const header = app.document.querySelector('#appHeader');
      assert.ok(header, '#appHeader must exist');
      assert.equal(header.getAttribute('data-testid'), 'app-header');

      // Search input & clear button
      const searchInput = app.document.querySelector('#search');
      assert.ok(searchInput, '#search must exist');
      assert.equal(searchInput.getAttribute('data-testid'), 'header-search-input');

      // Spotlight button
      const spotlightBtn = app.document.querySelector('#spotlightBtn');
      assert.ok(spotlightBtn, '#spotlightBtn must exist');
      assert.equal(spotlightBtn.getAttribute('data-testid'), 'spotlight-trigger');

      // View switcher
      const setLayout = app.document.querySelector('#setLayout');
      assert.ok(setLayout, '#setLayout must exist');
      assert.equal(setLayout.getAttribute('data-testid'), 'view-switcher');

      const viewButtons = setLayout.querySelectorAll('button[data-v]');
      assert.equal(viewButtons.length, 3, 'Must have list, grid, table view buttons');

      // Edit, Batch, Settings, Download, Theme buttons
      assert.ok(app.document.querySelector('#editBtn'), '#editBtn must exist');
      assert.ok(app.document.querySelector('#batchBtn'), '#batchBtn must exist');
      assert.ok(app.document.querySelector('#bcount'), '#bcount must exist');
      assert.ok(app.document.querySelector('#setBtn'), '#setBtn must exist');
      assert.ok(app.document.querySelector('#dlBtn'), '#dlBtn must exist');
      assert.ok(app.document.querySelector('#themeBtn'), '#themeBtn must exist');
    });

    it('1.2: Rapid view mode switcher (List -> Grid -> Table) updates DOM layout & active button state', async () => {
      const app = createAppInstance();
      const modes = ['grid', 'table', 'list', 'grid', 'list', 'table'];
      for (const mode of modes) {
        const btn = app.document.querySelector(`#setLayout button[data-v="${mode}"]`);
        btn.click();
        await waitAsync(20);
        assert.equal(app.document.documentElement.getAttribute('data-layout'), mode);
        assert.ok(btn.className.includes('bg-stone-800'), `Active button ${mode} should have active class`);
      }
    });

    it('1.3: Search bar handling: instant filtering, clear button toggle, and special character queries', async () => {
      const app = createAppInstance();
      const searchInput = app.document.querySelector('#search');

      // Initially clear button should not be present
      let clearBtn = app.document.querySelector('#clearBtn');
      assert.equal(clearBtn, null, 'Clear button should not exist when query is empty');

      // Type search query using harness search helper (handles native value setter for React)
      app.search('battery');
      await waitAsync(40);

      clearBtn = app.document.querySelector('#clearBtn');
      assert.ok(clearBtn, 'Clear button should appear when query is present');

      // Click clear button
      app.clearSearch();
      await waitAsync(40);
      assert.equal(searchInput.value, '', 'Search input should be cleared');
      assert.equal(app.document.querySelector('#clearBtn'), null, 'Clear button should disappear');

      // Test special character / regex injection query
      const specialQuery = '([.*+?^${}()|\\]\\\\)';
      app.search(specialQuery);
      await waitAsync(40);
      assert.doesNotThrow(() => {
        app.document.querySelectorAll('.gcard, .row, .trow');
      }, 'Search filtering with regex meta-characters must not throw');
    });

    it('1.4: Spotlight modal trigger via button and Cmd+K / Ctrl+K keyboard shortcut', async () => {
      const app = createAppInstance();
      const spotlightBtn = app.document.querySelector('#spotlightBtn');

      // Click spotlight button
      spotlightBtn.click();
      await waitAsync(50);

      assert.ok(app.isSpotlightOpen(), 'Spotlight dialog should be open');

      // Trigger shortcut to toggle
      app.window.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      await waitAsync(50);
      assert.equal(app.document.querySelector('[cmdk-root]'), null, 'Ctrl+K toggles spotlight dialog off');

      // Trigger via Ctrl+K again
      app.window.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      await waitAsync(50);
      assert.ok(app.isSpotlightOpen(), 'Spotlight dialog should open via Ctrl+K');
    });

    it('1.5: Edit mode toggle applies .on styling and renders EditToolbar #editstrip', async () => {
      const app = createAppInstance();
      const editBtn = app.document.querySelector('#editBtn');
      assert.ok(!editBtn.classList.contains('on'), 'Edit mode should initially be off');

      // Turn edit mode on
      editBtn.click();
      await waitAsync(40);
      assert.ok(editBtn.classList.contains('on'), 'Edit button should have .on class when active');

      const editToolbar = app.document.querySelector('#editstrip');
      assert.ok(editToolbar && editToolbar.classList.contains('flex'), 'Edit toolbar should have flex class in edit mode');

      // Turn edit mode off
      editBtn.click();
      await waitAsync(40);
      assert.ok(!editBtn.classList.contains('on'), 'Edit button should not have .on class when inactive');
      assert.ok(editToolbar.classList.contains('hidden'), 'Edit toolbar should have hidden class when inactive');
    });

    it('1.6: Theme toggle flips data-theme attribute on documentElement', async () => {
      const app = createAppInstance({ initialStorage: { 'qc-theme': 'dark' } });
      const themeBtn = app.document.querySelector('#themeBtn');
      assert.equal(app.document.documentElement.getAttribute('data-theme'), 'dark');

      themeBtn.click();
      await waitAsync(40);
      assert.equal(app.document.documentElement.getAttribute('data-theme'), 'light');
      assert.equal(app.window.localStorage.getItem('qc-theme'), 'light');

      themeBtn.click();
      await waitAsync(40);
      assert.equal(app.document.documentElement.getAttribute('data-theme'), 'dark');
      assert.equal(app.window.localStorage.getItem('qc-theme'), 'dark');
    });
  });

  describe('2. Sidebar Navigation & Category Switching Stress', () => {
    it('2.1: Sidebar renders all 12 categories plus quick views with active indicator styling', async () => {
      const app = createAppInstance();
      const sidebar = app.document.querySelector('#sidebarNav');
      assert.ok(sidebar, 'aside#sidebarNav must exist');
      assert.equal(sidebar.getAttribute('data-testid'), 'app-navbar');

      // Check quick views: all, pinned, recent
      const allTab = sidebar.querySelector('button[data-cat="all"]');
      const pinnedTab = sidebar.querySelector('button[data-cat="pinned"]');
      const recentTab = sidebar.querySelector('button[data-cat="recent"]');

      assert.ok(allTab, 'All tab must exist');
      assert.ok(pinnedTab, 'Pinned tab must exist');
      assert.ok(recentTab, 'Recent tab must exist');
      assert.ok(allTab.classList.contains('border-l-4'), 'Active category should have border-l-4');

      // Verify all 12 defect categories
      for (const cat of CATEGORIES) {
        const catBtn = sidebar.querySelector(`button[data-cat="${cat.id}"]`);
        assert.ok(catBtn, `Category button for ${cat.id} must exist`);
      }
    });

    it('2.2: Category selection activates correct tab and updates visible defect list', async () => {
      const app = createAppInstance();
      const cameraBtn = app.document.querySelector('#sidebarNav button[data-cat="camera"]');
      cameraBtn.click();
      await waitAsync(40);

      // Verify active category styling
      assert.ok(cameraBtn.classList.contains('border-l-4'), 'Camera category should have border-l-4 active indicator');

      // Verify StatsDashboard updates category label
      const stats = app.document.querySelector('#statsDashboard');
      assert.ok(stats.textContent.includes('Camera Systems') || stats.textContent.includes('Camera'), 'Stats should display active category');

      // Verify subchips are hidden for camera
      const subchips = app.document.querySelector('#subchips');
      assert.ok(subchips.classList.contains('hidden'), 'Subchips should be hidden when camera is selected');
    });

    it('2.3: Panel Codes category displays CodeSubChips and allows subcategory filtering', async () => {
      const app = createAppInstance();
      const codesBtn = app.document.querySelector('#sidebarNav button[data-cat="codes"]');
      codesBtn.click();
      await waitAsync(40);

      const subchips = app.document.querySelector('#subchips');
      assert.ok(subchips.classList.contains('flex'), 'Subchips should have flex class when codes category is active');

      // Test clicking subcategory chips
      for (const sub of CODE_SUBS) {
        const subBtn = subchips.querySelector(`button[data-sub="${sub}"]`);
        assert.ok(subBtn, `Subchip button for ${sub} must exist`);
        subBtn.click();
        await waitAsync(30);
        assert.ok(subBtn.classList.contains('active'), `Subchip ${sub} should be active`);
      }
    });

    it('2.4: Category count pills display accurate monospace badges', () => {
      const app = createAppInstance();
      const allCountPill = app.document.querySelector('button[data-cat="all"] span.font-mono');
      assert.ok(allCountPill, 'All count pill must exist');
      const countVal = parseInt(allCountPill.textContent.trim(), 10);
      assert.ok(countVal >= 135, `Total count should be >= 135, got ${countVal}`);
    });
  });

  describe('3. Custom Pin Folders Stress Testing', () => {
    it('3.1: Preloaded and created pin folders render with color indicators and item count', async () => {
      const customFolder = {
        id: 'f_stress_1',
        name: 'Stress Test Folder',
        color: '#f59e0b',
        itemIds: [101, 102, 103],
        createdAt: Date.now(),
      };
      const app = createAppInstance({
        initialStorage: {
          'qc-pin-folders': JSON.stringify([customFolder]),
        },
      });

      const folderBtn = app.document.querySelector('button[data-folder="f_stress_1"]');
      assert.ok(folderBtn, 'Created folder should appear in sidebar');
      assert.ok(folderBtn.textContent.includes('Stress Test Folder'), 'Folder name should match');
      assert.ok(folderBtn.textContent.includes('3'), 'Folder badge count should match 3 itemIds');

      // Verify localStorage persistence
      const savedFolders = JSON.parse(app.window.localStorage.getItem('qc-pin-folders') || '[]');
      assert.equal(savedFolders.length, 1);
      assert.equal(savedFolders[0].name, 'Stress Test Folder');
    });

    it('3.2: Pin folder filtering and active indicator bar', async () => {
      const customFolder = {
        id: 'f_test_1',
        name: 'Urgent Defects',
        color: '#ef4444',
        itemIds: [101, 102],
        createdAt: Date.now(),
      };
      const app = createAppInstance({
        initialStorage: {
          'qc-pin-folders': JSON.stringify([customFolder]),
        },
      });

      const folderBtn = app.document.querySelector('button[data-folder="f_test_1"]');
      assert.ok(folderBtn, 'Folder button must exist');
      
      folderBtn.click();
      await waitAsync(40);

      assert.ok(folderBtn.classList.contains('bg-stone-800'), 'Selected folder should have active background');
      assert.equal(folderBtn.style.borderLeftColor, 'rgb(239, 68, 68)');
    });

    it('3.3: Delete pin folder triggers confirmation and removes folder from storage', async () => {
      const customFolder = {
        id: 'f_del_1',
        name: 'To Delete',
        color: '#71717a',
        itemIds: [101],
        createdAt: Date.now(),
      };
      const app = createAppInstance({
        initialStorage: {
          'qc-pin-folders': JSON.stringify([customFolder]),
        },
      });

      // Mock window.confirm to return true
      app.window.confirm = () => true;

      const deleteBtn = app.document.querySelector('button[data-folder="f_del_1"] span[title="Delete folder"]');
      assert.ok(deleteBtn, 'Delete folder button must exist');
      deleteBtn.click();
      await waitAsync(50);

      const savedFolders = JSON.parse(app.window.localStorage.getItem('qc-pin-folders') || '[]');
      assert.equal(savedFolders.length, 0, 'Folder should be deleted from storage');
    });
  });

  describe('4. StatsDashboard De-Cluttering & Metrics Verification', () => {
    it('4.1: StatsDashboard displays compact single-line status metrics without bulky Card', () => {
      const app = createAppInstance();
      const stats = app.document.querySelector('#statsDashboard');
      assert.ok(stats, '#statsDashboard must exist');
      assert.equal(stats.getAttribute('data-testid'), 'stats-dashboard');

      // Metric elements
      assert.ok(stats.textContent.includes('Defects'), 'Must show defect count');
      assert.ok(stats.textContent.includes('Categories'), 'Must show categories count');
      assert.ok(stats.textContent.includes('Starred'), 'Must show starred count');

      // Check no disallowed backdrop-blur classes
      assert.ok(!stats.className.includes('backdrop-blur'), 'StatsDashboard must not use backdrop-blur');
    });

    it('4.2: StatsDashboard updates dynamically on search filter and category selection', async () => {
      const app = createAppInstance();
      app.search('camera');
      await waitAsync(50);

      const stats = app.document.querySelector('#statsDashboard');
      assert.ok(stats.textContent.includes('Query: "camera"'), 'Stats dashboard should show active query filter badge');
    });
  });

  describe('5. Responsive Collapse & Mobile Drawer', () => {
    it('5.1: Mobile hamburger button toggles sidebar drawer translate class', async () => {
      const app = createAppInstance();
      const toggleBtn = app.document.querySelector('#appHeader button[aria-label="Toggle navigation"]');
      assert.ok(toggleBtn, 'Mobile hamburger button must exist');

      const sidebar = app.document.querySelector('#sidebarNav');
      assert.ok(sidebar.classList.contains('-translate-x-full'), 'Sidebar should initially be hidden offscreen on mobile');

      // Toggle open
      toggleBtn.click();
      await waitAsync(40);
      assert.ok(sidebar.classList.contains('translate-x-0'), 'Sidebar should slide in with translate-x-0');

      // Toggle close
      toggleBtn.click();
      await waitAsync(40);
      assert.ok(sidebar.classList.contains('-translate-x-full'), 'Sidebar should slide out with -translate-x-full');
    });
  });
});
