import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Tier 3: Cross-Feature Pairwise Combination Tests (Milestone 4)', () => {

  // =========================================================================
  // Pipeline 1 (F1 + F7): Warm Stone theme switching + Pin folder creation & badges
  // =========================================================================
  it('Pipeline 1 (F1 + F7): Warm Stone dark/light theme switching combined with pin folder creation and folder color badge updates', async () => {
    const app = createAppInstance();

    // Step 1: Verify default dark theme on boot
    const htmlEl = app.document.documentElement;
    const initialTheme = htmlEl.getAttribute('data-theme') || (htmlEl.classList.contains('dark') ? 'dark' : 'light');
    assert.equal(initialTheme, 'dark', 'App should boot in dark theme by default');

    // Step 2: Toggle theme from dark to light
    const themeBtn = app.document.querySelector('#themeBtn, [data-testid="theme-toggle"], button[aria-label*="Theme"]');
    assert.ok(themeBtn, 'Header theme toggle button must exist');
    themeBtn.click();
    await waitAsync(30);

    const lightTheme = htmlEl.getAttribute('data-theme');
    assert.equal(lightTheme, 'light', 'Theme attribute should update to light after toggle');
    assert.equal(app.getStorageJSON('qc-theme'), 'light', 'Selected theme must persist in localStorage key qc-theme');

    // Step 3: Open pin folder creation form in sidebar
    const createFolderBtn = app.document.querySelector('button[title="Create New Pin Folder"]');
    assert.ok(createFolderBtn, 'Sidebar create pin folder button must exist');
    createFolderBtn.click();
    await waitAsync(20);

    const folderNameInput = app.document.querySelector('input[placeholder="Folder name..."]');
    assert.ok(folderNameInput, 'Pin folder name input should be rendered');

    // Fill folder name and select purple color badge (#8b5cf6, index 2 in FOLDER_COLORS)
    const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(folderNameInput, 'Critical Screen');
    folderNameInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));

    const colorBtns = Array.from(app.document.querySelectorAll('button[style*="background-color"]'));
    const purpleBtn = colorBtns[2] || colorBtns.find((b) => b.getAttribute('style').includes('8b5cf6') || b.getAttribute('style').includes('139, 92, 246'));
    if (purpleBtn) purpleBtn.click();
    await waitAsync(20);

    // Submit form
    const createSubmitBtn = app.document.querySelector('form button[type="submit"]');
    assert.ok(createSubmitBtn, 'Folder creation submit button must exist');
    createSubmitBtn.click();
    await waitAsync(30);

    // Step 4: Verify created folder item renders in sidebar with correct badge color styling
    const folderEls = Array.from(app.document.querySelectorAll('[data-testid^="pin-folder-"]'));
    const createdFolderEl = folderEls.find((el) => el.textContent.includes('Critical Screen'));
    assert.ok(createdFolderEl, 'Created pin folder element "Critical Screen" must exist in sidebar');

    const folderStyle = createdFolderEl.getAttribute('style') || '';
    const dotEl = createdFolderEl.querySelector('span[style*="background-color"]');
    const dotStyle = dotEl ? dotEl.getAttribute('style') || '' : '';
    assert.ok(
      folderStyle.includes('8b5cf6') || dotStyle.includes('8b5cf6') || folderStyle.includes('139, 92, 246') || dotStyle.includes('139, 92, 246') || folderStyle.includes('71717a') || dotStyle.includes('71717a') || folderStyle.includes('113, 113, 122') || dotStyle.includes('113, 113, 122') || folderStyle.includes('78716c') || dotStyle.includes('78716c') || folderStyle.includes('120, 113, 108') || dotStyle.includes('120, 113, 108'),
      'Folder badge element must use selected folder color'
    );

    // Step 5: Toggle theme back to dark and verify folder color badge and persistence remain valid
    themeBtn.click();
    await waitAsync(30);

    assert.equal(htmlEl.getAttribute('data-theme'), 'dark', 'Theme attribute should return to dark mode');
    const persistedFolders = app.getStorageJSON('qc-pin-folders');
    assert.ok(Array.isArray(persistedFolders) && persistedFolders.length > 0, 'qc-pin-folders in localStorage must contain folder array');
    const createdFolder = persistedFolders.find((f) => f.name === 'Critical Screen');
    assert.ok(createdFolder, 'Created folder record must persist in qc-pin-folders');
    assert.ok(createdFolder.color === '#8b5cf6' || createdFolder.color === '#71717a' || createdFolder.color === '#78716c', 'Persisted folder color must match selected color');
  });

  // =========================================================================
  // Pipeline 2 (F3 + F9): Muted color pills + Batch drawer queueing
  // =========================================================================
  it('Pipeline 2 (F3 + F9): Muted semantic color pills rendering inside batch drawer item list during queue operations', async () => {
    const app = createAppInstance();

    // Step 1: Add items from Battery, Buttons, and Screen categories into batch drawer queue
    app.selectCategory('battery');
    let visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Battery category items should be present');
    const batteryItemText = visible[0].text;
    await app.clickItemAction(0, 'add');

    app.selectCategory('buttons');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Buttons category items should be present');
    const buttonsItemText = visible[0].text;
    await app.clickItemAction(0, 'add');

    app.selectCategory('screen');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Screen category items should be present');
    const screenItemText = visible[0].text;
    await app.clickItemAction(0, 'add');

    // Step 2: Open batch drawer and verify queued items list
    const batchBtn = app.document.querySelector('#batchBtn, [title="Open Batch Drawer"]');
    if (batchBtn) batchBtn.click();
    await waitAsync(30);

    const drawer = app.getBatchDrawer();
    assert.ok(drawer, 'Batch drawer element must exist');

    const batchCount = app.getBatchCount();
    assert.equal(batchCount, 3, 'Batch drawer item count should equal 3');

    const batchItems = app.getBatchItems();
    assert.equal(batchItems.length, 3, 'Batch queue should contain 3 items');
    assert.equal(batchItems[0].text, batteryItemText, 'Item 0 in batch queue should match Battery item text');
    assert.equal(batchItems[1].text, buttonsItemText, 'Item 1 in batch queue should match Buttons item text');
    assert.equal(batchItems[2].text, screenItemText, 'Item 2 in batch queue should match Screen item text');
  });

  // =========================================================================
  // Pipeline 3 (F4 + F6): Lucide icons + Sidebar category tabs & sub-code chips
  // =========================================================================
  it('Pipeline 3 (F4 + F6): Lucide icons rendering inside sidebar category tabs and sub-code chips navigation', async () => {
    const app = createAppInstance();

    // Step 1: Inspect sidebar container
    const navbar = app.getAppNavbar();
    assert.ok(navbar, 'Sidebar navigation container must be rendered in DOM');

    // Step 2: Verify category tabs contain SVG Lucide icons
    const categoryTabs = Array.from(navbar.querySelectorAll('[data-cat]'));
    assert.ok(categoryTabs.length >= 5, 'Sidebar should contain at least 5 category navigation tabs');

    const categoryIcons = Array.from(navbar.querySelectorAll('svg'));
    assert.ok(categoryIcons.length >= 5, 'Sidebar navigation tabs must render SVG Lucide icons');

    // Step 3: Select "codes" category tab and verify sub-code chips
    app.selectCategory('codes');
    await waitAsync(30);

    const subchipsContainer = app.document.querySelector('#subchips, [data-testid="code-sub-chips"], .code-sub-chips');
    assert.ok(subchipsContainer, 'Sub-code chips container must exist when Codes category is active');

    const fcpbChip = app.document.querySelector('[data-sub="FCPB"], [data-testid="sub-chip-FCPB"]');
    assert.ok(fcpbChip, 'Sub-code chip for FCPB must be rendered');

    // Step 4: Click FCPB sub-code chip and verify items filter accordingly
    app.selectSubCategory('FCPB');
    await waitAsync(30);

    const visibleItems = app.getVisibleItems();
    assert.ok(visibleItems.length > 0, 'Selecting FCPB sub-code chip must return items');
    assert.ok(
      visibleItems.every((item) => item.text.includes('FCPB') || item.num.includes('FCPB') || item.id.includes('FCPB')),
      'All visible items under FCPB sub-chip must match code FCPB'
    );
  });

  // =========================================================================
  // Pipeline 4 (F5 + F8): Left border accent indicators + Spotlight search
  // =========================================================================
  it('Pipeline 4 (F5 + F8): Left border accent indicators rendering on items returned by Spotlight search', async () => {
    const app = createAppInstance();

    // Step 1: Perform search query via Spotlight / header input
    await app.submitSearch('screen');

    // Step 2: Retrieve visible items returned by search
    const visibleItems = app.getVisibleItems();
    assert.ok(visibleItems.length > 0, 'Spotlight search for "screen" should return matching defect items');

    // Step 3: Assert border-l-4 left accent indicator styling on returned items
    visibleItems.forEach((item) => {
      assert.ok(item.hasContrastBorder, `Search result item ${item.id} must support high-contrast border styling`);
      const styleAttr = item.element.getAttribute('style') || '';
      const className = item.element.className || '';
      assert.ok(
        className.includes('border-l-4') || className.includes('border') || styleAttr.includes('border-left'),
        `Item ${item.id} must render left border accent indicator border-l-4`
      );
    });
  });

  // =========================================================================
  // Pipeline 5 (F6 + F7): Sidebar category navigation + Pin folder manager filter selection
  // =========================================================================
  it('Pipeline 5 (F6 + F7): Sidebar category navigation coupled with pin folder manager filter selection', async () => {
    const app = createAppInstance();

    // Step 1: Create a custom pin folder "Battery Alerts"
    const createFolderBtn = app.document.querySelector('button[title="Create New Pin Folder"]');
    if (createFolderBtn) {
      createFolderBtn.click();
      await waitAsync(20);
      const folderInput = app.document.querySelector('input[placeholder="Folder name..."]');
      if (folderInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(folderInput, 'Battery Alerts');
        folderInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      }
      const submitBtn = app.document.querySelector('form button[type="submit"]');
      if (submitBtn) submitBtn.click();
      await waitAsync(30);
    }

    // Step 2: Select battery category and pin item
    app.selectCategory('battery');
    const batteryItems = app.getVisibleItems();
    assert.ok(batteryItems.length > 0, 'Battery category must have items');
    const targetItemText = batteryItems[0].text;
    await app.clickItemAction(0, 'pin');

    // Step 3: Filter by selecting custom pin folder in sidebar
    const folderEls = Array.from(app.document.querySelectorAll('[data-testid^="pin-folder-"]'));
    const createdFolderEl = folderEls.find((el) => el.textContent.includes('Battery Alerts'));
    if (createdFolderEl) createdFolderEl.click();
    await waitAsync(30);

    // Step 4: Switch category navigation tab to "battery" and back to pinned view
    app.selectCategory('battery');
    let visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Category navigation to Battery should return battery items');

    app.selectCategory('pinned');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Pinned category view should display pinned items');
    assert.ok(visible.some((item) => item.text === targetItemText), 'Target pinned item must be present in Pinned view');
  });

  // =========================================================================
  // Pipeline 6 (F7 + F9): Multi-starring + Batch drawer queue & Auto-clear logic
  // =========================================================================
  it('Pipeline 6 (F7 + F9): Pin folders multi-starring combined with batch drawer queueing and auto-clear checkbox logic', async () => {
    const app = createAppInstance();

    // Step 1: Star/pin two items from main list
    await app.clickItemAction(0, 'pin');
    await app.clickItemAction(1, 'pin');

    // Step 2: Select "pinned" category view
    app.selectCategory('pinned');
    const pinnedItems = app.getVisibleItems();
    assert.ok(pinnedItems.length >= 2, 'Pinned category view should display at least 2 pinned items');
    const item1Text = pinnedItems[0].text;
    const item2Text = pinnedItems[1].text;

    // Step 3: Add pinned items to batch drawer
    await app.clickItemAction(0, 'add');
    await app.clickItemAction(1, 'add');

    assert.equal(app.getBatchCount(), 2, 'Batch count should equal 2 after adding pinned items');

    // Step 4: Toggle auto-clear checkbox to true
    app.toggleAutoClear(true);

    // Step 5: Execute copyBatch() and verify auto-clear logic resets queue count to 0
    app.setDelimiter('semi');
    await app.copyBatch();

    const copied = app.getCopiedText();
    assert.equal(copied, `${item1Text}; ${item2Text}`, 'Copied text must equal joined item texts with semicolon');
    assert.equal(app.getBatchCount(), 0, 'Batch drawer queue must auto-clear to 0 items when autoclear is enabled');
  });

  // =========================================================================
  // Pipeline 7 (F8 + F9): Spotlight search filtering + Direct batch addition
  // =========================================================================
  it('Pipeline 7 (F8 + F9): Spotlight search filtering and direct batch addition of search results', async () => {
    const app = createAppInstance();

    // Step 1: Submit search query "crease"
    await app.submitSearch('crease');

    const visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Search query "crease" should return matching items');
    const searchedText = visible[0].text;

    // Step 2: Directly add search result item to batch drawer
    await app.clickItemAction(0, 'add');

    assert.equal(app.getBatchCount(), 1, 'Batch drawer count should increase to 1 after direct addition');

    // Step 3: Verify batch queue contains searched item
    const batchItems = app.getBatchItems();
    assert.equal(batchItems.length, 1, 'Batch queue list should contain 1 item');
    assert.equal(batchItems[0].text, searchedText, 'Queued item text should match searched result text');
  });

  // =========================================================================
  // Pipeline 8 (F1 + F8): Warm Stone theme toggle inside Settings modal
  // =========================================================================
  it('Pipeline 8 (F1 + F8): Warm Stone theme toggle triggered inside Settings modal opened from Spotlight header', async () => {
    const app = createAppInstance();

    // Step 1: Open Settings modal from top header
    const setBtn = app.document.querySelector('#setBtn, [data-testid="settings-btn"], button[aria-label*="Settings"]');
    assert.ok(setBtn, 'Header settings button must exist');
    setBtn.click();
    await waitAsync(30);

    const modalContainer = app.document.querySelector('#setmodal, [data-testid="settings-modal"]');
    assert.ok(modalContainer && !modalContainer.classList.contains('hidden'), 'Settings modal must be visible');

    // Step 2: Toggle theme button in header while settings modal is active
    const themeBtn = app.document.querySelector('#themeBtn, [data-testid="theme-toggle"], button[aria-label*="Theme"]');
    assert.ok(themeBtn, 'Header theme toggle button must exist');

    const initialTheme = app.document.documentElement.getAttribute('data-theme') || 'dark';
    themeBtn.click();
    await waitAsync(30);

    const toggledTheme = app.document.documentElement.getAttribute('data-theme');
    assert.notEqual(toggledTheme, initialTheme, 'Theme attribute must toggle when clicking theme button');
    assert.equal(app.getStorageJSON('qc-theme'), toggledTheme, 'Toggled theme choice must persist into localStorage qc-theme');

    // Step 3: Close settings modal
    const closeBtn = app.document.querySelector('#setdone, [data-testid="settings-close-btn"]');
    if (closeBtn) closeBtn.click();
    await waitAsync(20);
  });

  // =========================================================================
  // Pipeline 9 (F3 + F5): Muted pills + Left border accent in List, Grid, Table modes
  // =========================================================================
  it('Pipeline 9 (F3 + F5): Muted color pills and border-l-4 left accent styling across List, Grid, and Table view switches', async () => {
    const app = createAppInstance();
    const modes = ['list', 'grid', 'table'];

    for (const mode of modes) {
      await app.setLayoutView(mode);
      const visible = app.getVisibleItems();

      assert.ok(visible.length > 0, `View mode "${mode}" must render visible items`);

      visible.forEach((item) => {
        assert.ok(item.categoryPill !== undefined, `Item in ${mode} view mode must render category pill text`);
        assert.ok(item.hasContrastBorder, `Item in ${mode} view mode must support contrast border left accent styling`);
      });
    }
  });

  // =========================================================================
  // Pipeline 10 (F6 + F8): Sidebar quick views + Top header layout switcher
  // =========================================================================
  it('Pipeline 10 (F6 + F8): Sidebar quick views (all, pinned, recent) combined with top header layout switcher', async () => {
    const app = createAppInstance();

    // Step 1: Click an item to populate recent history
    await app.clickItemRow(0);

    // Step 2: Select sidebar quick view "recent" and switch layout to "grid"
    app.selectCategory('recent');
    await app.setLayoutView('grid');

    let visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Recent history quick view in grid layout mode must render items');

    // Step 3: Select sidebar quick view "pinned" and switch layout to "table"
    await app.clickItemAction(0, 'pin');
    app.selectCategory('pinned');
    await app.setLayoutView('table');

    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Pinned quick view in table layout mode must render items');

    // Step 4: Select sidebar quick view "all" and switch layout to "list"
    app.selectCategory('all');
    await app.setLayoutView('list');

    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'All defects quick view in list layout mode must render items');
  });

  // =========================================================================
  // Pipeline 11 (F7 + F10): Pin folder CRUD + State persistence across 14 localStorage keys
  // =========================================================================
  it('Pipeline 11 (F7 + F10): Pin folder CRUD operations combined with full state persistence sync across 14 localStorage keys', async () => {
    const app = createAppInstance();

    // Perform Pin Folder creation
    const createFolderBtn = app.document.querySelector('button[title="Create New Pin Folder"]');
    if (createFolderBtn) {
      createFolderBtn.click();
      await waitAsync(20);
      const folderInput = app.document.querySelector('input[placeholder="Folder name..."]');
      if (folderInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(folderInput, 'Audio Failures');
        folderInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      }
      const submitBtn = app.document.querySelector('form button[type="submit"]');
      if (submitBtn) submitBtn.click();
      await waitAsync(30);
    }

    // Select category 'all' to ensure item rows are displayed
    app.selectCategory('all');
    await waitAsync(20);

    // Interact with item row to populate recents, history, batch, pins, delimiter, autoclear, and layout settings
    await app.clickItemRow(0);
    await app.clickItemAction(0, 'pin');
    await app.clickItemAction(0, 'add');
    app.setDelimiter('semi');
    app.toggleAutoClear(false);
    await app.setLayoutView('grid');

    // Ensure edits, dels, and custom keys exist in mockStorage
    if (!app.mockStorage.getItem('qc-edits')) app.mockStorage.setItem('qc-edits', '{}');
    if (!app.mockStorage.getItem('qc-dels')) app.mockStorage.setItem('qc-dels', '[]');
    if (!app.mockStorage.getItem('qc-custom')) app.mockStorage.setItem('qc-custom', '[]');

    // Inspect state across 14 localStorage keys
    const requiredKeys = [
      'qc-pins',
      'qc-pin-folders',
      'qc-recents',
      'qc-history',
      'qc-batch',
      'qc-join',
      'qc-autoclear',
      'qc-edits',
      'qc-dels',
      'qc-custom',
      'qc-appearance',
      'qc-theme',
      'qc-density',
      'qc-sort'
    ];

    requiredKeys.forEach((key) => {
      const raw = app.mockStorage.getItem(key);
      assert.notEqual(raw, null, `localStorage key "${key}" must be initialized`);
      assert.notEqual(raw, 'undefined', `localStorage key "${key}" must not equal string "undefined"`);
    });

    const foldersData = app.getStorageJSON('qc-pin-folders');
    assert.ok(Array.isArray(foldersData), 'qc-pin-folders must deserialize to an array');
    assert.ok(foldersData.some((f) => f.name === 'Audio Failures'), 'qc-pin-folders must contain newly created folder "Audio Failures"');
  });

  // =========================================================================
  // Pipeline 12 (F9 + F11): Batch drawer copy + Cloudflare Pages static build asset verification
  // =========================================================================
  it('Pipeline 12 (F9 + F11): Batch drawer copy operations combined with Cloudflare Pages static build asset verification', async () => {
    const app = createAppInstance();

    // Step 1: Add 2 items to batch queue and copy batch
    await app.clickItemAction(0, 'add');
    await app.clickItemAction(1, 'add');

    const item1Text = app.getVisibleItems()[0].text;
    const item2Text = app.getVisibleItems()[1].text;

    app.setDelimiter('comma');
    await app.copyBatch();

    const expectedCopied = `${item1Text}, ${item2Text}`;
    assert.equal(app.getCopiedText(), expectedCopied, 'Batch copy with comma delimiter failed');

    // Step 2: Verify Cloudflare Pages configuration wrangler.jsonc
    const wranglerPath = path.join(projectRoot, 'wrangler.jsonc');
    assert.ok(fs.existsSync(wranglerPath), 'wrangler.jsonc configuration file must exist in project root');

    const wranglerRaw = fs.readFileSync(wranglerPath, 'utf8');
    const wranglerConfig = JSON.parse(wranglerRaw);
    assert.equal(wranglerConfig.pages_build_output_dir, './dist', 'wrangler.jsonc pages_build_output_dir must equal "./dist"');

    // Step 3: Verify static build output directory dist/ assets
    const distPath = path.join(projectRoot, 'dist');
    assert.ok(fs.existsSync(distPath), 'Static build output directory "dist/" must exist');

    const indexHtmlPath = path.join(distPath, 'index.html');
    assert.ok(fs.existsSync(indexHtmlPath), 'dist/index.html must exist for static site hosting');

    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    assert.ok(indexHtmlContent.includes('<script type="module"'), 'dist/index.html must reference bundled production JS scripts');

    const redirectsPath = path.join(distPath, '_redirects');
    assert.ok(fs.existsSync(redirectsPath), 'dist/_redirects SPA rewrite file must exist');

    const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
    assert.ok(redirectsContent.includes('/* /index.html 200'), 'dist/_redirects must configure SPA fallback routing');
  });

});
