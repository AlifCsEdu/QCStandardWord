import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from '../../tests/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ ${message}`);
    failures.push(message);
  }
}

async function runEmpiricalStressTests() {
  console.log('====================================================');
  console.log('CHALLENGER M1 EMPIRICAL STRESS & INTEGRITY SUITE');
  console.log('====================================================\n');

  // TEST SUITE 1: CSS Variable Integrity & Style Purge
  console.log('--- Suite 1: CSS Theme Tokens & Mantine Style Purge ---');
  const cssPath = path.join(projectRoot, 'src', 'index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('#050608'), 'index.css contains Deep Void Midnight (#050608)');
  assert(cssContent.includes('#0c0e12'), 'index.css contains Onyx surface container (#0c0e12)');
  assert(!cssContent.includes('--mantine-color-body'), 'index.css has 0 occurrences of legacy --mantine-color-body');
  assert(!cssContent.includes('[data-mantine-color-scheme]'), 'index.css has 0 occurrences of legacy [data-mantine-color-scheme]');
  assert(cssContent.includes('Geist') && cssContent.includes('Inter') && cssContent.includes('JetBrains Mono'), 'index.css imports Geist/Inter and JetBrains Mono typography');
  assert(cssContent.includes('ambient-cyan-glow') && cssContent.includes('glow-cyan-subtle'), 'index.css contains ambient cyan glow utilities');

  // TEST SUITE 2: Hardcoded Inline Light Style Purge in Components
  console.log('\n--- Suite 2: Component Inline Light Style Purge ---');
  const hbPath = path.join(projectRoot, 'src', 'components', 'HistoryBar.tsx');
  const etPath = path.join(projectRoot, 'src', 'components', 'EditToolbar.tsx');
  const csPath = path.join(projectRoot, 'src', 'components', 'CodeSubChips.tsx');

  const hbContent = fs.readFileSync(hbPath, 'utf8');
  const etContent = fs.readFileSync(etPath, 'utf8');
  const csContent = fs.readFileSync(csPath, 'utf8');

  const lightColors = ['#fff9db', '#ffe066', '#f59f00', '#fcc419', '#fff3bf', '#e67700', '#e7f5ff', '#a5d8ff', '#1971c2', '#495057', '#ffffff', '#7048e8'];
  
  let hbHasLight = lightColors.some(c => hbContent.includes(c));
  assert(!hbHasLight, 'HistoryBar.tsx has 0 hardcoded light inline styles');

  let etHasLight = ['#e7f5ff', '#a5d8ff', '#1971c2', '#495057', '#ffffff'].some(c => etContent.includes(c));
  assert(!etHasLight, 'EditToolbar.tsx has 0 hardcoded light inline styles');

  let csHasLight = csContent.includes('#7048e8');
  assert(!csHasLight, 'CodeSubChips.tsx has 0 hardcoded violet light inline styles (#7048e8)');

  // TEST SUITE 3: DOM Element & Selector Contract Verification
  console.log('\n--- Suite 3: DOM Element & Selector Contract Verification ---');
  const app = createAppInstance({
    initialStorage: {
      'qc-history': JSON.stringify(['Test copied wording item'])
    }
  });
  await waitAsync(50);

  const doc = app.document;

  assert(!!doc.querySelector('#histbar'), 'DOM element #histbar is present');
  assert(!!doc.querySelector('#hchips'), 'DOM element #hchips is present when history exists');
  assert(!!doc.querySelector('#hclearAll'), 'DOM element #hclearAll is present when history exists');
  assert(!!doc.querySelector('#editstrip'), 'DOM element #editstrip is present');
  assert(!!doc.querySelector('#addBtn'), 'DOM element #addBtn is present');
  assert(!!doc.querySelector('#exportBtn'), 'DOM element #exportBtn is present');
  assert(!!doc.querySelector('#importBtn'), 'DOM element #importBtn is present');
  assert(!!doc.querySelector('#importFile'), 'DOM element #importFile is present');
  assert(!!doc.querySelector('#resetBtn'), 'DOM element #resetBtn is present');
  assert(!!doc.querySelector('#subchips'), 'DOM element #subchips is present');

  // TEST SUITE 4: UI State Toggles & Stress Test
  console.log('\n--- Suite 4: UI State Toggles Empirical Stress Test ---');
  
  // 4.1 Edit Mode Stress Toggling (100 rapid toggles)
  console.log('  Testing 100 rapid Edit Mode toggles...');
  const editStrip = doc.querySelector('#editstrip');
  let editToggleFailures = 0;

  for (let i = 0; i < 100; i++) {
    app.toggleEditMode();
    const isEditMode = app.isEditModeActive();
    const hasShowClass = editStrip.classList.contains('show');
    if (isEditMode !== hasShowClass) {
      editToggleFailures++;
    }
  }
  assert(editToggleFailures === 0, 'Edit Mode 100 rapid toggles: 0 class mismatch failures');

  // Ensure state resets properly after even count of toggles (100 times = false)
  assert(!app.isEditModeActive(), 'Edit mode inactive after 100 toggles');
  assert(!editStrip.classList.contains('show'), '#editstrip hides .show class after 100 toggles');

  // 4.2 Subchip Category Navigation & Visibility Stress
  console.log('  Testing category selection & subchips toggle stress...');
  const subchipsEl = doc.querySelector('#subchips');
  
  // Select 'codes' category which renders subcodes
  app.selectCategory('codes');
  await waitAsync(20);
  assert(subchipsEl.classList.contains('show'), '#subchips displays .show when "codes" category selected');

  const subBtns = Array.from(subchipsEl.querySelectorAll('[data-sub]'));
  assert(subBtns.length > 0, `Subchips rendered ${subBtns.length} subcode buttons with data-sub attribute`);

  // Rapidly toggle subcodes
  if (subBtns.length >= 2) {
    let subChipFailures = 0;
    for (let i = 0; i < 50; i++) {
      const targetSub = subBtns[i % subBtns.length].getAttribute('data-sub');
      app.selectSubCategory(targetSub);
      const activeBtn = subchipsEl.querySelector('.active');
      if (!activeBtn || activeBtn.getAttribute('data-sub') !== targetSub) {
        subChipFailures++;
      }
    }
    assert(subChipFailures === 0, '50 subchip clicks: 0 active class mismatch failures');
  }

  // Select non-codes category (e.g. 'screen') and check hidden
  app.selectCategory('screen');
  await waitAsync(20);
  assert(!subchipsEl.classList.contains('show'), '#subchips hides .show when non-codes category (screen) selected');

  // 4.3 History Bar Dynamic Rendering & Interaction Stress
  console.log('  Testing History Bar copy & clear interaction stress...');
  const historyBarEl = doc.querySelector('#histbar');
  assert(historyBarEl !== null, '#histbar present in DOM');

  // Populate history by copying items
  const initialItems = app.getVisibleItems();
  if (initialItems.length > 0) {
    for (let i = 0; i < Math.min(5, initialItems.length); i++) {
      await app.copyWording(i);
    }
    await waitAsync(30);

    const historyItems = app.getRecentHistoryItems();
    assert(historyItems.length > 0, `HistoryBar dynamically rendered ${historyItems.length} recent copy chips`);
    
    // Verify each history chip has valid data-hcopy attribute
    const chips = doc.querySelectorAll('#hchips .hchip');
    let missingAttrCount = 0;
    chips.forEach(chip => {
      if (!chip.getAttribute('data-hcopy')) missingAttrCount++;
    });
    assert(missingAttrCount === 0, 'All rendered history chips possess non-empty data-hcopy attribute');

    // Test clear history button
    app.clearRecentHistory();
    await waitAsync(20);
    const historyAfterClear = app.getRecentHistoryItems();
    assert(historyAfterClear.length === 0, 'HistoryBar correctly cleared all history chips upon #hclearAll click');
  }

  // TEST SUMMARY
  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log('====================================================');

  if (failedTests > 0) {
    console.error('FAILURES:', failures);
    process.exit(1);
  } else {
    console.log('ALL EMPIRICAL STRESS TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runEmpiricalStressTests().catch(err => {
  console.error('FATAL ERROR IN STRESS TEST RUNNER:', err);
  process.exit(1);
});
