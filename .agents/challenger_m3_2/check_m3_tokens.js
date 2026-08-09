import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/alif325/Documents/WIndsurf projeks/QCStandardWording';

const checks = [
  {
    name: 'Deep Void Background (#050608)',
    file: 'src/index.css',
    regex: /#050608/,
  },
  {
    name: 'Onyx Surface Colors (#0c0e12)',
    file: 'src/index.css',
    regex: /#0c0e12/,
  },
  {
    name: '1px Razor Border (border-white/[0.08] or rgba(255, 255, 255, 0.08))',
    file: 'src/index.css',
    regex: /rgba\(255,\s*255,\s*255,\s*0\.08\)/,
  },
  {
    name: 'Geist Font Import in index.css',
    file: 'src/index.css',
    regex: /Geist/,
  },
  {
    name: 'Inter Font Import in index.css',
    file: 'src/index.css',
    regex: /Inter/,
  },
  {
    name: 'JetBrains Mono Font Import in index.css',
    file: 'src/index.css',
    regex: /JetBrains\+Mono/,
  },
  {
    name: 'DefectCard Onyx Surface & Razor Border',
    file: 'src/components/DefectCard.tsx',
    regex: /bg-\[#0c0e12\]/,
  },
  {
    name: 'DefectCard Razor Border',
    file: 'src/components/DefectCard.tsx',
    regex: /border-white\/\[0\.08\]/,
  },
  {
    name: 'DefectCard Cyan Hover Glow',
    file: 'src/components/DefectCard.tsx',
    regex: /hover:shadow-\[0_0_20px_-3px_rgba\(6,182,212,0\.25\)\]/,
  },
  {
    name: 'DefectCard JetBrains Mono Badge (.rnum)',
    file: 'src/components/DefectCard.tsx',
    regex: /rnum font-mono/,
  },
  {
    name: 'DefectCard Geist/Inter Typography (.rtxt)',
    file: 'src/components/DefectCard.tsx',
    regex: /rtxt font-sans/,
  },
  {
    name: 'WordingContainer Wrapper DOM IDs & Data Layout',
    file: 'src/components/WordingContainer.tsx',
    regex: /id="wordingContainer"[\s\S]*id="countLabel"[\s\S]*id="listwrap"[\s\S]*data-layout=\{layoutMode\}/,
  },
  {
    name: 'WordingTable Modern Glassmorphic Wrapper',
    file: 'src/components/WordingTable.tsx',
    regex: /wording-table-wrapper rounded-xl border border-white\/\[0\.08\] bg-\[#0c0e12\]\/90 backdrop-blur-md/,
  },
  {
    name: 'BatchDrawer Glassmorphic Side Drawer (backdrop-blur-2xl bg-[#0c0e12]/90 border-white/[0.08])',
    file: 'src/components/BatchDrawer.tsx',
    regex: /bg-\[#0c0e12\]\/90 backdrop-blur-2xl border-l border-white\/\[0\.08\]/,
  },
  {
    name: 'BatchDrawer Backdrop Overlay (backdrop-blur-xl bg-zinc-950/80)',
    file: 'src/components/BatchDrawer.tsx',
    regex: /bg-zinc-950\/80 backdrop-blur-xl/,
  },
  {
    name: 'ToastsContainer Container & Structure',
    file: 'src/components/ToastsContainer.tsx',
    regex: /id="toasts"[\s\S]*className="toast[\s\S]*ticon[\s\S]*toast-message[\s\S]*tprogress/,
  },
  {
    name: 'Floating Toast Glassmorphism & Cyan Glow in index.css',
    file: 'src/index.css',
    regex: /rgba\(12,\s*14,\s*18,\s*0\.90\)[\s\S]*backdrop-filter:\s*blur\(16px\)[\s\S]*0\s+0\s+20px\s+rgba\(6,\s*182,\s*212,\s*0\.20\)/,
  }
];

let failed = 0;
console.log('=== EMPIRICAL M3 DESIGN TOKEN & CONTRACT CHECK ===\n');

for (const check of checks) {
  const filePath = path.join(baseDir, check.file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ [FAIL] ${check.name}: File ${check.file} does not exist.`);
    failed++;
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  if (check.regex.test(content)) {
    console.log(`✅ [PASS] ${check.name}`);
  } else {
    console.error(`❌ [FAIL] ${check.name}: Regex ${check.regex} not found in ${check.file}`);
    failed++;
  }
}

if (failed === 0) {
  console.log('\nResult: ALL 17 DESIGN TOKEN & CONTRACT COMPLIANCE CHECKS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error(`\nResult: ${failed} CHECKS FAILED!`);
  process.exit(1);
}
