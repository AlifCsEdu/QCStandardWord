# Project Architecture & Toolchain Analysis Report

**Target Project**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`  
**Author**: Explorer 2 (Project Architecture & Toolchain Explorer)  
**Date**: 2026-08-07  

---

## 1. Executive Summary & Current Repository State

A thorough investigation of `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording` reveals the following repository state:

- **Current Repository Contents**:
  - `standardwording.html` (150,505 bytes): Legacy single-page HTML application containing all defect categories, panel codes, search logic, and batch drawer scripts.
  - `.agents/`: Agent workspace directory containing system prompts, original request specs, and subagent state.
- **Initial Setup Status**:
  - The repository currently lacks modern build tooling. There is **no existing `package.json`**, **no `vite.config.ts`**, **no `tsconfig.json`**, and **no React source directory (`src/`)**.
  - System environment check confirmed Node.js `v26.3.1` and npm `11.17.0` are installed and available.

To achieve the requirements set out in `ORIGINAL_REQUEST.md`, a complete React + Vite + TypeScript + Mantine UI v7 toolchain must be bootstrapped from scratch.

---

## 2. Dependency Specification & Package Setup

### 2.1 Core Application Dependencies
- **`react` & `react-dom`** (`^18.3.1` or `^19.0.0`): Core React rendering engine.
- **`@mantine/core`** (`^7.17.0`): Mantine UI v7 component library (AppShell, Drawer, Modal, Badge, Button, ActionIcon, Grid, Card, Table, SegmentedControl, Chip, Select, etc.).
- **`@mantine/hooks`** (`^7.17.0`): Mantine utility hooks (`useColorScheme`, `useLocalStorage`, `useDisclosure`, `useClipboard`, `useDebouncedValue`, `useHotkeys`, etc.).
- **`@tabler/icons-react`** (`^3.30.0`): Icon set natively recommended for Mantine v7.

### 2.2 Styling & PostCSS Dependencies
Mantine UI v7 requires PostCSS with specific plugins:
- **`postcss`** (`^8.5.1`): CSS processing engine.
- **`postcss-preset-mantine`** (`^1.17.0`): Includes Mantine CSS variables, mixins, and media queries.
- **`postcss-simple-vars`** (`^7.0.1`): Provides breakpoint variable substitution for Mantine responsive styles.

### 2.3 Build & Development Toolchain
- **`vite`** (`^6.1.0`): Next-generation frontend build tool.
- **`@vitejs/plugin-react`** (`^4.3.4`): Fast Refresh and JSX support for React.
- **`typescript`** (`^5.7.3`): Static typing and compiler.
- **`@types/react`** (`^18.3.18`), **`@types/react-dom`** (`^18.3.5`), **`@types/node`** (`^22.13.0`).
- **`vite-plugin-pwa`** (`^0.21.1`): Zero-config PWA plugin for Vite, handling web app manifest generation and Workbox service worker bundling.

---

## 3. Recommended `package.json` Manifest

```json
{
  "name": "qc-standard-wording",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "preview": "vite preview"
  },
  "dependencies": {
    "@mantine/core": "^7.17.0",
    "@mantine/hooks": "^7.17.0",
    "@tabler/icons-react": "^3.30.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "postcss": "^8.5.1",
    "postcss-preset-mantine": "^1.17.0",
    "postcss-simple-vars": "^7.0.1",
    "typescript": "^5.7.3",
    "vite": "^6.1.0",
    "vite-plugin-pwa": "^0.21.1"
  }
}
```

---

## 4. Vite & PostCSS Architecture Configuration

### 4.1 PostCSS Configuration (`postcss.config.cjs`)
```javascript
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

### 4.2 Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'QC Standard Wording Inspection Tool',
        short_name: 'QC Wording',
        description: 'Production-grade QC inspection standard wording generator and batch clipboard tool.',
        theme_color: '#228be6',
        background_color: '#1a1b1e',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
});
```

---

## 5. TypeScript Setup Architecture

### 5.1 Main `tsconfig.json`
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### 5.2 `tsconfig.app.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict Type-Checking Options */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Alias Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

### 5.3 `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Strictness */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 6. PWA Integration Requirements

To satisfy Requirement R3 (Full PWA support / offline readiness), the implementation must include:
1. `vite-plugin-pwa` integrated into `vite.config.ts`.
2. Static icons in `public/`:
   - `favicon.svg`
   - `pwa-192x192.png`
   - `pwa-512x512.png`
3. PWA Registration module (`virtual:pwa-register`) or automatic service worker registration via `registerType: 'autoUpdate'`.
4. HTML meta tags in `index.html`:
   - `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
   - `<meta name="theme-color" content="#228be6" />`
   - `<link rel="manifest" href="/manifest.webmanifest" />` (injected automatically by `vite-plugin-pwa`).

---

## 7. Recommended Directory Layout Architecture

```
QCStandardWording/
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppNavbar.tsx
│   │   │   ├── AppShellLayout.tsx
│   │   │   └── SettingsDrawer.tsx
│   │   ├── wording/
│   │   │   ├── CategoryTabs.tsx
│   │   │   ├── SubCategoryChips.tsx
│   │   │   ├── WordingCard.tsx
│   │   │   ├── WordingGrid.tsx
│   │   │   ├── WordingTable.tsx
│   │   │   └── WordingList.tsx
│   │   ├── drawer/
│   │   │   └── BatchQueueDrawer.tsx
│   │   ├── modal/
│   │   │   ├── CustomEntryModal.tsx
│   │   │   ├── ImportExportModal.tsx
│   │   │   └── CopyHistoryModal.tsx
│   │   └── search/
│   │       └── SearchBar.tsx
│   ├── data/
│   │   └── wordingData.ts          # Extracted 139+ defect entries from standardwording.html
│   ├── hooks/
│   │   ├── useWordingStore.ts       # Main state management with localStorage persistence
│   │   ├── useFuzzySearch.ts        # Typo-tolerant fuzzy search engine hook
│   │   └── useAppearanceSettings.ts # Theme, radius, density, mode state
│   ├── types/
│   │   └── wording.ts              # Type definitions (WordingItem, Category, BatchItem, etc.)
│   ├── utils/
│   │   ├── fuzzySearch.ts           # Levenshtein distance, token matching, sub-sequence scoring
│   │   ├── clipboard.ts             # Copy helper with desktop/mobile fallback
│   │   └── storage.ts               # LocalStorage serialization helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── postcss.config.cjs
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 8. Build Verification Strategy

1. **Dependency Installation**: `npm install`
2. **Type Checking**: `npx tsc --noEmit`
3. **Production Bundling**: `npm run build`
4. **Validation Checkpoints**:
   - Check `dist/` directory generation.
   - Verify zero TypeScript or bundling warnings/errors.
   - Confirm PWA assets (`sw.js`, `manifest.webmanifest`) in output.
