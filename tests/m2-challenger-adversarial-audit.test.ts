import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';
import { getCategoryColor, getCategoryLeftBorderStyle } from '../src/utils/categoryColors.ts';

describe('Milestone 2 Empirical Challenger Adversarial Audit Suite', () => {

  describe('1. Micro-Interaction Timing, Multi-Click Spamming & Timer Resets', () => {
    it('1.1: Clicking defect card in List view triggers inline Copied badge and emerald ring', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const rows = app.document.querySelectorAll('#listwrap .row');
      assert.ok(rows.length > 0, 'List rows must exist in DOM');
      const firstRow = rows[0] as HTMLElement;

      // Before click: no copied badge
      assert.equal(firstRow.querySelector('[data-testid="inline-copied-badge"]'), null);

      // Click card
      firstRow.click();
      await waitAsync(50);

      // Verify copied text captured by mock clipboard
      const visibleItem = app.getVisibleItems()[0];
      assert.equal(app.getCopiedText(), visibleItem.text);

      // Verify inline copied badge rendered
      const badge = firstRow.querySelector('[data-testid="inline-copied-badge"]');
      assert.ok(badge, 'Inline copied badge must be present after click');
      assert.ok(badge.textContent?.includes('Copied ✓'), 'Badge text must contain "Copied ✓"');
      assert.ok(badge.className.includes('bg-emerald-500/20'), 'Badge must have emerald background');

      // Verify container styling has emerald glow ring
      assert.ok(
        firstRow.className.includes('ring-emerald-500/40') || firstRow.className.includes('bg-emerald-950/20'),
        'Card container must have emerald ring glow classes when copied'
      );
    });

    it('1.2: Rapid multi-click spamming (5 clicks in 200ms) resets 1200ms timer cleanly without race conditions', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const firstRow = app.document.querySelectorAll('#listwrap .row')[0] as HTMLElement;
      
      // Spam 5 clicks rapidly
      for (let i = 0; i < 5; i++) {
        firstRow.click();
        await waitAsync(40);
      }

      // Badge must still be visible right after spam
      let badge = firstRow.querySelector('[data-testid="inline-copied-badge"]');
      assert.ok(badge, 'Badge must be visible after rapid click burst');

      // Wait 1300ms after the last click for timer to expire
      await waitAsync(1300);

      // Badge should now be cleared
      badge = firstRow.querySelector('[data-testid="inline-copied-badge"]');
      assert.equal(badge, null, 'Badge must auto-dismiss after 1200ms timer completes');
    });

    it('1.3: Unmounting card mid-animation (via search filtering or view switch) does not crash or throw unhandled timer exceptions', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const firstRow = app.document.querySelectorAll('#listwrap .row')[0] as HTMLElement;
      firstRow.click();
      await waitAsync(50);

      // Immediately switch to grid view mid-animation
      await app.setLayoutView('grid');
      await waitAsync(50);

      // Now immediately filter search to something non-existent
      app.search('xyzNonExistentFilterQuery999');
      await waitAsync(50);

      // Ensure empty state rendered without throwing
      const emptyEl = app.document.querySelector('#empty');
      assert.ok(emptyEl, 'Empty container must render cleanly');

      // Clear search to restore
      app.clearSearch();
      await waitAsync(50);
      assert.ok(app.getVisibleItems().length > 0, 'Items restored safely');
    });
  });

  describe('2. Action Button Click Isolation (stopPropagation Verification)', () => {
    it('2.1: Clicking .pin-btn toggles pin state without triggering copy micro-interaction', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      app.resetCopiedText();
      const firstRow = app.document.querySelectorAll('#listwrap .row')[0] as HTMLElement;
      const pinBtn = firstRow.querySelector('.pin-btn') as HTMLElement;
      assert.ok(pinBtn, '.pin-btn must exist');

      // Click pin button
      pinBtn.click();
      await waitAsync(50);

      // Verify copiedText is NULL (not copied)
      assert.equal(app.getCopiedText(), null, 'Clicking pin button must NOT trigger clipboard copy');

      // Verify inline copied badge is NOT shown
      const badge = firstRow.querySelector('[data-testid="inline-copied-badge"]');
      assert.equal(badge, null, 'Inline copied badge must NOT render on pin button click');

      // Verify row is now marked pinned
      assert.ok(firstRow.className.includes('pinned'), 'Row should have pinned class');
    });

    it('2.2: Clicking .add-batch-btn adds item to batch drawer without triggering copy micro-interaction', async () => {
      const app = createAppInstance();
      await app.setLayoutView('grid');
      await waitAsync(30);

      app.resetCopiedText();
      const firstCard = app.document.querySelectorAll('#listwrap .gcard')[0] as HTMLElement;
      const addBtn = firstCard.querySelector('.add-batch-btn') as HTMLElement;
      assert.ok(addBtn, '.add-batch-btn must exist');

      // Click add batch button
      addBtn.click();
      await waitAsync(50);

      // Verify copiedText is NULL
      assert.equal(app.getCopiedText(), null, 'Clicking add batch button must NOT trigger clipboard copy');

      // Verify inline badge not rendered
      assert.equal(firstCard.querySelector('[data-testid="inline-copied-badge"]'), null);

      // Verify batch items incremented
      assert.equal(app.getBatchItems().length, 1, 'Batch drawer should contain exactly 1 item');
    });

    it('2.3: In editMode, clicking .edit-item-btn and .del-item-btn does not trigger card copy', async () => {
      const app = createAppInstance();
      app.toggleEditMode();
      await waitAsync(30);

      app.resetCopiedText();
      const firstRow = app.document.querySelectorAll('#listwrap .row')[0] as HTMLElement;
      const editBtn = firstRow.querySelector('.edit-item-btn') as HTMLElement;
      const delBtn = firstRow.querySelector('.del-item-btn') as HTMLElement;

      assert.ok(editBtn, '.edit-item-btn must exist in edit mode');
      assert.ok(delBtn, '.del-item-btn must exist in edit mode');

      // Click edit button
      editBtn.click();
      await waitAsync(30);
      assert.equal(app.getCopiedText(), null, 'Clicking edit button must not copy');
      app.cancelModal();
      await waitAsync(30);

      // Click del button
      delBtn.click();
      await waitAsync(30);
      assert.equal(app.getCopiedText(), null, 'Clicking delete button must not copy');
    });
  });

  describe('3. Multi-Variant DOM Layout, Capsule Pills & Category Left Borders', () => {
    it('3.1: Grid view (.gcard) preserves category border-l-4 style and renders capsule pill .rnum', async () => {
      const app = createAppInstance();
      await app.setLayoutView('grid');
      await waitAsync(30);

      const cards = app.document.querySelectorAll('#listwrap .gcard');
      assert.ok(cards.length > 0, 'Grid cards must be present');

      cards.forEach((card) => {
        // Capsule pill checks
        const numEl = card.querySelector('.rnum');
        assert.ok(numEl, '.rnum must exist');
        assert.ok(numEl.textContent?.startsWith('#'), '.rnum text must start with #');
        assert.ok(numEl.className.includes('font-mono'), '.rnum must have font-mono');
        assert.ok(numEl.className.includes('bg-stone-800'), '.rnum must have elevated background');

        // Typography checks
        const txtEl = card.querySelector('.rtxt');
        assert.ok(txtEl, '.rtxt must exist');
        assert.ok(txtEl.className.includes('font-sans'), '.rtxt must have font-sans typography');

        // Category border accent
        const style = card.getAttribute('style') || '';
        assert.ok(style.includes('border-left-color'), 'Card must have inline border-left-color');
      });
    });

    it('3.2: Table view (.trow) renders 12-column structure with inline copied badge alignment', async () => {
      const app = createAppInstance();
      await app.setLayoutView('table');
      await waitAsync(30);

      const trows = app.document.querySelectorAll('#listwrap .trow');
      assert.ok(trows.length > 0, 'Table rows must exist');

      const firstTrow = trows[0] as HTMLElement;
      firstTrow.click();
      await waitAsync(50);

      const badge = firstTrow.querySelector('[data-testid="inline-copied-badge"]');
      assert.ok(badge, 'Table row must display inline copied badge');
      assert.ok(firstTrow.className.includes('sm:grid-cols-12'), 'Table row must maintain 12-column grid layout');
    });

    it('3.3: Pinned defect cards display pinned styling while still rendering inline copied badge on click', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      const firstRow = app.document.querySelectorAll('#listwrap .row')[0] as HTMLElement;
      const pinBtn = firstRow.querySelector('.pin-btn') as HTMLElement;
      pinBtn.click();
      await waitAsync(30);

      assert.ok(firstRow.className.includes('pinned'), 'Card should have pinned class');

      // Click pinned card
      firstRow.click();
      await waitAsync(50);

      const badge = firstRow.querySelector('[data-testid="inline-copied-badge"]');
      assert.ok(badge, 'Pinned card must still display inline copied badge on copy');
      assert.equal(app.getCopiedText(), app.getVisibleItems()[0].text);
    });

    it('3.4: Tactile active button scale feedback classes present across all action buttons', () => {
      const app = createAppInstance();
      const pinBtns = app.document.querySelectorAll('.pin-btn');
      const addBtns = app.document.querySelectorAll('.add-batch-btn');

      pinBtns.forEach((btn) => {
        assert.ok(btn.className.includes('active:scale-90'), '.pin-btn must have active:scale-90');
      });

      addBtns.forEach((btn) => {
        assert.ok(btn.className.includes('active:scale-95'), '.add-batch-btn must have active:scale-95');
      });
    });
  });

});
