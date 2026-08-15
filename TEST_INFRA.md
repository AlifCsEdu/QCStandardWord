# E2E Test Infra: QC Standard Wording (Tablet S9+ & Raycast Overhaul)

## Test Philosophy
- Opaque-box, requirement-driven testing executing in JSDOM via Node.js built-in runner `node:test` and `tests/harness.js`.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Workloads) |
|---|---------|-------------|:----------------:|:-----------------:|:-----------------:|:------------------:|
| 1 | Touch Ergonomics & Target Scaling | R1 | min 5 tests | min 5 tests | ✓ | ✓ |
| 2 | shadcn / Radix Component Styling | R1 | min 5 tests | min 5 tests | ✓ | ✓ |
| 3 | Custom Sleek Scrollbars & Layout | R1 | min 5 tests | min 5 tests | ✓ | ✓ |
| 4 | Theme Engine (Dark/Light/Auto) | R2 | min 5 tests | min 5 tests | ✓ | ✓ |
| 5 | Density Modes (Compact/Cozy/Tablet) | R2 | min 5 tests | min 5 tests | ✓ | ✓ |
| 6 | Border Radius (0/6/10/16px) | R2 | min 5 tests | min 5 tests | ✓ | ✓ |
| 7 | Font Size Scaling (13/14/16px) | R2 | min 5 tests | min 5 tests | ✓ | ✓ |
| 8 | Accent Colors (5 Palettes) | R2 | min 5 tests | min 5 tests | ✓ | ✓ |
| 9 | Reduced Motion Toggle | R2 | min 5 tests | min 5 tests | ✓ | ✓ |
| 10 | Category & Sub-Category Manager CRUD | R3 | min 5 tests | min 5 tests | ✓ | ✓ |
| 11 | Hybrid Icon & Emoji Picker | R3 | min 5 tests | min 5 tests | ✓ | ✓ |
| 12 | Category Color Picker | R3 | min 5 tests | min 5 tests | ✓ | ✓ |
| 13 | Category Reordering & Ordering Persistence | R3 | min 5 tests | min 5 tests | ✓ | ✓ |
| 14 | Sub-Category Code Editor | R3 | min 5 tests | min 5 tests | ✓ | ✓ |
| 15 | Dedicated Inspection History Drawer | R4 | min 5 tests | min 5 tests | ✓ | ✓ |
| 16 | History Relative Timestamps & Search | R4 | min 5 tests | min 5 tests | ✓ | ✓ |
| 17 | History Copy, Pinning & Bulk Batch Add | R4 | min 5 tests | min 5 tests | ✓ | ✓ |
| 18 | Clear History with Confirmation Dialog | R4 | min 5 tests | min 5 tests | ✓ | ✓ |

## Test Architecture
- Test runner: `npx tsx --test --test-concurrency=1 "tests/**/*.{js,ts}"`
- Harness: `tests/harness.js` (mounts compiled React bundle in JSDOM, provides helper actions)
- Test files:
  - `tests/tier1-features.test.js`: Feature-level validation of all R1-R4 capabilities.
  - `tests/tier2-boundary.test.js`: Boundary values, extreme strings, empty states, spam clicks, large inputs.
  - `tests/tier3-combinations.test.js`: Pairwise combinations (Theme + Density + Accents + Category Manager + History Drawer + Batch Queue).
  - `tests/tier4-workloads.test.js`: Real-world tablet inspection workflows.
  - `tests/tier5-hardening.test.js`: Adversarial stress tests, corruption recovery, XSS prevention.
