import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';

describe('Milestone 2 Iteration 3 Latency Stress Tests (Challenger 2)', () => {
  it('Scenario 6 High-Volume Operations Latency Test (Per-Op Latency < 1000ms)', async () => {
    const app = createAppInstance();

    // Warm-up
    app.selectCategory('all');
    app.clearSearch();

    const startTime = performance.now();

    // Execute Scenario 6 operations (3 iterations as defined in workload tier)
    const opsCount = 12;
    for (let i = 0; i < 3; i++) {
      app.selectCategory('battery');
      app.search(`test query ${i}`);
      app.selectCategory('screen');
      app.clearSearch();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const avgPerOp = duration / opsCount;

    console.log(`[Scenario 6 Total Latency (12 ops)]: ${duration.toFixed(2)}ms`);
    console.log(`[Scenario 6 Average Per-Op Latency]: ${avgPerOp.toFixed(2)}ms`);

    assert.ok(
      avgPerOp < 1000,
      `Scenario 6 average per-operation latency (${avgPerOp.toFixed(2)}ms) MUST be strictly under 1000ms threshold`
    );
    assert.ok(
      duration < 2000,
      `Scenario 6 total workload latency (${duration.toFixed(2)}ms) MUST be under 2000ms workload SLA`
    );
  });

  it('Rapid Category Switching Per-Switch Latency Test (<1000ms)', async () => {
    const app = createAppInstance();
    const categories = [
      'battery', 'buttons', 'screen', 'pen', 'locks',
      'codes', 'body', 'camera', 'backcover', 'water',
      'audio', 'system', 'pinned', 'all', 'recent'
    ];

    // Warm-up
    app.selectCategory('all');

    const switchLatencies: number[] = [];

    // Measure individual category switch latency for each category
    for (const cat of categories) {
      const tStart = performance.now();
      app.selectCategory(cat);
      const tEnd = performance.now();
      const lat = tEnd - tStart;
      switchLatencies.push(lat);
      assert.ok(
        lat < 1000,
        `Category switch to '${cat}' latency (${lat.toFixed(2)}ms) MUST be strictly under 1000ms threshold`
      );
    }

    const avgLat = switchLatencies.reduce((a, b) => a + b, 0) / switchLatencies.length;
    console.log(`[Rapid Category Switch Average Latency]: ${avgLat.toFixed(2)}ms`);

    assert.ok(
      avgLat < 1000,
      `Average category switch latency (${avgLat.toFixed(2)}ms) MUST be strictly under 1000ms threshold`
    );
  });

  it('Single Search Operation Latency Test (<1000ms)', async () => {
    const app = createAppInstance();

    const t1 = performance.now();
    app.selectCategory('battery');
    const d1 = performance.now() - t1;

    const t2 = performance.now();
    app.search('battery defect');
    const d2 = performance.now() - t2;

    const t3 = performance.now();
    app.selectCategory('screen');
    const d3 = performance.now() - t3;

    console.log(`Single Category Switch (battery): ${d1.toFixed(2)}ms`);
    console.log(`Single Search Operation: ${d2.toFixed(2)}ms`);
    console.log(`Single Category Switch (screen): ${d3.toFixed(2)}ms`);

    assert.ok(d1 < 1000, `Single category switch (${d1.toFixed(2)}ms) must be under 1000ms`);
    assert.ok(d2 < 1000, `Single search (${d2.toFixed(2)}ms) must be under 1000ms`);
    assert.ok(d3 < 1000, `Single category switch (${d3.toFixed(2)}ms) must be under 1000ms`);
  });
});
