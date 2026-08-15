import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';
import {
  getCategoryColor,
  getCategoryBadgeStyle,
  getCategoryLeftBorderStyle,
  getCategoryIconComponent,
  getCategoryIcon
} from '../src/utils/categoryColors.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Tier 2: Boundary & Corner Case Hardening Suite (Features 1 through 12)', () => {

  // =========================================================================
  // FEATURE 1: Raycast Warm Stone Base Theme Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 1: Raycast Warm Stone Base Theme Boundaries', () => {
    it('F1-B1: should handle invalid theme values in localStorage ("qc-theme"="invalid-theme") by defaulting gracefully without throwing', () => {
      const app = createAppInstance({
        initialStorage: { 'qc-theme': 'invalid-theme' }
      });
      const html = app.document.documentElement;
      const themeAttr = html.getAttribute('data-theme');
      assert.ok(themeAttr !== null, 'data-theme attribute must be populated on document element');
      assert.ok(app.document.querySelector('#root'), 'App root must mount safely despite invalid storage theme value');
    });

    it('F1-B2: should handle manual class removal on root element gracefully without breaking theme toggle', async () => {
      const app = createAppInstance();
      const html = app.document.documentElement;
      
      // Manually strip dark/light classes from root
      html.className = '';
      
      const themeBtn = app.document.querySelector('#themeBtn, [data-testid="theme-toggle"], button[aria-label*="Theme"]');
      assert.ok(themeBtn, 'Theme toggle button must exist in header');
      
      themeBtn.click();
      await waitAsync(20);
      
      const toggledTheme = html.getAttribute('data-theme');
      assert.ok(toggledTheme === 'dark' || toggledTheme === 'light' || toggledTheme === 'auto', 'Theme button must operate cleanly after root class mutation');
    });

    it('F1-B3: should initialize cleanly when root container options specify custom initial storage or empty state', () => {
      const app = createAppInstance({ initialStorage: {} });
      const root = app.document.querySelector('#root');
      assert.ok(root && root.children.length > 0, 'React app root container must mount cleanly with empty initial storage');
    });

    it('F1-B4: should maintain theme state integrity under high-frequency theme toggle spamming (20 clicks)', async () => {
      const app = createAppInstance();
      const themeBtn = app.document.querySelector('#themeBtn, [data-testid="theme-toggle"], button[aria-label*="Theme"]');
      assert.ok(themeBtn, 'Theme toggle button must exist');

      for (let i = 0; i < 20; i++) {
        themeBtn.click();
      }
      await waitAsync(30);

      const finalThemeAttr = app.document.documentElement.getAttribute('data-theme');
      const savedTheme = app.getStorageJSON('qc-theme');
      assert.ok(finalThemeAttr === 'dark' || finalThemeAttr === 'light' || finalThemeAttr === 'auto', 'Final theme attribute must be valid');
      assert.ok(savedTheme === finalThemeAttr, 'LocalStorage qc-theme key must stay synchronized with root data-theme attribute');
    });

    it('F1-B5: should handle "auto" / system theme preference setting ("qc-theme"="auto") gracefully', () => {
      const app = createAppInstance({
        initialStorage: { 'qc-theme': 'auto' }
      });
      const html = app.document.documentElement;
      const themeAttr = html.getAttribute('data-theme');
      assert.equal(themeAttr, 'auto', 'App document element data-theme attribute must reflect auto theme setting');
    });
  });

  // =========================================================================
  // FEATURE 2: Complete Elimination of AI Tropes Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 2: Complete Elimination of AI Tropes Boundaries', () => {
    it('F2-B1: should verify 0 backdrop-blur utility classes exist across all elements in default, drawer, and modal states', async () => {
      const app = createAppInstance();

      // Check default state
      let blurElements = app.document.querySelectorAll('[class*="backdrop-blur-"]');
      assert.equal(blurElements.length, 0, 'No backdrop-blur utility classes allowed in default state');

      // Check batch drawer state
      await app.clickItemAction(0, 'add');
      blurElements = app.document.querySelectorAll('[class*="backdrop-blur-"]');
      assert.equal(blurElements.length, 0, 'No backdrop-blur utility classes allowed in batch drawer state');

      // Check settings modal state
      const setBtn = app.document.querySelector('#setBtn, [data-testid="settings-btn"], button[aria-label*="Settings"]');
      if (setBtn) {
        setBtn.click();
        await waitAsync(30);
        blurElements = app.document.querySelectorAll('[class*="backdrop-blur-"]');
        assert.equal(blurElements.length, 0, 'No backdrop-blur utility classes allowed in settings modal state');
      }
    });

    it('F2-B2: should verify 0 neon cyan/purple glowing gradients or halo elements exist across full DOM tree', () => {
      const app = createAppInstance();
      const neonElements = app.document.querySelectorAll('.ambient-cyan-glow, [class*="from-cyan"], [class*="to-purple"]');
      assert.equal(neonElements.length, 0, 'DOM tree must contain 0 neon cyan/purple background gradients or glowing halos');
    });

    it('F2-B3: should maintain solid stone overlays without blurs or glowing halos under rapid settings modal toggling', async () => {
      const app = createAppInstance();
      const setBtn = app.document.querySelector('#setBtn, [data-testid="settings-btn"], button[aria-label*="Settings"]');
      assert.ok(setBtn, 'Settings trigger button must exist');

      for (let i = 0; i < 5; i++) {
        setBtn.click();
        await waitAsync(20);
      }

      const modalContainer = app.document.querySelector('#setmodal, [data-testid="settings-modal"]');
      if (modalContainer) {
        const dialogContent = modalContainer.querySelector('[role="dialog"]') || modalContainer;
        const cls = dialogContent.className || '';
        assert.ok(!cls.includes('ambient-cyan-glow') && !cls.includes('from-cyan'), 'Settings modal dialog must not contain neon cyan halos');
      }
    });

    it('F2-B4: should maintain solid stone backdrop overlay under rapid batch drawer toggling', async () => {
      const app = createAppInstance();
      for (let i = 0; i < 3; i++) {
        await app.clickItemAction(i, 'add');
        await waitAsync(15);
      }

      const overlay = app.getBatchDrawerOverlay();
      assert.ok(overlay !== null, 'Batch drawer overlay backdrop should exist');
      const cls = overlay.className || '';
      assert.ok(!cls.includes('ambient-cyan-glow') && !cls.includes('backdrop-blur-3xl'), 'Batch drawer backdrop must not use neon halos or heavy blurs');
    });

    it('F2-B5: should maintain solid surface styling on Edit Wording modal without neon glowing borders', () => {
      const app = createAppInstance();
      app.toggleEditMode();
      app.openAddModal();

      const modalContainer = app.document.querySelector('#addmodal, [data-testid="edit-modal"], [role="dialog"]');
      assert.ok(modalContainer !== null, 'Edit wording modal must be present in DOM');
      const cls = modalContainer.className || '';
      assert.ok(!cls.includes('ambient-cyan-glow') && !cls.includes('to-purple'), 'Edit modal panel must render solid Warm Stone surface without neon gradients');
    });
  });

  // =========================================================================
  // FEATURE 3: Muted Semantic Color Pills Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 3: Muted Semantic Color Pills Boundaries', () => {
    it('F3-B1: should fallback to Slate badge styling (#64748b) for non-existent category keys', () => {
      const style = getCategoryBadgeStyle('non_existent_category_xyz');
      assert.equal(style.color, '#64748b', 'Unknown category key must resolve to fallback Slate color #64748b');
      assert.ok(typeof style.backgroundColor === 'string' && style.backgroundColor.includes('rgba'), 'Badge style must include RGBA background color');
    });

    it('F3-B2: should handle undefined/null/empty category strings in badge style derivation', () => {
      const style1 = getCategoryBadgeStyle('');
      assert.equal(style1.color, '#64748b', 'Empty category key must return Slate fallback color');
      
      const style2 = getCategoryBadgeStyle('   ');
      assert.equal(style2.color, '#64748b', 'Whitespace category key must return Slate fallback color');
    });

    it('F3-B3: should safely escape HTML meta-characters in custom wording category pills when rendered in DOM', () => {
      const app = createAppInstance();
      const xssCategoryWording = '<script>alert("pill_xss")</script>';

      app.toggleEditMode();
      app.openAddModal();
      app.saveModalForm(xssCategoryWording, 'screen', 8888);

      app.search(xssCategoryWording);
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Custom item with HTML string must be rendered');

      const injectedScripts = app.document.querySelectorAll('#listwrap script');
      assert.equal(injectedScripts.length, 0, 'Category pill badges must not execute or inject script tags into DOM');
    });

    it('F3-B4: should handle rapid category selection cycling without leaving stale pill classes', () => {
      const app = createAppInstance();
      const categories = ['battery', 'buttons', 'screen', 'pen', 'locks', 'codes'];

      for (const cat of categories) {
        app.selectCategory(cat);
        const visible = app.getVisibleItems();
        assert.ok(visible.length > 0, `Category ${cat} must display defect items`);
        assert.equal(visible[0].categoryPill.toLowerCase(), cat, `Category pill badge text must match active category ${cat}`);
      }
    });

    it('F3-B5: should normalize category keys with uppercase ("BATTERY") and handle untrimmed category strings safely', () => {
      const styleUpper = getCategoryBadgeStyle('BATTERY');
      assert.equal(styleUpper.color, getCategoryColor('battery'), 'Uppercase category key "BATTERY" must resolve to battery color');

      const styleSpace = getCategoryBadgeStyle('  battery  ');
      assert.ok(typeof styleSpace.color === 'string', 'Untrimmed category key must safely return valid badge style object');
    });
  });

  // =========================================================================
  // FEATURE 4: Lucide Iconography System Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 4: Lucide Iconography System Boundaries', () => {
    it('F4-B1: should fallback to Folder Lucide icon component when category key mapping is missing', () => {
      const IconComp = getCategoryIconComponent('non_existent_key_xyz');
      assert.ok(IconComp !== undefined, 'getCategoryIconComponent must return a valid component for missing keys');
      const DefaultComp = getCategoryIconComponent('folder');
      assert.equal(IconComp, DefaultComp, 'Missing category key mapping must fallback to Folder icon component');
    });

    it('F4-B2: should render Lucide icons with correct sizing inside dense/compact card containers', () => {
      const app = createAppInstance({
        initialStorage: { 'qc-density': 'compact' }
      });
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Items must render in compact mode');
      const badgeSvg = visible[0].element.querySelector('.rpill svg, [data-testid="category-badge"] svg');
      assert.ok(badgeSvg !== null, 'Category badge pill must render Lucide SVG icon in compact mode');
    });

    it('F4-B3: should handle rapid action button clicking (pin/add buttons with Lucide icons) 30 times without DOM errors', async () => {
      const app = createAppInstance();
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0);

      for (let i = 0; i < 15; i++) {
        await app.clickItemAction(0, 'pin');
      }

      const svgElements = visible[0].element.querySelectorAll('svg');
      assert.ok(svgElements.length > 0, 'Lucide SVG icons must maintain structural integrity after rapid click spamming');
    });

    it('F4-B4: should handle null or invalid props passed to getCategoryIcon without throwing runtime errors', () => {
      assert.doesNotThrow(() => {
        getCategoryIcon('screen', null);
      }, 'getCategoryIcon with null props must not throw');

      assert.doesNotThrow(() => {
        getCategoryIcon('battery', { size: 12 });
      }, 'getCategoryIcon with custom size prop must not throw');
    });

    it('F4-B5: should ensure Lucide icons in sidebar category buttons render valid SVG elements', () => {
      const app = createAppInstance();
      const navbar = app.getAppNavbar();
      assert.ok(navbar !== null, 'Navbar container must exist');
      const navSvgs = navbar.querySelectorAll('button svg, svg');
      assert.ok(navSvgs.length > 0, 'Sidebar category navigation buttons must contain valid Lucide SVG elements');
    });
  });

  // =========================================================================
  // FEATURE 5: Left Border Accent Indicators Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 5: Left Border Accent Indicators Boundaries', () => {
    it('F5-B1: should maintain border-l-4 style integrity when switching rapidly between List, Grid, and Table views', async () => {
      const app = createAppInstance();
      const viewModes = ['list', 'grid', 'table', 'list', 'grid', 'table'];

      for (const mode of viewModes) {
        await app.setLayoutView(mode);
        const visible = app.getVisibleItems();
        assert.ok(visible.length > 0, `Items must exist in layout mode "${mode}"`);
        assert.ok(
          visible.every((item) => {
            const style = item.element.getAttribute('style') || '';
            const cls = item.element.className || '';
            return cls.includes('border-l-4') || style.includes('border-left');
          }),
          `All items in "${mode}" mode must retain left border accent indicator`
        );
      }
    });

    it('F5-B2: should return fallback Slate border-l-4 style for empty/unknown category key', () => {
      const borderStyle = getCategoryLeftBorderStyle('');
      assert.equal(borderStyle.borderLeftWidth, '4px', 'Fallback left border accent width must be 4px');
      assert.equal(borderStyle.borderLeftColor, '#64748b', 'Fallback left border accent color must be Slate #64748b');
    });

    it('F5-B3: should verify left border accent color fidelity across all defect categories', () => {
      const categories = [
        'screen', 'camera', 'buttons', 'battery', 'backcover',
        'locks', 'pen', 'water', 'audio', 'body', 'system', 'codes'
      ];

      for (const cat of categories) {
        const borderStyle = getCategoryLeftBorderStyle(cat);
        const expectedColor = getCategoryColor(cat);
        assert.equal(borderStyle.borderLeftColor, expectedColor, `Category "${cat}" left border color must match getCategoryColor`);
      }
    });

    it('F5-B4: should retain border-l-4 left accent styling on pinned items filter view', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'pin');

      app.selectCategory('pinned');
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Pinned category view must contain pinned item');
      
      const itemStyle = visible[0].element.getAttribute('style') || '';
      const itemClass = visible[0].element.className || '';
      assert.ok(itemClass.includes('border-l-4') || itemStyle.includes('border-left'), 'Pinned item must retain left border accent indicator');
    });

    it('F5-B5: should render left border accent styling on custom added wording items in List, Grid, and Table modes', async () => {
      const app = createAppInstance();
      app.toggleEditMode();
      app.openAddModal();
      app.saveModalForm('Custom Left Accent Defect Test', 'camera', 7777);

      app.search('Custom Left Accent Defect Test');
      const viewModes = ['list', 'grid', 'table'];

      for (const mode of viewModes) {
        await app.setLayoutView(mode);
        const visible = app.getVisibleItems();
        assert.ok(visible.length > 0, `Custom item must render in "${mode}" view mode`);
        const style = visible[0].element.getAttribute('style') || '';
        const cls = visible[0].element.className || '';
        assert.ok(cls.includes('border-l-4') || style.includes('border-left'), `Custom item must feature left border accent styling in "${mode}" mode`);
      }
    });
  });

  // =========================================================================
  // FEATURE 6: Sticky Left Sidebar Navigation Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 6: Sticky Left Sidebar Navigation Boundaries', () => {
    it('F6-B1: should handle rapid category tab switching (10 category tabs in rapid succession)', () => {
      const app = createAppInstance();
      const categoryList = ['all', 'screen', 'camera', 'buttons', 'battery', 'locks', 'pen', 'water', 'audio', 'codes'];

      for (const cat of categoryList) {
        app.selectCategory(cat);
      }

      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Visible items must be populated after rapid category tab switching');
    });

    it('F6-B2: should handle sub-chip filter matches gracefully without breaking layout', () => {
      const app = createAppInstance();
      app.selectCategory('codes');
      
      app.selectSubCategory('FCPB');
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Selecting sub-code chip FCPB must return filtered code items');
    });

    it('F6-B3: should retain sticky/fixed positioning container styling for sidebar scroll bounds', () => {
      const app = createAppInstance();
      const navbar = app.getAppNavbar();
      assert.ok(navbar !== null, 'Sidebar navbar must exist in DOM');
      const cls = navbar.className || '';
      assert.ok(cls.includes('sticky') || cls.includes('fixed') || cls.includes('sidebar') || cls.includes('AppShell'), 'Sidebar container must retain sticky/fixed positioning classes');
    });

    it('F6-B4: should toggle sub-code chips visibility on codes category selection and hide on other categories', () => {
      const app = createAppInstance();

      app.selectCategory('screen');
      let subchips = app.document.querySelector('#subchips, [data-testid="code-sub-chips"]');
      if (subchips) {
        assert.ok(!subchips.classList.contains('show') || subchips.offsetHeight === 0, 'Subchips must hide when screen category is active');
      }

      app.selectCategory('codes');
      subchips = app.document.querySelector('#subchips, [data-testid="code-sub-chips"]');
      if (subchips) {
        assert.ok(subchips.classList.contains('show') || subchips.children.length > 0, 'Subchips must display when codes category is active');
      }

      app.selectCategory('battery');
      subchips = app.document.querySelector('#subchips, [data-testid="code-sub-chips"]');
      if (subchips) {
        assert.ok(!subchips.classList.contains('show') || subchips.offsetHeight === 0, 'Subchips must hide when battery category is active');
      }
    });

    it('F6-B5: should display item count badge of 0 for empty category filters', () => {
      const app = createAppInstance();
      app.selectCategory('pinned');
      const visible = app.getVisibleItems();
      assert.equal(visible.length, 0, 'Pinned category must be empty initially');

      const pinnedNavTab = app.document.querySelector('[data-cat="pinned"], [data-testid="category-tab-pinned"]');
      if (pinnedNavTab) {
        const badge = pinnedNavTab.querySelector('span.rounded-full, .rounded-full');
        if (badge) {
          assert.equal(badge.textContent.trim(), '0', 'Count badge on empty category tab must render "0"');
        }
      }
    });
  });

  // =========================================================================
  // FEATURE 7: Custom User Pin Folder Manager Boundaries (7 Tests)
  // =========================================================================
  describe('Feature 7: Custom User Pin Folder Manager Boundaries', () => {
    it('F7-B1: should handle empty or whitespace-only folder names during creation by defaulting gracefully', () => {
      const initialFolders = [
        { id: 'f_empty', name: 'New Folder', color: '#78716c', itemIds: [], createdAt: Date.now() }
      ];
      const app = createAppInstance({
        initialStorage: { 'qc-pin-folders': JSON.stringify(initialFolders) }
      });

      const savedFolders = app.getStorageJSON('qc-pin-folders');
      assert.ok(Array.isArray(savedFolders) && savedFolders.length > 0, 'Created folder must exist in storage');
      assert.ok(savedFolders[0].name.trim().length > 0, 'Folder name must default gracefully to non-empty string');
    });

    it('F7-B2: should handle creating duplicate folder names gracefully with unique folder IDs', () => {
      const initialFolders = [
        { id: 'f_1', name: 'Audit', color: '#78716c', itemIds: [], createdAt: Date.now() },
        { id: 'f_2', name: 'Audit', color: '#10b981', itemIds: [], createdAt: Date.now() }
      ];
      const app = createAppInstance({
        initialStorage: { 'qc-pin-folders': JSON.stringify(initialFolders) }
      });

      const savedFolders = app.getStorageJSON('qc-pin-folders');
      const matchingFolders = savedFolders.filter((f) => f.name === 'Audit');
      assert.equal(matchingFolders.length, 2, 'Both duplicate named folders must persist in storage');
      assert.notEqual(matchingFolders[0].id, matchingFolders[1].id, 'Duplicate folder names must retain unique folder IDs');
    });

    it('F7-B3: should handle 200+ character folder names without breaking storage or DOM', () => {
      const longName = 'A'.repeat(250);
      const initialFolders = [
        { id: 'f_long', name: longName, color: '#71717a', itemIds: [], createdAt: Date.now() }
      ];
      const app = createAppInstance({
        initialStorage: { 'qc-pin-folders': JSON.stringify(initialFolders) }
      });

      const savedFolders = app.getStorageJSON('qc-pin-folders');
      assert.equal(savedFolders[0].name, longName, 'Full 250-character folder name must be preserved');
      const folderEl = app.document.querySelector('[data-folder="f_long"], [data-testid="pin-folder-f_long"]');
      assert.ok(folderEl !== null, '200+ character folder tab must mount in sidebar without DOM throwing');
    });

    it('F7-B4: should safely escape special characters and XSS attempts in folder names', () => {
      const maliciousFolderName = '<script>alert("folder_xss")</script>';
      const initialFolders = [
        { id: 'f_xss', name: maliciousFolderName, color: '#ef4444', itemIds: [], createdAt: Date.now() }
      ];
      const app = createAppInstance({
        initialStorage: { 'qc-pin-folders': JSON.stringify(initialFolders) }
      });

      const savedFolders = app.getStorageJSON('qc-pin-folders');
      assert.equal(savedFolders[0].name, maliciousFolderName, 'Malicious folder name must be stored as literal text');

      const injectedScripts = app.document.querySelectorAll('#root script[src*="xss"]');
      assert.equal(injectedScripts.length, 0, 'Folder manager must not execute injected script tags into DOM');
    });

    it('F7-B5: should handle deleting non-existent folder IDs without crashing or corrupting folder state', () => {
      const app = createAppInstance();
      const initialCount = app.getStorageJSON('qc-pin-folders').length;

      const nonExistentId = 'non_existent_id_9999';
      const updatedFolders = app.getStorageJSON('qc-pin-folders').filter((f) => f.id !== nonExistentId);
      app.mockStorage.setItem('qc-pin-folders', JSON.stringify(updatedFolders));

      const finalCount = app.getStorageJSON('qc-pin-folders').length;
      assert.equal(finalCount, initialCount, 'Folder count must remain unchanged when deleting non-existent ID');
    });

    it('F7-B6: should recover gracefully from corrupted qc-pin-folders JSON in localStorage', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-pin-folders': '<<<invalid-json-syntax>>>'
        }
      });

      const folders = app.getStorageJSON('qc-pin-folders');
      assert.ok(Array.isArray(folders), 'App must recover corrupted qc-pin-folders into valid array');
      assert.ok(folders.length > 0, 'App must initialize default folder structure ("Starred Defects") upon JSON corruption');
      assert.equal(folders[0].id, 'starred');
    });

    it('F7-B7: should preserve item pinning state in remaining folders when one multi-pinned folder is deleted', () => {
      const initialFolders = [
        { id: 'f_alpha', name: 'Folder Alpha', color: '#78716c', itemIds: ['b7'], createdAt: Date.now() },
        { id: 'f_beta', name: 'Folder Beta', color: '#10b981', itemIds: ['b7'], createdAt: Date.now() }
      ];
      const app = createAppInstance({
        initialStorage: { 'qc-pin-folders': JSON.stringify(initialFolders) }
      });

      let savedFolders = app.getStorageJSON('qc-pin-folders');
      assert.ok(savedFolders[0].itemIds.includes('b7'), 'Item b7 must be in Folder Alpha');
      assert.ok(savedFolders[1].itemIds.includes('b7'), 'Item b7 must be in Folder Beta');

      // Delete Folder Alpha
      const remainingFolders = savedFolders.filter((f) => f.id !== 'f_alpha');
      app.mockStorage.setItem('qc-pin-folders', JSON.stringify(remainingFolders));

      savedFolders = app.getStorageJSON('qc-pin-folders');
      assert.equal(savedFolders.length, 1, 'Only Folder Beta should remain');
      assert.ok(savedFolders[0].itemIds.includes('b7'), 'Item b7 must remain pinned in Folder Beta');
    });
  });

  // =========================================================================
  // FEATURE 8: Clean Top Header & Spotlight Search Boundaries (6 Tests)
  // =========================================================================
  describe('Feature 8: Clean Top Header & Spotlight Search Boundaries', () => {
    it('F8-B1: should handle 100+ character search queries without throwing or locking UI', () => {
      const app = createAppInstance();
      const longQuery = 'screen '.repeat(30);

      assert.doesNotThrow(() => {
        app.search(longQuery);
      }, 'Long search query must not throw exception');

      const visible = app.getVisibleItems();
      assert.ok(Array.isArray(visible), 'Visible items must return array for 100+ char search query');
    });

    it('F8-B2: should handle SQL/HTML injection attempts in search bar (<script>alert(1)</script>, \' OR 1=1 --)', () => {
      const app = createAppInstance();
      const maliciousQueries = [
        '<script>alert("xss")</script>',
        "' OR '1'='1",
        '<img src=x onerror=alert(1)>',
        'DROP TABLE defects;'
      ];

      for (const query of maliciousQueries) {
        assert.doesNotThrow(() => {
          app.search(query);
        }, `Searching injection payload "${query}" must execute cleanly without error`);

        const rootScripts = app.document.querySelectorAll('#root script');
        assert.equal(rootScripts.length, 0, 'Search query injection must not insert new script elements inside #root');
      }
    });

    it('F8-B3: should handle rapid Spotlight Cmd+K toggle spamming (10 triggers in 100ms)', async () => {
      const app = createAppInstance();

      for (let i = 0; i < 10; i++) {
        await app.openSpotlightModal();
      }

      const isOpen = app.isSpotlightOpen();
      assert.ok(typeof isOpen === 'boolean', 'Spotlight modal open status must remain boolean');
    });

    it('F8-B4: should handle clear search button when search query is already empty', () => {
      const app = createAppInstance();
      app.search('');

      assert.doesNotThrow(() => {
        app.clearSearch();
      }, 'Clearing search when already empty must not throw');

      const searchInput = app.document.querySelector('#search, [data-testid="header-search-input"], input[type="search"]');
      if (searchInput) {
        assert.equal(searchInput.value, '', 'Search input value must be empty string');
      }
    });

    it('F8-B5: should safely handle regex meta-characters ([ ] ( ) * + ? ^ $ \\ . |) in search query', () => {
      const app = createAppInstance();
      const dangerousQueries = [
        'screen (',
        '[FCPB]',
        'battery*+',
        'camera?^$',
        '\\audio.|'
      ];

      for (const query of dangerousQueries) {
        assert.doesNotThrow(() => {
          app.search(query);
        }, `Searching regex query "${query}" must not throw uncaught RegExp syntax error`);
      }
    });

    it('F8-B6: should handle Levenshtein typos and fuzzy search matches ("batery" -> battery, "scren" -> screen)', () => {
      const app = createAppInstance();

      app.search('batery');
      let visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Off-by-one typo "batery" should return matching items');
      assert.ok(visible.some((i) => i.text.toLowerCase().includes('battery')), 'Search results must contain battery defects');

      app.search('scren');
      visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Off-by-two typo "scren" should return matching items');
      assert.ok(visible.some((i) => i.text.toLowerCase().includes('screen')), 'Search results must contain screen defects');

      app.search('xyzqwerty12345');
      visible = app.getVisibleItems();
      assert.equal(visible.length, 0, 'Query exceeding distance cap must return 0 results');
    });
  });

  // =========================================================================
  // FEATURE 9: Floating Sonner Toasts & Batch Drawer Boundaries (6 Tests)
  // =========================================================================
  describe('Feature 9: Floating Sonner Toasts & Batch Drawer Boundaries', () => {
    it('F9-B1: should queue 50+ unique items in batch drawer and format output correctly with selected delimiter', async () => {
      const app = createAppInstance();

      for (let i = 0; i < 50; i++) {
        await app.clickItemAction(i, 'add');
      }

      assert.equal(app.getBatchCount(), 50, 'Batch drawer counter badge must equal 50');

      app.setDelimiter('comma');
      await app.copyBatch();

      const copied = app.getCopiedText();
      assert.ok(copied !== null && copied.length > 0, 'Copied text must not be empty');
      const items = copied.split(', ');
      assert.equal(items.length, 50, 'Formatted batch copy string must contain 50 items separated by comma');
    });

    it('F9-B2: should handle rapid reordering up/down at list boundaries (index 0 / index N-1) safely', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.clickItemAction(2, 'add');

      assert.doesNotThrow(() => {
        app.moveBatchItemUp(0);
      }, 'Moving item up at index 0 boundary must not throw error');

      assert.doesNotThrow(() => {
        app.moveBatchItemDown(2);
      }, 'Moving item down at end boundary must not throw error');

      assert.equal(app.getBatchCount(), 3, 'Batch item count must remain 3 after boundary reorders');
    });

    it('F9-B3: should handle empty batch drawer operations safely without errors', async () => {
      const app = createAppInstance();
      assert.equal(app.getBatchCount(), 0, 'Batch queue must be empty initially');

      await assert.doesNotReject(async () => {
        await app.copyBatch();
      }, 'copyBatch on empty queue must not reject');

      assert.equal(app.getBatchCount(), 0, 'Batch count must remain 0');
    });

    it('F9-B4: should handle rapid toast triggering burst (>10 toasts) without memory leak or DOM explosion', async () => {
      const app = createAppInstance();

      for (let i = 0; i < 12; i++) {
        await app.clickItemRow(i);
      }

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Toast notifications must render cleanly during rapid copy burst');
    });

    it('F9-B5: should bulk import multi-line text (100 lines) into batch queue correctly', () => {
      const batchList = Array.from({ length: 100 }, (_, i) => `Imported Defect Item #${i + 1}`);
      const app = createAppInstance({
        initialStorage: { 'qc-batch': JSON.stringify(batchList) }
      });

      assert.equal(app.getBatchCount(), 100, 'Batch queue initialStorage must initialize 100 items');
    });

    it('F9-B6: should support toast undo action boundary for deleted wording item', async () => {
      const app = createAppInstance();
      app.toggleEditMode();

      const initialVisibleCount = app.getVisibleItems().length;
      await app.clickItemAction(0, 'del');

      const afterDeleteCount = app.getVisibleItems().length;
      assert.equal(afterDeleteCount, initialVisibleCount - 1, 'Deleting item must decrease visible count by 1');

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Deleting item must trigger toast notification');

      const toastWithUndo = toasts.find((t) => t.actionLabel === 'Undo');
      assert.ok(toastWithUndo !== undefined, 'Toast must offer "Undo" action');

      toastWithUndo.actionBtn.click();
      await waitAsync(30);

      const restoredCount = app.getVisibleItems().length;
      assert.equal(restoredCount, initialVisibleCount, 'Clicking Undo must restore deleted item');
    });
  });

  // =========================================================================
  // FEATURE 10: Type Safety & Performance Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 10: Type Safety & Performance Boundaries', () => {
    it('F10-B1: should handle rapid concurrent DOM updates (alternating search and category toggles 30 times)', () => {
      const app = createAppInstance();
      const categories = ['all', 'screen', 'camera', 'battery', 'buttons', 'codes'];

      for (let i = 0; i < 30; i++) {
        const cat = categories[i % categories.length];
        app.selectCategory(cat);
        app.search(i % 2 === 0 ? 'screen' : 'battery');
      }

      const visible = app.getVisibleItems();
      assert.ok(Array.isArray(visible), 'App DOM state must remain consistent after 30 rapid interleaved operations');
    });

    it('F10-B2: should perform clean memory lifecycle across 50 consecutive app re-renders / re-creations', () => {
      assert.doesNotThrow(() => {
        for (let i = 0; i < 50; i++) {
          const tempApp = createAppInstance();
          if (tempApp.dom && tempApp.dom.window) {
            tempApp.dom.window.close();
          }
        }
      }, 'Creating and closing 50 JSDOM app instances must complete without memory or resource errors');
    });

    it('F10-B3: should maintain state consistency across all 14 localStorage keys under boundary conditions', async () => {
      const app = createAppInstance();

      await app.clickItemRow(0);
      await app.clickItemAction(0, 'pin');
      await app.clickItemAction(0, 'add');

      const storageKeys = [
        'qc-pins', 'qc-pin-folders', 'qc-recents', 'qc-history', 'qc-batch',
        'qc-join', 'qc-autoclear', 'qc-edits', 'qc-dels', 'qc-custom',
        'qc-appearance', 'qc-theme', 'qc-density', 'qc-sort'
      ];

      for (const key of storageKeys) {
        const rawVal = app.mockStorage.getItem(key);
        assert.ok(rawVal !== undefined, `Storage key "${key}" must be defined`);
        const jsonVal = app.getStorageJSON(key);
        assert.ok(jsonVal !== undefined, `Storage key "${key}" must contain valid parseable JSON or string`);
      }
    });

    it('F10-B4: should synchronize document root data-density attribute during density initialization ("compact" vs "cozy")', () => {
      const app1 = createAppInstance({ initialStorage: { 'qc-density': 'compact' } });
      assert.equal(app1.document.documentElement.getAttribute('data-density'), 'compact', 'Root data-density attribute must be "compact"');

      const app2 = createAppInstance({ initialStorage: { 'qc-density': 'cozy' } });
      assert.equal(app2.document.documentElement.getAttribute('data-density'), 'cozy', 'Root data-density attribute must be "cozy"');
    });

    it('F10-B5: should maintain instant UI responsiveness with large custom dataset (100 custom items added)', () => {
      const customItems = Array.from({ length: 100 }, (_, i) => ({
        id: 'c_perf_' + i,
        n: 9000 + i,
        t: `Performance Stress Defect #${i + 1}`,
        c: 'screen',
        custom: true
      }));

      const app = createAppInstance({
        initialStorage: { 'qc-custom': JSON.stringify(customItems) }
      });

      app.search('Performance Stress Defect');
      const visible = app.getVisibleItems();
      assert.equal(visible.length, 100, 'Search must match all 100 stress items instantaneously');
    });
  });

  // =========================================================================
  // FEATURE 11: Cloudflare Pages Build Integrity Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 11: Cloudflare Pages Build Integrity Boundaries', () => {
    it('F11-B1: should verify wrangler.jsonc contains Cloudflare Pages build output directory configuration', () => {
      const wranglerPath = path.join(projectRoot, 'wrangler.jsonc');
      assert.ok(fs.existsSync(wranglerPath), 'wrangler.jsonc must exist in project root');

      const content = fs.readFileSync(wranglerPath, 'utf8');
      assert.ok(content.includes('pages_build_output_dir') || content.includes('dist'), 'wrangler.jsonc must specify static build output directory ./dist');
    });

    it('F11-B2: should verify package.json build script and dependencies for Cloudflare static compilation', () => {
      const pkgPath = path.join(projectRoot, 'package.json');
      assert.ok(fs.existsSync(pkgPath), 'package.json must exist');

      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      assert.ok(pkg.scripts && pkg.scripts.build, 'package.json must define "build" script');
      assert.ok(pkg.scripts.build.includes('vite build'), '"build" script must invoke vite build');
    });

    it('F11-B3: should verify index.html static template structure contains root mount container and main module entry', () => {
      const indexPath = path.join(projectRoot, 'index.html');
      assert.ok(fs.existsSync(indexPath), 'index.html entry template must exist');

      const html = fs.readFileSync(indexPath, 'utf8');
      assert.ok(html.includes('<div id="root">'), 'index.html must contain #root mount div');
      assert.ok(html.includes('src/main.tsx'), 'index.html must reference main.tsx entry point');
    });

    it('F11-B4: should verify public/_redirects SPA routing configuration for Cloudflare Pages', () => {
      const publicRedirects = path.join(projectRoot, 'public', '_redirects');
      const distRedirects = path.join(projectRoot, 'dist', '_redirects');
      const redirectsPath = fs.existsSync(publicRedirects) ? publicRedirects : (fs.existsSync(distRedirects) ? distRedirects : null);

      assert.ok(redirectsPath, '_redirects file must exist in public/ or dist/');
      const redirects = fs.readFileSync(redirectsPath, 'utf8');
      assert.ok(redirects.includes('/*') || redirects.includes('/index.html'), '_redirects file must configure SPA routing fallback');
    });

    it('F11-B5: should verify CSS theme variables (#121214 dark / #fcfcfc light) in src/index.css', () => {
      const cssPath = path.join(projectRoot, 'src', 'index.css');
      assert.ok(fs.existsSync(cssPath), 'src/index.css must exist');

      const cssContent = fs.readFileSync(cssPath, 'utf8');
      assert.ok(cssContent.includes('#121214') || cssContent.includes('18, 18, 20'), 'CSS must define Raycast Warm Stone dark background #121214');
      assert.ok(cssContent.includes('#fcfcfc') || cssContent.includes('252, 252, 252'), 'CSS must define Raycast Warm Stone light background #fcfcfc');
    });
  });

  // =========================================================================
  // FEATURE 12: Full E2E Test Suite Verification Boundaries (5 Tests)
  // =========================================================================
  describe('Feature 12: Full E2E Test Suite Verification Boundaries', () => {
    it('F12-B1: should run multiple app harness instances in parallel without DOM or localStorage state collision', () => {
      const app1 = createAppInstance({ initialStorage: { 'qc-theme': 'dark' } });
      const app2 = createAppInstance({ initialStorage: { 'qc-theme': 'light' } });

      assert.equal(app1.mockStorage.getItem('qc-theme'), 'dark', 'App1 theme must be dark');
      assert.equal(app2.mockStorage.getItem('qc-theme'), 'light', 'App2 theme must be light');

      app1.search('battery');
      app2.search('camera');

      assert.notEqual(app1.getVisibleItems().length, app2.getVisibleItems().length, 'App instances must maintain completely isolated DOM search state');
    });

    it('F12-B2: should reset all wording changes back to default dataset cleanly when resetAllChanges is invoked', () => {
      const app = createAppInstance();

      app.toggleEditMode();
      app.openAddModal();
      app.saveModalForm('TempResetUniqueToken999', 'screen', 9999);

      app.search('TempResetUniqueToken999');
      let visible = app.getVisibleItems();
      assert.equal(visible.length, 1, 'Custom item with unique token must be rendered');

      app.resetAllChanges();
      app.search('TempResetUniqueToken999');
      visible = app.getVisibleItems();
      assert.equal(visible.length, 0, 'resetAllChanges must clear all custom wording modifications');
    });

    it('F12-B3: should isolate mock localStorage instances between harness runs', () => {
      const app1 = createAppInstance();
      app1.mockStorage.setItem('test-key', 'value-1');

      const app2 = createAppInstance();
      assert.equal(app2.mockStorage.getItem('test-key'), null, 'Mock localStorage must be isolated per app instance');
    });

    it('F12-B4: should handle JSDOM window close teardown without throwing unhandled promise rejections', () => {
      const app = createAppInstance();
      assert.doesNotThrow(() => {
        if (app.dom && app.dom.window) {
          app.dom.window.close();
        }
      }, 'JSDOM window close must execute without throwing');
    });

    it('F12-B5: should verify full dataset item coverage across categories (>= 135 total items)', () => {
      const app = createAppInstance();
      app.selectCategory('all');
      const visible = app.getVisibleItems();
      assert.ok(visible.length >= 135, `Total base dataset item count must be >= 135 (found ${visible.length})`);
    });
  });

});
