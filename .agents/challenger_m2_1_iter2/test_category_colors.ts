import { getCategoryColor, getCategoryIconComponent, getCategoryBadgeStyle, getCategoryLeftBorderStyle } from '../../src/utils/categoryColors.ts';

console.log('=== EMPIRICAL VERIFICATION OF categoryColors.ts ===');

const results: any[] = [];

function test(categoryInput: string, expectedColor: string) {
  const actualColor = getCategoryColor(categoryInput);
  const pass = actualColor.toLowerCase() === expectedColor.toLowerCase();
  const iconComp = getCategoryIconComponent(categoryInput);
  const badgeStyle = getCategoryBadgeStyle(categoryInput);
  const borderStyle = getCategoryLeftBorderStyle(categoryInput);
  
  results.push({
    input: JSON.stringify(categoryInput),
    actualColor,
    expectedColor,
    pass,
    iconName: iconComp ? iconComp.name || iconComp.displayName || 'FolderFallback' : 'None',
    badgeColor: badgeStyle.color,
    leftBorderColor: borderStyle.borderLeftColor,
  });
}

// Battery color in qcData.ts is #38a169 (Soft Green)
test('battery', '#38a169');
test('BATTERY', '#38a169');
test('  BATTERY  ', '#38a169'); // <--- Trimming test case from prompt!
test('  battery  ', '#38a169');
test('\tBATTERY\n', '#38a169');

// Buttons color in qcData.ts is #d97706 (Muted Amber)
test('buttons', '#d97706');
test('  BUTTONS  ', '#d97706');

// Screen color in qcData.ts is #4682b4 (Steel Blue)
test('screen', '#4682b4');
test('  SCREEN  ', '#4682b4');

// Pen color in qcData.ts is #9d4edd (Muted Plum)
test('pen', '#9d4edd');
test('  PEN  ', '#9d4edd');

// Locks color in qcData.ts is #f43f5e (Rose)
test('locks', '#f43f5e');
test('  LOCKS  ', '#f43f5e');

// Unknown category fallback (#64748b)
test('unknown_cat', '#64748b');
test('  UNKNOWN_CAT  ', '#64748b');

console.table(results);

console.log('\n--- VERDICT SUMMARY ---');
const total = results.length;
const passed = results.filter(r => r.pass).length;
const failed = total - passed;
console.log(`Total: ${total}, Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) {
  console.log('FAILURES ENCOUNTERED: Category key normalization / trimming fails!');
} else {
  console.log('ALL CATEGORY COLOR TESTS PASSED!');
}
