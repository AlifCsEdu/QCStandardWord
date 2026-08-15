import { getCategoryColor, getCategoryIconComponent } from '../../src/utils/categoryColors.ts';
import { CATEGORIES } from '../../src/data/qcData.ts';

console.log('--- EMPIRICAL TEST FOR categoryColors.ts ---');

const batteryColor = CATEGORIES.find(c => c.id.toLowerCase() === 'battery')?.color;
console.log('Expected Battery Color from CATEGORIES:', batteryColor);

const testCases = [
  'battery',
  'BATTERY',
  '  BATTERY  ',
  '  battery  ',
  '\tBATTERY\n',
  'screen',
  '  SCREEN  ',
  'buttons',
  '  BUTTONS  ',
];

for (const tc of testCases) {
  const color = getCategoryColor(tc);
  const iconComp = getCategoryIconComponent(tc);
  console.log(`Input: "${tc}" -> Color: ${color} (Matches expected? ${color === batteryColor || color === '#38a169'}), Icon Name: ${iconComp ? iconComp.name || iconComp.displayName || 'Component' : 'None'}`);
}
