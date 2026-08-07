# Scope: E2E Testing Track Orchestrator

## Architecture & Strategy
- Test Framework: Node test runner (`node --test tests/**/*.test.js`)
- Methodology: Opaque-box requirement-driven testing across Tiers 1-4
  - Tier 1: Feature Coverage (happy path, basic functionality)
  - Tier 2: Boundary & Corner Cases (edge cases, invalid inputs, overflow, empty states)
  - Tier 3: Cross-Feature Combinations (interactions between components/features)
  - Tier 4: Real-World Application Scenarios (end-to-end workflows)

## Feature Inventory & Test Coverage Goal
| # | Feature | Target Tier 1 | Target Tier 2 | Target Tier 3 | Target Tier 4 | Status |
|---|---------|---------------|---------------|---------------|---------------|--------|
| 1 | Dependency Updates | Pass build/test | Pass baseline | Baseline check | E2E integration | PLANNED |
| 2 | Deep Slate & Charcoal Theme | Colors & Tokens | Contrast & Fallbacks | Theme + UI components | Theme toggle scenario | PLANNED |
| 3 | Sticky Left Sidebar Navigation | Category tabs & sub-chips | Collapsible & empty categories | Sidebar + Header sync | Full navigation scenario | PLANNED |
| 4 | Top Header Search & View Switcher | Cmd+K & SegmentedControl | Search query limits & empty results | Search + View switcher | Search to view workflow | PLANNED |
| 5 | Remove Duplicate Stats Header | Stats dashboard counts | Zero duplicate headers | Stats + Category selection | Dashboard stats scenario | PLANNED |
| 6 | Eliminate Layout Shift | Zero vertical jump | Rapid chip switching | Sidebar + main content | Layout stability scenario | PLANNED |
| 7 | Floating Toast Notifications | Toast pills & progress | Rapid copy & queue overflow | Toast + Drawer sync | Toast feedback scenario | PLANNED |
| 8 | Glassmorphic Batch Drawer | Slide-out & blur overlay | Reorder & max items | Drawer + Toast + Cards | Batch copy workflow | PLANNED |
| 9 | High-Contrast Cards & Rows | Hover states & pill badges | Long text & responsive | Cards + View mode | Inspection workflow | PLANNED |
| 10 | E2E & Integrity Verification | Build & unit pass | Failure recovery | Full system integration | Complete E2E verification | PLANNED |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Baseline Test Audit | Run existing tests, analyze test suite coverage vs Feature Inventory | None | IN_PROGRESS |
| 2 | Tier 1-4 Test Case Generation | Add missing test suites for Tiers 1-4 in `tests/` | Baseline Test Audit | PLANNED |
| 3 | Test Infra Documentation | Create `TEST_INFRA.md` at project root | Test Case Generation | PLANNED |
| 4 | Test Suite Publication | Run full test suite, verify 100% pass, publish `TEST_READY.md` | Test Infra Documentation | PLANNED |
