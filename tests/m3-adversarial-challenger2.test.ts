import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone M3 Challenger 2 Deep Adversarial & Stress Verification Suite', () => {

  describe('1. Autoclear Toggle & LocalStorage Sync Rigorous Verification', () => {
    it('1.1: default autoclear state is true when qc-autoclear is unset in localStorage', async () => {
      const app = createAppInstance();
      const checkbox = app.document.querySelector('#autoclear, [data-testid="autoclear-checkbox"]') as HTMLInputElement;
      assert.ok(checkbox, 'Autoclear checkbox must exist');
      assert.equal(checkbox.checked, true, 'Default autoclear checkbox must be checked');
    });

    it('1.2: initial autoclear state correctly initializes to false from localStorage', async () => {
      const app = createAppInstance({ initialStorage: { 'qc-autoclear': 'false' } });
      const checkbox = app.document.querySelector('#autoclear, [data-testid="autoclear-checkbox"]') as HTMLInputElement;
      assert.ok(checkbox, 'Autoclear checkbox must exist');
      assert.equal(checkbox.checked, false, 'Checkbox should be initialized to false');
    });

    it('1.3: toggling autoclear checkbox updates localStorage qc-autoclear dynamically', async () => {
      const app = createAppInstance();
      const checkbox = app.document.querySelector('#autoclear, [data-testid="autoclear-checkbox"]') as HTMLInputElement;
      assert.ok(checkbox);

      // Toggle to false
      checkbox.click();
      await waitAsync(30);
      assert.equal(app.window.localStorage.getItem('qc-autoclear'), 'false', 'qc-autoclear must be false in localStorage');
      assert.equal(checkbox.checked, false, 'Checkbox must be unchecked');

      // Toggle back to true
      checkbox.click();
      await waitAsync(30);
      assert.equal(app.window.localStorage.getItem('qc-autoclear'), 'true', 'qc-autoclear must be true in localStorage');
      assert.equal(checkbox.checked, true, 'Checkbox must be checked');
    });

    it('1.4: copyBatch with autoclear=true copies clipboard and clears queue, updating localStorage', async () => {
      const app = createAppInstance({ initialStorage: { 'qc-autoclear': 'true' } });
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      assert.equal(app.getBatchCount(), 2);

      await app.copyBatch();
      await waitAsync(30);

      // Batch queue should be cleared
      assert.equal(app.getBatchCount(), 0, 'Batch count must be 0 after copyBatch with autoclear=true');
      assert.equal(app.window.localStorage.getItem('qc-batch'), '[]', 'qc-batch in localStorage must be empty array');
      const bitems = app.document.querySelectorAll('#blist .bitem');
      assert.equal(bitems.length, 0, 'No .bitem elements in DOM');
    });

    it('1.5: copyBatch with autoclear=false copies clipboard and preserves queue in DOM and localStorage', async () => {
      const app = createAppInstance({ initialStorage: { 'qc-autoclear': 'false' } });
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      assert.equal(app.getBatchCount(), 2);

      await app.copyBatch();
      await waitAsync(30);

      // Batch queue should remain 2
      assert.equal(app.getBatchCount(), 2, 'Batch count must remain 2 after copyBatch with autoclear=false');
      const rawBatch = app.window.localStorage.getItem('qc-batch');
      assert.ok(rawBatch && JSON.parse(rawBatch).length === 2, 'qc-batch in localStorage must still contain 2 items');
      const bitems = app.document.querySelectorAll('#blist .bitem');
      assert.equal(bitems.length, 2, 'DOM must retain 2 .bitem elements');
    });
  });

  describe('2. Batch Drawer Count Badges & Button State Synchronization', () => {
    it('2.1: badges #bcount, #bbcount, and #bcopycount remain strictly synchronized across item lifecycle', async () => {
      const app = createAppInstance();
      const bcount = app.document.querySelector('#bcount');
      const bbcount = app.document.querySelector('#bbcount');
      const bcopycount = app.document.querySelector('#bcopycount');
      const bcopyBtn = app.document.querySelector('#bcopy') as HTMLButtonElement;
      const bclearBtn = app.document.querySelector('#bclear') as HTMLButtonElement;

      assert.ok(bcount, '#bcount must exist');
      assert.ok(bbcount, '#bbcount must exist');
      assert.ok(bcopycount, '#bcopycount must exist');
      assert.ok(bcopyBtn, '#bcopy button must exist');
      assert.ok(bclearBtn, '#bclear button must exist');

      // Initial state: 0
      assert.equal(bcount.textContent?.trim(), '0');
      assert.equal(bbcount.textContent?.trim(), '0');
      assert.equal(bcopycount.textContent?.trim(), '0');
      assert.equal(bcopyBtn.disabled, true, '#bcopy must be disabled when empty');
      assert.equal(bclearBtn.disabled, true, '#bclear must be disabled when empty');

      // Add item 0
      await app.clickItemAction(0, 'add');
      assert.equal(bcount.textContent?.trim(), '1');
      assert.equal(bbcount.textContent?.trim(), '1');
      assert.equal(bcopycount.textContent?.trim(), '1');
      assert.equal(bcopyBtn.disabled, false, '#bcopy must be enabled with items');
      assert.equal(bclearBtn.disabled, false, '#bclear must be enabled with items');

      // Add item 1 and item 2
      await app.clickItemAction(1, 'add');
      await app.clickItemAction(2, 'add');
      assert.equal(bcount.textContent?.trim(), '3');
      assert.equal(bbcount.textContent?.trim(), '3');
      assert.equal(bcopycount.textContent?.trim(), '3');

      // Remove single item at index 1
      app.removeBatchItem(1);
      await waitAsync(30);
      assert.equal(bcount.textContent?.trim(), '2');
      assert.equal(bbcount.textContent?.trim(), '2');
      assert.equal(bcopycount.textContent?.trim(), '2');

      // Clear batch
      app.clearBatch();
      await waitAsync(30);
      assert.equal(bcount.textContent?.trim(), '0');
      assert.equal(bbcount.textContent?.trim(), '0');
      assert.equal(bcopycount.textContent?.trim(), '0');
      assert.equal(bcopyBtn.disabled, true);
      assert.equal(bclearBtn.disabled, true);
    });

    it('2.2: empty batch state displays descriptive placeholder illustration and text', async () => {
      const app = createAppInstance();
      const blist = app.document.querySelector('#blist');
      assert.ok(blist, '#blist container must exist');
      assert.ok(blist.textContent?.includes('Batch Queue Empty'), 'Empty placeholder text should be shown');
      assert.ok(blist.textContent?.includes('Click "+ Batch"'), 'Instructional hint should be displayed');
    });
  });

  describe('3. Delimiter Segmented Control & Join Logic Verification', () => {
    const delimiters: Array<{ key: string; name: string; sep: string }> = [
      { key: 'nl', name: 'Newline', sep: '\n' },
      { key: 'comma', name: 'Comma', sep: ', ' },
      { key: 'semi', name: 'Semicolon', sep: '; ' },
      { key: 'space', name: 'Space', sep: ' ' },
      { key: 'pipe', name: 'Pipe', sep: ' | ' },
      { key: 'bullet', name: 'Bullet', sep: ' • ' },
    ];

    for (const d of delimiters) {
      it(`3.1: delimiter '${d.key}' formats batch output correctly and syncs with select and localStorage`, async () => {
        const app = createAppInstance({ initialStorage: { 'qc-autoclear': 'false' } });
        const items = app.getVisibleItems();
        const t0 = items[0].text;
        const t1 = items[1].text;
        const t2 = items[2].text;

        await app.clickItemAction(0, 'add');
        await app.clickItemAction(1, 'add');
        await app.clickItemAction(2, 'add');

        // Set delimiter via harness / select
        app.setDelimiter(d.key);
        await waitAsync(30);

        // Check localStorage
        assert.equal(app.window.localStorage.getItem('qc-join'), d.key);

        // Check select value
        const select = app.document.querySelector('#joinSel') as HTMLSelectElement;
        assert.equal(select.value, d.key);

        // Copy and verify delimiter formatting
        await app.copyBatch();
        assert.equal(app.getCopiedText(), `${t0}${d.sep}${t1}${d.sep}${t2}`);
      });
    }

    it('3.2: segmented button tabs trigger delimiter change and update active highlight styling', async () => {
      const app = createAppInstance();
      const segmentedButtons = Array.from(
        app.document.querySelectorAll('#batchDrawer button')
      ).filter((b) => b.getAttribute('title')?.includes('('));

      assert.equal(segmentedButtons.length, 6, 'Should render 6 segmented delimiter buttons');

      // Click the Comma button (title contains "Comma")
      const commaBtn = segmentedButtons.find((b) => b.getAttribute('title')?.includes('Comma')) as HTMLButtonElement;
      assert.ok(commaBtn, 'Comma segmented tab button exists');
      commaBtn.click();
      await waitAsync(30);

      // Verify delimiter state updated
      const select = app.document.querySelector('#joinSel') as HTMLSelectElement;
      assert.equal(select.value, 'comma');
      assert.equal(app.window.localStorage.getItem('qc-join'), 'comma');

      // Comma button should have active font/border styling
      assert.ok(commaBtn.className.includes('font-bold') || commaBtn.className.includes('bg-stone-800'));
    });
  });

  describe('4. Batch Item Reordering & Single Item Operations', () => {
    it('4.1: single item copy button (.bcopy-item / [data-bc]) copies individual item', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      const t0 = items[0].text;
      const t1 = items[1].text;

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      const copySingleBtns = app.document.querySelectorAll('#blist .bcopy-item, #blist [data-bc]');
      assert.equal(copySingleBtns.length, 2);

      // Click copy on item 1
      (copySingleBtns[1] as HTMLButtonElement).click();
      await waitAsync(30);

      assert.equal(app.getCopiedText(), t1, 'Clipboard must hold individual item 1 text');
    });

    it('4.2: boundary protection: move up disabled at index 0, move down disabled at index N-1', async () => {
      const app = createAppInstance();
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.clickItemAction(2, 'add');

      const bupBtns = app.document.querySelectorAll('#blist .bup, #blist [data-act="moveup"]') as NodeListOf<HTMLButtonElement>;
      const bdnBtns = app.document.querySelectorAll('#blist .bdn, #blist [data-act="movedown"]') as NodeListOf<HTMLButtonElement>;

      assert.equal(bupBtns.length, 3);
      assert.equal(bdnBtns.length, 3);

      // Item 0: Up is disabled, Down is enabled
      assert.equal(bupBtns[0].disabled, true, 'Item 0 Move Up must be disabled');
      assert.equal(bdnBtns[0].disabled, false, 'Item 0 Move Down must be enabled');

      // Item 1: Up is enabled, Down is enabled
      assert.equal(bupBtns[1].disabled, false, 'Item 1 Move Up must be enabled');
      assert.equal(bdnBtns[1].disabled, false, 'Item 1 Move Down must be enabled');

      // Item 2: Up is enabled, Down is disabled
      assert.equal(bupBtns[2].disabled, false, 'Item 2 Move Up must be enabled');
      assert.equal(bdnBtns[2].disabled, true, 'Item 2 Move Down must be disabled');
    });

    it('4.3: sequential multi-item reorder cycle maintains consistency', async () => {
      const app = createAppInstance();
      const items = app.getVisibleItems();
      const [t0, t1, t2, t3] = [items[0].text, items[1].text, items[2].text, items[3].text];

      await app.clickItemAction(0, 'add'); // index 0: t0
      await app.clickItemAction(1, 'add'); // index 1: t1
      await app.clickItemAction(2, 'add'); // index 2: t2
      await app.clickItemAction(3, 'add'); // index 3: t3

      // Move index 2 up -> order: t0, t2, t1, t3
      app.moveBatchItemUp(2);
      let list = app.getBatchItems();
      assert.deepEqual(list.map((x) => x.text), [t0, t2, t1, t3]);

      // Move index 0 down -> order: t2, t0, t1, t3
      app.moveBatchItemDown(0);
      list = app.getBatchItems();
      assert.deepEqual(list.map((x) => x.text), [t2, t0, t1, t3]);

      // Move index 3 up -> order: t2, t0, t3, t1
      app.moveBatchItemUp(3);
      list = app.getBatchItems();
      assert.deepEqual(list.map((x) => x.text), [t2, t0, t3, t1]);
    });
  });

  describe('5. Floating Toasts Lifecycle, Warning States & Phantom Node Cleanliness', () => {
    it('5.1: clicking toast triggers immediate dismissal', async () => {
      const app = createAppInstance();
      await app.clickItemRow(0);

      let toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Toast should be created on copy');

      const toastEl = app.document.querySelector('#toasts .toast') as HTMLElement;
      assert.ok(toastEl, 'Toast DOM element exists');

      // Click toast to dismiss
      toastEl.click();
      await waitAsync(30);

      toasts = app.getToasts();
      assert.equal(toasts.length, 0, 'Toast should be dismissed immediately after click');
    });

    it('5.2: warning toast rendering on defect deletion with undo action', async () => {
      const app = createAppInstance();
      await app.toggleEditMode();
      await waitAsync(30);

      const itemsBefore = app.getVisibleItems();
      const itemToDelete = itemsBefore[0];

      // Delete item
      await app.clickItemAction(0, 'del');
      await waitAsync(30);

      // Warning toast should be visible with .warn class
      const toastEl = app.document.querySelector('#toasts .toast.warn, #toasts .warn') as HTMLElement;
      assert.ok(toastEl, 'Warning toast must have .warn class');

      // Undo button should be present
      const undoBtn = toastEl.querySelector('.tact, [data-testid="toast-action"]') as HTMLButtonElement;
      assert.ok(undoBtn, 'Undo button .tact must exist');
      assert.equal(undoBtn.textContent?.trim(), 'Undo');

      // Click Undo
      undoBtn.click();
      await waitAsync(30);

      // Item should be restored
      const itemsAfter = app.getVisibleItems();
      assert.ok(itemsAfter.some((it) => it.id === itemToDelete.id), 'Deleted item must be restored on undo');
    });

    it('5.3: auto-dismissal timer cleans up DOM nodes without phantom artifacts', async () => {
      const app = createAppInstance();
      await app.clickItemRow(0);

      assert.ok(app.getToasts().length > 0);

      // Wait 4300ms for auto-dismissal
      await waitAsync(4300);

      const remainingToasts = app.getToasts();
      assert.equal(remainingToasts.length, 0, 'All toasts should auto-dismiss after timer expires');
      const toastDomNodes = app.document.querySelectorAll('#toasts .toast');
      assert.equal(toastDomNodes.length, 0, 'No leftover phantom toast DOM nodes');
    });

    it('5.4: heavy burst of 25 consecutive toasts creates and dispatches cleanly', async () => {
      const app = createAppInstance();
      for (let i = 0; i < 25; i++) {
        await app.clickItemRow(i % 5);
      }

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Active toasts must be present');
      assert.ok(toasts.length <= 30, 'Toasts count must remain within safe bounds');

      // Wait for all to clear
      await waitAsync(4300);
      assert.equal(app.getToasts().length, 0, 'All burst toasts cleanly dismiss');
    });
  });

  describe('6. Comprehensive DOM Query Selector Verification', () => {
    it('6.1: all Tier 1 through Tier 5 and R3 required selectors exist and have correct attributes', async () => {
      const app = createAppInstance();
      const { document } = app;

      // 1. Drawer Container & Overlay
      const drawer = document.querySelector('#batchDrawer, [data-testid="batch-drawer"], .batch-drawer');
      assert.ok(drawer, '#batchDrawer container exists');
      const backdrop = document.querySelector('#backdrop, [data-testid="drawer-overlay"], .drawer-backdrop');
      assert.ok(backdrop, '#backdrop overlay exists');
      const closeBtn = document.querySelector('#bclose');
      assert.ok(closeBtn, '#bclose close button exists');

      // 2. Delimiter & Autoclear Controls
      const joinSel = document.querySelector('#joinSel, [data-testid="delimiter-select"]');
      assert.ok(joinSel, '#joinSel delimiter select exists');
      const autoclear = document.querySelector('#autoclear, [data-testid="autoclear-checkbox"]');
      assert.ok(autoclear, '#autoclear checkbox exists');

      // 3. Batch List & Actions
      const blist = document.querySelector('#blist');
      assert.ok(blist, '#blist container exists');
      const bcopyBtn = document.querySelector('#bcopy, [data-testid="copy-batch-btn"]');
      assert.ok(bcopyBtn, '#bcopy copy batch button exists');
      const bcopyCount = document.querySelector('#bcopycount');
      assert.ok(bcopyCount, '#bcopycount badge exists');
      const bclearBtn = document.querySelector('#bclear, [data-testid="clear-batch-btn"]');
      assert.ok(bclearBtn, '#bclear clear batch button exists');
      const bpasteBtn = document.querySelector('#bpaste');
      assert.ok(bpasteBtn, '#bpaste bulk paste button exists');

      // 4. Batch Count Badges
      const bcount = document.querySelector('#bcount, [data-testid="batch-count"]');
      assert.ok(bcount, '#bcount badge exists');
      const bbcount = document.querySelector('#bbcount');
      assert.ok(bbcount, '#bbcount badge exists');

      // 5. Add items to inspect item-level selectors
      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');

      const bitem = document.querySelector('.bitem, [data-bi], [data-testid="batch-item"]');
      assert.ok(bitem, '.bitem row exists');
      const bt = document.querySelector('.bt, [data-testid="batch-item-text"]');
      assert.ok(bt, '.bt text container exists');
      const bup = document.querySelector('.bup, [data-mvup], [data-mup], [data-up], [data-act="moveup"]');
      assert.ok(bup, '.bup reorder up button exists');
      const bdn = document.querySelector('.bdn, [data-mvdn], [data-mdown], [data-down], [data-act="movedown"]');
      assert.ok(bdn, '.bdn reorder down button exists');
      const bcopyItem = document.querySelector('.bcopy-item, [data-bc]');
      assert.ok(bcopyItem, '.bcopy-item single copy button exists');
      const brmItem = document.querySelector('.brm-item, [data-rm], [data-testid^="remove-batch-item-"]');
      assert.ok(brmItem, '.brm-item remove button exists');

      // 6. Toasts selectors
      const toastsContainer = document.querySelector('#toasts, .toasts-container');
      assert.ok(toastsContainer, '#toasts container exists');
    });
  });
});
