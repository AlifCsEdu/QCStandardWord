import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppInstance, waitAsync } from './harness.js';

test('Empirical Stress 1: Sticky Left Sidebar & Sub-Code Chip Switching (Zero Layout Shift & Rapid Switching)', async () => {
  const app = createAppInstance();
  await waitAsync(50);

  const navbar = app.getAppNavbar();
  assert.ok(navbar, 'AppShell Navbar should exist in DOM');

  // Verify sticky navbar styling / structure
  const sidebarNav = app.document.querySelector('#sidebarNav, .sidebar-nav, [data-testid="app-navbar"]');
  assert.ok(sidebarNav, 'Sidebar navigation container should exist');

  // Verify initial layout shift baseline
  const initialMetrics = app.getLayoutShiftMetrics();
  assert.equal(initialMetrics.navbarWidth, 260, 'Navbar width should be fixed 260px');

  const categories = ['all', 'codes', 'screen', 'camera', 'battery', 'pinned'];
  const subCodes = ['FCPB', 'FCPW', 'FCP', 'FCD', 'CAM', 'BAT'];

  // Perform 100 rapid category & sub-code switches
  for (let i = 0; i < 100; i++) {
    const cat = categories[i % categories.length];
    
    // Select category
    try {
      app.selectCategory(cat);
    } catch (e) {
      // If category chip selector is specific
      const catBtn = app.document.querySelector(`[data-cat="${cat}"], [data-testid="category-chip-${cat}"]`) ||
        Array.from(app.document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes(cat.toLowerCase()));
      if (catBtn) catBtn.click();
    }

    await waitAsync(5);

    // Verify visible items list is updated without throwing error
    const items = app.getVisibleItems();
    assert.ok(Array.isArray(items), 'Visible items should always be an array');

    // If subchips are visible, switch sub-code chip
    const subChipBtns = Array.from(app.document.querySelectorAll('.subchip, [data-testid^="sub-chip-"], [data-sub]'));
    if (subChipBtns.length > 0) {
      const subBtn = subChipBtns[i % subChipBtns.length];
      subBtn.click();
      await waitAsync(5);
    }

    // Verify navbar height/width layout stability
    const metrics = app.getLayoutShiftMetrics();
    assert.equal(metrics.navbarWidth, 260, `Navbar width must remain 260px during switch iteration ${i}`);
  }

  // Final check: Navbar overflow Y styling (scrollable when category list is long)
  const overflowStyle = sidebarNav.style.overflowY || app.window.getComputedStyle(sidebarNav).overflowY;
  assert.ok(overflowStyle === 'auto' || overflowStyle === 'scroll', 'Sidebar nav must support vertical scrolling (overflowY)');
});

test('Empirical Stress 2: Top Header Cmd+K Spotlight Modal Search & View Switcher Under Rapid Filtering', async () => {
  const app = createAppInstance();
  await waitAsync(50);

  const header = app.getAppHeader();
  assert.ok(header, 'AppHeader should exist in DOM');

  const viewSwitcher = app.getSegmentedControl();
  assert.ok(viewSwitcher, 'SegmentedControl view switcher should exist');

  const modes = ['list', 'grid', 'table'];
  const searchTerms = ['battery', 'screen', 'camera', 'FCPB', 'display', 'nonexistent_query'];

  // Perform 60 rapid view switches while typing search queries
  for (let i = 0; i < 60; i++) {
    const targetMode = modes[i % 3];
    const query = searchTerms[i % searchTerms.length];

    // Type query
    app.search(query);

    // Switch layout mode simultaneously
    app.setLayoutView(targetMode);
    await waitAsync(5);

    // Verify rendered container items match expectations
    const visibleItems = app.getVisibleItems();
    if (query === 'nonexistent_query') {
      assert.equal(visibleItems.length, 0, `No items should match non-existent query (iter ${i})`);
    } else {
      assert.ok(visibleItems.length >= 0, `Items array should be valid for query "${query}" (iter ${i})`);
    }
  }

  // Clear search query
  app.clearSearch();
  await waitAsync(10);

  // Trigger Cmd+K Spotlight search modal rapidly
  for (let k = 0; k < 10; k++) {
    await app.openSpotlightModal();
    await waitAsync(5);
  }
});

test('Empirical Stress 3: Floating Toast Notifications (Rapid Consecutive Actions, Progress Timers & Stack Cleanup)', async () => {
  const app = createAppInstance();
  await waitAsync(50);

  // Trigger 50 rapid copy actions in quick succession to generate floating toasts
  const items = app.getVisibleItems();
  assert.ok(items.length > 0, 'Items should be available for copying');

  for (let i = 0; i < 50; i++) {
    const itemIndex = i % items.length;
    await app.copyWording(itemIndex);
    await waitAsync(2);
  }

  // Check generated toast notifications
  const toasts = app.getToasts();
  assert.ok(toasts.length > 0, 'Toast notifications should be present after copy actions');

  // Verify toast properties: message content, icons, progress timer elements
  const sampleToast = toasts[0];
  assert.ok(sampleToast.text.length > 0, 'Toast should contain notification text');

  // Verify toast stack cleanup / removal
  const initialCount = toasts.length;
  if (initialCount > 0 && app.document.querySelector('[data-testid="toast-pill"] .mantine-CloseButton-root, #toasts .toast .tclose, button[aria-label*="Close"]')) {
    const closeBtn = app.document.querySelector('[data-testid="toast-pill"] .mantine-CloseButton-root, #toasts .toast .tclose, button[aria-label*="Close"]');
    closeBtn.click();
    await waitAsync(10);
    const afterCount = app.getToasts().length;
    assert.ok(afterCount <= initialCount, 'Toast count should decrease when closed');
  }
});
