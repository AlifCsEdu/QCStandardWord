import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone M1 Empirical Challenger Verification Suite', () => {

  // =========================================================================
  // 1. StatsDashboard De-Cluttering & Unified Status Strip Verification
  // =========================================================================
  describe('1. StatsDashboard De-Cluttering & Unified Status Strip', () => {
    it('1.1: should render sleek #statsDashboard container with correct testids and styling', () => {
      const app = createAppInstance();
      const stats = app.document.querySelector('#statsDashboard');
      assert.ok(stats, 'Element #statsDashboard must exist in DOM');
      assert.equal(stats.getAttribute('data-testid'), 'stats-dashboard', 'Must have data-testid="stats-dashboard"');
      assert.ok(stats.classList.contains('stats-dashboard'), 'Must have .stats-dashboard class');

      // Verify no heavy card class or bulky styling
      const className = stats.className || '';
      assert.ok(!className.includes('backdrop-blur'), 'StatsDashboard must not contain backdrop-blur');
      assert.ok(!className.includes('m-4 p-3 sm:p-4'), 'StatsDashboard must not use bulky margin/padding');
    });

    it('1.2: should correctly display pluralized and singular defect count metrics', () => {
      const app = createAppInstance();
      const stats = app.document.querySelector('#statsDashboard');
      assert.ok(stats, '#statsDashboard should exist');
      
      const textContent = stats.textContent || '';
      assert.match(textContent, /\d+\s+Defects?/, 'Should display total defect count with Defect/Defects');
      assert.match(textContent, /12 Categories|Starred|Batch/, 'Should display compact metrics');
    });

    it('1.3: should render active filter pills dynamically when category, subcategory, or query is set', async () => {
      const app = createAppInstance();
      
      // Filter by category 'camera'
      app.selectCategory('camera');
      await waitAsync(30);
      let stats = app.document.querySelector('#statsDashboard');
      let textContent = stats.textContent || '';
      assert.ok(textContent.includes('Camera') || textContent.includes('camera'), 'Filter pill should show Camera category');

      // Filter by category 'codes' and select subcategory
      app.selectCategory('codes');
      app.selectSubCategory('FCPB');
      await waitAsync(30);
      stats = app.document.querySelector('#statsDashboard');
      textContent = stats.textContent || '';
      assert.ok(textContent.includes('FCPB') || textContent.includes('codes'), 'Filter pill should show subcategory FCPB');

      // Type search query
      app.search('battery');
      await waitAsync(30);
      stats = app.document.querySelector('#statsDashboard');
      textContent = stats.textContent || '';
      assert.ok(textContent.includes('battery') || textContent.includes('Query:'), 'Filter pill should show search query');
    });
  });

  // =========================================================================
  // 2. AppHeader Layout, Search & Action Button Contracts
  // =========================================================================
  describe('2. AppHeader Layout, Search & Action Button Contracts', () => {
    it('2.1: should render #appHeader with 3-column structure and brand elements', () => {
      const app = createAppInstance();
      const header = app.document.querySelector('#appHeader');
      assert.ok(header, '#appHeader must exist');
      assert.equal(header.getAttribute('data-testid'), 'app-header', 'Must have data-testid="app-header"');
      assert.ok(header.classList.contains('sticky'), 'Header must be sticky top-0');

      // Verify Brand Title & Version
      const heading = header.querySelector('h1');
      assert.ok(heading, 'Header brand h1 must exist');
      assert.equal(heading.textContent?.trim(), 'QC Standard Wording', 'Brand title must match');
      assert.ok(header.textContent?.includes('v2.0'), 'Version badge v2.0 must be displayed');
    });

    it('2.2: should render hero search input #search with data-testid and clear button interactions', async () => {
      const app = createAppInstance();
      const searchInput = app.document.querySelector('#search');
      assert.ok(searchInput, 'Search input #search must exist');
      assert.equal(searchInput.getAttribute('data-testid'), 'header-search-input', 'Must have data-testid="header-search-input"');

      // Initially clearBtn should not exist when query is empty
      let clearBtn = app.document.querySelector('#clearBtn');
      assert.equal(clearBtn, null, 'Clear button should not render when search query is empty');

      // Type into search
      app.search('display');
      await waitAsync(30);
      clearBtn = app.document.querySelector('#clearBtn');
      assert.ok(clearBtn, 'Clear button #clearBtn must render when search query is present');
      assert.equal(clearBtn.getAttribute('data-testid'), 'clear-search-btn', 'Must have data-testid="clear-search-btn"');

      // Click clear button
      clearBtn.click();
      await waitAsync(30);
      assert.equal(searchInput.value, '', 'Search query should be cleared after clicking #clearBtn');
    });

    it('2.3: should render Spotlight Trigger #spotlightBtn with ⌘K badge', () => {
      const app = createAppInstance();
      const spotlightBtn = app.document.querySelector('#spotlightBtn');
      assert.ok(spotlightBtn, 'Spotlight button #spotlightBtn must exist');
      assert.equal(spotlightBtn.getAttribute('data-testid'), 'spotlight-trigger', 'Must have data-testid="spotlight-trigger"');
      assert.ok(spotlightBtn.textContent?.includes('⌘K'), 'Must contain ⌘K shortcut badge');
    });

    it('2.4: should render #setLayout view switcher with list, grid, table buttons and active states', async () => {
      const app = createAppInstance();
      const setLayout = app.document.querySelector('#setLayout');
      assert.ok(setLayout, '#setLayout view switcher must exist');
      assert.equal(setLayout.getAttribute('data-testid'), 'view-switcher', 'Must have data-testid="view-switcher"');

      const modes = ['list', 'grid', 'table'];
      for (const mode of modes) {
        const btn = setLayout.querySelector(`button[data-v="${mode}"]`);
        assert.ok(btn, `View switcher must have button for data-v="${mode}"`);
        assert.equal(btn.getAttribute('data-value'), mode, `Button must have data-value="${mode}"`);

        // Click mode
        btn.click();
        await waitAsync(30);
        const htmlLayout = app.document.documentElement.getAttribute('data-layout') || 'list';
        assert.equal(htmlLayout, mode, `Layout mode attribute on root should switch to ${mode}`);
      }
    });

    it('2.5: should render #editBtn, #batchBtn with #bcount, #setBtn, #dlBtn, #themeBtn', async () => {
      const app = createAppInstance();
      
      const editBtn = app.document.querySelector('#editBtn');
      assert.ok(editBtn, '#editBtn must exist');
      
      // Toggle edit mode
      editBtn.click();
      await waitAsync(30);
      assert.ok(editBtn.classList.contains('on'), '#editBtn must have .on class when active');

      const batchBtn = app.document.querySelector('#batchBtn');
      assert.ok(batchBtn, '#batchBtn must exist');
      const bcount = batchBtn.querySelector('#bcount');
      assert.ok(bcount, '#bcount must exist inside #batchBtn');
      assert.equal(bcount.textContent?.trim(), '0', 'Initial batch count should be 0');

      // Add item to batch and check #bcount updates
      await app.clickItemAction(0, 'add');
      assert.equal(bcount.textContent?.trim(), '1', 'Batch count should update to 1');

      const setBtn = app.document.querySelector('#setBtn');
      assert.ok(setBtn, '#setBtn settings button must exist');

      const dlBtn = app.document.querySelector('#dlBtn');
      assert.ok(dlBtn, '#dlBtn offline download button must exist');

      const themeBtn = app.document.querySelector('#themeBtn');
      assert.ok(themeBtn, '#themeBtn theme button must exist');
    });
  });

  // =========================================================================
  // 3. CategoryChips & CodeSubChips Navigation Contracts
  // =========================================================================
  describe('3. Sticky Sidebar Navigation & Pin Folders', () => {
    it('3.1: should render sticky sidebar #sidebarNav with data-testid="app-navbar"', () => {
      const app = createAppInstance();
      const sidebar = app.document.querySelector('#sidebarNav');
      assert.ok(sidebar, '#sidebarNav must exist');
      assert.equal(sidebar.getAttribute('data-testid'), 'app-navbar', 'Must have data-testid="app-navbar"');
      assert.ok(sidebar.classList.contains('sidebar-nav'), 'Must have .sidebar-nav class');
    });

    it('3.2: should render Quick Views with active indicator border-l-4 and rounded-full count badges', async () => {
      const app = createAppInstance();
      const allTab = app.document.querySelector('button[data-cat="all"]');
      assert.ok(allTab, 'Category tab "all" must exist');
      assert.equal(allTab.getAttribute('data-testid'), 'category-tab-all', 'Must have data-testid="category-tab-all"');
      assert.ok(allTab.classList.contains('border-l-4'), 'Active tab must have border-l-4 indicator');

      const countPill = allTab.querySelector('span.rounded-full');
      assert.ok(countPill, 'Count pill span.rounded-full must exist');
      assert.ok(Number(countPill.textContent) > 0, 'Total count pill must be > 0');

      // Switch to pinned
      const pinnedTab = app.document.querySelector('button[data-cat="pinned"]');
      assert.ok(pinnedTab, 'Category tab "pinned" must exist');
      pinnedTab.click();
      await waitAsync(30);
      assert.ok(pinnedTab.classList.contains('border-l-4'), 'Pinned tab must have border-l-4 indicator when active');
    });

    it('3.3: should manage Pin Folders creation, selection, and counts', async () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-pin-folders': JSON.stringify([
            { id: 'f-test-1', name: 'Urgent Defects', color: '#ef4444', itemIds: ['1', '2'] }
          ])
        }
      });

      const folderBtn = app.document.querySelector('button[data-folder="f-test-1"]');
      assert.ok(folderBtn, 'Custom folder button must exist in sidebar');
      assert.equal(folderBtn.getAttribute('data-testid'), 'pin-folder-f-test-1', 'Must have data-testid="pin-folder-f-test-1"');

      // Check item count inside folder pill
      const countSpan = folderBtn.querySelector('span.font-mono');
      assert.ok(countSpan, 'Folder count span must exist');
      assert.equal(countSpan.textContent?.trim(), '2', 'Folder count must equal 2');

      // Click folder
      folderBtn.click();
      await waitAsync(30);
      assert.equal(app.getStorageJSON('qc-pin-folders')?.length, 1, 'Folder should remain intact');
    });

    it('3.4: should render #subchips with data-testid="code-sub-chips" when codes category is active', async () => {
      const app = createAppInstance();
      let subchips = app.document.querySelector('#subchips');
      assert.ok(subchips, '#subchips container must exist in DOM');
      assert.equal(subchips.getAttribute('data-testid'), 'code-sub-chips', 'Must have data-testid="code-sub-chips"');
      assert.ok(subchips.classList.contains('hidden'), 'Subchips should be hidden when selectedCategory is not "codes"');

      // Select 'codes' category
      app.selectCategory('codes');
      await waitAsync(30);
      subchips = app.document.querySelector('#subchips');
      assert.ok(subchips.classList.contains('flex') && !subchips.classList.contains('hidden'), 'Subchips should be visible when "codes" is active');

      // Verify subcategory buttons
      const subs = ['ALL', 'FCPB', 'FCPW', 'FCPC', 'RCPB', 'RCPW', 'RCPC', 'FCDS', 'RCDS', 'PC'];
      for (const sub of subs) {
        const btn = subchips.querySelector(`button[data-sub="${sub}"]`);
        assert.ok(btn, `Subchip button data-sub="${sub}" must exist`);
      }
    });
  });

  // =========================================================================
  // 4. Aesthetic Integrity & AI Tropes Disallowance
  // =========================================================================
  describe('4. Aesthetic Integrity & Disallowed Utility Classes', () => {
    it('4.1: should not contain any backdrop-blur-* classes in header, stats, or sidebar', () => {
      const app = createAppInstance();
      const header = app.document.querySelector('#appHeader');
      const stats = app.document.querySelector('#statsDashboard');
      const sidebar = app.document.querySelector('#sidebarNav');

      const checkNoBlur = (el, name) => {
        if (!el) return;
        const cls = el.className || '';
        assert.ok(!cls.includes('backdrop-blur'), `${name} root must not contain backdrop-blur`);
        const descendants = el.querySelectorAll('*');
        for (const d of descendants) {
          const dcls = d.className || '';
          if (typeof dcls === 'string') {
            assert.ok(!dcls.includes('backdrop-blur'), `${name} child must not contain backdrop-blur: ${dcls}`);
          }
        }
      };

      checkNoBlur(header, 'AppHeader');
      checkNoBlur(stats, 'StatsDashboard');
      checkNoBlur(sidebar, 'SidebarNav');
    });
  });
});
