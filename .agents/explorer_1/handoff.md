# Project Survey & Architecture Survey Handoff Report

## Executive Summary
This report presents a comprehensive survey of the **QC Standard Wording** project structure, technology stack, dependency ecosystem, styling architecture, and build/testing pipelines, prepared by `explorer_1`.

---

## 1. Observation

### 1.1 Project Framework & Core Technologies
- **Application Type & Entry Points**:
  - HTML Entry: `index.html` (line 1-13)
  - TypeScript Entry: `src/main.tsx` (lines 1-22)
  - Root Component: `src/App.tsx` (lines 1-316)
- **Framework Stack** (`package.json`, lines 19-41):
  - **Framework**: React 19 (`"react": "^19.2.8"`, `"react-dom": "^19.2.8"`) with Vite 6 (`"vite": "^6.0.0"`, `"@vitejs/plugin-react": "^4.3.4"`).
  - **Language**: TypeScript 5 (`"typescript": "^5.7.2"`) with multi-tsconfig setup (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`). Path alias `@/*` maps to `./src/*` (`vite.config.ts`, line 28).
  - **PWA & Offline Capability**: `vite-plugin-pwa` v0.21.1 (`"vite-plugin-pwa": "^0.21.1"`), auto-updating Workbox service worker (`vite.config.ts`, lines 9-24).
  - **Cloudflare Pages Deployment**: Configured via `wrangler.jsonc` and `"wrangler": "^3.111.0"`.

### 1.2 Mantine UI Dependencies
- **Core Packages** (`package.json`, lines 20-23):
  - `@mantine/core`: `^7.15.0`
  - `@mantine/hooks`: `^7.15.0`
  - `@mantine/notifications`: `^7.15.0`
  - `@mantine/spotlight`: `^7.15.0`
- **Iconography**: `@tabler/icons-react` `^3.28.0` (`package.json`, line 24).
- **PostCSS Styling Plugins** (`package.json`, lines 34-36):
  - `postcss`: `^8.4.49`
  - `postcss-preset-mantine`: `^1.17.0`
  - `postcss-simple-vars`: `^7.0.1`

### 1.3 Styling Architecture & Theme System
- **CSS Setup**:
  - `postcss.config.cjs` (lines 1-14):
    ```js
    module.exports = {
      plugins: {
        'postcss-preset-mantine': {},
        'postcss-simple-vars': {
          variables: {
            'mantine-breakpoint-xs': '36em',
            'mantine-breakpoint-sm': '48em',
            'mantine-breakpoint-md': '62em',
            'mantine-breakpoint-lg': '75em',
            'mantine-breakpoint-xl': '88em',
          },
        },
      },
    };
    ```
  - `src/index.css` (lines 1-3): Imports Mantine CSS bundles:
    ```css
    @import '@mantine/core/styles.css';
    @import '@mantine/spotlight/styles.css';
    @import '@mantine/notifications/styles.css';
    ```
- **Theme Provider**:
  - `src/App.tsx` (lines 303-315):
    ```tsx
    const defaultTheme = createTheme({
      primaryColor: 'blue',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    });

    export default function App() {
      return (
        <MantineProvider theme={defaultTheme} defaultColorScheme="light">
          <Notifications position="top-right" zIndex={1000} />
          <AppContent />
        </MantineProvider>
      );
    }
    ```
- **Appearance & Styling Mechanism**:
  - Controlled by `useAppearance` custom hook (`src/hooks/useAppearance.ts`, lines 62-74).
  - Syncs attributes to `document.documentElement`: `data-mantine-color-scheme`, `data-theme`, `data-density`, `data-layout`.
  - Component styling uses a blend of inline styles, CSS variables (e.g. `var(--header-bg, #ffffff)`, `var(--mantine-color-gray-3, #e9ecef)`), and Mantine component props.
  - **Absence of Tailwind / Emotion**: No Tailwind CSS or Emotion packages are present in `package.json` dependencies or devDependencies.

### 1.4 Package Manager, Build Scripts & Test Infrastructure
- **Package Manager**: `npm` (manifested by `package.json` and `package-lock.json` - 313.8 KB).
- **Scripts Inventory** (`package.json`, lines 6-18):
  - `"dev"`: `"vite"`
  - `"build"`: `"tsc && vite build"`
  - `"lint"`: `"tsc --noEmit"`
  - `"preview"`: `"vite preview"`
  - `"deploy"`: `"npx wrangler pages deploy ./dist"`
  - `"deploy:pages"`: `"npx wrangler pages deploy ./dist"`
  - `"test"`: `"node --test tests/**/*.test.js"`
  - `"test:tier1"`: `"node --test tests/tier1-features.test.js"`
  - `"test:tier2"`: `"node --test tests/tier2-boundary.test.js"`
  - `"test:tier3"`: `"node --test tests/tier3-combinations.test.js"`
  - `"test:tier4"`: `"node --test tests/tier4-workloads.test.js"`
- **Test Runner Framework**:
  - Engine: Native Node.js test runner (`node:test`, `node:assert/strict`) operating via ES Modules.
  - DOM Simulation: `JSDOM` v26 (`"jsdom": "^26.1.0"`) with `tests/harness.js` mocking browser APIs (`localStorage`, `navigator.clipboard`, `matchMedia`, `scrollTo`).

### 1.5 Live Build & Test Execution Results
- **Build Execution** (`npm run build`):
  - Output: Exited with code 0 in ~8.13 seconds.
  - Bundled Assets: `dist/assets/index-DAYUaKe7.css` (205.55 kB), `dist/assets/index-wpOp5oTe.js` (423.20 kB), PWA service worker `dist/sw.js`. Zero TypeScript or Vite bundling errors.
- **Test Execution** (`npm run test`):
  - Output: Exited with code 0.
  - Suite Summary: 4 test suites, 32 test cases passed, 0 failed, 0 skipped.
    - Tier 1 (Feature Coverage): 17/17 PASS
    - Tier 2 (Boundary & Corner Cases): 10/10 PASS
    - Tier 3 (Cross-Feature Combinations): 3/3 PASS
    - Tier 4 (Real-World Workloads): 2/2 PASS

---

## 2. Logic Chain

1. **Framework & Dependencies Identification**:
   - Inspection of `package.json` shows `"type": "module"` and dependencies `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, and `@mantine/spotlight` all fixed at version `^7.15.0`.
   - React version is `^19.2.8` and Vite version is `^6.0.0`.
   - Therefore, the project framework is **React 19 + Vite 6 + TypeScript 5**, managed via **npm**, using **Mantine v7** for component UI.

2. **Styling System Analysis**:
   - Examination of `postcss.config.cjs`, `src/index.css`, `src/App.tsx`, and component files demonstrates that styling is driven by PostCSS with `postcss-preset-mantine` and `postcss-simple-vars`.
   - The theme is provided by `<MantineProvider theme={defaultTheme}>` in `src/App.tsx`.
   - Dark/Light mode state and visual tokens are dynamically reflected on `document.documentElement` attributes (`data-theme`, `data-density`, `data-layout`).
   - Neither Tailwind CSS nor Emotion is used.

3. **Build & Test Verification**:
   - Inspection of `package.json` `scripts` object identifies `build` as `tsc && vite build` and `test` as `node --test tests/**/*.test.js`.
   - Direct execution of `npm run build` succeeded without any compilation errors.
   - Direct execution of `npm run test` ran 32 tests using Node.js native test runner + JSDOM harness, resulting in 100% pass rate across all 4 tiers.

---

## 3. Caveats

- **No Caveats**: All requested areas (framework, package manager, build scripts, test runner, Mantine dependencies, styling system, build verification, and test execution) were directly inspected and verified via tool execution.

---

## 4. Conclusion

- **Project Framework**: React 19 + Vite 6 + TypeScript 5 (Bundler resolution, Strict mode, `@/*` alias).
- **Package Manager**: npm (`package.json`, `package-lock.json`).
- **Mantine v7 Ecosystem**: `@mantine/core` (^7.15.0), `@mantine/hooks` (^7.15.0), `@mantine/notifications` (^7.15.0), `@mantine/spotlight` (^7.15.0), `@tabler/icons-react` (^3.28.0).
- **Styling Architecture**: Mantine v7 PostCSS system (`postcss-preset-mantine`, `postcss-simple-vars`), CSS imports in `src/index.css`, MantineProvider theme object in `src/App.tsx`, and root attribute hooks (`data-theme`, `data-density`). No Tailwind CSS or Emotion.
- **Build Command**: `npm run build` (`tsc && vite build`) — Fully functional, 0 errors.
- **Test Command**: `npm run test` (`node --test tests/**/*.test.js`) — Fully functional, 32/32 tests pass (100% success rate).

---

## 5. Verification Method

To independently verify all findings in this report:

1. **Inspect Dependencies & Scripts**:
   - View `package.json` to confirm versions of `@mantine/*`, `react`, `vite`, `typescript`, `postcss-preset-mantine`, and script commands.
2. **Inspect Styling Configuration**:
   - View `postcss.config.cjs` and `src/index.css`.
3. **Verify Build**:
   - Execute command: `npm run build`
   - Expectation: Process exits with code 0, creating dist assets without TypeScript or Vite errors.
4. **Verify Tests**:
   - Execute command: `npm run test`
   - Expectation: 32 tests pass across 4 suites with 0 failures.
