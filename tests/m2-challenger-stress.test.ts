import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';
import {
  getCategoryColor,
  getCategoryBadgeStyle,
  getCategoryLeftBorderStyle,
  getCategoryIconComponent,
  CATEGORY_ICON_MAP,
} from '../src/utils/categoryColors.ts';
import { CATEGORIES } from '../src/data/qcData.ts';

describe('Milestone 2 Empirical Challenger Stress Harness', () => {
  describe('1. Muted Semantic Color Palette Integrity & Edge Cases', () => {
    it('1.1: verify exact hex colors for core semantic categories', () => {
      const expectedColors: Record<string, string> = {
        battery: '#38a169',  // Soft Green
        buttons: '#d97706',  // Muted Amber
        screen: '#4682b4',   // Steel Blue
        pen: '#9d4edd',      // Muted Plum
        locks: '#f43f5e',    // Rose
        codes: '#64748b',    // Slate
        body: '#64748b',     // Slate
        camera: '#4682b4',   // Steel Blue
        backcover: '#b45309',// Warm Amber
        water: '#0284c7',    // Steel Cyan
        audio: '#059669',    // Muted Emerald
        system: '#ea580c',   // Muted Orange
        pinned: '#f59e0b',   // Muted Golden Amber
        all: '#78716c',      // Stone Grey
        recent: '#78716c',   // Stone Grey
      };

      for (const [catKey, hex] of Object.entries(expectedColors)) {
        const color = getCategoryColor(catKey);
        assert.equal(color, hex, `Category '${catKey}' must match expected muted hex color ${hex}`);
      }
    });

    it('1.2: stress test category color lookup with case variations, unknown keys, spaces, and special characters', () => {
      const edgeCases = [
        { input: 'BATTERY', expected: '#38a169' },
        { input: '  BATTERY  ', expected: '#38a169' },
        { input: 'ScReEn', expected: '#4682b4' },
        { input: '  buttons  ', expected: '#d97706' },
        { input: 'non_existent_category', expected: '#64748b' },
        { input: '', expected: '#64748b' },
        { input: '<script>alert(1)</script>', expected: '#64748b' },
        { input: '12345', expected: '#64748b' },
        { input: 'null', expected: '#64748b' },
        { input: 'undefined', expected: '#64748b' },
      ];

      for (const { input, expected } of edgeCases) {
        const color = getCategoryColor(input);
        assert.equal(color, expected, `Lookup for '${input}' should return ${expected}`);
      }
    });

    it('1.3: verify badge styling RGBA computation and left border accent structure', () => {
      const badgeStyle = getCategoryBadgeStyle('battery');
      assert.equal(badgeStyle.color, '#38a169');
      assert.equal(badgeStyle.backgroundColor, 'rgba(56, 161, 105, 0.18)');
      assert.equal(badgeStyle.borderColor, 'rgba(56, 161, 105, 0.45)');

      const borderStyle = getCategoryLeftBorderStyle('battery');
      assert.equal(borderStyle.borderLeftWidth, '4px');
      assert.equal(borderStyle.borderLeftStyle, 'solid');
      assert.equal(borderStyle.borderLeftColor, '#38a169');
    });

    it('1.4: verify fallback RGBA computation for unknown category', () => {
      const badgeStyle = getCategoryBadgeStyle('unknown_xyz');
      assert.equal(badgeStyle.color, '#64748b'); // Slate
      assert.equal(badgeStyle.backgroundColor, 'rgba(100, 116, 139, 0.18)');
      assert.equal(badgeStyle.borderColor, 'rgba(100, 116, 139, 0.45)');
    });
  });

  describe('2. Lucide Iconography System Mapping', () => {
    it('2.1: ensure all 15 defect categories have non-null dedicated Lucide icon components', () => {
      const requiredCategories = [
        'screen', 'camera', 'buttons', 'battery', 'backcover',
        'locks', 'pen', 'water', 'audio', 'body', 'system',
        'codes', 'all', 'pinned', 'recent'
      ];

      for (const cat of requiredCategories) {
        const Icon = getCategoryIconComponent(cat);
        assert.ok(Icon, `Category '${cat}' must return a valid Lucide icon component`);
      }
    });

    it('2.2: stress test icon resolution with unknown keys and aliases', () => {
      // Aliases
      assert.equal(getCategoryIconComponent('monitor'), CATEGORY_ICON_MAP['screen']);
      assert.equal(getCategoryIconComponent('favorites'), CATEGORY_ICON_MAP['pinned']);
      assert.equal(getCategoryIconComponent('folder'), CATEGORY_ICON_MAP['all']);

      // Unknown key falls back to Folder
      assert.equal(getCategoryIconComponent('random_unknown'), CATEGORY_ICON_MAP['all']);
    });
  });

  describe('3. DOM Selector & Data Attribute Integrity in Rendered DOM', () => {
    it('3.1: verify data-v attributes on header and view switchers', () => {
      const app = createAppInstance();
      const viewSwitcher = app.document.querySelector('[data-testid="view-switcher"]');
      assert.ok(viewSwitcher, 'view-switcher container must exist');

      const modeBtns = app.document.querySelectorAll('[data-v]');
      assert.ok(modeBtns.length > 0, 'data-v attribute elements must exist in DOM');

      modeBtns.forEach((btn) => {
        const val = btn.getAttribute('data-v');
        assert.ok(['grid', 'list', 'table', 'dark', 'light'].includes(val || ''), `data-v value '${val}' must be valid`);
      });
    });

    it('3.2: verify data-cat attributes on sidebar navigation category chips', () => {
      const app = createAppInstance();
      const catChips = app.document.querySelectorAll('[data-cat]');
      assert.ok(catChips.length > 0, 'data-cat elements must be present in sidebar nav');

      catChips.forEach((chip) => {
        const cat = chip.getAttribute('data-cat');
        assert.ok(cat && cat.length > 0, 'data-cat attribute must not be empty');
      });
    });

    it('3.3: verify data-testid presence across critical UI components', () => {
      const app = createAppInstance();
      const requiredTestIds = [
        'app-navbar',
        'app-header',
        'header-search-input',
        'spotlight-trigger',
        'view-switcher',
        'wording-container',
      ];

      for (const testId of requiredTestIds) {
        const el = app.document.querySelector(`[data-testid="${testId}"]`);
        assert.ok(el, `Element with data-testid="${testId}" must exist in DOM`);
      }
    });

    it('3.4: verify left border style and badge pill elements on rendered defect cards in Grid, List, and Table views', async () => {
      const app = createAppInstance();

      // Switch to List view
      await app.setLayoutView('list');
      await new Promise((r) => setTimeout(r, 20));

      const listCards = app.document.querySelectorAll('[data-id]');
      assert.ok(listCards.length > 0, 'Defect cards must render with data-id in list view');
      listCards.forEach((card) => {
        const style = card.getAttribute('style') || '';
        assert.ok(style.includes('border-left'), 'Card container must contain inline border-left accent styling');
      });

      // Switch to Grid view
      await app.setLayoutView('grid');
      await new Promise((r) => setTimeout(r, 20));

      const gridCards = app.document.querySelectorAll('[data-id]');
      assert.ok(gridCards.length > 0, 'Defect cards must render with data-id in grid view');
      gridCards.forEach((card) => {
        const style = card.getAttribute('style') || '';
        assert.ok(style.includes('border-left'), 'Card container must contain inline border-left accent styling');
      });

      // Switch to Table view
      await app.setLayoutView('table');
      await new Promise((r) => setTimeout(r, 20));

      const tableCards = app.document.querySelectorAll('[data-id]');
      assert.ok(tableCards.length > 0, 'Defect cards must render with data-id in table view');
      tableCards.forEach((card) => {
        const style = card.getAttribute('style') || '';
        assert.ok(style.includes('border-left'), 'Card container must contain inline border-left accent styling');
      });
    });
  });

  describe('4. Inline Copy Micro-Interactions & Capsule Pill Refinements', () => {
    it('4.1: clicking a defect card in list view triggers inline copied badge and emerald glow', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await new Promise((r) => setTimeout(r, 20));

      const cards = app.document.querySelectorAll('#listwrap .row');
      assert.ok(cards.length > 0, 'Defect rows must exist in list view');

      const firstCard = cards[0] as HTMLElement;
      firstCard.click();
      await new Promise((r) => setTimeout(r, 30));

      const badge = firstCard.querySelector('.inline-copied-badge, [data-testid="inline-copied-badge"]');
      assert.ok(badge, 'Inline copied badge must appear on clicked card');
      assert.ok(badge.textContent?.includes('Copied ✓'), 'Inline copied badge must contain "Copied ✓" text');
      assert.ok(firstCard.className.includes('emerald') || firstCard.className.includes('ring'), 'Card container must activate emerald glow styling');
    });

    it('4.2: clicking a defect card in grid view triggers inline copied badge', async () => {
      const app = createAppInstance();
      await app.setLayoutView('grid');
      await new Promise((r) => setTimeout(r, 20));

      const cards = app.document.querySelectorAll('#listwrap .gcard');
      assert.ok(cards.length > 0, 'Defect cards must exist in grid view');

      const firstCard = cards[0] as HTMLElement;
      firstCard.click();
      await new Promise((r) => setTimeout(r, 30));

      const badge = firstCard.querySelector('.inline-copied-badge, [data-testid="inline-copied-badge"]');
      assert.ok(badge, 'Inline copied badge must appear on clicked grid card');
      assert.ok(badge.textContent?.includes('Copied ✓'), 'Badge text must be "Copied ✓"');
    });

    it('4.3: clicking a defect card in table view triggers inline copied badge', async () => {
      const app = createAppInstance();
      await app.setLayoutView('table');
      await new Promise((r) => setTimeout(r, 20));

      const cards = app.document.querySelectorAll('#listwrap .trow');
      assert.ok(cards.length > 0, 'Defect rows must exist in table view');

      const firstCard = cards[0] as HTMLElement;
      firstCard.click();
      await new Promise((r) => setTimeout(r, 30));

      const badge = firstCard.querySelector('.inline-copied-badge, [data-testid="inline-copied-badge"]');
      assert.ok(badge, 'Inline copied badge must appear on clicked table row');
      assert.ok(badge.textContent?.includes('Copied ✓'), 'Badge text must be "Copied ✓"');
    });

    it('4.4: verify .rnum capsule pill styling and .rtxt high-contrast classes', async () => {
      const app = createAppInstance();
      const numEls = app.document.querySelectorAll('.rnum');
      assert.ok(numEls.length > 0, '.rnum elements must exist in DOM');

      numEls.forEach((el) => {
        const cls = el.className || '';
        assert.ok(cls.includes('font-mono'), '.rnum must include font-mono');
        assert.ok(cls.includes('font-bold'), '.rnum must include font-bold');
        assert.ok(cls.includes('bg-stone-800') || cls.includes('rounded'), '.rnum must include capsule styling');
      });

      const txtEls = app.document.querySelectorAll('.rtxt');
      assert.ok(txtEls.length > 0, '.rtxt elements must exist in DOM');
      txtEls.forEach((el) => {
        const cls = el.className || '';
        assert.ok(cls.includes('font-sans') || cls.includes('font-semibold'), '.rtxt must have structured typography');
      });
    });

    it('4.5: verify action buttons tactile micro-states', () => {
      const app = createAppInstance();
      const pinBtns = app.document.querySelectorAll('.pin-btn');
      const addBtns = app.document.querySelectorAll('.add-batch-btn');

      assert.ok(pinBtns.length > 0, '.pin-btn must exist');
      assert.ok(addBtns.length > 0, '.add-batch-btn must exist');

      pinBtns.forEach((btn) => {
        const cls = btn.className || '';
        assert.ok(cls.includes('active:scale-90') || cls.includes('transition'), '.pin-btn must have tactile active state');
      });

      addBtns.forEach((btn) => {
        const cls = btn.className || '';
        assert.ok(cls.includes('active:scale-95') || cls.includes('transition'), '.add-batch-btn must have tactile active state');
      });
    });
  });
});
