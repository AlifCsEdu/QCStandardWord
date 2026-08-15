import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone 2 Challenger 2 Deep Adversarial Stress Suite', () => {

  describe('1. Rapid Re-Clicking & Micro-Interaction Timer Integrity', () => {
    it('1.1: rapid 10x re-clicking on the same defect card resets timer cleanly without state desync', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const cards = app.document.querySelectorAll('#listwrap .row');
      assert.ok(cards.length > 0, 'Defect rows must exist');
      const firstCard = cards[0] as HTMLElement;

      // Click 10 times rapidly
      for (let i = 0; i < 10; i++) {
        firstCard.click();
      }
      await waitAsync(30);

      // Verify copied state is active
      const badge = firstCard.querySelector('[data-testid="inline-copied-badge"]');
      assert.ok(badge, 'Badge must be visible after rapid clicks');
      assert.ok(badge.textContent?.includes('Copied ✓'), 'Badge text must be Copied ✓');
      assert.ok(firstCard.className.includes('emerald') || firstCard.className.includes('ring'), 'Card has emerald ring glow');

      // Verify copied text in clipboard
      const copiedText = app.getCopiedText();
      assert.ok(copiedText && copiedText.length > 0, 'Clipboard must hold copied defect text');

      // Wait 1300ms for timer to expire
      await waitAsync(1300);

      // Verify badge disappears and styling reverts
      const badgeAfter = firstCard.querySelector('[data-testid="inline-copied-badge"]');
      assert.equal(badgeAfter, null, 'Badge must be cleanly removed after 1200ms timeout');
      assert.ok(!firstCard.className.includes('ring-emerald-500'), 'Emerald ring must be removed');
    });

    it('1.2: sequential clicking across different cards in Grid view', async () => {
      const app = createAppInstance();
      await app.setLayoutView('grid');
      await waitAsync(30);

      const cards = app.document.querySelectorAll('#listwrap .gcard');
      assert.ok(cards.length >= 3, 'At least 3 cards in grid view');

      // Click card 0, then card 1, then card 2
      (cards[0] as HTMLElement).click();
      await waitAsync(10);
      (cards[1] as HTMLElement).click();
      await waitAsync(10);
      (cards[2] as HTMLElement).click();
      await waitAsync(30);

      // All 3 should currently show copied badge because timer hasn't expired
      const badge0 = cards[0].querySelector('[data-testid="inline-copied-badge"]');
      const badge1 = cards[1].querySelector('[data-testid="inline-copied-badge"]');
      const badge2 = cards[2].querySelector('[data-testid="inline-copied-badge"]');

      assert.ok(badge0, 'Card 0 should show copied badge');
      assert.ok(badge1, 'Card 1 should show copied badge');
      assert.ok(badge2, 'Card 2 should show copied badge');

      // Wait for timers to expire
      await waitAsync(1300);

      assert.equal(cards[0].querySelector('[data-testid="inline-copied-badge"]'), null, 'Card 0 badge expired');
      assert.equal(cards[1].querySelector('[data-testid="inline-copied-badge"]'), null, 'Card 1 badge expired');
      assert.equal(cards[2].querySelector('[data-testid="inline-copied-badge"]'), null, 'Card 2 badge expired');
    });
  });

  describe('2. Unmounting Mid-Animation & View Switching Resilience', () => {
    it('2.1: switching view layout mode immediately after card copy does not crash or leak timers', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const cards = app.document.querySelectorAll('#listwrap .row');
      (cards[0] as HTMLElement).click();
      await waitAsync(10);

      // Switch to grid immediately while copied timer is pending
      await app.setLayoutView('grid');
      await waitAsync(30);

      // Verify grid rendered cleanly
      const gridCards = app.document.querySelectorAll('#listwrap .gcard');
      assert.ok(gridCards.length > 0, 'Grid cards rendered without error');

      // Switch to table immediately
      await app.setLayoutView('table');
      await waitAsync(30);

      const tableCards = app.document.querySelectorAll('#listwrap .trow');
      assert.ok(tableCards.length > 0, 'Table rows rendered without error');

      // Wait out any pending timers
      await waitAsync(1300);
    });

    it('2.2: searching immediately after clicking a card unmounts card safely', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const cards = app.document.querySelectorAll('#listwrap .row');
      (cards[0] as HTMLElement).click();
      await waitAsync(10);

      // Filter query that eliminates the current first card
      app.search('xyznonexistentquery999');
      await waitAsync(50);

      const emptyEl = app.document.querySelector('#empty');
      assert.ok(emptyEl, 'Empty state displayed safely');

      // Clear search
      app.clearSearch();
      await waitAsync(50);

      const restoredCards = app.document.querySelectorAll('#listwrap .row');
      assert.ok(restoredCards.length > 0, 'Cards restored properly');
    });
  });

  describe('3. Batch Addition Event Isolation & Micro-Interactions', () => {
    it('3.1: clicking + Batch button adds item to batch queue without triggering card copy micro-interaction', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const cards = app.document.querySelectorAll('#listwrap .row');
      const firstCard = cards[0] as HTMLElement;
      const addBatchBtn = firstCard.querySelector('.add-batch-btn') as HTMLElement;
      assert.ok(addBatchBtn, 'Add batch button must exist');

      app.resetCopiedText();
      const initialBatchCount = app.getBatchCount();

      // Click + Batch
      addBatchBtn.click();
      await waitAsync(50);

      // Batch count should increment by 1
      const newBatchCount = app.getBatchCount();
      assert.equal(newBatchCount, initialBatchCount + 1, 'Batch count must increment by 1');

      // Card should NOT show inline copied badge because e.stopPropagation() was called
      const badge = firstCard.querySelector('[data-testid="inline-copied-badge"]');
      assert.equal(badge, null, 'Card copy micro-interaction must NOT trigger on + Batch click');

      // Clipboard should NOT have been overwritten by card copy handler
      assert.equal(app.getCopiedText(), null, 'Clipboard copy should not be triggered');
    });

    it('3.2: rapid batch addition across 5 items in Table view', async () => {
      const app = createAppInstance();
      await app.setLayoutView('table');
      await waitAsync(30);

      const addBtns = app.document.querySelectorAll('#listwrap .trow .add-batch-btn');
      assert.ok(addBtns.length >= 5, 'At least 5 rows in table view');

      const initialCount = app.getBatchCount();
      for (let i = 0; i < 5; i++) {
        (addBtns[i] as HTMLElement).click();
      }
      await waitAsync(50);

      assert.equal(app.getBatchCount(), initialCount + 5, 'Batch count increments by 5');
    });
  });

  describe('4. Star Pin & Custom Folder Dropdown Isolation', () => {
    it('4.1: single folder mode: clicking star button toggles pin without triggering card copy', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const firstCard = app.document.querySelector('#listwrap .row') as HTMLElement;
      const pinBtn = firstCard.querySelector('.pin-btn') as HTMLElement;
      assert.ok(pinBtn, 'Pin button exists');

      const wasPinned = pinBtn.classList.contains('pinned');
      pinBtn.click();
      await waitAsync(50);

      const isPinnedNow = pinBtn.classList.contains('pinned');
      assert.notEqual(isPinnedNow, wasPinned, 'Pin status should toggle');

      // Card copy badge should NOT trigger
      const badge = firstCard.querySelector('[data-testid="inline-copied-badge"]');
      assert.equal(badge, null, 'Inline copied badge must not trigger when clicking pin button');
    });

    it('4.2: multi-folder mode: renders dropdown trigger and stops propagation', async () => {
      const initialStorage = {
        'qc-pin-folders': JSON.stringify([
          { id: 'f_default', name: 'Default', color: '#f59e0b', createdAt: 1000 },
          { id: 'f_urgent', name: 'Urgent Fixes', color: '#ef4444', createdAt: 2000 }
        ])
      };
      const app = createAppInstance({ initialStorage });
      await app.setLayoutView('list');
      await waitAsync(30);

      const firstCard = app.document.querySelector('#listwrap .row') as HTMLElement;
      const pinBtn = firstCard.querySelector('.pin-btn') as HTMLElement;
      assert.ok(pinBtn, 'Pin button exists in multi-folder mode');

      pinBtn.click();
      await waitAsync(50);

      // Card copy badge should NOT trigger
      const badge = firstCard.querySelector('[data-testid="inline-copied-badge"]');
      assert.equal(badge, null, 'Card copy badge must not trigger');
    });
  });

  describe('5. Table Column Grid Alignment & Structure Integrity', () => {
    it('5.1: table header and table rows strictly conform to 12-column grid layout', async () => {
      const app = createAppInstance();
      await app.setLayoutView('table');
      await waitAsync(30);

      const tableWrapper = app.document.querySelector('.wording-table-body, .listwrap.table');
      assert.ok(tableWrapper, 'Table wrapper exists');

      const header = app.document.querySelector('.listwrap.table .hidden.sm\\:grid, .wording-table-wrapper .hidden.sm\\:grid');
      if (header) {
        assert.ok(header.className.includes('grid-cols-12'), 'Header must use grid-cols-12');
        const headerSpans = Array.from(header.children).map((c) => (c as HTMLElement).className);
        // Code (col-span-1), QC Defect Wording Standard (col-span-7), Category (col-span-2), Actions (col-span-2)
        assert.ok(headerSpans[0].includes('col-span-1'), 'Header code span is 1');
        assert.ok(headerSpans[1].includes('col-span-7'), 'Header wording standard span is 7');
        assert.ok(headerSpans[2].includes('col-span-2'), 'Header category span is 2');
        assert.ok(headerSpans[3].includes('col-span-2'), 'Header actions span is 2');
      }

      const rows = app.document.querySelectorAll('#listwrap .trow');
      assert.ok(rows.length > 0, 'Table rows exist');

      rows.forEach((row) => {
        const rowEl = row as HTMLElement;
        assert.ok(rowEl.className.includes('sm:grid-cols-12'), 'Row must use sm:grid-cols-12');
        const children = Array.from(rowEl.children);
        assert.equal(children.length, 4, 'Row must have 4 column sections');

        const col0 = children[0].className;
        const col1 = children[1].className;
        const col2 = children[2].className;
        const col3 = children[3].className;

        assert.ok(col0.includes('sm:col-span-1'), 'Row col 0 is sm:col-span-1');
        assert.ok(col1.includes('sm:col-span-7'), 'Row col 1 is sm:col-span-7');
        assert.ok(col2.includes('sm:col-span-2'), 'Row col 2 is sm:col-span-2');
        assert.ok(col3.includes('sm:col-span-2'), 'Row col 3 is sm:col-span-2');
      });
    });

    it('5.2: verify tactile active scaling classes on action buttons across all views', async () => {
      const app = createAppInstance();
      for (const view of ['grid', 'list', 'table'] as const) {
        await app.setLayoutView(view);
        await waitAsync(20);

        const card = app.document.querySelector(`.${view === 'grid' ? 'gcard' : view === 'list' ? 'row' : 'trow'}`) as HTMLElement;
        assert.ok(card, `Card must exist in ${view} view`);

        const pinBtn = card.querySelector('.pin-btn') as HTMLElement;
        const addBtn = card.querySelector('.add-batch-btn') as HTMLElement;

        assert.ok(pinBtn.className.includes('active:scale-90'), `Pin button must have active:scale-90 in ${view}`);
        assert.ok(addBtn.className.includes('active:scale-95'), `Add button must have active:scale-95 in ${view}`);
      }
    });

    it('5.3: edit mode renders Edit and Del buttons with active:scale-95 tactile feedback', async () => {
      const app = createAppInstance();
      app.toggleEditMode();
      await waitAsync(30);

      const editBtns = app.document.querySelectorAll('.edit-item-btn');
      const delBtns = app.document.querySelectorAll('.del-item-btn');

      assert.ok(editBtns.length > 0, 'Edit buttons must appear in edit mode');
      assert.ok(delBtns.length > 0, 'Delete buttons must appear in edit mode');

      editBtns.forEach((btn) => {
        assert.ok(btn.className.includes('active:scale-95'), 'Edit button must have active:scale-95');
      });

      delBtns.forEach((btn) => {
        assert.ok(btn.className.includes('active:scale-95'), 'Del button must have active:scale-95');
      });
    });
  });

});
