# Milestone 1: Dependency Updates & Baseline Setup Analysis

## Executive Summary
This analysis establishes the baseline build and test status for the QC Standard Wording project and provides the optimal dependency update strategy for `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight`, and `@tabler/icons-react`.

The baseline build (`npm run build`) succeeds cleanly with 0 TypeScript or Vite errors, and the baseline test suite (`npm run test`) achieves a **100% pass rate** (32/32 tests passed across all 4 test tiers). The project is strictly scoped to **Mantine UI v7 API compatibility** as defined in `PROJECT.md` and `SCOPE.md`.

---

## 1. Current Dependency Audit & Target Recommendations

| Package | `package.json` Spec | Installed in `node_modules` | Latest Compatible Version | Action Required |
|---|---|---|---|---|
| `@mantine/core` | `^7.15.0` | `7.17.8` | `^7.17.8` | Update spec to `^7.17.8` |
| `@mantine/hooks` | `^7.15.0` | `7.17.8` | `^7.17.8` | Update spec to `^7.17.8` |
| `@mantine/notifications` | `^7.15.0` | `7.17.8` | `^7.17.8` | Update spec to `^7.17.8` |
| `@mantine/spotlight` | `^7.15.0` | `7.17.8` | `^7.17.8` | Update spec to `^7.17.8` |
| `@tabler/icons-react` | `^3.28.0` | `3.28.0` / `3.x` | `^3.46.0` | Update spec to `^3.46.0` |

### Rationale for Mantine v7 Scope Lock:
- `PROJECT.md` line 5 explicitly defines: `Component Library: Mantine UI v7 (@mantine/core, @mantine/hooks, @mantine/notifications, @mantine/spotlight, @tabler/icons-react)`.
- `SCOPE.md` line 24 specifies: `Mantine UI v7 API compatibility across all components`.
- Major version releases (Mantine v8 / v9) introduce breaking API changes (such as theme override structure, component style prop changes, and hook signatures) that violate the milestone contract.
- Updating `@mantine/*` to `^7.17.8` (the latest v7 release) ensures full stability, zero breaking changes, and complete feature availability for subsequent milestones (Theme, Sidebar layout, Glassmorphic Toast, Batch Drawer).

---

## 2. Baseline Build & Test Architecture Inspection

### A. Build Toolchain Inspection
- **Script**: `npm run build` -> `tsc && vite build`
- **TypeScript Config**: `tsconfig.app.json` (Target: `ES2022`, Module Resolution: `bundler`, `jsx: react-jsx`, strict mode enabled).
- **Vite Config**: `vite.config.ts` using `@vitejs/plugin-react` and `vite-plugin-pwa`. Alias `@/` mapped to `src/`.
- **Baseline Build Verification Output**:
  - `tsc && vite build` completed cleanly with exit code `0`.
  - 6997 modules transformed, producing `dist/assets/index-DAYUaKe7.css` (205.55 kB) and `dist/assets/index-wpOp5oTe.js` (423.20 kB).

### B. Test Infrastructure Inspection
- **Test Command**: `npm run test` -> `node --test tests/**/*.test.js`
- **Baseline Test Pass Metrics**:
  - `tests 32`, `suites 17`, `pass 32`, `fail 0`, `cancelled 0`, `skipped 0` (100% pass rate in 71.9s).
- **Test Breakdown**:
  - `tests/tier1-features.test.js` (8 suites, 16 tests passed): Dataset & Category coverage, fuzzy search, pinning/recent state, batch queue, view modes.
  - `tests/tier2-boundary.test.js` (5 suites, 10 tests passed): Levenshtein typos, empty queries, special characters, max batch workload, storage resilience.
  - `tests/tier3-combinations.test.js` (3 pipelines passed): Cross-feature combination pipelines.
  - `tests/tier4-workloads.test.js` (2 workload scenarios passed): Real-world mobile technician & supervisor workflows.
- **Test Harness (`tests/harness.js`)**:
  - Uses `esbuild` to compile `src/main.tsx` into an in-memory IIFE bundle.
  - Boots JSDOM environment with mock `matchMedia`, `scrollTo`, `localStorage`, `clipboard`, `vibrate`, and `requestAnimationFrame`.
  - Simulates DOM interaction directly with React app instances.

---

## 3. Optimal Update Strategy

### Step 1: `package.json` Updates
Update `dependencies` in `package.json` to lock in latest compatible versions:
```json
"dependencies": {
  "@mantine/core": "^7.17.8",
  "@mantine/hooks": "^7.17.8",
  "@mantine/notifications": "^7.17.8",
  "@mantine/spotlight": "^7.17.8",
  "@tabler/icons-react": "^3.46.0",
  "react": "^19.2.8",
  "react-dom": "^19.2.8"
}
```

### Step 2: Dependency Synchronization
Execute `npm install` to update `package-lock.json` and ensure exact package alignment in `node_modules`.

### Step 3: Build Verification
Execute `npm run build` and verify:
1. Zero TypeScript compilation errors from `tsc`.
2. Clean asset bundle output from `vite build`.

### Step 4: Test Suite Verification
Execute `npm run test` and verify:
1. 100% pass rate across all 32 tests in 4 tier test suites (`tier1-features`, `tier2-boundary`, `tier3-combinations`, `tier4-workloads`).
2. Fast execution without JSDOM window degradation or esbuild bundling failures.

---

## 4. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| Major version jump to Mantine 8/9 | High (Breaking layout & theme API) | Lock `@mantine/*` to latest v7 (`^7.17.8`) as mandated by `PROJECT.md`. |
| Icon component name changes in `@tabler/icons-react` | Medium (Missing icon renders) | Audit icon imports in `src/App.tsx`, `BatchDrawer.tsx`, `StatsDashboard.tsx`. All imported icons (`IconArrowUp`, `IconSearch`, `IconCopy`, `IconTrash`, `IconFileImport`, `IconX`, `IconDashboard`, `IconFilter`, `IconBookmark`) are preserved in v3.46.0. |
| Esbuild test harness bundling breakage | Medium (Failed test execution) | Verify `esbuild.buildSync` loader options in `tests/harness.js` handle all `@mantine/*` css/js bundles. |
