# E2E Test Infra: QC Standard Wording — Raycast Warm Stone UI

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation internal details.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing across Tiers 1-4.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Raycast Warm Stone Base Theme | ORIGINAL_REQUEST §R1 | >=5 | >=5 | ✓ | ✓ |
| 2 | Complete Elimination of AI Tropes | ORIGINAL_REQUEST §R1 | >=5 | >=5 | ✓ | ✓ |
| 3 | Muted Semantic Color Pills | ORIGINAL_REQUEST §R2 | >=5 | >=5 | ✓ | ✓ |
| 4 | Lucide Iconography System | ORIGINAL_REQUEST §R2 | >=5 | >=5 | ✓ | ✓ |
| 5 | Left Border Accent Indicators | ORIGINAL_REQUEST §R2 | >=5 | >=5 | ✓ | ✓ |
| 6 | Sticky Left Sidebar Navigation | ORIGINAL_REQUEST §R3 | >=5 | >=5 | ✓ | ✓ |
| 7 | Custom User Pin Folder Manager | ORIGINAL_REQUEST §R3 | >=5 | >=5 | ✓ | ✓ |
| 8 | Clean Top Header & Spotlight Search | ORIGINAL_REQUEST §R3 | >=5 | >=5 | ✓ | ✓ |
| 9 | Floating Sonner Toasts & Batch Drawer | ORIGINAL_REQUEST §R3 | >=5 | >=5 | ✓ | ✓ |
| 10 | Type Safety & Performance | ORIGINAL_REQUEST §R4 | >=5 | >=5 | ✓ | ✓ |
| 11 | Cloudflare Pages Build Integrity | ORIGINAL_REQUEST §R4 | >=5 | >=5 | ✓ | ✓ |
| 12 | Full E2E Test Suite Verification | ORIGINAL_REQUEST §R4 | >=5 | >=5 | ✓ | ✓ |

## Test Architecture
- Test runner: `npm run test` (Vitest)
- Pass/Fail semantics: All tests pass (exit code 0), 0 failures/errors.
- Directory layout: `src/__tests__/` or `tests/`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Inspection Workflow & Custom Folder Management | F6, F7, F8, F9 | High |
| 2 | Multi-category Defect Selection & Batch Drawer Operations | F3, F4, F5, F9 | High |
| 3 | Spotlight Search Navigation & View Mode Switching | F6, F8, F10 | Medium |
| 4 | Warm Stone Theme Switching & Palette Persistence | F1, F2, F8, F10 | Medium |
| 5 | Custom Pin Folder CRUD and Persistence Recovery | F7, F8, F10 | High |
| 6 | Full E2E Build Integrity & Type Safety Check | F10, F11, F12 | High |

## Coverage Thresholds
- Tier 1: >=5 per feature (>= 60 tests total)
- Tier 2: >=5 per feature (>= 60 tests total)
- Tier 3: pairwise coverage of major feature interactions (>= 12 tests total)
- Tier 4: >=6 realistic application scenarios
- Total Target: >= 138 test cases
