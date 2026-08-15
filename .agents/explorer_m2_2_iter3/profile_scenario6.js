import { createAppInstance } from '../../tests/harness.js';

console.log('--- Profiling Scenario 6 breakdown ---');
const app = createAppInstance();

for (let i = 0; i < 3; i++) {
  let t0 = performance.now();
  app.selectCategory('battery');
  let t1 = performance.now();
  console.log(`Iter ${i} selectCategory('battery'): ${(t1 - t0).toFixed(2)}ms`);

  t0 = performance.now();
  app.search(`test query ${i}`);
  t1 = performance.now();
  console.log(`Iter ${i} search('test query ${i}'): ${(t1 - t0).toFixed(2)}ms`);

  t0 = performance.now();
  app.selectCategory('screen');
  t1 = performance.now();
  console.log(`Iter ${i} selectCategory('screen'): ${(t1 - t0).toFixed(2)}ms`);

  t0 = performance.now();
  app.clearSearch();
  t1 = performance.now();
  console.log(`Iter ${i} clearSearch(): ${(t1 - t0).toFixed(2)}ms`);
}
