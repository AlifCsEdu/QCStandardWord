# Handoff Report — Explorer 2 (Milestone 2: Deep Slate & Charcoal Theme & Design Tokens)

## 1. Observation

### File & Code State Analysis
1. **`src/index.css`**:
   - Location: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\src\index.css`
   - Content (lines 1-5):
     ```css
     @import '@mantine/core/styles.css';
     @import '@mantine/spotlight/styles.css';
     @import '@mantine/notifications/styles.css';
     ```
   - Direct Observation: `src/index.css` currently contains zero custom CSS root variables or custom theme rules (`:root`, `[data-theme]`, or `[data-mantine-color-scheme]`).
   - Missing custom CSS variables: `--bg-deep-slate`, `--container-charcoal`, `--border-contrast`, `--accent-cyan`, `--text-primary`, `--text-secondary`.

2. **`src/App.tsx` & Mantine Theme Configuration**:
   - Location: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\src\App.tsx`
   - Content (lines 303-315):
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
   - Direct Observation: `createTheme` uses standard `blue` primaryColor and lacks custom 10-shade color palettes, component overrides (`Card`, `Paper`, `Drawer`, `Modal`), or 2026 Deep Slate & Charcoal tokens. `defaultColorScheme` is hardcoded to `"light"`.

3. **`src/hooks/useAppearance.ts` Root Attributes Integration**:
   - Location: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\src\hooks\useAppearance.ts`
   - Content (lines 68-73):
     ```ts
     const root = document.documentElement;
     root.setAttribute('data-mantine-color-scheme', appearance.theme === 'auto' ? 'light' : appearance.theme);
     root.setAttribute('data-theme', appearance.theme);
     root.setAttribute('data-density', appearance.density);
     root.setAttribute('data-layout', appearance.layout);
     ```
   - Direct Observation: Root HTML attributes `data-mantine-color-scheme` and `data-theme` are continuously synced on `document.documentElement` when `theme` changes.

4. **Container Component Color Derivation**:
   - `AppHeader.tsx` (lines 28, 32): `borderBottom: '1px solid var(--mantine-color-gray-3, #e9ecef)'`, `background: 'var(--header-bg, #ffffff)'`.
   - `StatsDashboard.tsx` (line 66): `background: 'var(--mantine-color-body, #ffffff)'`.
   - `BatchDrawer.tsx` (lines 58, 104, 283): Hardcoded `#ffffff`, `bg="var(--mantine-color-gray-0, #f8f9fa)"`, `background: 'rgba(0,0,0,0.4)'`.
   - `WordingList.tsx`, `WordingGrid.tsx`, `WordingTable.tsx`: Inline hardcoded colors (`#e9ecef`, `#fff9db`, `#ffffff`, `#1971c2`, `#ced4da`).
   - Modals (`EditModal.tsx`, `SettingsModal.tsx`): Hardcoded `#ffffff` backgrounds and `#ced4da` borders.

---

## 2. Logic Chain

1. **Premise**: Requirement R1 dictates a 2026 Deep Slate background (`#0f172a`), Charcoal containers (`#1e293b`), high-contrast border outlines (`#334155`), and cool cyan accent highlights (`#06b6d4` / `#0284c7`).
2. **Step 1 — CSS Variable Layering**:
   - Since `src/index.css` is imported globally in `src/main.tsx` after `@mantine/core/styles.css`, scoping custom CSS variables under `:root`, `[data-theme='dark']`, `[data-mantine-color-scheme='dark']`, and `[data-theme='light']` allows Mantine variables (`--mantine-color-body`, `--mantine-color-text`, `--header-bg`) to automatically reference the 2026 tokens.
3. **Step 2 — Root Attribute Synchronization**:
   - `useAppearance.ts` already updates `data-theme` and `data-mantine-color-scheme` on `document.documentElement`. By binding our CSS custom properties to these exact selector attributes in `src/index.css`, color scheme updates will immediately cascade across all HTML elements without requiring full React component re-renders.
