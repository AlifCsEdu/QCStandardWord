## 2026-08-09T22:18:38Z
Fix 3 static asset assertion bypasses in `tests/tier1-features.test.js` and `tests/tier2-boundary.test.js` so that they use genuine file system checks instead of `assert.ok(true)`.

Read:
1. `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md`
2. `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\tests\tier1-features.test.js`
3. `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\tests\tier2-boundary.test.js`

Specific lines to fix:
1. `tests/tier1-features.test.js` (around line 679): Replace `assert.ok(true, '_redirects file verification');` with genuine check checking for `public/_redirects` existence (or `dist/_redirects`).
2. `tests/tier1-features.test.js` (around line 689): Replace `assert.ok(true, 'Web manifest verification');` with genuine check for `public/manifest.json` (or `public/site.webmanifest` / `public/favicon.ico` or whatever static asset file exists in `public/` or `dist/`).
3. `tests/tier2-boundary.test.js` (around line 827): Replace `assert.ok(true, '_redirects file fallback check passed');` with genuine `fs.existsSync` or content check.

After modifying the test files:
Run `npm run test` to ensure 100% of tests pass without any errors or skips.
