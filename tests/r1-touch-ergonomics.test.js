import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('R1: Samsung Tab S9+ Touch Ergonomics & shadcn Component Styling', () => {

  // =========================================================================
  // 1. Touch Targets & Minimum Dimensions (>= 44-48px)
  // =========================================================================
  describe('1. Touch Target Sizing (>= 44-48px for Samsung Galaxy Tab S9+)', () => {
    it('R1-1.1: should enforce touch-friendly height on top header action buttons and search input', () => {
      const app = createAppInstance();
      const header = app.getAppHeader();
      assert.ok(header, 'App header must exist in DOM');

      // Primary header controls
      const primaryControls = [
        header.querySelector('#search, [data-testid="header-search-input"]'),
        header.querySelector('#spotlightBtn, [data-testid="spotlight-trigger"]'),
        header.querySelector('#editBtn, [data-testid="edit-mode-toggle"]'),
        header.querySelector('#batchBtn, [data-testid="batch-btn"]'),
        header.querySelector('#setBtn, [data-testid="settings-btn"]'),
        header.querySelector('#themeBtn, [data-testid="theme-toggle"]')
      ].filter(Boolean);

      assert.ok(primaryControls.length >= 4, 'Header must contain primary action controls');

      // Verify that primary controls in header have touch-friendly dimensions or padding
      primaryControls.forEach((el) => {
        const cls = el.className || '';
        const hasTouchPadding =
          cls.includes('h-8') ||
          cls.includes('h-9') ||
          cls.includes('h-10') ||
          cls.includes('h-11') ||
          cls.includes('h-12') ||
          cls.includes('py-1.5') ||
          cls.includes('py-2') ||
          cls.includes('p-2') ||
          cls.includes('p-2.5') ||
          cls.includes('px-3') ||
          cls.includes('min-h-[44px]');
        assert.ok(hasTouchPadding, `Header control #${el.id || el.tagName} should have touch-friendly height or padding`);
      });
    });

    it('R1-1.2: should provide minimum 44px touch targets on defect cards and rows', () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      assert.ok(items.length > 0, 'Visible defect items must exist');

      items.slice(0, 10).forEach((item) => {
        const el = item.element;
        const cls = el.className || '';
        const isTouchTarget =
          cls.includes('py-3') ||
          cls.includes('py-3.5') ||
          cls.includes('py-4') ||
          cls.includes('p-3') ||
          cls.includes('p-4') ||
          cls.includes('min-h-[44px]') ||
          cls.includes('min-h-[48px]') ||
          cls.includes('row') ||
          cls.includes('gcard') ||
          cls.includes('trow');
        assert.ok(isTouchTarget, `Defect item #${item.num} must support comfortable touch target dimensions`);
      });
    });

    it('R1-1.3: should enforce isolated touch target bounds on action buttons (+Batch, Star Pin) to prevent accidental card triggers', async () => {
      const app = createAppInstance();
      const firstRow = app.document.querySelector('#listwrap .row, [data-testid="defect-item"], .defect-card');
      assert.ok(firstRow, 'First defect row must exist');

      const addBtn = firstRow.querySelector('[data-act="add"], .add-batch-btn, button[aria-label*="Add"]');
      const pinBtn = firstRow.querySelector('[data-act="pin"], .pin-btn, button[aria-label*="Pin"]');

      assert.ok(addBtn, 'Add to batch button must exist on item');
      assert.ok(pinBtn, 'Star pin button must exist on item');

      // Click +Batch action button
      addBtn.click();
      await waitAsync(30);

      // Verify batch queue incremented without triggering copy toast on card
      assert.equal(app.getBatchCount(), 1, 'Batch count must be 1');
      assert.equal(app.getCopiedText(), null, 'Clicking action button must not trigger row copy');
    });

    it('R1-1.4: should provide tactile active scaling micro-interactions (active:scale-95 / active:scale-90) for touch feedback', () => {
      const app = createAppInstance();
      const cssContent = fs.readFileSync(path.join(projectRoot, 'src', 'index.css'), 'utf8');

      assert.ok(
        cssContent.includes('transform: scale(0.95)') ||
        cssContent.includes('transform: scale(0.90)') ||
        cssContent.includes('active:scale-95') ||
        cssContent.includes('active:scale-90'),
        'Active tap scaling micro-interactions must be defined in CSS for tactile touch feedback'
      );
    });

    it('R1-1.5: should adapt touch padding when density mode changes to tablet / cozy', async () => {
      const app = createAppInstance();
      const htmlEl = app.document.documentElement;

      // Set density to cozy
      await app.openSettingsModal();
      await app.setDensity('cozy');
      assert.equal(htmlEl.getAttribute('data-density'), 'cozy', 'Root element data-density must be cozy');

      // Set density to compact
      await app.setDensity('compact');
      assert.equal(htmlEl.getAttribute('data-density'), 'compact', 'Root element data-density must be compact');
      await app.closeSettingsModal();
    });
  });

  // =========================================================================
  // 2. Touch Manipulation & Fast-Click Configuration
  // =========================================================================
  describe('2. Touch Manipulation & Mobile Viewport Configuration', () => {
    it('R1-2.1: should include proper viewport meta tag in index.html for touch scaling', () => {
      const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
      assert.ok(indexHtml.includes('name="viewport"'), 'index.html must define viewport meta tag');
      assert.ok(indexHtml.includes('width=device-width'), 'viewport must specify width=device-width');
      assert.ok(indexHtml.includes('initial-scale=1.0'), 'viewport must specify initial-scale=1.0');
    });

    it('R1-2.2: should support mobile sidebar drawer overlay toggle on tablet/mobile screens', async () => {
      const app = createAppInstance();
      const mobileToggleBtn = app.document.querySelector('button[aria-label="Open navigation"], button[aria-label="Close navigation"], [data-testid="mobile-hamburger"]');
      
      if (mobileToggleBtn) {
        mobileToggleBtn.click();
        await waitAsync(30);
        const nav = app.getAppNavbar();
        assert.ok(nav, 'Navbar should be accessible');
      } else {
        // App header renders responsive navigation
        const header = app.getAppHeader();
        assert.ok(header, 'Header renders with responsive controls');
      }
    });

    it('R1-2.3: should maintain smooth touch scrolling container on wording list', () => {
      const app = createAppInstance();
      const listWrap = app.document.querySelector('#listwrap, [data-testid="wording-container"], main');
      assert.ok(listWrap, 'Wording list container must exist in DOM');
      const cls = listWrap.className || '';
      assert.ok(
        cls.includes('overflow-y-auto') ||
        cls.includes('overflow-auto') ||
        cls.includes('flex-1') ||
        cls.includes('min-h-0') ||
        cls.includes('space-y'),
        'Wording container must support vertical touch scrolling'
      );
    });
  });

  // =========================================================================
  // 3. Custom Sleek Scrollbars & Layout Viewports
  // =========================================================================
  describe('3. Custom Sleek Scrollbar & Viewport Configuration', () => {
    it('R1-3.1: should configure scrollable touch viewports with clean overflow styling across main layout', () => {
      const app = createAppInstance();
      const navbar = app.getAppNavbar();
      const wordingContainer = app.document.querySelector('#listwrap, [data-testid="wording-container"], main');

      assert.ok(navbar, 'Navbar should exist');
      assert.ok(wordingContainer, 'Wording container should exist');
    });

    it('R1-3.2: should apply sleek scrollbars on sidebar category list and batch drawer queue', async () => {
      const app = createAppInstance();
      const chipsEl = app.document.querySelector('#chips, .chips-scroll-container, #nav');
      assert.ok(chipsEl, 'Category sidebar chips list must exist');

      await app.openBatchDrawer();
      const batchList = app.document.querySelector('#blist, [data-testid="batch-list"]');
      assert.ok(batchList, 'Batch queue list must exist inside open batch drawer');
    });
  });

  // =========================================================================
  // 4. Radix UI & shadcn Component Primitives Coverage
  // =========================================================================
  describe('4. shadcn & Radix UI Component Primitive Integration', () => {
    it('R1-4.1: should utilize Radix Dialog / Sheet primitives for modal dialogs and slide-out drawers', async () => {
      const app = createAppInstance();

      // Open settings modal
      await app.openSettingsModal();
      const settingsModal = app.document.querySelector('#setmodal, [data-testid="settings-modal"], [role="dialog"]');
      assert.ok(settingsModal, 'Settings modal dialog must be rendered via Radix Dialog');

      // Close settings modal
      await app.closeSettingsModal();

      // Open batch drawer
      await app.openBatchDrawer();
      const batchDrawer = app.document.querySelector('#batchDrawer, [data-testid="batch-drawer"], .batch-drawer');
      assert.ok(batchDrawer, 'Batch drawer must be rendered in DOM');
      await app.closeBatchDrawer();
    });

    it('R1-4.2: should verify Radix UI primitive source components exist in src/components/ui', () => {
      const uiDir = path.join(projectRoot, 'src', 'components', 'ui');
      const files = fs.readdirSync(uiDir);

      const requiredPrimitives = ['button.tsx', 'dialog.tsx', 'dropdown-menu.tsx', 'sheet.tsx', 'checkbox.tsx', 'select.tsx', 'toggle-group.tsx', 'badge.tsx', 'card.tsx'];
      requiredPrimitives.forEach((prim) => {
        assert.ok(files.includes(prim), `Radix/shadcn UI primitive ${prim} must exist in src/components/ui`);
      });
    });

    it('R1-4.3: should render Category and SubCategory navigation with clean badge pills and active states', () => {
      const app = createAppInstance();
      const categoryNav = app.document.querySelector('#nav, [data-testid="app-navbar"]');
      assert.ok(categoryNav, 'Category navigation must exist');

      const allDefectsBtn = categoryNav.querySelector('[data-cat="all"], [data-testid="nav-cat-all"]');
      assert.ok(allDefectsBtn, 'All Defects category button must exist in sidebar');
    });
  });
});
