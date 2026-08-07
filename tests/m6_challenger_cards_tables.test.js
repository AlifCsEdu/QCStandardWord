import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Challenger M6: High-Contrast Cards, Tables & Visual Differentiation Verification', () => {
  it('1. CSS Rule Inspection: high-contrast border (#334155), 150ms ease transitions, and cyan hover glow', () => {
    const cssPath = path.join(projectRoot, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Deep Slate theme variable
    assert.ok(cssContent.includes('--border-contrast: #334155;'), 'CSS root variables must define --border-contrast as #334155');

    // High-contrast container selectors
    assert.ok(cssContent.includes('.gcard, .row, .trow'), 'CSS must group .gcard, .row, .trow for base high-contrast card styling');
    assert.ok(cssContent.includes('border: 1px solid var(--defect-card-border);'), 'Cards/rows must use high-contrast border');

    // 150ms ease transitions
    assert.ok(cssContent.includes('150ms ease'), 'CSS must specify 150ms ease transition for smooth visual feedback');

    // Hover elevation & glow
    assert.ok(cssContent.includes('.gcard:hover'), 'CSS must specify .gcard hover state');
    assert.ok(cssContent.includes('.row:hover'), 'CSS must specify .row hover state');
    assert.ok(cssContent.includes('.trow:hover'), 'CSS must specify .trow hover state');
    assert.ok(cssContent.includes('--defect-card-glow-hover'), 'CSS must define --defect-card-glow-hover variable');

    // Typography hierarchy & category pill
    assert.ok(cssContent.includes('.rnum'), 'CSS must define item number styling .rnum');
    assert.ok(cssContent.includes('.rtxt'), 'CSS must define text title styling .rtxt');
    assert.ok(cssContent.includes('.rpill'), 'CSS must define category pill styling .rpill');
    assert.ok(cssContent.includes('.racts'), 'CSS must define action buttons container .racts');
  });

  it('2. Category Colors & Badge Utilities: source code verification of categoryColors.ts & qcData.ts', () => {
    const colorsPath = path.join(projectRoot, 'src', 'utils', 'categoryColors.ts');
    const colorsContent = fs.readFileSync(colorsPath, 'utf8');

    assert.ok(colorsContent.includes('getCategoryColor'), 'categoryColors.ts must export getCategoryColor function');
    assert.ok(colorsContent.includes('getCategoryBadgeStyle'), 'categoryColors.ts must export getCategoryBadgeStyle function');
    assert.ok(colorsContent.includes('hexToRgb'), 'categoryColors.ts must contain hexToRgb helper');
    assert.ok(colorsContent.includes('rgba('), 'categoryColors.ts must generate rgba background and border colors');

    const qcDataPath = path.join(projectRoot, 'src', 'data', 'qcData.ts');
    const qcContent = fs.readFileSync(qcDataPath, 'utf8');
    assert.ok(qcContent.includes('export const CATEGORIES'), 'qcData.ts must export CATEGORIES list');
  });

  it('3. Layout Mode Verification (Grid View): cards render .gcard with data-id, typography & pill badge', () => {
    const app = createAppInstance();
    app.setLayoutView('grid');

    const items = app.getVisibleItems();
    assert.ok(items.length > 0, 'Grid view should render visible defect items');

    const firstItem = items[0];
    assert.ok(firstItem.element.classList.contains('gcard'), 'Grid view items must have .gcard class');
    assert.ok(firstItem.id, 'Item must have valid data-id attribute');

    // Element inspection
    const node = firstItem.element;
    assert.ok(node.querySelector('.rnum'), 'Card must contain .rnum element');
    assert.ok(node.querySelector('.rtxt'), 'Card must contain .rtxt element');

    const pillEl = node.querySelector('.rpill');
    assert.ok(pillEl, 'Card must contain .rpill category badge');
    assert.ok(pillEl.getAttribute('style')?.includes('color:'), 'Badge element must have dynamic style attributes');

    assert.ok(node.querySelector('.racts'), 'Card must contain .racts action buttons container');
  });

  it('4. Layout Mode Verification (List View): rows render .row with data-id, typography & pill badge', () => {
    const app = createAppInstance();
    app.setLayoutView('list');

    const items = app.getVisibleItems();
    assert.ok(items.length > 0, 'List view should render visible defect items');

    const firstItem = items[0];
    assert.ok(firstItem.element.classList.contains('row'), 'List view items must have .row class');
    assert.ok(firstItem.id, 'Item must have valid data-id attribute');

    const node = firstItem.element;
    assert.ok(node.querySelector('.rnum'), 'Row must contain .rnum element');
    assert.ok(node.querySelector('.rtxt'), 'Row must contain .rtxt element');
    assert.ok(node.querySelector('.rpill'), 'Row must contain .rpill category badge');
    assert.ok(node.querySelector('.racts'), 'Row must contain .racts action buttons container');
  });

  it('5. Layout Mode Verification (Table View): rows render .trow with data-id, typography & pill badge', () => {
    const app = createAppInstance();
    app.setLayoutView('table');

    const items = app.getVisibleItems();
    assert.ok(items.length > 0, 'Table view should render visible defect items');

    const firstItem = items[0];
    assert.ok(firstItem.element.classList.contains('trow'), 'Table view items must have .trow class');
    assert.ok(firstItem.id, 'Item must have valid data-id attribute');

    const node = firstItem.element;
    assert.ok(node.querySelector('.rnum'), 'Table row must contain .rnum element');
    assert.ok(node.querySelector('.rtxt'), 'Table row must contain .rtxt element');
    assert.ok(node.querySelector('.rpill'), 'Table row must contain .rpill category badge');
    assert.ok(node.querySelector('.racts'), 'Table row must contain .racts action buttons container');
  });

  it('6. Pin & Edit Mode Interactivity: toggling pin updates .pinned state across DOM', async () => {
    const app = createAppInstance();

    // Toggle pin on first item
    await app.clickItemAction(0, 'pin');
    const items = app.getVisibleItems();
    assert.equal(items[0].isPinned, true, 'First item must have pinned state active after toggle');

    // Toggle edit mode and check edit/del action buttons
    app.toggleEditMode();
    const firstNode = items[0].element;
    assert.ok(firstNode.querySelector('[data-act="edit"]'), 'Edit mode must render edit button in .racts');
    assert.ok(firstNode.querySelector('[data-act="del"]'), 'Edit mode must render del button in .racts');
  });
});