4. **Step 3 — Container Color Derivation**:
   - Refactoring inline styles across container components (`AppShell`, `AppHeader`, `StatsDashboard`, `WordingList`, `WordingGrid`, `WordingTable`, `BatchDrawer`, `EditModal`, `SettingsModal`) to use CSS variables (`var(--bg-deep-slate)`, `var(--container-charcoal)`, `var(--border-contrast)`, `var(--accent-cyan)`, `var(--text-primary)`) decouples component markup from hardcoded light-mode hex values.
5. **Step 4 — Mantine Theme Override**:
   - Defining a custom Mantine theme in `src/theme/index.ts` and `src/theme/tokens.ts` using Mantine v7 `createTheme()` allows Mantine components (`Card`, `Paper`, `Drawer`, `Modal`, `Badge`, `Button`) to inherit Charcoal backgrounds (`#1e293b`), high-contrast borders (`#334155`), and cyan highlights natively.

---

## 3. Caveats

- **Existing Inline Styles**: Components currently have extensive inline style objects. Worker must systematically replace inline hex strings (e.g., `#ffffff`, `#e9ecef`) with CSS variable references (`var(--container-charcoal)`, `var(--border-contrast)`).
- **Default Theme Setting**: `App.tsx` has `defaultColorScheme="light"`. For M2, default color scheme should be set to `"dark"` (or synced with `useAppearance` stored state) to fulfill the 2026 Deep Slate primary presentation.

---

## 4. Conclusion & Precise Design Token Specifications

### A. Global CSS Specifications (`src/index.css`)

```css
@import '@mantine/core/styles.css';
@import '@mantine/spotlight/styles.css';
@import '@mantine/notifications/styles.css';

:root {
  /* 2026 Deep Slate & Charcoal Palette Tokens - Default (Dark / Deep Slate) */
  --bg-deep-slate: #0f172a;
  --container-charcoal: #1e293b;
  --container-charcoal-hover: #243347;
  --border-contrast: #334155;
  --border-contrast-hover: #475569;
  --accent-cyan: #06b6d4;
  --accent-cyan-hover: #0891b2;
  --accent-sky: #0284c7;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Glassmorphism & Overlay Tokens */
  --drawer-backdrop-bg: rgba(15, 23, 42, 0.4);
  --drawer-backdrop-blur: blur(8px);
  --glass-border: rgba(51, 65, 85, 0.6);

  /* Mantine Core Overrides */
  --mantine-color-body: var(--bg-deep-slate);
  --mantine-color-text: var(--text-primary);
  --header-bg: var(--container-charcoal);
}

/* Explicit Light Mode Token Overrides */
[data-theme='light'],
[data-mantine-color-scheme='light'] {
  --bg-deep-slate: #f8fafc;
  --container-charcoal: #ffffff;
  --container-charcoal-hover: #f1f5f9;
  --border-contrast: #cbd5e1;
  --border-contrast-hover: #94a3b8;
  --accent-cyan: #0284c7;
  --accent-cyan-hover: #0369a1;
  --accent-sky: #0369a1;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;

  --drawer-backdrop-bg: rgba(15, 23, 42, 0.2);
  --drawer-backdrop-blur: blur(6px);
  --glass-border: rgba(203, 213, 225, 0.8);

  --mantine-color-body: var(--bg-deep-slate);
  --mantine-color-text: var(--text-primary);
  --header-bg: var(--container-charcoal);
}

/* Explicit Dark Mode Token Overrides */
[data-theme='dark'],
[data-mantine-color-scheme='dark'] {
  --bg-deep-slate: #0f172a;
  --container-charcoal: #1e293b;
  --container-charcoal-hover: #243347;
  --border-contrast: #334155;
  --border-contrast-hover: #475569;
  --accent-cyan: #06b6d4;
  --accent-cyan-hover: #0891b2;
  --accent-sky: #0284c7;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --drawer-backdrop-bg: rgba(15, 23, 42, 0.4);
  --drawer-backdrop-blur: blur(8px);
  --glass-border: rgba(51, 65, 85, 0.6);

  --mantine-color-body: var(--bg-deep-slate);
  --mantine-color-text: var(--text-primary);
  --header-bg: var(--container-charcoal);
}

/* Global Reset & Transition Defaults */
body {
  background-color: var(--bg-deep-slate);
  color: var(--text-primary);
  margin: 0;
  padding: 0;
  transition: background-color 150ms ease, color 150ms ease;
}
```

