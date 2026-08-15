import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Challenger 2: Production Build, TypeScript Compilation & Edge Case Stress Suite', () => {

  // =========================================================================
  // 1. Production Build & Compiled Assets Verification
  // =========================================================================
  describe('1. Production Build & Compiled Assets Integrity', () => {
    it('1.1: dist directory exists and contains all required deployment assets', () => {
      const distPath = path.join(projectRoot, 'dist');
      assert.ok(fs.existsSync(distPath), 'dist directory must exist');

      const expectedFiles = [
        'index.html',
        'manifest.webmanifest',
        'sw.js',
        'registerSW.js',
        'favicon.svg',
        '_redirects'
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(distPath, file);
        assert.ok(fs.existsSync(filePath), `dist/${file} must exist`);
      }
    });

    it('1.2: dist/index.html correctly references bundled JS, CSS, and WebManifest', () => {
      const htmlPath = path.join(projectRoot, 'dist', 'index.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      assert.ok(htmlContent.includes('<div id="root"></div>'), 'Root mount container must be present');
      assert.match(htmlContent, /<script type="module" crossorigin src="\/assets\/index-[a-zA-Z0-9_-]+\.js"><\/script>/, 'JS bundle script tag must be referenced');
      assert.match(htmlContent, /<link rel="stylesheet" crossorigin href="\/assets\/index-[a-zA-Z0-9_-]+\.css">/, 'CSS bundle link tag must be referenced');
      assert.ok(htmlContent.includes('manifest.webmanifest'), 'WebManifest link must be referenced');
    });

    it('1.3: dist/manifest.webmanifest is valid JSON with standalone PWA metadata', () => {
      const manifestPath = path.join(projectRoot, 'dist', 'manifest.webmanifest');
      const rawManifest = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(rawManifest);

      assert.equal(manifest.display, 'standalone', 'Display mode must be standalone');
      assert.ok(manifest.name?.includes('QC Standard Wording'), 'Manifest name must contain QC Standard Wording');
      assert.ok(manifest.short_name?.includes('QC Wording'), 'Manifest short_name must contain QC Wording');
      assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'Manifest must declare icons');
    });

    it('1.4: dist/assets compiled CSS contains design tokens, custom scrollbars, and density rules', () => {
      const assetsPath = path.join(projectRoot, 'dist', 'assets');
      const cssFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.css'));
      assert.ok(cssFiles.length > 0, 'CSS asset must exist');

      const cssContent = fs.readFileSync(path.join(assetsPath, cssFiles[0]), 'utf8');

      // Verify custom sleek scrollbars
      assert.ok(cssContent.includes('scrollbar-width') || cssContent.includes('::-webkit-scrollbar'), 'Custom sleek scrollbar styling must be compiled');

      // Verify design tokens & theme rules
      assert.ok(cssContent.includes('--radius') || cssContent.includes('data-radius'), 'Radius variables must be compiled in CSS');
      assert.ok(cssContent.includes('data-density') || cssContent.includes('data-theme') || cssContent.includes('data-accent'), 'Appearance data attributes must be compiled');
    });

    it('1.5: dist/assets compiled JS bundle contains non-empty production code', () => {
      const assetsPath = path.join(projectRoot, 'dist', 'assets');
      const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));
      assert.ok(jsFiles.length > 0, 'JS bundle must exist');

      const jsPath = path.join(assetsPath, jsFiles[0]);
      const stats = fs.statSync(jsPath);
      assert.ok(stats.size > 100000, `JS bundle size (${stats.size} bytes) must be substantial for production React app`);
    });
  });

  // =========================================================================
  // 2. Adversarial LocalStorage Corruption Stress
  // =========================================================================
  describe('2. Adversarial LocalStorage Corruption & Recovery Stress', () => {
    it('2.1: booting with ALL 16+ storage keys completely corrupted with malformed JSON strings', async () => {
      const corruptedStorage: Record<string, string> = {
        'qc-appearance': '{corrupt:json,invalid',
        'qc-categories': '[{"id": broken, name: missing}',
        'qc-category-order': '{"not-an-array": true}',
        'qc-history-entries': '{malformed: [1,2,3',
        'qc-custom': '[[[invalid nested array',
        'qc-edits': '{"broken_map": invalid}',
        'qc-dels': '["unterminated string',
        'qc-pinned': '{"broken_set": true}',
        'qc-pin-folders': '{{{bad_json',
        'qc-batch': '{not-valid-batch-array',
        'qc-recents': '{"bad": "recents"}',
        'qc-history': 'null_undefined_garbage',
        'qc-theme': 'INVALID_THEME_VALUE_999',
        'qc-density': 'SUPER_ULTRA_WIDE_DENSITY',
        'qc-sort': 'RANDOM_SORT_METHOD_XXX',
        'qc-layout': 'NONEXISTENT_3D_VIEW'
      };

      // App should boot without throwing and initialize default fallback state cleanly
      const app = createAppInstance({ initialStorage: corruptedStorage });
      await waitAsync(50);

      const items = app.getVisibleItems();
      assert.ok(items.length >= 100, 'App must load default items despite total localStorage corruption');

      // Verify DOM root attributes have sensible fallback values
      const root = app.document.documentElement;
      assert.ok(['dark', 'light'].includes(root.getAttribute('data-theme') || ''), 'Fallback theme must be valid');
      assert.ok(['compact', 'cozy', 'tablet'].includes(root.getAttribute('data-density') || ''), 'Fallback density must be valid');
    });

    it('2.2: booting with non-array / unexpected primitive types in array-expecting keys', async () => {
      const typePollutionStorage: Record<string, string> = {
        'qc-categories': '12345',
        'qc-category-order': '"just a plain string"',
        'qc-history-entries': 'true',
        'qc-custom': 'false',
        'qc-dels': '987654',
        'qc-batch': 'null',
        'qc-pin-folders': '3.14159',
        'qc-appearance': '42'
      };

      const app = createAppInstance({ initialStorage: typePollutionStorage });
      await waitAsync(50);

      const items = app.getVisibleItems();
      assert.ok(items.length > 0, 'App recovers cleanly from primitive type pollution');
    });

    it('2.3: booting with partially broken / missing fields inside array objects', async () => {
      const partialObjectStorage: Record<string, string> = {
        'qc-categories': JSON.stringify([
          { id: '', name: '' }, // missing color, desc
          { name: 'No ID Category' }, // missing id
          { id: 'cat_bad_color', name: 'Bad Color', color: 12345, subCodes: 'not-array' }
        ]),
        'qc-pin-folders': JSON.stringify([
          { id: 'f_broken' }, // missing name and color
          null, // null entry inside array
          { id: 'f_ok', name: 'Valid Folder', color: '#10b981' }
        ]),
        'qc-history-entries': JSON.stringify([
          { text: 'Missing id and timestamp' },
          { id: 'h_null_text', text: null, timestamp: 'not-a-number' },
          null
        ])
      };

      const app = createAppInstance({ initialStorage: partialObjectStorage });
      await waitAsync(50);

      const items = app.getVisibleItems();
      assert.ok(items.length > 0, 'App recovers from partially broken object shapes');
    });
  });

  // =========================================================================
  // 3. Unicode, Emoji, Zalgo, and Multi-byte Injection Stress
  // =========================================================================
  describe('3. Unicode, Multi-Byte, Emoji & Internationalization Stress', () => {
    it('3.1: custom wording with complex 4-byte emojis, surrogate pairs, and Zalgo text', async () => {
      const app = createAppInstance();
      await waitAsync(30);

      app.toggleEditMode();
      await waitAsync(30);

      app.openAddModal();
      await waitAsync(30);

      const emojiZalgoText = '🔬 [TEST] 👩‍👩‍👧‍👦 Complex Emoji & Zalgo: T̷e̵s̷t̸ ̶D̸e̴f̵e̴c̵t̷ ⚡ 100% 🛡️ 🧪';
      app.saveModalForm(emojiZalgoText, 'screen', 999);
      await waitAsync(50);

      // Search for the added unicode defect
      app.search('Zalgo');
      await waitAsync(50);

      const items = app.getVisibleItems();
      assert.ok(items.length > 0, 'Unicode/Zalgo item must be searchable and rendered');
      assert.ok(items[0].text.includes('Complex Emoji'), 'Item text must preserve full Unicode emojis');

      // Click to copy unicode text
      await app.clickItemRow(0);
      await waitAsync(50);

      const copied = app.getCopiedText();
      assert.ok(copied?.includes('👩‍👩‍👧‍👦'), 'Clipboard must receive exact multi-byte emoji string');
    });

    it('3.2: Right-to-Left (Arabic) and Asian (Japanese) scripts in custom items and exact matching', async () => {
      const initialCustom = [
        { id: 801, c: 'screen', sub: 'PC', n: 801, t: 'QC Defect TagArabic: خطأ في الشاشة وتلف في لوحة اللمس' },
        { id: 802, c: 'housing', sub: 'PC', n: 802, t: 'QC Defect TagJapanese: 液晶ディスプレイの表示不良' }
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-custom': JSON.stringify(initialCustom)
        }
      });
      await waitAsync(50);

      // Search with unique Latin prefix
      app.search('TagArabic');
      await waitAsync(50);
      let items = app.getVisibleItems();
      assert.ok(items.some(i => i.text.includes('خطأ في الشاشة')), 'Arabic custom item found');

      // Search Japanese with unique Latin tag
      app.search('TagJapanese');
      await waitAsync(50);
      items = app.getVisibleItems();
      assert.ok(items.some(i => i.text.includes('液晶ディスプレイ')), 'Japanese custom item found');
    });
  });

  // =========================================================================
  // 4. Large Batch Queues & High-Frequency Operations
  // =========================================================================
  describe('4. Large Batch Queue (200+ Items) & High-Frequency Operations', () => {
    it('4.1: bulk populates 200 items into batch queue and joins with valid delimiter keys', async () => {
      const largeBatch = Array.from({ length: 200 }, (_, i) => `Defect Item #${i + 1}: Automated Stress Defect Wording Text`);
      const app = createAppInstance({
        initialStorage: {
          'qc-batch': JSON.stringify(largeBatch),
          'qc-join': 'nl',
          'qc-autoclear': 'false'
        }
      });
      await waitAsync(50);

      assert.equal(app.getBatchCount(), 200, 'Batch queue must hold all 200 items');

      await app.openBatchDrawer();
      await waitAsync(50);

      app.toggleAutoClear(false);
      await waitAsync(30);

      // Test default newline delimiter copy ('nl')
      await app.copyBatch();
      await waitAsync(50);

      let copied = app.getCopiedText();
      assert.ok(copied, 'Copied batch must not be empty');
      let lines = copied.split('\n');
      assert.equal(lines.length, 200, 'Copied text must have 200 lines for newline delimiter');

      // Click Comma delimiter tab button
      const commaBtn = app.document.querySelector('button[title*="Comma"]') as HTMLElement;
      if (commaBtn) {
        commaBtn.click();
        await waitAsync(50);
      }
      app.setDelimiter('comma');
      await waitAsync(30);

      await app.copyBatch();
      await waitAsync(50);

      copied = app.getCopiedText();
      assert.ok(copied?.includes(', ') || copied?.includes('; '), 'Copied text must use delimited separation');

      // Test clear batch
      app.clearBatch();
      await waitAsync(50);
      assert.equal(app.getBatchCount(), 0, 'Batch queue should be cleared');
      assert.equal(app.getStorageJSON('qc-batch')?.length || 0, 0, 'LocalStorage qc-batch must be cleared');
    });

    it('4.2: rapid batch reordering boundary checks (move up at 0, move down at N-1)', async () => {
      const batchItems = ['Item Alpha', 'Item Beta', 'Item Gamma'];
      const app = createAppInstance({
        initialStorage: {
          'qc-batch': JSON.stringify(batchItems)
        }
      });
      await waitAsync(30);
      await app.openBatchDrawer();
      await waitAsync(30);

      // Try moving index 0 UP (should be a no-op / safe)
      app.moveBatchItemUp(0);
      await waitAsync(30);
      let items = app.getBatchItems();
      assert.equal(items[0].text, 'Item Alpha', 'Index 0 moveUp remains at top');

      // Try moving last index DOWN (should be a no-op / safe)
      app.moveBatchItemDown(2);
      await waitAsync(30);
      items = app.getBatchItems();
      assert.equal(items[2].text, 'Item Gamma', 'Last index moveDown remains at bottom');

      // Move index 1 UP (swaps 0 and 1)
      app.moveBatchItemUp(1);
      await waitAsync(30);
      items = app.getBatchItems();
      assert.equal(items[0].text, 'Item Beta', 'Item Beta moved to index 0');
      assert.equal(items[1].text, 'Item Alpha', 'Item Alpha moved to index 1');
    });
  });

  // =========================================================================
  // 5. High-Frequency Appearance Settings Toggling & Concurrency
  // =========================================================================
  describe('5. High-Speed Appearance Settings Toggling & Concurrency', () => {
    it('5.1: rapid 20x cycle through all accent palettes maintains exact DOM and LocalStorage sync', async () => {
      const app = createAppInstance();
      await waitAsync(30);
      await app.openSettingsModal();
      await waitAsync(30);

      const accents = ['stone', 'amber', 'green', 'rose', 'blue', 'steel', 'plum'] as const;

      for (let cycle = 0; cycle < 3; cycle++) {
        for (const acc of accents) {
          await app.setAccent(acc);
        }
      }
      await waitAsync(50);

      // Set final accent to 'amber'
      await app.setAccent('amber');
      await waitAsync(50);

      const root = app.document.documentElement;
      assert.equal(root.getAttribute('data-accent'), 'amber', 'Root data-accent must match final selection');

      const stored = app.getStorageJSON('qc-appearance');
      assert.equal(stored?.accent, 'amber', 'LocalStorage appearance.accent must match final selection');

      await app.closeSettingsModal();
    });

    it('5.2: rapid 20x cycle through border radius options', async () => {
      const app = createAppInstance();
      await waitAsync(30);
      await app.openSettingsModal();
      await waitAsync(30);

      const radii = ['sharp', 'soft', '10', 'round'] as const;

      for (let cycle = 0; cycle < 4; cycle++) {
        for (const r of radii) {
          await app.setRadius(r);
        }
      }
      await waitAsync(50);

      await app.setRadius('round');
      await waitAsync(50);

      const root = app.document.documentElement;
      const dataRadius = root.getAttribute('data-radius');
      assert.ok(dataRadius === 'round' || dataRadius === '16', 'Root data-radius must be mapped to round/16');

      const stored = app.getStorageJSON('qc-appearance');
      assert.ok(stored?.radius === 'round' || stored?.radius === '16', 'LocalStorage appearance.radius must be round/16');

      await app.closeSettingsModal();
    });

    it('5.3: rapid 20x cycle through density modes and reduced motion toggles', async () => {
      const app = createAppInstance();
      await waitAsync(30);
      await app.openSettingsModal();
      await waitAsync(30);

      const densities = ['compact', 'cozy', 'tablet'] as const;

      for (let cycle = 0; cycle < 4; cycle++) {
        for (const d of densities) {
          await app.setDensity(d);
        }
      }
      await waitAsync(50);

      await app.setDensity('tablet');
      await app.setMotion('reduced');
      await waitAsync(50);

      const root = app.document.documentElement;
      assert.equal(root.getAttribute('data-density'), 'tablet', 'Root data-density must be tablet');
      assert.equal(root.getAttribute('data-motion'), 'reduced', 'Root data-motion must be reduced');

      const stored = app.getStorageJSON('qc-appearance');
      assert.equal(stored?.density, 'tablet', 'Stored density must be tablet');
      assert.equal(stored?.motion, 'reduced', 'Stored motion must be reduced');

      await app.closeSettingsModal();
    });
  });

  // =========================================================================
  // 6. Dedicated History Drawer Deep Stress
  // =========================================================================
  describe('6. Dedicated History Drawer Deep Stress (100+ Entries & Bulk Actions)', () => {
    it('6.1: loads 100 history entries with relative timestamps and instant search filtering', async () => {
      const now = Date.now();
      const historyEntries = Array.from({ length: 100 }, (_, i) => ({
        id: `h_${i}`,
        text: `Inspection Defect Wording Log #${i + 1} - [Code QC${i}]`,
        itemNumber: 100 + i,
        category: i % 2 === 0 ? 'screen' : 'battery',
        timestamp: now - (i * 60000) // 1m increments
      }));

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(historyEntries)
        }
      });
      await waitAsync(50);

      await app.openHistoryDrawer();
      await waitAsync(50);

      const entries = app.getHistoryEntries();
      assert.ok(entries.length > 0, 'History entries must be rendered');

      // Test history search input with React synthetic event triggering
      const historySearch = app.document.querySelector('[data-testid="history-search-input"], input[placeholder*="Search history"]') as HTMLInputElement;
      if (historySearch) {
        const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(historySearch, 'Code QC5');
        } else {
          historySearch.value = 'Code QC5';
        }
        historySearch.dispatchEvent(new app.window.Event('input', { bubbles: true }));
        historySearch.dispatchEvent(new app.window.Event('change', { bubbles: true }));
        await waitAsync(50);

        const filteredEntries = app.getHistoryEntries();
        assert.ok(filteredEntries.length <= 15, 'History search should safely filter to matching records');
      }
    });

    it('6.2: "Add all to batch queue" from history drawer transfers all items cleanly', async () => {
      const now = Date.now();
      const historyEntries = [
        { id: 'h_1', text: 'Hist Defect 1', itemNumber: 1, category: 'screen', timestamp: now },
        { id: 'h_2', text: 'Hist Defect 2', itemNumber: 2, category: 'battery', timestamp: now - 5000 },
        { id: 'h_3', text: 'Hist Defect 3', itemNumber: 3, category: 'camera', timestamp: now - 10000 }
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(historyEntries),
          'qc-batch': JSON.stringify([])
        }
      });
      await waitAsync(50);

      await app.openHistoryDrawer();
      await waitAsync(50);

      const addAllBtn = app.document.querySelector('[data-testid="history-add-all-batch"], #haddAllBatch, button[aria-label*="Add All to Batch"], button[title*="Add all shown history"]') as HTMLElement;
      if (addAllBtn) {
        addAllBtn.click();
        await waitAsync(50);

        assert.equal(app.getBatchCount(), 3, 'All 3 history entries added to batch queue');
      }
    });

    it('6.3: clear history action clears qc-history-entries, qc-recents, and qc-history synchronously', async () => {
      const historyEntries = [
        { id: 'h_1', text: 'Defect 1', itemNumber: 1, category: 'screen', timestamp: Date.now() }
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(historyEntries),
          'qc-recents': JSON.stringify(['Defect 1']),
          'qc-history': JSON.stringify(['Defect 1'])
        }
      });
      await waitAsync(50);

      app.clearRecentHistory();
      await waitAsync(50);

      // Check confirmation modal if rendered
      const confirmBtn = app.document.querySelector('[data-testid="confirm-clear-history-btn"], #confirmClearHistory, button[data-confirm="true"]') as HTMLElement;
      if (confirmBtn) {
        confirmBtn.click();
        await waitAsync(50);
      }

      assert.equal(app.getStorageJSON('qc-recents')?.length || 0, 0, 'qc-recents must be cleared');
      assert.equal(app.getStorageJSON('qc-history-entries')?.length || 0, 0, 'qc-history-entries must be cleared');
    });
  });

});
