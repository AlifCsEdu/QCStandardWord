import { createAppInstance } from '../../tests/harness.js';
import assert from 'node:assert';

console.log('--- Running Scenario 6 latency test ---');
const app = createAppInstance();

const startTime = performance.now();

// Rapidly execute operations
for (let i = 0; i < 3; i++) {
  app.selectCategory('battery');
  app.search(`test query ${i}`);
  app.selectCategory('screen');
  app.clearSearch();
}

const endTime = performance.now();
const duration = endTime - startTime;
console.log(`Scenario 6 duration: ${duration.toFixed(2)}ms`);

try {
  assert.ok(
    duration < 1000,
    `High-volume operation latency (${duration.toFixed(2)}ms) must be under 1000ms threshold`
  );
  console.log('SCENARIO 6 LATENCY PASSED!');
} catch (err) {
  console.error('SCENARIO 6 LATENCY FAILED:', err.message);
}
