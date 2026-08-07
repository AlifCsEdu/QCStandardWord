# Handoff Report — Explorer 1 (Milestone 2: 2026 Deep Slate & Charcoal Theme & Design Tokens Setup)

## 1. Observation

### Existing Theme & Files Analysis
- **`src/theme/`**: Directory does not currently exist. Theme configuration is defined inline inside `src/App.tsx`.
- **`src/App.tsx` (lines 303–314)**:
  ```ts
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
- **`src/index.css` (lines 1–5)**:
  Only contains style imports for `@mantine/core/styles.css`, `@mantine/spotlight/styles.css`, and `@mantine/notifications/styles.css`. Lacks custom CSS variable definitions for Deep Slate, Charcoal, or border styling.
- **`src/hooks/useAppearance.ts` (lines 4–12, 67–73)**:
  - `DEFAULT_SETTINGS` has `theme: 'light'`.
  - `useEffect` synchronizes appearance state to `document.documentElement` attributes:
    ```ts
    root.setAttribute('data-mantine-color-scheme', appearance.theme === 'auto' ? 'light' : appearance.theme);
    root.setAttribute('data-theme', appearance.theme);
    root.setAttribute('data-density', appearance.density);
    root.setAttribute('data-layout', appearance.layout);
    ```
- **`package.json`**:
  - `@mantine/core`: `^7.17.8`
  - `@mantine/hooks`: `^7.17.8`
  - `@mantine/notifications`: `^7.17.8`
  - `@mantine/spotlight`: `^7.17.8`
- **`tests/` Test Suite**:
  - `tests/tier1-features.test.js`: Verifies `MantineProvider` and DOM root initialization (`should initialize MantineProvider and DOM tree with Deep Slate & Charcoal theme defaults`).
  - `tests/harness.js`: Compiles `src/main.tsx` via `esbuild.buildSync` into IIFE for JSDOM testing.

---

## 2. Logic Chain

1. **Modular Theme Structure (`src/theme/`)**:
   Creating a dedicated `src/theme/` directory with `colors.ts` and `index.ts` decouples theme tokens from component render logic in `App.tsx`.
2. **Mantine UI v7 10-Shade Color Tuples**:
   Mantine v7 requires custom colors in `theme.colors` to be 10-element arrays of hex strings.
   - **Deep Slate & Charcoal Palette (`deepSlate` / `dark`)**:
     - `deepSlate[9]` = `#0f172a` (Slate 900 — Deep Slate body background)
     - `deepSlate[8]` = `#1e293b` (Slate 800 — Charcoal surface container)
     - `deepSlate[7]` = `#334155` (Slate 700 — High-contrast border outline)
     - `deepSlate[6]` = `#475569` (Slate 600)
     - `deepSlate[5]` = `#64748b` (Slate 500)
     - `deepSlate[4]` = `#94a3b8` (Slate 400 — Muted text)
     - `deepSlate[3]` = `#cbd5e1` (Slate 300)
     - `deepSlate[2]` = `#e2e8f0` (Slate 200)
     - `deepSlate[1]` = `#f1f5f9` (Slate 100)
     - `deepSlate[0]` = `#f8fafc` (Slate 50 — Light text)
   - **Cool Cyan Accent Palette (`cyan`)**:
     - `cyan[5]` = `#06b6d4` (Cool cyan primary highlight)
     - `cyan[7]` = `#0284c7` (Cool cyan secondary accent)
3. **Mantine Dark Palette Override**:
   Overriding `theme.colors.dark` with the `deepSlate` tuple allows all Mantine core components (`Paper`, `Card`, `Modal`, `Drawer`, `AppShell`, `Table`) to automatically inherit Charcoal background `#1e293b` and Deep Slate body `#0f172a` when operating in dark mode.
4. **Global CSS Custom Properties (`src/index.css`)**:
   Adding root CSS custom variables under `:root`, `[data-mantine-color-scheme="dark"]`, and `[data-theme="dark"]`:
   - `--bg-deep-slate: #0f172a;`
   - `--bg-charcoal: #1e293b;`
   - `--border-high-contrast: #334155;`
   - `--accent-cyan-primary: #06b6d4;`
   - `--accent-cyan-secondary: #0284c7;`
   This ensures seamless styling for both Mantine components and raw HTML/CSS elements.
5. **Default Theme & Root Attribute Synchronization**:
   Updating `DEFAULT_SETTINGS` in `useAppearance.ts` from `theme: 'light'` to `theme: 'dark'` ensures that the app loads in the 2026 Deep Slate & Charcoal theme by default while preserving light mode fallback when toggled.

---

## 6. Caveats

- **Existing LocalStorage Cache**: User browsers or tests with previously saved `qc-theme: "light"` in `localStorage` will retain light mode unless updated or cleared.
- **Component Hardcoded Colors**: Individual components (e.g. `AppHeader.tsx`, `WordingContainer.tsx`) still have inline CSS properties like `background: '#ffffff'` or `border: '1px solid #ced4da'`. These component-level styles will be updated in subsequent layout & feature milestones (M3–M6). M2 establishes the underlying theme framework, design tokens, MantineProvider configuration, and global CSS variables.

---

## 4. Conclusion

The implementation strategy for Milestone 2 is clear and ready for execution:
1. **Create `src/theme/colors.ts`**: Define `deepSlate` and `cyan` 10-shade tuples.
2. **Create `src/theme/index.ts`**: Configure Mantine theme using `createTheme({ primaryColor: 'cyan', colors: { dark: deepSlate, deepSlate, cyan }, ... })`.
3. **Update `src/index.css`**: Declare global CSS variables (`--bg-deep-slate`, `--bg-charcoal`, `--border-high-contrast`, `--accent-cyan-primary`, `--accent-cyan-secondary`) and body background rules for `data-theme="dark"` / `data-theme="light"`.
4. **Update `src/App.tsx`**: Pass custom `theme` to `MantineProvider` and set `defaultColorScheme="dark"`.
5. **Update `src/hooks/useAppearance.ts`**: Set `DEFAULT_SETTINGS` theme default to `'dark'`.

---

## 5. Verification Method

### Execution Commands
1. **Build Verification**:
   ```bash
   npm run build
   ```
   *Expected Result*: Clean TypeScript type checking (`tsc`) and Vite production bundle generation in `dist/`.

2. **Test Suite Verification**:
   ```bash
   npm test
   ```
   *Expected Result*: 100% pass rate across all test suites in `tests/*.test.js`.

### Files to Inspect
- `src/theme/colors.ts`
- `src/theme/index.ts`
- `src/App.tsx`
- `src/index.css`
- `src/hooks/useAppearance.ts`

### Invalidation Conditions
- TypeScript errors when compiling `createTheme` due to invalid color tuple formats.
- Failure of JSDOM tests checking `data-theme` or `MantineProvider` initialization.
