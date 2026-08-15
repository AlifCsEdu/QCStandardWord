import { createAppInstance } from '../../tests/harness.js';
import assert from 'node:assert';

console.log('--- Benchmarking Scenario 6 across 5 runs ---');

const durations = [];
for (let run = 0; run < 5; run++) {
  const app = createAppInstance();
  const startTime = performance.now();

  for (let i = 0; i < 3; i++) {
    app.selectCategory('battery');
    app.search(`test query ${i}`);
    app.selectCategory('screen');
    app.clearSearch();
  }

  const endTime = performance.now();
  const duration = endTime - startTime;
  durations.push(duration);
  console.log(`Run ${run + 1}: ${duration.toFixed(2)}ms`);
}

const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
console.log(`Average duration: ${avg.toFixed(2)}ms`);
