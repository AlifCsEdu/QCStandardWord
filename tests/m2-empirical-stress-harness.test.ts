import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';
import {
  getCategoryColor,
  getCategoryBadgeStyle,
  getCategoryLeftBorderStyle,
  getCategoryIconComponent,
} from '../src/utils/categoryColors.ts';

describe('Milestone 2 Iteration 3 Empirical Challenger Stress Harness', () => {

  describe('1. Category Color Lookup & Whitespace Trimming Under Stress', () => {
    it('1.1: whitespace trimming and case-insensitivity on getCategoryColor', () => {
      const cases = [
        { input: '  BATTERY  ', expected: '#38a169' },
        { input: '\t\n  screen  \r\n', expected: '#4682b4' },
        { input: '   BuTtOnS   ', expected: '#d97706' },
        { input: '  pEn  ', expected: '#9d4edd' },
        { input: '  lOcKs  ', expected: '#f43f5e' },
        { input: '  CoDeS  ', expected: '#64748b' },
        { input: '  BoDy  ', expected: '#64748b' },
        { input: '  CaMeRa  ', expected: '#4682b4' },
        { input: '  BaCkcOvEr  ', expected: '#b45309' },
        { input: '  WaTeR  ', expected: '#0284c7' },
        { input: '  AuDiO  ', expected: '#059669' },
        { input: '  SyStEm  ', expected: '#ea580c' },
        { input: '  PiNnEd  ', expected: '#f59e0b' },
        { input: '  AlL  ', expected: '#78716c' },
        { input: '  ReCeNt  ', expected: '#78716c' },
      ];

      for (const { input, expected } of cases) {
        const result = getCategoryColor(input);
        assert.equal(result, expected, `getCategoryColor('${input}') should return ${expected}`);
      }
    });

    it('1.2: high-frequency lookup loop (10,000 iterations) with dirty whitespace strings', () => {
      const dirtyStrings = [
        '  BATTERY  ',
        '\t\nscreen\r\n',
        '   BuTtOnS   ',
        '   NON_EXISTENT   ',
        '   ',
        '   <script>alert(1)</script>   ',
      ];

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        const str = dirtyStrings[i % dirtyStrings.length];
        const color = getCategoryColor(str);
        assert.ok(color.startsWith('#'), 'Color should be a valid hex string');
      }
      const duration = performance.now() - start;
      assert.ok(duration < 500, `10,000 category lookups should complete under 500ms (took ${duration.toFixed(2)}ms)`);
    });

    it('1.3: getCategoryBadgeStyle, getCategoryLeftBorderStyle, and getCategoryIconComponent with whitespace padding', () => {
      const badgeStyle = getCategoryBadgeStyle('  BATTERY  ');
      assert.equal(badgeStyle.color, '#38a169');
      assert.equal(badgeStyle.backgroundColor, 'rgba(56, 161, 105, 0.18)');
      assert.equal(badgeStyle.borderColor, 'rgba(56, 161, 105, 0.45)');

      const borderStyle = getCategoryLeftBorderStyle('  LOCKS  ');
      assert.equal(borderStyle.borderLeftColor, '#f43f5e');
      assert.equal(borderStyle.borderLeftWidth, '4px');

      const iconComp = getCategoryIconComponent('  CAMERA  ');
      assert.ok(iconComp, 'Icon component must be resolved for padded category name');
    });
  });

  describe('2. Rapid Load View Mode Toggling', () => {
    it('2.1: rapidly toggle view modes 30 times and verify DOM layout state integrity', async () => {
      const app = createAppInstance();
      const modes: Array<'grid' | 'list' | 'table'> = ['grid', 'list', 'table'];

      const start = performance.now();
      for (let i = 0; i < 30; i++) {
        const mode = modes[i % modes.length];
        await app.setLayoutView(mode);
      }
      const duration = performance.now() - start;

      // Final mode after 30 iterations (29 % 3 = 2 -> table)
      const wordingContainer = app.document.querySelector('#listwrap, [data-testid="wording-container"]');
      assert.ok(wordingContainer, 'Wording container must exist in DOM after rapid toggles');

      const layoutClassOrAttr = wordingContainer.classList.contains('table') || wordingContainer.getAttribute('data-layout') === 'table';
      assert.ok(layoutClassOrAttr, 'Wording container should accurately reflect final layout mode (table)');

      const items = app.document.querySelectorAll('[data-id]');
      assert.ok(items.length > 0, 'Defect items must remain rendered and intact after rapid toggles');

      assert.ok(duration < 60000, `30 view mode toggles should complete under 60000ms (took ${duration.toFixed(2)}ms)`);
    });
  });

  describe('3. Whitespace Trimming & Rapid Query Load', () => {
    it('3.1: rapid search with padded whitespace queries', async () => {
      const app = createAppInstance();
      const queries = ['  crease  ', '   battery   ', '   screen   ', '   \t  ', '  101  '];

      for (const q of queries) {
        app.search(q);
        await waitAsync(10);
        const visible = app.getVisibleItems();
        assert.ok(Array.isArray(visible), 'Visible items should be returned as an array');
      }

      app.clearSearch();
      const allVisible = app.getVisibleItems();
      assert.ok(allVisible.length > 0, 'Clearing search restores all items');
    });
  });

});
