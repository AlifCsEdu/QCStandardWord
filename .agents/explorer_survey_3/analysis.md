# Build & Test System Survey Analysis

## Summary of Findings
The **QC Standard Wording** project uses a modern web architecture based on **Vite 6**, **React 19**, **TypeScript 5.7**, and **Tailwind CSS v4** (`@tailwindcss/vite`).
The build pipeline compiles cleanly with `tsc && vite build` and outputs static SPA assets directly into `./dist` as required by Cloudflare Pages (`wrangler.jsonc`).
Testing is powered by Node's native test runner (`node --test` / `npx tsx --test`) backed by a custom JSDOM + esbuild browser emulation harness (`tests/harness.js`).

---

## 1. Build System Architecture & Pipeline Requirements

### Core Stack & Tooling
- **Bundler & Dev Server**: Vite `v6.0+` (`vite`) with plugins:
  - `@vitejs/plugin-react`: React 19 JSX transformation.
  - `@tailwindcss/vite`: Tailwind CSS v4 Vite integration.
  - `vite-plugin-pwa`: Service worker generation (`generateSW` mode) and offline caching (`sw.js`, `workbox-*.js`).
- **Entry Points**:
  - HTML entry: `index.html` -> `<div id="root"></div>` -> `src/main.tsx`.
  - JS entry: `src/main.tsx` -> renders `App.tsx` wrapped in `ThemeProvider` (`next-themes`).
- **Path Resolution**: Path alias `@/*` configured in `vite.config.ts` (`path.resolve(__dirname, './src')`) and `tsconfig.app.json` (`"paths": { "@/*": ["src/*"] }`).

### Build Execution (`npm run build`)
- Command: `tsc && vite build`
- Workflow:
  1. `tsc`: Executes strict TypeScript compilation across application files (`tsconfig.app.json`) without emitting files (`"noEmit": true`).
  2. `vite build`: Transpiles code, bundles CSS (`index-*.css`), packages JS chunks (`index-*.js`), generates PWA service workers (`sw.js`, `workbox-*.js`), and produces output in `./dist`.
- Build Verification:
  - Modules transformed: 1,696+ modules.
  - Exit code: `0` (Success).
  - Output files: `dist/index.html`, `dist/assets/index-*.css`, `dist/assets/index-*.js`, `dist/registerSW.js`, `dist/manifest.webmanifest`, `dist/sw.js`.

---

## 2. Package.json Scripts Inventory

| Script | Command | Purpose | Verified Status |
|---|---|---|:---:|
| `dev` | `vite` | Starts local Vite development server | Ready |
| `build` | `tsc && vite build` | Type-checks code and builds production static bundle | **PASSED (Code 0)** |
| `lint` | `tsc --noEmit` | Runs strict TypeScript type checker | **PASSED (Code 0)** |
| `preview` | `vite preview` | Previews static build output locally | Ready |
| `deploy` | `npx wrangler pages deploy ./dist` | Deploys `./dist` artifact to Cloudflare Pages | Ready |
| `deploy:pages` | `npx wrangler pages deploy ./dist` | Alias for Cloudflare Pages deployment | Ready |
| `test` | `npx tsx --test "tests/**/*.{js,ts}"` | Runs all unit, integration, & E2E tests via Node runner | **PASSED / RUNNING** |
| `test:tier1` | `node --test tests/tier1-features.test.js` | Runs Tier 1 Happy Path feature tests | **PASSED (Code 0)** |
| `test:tier2` | `node --test tests/tier2-boundary.test.js` | Runs Tier 2 boundary and corner case tests | Ready |
| `test:tier3` | `node --test tests/tier3-combinations.test.js` | Runs Tier 3 cross-feature combination tests | Ready |
| `test:tier4` | `node --test tests/tier4-workloads.test.js` | Runs Tier 4 real-world inspection workload tests | Ready |
| `test:tier5` | `node --test tests/tier5-hardening.test.js` | Runs Tier 5 adversarial storage hardening tests | Ready |

---

## 3. TypeScript Configuration (`tsconfig.json`)

The project uses TypeScript composite project references:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### Application Config (`tsconfig.app.json`)
- **Target**: `ES2022`, Module: `ESNext`, Module Resolution: `bundler`.
- **JSX**: `react-jsx` (React 19).
- **Strictness**: `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true`.
- **Imports**: `"allowImportingTsExtensions": true`, `"isolatedModules": true`, `"moduleDetection": "force"`.
- **Emit**: `"noEmit": true` (Vite manages asset bundling).
- **Paths**: `"@/*": ["src/*"]`.

### Node Tooling Config (`tsconfig.node.json`)
- Configured specifically for build tooling scripts such as `vite.config.ts`.

---

## 4. Application Type Definitions (`src/types/qc.ts`)

