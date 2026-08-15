# Scope: E2E Testing Track

## Architecture
- Opaque-box, requirement-driven E2E test suite running via Node's native test runner (`node:test` + `tsx` + `jsdom` + `esbuild`).
- Test runner invocation: `npm run test` (or `npx tsx --test "tests/**/*.{js,ts}"`)
- Test harness: `tests/harness.js` mounts `src/main.tsx` in JSDOM with in-memory bundling.
- All tests verify Raycast Warm Stone UI redesign requirements from `ORIGINAL_REQUEST.md` and `PROJECT.md`.

## Feature Inventory & Test Coverage Requirements
| # | Feature | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Scenario) | Milestone |
|---|---------|-------------------|-------------------|-------------------|-------------------|-----------|
| 1 | Raycast Warm Stone Base Theme | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 2 | Complete Elimination of AI Tropes | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 3 | Muted Semantic Color Pills | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 4 | Lucide Iconography System | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 5 | Left Border Accent Indicators | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 6 | Sticky Left Sidebar Navigation | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 7 | Custom User Pin Folder Manager | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 8 | Clean Top Header & Spotlight Search | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 9 | Floating Sonner Toasts & Batch Drawer | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 10 | Type Safety & Performance | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 11 | Cloudflare Pages Build Integrity | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |
| 12 | Full E2E Test Suite Verification | >=5 tests | >=5 tests | ✓ | ✓ | M2-M5 |

## E2E Testing Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Test Infrastructure & Harness Exploration | Inspect test runner, test scripts, existing test files, and set up test helpers / harness | None | DONE |
| M2 | Tier 1 Feature Coverage Tests | Create >= 60 happy-path tests (>=5 per feature for 12 features) | M1 | DONE |
| M3 | Tier 2 Boundary & Corner Case Tests | Create >= 60 edge case & boundary tests (>=5 per feature for 12 features) | M2 | DONE |
| M4 | Tier 3 Cross-Feature Combination Tests | Create >= 12 pairwise feature interaction tests | M3 | DONE |
| M5 | Tier 4 Real-World Application Scenario Tests | Create >= 6 complex real-world workflow E2E scenario tests | M4 | DONE |
| M6 | Test Suite Verification & TEST_READY.md | Execute `npm run test` to verify 100% pass rate and publish `TEST_READY.md` | M5 | DONE |


## Interface Contracts
- Test runner executable: `npm run test`
- Individual tier scripts: `npm run test:tier1`, `npm run test:tier2`, `npm run test:tier3`, `npm run test:tier4`, `npm run test:tier5`.
- Exit code 0 indicates 100% test suite success.
- Test files located in `tests/`: `tests/tier1-features.test.js`, `tests/tier2-boundary.test.js`, `tests/tier3-combinations.test.js`, `tests/tier4-workloads.test.js`.
