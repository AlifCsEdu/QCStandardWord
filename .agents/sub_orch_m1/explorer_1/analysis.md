# Dependency & Baseline Setup Analysis — Explorer 1

## Overview
This document presents the detailed findings of the read-only exploration of the `QCStandardWording` codebase for **Milestone 1: Dependency Updates & Baseline Setup**.

---

## 1. Mantine & Icon Dependencies Inspection

| Package | Declared Version (`package.json`) | Installed Version (`node_modules` / `package-lock.json`) | Latest Available Version (npm) | Status / Notes |
|---|---|---|---|---|
| `@mantine/core` | `^7.15.0` | `7.17.8` | `7.17.8` (v7) / `9.5.1` (latest) | Up to date for v7 branch |
| `@mantine/hooks` | `^7.15.0` | `7.17.8` | `7.17.8` (v7) / `9.5.1` (latest) | Up to date for v7 branch |
| `@mantine/notifications` | `^7.15.0` | `7.17.8` | `7.17.8` (v7) / `9.5.1` (latest) | Up to date for v7 branch |
| `@mantine/spotlight` | `^7.15.0` | `7.17.8` | `7.17.8` (v7) / `9.5.1` (latest) | Up to date for v7 branch |
| `@tabler/icons-react` | `^3.28.0` | `3.46.0` | `3.46.0` | Up to date |
| `react` | `^19.2.8` | `19.2.8` | `19.x` | React 19 core dependency |
| `react-dom` | `^19.2.8` | `19.2.8` | `19.x` | React 19 DOM dependency |

### Key Observation on Mantine Versions:
- The project contract in `PROJECT.md` and `SCOPE.md` explicitly specifies **Mantine UI v7** API compatibility across all components.
- The installed packages in `node_modules` are currently at version **7.17.8** for all four `@mantine/*` packages, which is the absolute latest patch/minor release on the v7 release channel.
- `package.json` currently specifies `^7.15.0`. Updating `package.json` to explicitly specify `^7.17.8` or exact `7.17.8` will align `package.json` with the installed lockfile version.
- `@tabler/icons-react` in `node_modules` is at version **3.46.0**, which is the latest release on npm. `package.json` specifies `^3.28.0`.

---

## 2. DevDependencies & Tooling Setup

### Lockfile Type
- **`package-lock.json`** (npm lockfile v3 format, size ~313 KB).
- No `yarn.lock` or `pnpm-lock.yaml` is present in the project root.

### DevDependencies Summary
| Package | Version | Role |
|---|---|---|
| `typescript` | `^5.7.2` | TypeScript compiler (`tsc`) |
| `vite` | `^6.0.0` | Dev server & production bundler (Vite 6.4.3) |
| `@vitejs/plugin-react` | `^4.3.4` | Vite React plugin |
| `vite-plugin-pwa` | `^0.21.1` | Progressive Web App plugin for Vite |
| `postcss` | `^8.4.49` | PostCSS core |
| `postcss-preset-mantine` | `^1.17.0` | Mantine PostCSS presets and CSS functions |
| `postcss-simple-vars` | `^7.0.1` | PostCSS variable support |
| `jsdom` | `^26.1.0` | DOM emulation for testing environment |
| `@types/node` | `^22.10.0` | Node.js type definitions |
| `@types/react` | `^19.0.0` | React 19 type definitions |
| `@types/react-dom` | `^19.0.0` | React DOM type definitions |
| `wrangler` | `^3.111.0` | Cloudflare Pages deployment CLI |

---

## 3. Package Scripts & Build Pipeline

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "tsc --noEmit",
  "preview": "vite preview",
  "deploy": "npx wrangler pages deploy ./dist",
  "deploy:pages": "npx wrangler pages deploy ./dist",
  "test": "node --test tests/**/*.test.js",
  "test:tier1": "node --test tests/tier1-features.test.js",
  "test:tier2": "node --test tests/tier2-boundary.test.js",
  "test:tier3": "node --test tests/tier3-combinations.test.js",
  "test:tier4": "node --test tests/tier4-workloads.test.js"
}
```

---

## 4. Baseline Build & Test Execution Results

### Baseline Build (`npm run build`)
- **Command executed**: `tsc && vite build`
- **Result**: `SUCCESS` (exit code 0)
- **Time**: ~8.35s
- **Output Artifacts**:
  - `dist/index.html` (0.39 kB)
  - `dist/assets/index-D7xV03-T.css` (20.31 kB)
  - `dist/assets/index-DRm17wG4.js` (1,061.54 kB)
  - PWA manifest & service worker files (`dist/manifest.webmanifest`, `dist/sw.js`, `dist/workbox-3f1910ef.js`)

### Baseline Test Suite (`npm run test`)
- **Command executed**: `node --test tests/**/*.test.js`
- **Result**: `SUCCESS` (exit code 0)
- **Duration**: ~58.09s
- **Test Summary**:
  - Total tests: 32 (across 17 suites)
  - Passed: 32
  - Failed: 0
  - Skipped: 0
  - All 4 Tiers verified:
    - Tier 1: Feature Coverage (Dataset & category coverage, fuzzy search, sub-category chips, view modes, batch queue, copy/history, pinning, edit mode)
    - Tier 2: Boundary & Corner Cases (Levenshtein typos, empty search, special character escaping, max batch workload 50+, corrupted storage resilience)
    - Tier 3: Cross-Feature Combinations (Pipelines 1, 2, and 3)
    - Tier 4: Real-World Workload Scenarios (Technician inspection & supervisor audit workflows)

---

## 5. Scope & Update Recommendations for Implementer

1. **Update `package.json`**:
   - Bump `@mantine/core` from `^7.15.0` to `^7.17.8` (or `7.17.8`).
   - Bump `@mantine/hooks` from `^7.15.0` to `^7.17.8` (or `7.17.8`).
   - Bump `@mantine/notifications` from `^7.15.0` to `^7.17.8` (or `7.17.8`).
   - Bump `@mantine/spotlight` from `^7.15.0` to `^7.17.8` (or `7.17.8`).
   - Bump `@tabler/icons-react` from `^3.28.0` to `^3.46.0` (or `3.46.0`).
2. **Verify Lockfile Synchronization**:
   - Run `npm install` or `npm sync` to ensure `package.json` and `package-lock.json` reflect identical top-level declarations.
3. **Re-Verify Baseline**:
   - Re-run `npm run build` and `npm run test` after updating `package.json`.