Key domain models and settings interfaces:
- **`CategoryKey`**: `'all' | 'codes' | 'screen' | 'camera' | 'buttons' | 'battery' | 'backcover' | 'locks' | 'pen' | 'water' | 'audio' | 'body' | 'system' | 'pinned' | 'recent'`
- **`SubCategoryCode`**: `'ALL' | 'FCPB' | 'FCPW' | 'FCPC' | 'RCPB' | 'RCPW' | 'RCPC' | 'FCDS' | 'RCDS' | 'PC'`
- **`QCItem`**: `{ id: string; n: number; t: string; c: CategoryKey; sub?: SubCategoryCode; custom?: boolean; }`
- **`CustomPinFolder`**: `{ id: string; name: string; color?: string; itemIds: (string | number)[]; createdAt: number; }`
- **`AppearanceSettings`**: Includes `layout` (`list` | `grid` | `table`), `radius`, `textsize`, `accent`, `density`, `motion`, `theme` (`light` | `dark` | `auto`).
- **`SearchResult`**: `{ item: QCItem; score: number; isApprox: boolean; highlightedText: string; }`

---

## 5. Testing Architecture & Infrastructure

### Test Harness (`tests/harness.js`)
- **Execution Strategy**: Emulates a browser DOM environment using **JSDOM** (`JSDOM`, `url: 'http://localhost/'`).
- **In-Memory Bundler**: Uses `esbuild.buildSync` to bundle `src/main.tsx` into an IIFE script in memory before injecting into JSDOM `<script>` tag.
- **Browser Mocks**:
  - `localStorage` mock (`MockLocalStorage` supporting 14 `qc-*` storage keys).
  - `window.matchMedia` mock.
  - `window.scrollTo` mock.
  - `navigator.clipboard` mock (`writeText`, `readText`).
  - `navigator.vibrate` mock.
  - `URL.createObjectURL` and `URL.revokeObjectURL` mock for JSON export downloads.
- **Opaque Selectors & Helpers**:
  - `getAppNavbar()` -> queries `[data-testid="app-navbar"]`, `.mantine-AppShell-navbar`, `#sidebarNav`, `nav`.
  - `getAppHeader()` -> queries `#appHeader`, `header`.
  - `getVisibleItems()` -> extracts item list, text, category pills, fuzzy indicators (`≈`).
  - Actions: `search(query)`, `selectCategory(cat)`, `clickItemAction(index, action)`, `toggleViewMode(mode)`, `copySelected()`, `createPinFolder(name)`.

### Existing Test Suite Inventory (9 Files)
1. `src/utils/searchEngine.test.ts`: Co-located search engine unit tests (Levenshtein, sub-sequence, code sub-chips, alias expansion, approx match flag).
2. `tests/searchEngine.test.ts`: Standalone unit test suite for search engine primitives.
3. `tests/m3-challenger-verification.test.js`: Rapid stress tests for view switching, batch drawer operations, delimiter customizers, item reordering, paste bulk queue.
4. `tests/m3-pin-folders.test.js`: Integration tests for custom user pin folders, folder item assignments, renaming, deletion, and localStorage persistence.
5. `tests/tier1-features.test.js`: Feature coverage happy paths (sidebar nav, category pills, top search, sub-code filtering, Sonner toasts, batch drawer queue, view switching, pinning).
6. `tests/tier2-boundary.test.js`: Boundary cases (Levenshtein typo tolerance, empty query handling, regex meta-character safety, HTML escaping, zero layout shift, max batch capacity, corrupted localStorage recovery).
7. `tests/tier3-combinations.test.js`: Multi-feature pipelines (sidebar nav + search + view switcher sync; custom wording + pin + theme persistence; batch drawer + toast + undo + JSON export/import).
8. `tests/tier4-workloads.test.js`: Real-world technician QC inspection workflows and mobile/desktop viewport switches.
9. `tests/tier5-hardening.test.js`: Adversarial white-box stress testing for localStorage corruption and broken object shape sanitization.

---

## 6. Cloudflare Pages Requirements & Deployment

- **Config File**: `wrangler.jsonc`
  ```jsonc
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "qcstandardword",
    "compatibility_date": "2026-08-07",
    "pages_build_output_dir": "./dist"
  }
  ```
- **Requirements**:
  1. Build command: `npm run build` (`tsc && vite build`).
  2. Build output directory: `./dist`.
  3. All asset paths relative or root-compatible (`index.html`, `/assets/index-*.js`, `/assets/index-*.css`).
  4. Deployment command: `npx wrangler pages deploy ./dist`.

---

## 7. Missing Test Areas & Recommendations

While the existing E2E and unit test coverage is extensive (41+ assertions across Tiers 1–5), the following areas require new or expanded test assertions for the **Raycast Warm Stone Redesign**:
1. **Raycast Warm Stone Palette & Surface Verification**:
   - Test that body and card background styles adopt Warm Stone surfaces (`#121214` dark / `#fcfcfc` light) and warm grey borders (`border-stone-800` / `border-stone-200`).
2. **Zero Glassmorphism & Zero Glow Halo Rule Assertion**:
   - Assert that no `backdrop-blur-md` class or radial neon background gradients (`from-cyan-500`, `shadow-[0_0_..._#00f0ff]`) exist in rendered DOM nodes.
3. **Cmd+K Spotlight Search Keyboard Trigger**:
   - Test keydown event listener dispatch for `Cmd+K` (macOS) / `Ctrl+K` (Windows) to trigger the `cmdk` Spotlight search dialog.
4. **Muted Category Color Pill Accent Verification**:
   - Validate left border accent indicators (`border-l-4`) and muted category color assignments (Soft Green for Battery, Muted Amber for Buttons, Steel Blue for Screen, Muted Plum for Pen, Rose for Locks).