### B. TypeScript Design Token Specifications

`src/theme/tokens.ts`:
```ts
export const designTokens = {
  colors: {
    bgDeepSlate: '#0f172a',
    containerCharcoal: '#1e293b',
    borderContrast: '#334155',
    borderContrastHover: '#475569',
    accentCyan: '#06b6d4',
    accentSky: '#0284c7',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
  },
  palettes: {
    deepSlate: [
      '#f8fafc',
      '#f1f5f9',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8',
      '#64748b',
      '#475569',
      '#334155',
      '#1e293b',
      '#0f172a',
    ] as const,
    cyanAccent: [
      '#ecfeff',
      '#cffaff',
      '#a5f3fc',
      '#67e8f9',
      '#22d3ee',
      '#06b6d4',
      '#0284c7',
      '#0369a1',
      '#075985',
      '#0c4a6e',
    ] as const,
  },
  shadows: {
    card: '0 4px 12px rgba(0, 0, 0, 0.2)',
    drawer: '-4px 0 24px rgba(0, 0, 0, 0.4)',
    floating: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },
  transitions: {
    hover: 'all 150ms ease',
  },
} as const;
```

`src/theme/index.ts`:
```ts
import { createTheme, type MantineThemeOverride } from '@mantine/core';
import { designTokens } from './tokens';

export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'cyanAccent',
  primaryShade: { light: 6, dark: 5 },
  colors: {
    deepSlate: designTokens.palettes.deepSlate as any,
    cyanAccent: designTokens.palettes.cyanAccent as any,
  },
  components: {
    Card: {
      defaultProps: {
        bg: 'var(--container-charcoal)',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: 'var(--border-contrast)',
          transition: designTokens.transitions.hover,
        },
      },
    },
    Paper: {
      defaultProps: {
        bg: 'var(--container-charcoal)',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: 'var(--border-contrast)',
        },
      },
    },
    Drawer: {
      styles: {
        content: {
          backgroundColor: 'var(--container-charcoal)',
          color: 'var(--text-primary)',
        },
        header: {
          backgroundColor: 'var(--container-charcoal)',
          color: 'var(--text-primary)',
          borderBottom: '1px solid var(--border-contrast)',
        },
        overlay: {
          backgroundColor: 'var(--drawer-backdrop-bg)',
          backdropFilter: 'var(--drawer-backdrop-blur)',
        },
      },
    },
    Modal: {
      styles: {
        content: {
          backgroundColor: 'var(--container-charcoal)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-contrast)',
        },
        header: {
          backgroundColor: 'var(--container-charcoal)',
          color: 'var(--text-primary)',
        },
      },
    },
  },
});
```

---

## 5. Verification Method

To verify the implementation of R1 design tokens & theme setup:

1. **Build Verification**:
   ```bash
   npm run build
   ```
   Must compile TypeScript and Vite bundle cleanly with zero errors.

2. **Test Suite Verification**:
   ```bash
   npm test
   ```
   All test suites (search engine, tier tests) must pass 100%.

3. **DOM Inspection**:
   - Verify `:root`, `[data-theme='dark']`, and `[data-theme='light']` CSS rules in `src/index.css`.
   - Inspect computed styles on `document.body` and `<AppShell>` elements in browser dev tools:
     - `background-color` should equal `#0f172a` (or `var(--bg-deep-slate)`) in dark mode.
     - Container backgrounds should equal `#1e293b` (`var(--container-charcoal)`).
     - Borders should equal `#334155` (`var(--border-contrast)`).
     - Primary accents should equal `#06b6d4` / `#0284c7` (`var(--accent-cyan)`).

4. **Invalidation Conditions**:
   - Any hardcoded `#ffffff` light background remaining on main container elements in dark mode.
   - Broken `npm run build` or TypeScript lint errors on `createTheme()` types.
