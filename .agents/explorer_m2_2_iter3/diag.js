import { createAppInstance } from '../../tests/harness.js';

const app = createAppInstance();
app.selectCategory('pinned');

const allPinnedTabs = app.document.querySelectorAll('[data-cat="pinned"], [data-testid="category-tab-pinned"]');
console.log('Count of matching pinned tabs:', allPinnedTabs.length);

allPinnedTabs.forEach((tab, index) => {
  console.log(`\nTab ${index}:`, tab.outerHTML);
  const badge = tab.querySelector('span.rounded-full, .rounded-full');
  console.log(`Badge ${index}:`, badge ? badge.outerHTML : 'null');
  console.log(`Badge text ${index}:`, badge ? `"${badge.textContent.trim()}"` : 'null');
});
