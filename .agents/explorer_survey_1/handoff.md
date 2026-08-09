# Step 0 Survey Handoff Report: QC Standard Wording Project Overhaul & shadcn/ui Migration

## 1. Observation

### File & Repository Layout
- **Root Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`
- **Agent Working Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_survey_1`
- **Key Files Inspected**:
  - `package.json` (lines 1-43)
  - `tsconfig.json` (lines 1-8), `tsconfig.app.json` (lines 1-25), `tsconfig.node.json` (lines 1-20)
  - `vite.config.ts` (lines 1-32)
  - `postcss.config.cjs` (lines 1-15)
  - `wrangler.jsonc` (lines 1-7)
  - `PROJECT.md` (lines 1-60)
  - `TEST_INFRA.md` (lines 1-105)
  - `src/main.tsx` (lines 1-22)
  - `src/App.tsx` (lines 1-330)
  - `src/index.css` (lines 1-453)
  - `src/types/qc.ts` (lines 1-90)
  - `src/data/qcData.ts` (lines 1-292)
  - `src/hooks/useQCState.ts` (lines 1-120)
  - `tests/harness.js` (lines 1-150)

### Current Dependencies (`package.json`)
```json
"dependencies": {
  "@mantine/core": "^7.17.8",
  "@mantine/hooks": "^7.17.8",
  "@mantine/notifications": "^7.17.8",
  "@mantine/spotlight": "^7.17.8",
  "@tabler/icons-react": "^3.46.0",
  "react": "^19.2.8",
  "react-dom": "^19.2.8"
},
"devDependencies": {
  "@types/node": "^22.10.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "@vitejs/plugin-react": "^4.3.4",
  "jsdom": "^26.1.0",
  "postcss": "^8.4.49",
  "postcss-preset-mantine": "^1.17.0",
  "postcss-simple-vars": "^7.0.1",
  "typescript": "^5.7.2",
  "vite": "^6.0.0",
  "vite-plugin-pwa": "^0.21.1",
  "wrangler": "^3.111.0"
}
```

### Build & Script Commands (`package.json`)
- `dev`: `vite`
- `build`: `tsc && vite build`
- `lint`: `tsc --noEmit`
- `preview`: `vite preview`
- `deploy`: `npx wrangler pages deploy ./dist`
- `deploy:pages`: `npx wrangler pages deploy ./dist`
- `test`: `node --test tests/**/*.test.js`

### Path Aliases & TypeScript Configuration
- `tsconfig.app.json`:
  ```json
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
  ```
- `vite.config.ts`:
  ```ts
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
  ```

### Cloudflare Pages Configuration (`wrangler.jsonc`)
```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "qcstandardword",
  "compatibility_date": "2026-08-07",
  "pages_build_output_dir": "./dist"
}
```

### Test Harness Architecture (`tests/harness.js`)
- `tests/harness.js` compiles `src/main.tsx` into memory using `esbuild.buildSync` with `{ loader: { '.tsx': 'tsx', '.ts': 'ts', '.css': 'empty' } }`.
- JSDOM environment provides mocks for `window.matchMedia`, `window.scrollTo`, `localStorage`, `navigator.clipboard`, `navigator.vibrate`, `URL.createObjectURL`.
- The test harness queries layout testids (`[data-testid="app-header"]`, `[data-testid="app-navbar"]`, `[data-testid="view-switcher"]`, `[data-testid="floating-toast"]`, `[data-testid="batch-drawer"]`) alongside legacy DOM elements (`#search`, `#listwrap`, `[data-cat="..."]`).

### Command Baseline Check Results
- `npx tsc --noEmit`: Executed successfully with **0 errors**.

---

## 2. Logic Chain

1. **Migration Scope Identification**:
   - The application relies on `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight`, `@tabler/icons-react`, `postcss-preset-mantine`, and `postcss-simple-vars`.
   - All `@mantine/*` packages and Tabler icons must be removed and replaced with Tailwind CSS v4, Radix UI primitives (`@radix-ui/react-*`), `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `cmdk`, `next-themes`, and `sonner`.

2. **UI & Theme Requirements**:
   - High-contrast Deep Zinc dark theme: `#09090b` (bg), `#18181b` (cards/containers), `#27272a` (borders), `#06b6d4` (cool cyan highlight accent).
   - Component primitives to create/adapt: `Sheet` (Batch drawer), `Command` (Cmd+K Spotlight Search), `Tabs` & `ScrollArea` (Sidebar & Sub-code Navigation), `Card`, `Badge`, `Button`, `Input`, `Dialog`, `DropdownMenu`, `Tooltip`, `Select`, `ToggleGroup`.

3. **Iconography & Custom Pin Folders (R2 & R3 Requirements)**:
   - Dedicated Lucide icons for all 13 categories (`Screen`, `Camera`, `Buttons`, `Battery`, `Back Cover`, `Locks`, `Pen`, `Water Damage`, `Audio`, `Body`, `System`, `Codes`, `Custom Folders`).
   - Custom user pin folders / favorites categories system with localStorage state (`qc-pins`, `qc-custom-folders`, etc.).

4. **Build & Test Compatibility**:
   - Cloudflare Pages expects output in `./dist` produced by `npm run build` (`tsc && vite build`).
   - `tests/harness.js` compiles TypeScript using `esbuild`. Any new UI packages (e.g. Radix UI, Lucide icons, cmdk, sonner) imported by `src/main.tsx` must build cleanly with `esbuild` without broken runtime side-effects in JSDOM.
   - `data-testid` attributes must be preserved on primary container components to maintain test harness compatibility.

---

## 3. Caveats

- **React 19 Dependency Compatibility**: React version is `19.2.8`. When installing `@radix-ui/*` primitives, `cmdk`, or `next-themes`, npm package resolution may require care to prevent React 19 peer dependency conflicts.
- **Tailwind CSS v4 Integration**: Vite configuration must be updated to support Tailwind v4 (e.g. via `@tailwindcss/vite` plugin or postcss configuration).
- **Test Harness esbuild css loader**: `tests/harness.js` configures esbuild loader `{ '.css': 'empty' }`. Styles imported directly in `.tsx`/`.ts` files are ignored by esbuild during tests, which is ideal, but utility function dependencies (such as `cn` from `clsx` + `tailwind-merge`) will execute inside JSDOM and must run without node runtime errors.

---

## 4. Conclusion

The repository is structured as a React 19 + Vite + TypeScript web application designed for static hosting on Cloudflare Pages (`./dist`). 
- **Baseline Integrity**: TypeScript compilation passes cleanly (`tsc --noEmit`).
- **Target Stack**: Tailwind CSS v4 + Radix UI + Lucide React Icons + CVA + clsx + tailwind-merge + cmdk + sonner + next-themes.
- **Key Deliverables**: Complete removal of `@mantine/*` and `@tabler/*` packages, implementation of Zinc Dark theme palette (`#09090b`, `#18181b`, `#27272a`, `#06b6d4`), custom user pin category folders with localStorage persistence, glassmorphic batch drawer sheet, Cmd+K command spotlight search, and maintenance of 100% build & test integrity.

---

## 5. Verification Method

To verify the findings and environment baseline:

1. **Verify TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```
2. **Verify production Vite build**:
   ```bash
   npm run build
   ```
3. **Verify test suite harness execution**:
   ```bash
   npm test
   ```
4. **Inspect configuration & source files**:
   - `package.json`
   - `wrangler.jsonc`
   - `tsconfig.app.json`
   - `vite.config.ts`
   - `src/App.tsx`
   - `tests/harness.js`
