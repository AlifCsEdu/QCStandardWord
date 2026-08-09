import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Direct Unit Analysis - Category Colors & Fallbacks', () => {
  it('analyzes categoryColors.ts source code structure', () => {
    const filePath = path.join(projectRoot, 'src', 'utils', 'categoryColors.ts');
    const code = fs.readFileSync(filePath, 'utf8');

    assert.ok(code.includes('export function getCategoryColor'), 'Must export getCategoryColor');
    assert.ok(code.includes('export function getCategoryBadgeStyle'), 'Must export getCategoryBadgeStyle');
    assert.ok(code.includes("CATEGORY_COLOR_MAP[categoryKey.toLowerCase()] || '#64748b'"), 'Must convert to lower case and fallback to #64748b');
  });

  it('analyzes qcData.ts categories against CATEGORY_COLOR_MAP', () => {
    const filePath = path.join(projectRoot, 'src', 'data', 'qcData.ts');
    const code = fs.readFileSync(filePath, 'utf8');

    // Extract all category IDs
    const matches = [...code.matchAll(/id:\s*["']([^"']+)["']/g)].map(m => m[1]);
    assert.ok(matches.length >= 15, `Found ${matches.length} category ids in qcData.ts`);
    
    // Check known categories
    const categories = ['all', 'codes', 'screen', 'camera', 'buttons', 'battery', 'backcover', 'locks', 'pen', 'water', 'audio', 'body', 'system', 'pinned', 'recent'];
    for (const cat of categories) {
      assert.ok(matches.includes(cat), `qcData.ts must contain category '${cat}'`);
    }
  });

  it('analyzes CSS classes and variables in src/index.css', () => {
    const filePath = path.join(projectRoot, 'src', 'index.css');
    const css = fs.readFileSync(filePath, 'utf8');

    // M6 High-Contrast Defect Cards & Tables requirements
    assert.ok(css.includes('.gcard, .row, .trow'), 'CSS must group .gcard, .row, .trow styling');
    assert.ok(css.includes('.gcard.pinned, .row.pinned, .trow.pinned'), 'CSS must group pinned states');
    assert.ok(css.includes('.gcard:hover'), 'CSS must have .gcard:hover rule');
    assert.ok(css.includes('.row:hover'), 'CSS must have .row:hover rule');
    assert.ok(css.includes('.trow:hover'), 'CSS must have .trow:hover rule');
    assert.ok(css.includes('.rnum'), 'CSS must have .rnum rule');
    assert.ok(css.includes('.rtxt'), 'CSS must have .rtxt rule');
    assert.ok(css.includes('.rtxt mark'), 'CSS must have .rtxt mark rule');
    assert.ok(css.includes('.rpill'), 'CSS must have .rpill rule');
    assert.ok(css.includes('.racts'), 'CSS must have .racts rule');
  });
});
