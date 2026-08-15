import { spawn } from 'node:child_process';

console.log('--- Running tier2-boundary.test.js and tier4-workloads.test.js ---');

const proc = spawn('npx', ['tsx', '--test', 'tests/tier2-boundary.test.js', 'tests/tier4-workloads.test.js'], {
  stdio: 'inherit',
  shell: true,
});

proc.on('close', (code) => {
  console.log(`\nTest run exited with code ${code}`);
});
