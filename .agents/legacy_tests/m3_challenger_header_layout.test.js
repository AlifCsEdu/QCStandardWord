import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppInstance, waitAsync } from './harness.js';

test('Challenger M3 Task 1: Rapid layout mode switching (list -> grid -> table -> list) via SegmentedControl in AppHeader', async () => {
  const app = createAppInstance();
  await waitAsync(50);

  const header = app.getAppHeader();
  assert.ok(header, 'AppHeader should exist in DOM');

  const viewSwitcher = app.getSegmentedControl();
  assert.ok(viewSwitcher, 'SegmentedControl view switcher should exist in AppHeader');

  const modes = ['list', 'grid', 'table'];

  // Perform 30 rapid switches across list, grid, table
  for (let i = 0; i < 30; i++) {
    const targetMode = modes[i % 3];
    
    // Find option in SegmentedControl
    const radioOrLabel = viewSwitcher.querySelector(`input[value="${targetMode}"], label:has(input[value="${targetMode}"])`) ||
      Array.from(viewSwitcher.querySelectorAll('label, input, button')).find(el => 
        (el.value === targetMode) || (el.textContent && el.textContent.trim().toLowerCase() === targetMode)
      );

    assert.ok(radioOrLabel, `View switcher element for mode "${targetMode}" should exist`);

    // Dispatch click or change event
    radioOrLabel.click();
    if (radioOrLabel.tagName === 'INPUT') {
      radioOrLabel.dispatchEvent(new app.window.Event('change', { bubbles: true }));
    }
    await waitAsync(10);

    // Verify rendered layout items correspond to targetMode
    const items = app.getVisibleItems();
    assert.ok(items.length > 0, `Items should be rendered in ${targetMode} mode (iteration ${i})`);

    if (targetMode === 'list') {
      const hasListRow = !!app.document.querySelector('#listwrap .row, [data-testid="defect-row"], .defect-row');
      assert.ok(hasListRow, `DOM should contain list rows in list mode (iteration ${i})`);
    } else if (targetMode === 'grid') {
      const hasGridCard = !!app.document.querySelector('#listwrap .gcard, [data-testid="defect-card"], .defect-card');
      assert.ok(hasGridCard, `DOM should contain grid cards in grid mode (iteration ${i})`);
    } else if (targetMode === 'table') {
      const hasTableRow = !!app.document.querySelector('#listwrap .trow, [data-testid="defect-row"], .defect-table, table');
      assert.ok(hasTableRow, `DOM should contain table rows/elements in table mode (iteration ${i})`);
    }
  }

  // Final check: set back to list mode
  const listOption = Array.from(viewSwitcher.querySelectorAll('label, input, button')).find(el => 
    (el.value === 'list') || (el.textContent && el.textContent.trim().toLowerCase() === 'list')
  );
  listOption.click();
  await waitAsync(20);
  assert.ok(app.getVisibleItems().length > 0, 'Items should be visible after returning to list mode');
});

test('Challenger M3 Task 2: Rapid search input typing & clear button click in top header', async () => {
  const app = createAppInstance();
  await waitAsync(50);

  const searchInput = app.document.querySelector('#search, [data-testid="header-search-input"]');
  assert.ok(searchInput, 'Header search input should exist');

  const testQueries = ['FCPB', 'battery', 'display', 'camera', 'nonexistent_query_xyz', 'fold'];

  for (let cycle = 0; cycle < 15; cycle++) {
    const query = testQueries[cycle % testQueries.length];
    
    // Type search query
    app.search(query);
    await waitAsync(10);

    const clearBtn = app.document.querySelector('#clearBtn, [data-testid="clear-search-btn"]');
    assert.ok(clearBtn, `Clear button should be visible when searching for "${query}" (cycle ${cycle})`);

    const filteredItems = app.getVisibleItems();
    if (query === 'nonexistent_query_xyz') {
      assert.equal(filteredItems.length, 0, 'No items should match non-existent query');
    } else {
      assert.ok(filteredItems.length > 0, `Matching items should be displayed for "${query}"`);
    }

    // Click clear button
    app.clearSearch();
    await waitAsync(10);

    const clearBtnAfter = app.document.querySelector('#clearBtn, [data-testid="clear-search-btn"]');
    assert.equal(clearBtnAfter, null, `Clear button should be hidden after clearing (cycle ${cycle})`);

    const restoredItems = app.getVisibleItems();
    assert.ok(restoredItems.length > 0, `All items should be restored after clearing search (cycle ${cycle})`);
  }
});

test('Challenger M3 Task 3: Spotlight search trigger opens Spotlight modal without throwing errors', async () => {
  const app = createAppInstance();
  await waitAsync(50);

  const spotlightBtn = app.document.querySelector('#spotlightBtn, [data-testid="spotlight-trigger"]');
  assert.ok(spotlightBtn, 'Spotlight trigger button should exist in AppHeader');

  // Trigger spotlight open via button click
  let openError = null;
  try {
    await app.openSpotlightModal();
  } catch (err) {
    openError = err;
  }

  assert.equal(openError, null, 'Opening Spotlight modal via header trigger button should not throw any error');

  // Also test keyboard shortcut Cmd+K / Ctrl+K
  let shortcutError = null;
  try {
    app.window.dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }));
    await waitAsync(20);
  } catch (err) {
    shortcutError = err;
  }
  assert.equal(shortcutError, null, 'Triggering Cmd+K / Ctrl+K keyboard shortcut should not throw any error');
});
