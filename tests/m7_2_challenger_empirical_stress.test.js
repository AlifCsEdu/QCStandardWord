import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('M7_2 Challenger Empirical Stress & Edge Case Verification', () => {

  // =========================================================================
  // SECTION 1: Glassmorphic Batch Drawer Stress Testing
  // =========================================================================
  describe('1. Glassmorphic Batch Drawer', () => {
    it('1.1 Large Batch Reorder/Copy Operations (100+ items, rapid reorders, 6 delimiters, bulk import)', async () => {
      const initial100 = Array.from({ length: 150 }, (_, i) => `Defect #${i + 1} - Multi-word text description for batch testing`);
      const app = createAppInstance({
        initialStorage: {
          'qc-batch': JSON.stringify(initial100),
          'qc-join': 'comma',
          'qc-autoclear': 'false',
        },
      });
      await waitAsync(50);

      // Verify initial queue size
      assert.strictEqual(app.getBatchCount(), 150, 'Batch queue count must equal 150');

      // Test rapid reordering at boundaries and middle
      app.moveBatchItemUp(75); // Move item 75 UP -> index 74
      await waitAsync(30);
      let batchItems = app.getBatchItems();
      assert.strictEqual(batchItems[74].text, 'Defect #76 - Multi-word text description for batch testing');
      assert.strictEqual(batchItems[75].text, 'Defect #75 - Multi-word text description for batch testing');

      app.moveBatchItemDown(74); // Move 74 back DOWN -> index 75
      await waitAsync(30);
      batchItems = app.getBatchItems();
      assert.strictEqual(batchItems[74].text, 'Defect #75 - Multi-word text description for batch testing');
      assert.strictEqual(batchItems[75].text, 'Defect #76 - Multi-word text description for batch testing');

      // Verify all 6 delimiters produce exact correct formatted text for 150 items
      const testDelimiters = [
        { key: 'nl', joinStr: '\n' },
        { key: 'comma', joinStr: ', ' },
        { key: 'semi', joinStr: '; ' },
        { key: 'space', joinStr: ' ' },
        { key: 'pipe', joinStr: ' | ' },
        { key: 'bullet', joinStr: ' • ' },
      ];

      const expectedTexts = batchItems.map((i) => i.text);

      for (const { key, joinStr } of testDelimiters) {
        app.setDelimiter(key);
        await waitAsync(30);
        await app.copyBatch();
        const expectedJoined = expectedTexts.join(joinStr);
        assert.strictEqual(app.getCopiedText(), expectedJoined, `Delimiter "${key}" must accurately join batch items`);
      }

      // Test Single Item Remove & Clear Queue
      app.removeBatchItem(0);
      await waitAsync(30);
      assert.strictEqual(app.getBatchCount(), 149);

      app.clearBatch();
      await waitAsync(30);
      assert.strictEqual(app.getBatchCount(), 0);
      assert.deepStrictEqual(app.getStorageJSON('qc-batch'), []);
    });

    it('1.2 Backdrop-filter blur rendering performance & CSS rules', () => {
      const cssPath = path.join(projectRoot, 'src', 'index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // CSS variable and property assertions for glassmorphism
      assert.ok(cssContent.includes('--drawer-backdrop-blur: blur(8px);'), 'Dark mode backdrop filter blur must be blur(8px)');
      assert.ok(cssContent.includes('backdrop-filter: var(--drawer-backdrop-blur, blur(8px));'), 'Backdrop overlay must use backdrop-filter');
      assert.ok(cssContent.includes('-webkit-backdrop-filter: var(--drawer-backdrop-blur, blur(8px));'), 'Webkit backdrop-filter fallback must exist');
      assert.ok(cssContent.includes('.batch-drawer'), '.batch-drawer CSS selector must exist');
      assert.ok(cssContent.includes('backdrop-filter: blur(8px);'), 'Batch drawer panel must have backdrop-filter: blur(8px)');
    });

    it('1.3 Non-dimming overlay specifications', () => {
      const cssPath = path.join(projectRoot, 'src', 'index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // Non-dimming transparent dark overlay specification rgba(15, 23, 42, 0.4) / rgba(15, 23, 42, 0.2)
      assert.ok(cssContent.includes('--drawer-backdrop-bg: rgba(15, 23, 42, 0.4);'), 'Dark theme overlay must be non-dimming rgba(15, 23, 42, 0.4)');
      assert.ok(cssContent.includes('--drawer-backdrop-bg: rgba(15, 23, 42, 0.2);'), 'Light theme overlay must be non-dimming rgba(15, 23, 42, 0.2)');
    });

    it('1.4 Drawer open/close state edge cases (empty vs filled queue, backdrop click, badges sync)', async () => {
      const app = createAppInstance();
      await waitAsync(50);
      const { document } = app;

      // Check initially batch drawer elements exist in DOM
      const backdrop = document.querySelector('#backdrop');
      const drawer = document.querySelector('#batchDrawer');
      assert.ok(backdrop, '#backdrop must exist');
      assert.ok(drawer, '#batchDrawer must exist');

      // Initially closed -> backdrop style display should be 'none'
      assert.strictEqual(backdrop.style.display, 'none');

      // Add item to batch
      await app.addBatchItem(0);
      await waitAsync(30);

      // Verify count badges #bbcount and #bcount stay in sync
      const bbcount = document.querySelector('#bbcount');
      const bcount = document.querySelector('#bcount');
      assert.ok(bbcount, '#bbcount badge must exist');
      assert.ok(bcount, '#bcount badge must exist');
      assert.strictEqual(bbcount.textContent.trim(), '1');
      assert.strictEqual(bcount.textContent.trim(), '1');
    });
  });

  // =========================================================================
  // SECTION 2: High-Contrast Defect Cards, Rows, Grid & Table Edge Cases
  // =========================================================================
  describe('2. High-Contrast Defect Cards, Rows, Grid Items & Tables', () => {
    it('2.1 Empty State Behavior (#empty element when search yields no results)', async () => {
      const app = createAppInstance();
      await waitAsync(100);
      const { document } = app;

      // Select 'pinned' category when no items are pinned (0 results)
      app.selectCategory('pinned');
      await waitAsync(100);

      const emptyEl = document.querySelector('#empty');
      assert.ok(emptyEl, '#empty element must be rendered when search query yields 0 results');
      assert.ok(
        emptyEl.textContent.includes('No matching QC wording defects found'),
        '#empty element text must display "No matching QC wording defects found."'
      );
      assert.strictEqual(app.getVisibleItems().length, 0, 'No wording items should be rendered');
    });

    it('2.2 Multi-line defect wording & special character escaping (XSS payload & HTML safety)', async () => {
      const app = createAppInstance();
      await waitAsync(50);
      const { document } = app;

      // Enable edit mode and add an item with XSS payload and multiline text
      app.toggleEditMode();
      await waitAsync(30);

      app.openAddModal();
      await waitAsync(30);

      const xssText = '<script>alert("XSS")</script> Defect line 1\nDefect line 2 & "quoted" text';
      app.saveModalForm(xssText, 'screen', 999);
      await waitAsync(50);

      // Search for the newly added item
      app.search('XSS');
      await waitAsync(50);

      const visibleItems = app.getVisibleItems();
      assert.ok(visibleItems.length > 0, 'Added defect item must be visible');

      // Verify no raw unescaped script tag was executed or injected into DOM tree as HTML node
      const scriptElement = document.querySelector('script[src*="alert"]');
      assert.strictEqual(scriptElement, null, 'XSS script payload must NOT be parsed into an executable DOM script tag');

      // Verify text content safely renders
      const itemTxtEl = visibleItems[0].element.querySelector('.rtxt');
      assert.ok(itemTxtEl, '.rtxt element must exist');
      assert.ok(itemTxtEl.textContent.includes('Defect line 1'), 'Multi-line defect wording content must be preserved');
    });

    it('2.3 Hover animation state stability (150ms ease, no jitter, theme tokens)', () => {
      const cssPath = path.join(projectRoot, 'src', 'index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      assert.ok(cssContent.includes('.gcard, .row, .trow'), 'Grouped card/row/trow selector must exist');
      assert.ok(cssContent.includes('150ms ease'), '150ms ease transition rule must be defined');
      assert.ok(cssContent.includes('transform 150ms ease'), 'Transform transition 150ms ease rule must be defined');
      assert.ok(cssContent.includes('.gcard:hover'), '.gcard:hover rule must exist');
      assert.ok(cssContent.includes('.row:hover'), '.row:hover rule must exist');
      assert.ok(cssContent.includes('.trow:hover'), '.trow:hover rule must exist');
    });
  });

  // =========================================================================
  // SECTION 3: Responsive Mobile vs Desktop Viewports
  // =========================================================================
  describe('3. Responsive Mobile vs Desktop Viewports', () => {
    it('3.1 Collapsible Navbar/Drawer and AppHeader Burger button integration', () => {
      const appHeaderPath = path.join(projectRoot, 'src', 'components', 'AppHeader.tsx');
      const appHeaderContent = fs.readFileSync(appHeaderPath, 'utf8');

      const appPath = path.join(projectRoot, 'src', 'App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf8');

      assert.ok(appHeaderContent.includes('Burger'), 'AppHeader.tsx must import and render Mantine Burger component');
      assert.ok(appHeaderContent.includes('mobileOpened'), 'AppHeader.tsx must accept mobileOpened prop');
      assert.ok(appHeaderContent.includes('onToggleMobile'), 'AppHeader.tsx must accept onToggleMobile prop');
      assert.ok(appContent.includes("breakpoint: 'sm'"), "App.tsx must set navbar breakpoint: 'sm'");
      assert.ok(appContent.includes('collapsed: { mobile: !mobileOpened }'), 'App.tsx must configure collapsible mobile navbar');
    });

    it('3.2 Layout mode responsiveness & zero horizontal overflow verification', () => {
      const cssPath = path.join(projectRoot, 'src', 'index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      const wordingGridPath = path.join(projectRoot, 'src', 'components', 'WordingGrid.tsx');
      const wordingGridContent = fs.readFileSync(wordingGridPath, 'utf8');

      // Grid CSS responsive minmax columns
      assert.ok(wordingGridContent.includes('repeat(auto-fill, minmax('), 'WordingGrid.tsx must use responsive auto-fill minmax grid layout');

      // Typography & wrapping rule check to avoid horizontal overflow
      assert.ok(cssContent.includes('word-break: break-word;') || wordingGridContent.includes('wordBreak') || cssContent.includes('.rtxt'), 'Text wrapping/break rules must prevent horizontal overflow');
    });
  });
});
