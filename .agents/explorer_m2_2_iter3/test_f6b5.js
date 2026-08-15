import { createAppInstance } from '../../tests/harness.js';
import assert from 'node:assert';

console.log('--- Running F6-B5 reproduction ---');
const app = createAppInstance();
app.selectCategory('pinned');
const visible = app.getVisibleItems();
console.log('visible length:', visible.length);

const pinnedNavTab = app.document.querySelector('[data-cat="pinned"], [data-testid="category-tab-pinned"]');
console.log('pinnedNavTab element:', pinnedNavTab ? pinnedNavTab.outerHTML : 'NULL');

if (pinnedNavTab) {
  const badge = pinnedNavTab.querySelector('span.rounded-full, .rounded-full');
  console.log('badge element:', badge ? badge.outerHTML : 'NULL');
  if (badge) {
    console.log('badge textContent.trim():', JSON.stringify(badge.textContent.trim()));
    try {
      assert.equal(badge.textContent.trim(), '0', 'Count badge on empty category tab must render "0"');
      console.log('ASSERTION PASSED!');
    } catch (err) {
      console.error('ASSERTION FAILED:', err.message);
      console.error('Actual:', err.actual);
      console.error('Expected:', err.expected);
    }
  }
}
