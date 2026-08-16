import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';
import { CATEGORIES, BASE_ITEMS } from '../src/data/qcData.ts';
import { getCategoryColor, getCategoryBadgeStyle, getCategoryLeftBorderStyle } from '../src/utils/categoryColors.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Milestone 3 Challenger: Component Polish & Tablet Fluidity Empirical Verification', () => {

  // =========================================================================
  // Section 1: Touch Target Hitboxes, Minimum Dimensions & Tactile Micro-States
  // =========================================================================
  describe('1. Touch Targets & Minimum Dimensions (>= 44px for Samsung Tab S9+)', () => {

    it('1.1: Header action controls, search input, clear button, and view switcher satisfy >= 44px hitboxes & active:scale-95', async () => {
      const app = createAppInstance();
      const header = app.getAppHeader();
      assert.ok(header, 'App header must exist');

      // 1. Search input & clear button
      app.search('screen');
      await waitAsync(20);
      const searchInput = header.querySelector('#search, [data-testid="header-search-input"]') as HTMLElement;
      assert.ok(searchInput, 'Search input must exist');
      const searchCls = searchInput.className;
      assert.ok(searchCls.includes('min-h-[44px]') || searchCls.includes('h-11'), 'Search input must have min-h-[44px] / h-11');

      const clearBtn = header.querySelector('#clearBtn, [data-testid="clear-search-btn"]') as HTMLElement;
      assert.ok(clearBtn, 'Clear button must exist when search query is active');
      const clearCls = clearBtn.className;
      assert.ok(
        clearCls.includes('min-h-[44px]') && clearCls.includes('min-w-[44px]') && clearCls.includes('size-11'),
        'Clear search button must have min-h-[44px] min-w-[44px] size-11'
      );
      assert.ok(clearCls.includes('active:scale-95'), 'Clear search button must have active:scale-95');

      // 2. Spotlight trigger
      const spotlightBtn = header.querySelector('#spotlightBtn, [data-testid="spotlight-trigger"]') as HTMLElement;
      assert.ok(spotlightBtn, 'Spotlight trigger button must exist');
      const spotlightCls = spotlightBtn.className;
      assert.ok(spotlightCls.includes('min-h-[44px]') || spotlightCls.includes('h-11'), 'Spotlight button must be min-h-[44px] / h-11');

      // 3. View switcher buttons
      const viewButtons = Array.from(header.querySelectorAll('#setLayout button, [data-testid="view-switcher"] button')) as HTMLElement[];
      assert.equal(viewButtons.length, 3, 'Must have 3 view switcher buttons (list, grid, table)');
      viewButtons.forEach((btn) => {
        const cls = btn.className;
        assert.ok(cls.includes('min-h-[40px]') || cls.includes('min-h-[44px]'), 'View switcher button must be >= 40-44px');
        assert.ok(cls.includes('active:scale-95'), 'View switcher button must have active:scale-95');
      });

      // 4. Primary header action buttons
      const primaryActionButtons = [
        header.querySelector('#histBtn, [data-testid="history-btn"]'),
        header.querySelector('#editBtn, [data-testid="edit-mode-toggle"]'),
        header.querySelector('#batchBtn, [data-testid="batch-btn"]'),
        header.querySelector('#setBtn, [data-testid="settings-btn"]'),
        header.querySelector('#dlBtn, [data-testid="download-offline-btn"]'),
        header.querySelector('#themeBtn, [data-testid="theme-toggle"]'),
      ].filter(Boolean) as HTMLElement[];

      assert.ok(primaryActionButtons.length >= 5, 'Must contain all primary header action buttons');
      primaryActionButtons.forEach((btn) => {
        const cls = btn.className;
        assert.ok(cls.includes('min-h-[44px]') || cls.includes('h-11'), `Header button #${btn.id} must have min-h-[44px] / h-11`);
      });
    });

    it('1.2: Category navigation tabs, folder controls, and code subchips satisfy >= 44px and active:scale-95', async () => {
      const app = createAppInstance();
      const nav = app.getAppNavbar();
      assert.ok(nav, 'Sidebar navigation container must exist');

      // Quick views buttons
      const quickViewBtns = Array.from(nav.querySelectorAll('.chips-scroll-container button[data-cat]')) as HTMLElement[];
      assert.ok(quickViewBtns.length >= 3, 'Quick view buttons must exist');
      quickViewBtns.forEach((btn) => {
        const cls = btn.className;
        assert.ok(cls.includes('min-h-[44px]'), `Quick view button ${btn.getAttribute('data-cat')} must have min-h-[44px]`);
        assert.ok(cls.includes('active:scale-95'), `Quick view button ${btn.getAttribute('data-cat')} must have active:scale-95`);
      });

      // Folder manager / create button
      const folderAddBtn = nav.querySelector('button[title*="Create New Pin Folder"]') as HTMLElement;
      if (folderAddBtn) {
        const cls = folderAddBtn.className;
        assert.ok(cls.includes('min-h-[44px]') && cls.includes('min-w-[44px]'), 'Folder create button must have min-h-[44px] min-w-[44px]');
        assert.ok(cls.includes('active:scale-95'), 'Folder create button must have active:scale-95');
      }

      // Category manager button
      const catMgrBtn = nav.querySelector('[data-testid="open-category-manager-btn"], button[title*="Manage Categories"]') as HTMLElement;
      if (catMgrBtn) {
        const cls = catMgrBtn.className;
        assert.ok(cls.includes('min-h-[44px]') && cls.includes('min-w-[44px]'), 'Category manager trigger must have min-h-[44px] min-w-[44px]');
        assert.ok(cls.includes('active:scale-95'), 'Category manager trigger must have active:scale-95');
      }

      // Subchip buttons
      app.selectCategory('codes');
      await waitAsync(30);
      const subchipContainer = app.document.querySelector('#subchips, [data-testid="code-sub-chips"]');
      assert.ok(subchipContainer, 'Code subchips container must exist');
      const subchips = Array.from(subchipContainer.querySelectorAll('button[data-sub]')) as HTMLElement[];
      assert.ok(subchips.length > 0, 'Subchips must be rendered for codes category');
      subchips.forEach((sub) => {
        const cls = sub.className;
        assert.ok(cls.includes('min-h-[44px]'), `Subchip ${sub.getAttribute('data-sub')} must have min-h-[44px]`);
        assert.ok(cls.includes('active:scale-95'), `Subchip ${sub.getAttribute('data-sub')} must have active:scale-95`);
      });
    });

    it('1.3: HistoryBar .hchip items and clear button have >= 36-40px touch padding & active:scale-95', async () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-recents': JSON.stringify(['Recent defect 1', 'Recent defect 2']),
        },
      });
      await waitAsync(30);

      const histbar = app.document.querySelector('#histbar');
      assert.ok(histbar, 'History bar must exist');

      const hchips = Array.from(histbar.querySelectorAll('.hchip')) as HTMLElement[];
      assert.equal(hchips.length, 2, 'Must render 2 recent chips');
      hchips.forEach((chip) => {
        const cls = chip.className;
        assert.ok(cls.includes('min-h-[36px]') || cls.includes('sm:min-h-[40px]'), 'Recent chip must have min-h-[36px] / sm:min-h-[40px]');
        assert.ok(cls.includes('active:scale-95'), 'Recent chip must have active:scale-95');
      });

      const clearAllBtn = histbar.querySelector('#hclearAll') as HTMLElement;
      assert.ok(clearAllBtn, 'HistoryBar clear button must exist');
      const clearCls = clearAllBtn.className;
      assert.ok(clearCls.includes('min-h-[36px]') || clearCls.includes('sm:min-h-[40px]'), 'HistoryBar clear button must have min-h-[36px] / sm:min-h-[40px]');
      assert.ok(clearCls.includes('active:scale-95'), 'HistoryBar clear button must have active:scale-95');
    });

    it('1.4: Defect card action buttons (+Batch, Star Pin, Edit, Del) satisfy min-h-[44px] across Grid, List, Table views', async () => {
      const app = createAppInstance();
      app.toggleEditMode(); // Enable edit mode to test Edit and Del buttons
      await waitAsync(30);

      const views: ('list' | 'grid' | 'table')[] = ['list', 'grid', 'table'];

      for (const view of views) {
        await app.setLayoutView(view);
        await waitAsync(30);

        const firstCard = app.document.querySelector(
          view === 'grid' ? '#listwrap .gcard' : view === 'table' ? '#listwrap .trow' : '#listwrap .row'
        ) as HTMLElement;
        assert.ok(firstCard, `First defect item in ${view} view must exist`);

        const pinBtn = firstCard.querySelector('[data-act="pin"], .pin-btn') as HTMLElement;
        assert.ok(pinBtn, `Pin button in ${view} must exist`);
        const pinCls = pinBtn.className;
        assert.ok(pinCls.includes('min-h-[44px]') && pinCls.includes('min-w-[44px]') && pinCls.includes('size-11'), `Pin button in ${view} must have min-h-[44px] min-w-[44px] size-11`);
        assert.ok(pinCls.includes('active:scale-90'), `Pin button in ${view} must have active:scale-90`);

        const addBtn = firstCard.querySelector('[data-act="add"], .add-batch-btn') as HTMLElement;
        assert.ok(addBtn, `+ Batch button in ${view} must exist`);
        const addCls = addBtn.className;
        assert.ok(addCls.includes('min-h-[44px]'), `+ Batch button in ${view} must have min-h-[44px]`);
        assert.ok(addCls.includes('active:scale-95'), `+ Batch button in ${view} must have active:scale-95`);

        const editBtn = firstCard.querySelector('[data-act="edit"], .edit-item-btn') as HTMLElement;
        assert.ok(editBtn, `Edit button in ${view} must exist in edit mode`);
        const editCls = editBtn.className;
        assert.ok(editCls.includes('min-h-[44px]'), `Edit button in ${view} must have min-h-[44px]`);
        assert.ok(editCls.includes('active:scale-95'), `Edit button in ${view} must have active:scale-95`);

        const delBtn = firstCard.querySelector('[data-act="del"], .del-item-btn') as HTMLElement;
        assert.ok(delBtn, `Del button in ${view} must exist in edit mode`);
        const delCls = delBtn.className;
        assert.ok(delCls.includes('min-h-[44px]'), `Del button in ${view} must have min-h-[44px]`);
        assert.ok(delCls.includes('active:scale-95'), `Del button in ${view} must have active:scale-95`);
      }
    });

    it('1.5: BatchDrawer action buttons (.bup, .bdn, .bcopy-item, .brm-item, #bcopy, #bclose, delimiters) satisfy touch targets', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.openBatchDrawer();
      await waitAsync(30);

      const drawer = app.getBatchDrawer();
      assert.ok(drawer, 'Batch drawer must be open');

      // Close button
      const closeBtn = drawer.querySelector('#bclose') as HTMLElement;
      assert.ok(closeBtn, 'Batch drawer close button must exist');
      const closeCls = closeBtn.className;
      assert.ok(closeCls.includes('min-h-[44px]') && closeCls.includes('min-w-[44px]') && closeCls.includes('size-11'), 'Batch close button must have min-h-[44px] min-w-[44px] size-11');

      // Reorder buttons & item actions
      const batchItems = Array.from(drawer.querySelectorAll('.bitem')) as HTMLElement[];
      assert.equal(batchItems.length, 2, 'Should have 2 batch items');

      batchItems.forEach((item, idx) => {
        const upBtn = item.querySelector('.bup') as HTMLElement;
        const dnBtn = item.querySelector('.bdn') as HTMLElement;
        const copyBtn = item.querySelector('.bcopy-item') as HTMLElement;
        const rmBtn = item.querySelector('.brm-item') as HTMLElement;

        assert.ok(upBtn, `Move up button on item ${idx} must exist`);
        assert.ok(upBtn.className.includes('min-h-[44px]') && upBtn.className.includes('min-w-[44px]') && upBtn.className.includes('size-11'), 'bup must be >= 44x44px');

        assert.ok(dnBtn, `Move down button on item ${idx} must exist`);
        assert.ok(dnBtn.className.includes('min-h-[44px]') && dnBtn.className.includes('min-w-[44px]') && dnBtn.className.includes('size-11'), 'bdn must be >= 44x44px');

        assert.ok(copyBtn, `Single copy button on item ${idx} must exist`);
        assert.ok(copyBtn.className.includes('min-h-[44px]'), 'bcopy-item must have min-h-[44px]');
        assert.ok(copyBtn.className.includes('active:scale-95'), 'bcopy-item must have active:scale-95');

        assert.ok(rmBtn, `Remove button on item ${idx} must exist`);
        assert.ok(rmBtn.className.includes('min-h-[44px]') && rmBtn.className.includes('min-w-[44px]') && rmBtn.className.includes('size-11'), 'brm-item must be >= 44x44px');
      });

      // Segmented delimiter buttons
      const delimBtns = Array.from(drawer.querySelectorAll('button[title*="Newline"], button[title*="Comma"], button[title*="Semicolon"]')) as HTMLElement[];
      assert.ok(delimBtns.length >= 3, 'Delimiter segmented buttons must exist');
      delimBtns.forEach((btn) => {
        assert.ok(btn.className.includes('min-h-[44px]'), 'Delimiter button must have min-h-[44px]');
        assert.ok(btn.className.includes('active:scale-95'), 'Delimiter button must have active:scale-95');
      });

      // Big Copy Batch Button
      const copyAllBtn = drawer.querySelector('#bcopy') as HTMLElement;
      assert.ok(copyAllBtn, '#bcopy button must exist');
      assert.ok(copyAllBtn.className.includes('min-h-[48px]') || copyAllBtn.className.includes('h-12'), '#bcopy button must have min-h-[48px] / h-12');
    });

    it('1.6: Modal & Sheet primitive close buttons provide min-h-[44px] min-w-[44px] size-11 and active:scale-95', () => {
      const dialogSrc = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'ui', 'dialog.tsx'), 'utf8');
      const sheetSrc = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'ui', 'sheet.tsx'), 'utf8');

      // Verify Dialog close button
      assert.ok(dialogSrc.includes('min-h-[44px]'), 'Dialog close button must include min-h-[44px]');
      assert.ok(dialogSrc.includes('min-w-[44px]'), 'Dialog close button must include min-w-[44px]');
      assert.ok(dialogSrc.includes('size-11'), 'Dialog close button must include size-11');
      assert.ok(dialogSrc.includes('active:scale-95'), 'Dialog close button must include active:scale-95');

      // Verify Sheet close button
      assert.ok(sheetSrc.includes('min-h-[44px]'), 'Sheet close button must include min-h-[44px]');
      assert.ok(sheetSrc.includes('min-w-[44px]'), 'Sheet close button must include min-w-[44px]');
      assert.ok(sheetSrc.includes('size-11'), 'Sheet close button must include size-11');
      assert.ok(sheetSrc.includes('active:scale-95'), 'Sheet close button must include active:scale-95');
    });

    it('1.7: Color swatch buttons and option buttons in SettingsModal satisfy touch targets & micro-interactions', async () => {
      const app = createAppInstance();
      await app.openSettingsModal();
      await waitAsync(30);

      // Color swatch buttons rendered in portaled Dialog
      const swatchBtns = Array.from(app.document.querySelectorAll('#setAccent button[data-accent]')) as HTMLElement[];
      assert.ok(swatchBtns.length >= 6, 'Must have at least 6 accent color swatches');
      swatchBtns.forEach((swatch) => {
        const cls = swatch.className;
        assert.ok(cls.includes('min-h-[44px]'), `Accent swatch ${swatch.getAttribute('data-accent')} must have min-h-[44px]`);
        assert.ok(cls.includes('active:scale-95'), `Accent swatch ${swatch.getAttribute('data-accent')} must have active:scale-95`);
      });

      // Density option buttons
      const densityBtns = Array.from(app.document.querySelectorAll('#setDensity button[data-density]')) as HTMLElement[];
      assert.equal(densityBtns.length, 3, 'Must have 3 density buttons');
      densityBtns.forEach((btn) => {
        const cls = btn.className;
        assert.ok(cls.includes('min-h-[48px]'), `Density button ${btn.getAttribute('data-density')} must have min-h-[48px]`);
        assert.ok(cls.includes('active:scale-95'), `Density button ${btn.getAttribute('data-density')} must have active:scale-95`);
      });

      // Done button
      const doneBtn = app.document.querySelector('#setdone, [data-testid="settings-close-btn"]') as HTMLElement;
      assert.ok(doneBtn, 'Settings Done button must exist');
      assert.ok(doneBtn.className.includes('min-h-[44px]'), 'Done button must have min-h-[44px]');
      assert.ok(doneBtn.className.includes('active:scale-95'), 'Done button must have active:scale-95');
    });

  });

  // =========================================================================
  // Section 2: Layer 3 Surface Architecture & Depth Consistency
  // =========================================================================
  describe('2. Layer 3 Surface Class & Warm Charcoal Multi-Layer Architecture', () => {

    it('2.1: HistoryDrawer container and header are elevated to Layer 3 (#22222a border-stone-700/60)', async () => {
      const now = Date.now();
      const entries = [
        { id: 'h1', text: 'Sample history item', category: 'screen', timestamp: now - 5000 },
      ];
      const app = createAppInstance({
        initialStorage: { 'qc-history-entries': JSON.stringify(entries) },
      });

      await app.openHistoryDrawer();
      await waitAsync(40);

      const historyDrawer = app.getHistoryDrawer();
      assert.ok(historyDrawer, 'History drawer must exist in DOM');

      const drawerCls = historyDrawer.className;
      assert.ok(drawerCls.includes('bg-[#22222a]'), 'HistoryDrawer SheetContent must have bg-[#22222a]');
      assert.ok(drawerCls.includes('border-stone-700/60'), 'HistoryDrawer SheetContent must have border-stone-700/60');

      // Inner header container
      const drawerHeader = historyDrawer.firstElementChild as HTMLElement;
      assert.ok(drawerHeader, 'Drawer inner header must exist');
      const headerCls = drawerHeader.className;
      assert.ok(headerCls.includes('bg-[#22222a]'), 'HistoryDrawer inner header must have bg-[#22222a]');
      assert.ok(headerCls.includes('border-stone-700/60'), 'HistoryDrawer inner header must have border-stone-700/60');
    });

    it('2.2: BatchDrawer container uses Layer 3 (#22222a border-stone-700/60)', async () => {
      const app = createAppInstance();
      await app.openBatchDrawer();
      await waitAsync(30);

      const batchDrawer = app.getBatchDrawer();
      assert.ok(batchDrawer, 'Batch drawer must exist');

      const drawerCls = batchDrawer.className;
      assert.ok(drawerCls.includes('bg-[#22222a]'), 'BatchDrawer must have bg-[#22222a]');
      assert.ok(drawerCls.includes('border-stone-700/60'), 'BatchDrawer must have border-stone-700/60');
    });

    it('2.3: Modals (SettingsModal, EditModal, CategoryManagerModal) use Layer 3 #22222a & border-stone-700/60', async () => {
      const app = createAppInstance();

      // 1. SettingsModal
      await app.openSettingsModal();
      await waitAsync(30);
      const settingsContent = app.document.querySelector('[role="dialog"]') as HTMLElement;
      assert.ok(settingsContent, 'Settings dialog content must exist');
      const settingsCls = settingsContent.className;
      assert.ok(settingsCls.includes('bg-[#22222a]') || settingsCls.includes('bg-stone-900'), 'SettingsModal must have Layer 3 background');
      assert.ok(settingsCls.includes('border-stone-700/60'), 'SettingsModal must have border-stone-700/60');
      await app.closeSettingsModal();

      // 2. EditModal source check
      const editModalSrc = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'EditModal.tsx'), 'utf8');
      assert.ok(editModalSrc.includes('bg-[#22222a]'), 'EditModal must have bg-[#22222a]');
      assert.ok(editModalSrc.includes('border-stone-700/60'), 'EditModal must have border-stone-700/60');

      // 3. CategoryManagerModal source check
      const catMgrSrc = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'CategoryManagerModal.tsx'), 'utf8');
      assert.ok(catMgrSrc.includes('bg-[#22222a]'), 'CategoryManagerModal must have bg-[#22222a]');
      assert.ok(catMgrSrc.includes('border-stone-700/60'), 'CategoryManagerModal must have border-stone-700/60');
    });

    it('2.4: Radix UI dialog and sheet base primitives enforce Layer 3 (#22222a border-stone-700/60)', () => {
      const dialogSrc = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'ui', 'dialog.tsx'), 'utf8');
      const sheetSrc = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'ui', 'sheet.tsx'), 'utf8');

      assert.ok(dialogSrc.includes('bg-[#22222a]'), 'dialog.tsx must default to bg-[#22222a]');
      assert.ok(dialogSrc.includes('border-stone-700/60'), 'dialog.tsx must default to border-stone-700/60');

      assert.ok(sheetSrc.includes('bg-[#22222a]'), 'sheet.tsx must default to bg-[#22222a]');
      assert.ok(sheetSrc.includes('border-stone-700/60'), 'sheet.tsx must default to border-stone-700/60');
    });

  });

  // =========================================================================
  // Section 3: Category Accent Flow into BatchDrawer & EditModal
  // =========================================================================
  describe('3. Category Accent Flow into Batch Drawer Items & Edit Modal Options', () => {

    it('3.1: BatchDrawer items matching known QC items display category pill badges and border-l-4 left accent colors', async () => {
      const app = createAppInstance();

      // Find known items across different categories
      const screenItem = BASE_ITEMS.find((i) => i.c === 'screen');
      const batteryItem = BASE_ITEMS.find((i) => i.c === 'battery');
      assert.ok(screenItem && batteryItem, 'Must have sample items');

      // Add to batch queue
      const initialStorage = {
        'qc-batch': JSON.stringify([screenItem.t, batteryItem.t, 'Custom unmatched defect note']),
      };
      const testApp = createAppInstance({ initialStorage });
      await testApp.openBatchDrawer();
      await waitAsync(40);

      const batchDrawer = testApp.getBatchDrawer();
      assert.ok(batchDrawer, 'Batch drawer must be open');

      const batchItemEls = Array.from(batchDrawer.querySelectorAll('.bitem')) as HTMLElement[];
      assert.equal(batchItemEls.length, 3, 'Must render 3 batch items');

      // 1. First item: Screen category
      const item0 = batchItemEls[0];
      assert.ok(item0.className.includes('border-l-4'), 'Screen batch item must have border-l-4 class');
      const style0 = item0.getAttribute('style') || '';
      assert.ok(style0.includes('border-left-color'), 'Screen batch item must have border-left-color inline style');
      const pill0 = item0.querySelector('.rpill') as HTMLElement;
      assert.ok(pill0, 'Screen batch item must have .rpill badge');
      assert.equal(pill0.textContent?.trim().toLowerCase(), 'screen');

      // 2. Second item: Battery category
      const item1 = batchItemEls[1];
      assert.ok(item1.className.includes('border-l-4'), 'Battery batch item must have border-l-4 class');
      const style1 = item1.getAttribute('style') || '';
      assert.ok(style1.includes('border-left-color'), 'Battery batch item must have border-left-color inline style');
      const pill1 = item1.querySelector('.rpill') as HTMLElement;
      assert.ok(pill1, 'Battery batch item must have .rpill badge');
      assert.equal(pill1.textContent?.trim().toLowerCase(), 'battery');

      // 3. Third item: Unmatched custom text (should not crash and gracefully omit badge)
      const item2 = batchItemEls[2];
      const pill2 = item2.querySelector('.rpill');
      assert.equal(pill2, null, 'Unmatched custom item should not render pill badge');
    });

    it('3.2: EditModal dropdown options render category color dots matching each category config', () => {
      const editModalSrc = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'EditModal.tsx'), 'utf8');

      // Verify category color dot rendering
      assert.ok(
        editModalSrc.includes('backgroundColor: cat.color') || editModalSrc.includes('style={{ backgroundColor: cat.color }}'),
        'EditModal must render category color dots with style={{ backgroundColor: cat.color }}'
      );

      // Verify option item height and styling
      assert.ok(editModalSrc.includes('min-h-[44px]'), 'EditModal category dropdown items must have min-h-[44px]');
      assert.ok(editModalSrc.includes('py-2.5'), 'EditModal category dropdown items must have py-2.5 padding');
    });

    it('3.3: HistoryDrawer auto-sessions items render category pill badges and left accent borders', async () => {
      const now = Date.now();
      const entries = [
        { id: 'h1', text: 'Camera lens foggy', category: 'camera', itemNumber: 301, timestamp: now - 1000 },
        { id: 'h2', text: 'Touch deadzone', category: 'screen', itemNumber: 104, timestamp: now - 2000 },
      ];

      const app = createAppInstance({
        initialStorage: { 'qc-history-entries': JSON.stringify(entries) },
      });

      await app.openHistoryDrawer();
      await waitAsync(40);

      const renderedEntries = Array.from(app.document.querySelectorAll('[data-testid="history-entry"]')) as HTMLElement[];
      assert.equal(renderedEntries.length, 2);

      const entry0 = renderedEntries[0];
      const style0 = entry0.getAttribute('style') || '';
      assert.ok(style0.includes('border-left-color'), 'History item 0 must have border-left-color style');
      const pill0 = entry0.querySelector('.rpill') as HTMLElement;
      assert.ok(pill0, 'History item 0 must have .rpill badge');
      assert.equal(pill0.textContent?.trim().toLowerCase(), 'camera');

      const entry1 = renderedEntries[1];
      const style1 = entry1.getAttribute('style') || '';
      assert.ok(style1.includes('border-left-color'), 'History item 1 must have border-left-color style');
      const pill1 = entry1.querySelector('.rpill') as HTMLElement;
      assert.ok(pill1, 'History item 1 must have .rpill badge');
      assert.equal(pill1.textContent?.trim().toLowerCase(), 'screen');
    });

  });

  // =========================================================================
  // Section 4: Micro-Interactions, Global CSS Rules & Tactile Response
  // =========================================================================
  describe('4. Tactile Micro-Interactions & CSS Active Feedback', () => {

    it('4.1: index.css defines hover elevation and active scale(0.99) on .gcard, .row, and .trow', () => {
      const cssContent = fs.readFileSync(path.join(projectRoot, 'src', 'index.css'), 'utf8');

      // Hover elevation
      assert.ok(
        cssContent.includes('.gcard:hover') || cssContent.includes('.row:hover') || cssContent.includes('.trow:hover'),
        'Hover state must be styled on defect card containers'
      );
      assert.ok(
        cssContent.includes('var(--defect-card-bg-hover)') || cssContent.includes('#22222a'),
        'Defect card hover must elevate to #22222a / --defect-card-bg-hover'
      );

      // Active scaling
      assert.ok(
        cssContent.includes('.gcard:active') && cssContent.includes('.row:active') && cssContent.includes('.trow:active'),
        'Active state selectors must target .gcard:active, .row:active, .trow:active'
      );
      assert.ok(
        cssContent.includes('transform: scale(0.99)') || cssContent.includes('scale(0.99)'),
        'Defect cards must scale to 0.99 on active touch/click'
      );
    });

    it('4.2: buttonVariants in button.tsx universally includes active:scale-95 transition', () => {
      const btnSrc = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'ui', 'button.tsx'), 'utf8');
      assert.ok(btnSrc.includes('active:scale-95'), 'button.tsx base buttonVariants must include active:scale-95');
      assert.ok(btnSrc.includes('transition-all'), 'button.tsx base buttonVariants must include transition-all');
    });

    it('4.3: Table container supports horizontal touch scrolling with overflow-x-auto & touch-scroll', async () => {
      const app = createAppInstance();
      await app.setLayoutView('table');
      await waitAsync(30);

      const tableWrapper = app.document.querySelector('.wording-table-wrapper') as HTMLElement;
      assert.ok(tableWrapper, 'Table container must exist in table view');
      const cls = tableWrapper.className;
      assert.ok(
        cls.includes('overflow-x-auto') && cls.includes('touch-scroll'),
        'Table container must support touch scrolling with overflow-x-auto and touch-scroll'
      );
    });

  });

});
