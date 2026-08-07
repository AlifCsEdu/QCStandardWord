## 2026-08-07T13:30:17Z
Implement Requirement R1: 2026 Deep Slate & Charcoal Theme & Design Tokens Setup:
1. Create `src/theme/tokens.ts`: Define design tokens (palettes for `deepSlate`: `#0f172a` bg, `#1e293b` container, `#334155` border; and `cyanAccent`: `#06b6d4` / `#0284c7`; shadows; 150ms transitions).
2. Create `src/theme/index.ts`: Create and export custom Mantine `theme` using `createTheme()` with `primaryColor: 'cyanAccent'`, 10-shade color tuples for `dark`, `deepSlate`, `cyanAccent`, and default props/styles for `Card`, `Paper`, `Drawer`, `Modal`.
3. Update `src/index.css`: Define CSS custom properties under `:root`, `[data-theme='dark']`, `[data-mantine-color-scheme='dark']`, and `[data-theme='light']`:
   - `--bg-deep-slate: #0f172a;`
   - `--container-charcoal: #1e293b;`
   - `--border-contrast: #334155;`
   - `--accent-cyan: #06b6d4;`
   - `--accent-sky: #0284c7;`
   - `--text-primary: #f8fafc;`
   - `--text-secondary: #94a3b8;`
   - `--drawer-backdrop-bg: rgba(15, 23, 42, 0.4);`
   - `--drawer-backdrop-blur: blur(8px);`
   - `--mantine-color-body: var(--bg-deep-slate);`
   - `--header-bg: var(--container-charcoal);`
   - Apply global body background and color styling with smooth transition (`150ms ease`).
4. Update `src/App.tsx`: Import custom `theme` from `./theme` (relative path) and configure `<MantineProvider theme={theme} defaultColorScheme="dark">`.
5. Update `src/hooks/useAppearance.ts`: Update `DEFAULT_SETTINGS` theme default to `'dark'`.
6. Verification Requirements:
   Run verification commands and include raw output in handoff report:
   - `npm run lint` (or `npx tsc --noEmit`)
   - `npm run build` (`tsc && vite build`)
   - `npm run test` (`node --test tests/**/*.test.js`)
   - `npx tsx --test tests/searchEngine.test.ts`
