import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';
import { CODE_SUBS } from '../src/data/qcData.ts';

describe('Challenger M3: Sticky Navigation, Header & Layout Shift Empirical Tests', () => {
  it('1. Harness Query Resilience: should successfully query getAppNavbar, getAppHeader, and getSegmentedControl', () => {
    const app = createAppInstance();
    
    const navbar = app.getAppNavbar();
    assert.ok(navbar, 'getAppNavbar() must return a non-null DOM element');
    assert.ok(
      navbar.getAttribute('data-testid') === 'app-navbar' ||
      navbar.id === 'sidebarNav' ||
      navbar.classList.contains('sidebar-nav'),
      'AppNavbar element must match required selectors'
    );

    const header = app.getAppHeader();
    assert.ok(header, 'getAppHeader() must return a non-null DOM element');
    assert.ok(
      header.getAttribute('data-testid') === 'app-header' ||
      header.id === 'appHeader' ||
      header.classList.contains('app-header'),
      'AppHeader element must match required selectors'
    );

    const segmented = app.getSegmentedControl();
    assert.ok(segmented, 'getSegmentedControl() must return a non-null DOM element');
    assert.ok(
      segmented.getAttribute('data-testid') === 'view-switcher' ||
      segmented.id === 'setLayout',
      'SegmentedControl element must match required selectors'
    );
  });

  it('2. Category & Sub-Category Selection Resilience: selectCategory and selectSubCategory must operate seamlessly', () => {
    const app = createAppInstance();

    // Select category 'codes'
    app.selectCategory('codes');
    let metrics = app.getLayoutShiftMetrics();
    assert.equal(metrics.subchipsVisible, true, 'Subchips should be visible when category is "codes"');

    // Select sub-category 'FCPB'
    app.selectSubCategory('FCPB');
    let items = app.getVisibleItems();
    assert.ok(items.length > 0, 'Items should be visible after selecting sub-category FCPB');
    for (const item of items) {
      assert.ok(item.text.toUpperCase().includes('FCPB') || item.num.includes('FCPB'), `Item "${item.text}" should match sub-category FCPB`);
    }

    // Select sub-category 'FCPW'
    app.selectSubCategory('FCPW');
    items = app.getVisibleItems();
    assert.ok(items.length > 0, 'Items should be visible after selecting sub-category FCPW');
    for (const item of items) {
      assert.ok(item.text.toUpperCase().includes('FCPW') || item.num.includes('FCPW'), `Item "${item.text}" should match sub-category FCPW`);
    }

    // Switch to 'screen' category
    app.selectCategory('screen');
    metrics = app.getLayoutShiftMetrics();
    assert.equal(metrics.subchipsVisible, false, 'Subchips should NOT be visible when category is "screen"');
  });

  it('3. Layout Shift Verification: Main content container position is unaffected by sub-chips visibility', () => {
    const app = createAppInstance();
    const { document } = app;

    const mainContainer = document.querySelector('.mantine-AppShell-main, main');
    assert.ok(mainContainer, 'Main content container must exist');

    // Measure initial paddingTop or position for category 'all'
    const initialStyle = mainContainer.getAttribute('style') || '';
    
    // Switch to 'codes' (shows sub-chips in sidebar)
    app.selectCategory('codes');
    const codesStyle = mainContainer.getAttribute('style') || '';

    // Switch between sub-codes
    app.selectSubCategory('FCPB');
    const fcpbStyle = mainContainer.getAttribute('style') || '';

    app.selectSubCategory('FCPW');
    const fcpwStyle = mainContainer.getAttribute('style') || '';

    // Switch to 'camera'
    app.selectCategory('camera');
    const cameraStyle = mainContainer.getAttribute('style') || '';

    // Verify main content container styling / padding is identical (0px layout shift)
    assert.equal(codesStyle, initialStyle, 'Main container style must remain unchanged when opening sub-chips');
    assert.equal(fcpbStyle, initialStyle, 'Main container style must remain unchanged when switching to FCPB');
    assert.equal(fcpwStyle, initialStyle, 'Main container style must remain unchanged when switching to FCPW');
    assert.equal(cameraStyle, initialStyle, 'Main container style must remain unchanged when switching to camera');
  });

  it('4. Navigation Placement: Sub-chips must reside strictly inside Navbar sidebar, not Main container', () => {
    const app = createAppInstance();
    const { document } = app;

    app.selectCategory('codes');

    const navbar = app.getAppNavbar();
    const mainContainer = document.querySelector('.mantine-AppShell-main, main');

    const subchipsInNavbar = navbar ? navbar.querySelector('#subchips, [data-testid="code-sub-chips"], .subchips-container') : null;
    const subchipsInMain = mainContainer ? mainContainer.querySelector('#subchips, [data-testid="code-sub-chips"], .subchips-container') : null;

    assert.ok(subchipsInNavbar, 'Sub-chips element MUST reside inside AppShell Navbar');
    assert.equal(subchipsInMain, null, 'Sub-chips element MUST NOT reside inside AppShell Main container');
  });

  it('5. Exhaustive Category Switching Loop: Navigating through all 13 categories & sub-codes without error', () => {
    const app = createAppInstance();

    const categories = [
      'all', 'codes', 'screen', 'camera', 'buttons', 
      'battery', 'backcover', 'locks', 'pen', 'water', 
      'audio', 'body', 'system'
    ];

    for (const cat of categories) {
      app.selectCategory(cat);
      if (cat === 'codes') {
        for (const sub of CODE_SUBS) {
          app.selectSubCategory(sub);
          const visible = app.getVisibleItems();
          assert.ok(Array.isArray(visible), `Visible items for sub-category ${sub} must be an array`);
        }
      } else {
        const visible = app.getVisibleItems();
        assert.ok(Array.isArray(visible), `Visible items for category ${cat} must be an array`);
      }
    }
  });
});
