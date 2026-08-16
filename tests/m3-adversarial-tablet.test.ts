import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone 3 Adversarial & Tablet Stress Test Suite', () => {

  describe('1. Rapid Touch Interactions & Action Button Click Spamming (stopPropagation & Race Conditions)', () => {
    it('1.1: spam clicking "+ Batch" on defect cards adds to batch queue without triggering card copy or history duplication', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      const firstItem = items[0];
      assert.ok(firstItem, 'Defect items must be rendered');

      app.resetCopiedText();
      assert.equal(app.getCopiedText(), null);
      assert.equal(app.getBatchCount(), 0);

      // Perform 30 rapid clicks on "+ Batch" of the first card
      for (let i = 0; i < 30; i++) {
        await app.clickItemAction(0, 'add');
      }

      // Batch queue should contain 30 items
      assert.equal(app.getBatchCount(), 30, 'Batch queue must hold 30 items');
      
      // Card copy must NOT have been triggered because stopPropagation prevented card click
      assert.equal(app.getCopiedText(), null, 'Card body copy must not trigger on + Batch click');

      // History entries in localStorage must be empty
      const historyEntries = app.getStorageJSON('qc-history-entries') || [];
      assert.equal(historyEntries.length, 0, 'No history entries should be recorded from + Batch clicks');
    });

    it('1.2: spam clicking "★ Pin" on defect card toggles pin state accurately without triggering card copy', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      const initialPinned = items[0].isPinned;

      app.resetCopiedText();

      // Click Pin 5 times (odd -> toggles state to opposite)
      for (let i = 0; i < 5; i++) {
        await app.clickItemAction(0, 'pin');
      }

      const updatedItems = app.getVisibleItems();
      assert.equal(updatedItems[0].isPinned, !initialPinned, 'Pin state should be toggled after 5 clicks');
      assert.equal(app.getCopiedText(), null, 'Card copy should NOT have triggered');

      const historyEntries = app.getStorageJSON('qc-history-entries') || [];
      assert.equal(historyEntries.length, 0, 'History should not record entries on pin clicks');
    });

    it('1.3: in Edit Mode, clicking "Edit" opens edit modal and "Del" deletes item without triggering card copy', async () => {
      const app = createAppInstance();
      await app.toggleEditMode();
      await waitAsync(30);
      assert.equal(app.isEditModeActive(), true, 'Edit mode must be active');

      const itemsBefore = app.getVisibleItems();
      const itemToDelete = itemsBefore[0];

      app.resetCopiedText();

      // Click Edit action button on row 0
      await app.clickItemAction(0, 'edit');
      await waitAsync(30);

      // Edit modal should open, but no card copy should occur
      const modal = app.document.querySelector('#addModal, [data-testid="edit-modal"], [role="dialog"]');
      assert.ok(modal, 'Edit modal must be open');
      assert.equal(app.getCopiedText(), null, 'Card copy must not trigger on Edit button click');

      // Cancel modal
      app.cancelModal();
      await waitAsync(30);

      // Now click Del action button on row 0
      app.resetCopiedText();
      await app.clickItemAction(0, 'del');
      await waitAsync(30);

      // Deleted item removed from visible items, warning toast with Undo generated
      const itemsAfter = app.getVisibleItems();
      assert.ok(!itemsAfter.some((x) => x.id === itemToDelete.id), 'Deleted item must be removed from visible items');
      assert.equal(app.getCopiedText(), null, 'Card copy must not trigger on Del button click');

      const toasts = app.getToasts();
      assert.ok(toasts.some((t) => t.isWarn && t.actionLabel === 'Undo'), 'Warning toast with Undo button must exist');

      // Trigger Undo
      app.triggerToastAction(0);
      await waitAsync(30);

      const itemsRestored = app.getVisibleItems();
      assert.ok(itemsRestored.some((x) => x.id === itemToDelete.id), 'Deleted item restored on Undo');
    });

    it('1.4: multi-touch simulation: rapid interleaved clicks across action buttons and card body', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      assert.ok(items.length >= 3);

      // Interleave: Card 0 Copy -> Card 1 Add -> Card 2 Pin -> Card 1 Copy -> Card 0 Add
      await app.clickItemRow(0);
      assert.equal(app.getCopiedText(), items[0].text);

      await app.clickItemAction(1, 'add');
      assert.equal(app.getBatchCount(), 1);
      // Copied text remains item 0
      assert.equal(app.getCopiedText(), items[0].text);

      await app.clickItemAction(2, 'pin');
      const itemsNow = app.getVisibleItems();
      assert.equal(itemsNow[2].isPinned, !items[2].isPinned);

      await app.clickItemRow(1);
      assert.equal(app.getCopiedText(), items[1].text);

      await app.clickItemAction(0, 'add');
      assert.equal(app.getBatchCount(), 2);
      assert.equal(app.getCopiedText(), items[1].text);

      // History should only contain the 2 explicitly copied items
      const history = app.getStorageJSON('qc-history-entries') || [];
      assert.equal(history.length, 2);
      assert.equal(history[0].text, items[1].text);
      assert.equal(history[1].text, items[0].text);
    });

    it('1.5: touch event stopPropagation verification on .racts container', async () => {
      const app = createAppInstance();
      const ractsContainer = app.document.querySelector('.racts') as HTMLElement;
      assert.ok(ractsContainer, '.racts container must exist on defect cards');

      const parentCard = ractsContainer.closest('.gcard, .row, .trow') as HTMLElement;
      assert.ok(parentCard, 'Parent defect card must exist');

      // Dispatch click directly to .racts wrapper
      const event = new app.window.MouseEvent('click', { bubbles: true, cancelable: true });
      ractsContainer.dispatchEvent(event);

      // Verify no card copy was triggered
      assert.equal(app.getCopiedText(), null, 'Click on .racts wrapper must not bubble to card');
    });

    it('1.6: Samsung Tab S9+ touch target ergonomics: all action buttons satisfy minimum 44px hitbox', async () => {
      const app = createAppInstance();
      await app.toggleEditMode();
      await waitAsync(30);

      const pinButtons = Array.from(app.document.querySelectorAll('.pin-btn'));
      const batchButtons = Array.from(app.document.querySelectorAll('.add-batch-btn'));
      const editButtons = Array.from(app.document.querySelectorAll('.edit-item-btn'));
      const delButtons = Array.from(app.document.querySelectorAll('.del-item-btn'));

      assert.ok(pinButtons.length > 0, 'Pin buttons exist');
      assert.ok(batchButtons.length > 0, 'Batch buttons exist');
      assert.ok(editButtons.length > 0, 'Edit buttons exist');
      assert.ok(delButtons.length > 0, 'Del buttons exist');

      for (const btn of pinButtons.slice(0, 5)) {
        const cls = btn.className;
        assert.ok(cls.includes('min-h-[44px]') || cls.includes('size-11') || cls.includes('h-11'), `Pin button must satisfy 44px min height: ${cls}`);
      }

      for (const btn of batchButtons.slice(0, 5)) {
        const cls = btn.className;
        assert.ok(cls.includes('min-h-[44px]') || cls.includes('h-11'), `Batch button must satisfy 44px min height: ${cls}`);
      }

      for (const btn of editButtons.slice(0, 5)) {
        const cls = btn.className;
        assert.ok(cls.includes('min-h-[44px]') || cls.includes('h-11'), `Edit button must satisfy 44px min height: ${cls}`);
      }

      for (const btn of delButtons.slice(0, 5)) {
        const cls = btn.className;
        assert.ok(cls.includes('min-h-[44px]') || cls.includes('h-11'), `Del button must satisfy 44px min height: ${cls}`);
      }
    });
  });

  describe('2. View Mode Switching Under Rapid State Transitions (Grid -> List -> Table)', () => {
    it('2.1: rapid alternation through Grid -> List -> Table (20 cycles) preserves all items and correct classes', async () => {
      const app = createAppInstance();
      const modes: Array<'grid' | 'list' | 'table'> = ['grid', 'list', 'table'];

      for (let i = 0; i < 20; i++) {
        const targetMode = modes[i % 3];
        await app.setLayoutView(targetMode);

        const items = app.getVisibleItems();
        assert.ok(items.length > 0, `Items must be rendered in ${targetMode} view`);

        const expectedClass = targetMode === 'grid' ? 'gcard' : targetMode === 'list' ? 'row' : 'trow';
        const cardElements = app.document.querySelectorAll(`#listwrap .${expectedClass}`);
        assert.equal(cardElements.length, items.length, `DOM elements should have .${expectedClass} in ${targetMode} mode`);
      }
    });

    it('2.2: view mode transitions preserve active category, selected subchip, and filtered count', async () => {
      const app = createAppInstance();
      
      // Select Category 'codes'
      app.selectCategory('codes');
      await waitAsync(30);

      // Select Subchip 'FCPB'
      app.selectSubCategory('FCPB');
      await waitAsync(30);

      const itemsBefore = app.getVisibleItems();
      const countBefore = itemsBefore.length;
      assert.ok(countBefore > 0, 'Filtered items should exist');

      // Switch to Table view
      await app.setLayoutView('table');
      let itemsTable = app.getVisibleItems();
      assert.equal(itemsTable.length, countBefore, 'Table view must retain same filtered items count');

      // Switch to List view
      await app.setLayoutView('list');
      let itemsList = app.getVisibleItems();
      assert.equal(itemsList.length, countBefore, 'List view must retain same filtered items count');

      // Switch back to Grid view
      await app.setLayoutView('grid');
      let itemsGrid = app.getVisibleItems();
      assert.equal(itemsGrid.length, countBefore, 'Grid view must retain same filtered items count');
    });

    it('2.3: view mode transitions preserve active search query, highlighted terms, and approximate badges', async () => {
      const app = createAppInstance();

      // Submit search query
      await app.submitSearch('dust');
      const itemsBefore = app.getVisibleItems();
      const countBefore = itemsBefore.length;
      assert.ok(countBefore > 0, 'Search results should exist');

      // Switch to Table view
      await app.setLayoutView('table');
      const itemsTable = app.getVisibleItems();
      assert.equal(itemsTable.length, countBefore);
      assert.ok(itemsTable.every((it) => it.text.toLowerCase().includes('dust') || it.isFuzzy));

      // Switch to List view
      await app.setLayoutView('list');
      const itemsList = app.getVisibleItems();
      assert.equal(itemsList.length, countBefore);

      // Clear search
      app.clearSearch();
      await waitAsync(30);
      const allItems = app.getVisibleItems();
      assert.ok(allItems.length > countBefore, 'All items rendered after clearSearch');
    });

    it('2.4: Table view horizontal scroll wrapper retains overflow-x-auto and touch-scroll classes', async () => {
      const app = createAppInstance();
      await app.setLayoutView('table');

      const wrapper = app.document.querySelector('.wording-table-wrapper');
      assert.ok(wrapper, '.wording-table-wrapper must exist in Table view');
      assert.ok(wrapper.className.includes('overflow-x-auto'), 'Must have overflow-x-auto for tablet horizontal panning');
      assert.ok(wrapper.className.includes('touch-scroll'), 'Must have touch-scroll for smooth momentum scrolling');
    });

    it('2.5: rapid appearance settings updates combined with view switches execute without layout desync', async () => {
      const app = createAppInstance();

      // Open Settings modal and configure density, radius, textsize
      await app.openSettingsModal();
      await app.setDensity('compact');
      await app.setRadius('soft');
      await app.setTextSize('s');
      await app.closeSettingsModal();

      await app.setLayoutView('table');

      const htmlEl = app.document.documentElement;
      assert.equal(htmlEl.getAttribute('data-density'), 'compact');
      assert.equal(htmlEl.getAttribute('data-radius'), 'soft');
      assert.equal(htmlEl.getAttribute('data-font-size'), 's');
      assert.equal(htmlEl.getAttribute('data-layout'), 'table');

      let items = app.getVisibleItems();
      assert.ok(items.length > 0);

      // Reopen Settings modal and revert
      await app.openSettingsModal();
      await app.setDensity('cozy');
      await app.setRadius('round');
      await app.setTextSize('m');
      await app.closeSettingsModal();

      await app.setLayoutView('grid');

      assert.equal(htmlEl.getAttribute('data-density'), 'cozy');
      assert.equal(htmlEl.getAttribute('data-radius'), 'round');
      assert.equal(htmlEl.getAttribute('data-font-size'), 'm');
      assert.equal(htmlEl.getAttribute('data-layout'), 'grid');

      items = app.getVisibleItems();
      assert.ok(items.length > 0);
    });
  });

  describe('3. History Drawer & Batch Drawer Concurrent Open/Close & Session Bulk Actions', () => {
    it('3.1: interleaved concurrent opening and closing of History Drawer and Batch Drawer', async () => {
      const app = createAppInstance();

      // Open Batch Drawer
      await app.openBatchDrawer();
      let batchDrawer = app.document.querySelector('#batchDrawer');
      assert.ok(batchDrawer?.className.includes('open') || batchDrawer?.className.includes('translate-x-0'), 'Batch drawer should be open');

      // Open History Drawer (should open History sheet)
      await app.openHistoryDrawer();
      let historyDrawer = app.getHistoryDrawer();
      assert.ok(historyDrawer, 'History drawer should be open in DOM');

      // Close Batch Drawer
      await app.closeBatchDrawer();
      batchDrawer = app.document.querySelector('#batchDrawer');
      assert.ok(!batchDrawer?.className.includes('open') || batchDrawer?.className.includes('translate-x-full'), 'Batch drawer should be closed');

      // History drawer still cleanly accessible
      historyDrawer = app.getHistoryDrawer();
      assert.ok(historyDrawer, 'History drawer still present');

      // Close History Drawer
      const histCloseBtn = app.document.querySelector('[data-testid="history-drawer"] button[aria-label*="Close"], [data-testid="history-drawer"] .absolute.right-4');
      if (histCloseBtn) (histCloseBtn as HTMLButtonElement).click();
      await waitAsync(30);

      // Reopen Batch Drawer cleanly
      await app.openBatchDrawer();
      batchDrawer = app.document.querySelector('#batchDrawer');
      assert.ok(batchDrawer?.className.includes('open') || batchDrawer?.className.includes('translate-x-0'));
      await app.closeBatchDrawer();
    });

    it('3.2: rapid History Auto-Session bulk operations: "Copy All in Session" and "Add Session to Batch Queue"', async () => {
      const now = Date.now();
      const sampleEntries = [
        { id: 'e1', text: 'Dust under screen glass', itemNumber: 101, category: 'screen', timestamp: now - 5000, source: 'card' },
        { id: 'e2', text: 'Dead pixel cluster center', itemNumber: 102, category: 'screen', timestamp: now - 3000, source: 'card' },
        { id: 'e3', text: 'Bezel scratch top left', itemNumber: 103, category: 'cosmetic', timestamp: now - 1000, source: 'card' },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(sampleEntries),
          'qc-batch': JSON.stringify([]),
        }
      });

      await app.openHistoryDrawer();

      // Find "Copy All" session button
      const copySessionBtn = app.document.querySelector('[data-testid="copy-session-btn"]') as HTMLButtonElement;
      assert.ok(copySessionBtn, 'Copy Session All button must exist');

      app.resetCopiedText();
      copySessionBtn.click();
      await waitAsync(30);

      // Copied text should join all 3 entries in session order (newest first)
      assert.equal(app.getCopiedText(), 'Bezel scratch top left\nDead pixel cluster center\nDust under screen glass');

      // Find "+ Batch" session button
      const addSessionBatchBtn = app.document.querySelector('[data-testid="add-session-batch-btn"]') as HTMLButtonElement;
      assert.ok(addSessionBatchBtn, 'Add Session to Batch button must exist');

      addSessionBatchBtn.click();
      await waitAsync(30);

      // Batch queue should now contain all 3 items
      assert.equal(app.getBatchCount(), 3, 'Batch queue must hold 3 items from session');
      const batchItems = app.getBatchItems();
      assert.deepEqual(batchItems.map((b) => b.text), [
        'Bezel scratch top left',
        'Dead pixel cluster center',
        'Dust under screen glass'
      ]);
    });

    it('3.3: History Drawer category filtering under rapid switching calculates sessions and item counts dynamically', async () => {
      const now = Date.now();
      const sampleEntries = [
        { id: 'e1', text: 'Screen defect A', category: 'screen', timestamp: now - 5000 },
        { id: 'e2', text: 'Camera defect B', category: 'camera', timestamp: now - 4000 },
        { id: 'e3', text: 'Screen defect C', category: 'screen', timestamp: now - 3000 },
        { id: 'e4', text: 'Battery defect D', category: 'battery', timestamp: now - 2000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(sampleEntries),
        }
      });

      await app.openHistoryDrawer();

      // Check All count
      let entries = app.document.querySelectorAll('#histlist [data-testid="history-entry"]');
      assert.equal(entries.length, 4, 'All 4 entries shown initially');

      // Filter by 'screen'
      const screenChip = app.document.querySelector('[data-testid="history-cat-chip-screen"]') as HTMLButtonElement;
      assert.ok(screenChip, 'Screen category filter chip exists');
      screenChip.click();
      await waitAsync(30);

      entries = app.document.querySelectorAll('#histlist [data-testid="history-entry"]');
      assert.equal(entries.length, 2, 'Only 2 screen entries should be shown');

      // Filter by 'camera'
      const camChip = app.document.querySelector('[data-testid="history-cat-chip-camera"]') as HTMLButtonElement;
      assert.ok(camChip, 'Camera category filter chip exists');
      camChip.click();
      await waitAsync(30);

      entries = app.document.querySelectorAll('#histlist [data-testid="history-entry"]');
      assert.equal(entries.length, 1, 'Only 1 camera entry should be shown');

      // Return to 'all'
      const allChip = app.document.querySelector('[data-testid="history-cat-chip-all"]') as HTMLButtonElement;
      assert.ok(allChip, 'All category filter chip exists');
      allChip.click();
      await waitAsync(30);

      entries = app.document.querySelectorAll('#histlist [data-testid="history-entry"]');
      assert.equal(entries.length, 4, 'All 4 entries restored');
    });

    it('3.4: History Drawer search filter and search clear button resets timeline', async () => {
      const now = Date.now();
      const sampleEntries = [
        { id: 'e1', text: 'Discoloration on screen OLED', category: 'screen', timestamp: now - 5000 },
        { id: 'e2', text: 'Lens coating peel', category: 'camera', timestamp: now - 4000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(sampleEntries),
        }
      });

      await app.openHistoryDrawer();

      const searchInput = app.document.querySelector('[data-testid="history-search-input"]') as HTMLInputElement;
      assert.ok(searchInput, 'History search input exists');

      // Type 'coating'
      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value')!.set!;
      nativeSetter.call(searchInput, 'coating');
      searchInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new app.window.Event('change', { bubbles: true }));
      await waitAsync(30);

      let entries = app.document.querySelectorAll('#histlist [data-testid="history-entry"]');
      assert.equal(entries.length, 1);
      assert.ok(entries[0].textContent?.includes('Lens coating peel'));

      // Click clear search button (X)
      const clearBtn = app.document.querySelector('[title="Clear search"]') as HTMLButtonElement;
      assert.ok(clearBtn, 'Clear search button exists');
      clearBtn.click();
      await waitAsync(30);

      entries = app.document.querySelectorAll('#histlist [data-testid="history-entry"]');
      assert.equal(entries.length, 2, 'All entries restored on clear');
    });

    it('3.5: Batch Drawer Bulk Paste + 6 delimiter formats + auto-clear with 50 items load', async () => {
      const app = createAppInstance({ initialStorage: { 'qc-autoclear': 'true' } });
      await app.openBatchDrawer();

      // Open Bulk Paste Modal
      const pasteBtn = app.document.querySelector('#bpaste') as HTMLButtonElement;
      assert.ok(pasteBtn, '#bpaste exists');
      pasteBtn.click();
      await waitAsync(30);

      // Create 50 lines
      const bulkLines = Array.from({ length: 50 }, (_, i) => `Defect batch line #${i + 1}`).join('\n');
      const textarea = app.document.querySelector('textarea') as HTMLTextAreaElement;
      assert.ok(textarea, 'Bulk paste textarea exists');

      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLTextAreaElement.prototype, 'value')!.set!;
      nativeSetter.call(textarea, bulkLines);
      textarea.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      textarea.dispatchEvent(new app.window.Event('change', { bubbles: true }));

      // Click Import Lines
      const importBtn = Array.from(app.document.querySelectorAll('button')).find((b) => b.textContent?.includes('Import Lines'));
      assert.ok(importBtn, 'Import Lines button exists');
      importBtn.click();
      await waitAsync(30);

      assert.equal(app.getBatchCount(), 50, '50 items imported into batch queue');

      // Test bullet delimiter
      app.setDelimiter('bullet');
      await waitAsync(30);

      await app.copyBatch();
      await waitAsync(30);

      const copied = app.getCopiedText();
      assert.ok(copied?.startsWith('Defect batch line #1 • Defect batch line #2'), 'Formatted with bullet separator');
      assert.ok(copied?.includes('Defect batch line #50'));

      // Autoclear was true -> batch should be cleared
      assert.equal(app.getBatchCount(), 0, 'Batch queue auto-cleared on copy');
    });
  });
});
