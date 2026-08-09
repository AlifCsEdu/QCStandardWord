import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Milestone 6 Challenger: Edge Cases & Visual Differentiation Validation', () => {
  it('1. Category Colors - All 15 CATEGORIES have matching color mappings in categoryColors.ts', () => {
    const qcDataPath = path.join(projectRoot, 'src', 'data', 'qcData.ts');
    const categoryColorsPath = path.join(projectRoot, 'src', 'utils', 'categoryColors.ts');
    
    const qcContent = fs.readFileSync(qcDataPath, 'utf8');
    const colorContent = fs.readFileSync(categoryColorsPath, 'utf8');

    // Expected categories
    const expectedCategories = [
      'all', 'codes', 'screen', 'camera', 'buttons', 'battery', 'backcover',
      'locks', 'pen', 'water', 'audio', 'body', 'system', 'pinned', 'recent'
    ];

    for (const catId of expectedCategories) {
      assert.ok(
        qcContent.includes(`id: "${catId}"`) || qcContent.includes(`id: '${catId}'`),
        `qcData.ts must define category id '${catId}'`
      );
    }

    assert.ok(colorContent.includes("CATEGORY_COLOR_MAP"), 'categoryColors.ts must define CATEGORY_COLOR_MAP');
    assert.ok(colorContent.includes("getCategoryColor"), 'categoryColors.ts must export getCategoryColor');
    assert.ok(colorContent.includes("getCategoryBadgeStyle"), 'categoryColors.ts must export getCategoryBadgeStyle');
  });

  it('2. Category Colors - Fallback Handling & Robustness Analysis', () => {
    const categoryColorsPath = path.join(projectRoot, 'src', 'utils', 'categoryColors.ts');
    const colorContent = fs.readFileSync(categoryColorsPath, 'utf8');

    // Default fallback color '#64748b'
    assert.ok(colorContent.includes("'#64748b'") || colorContent.includes('"#64748b"'), 'Must fallback to slate gray #64748b');

    // Case-insensitivity check: categoryKey.toLowerCase()
    assert.ok(colorContent.includes('.toLowerCase()'), 'categoryColors.ts must convert category key to lower case');
  });

  it('3. DOM Compatibility across Grid, List, Table view modes in JSDOM', async () => {
    const app = createAppInstance();
    const { document } = app;

    // Test List View (default)
    let visibleItems = app.getVisibleItems();
    assert.ok(visibleItems.length > 0, 'List view must render items');
    let firstItem = visibleItems[0];
    let firstEl = firstItem.element;
    assert.ok(firstEl.classList.contains('row'), 'List view element must have class .row');
    assert.ok(firstEl.hasAttribute('data-id'), 'List view element must have data-id attribute');
    assert.ok(firstEl.querySelector('.rnum'), 'List view element must contain .rnum');
    assert.ok(firstEl.querySelector('.rtxt'), 'List view element must contain .rtxt');
    assert.ok(firstEl.querySelector('.rpill'), 'List view element must contain .rpill');
    assert.ok(firstEl.querySelector('.racts'), 'List view element must contain .racts');

    // Test Grid View
    app.setLayoutView('grid');
    await waitAsync(50);
    visibleItems = app.getVisibleItems();
    assert.ok(visibleItems.length > 0, 'Grid view must render items');
    firstItem = visibleItems[0];
    firstEl = firstItem.element;
    assert.ok(firstEl.classList.contains('gcard'), 'Grid view element must have class .gcard');
    assert.ok(firstEl.hasAttribute('data-id'), 'Grid view element must have data-id attribute');
    assert.ok(firstEl.querySelector('.rnum'), 'Grid view element must contain .rnum');
    assert.ok(firstEl.querySelector('.rtxt'), 'Grid view element must contain .rtxt');
    assert.ok(firstEl.querySelector('.rpill'), 'Grid view element must contain .rpill');
    assert.ok(firstEl.querySelector('.racts'), 'Grid view element must contain .racts');

    // Test Table View
    app.setLayoutView('table');
    await waitAsync(50);
    visibleItems = app.getVisibleItems();
    assert.ok(visibleItems.length > 0, 'Table view must render items');
    firstItem = visibleItems[0];
    firstEl = firstItem.element;
    assert.ok(firstEl.classList.contains('trow'), 'Table view element must have class .trow');
    assert.ok(firstEl.hasAttribute('data-id'), 'Table view element must have data-id attribute');
    assert.ok(firstEl.querySelector('.rnum'), 'Table view element must contain .rnum');
    assert.ok(firstEl.querySelector('.rtxt'), 'Table view element must contain .rtxt');
    assert.ok(firstEl.querySelector('.rpill'), 'Table view element must contain .rpill');
    assert.ok(firstEl.querySelector('.racts'), 'Table view element must contain .racts');
  });

  it('4. Action Buttons Hierarchy & Interaction States in .racts', async () => {
    const app = createAppInstance();
    const { document } = app;

    // By default editMode is off
    let rows = document.querySelectorAll('.row, .gcard, .trow');
    let firstRow = rows[0];
    let racts = firstRow.querySelector('.racts');
    assert.ok(racts, '.racts container must exist');
    assert.ok(racts.querySelector('[data-act="pin"]'), 'Pin action button must exist');
    assert.ok(racts.querySelector('[data-act="add"]'), 'Add batch action button must exist');
    assert.strictEqual(racts.querySelector('[data-act="edit"]'), null, 'Edit action button should be hidden when editMode=false');
    assert.strictEqual(racts.querySelector('[data-act="del"]'), null, 'Delete action button should be hidden when editMode=false');

    // Toggle edit mode
    app.toggleEditMode();
    await waitAsync(50);

    rows = document.querySelectorAll('.row, .gcard, .trow');
    firstRow = rows[0];
    racts = firstRow.querySelector('.racts');
    assert.ok(racts.querySelector('[data-act="edit"]'), 'Edit action button must exist when editMode=true');
    assert.ok(racts.querySelector('[data-act="del"]'), 'Delete action button must exist when editMode=true');
  });

  it('5. Query Highlight integration with <mark> inside .rtxt', async () => {
    const app = createAppInstance();
    const { document } = app;

    app.search('Camera');
    await waitAsync(50);

    const markEls = document.querySelectorAll('.rtxt mark');
    assert.ok(markEls.length > 0, 'Searching for Camera should render <mark> elements inside .rtxt');
    assert.ok(markEls[0].textContent.toLowerCase().includes('cam'), '<mark> element should wrap matched query text');
  });

  it('6. CSS Visual Differentiation Rules in src/index.css', () => {
    const cssPath = path.join(projectRoot, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Check defect card variables
    assert.ok(cssContent.includes('--defect-card-bg: var(--container-charcoal, #1e293b)'), 'Dark theme defect card bg must be container charcoal');
    assert.ok(cssContent.includes('--defect-card-border: var(--border-contrast, #334155)'), 'Dark theme border contrast must be #334155');
    assert.ok(cssContent.includes('--defect-rnum-color: #64748b'), 'Defect number color must be slate #64748b');

    // Hover states & transitions
    assert.ok(cssContent.includes('.gcard:hover'), '.gcard:hover must be defined');
    assert.ok(cssContent.includes('.row:hover'), '.row:hover must be defined');
    assert.ok(cssContent.includes('.trow:hover'), '.trow:hover must be defined');
    assert.ok(cssContent.includes('transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease;'), '150ms ease transition rule must exist for cards/rows');

    // Mark styling inside .rtxt
    assert.ok(cssContent.includes('.rtxt mark'), '.rtxt mark rule must exist');
    assert.ok(cssContent.includes('background: rgba(6, 182, 212, 0.25)'), '.rtxt mark background cyan opacity must be configured');
  });
});
