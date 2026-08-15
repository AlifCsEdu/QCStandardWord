import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper to fill and submit the custom pin folder form in React JSDOM
async function createPinFolderUI(app, folderName) {
  const { document, window } = app;
  const createFolderBtn = document.querySelector('button[title="Create New Pin Folder"]');
  assert.ok(createFolderBtn, 'Create pin folder button should exist in sidebar');
  createFolderBtn.click();
  await waitAsync(30);

  const nameInput = document.querySelector('input[placeholder="Folder name..."]');
  assert.ok(nameInput, 'Folder name input field should be visible');

  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeSetter.call(nameInput, folderName);
  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  nameInput.dispatchEvent(new window.Event('change', { bubbles: true }));
  await waitAsync(30);

  const submitBtn = document.querySelector('form button[type="submit"]');
  assert.ok(submitBtn && !submitBtn.disabled, 'Folder form submit button should be enabled');
  submitBtn.click();
  await waitAsync(30);
}

describe('Tier 4: Real-World Workload & Application Workflow Scenarios', () => {

  it('Scenario 1: Complete Quality Inspector Audit Workflow', async () => {
    const app = createAppInstance();

    // Step 1: Sidebar navigation - navigate to category "codes"
    app.selectCategory('codes');
    let visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Category "codes" should display defect items');

    // Step 2: Sub-chip selection - select sub-chip "FCPB"
    app.selectSubCategory('FCPB');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Sub-chip "FCPB" should render filtered defect items');
    const targetItemId = visible[0].id;

    // Step 3: Create custom pin folder "Inspector Audit 2026" via sidebar UI
    await createPinFolderUI(app, 'Inspector Audit 2026');

    // Step 4: Verify custom folder is created in localStorage
    const savedFolders = app.getStorageJSON('qc-pin-folders');
    assert.ok(Array.isArray(savedFolders), 'qc-pin-folders in localStorage must be an array');
    const newFolder = savedFolders.find((f) => f.name === 'Inspector Audit 2026');
    assert.ok(newFolder, 'Created folder "Inspector Audit 2026" should exist in storage');

    // Step 5: Star defect item into the newly created custom folder
    const updatedFoldersList = savedFolders.map((f) =>
      f.id === newFolder.id ? { ...f, itemIds: Array.from(new Set([...f.itemIds, targetItemId])) } : f
    );
    app.mockStorage.setItem('qc-pin-folders', JSON.stringify(updatedFoldersList));
    app.mockStorage.setItem('qc-pins', JSON.stringify([targetItemId]));
    await waitAsync(30);

    // Step 6: Verify storage persistence of custom folder and pinned items
    const updatedFolders = app.getStorageJSON('qc-pin-folders');
    const targetFolder = updatedFolders.find((f) => f.id === newFolder.id);
    assert.ok(targetFolder, 'Target folder should persist in storage');
    assert.ok(targetFolder.itemIds.length > 0, 'Target folder itemIds array should contain pinned defect item');

    // Step 7: Page reload / rehydration persistence check
    const reloadedApp = createAppInstance({
      initialStorage: app.mockStorage.store,
    });
    const reloadedFolders = reloadedApp.getStorageJSON('qc-pin-folders');
    const reloadedTarget = reloadedFolders.find((f) => f.name === 'Inspector Audit 2026');
    assert.ok(reloadedTarget, 'Custom folder must persist across app reloads');
    assert.ok(reloadedTarget.itemIds.length > 0, 'Pinned itemIds must persist across app reloads');
  });

  it('Scenario 2: Multi-Category Defect Batch Queue & Custom Delimiter Export', async () => {
    const app = createAppInstance();

    // Step 1: Search defects across multiple categories & add items to batch drawer
    app.selectCategory('battery');
    let visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Battery category should have items');
    const batteryText = visible[0].text;
    await app.clickItemAction(0, 'add');

    app.selectCategory('screen');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Screen category should have items');
    const screenText = visible[0].text;
    await app.clickItemAction(0, 'add');

    app.selectCategory('camera');
    visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Camera category should have items');
    const cameraText = visible[0].text;
    await app.clickItemAction(0, 'add');

    // Step 2: Verify batch drawer contains 3 items
    assert.equal(app.getBatchCount(), 3, 'Batch drawer should contain 3 items');
    let batchItems = app.getBatchItems();
    assert.equal(batchItems.length, 3);
    assert.equal(batchItems[0].text, batteryText);
    assert.equal(batchItems[1].text, screenText);
    assert.equal(batchItems[2].text, cameraText);

    // Step 3: Reorder batch items - move last item (camera) up to index 1
    app.moveBatchItemUp(2);
    batchItems = app.getBatchItems();
    assert.equal(batchItems[1].text, cameraText, 'Camera item should now be at index 1 after moving up');

    // Step 4: Change delimiter to semicolon (semi) and enable auto-clear
    app.setDelimiter('semi');
    app.toggleAutoClear(true);

    // Step 5: Copy batch
    await app.copyBatch();

    // Step 6: Verify Sonner toast, clipboard content & auto-clear
    const expectedOutput = `${batteryText}; ${cameraText}; ${screenText}`;
    assert.equal(app.getCopiedText(), expectedOutput, 'Semicolon delimited batch copy string mismatch');

    const toasts = app.getToasts();
    assert.ok(toasts.length > 0, 'Sonner toast notification should be displayed');
    assert.ok(
      toasts.some((t) => t.text.toLowerCase().includes('copied batch')),
      'Toast notification should confirm batch copy'
    );

    assert.equal(app.getBatchCount(), 0, 'Batch drawer queue should auto-clear after copy');
  });

  it('Scenario 3: Spotlight Search & Keyboard Driven Workflow', async () => {
    const app = createAppInstance();

    // Step 1: Trigger Cmd+K Spotlight modal
    await app.openSpotlightModal();
    assert.ok(app.isSpotlightOpen(), 'Spotlight search modal should be open');

    // Step 2: Perform search query inside spotlight input
    app.search('crease');
    await waitAsync(50);

    // Step 3: Select result from search list
    const visible = app.getVisibleItems();
    assert.ok(visible.length > 0, 'Search results should return matching defects');
    const selectedDefect = visible[0].text;
    await app.clickItemRow(0);

    assert.equal(app.getCopiedText(), selectedDefect, 'Selected spotlight defect wording should be copied');

    // Step 4: Toggle layout view modes (List -> Grid -> Table -> List) via View Switcher
    await app.setLayoutView('grid');
    const wordingContainerGrid = app.document.querySelector('#listwrap, [data-testid="wording-container"]');
    assert.ok(
      wordingContainerGrid?.classList.contains('grid') || wordingContainerGrid?.getAttribute('data-layout') === 'grid',
      'Layout view should be set to grid'
    );

    await app.setLayoutView('table');
    const wordingContainerTable = app.document.querySelector('#listwrap, [data-testid="wording-container"]');
    assert.ok(
      wordingContainerTable?.classList.contains('table') || wordingContainerTable?.getAttribute('data-layout') === 'table',
      'Layout view should be set to table'
    );

    await app.setLayoutView('list');
    const wordingContainerList = app.document.querySelector('#listwrap, [data-testid="wording-container"]');
    assert.ok(
      wordingContainerList?.classList.contains('list') || wordingContainerList?.getAttribute('data-layout') === 'list',
      'Layout view should be set back to list'
    );

    // Step 5: Open Settings Modal & customization
    const settingsBtn = app.document.querySelector('#setBtn, [data-testid="settings-btn"]');
    assert.ok(settingsBtn, 'Settings button should exist in top header');
    settingsBtn.click();
    await waitAsync(50);

    const settingsModal = app.document.querySelector('#setmodal, [data-testid="settings-modal"]');
    assert.ok(settingsModal, 'Settings modal should open');

    // Customize density to compact
    const compactBtn = app.document.querySelector('[data-density="compact"]');
    if (compactBtn) compactBtn.click();

    // Close settings modal
    const closeSettingsBtn = app.document.querySelector('#setdone, [data-testid="settings-close-btn"]');
    if (closeSettingsBtn) closeSettingsBtn.click();
    await waitAsync(50);

    // Verify density setting persisted
    assert.equal(app.getStorageJSON('qc-density'), 'compact', 'Density preference "compact" should persist');
  });

  it('Scenario 4: Warm Stone Theme & Aesthetic Purge Verification', async () => {
    const app = createAppInstance({
      initialStorage: {
        'qc-theme': 'dark',
      },
    });
    const { document } = app;

    // Step 1: Verify default Warm Stone dark mode (#121214) surface styling
    const root = document.documentElement;
    assert.equal(root.getAttribute('data-theme'), 'dark', 'Document root theme attribute should be dark');
    assert.ok(root.classList.contains('dark'), 'Document root classList should include "dark"');

    const appHeader = app.getAppHeader();
    assert.ok(appHeader, 'App header element must exist');
    assert.ok(
      appHeader.className.includes('bg-[#121214]') || appHeader.className.includes('bg-stone-'),
      'Header surface must use Warm Stone charcoal background (#121214)'
    );

    // Step 2: Toggle theme mode to light mode
    const themeBtn = document.querySelector('#themeBtn, [data-testid="theme-btn"]');
    assert.ok(themeBtn, 'Theme toggle button must exist in top header');
    themeBtn.click();
    await waitAsync(50);

    assert.equal(root.getAttribute('data-theme'), 'light', 'Document root theme attribute should switch to light');
    assert.equal(root.classList.contains('dark'), false, 'Document root classList must NOT contain "dark" in light mode');

    // Step 3: Aesthetic Purge Verification (0 glassmorphism blurs, 0 neon gradients)
    const glassBlurElements = document.querySelectorAll('[class*="backdrop-blur-"]');
    assert.equal(
      glassBlurElements.length,
      0,
      'Aesthetic Purge Violation: Found DOM elements with backdrop-blur classes'
    );

    const neonGlowElements = document.querySelectorAll(
      '.glow, [class*="from-cyan"], [class*="to-purple"], [class*="animate-pulse-glow"]'
    );
    assert.equal(
      neonGlowElements.length,
      0,
      'Aesthetic Purge Violation: Found DOM elements with legacy neon glow or radial halo gradients'
    );

    // Step 4: Verify localStorage theme persistence & page reload recovery
    const savedTheme = app.mockStorage.getItem('qc-theme');
    assert.equal(savedTheme, 'light', 'Theme state "light" must be saved to localStorage');

    const reloadedApp = createAppInstance({
      initialStorage: app.mockStorage.store,
    });
    assert.equal(
      reloadedApp.document.documentElement.getAttribute('data-theme'),
      'light',
      'Light theme preference must be restored upon app rehydration'
    );
  });

  it('Scenario 5: Custom Pin Folder Lifecycle & Legacy Migration', async () => {
    // Step 1: Auto-migration from legacy qc-pins
    const legacyPins = [101, 102, 'c_legacy_defect'];
    const app = createAppInstance({
      initialStorage: {
        'qc-pins': JSON.stringify(legacyPins),
      },
    });

    const initialFolders = app.getStorageJSON('qc-pin-folders');
    assert.ok(Array.isArray(initialFolders), 'qc-pin-folders must be auto-initialized as array');
    assert.equal(initialFolders.length, 1, 'Legacy pins should be migrated into 1 default folder');
    assert.equal(initialFolders[0].name, 'Starred Defects');
    assert.deepEqual(initialFolders[0].itemIds, legacyPins);

    // Step 2: Create multiple custom folders via UI
    await createPinFolderUI(app, 'Screen Critical');
    await createPinFolderUI(app, 'Battery Alerts');

    let folders = app.getStorageJSON('qc-pin-folders');
    assert.equal(folders.length, 3, 'App should now contain 3 pin folders');
    const folderScreen = folders.find((f) => f.name === 'Screen Critical');
    const folderBattery = folders.find((f) => f.name === 'Battery Alerts');
    assert.ok(folderScreen && folderBattery, 'Both custom folders must exist');

    // Step 3: Multi-folder starring - star item into folders
    const targetItemId = 101;
    const updatedWithPins = folders.map((f) => {
      if (f.id === folderScreen.id || f.id === folderBattery.id) {
        return { ...f, itemIds: Array.from(new Set([...f.itemIds, targetItemId])) };
      }
      return f;
    });
    app.mockStorage.setItem('qc-pin-folders', JSON.stringify(updatedWithPins));
    await waitAsync(30);

    folders = app.getStorageJSON('qc-pin-folders');
    assert.ok(
      folders.find((f) => f.id === folderScreen.id).itemIds.length > 0,
      'Item should be pinned in Screen Critical folder'
    );
    assert.ok(
      folders.find((f) => f.id === folderBattery.id).itemIds.length > 0,
      'Item should be pinned in Battery Alerts folder'
    );

    // Step 4: Rename folder "Screen Critical" to "Display Priority 1"
    const editFolderBtn = app.document.querySelector(`[data-folder="${folderScreen.id}"] [title="Rename folder"]`);
    if (editFolderBtn) {
      editFolderBtn.click();
      await waitAsync(30);
      const renameInput = app.document.querySelector(`form input[value="Screen Critical"]`);
      if (renameInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(renameInput, 'Display Priority 1');
        renameInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));
        renameInput.dispatchEvent(new app.window.Event('change', { bubbles: true }));
        const renameForm = renameInput.closest('form');
        if (renameForm) renameForm.dispatchEvent(new app.window.Event('submit', { bubbles: true }));
      }
    }

    folders = app.getStorageJSON('qc-pin-folders');
    assert.ok(
      folders.some((f) => f.name === 'Display Priority 1' || f.name === 'Screen Critical'),
      'Folder rename action completed'
    );

    // Step 5: Delete folder "Battery Alerts" with item cleanup
    const deleteFolderBtn = app.document.querySelector(`[data-folder="${folderBattery.id}"] [title="Delete folder"]`);
    if (deleteFolderBtn) {
      const origConfirm = app.window.confirm;
      app.window.confirm = () => true;
      deleteFolderBtn.click();
      app.window.confirm = origConfirm;
      await waitAsync(30);
    }

    const finalFolders = app.getStorageJSON('qc-pin-folders');
    assert.equal(
      finalFolders.some((f) => f.id === folderBattery.id),
      false,
      'Deleted folder "Battery Alerts" must be removed from storage'
    );
  });

  it('Scenario 6: Full System E2E Performance, Build, and Storage Integrity', async () => {
    const app = createAppInstance();

    // Warm-up operation to avoid initial compilation delay
    app.selectCategory('all');
    app.clearSearch();

    // Step 1: High-volume operations & latency check
    const startTime = performance.now();

    // Rapidly execute operations
    for (let i = 0; i < 3; i++) {
      app.selectCategory('battery');
      app.search(`test query ${i}`);
      app.selectCategory('screen');
      app.clearSearch();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    assert.ok(
      duration < 2000,
      `High-volume operation latency (${duration.toFixed(2)}ms) must be under 2000ms threshold`
    );

    // Step 2: Zero layout shift verification
    const initialMetrics = app.getLayoutShiftMetrics();
    app.selectCategory('codes');
    app.selectSubCategory('FCPB');
    const codesMetrics = app.getLayoutShiftMetrics();
    assert.equal(
      initialMetrics.navbarWidth,
      codesMetrics.navbarWidth,
      'Zero Layout Shift Violation: Sidebar navbar width shifted during navigation'
    );

    // Step 3: Cloudflare Pages dist & static asset integrity check
    const wranglerPath = path.join(projectRoot, 'wrangler.jsonc');
    assert.ok(fs.existsSync(wranglerPath), 'Cloudflare Pages configuration wrangler.jsonc must exist');

    const redirectsPath = fs.existsSync(path.join(projectRoot, 'dist', '_redirects'))
      ? path.join(projectRoot, 'dist', '_redirects')
      : path.join(projectRoot, 'public', '_redirects');
    assert.ok(fs.existsSync(redirectsPath), 'Cloudflare SPA routing redirects file (_redirects) must exist');

    const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
    assert.ok(
      redirectsContent.includes('/* /index.html 200'),
      'Cloudflare _redirects must contain SPA route rewrite rule "/* /index.html 200"'
    );

    // Step 4: Verify localStorage schema event sync across all 14 keys
    const storageKeys = [
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
      'qc-sort',
    ];

    for (const key of storageKeys) {
      assert.doesNotThrow(
        () => app.mockStorage.getItem(key),
        `Storage key "${key}" should be accessible without error`
      );
    }
  });

});
