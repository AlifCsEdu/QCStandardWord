import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import path from 'node:path';
import { globSync } from 'fs';

const testFiles = [
  'tests/tier1-features.test.js',
  'tests/tier2-boundary.test.js',
  'tests/tier3-combinations.test.js',
  'tests/tier4-workloads.test.js',
  'tests/m2_challenger_theme.test.js',
  'tests/m3_challenger_header_layout.test.js',
  'tests/m3_challenger_layout_and_resilience.test.js',
  'tests/m4_challenger_toast.test.js',
  'tests/m4_challenger_toast_stress.test.js'
].map(f => path.resolve(f));

console.log('Running test files:', testFiles);

run({ files: testFiles })
  .compose(new spec())
  .pipe(process.stdout);
