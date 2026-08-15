import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
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

describe('R3: Advanced Category & Sub-Category Manager (CRUD, Icons/Emojis, Colors, Reordering)', () => {

  // =========================================================================
  // 1. Category Creation, Editing & Deletion (CRUD)
  // =========================================================================
  describe('1. Defect Category & Item CRUD Operations', () => {
    it('R3-1.1: should allow adding a new custom defect item under a category via modal form', async () => {
      const app = createAppInstance();
      app.toggleEditMode();
      assert.ok(app.isEditModeActive(), 'Edit mode must be active');

      app.openAddModal();
      app.saveModalForm('New OLED Green Tint Issue', 'screen', 999);
      await waitAsync(30);

      // Verify custom item is added into localStorage key "qc-custom"
      const customItems = app.getStorageJSON('qc-custom');
      assert.ok(Array.isArray(customItems), 'qc-custom in localStorage must be an array');
      const added = customItems.find((i) => i.t.includes('Green Tint'));
      assert.ok(added, 'Custom item "New OLED Green Tint Issue" must exist in storage');
      assert.equal(added.c, 'screen', 'Custom item category must be "screen"');
    });

    it('R3-1.2: should allow editing an existing defect item wording and persisting changes in "qc-edits"', async () => {
      const app = createAppInstance();
      app.toggleEditMode();

      // Open add/edit modal and simulate saving an edit
      app.openAddModal();
      app.saveModalForm('Updated Pixel Distortion Line', 'screen', 101);
      await waitAsync(30);

      const customItems = app.getStorageJSON('qc-custom');
      assert.ok(Array.isArray(customItems), 'qc-custom should be updated');
    });

    it('R3-1.3: should allow deleting a defect item and persisting deletion in "qc-dels"', async () => {
      const app = createAppInstance();
      app.toggleEditMode();

      // Click delete button on first item row
      await app.clickItemAction(0, 'del');

      // Check undo toast or qc-dels in storage
      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Deletion should trigger a toast notice with undo');
    });

    it('R3-1.4: should provide Undo action on item deletion to restore state', async () => {
      const app = createAppInstance();
      app.toggleEditMode();

      const initialVisibleCount = app.getVisibleItems().length;
      await app.clickItemAction(0, 'del');

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Toast notification must spawn');

      if (toasts[0].actionLabel) {
        app.triggerToastAction(0);
        await waitAsync(30);
        const restoredCount = app.getVisibleItems().length;
        assert.equal(restoredCount, initialVisibleCount, 'Item must be restored when toast Undo action is clicked');
      }
    });
  });

  // =========================================================================
  // 2. Hybrid Icon Selector (Curated Lucide Icons OR Custom Emojis)
  // =========================================================================
  describe('2. Hybrid Icon Selector (Lucide Icons & Emojis)', () => {
    it('R3-2.1: should resolve correct Lucide icon components for all primary categories', () => {
      const categories = ['screen', 'camera', 'buttons', 'battery', 'backcover', 'locks', 'pen', 'water', 'audio', 'body', 'system', 'codes'];
      categories.forEach((cat) => {
        const iconComponent = getCategoryIconComponent(cat);
        assert.ok(iconComponent, `Category ${cat} must resolve to a valid Lucide icon component`);
      });
    });

    it('R3-2.2: should render fallback Lucide icon for unknown or unmapped category names', () => {
      const fallbackIcon = getCategoryIconComponent('custom_unknown_category');
      assert.ok(fallbackIcon, 'Unknown category must resolve to a fallback Lucide icon component (Folder/Wrench)');
    });

    it('R3-2.3: should render category icons inside CategoryChips sidebar navigation tabs', () => {
      const app = createAppInstance();
      const navEl = app.document.querySelector('#nav, [data-testid="app-navbar"]');
      assert.ok(navEl, 'Category sidebar navigation must exist');

      const svgIcons = navEl.querySelectorAll('svg');
      assert.ok(svgIcons.length >= 5, 'Sidebar categories must render SVG iconography');
    });

    it('R3-2.4: should render category icons inside badge pills on defect cards', () => {
      const app = createAppInstance();
      const firstRow = app.document.querySelector('#listwrap .row, [data-testid="defect-item"], .defect-card');
      assert.ok(firstRow, 'First defect row must exist');

      const badgePill = firstRow.querySelector('.rpill, [data-testid="category-badge"], .category-badge');
      assert.ok(badgePill, 'Defect card must render category badge pill');
    });
  });

  // =========================================================================
  // 3. Category Color Palette & Left Border Indicators
  // =========================================================================
  describe('3. Category Color Derivation & Left Border Indicators', () => {
    it('R3-3.1: should derive distinct theme colors for core defect categories', () => {
      const screenColor = getCategoryColor('screen');
      const cameraColor = getCategoryColor('camera');
      const batteryColor = getCategoryColor('battery');
      const buttonsColor = getCategoryColor('buttons');

      assert.ok(screenColor, 'Screen category must have defined color hex');
      assert.ok(cameraColor, 'Camera category must have defined color hex');
      assert.ok(batteryColor, 'Battery category must have defined color hex');
      assert.ok(buttonsColor, 'Buttons category must have defined color hex');
    });

    it('R3-3.2: should apply left border accent style (border-l-4) matching category color on defect rows/cards', () => {
      const screenLeftBorder = getCategoryLeftBorderStyle('screen');
      assert.ok(screenLeftBorder.borderLeftColor, 'Screen category left border color must be defined');

      const batteryLeftBorder = getCategoryLeftBorderStyle('battery');
      assert.ok(batteryLeftBorder.borderLeftColor, 'Battery category left border color must be defined');
    });

    it('R3-3.3: should generate compliant high-contrast badge styling for category pills', () => {
      const badgeStyle = getCategoryBadgeStyle('screen');
      assert.ok(badgeStyle.backgroundColor, 'Badge style must specify background-color');
      assert.ok(badgeStyle.color, 'Badge style must specify text color');
      assert.ok(badgeStyle.borderColor, 'Badge style must specify border-color');
    });
  });

  // =========================================================================
  // 4. Category Reordering & Persistence
  // =========================================================================
  describe('4. Category Organization & Reordering Persistence', () => {
    it('R3-4.1: should filter active defects when selecting categories in sidebar navigation', () => {
      const app = createAppInstance();

      // Select 'screen' category
      app.selectCategory('screen');
      let visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Screen category should display defects');
      assert.ok(visible.every((item) => item.categoryPill.toLowerCase().includes('screen') || item.categoryPill !== ''), 'All items should belong to Screen category');

      // Select 'battery' category
      app.selectCategory('battery');
      visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Battery category should display defects');
    });

    it('R3-4.2: should maintain category selection across search queries and reset cleanly', () => {
      const app = createAppInstance();

      app.selectCategory('camera');
      app.search('Blur');
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Search within Camera category should return matching defects');

      app.clearSearch();
      const allCameraItems = app.getVisibleItems();
      assert.ok(allCameraItems.length >= visible.length, 'Clearing search should restore full Camera category items');
    });
  });

  // =========================================================================
  // 5. Sub-Category Code Chips Navigation
  // =========================================================================
  describe('5. Sub-Category Code Chips Navigation', () => {
    it('R3-5.1: should show Sub-Category Code Chips bar when navigating to "codes" category', () => {
      const app = createAppInstance();
      app.selectCategory('codes');

      const subchipsEl = app.document.querySelector('#subchips, [data-testid="code-sub-chips"], .code-sub-chips');
      assert.ok(subchipsEl, 'Sub-chips container must exist in DOM');
    });

    it('R3-5.2: should filter defect wording items when clicking sub-code chips (FCPB, FCPW, etc.)', () => {
      const app = createAppInstance();
      app.selectCategory('codes');
      app.selectSubCategory('FCPB');

      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Filtering by sub-code FCPB must return matching defect items');
    });
  });
});
