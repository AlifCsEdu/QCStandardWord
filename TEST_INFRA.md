# E2E Test Infra: QC Standard Wording Project

## Test Philosophy
- Opaque-box, requirement-driven testing. No dependency on internal design.
- Test runner: `npm run test` (`node --test tests/**/*.test.js`) + JSDOM harness in `tests/harness.js`.

## Feature Inventory & Test Coverage Goals
| # | Feature | Requirement | Tier 1 (Happy) | Tier 2 (Boundary) | Tier 3 (Cross) | Tier 4 (Real-World) |
|---|---------|-------------|:--------------:|:-----------------:|:--------------:|:-------------------:|
| 1 | Mantine Removal & Package Integrity | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Zinc Dark Palette & Component Primitives | R1 | 5 | 5 | ✓ | ✓ |
| 3 | Category Lucide Icons & Border Accents | R2 | 5 | 5 | ✓ | ✓ |
| 4 | Custom Pin Category Folders & Persistence | R3 | 5 | 5 | ✓ | ✓ |
| 5 | Cloudflare Pages & Build Integrity | R4 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test Runner: `npm test`
- Harness: `tests/harness.js` (esbuild bundler + JSDOM DOM emulation)
- DOM Selectors Preserved: `#appHeader`, `#sidebarNav`, `#setLayout`, `#batchDrawer`, `#toasts`, `#search`, `[data-testid="..."]`

## Coverage Thresholds
- Tier 1: ≥25 happy path test assertions across core features.
- Tier 2: ≥25 boundary/edge case assertions (empty folders, invalid localStorage JSON, long wording text).
- Tier 3: Pairwise feature combinations (custom pin folder + batch drawer copy).
- Tier 4: Real-world QC inspection workflows.
