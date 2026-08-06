## 2026-08-07T00:52:23Z
You are the Implementation Worker subagent for Milestone 1 of the project at `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`.

Please read ORIGINAL_REQUEST.md at `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md` before starting work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your working directory for metadata is `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m1`.

### Detailed Steps:
1. Create `package.json` in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`:
   - Name: "qc-standard-wording", private: true, version: "1.0.0", type: "module"
   - Scripts: "dev": "vite", "build": "tsc && vite build", "lint": "tsc --noEmit", "preview": "vite preview"
   - dependencies:
     "@mantine/core": "^7.17.0",
     "@mantine/hooks": "^7.17.0",
     "@tabler/icons-react": "^3.30.0",
     "react": "^18.3.1",
     "react-dom": "^18.3.1"
   - devDependencies:
     "@types/node": "^22.13.0",
     "@types/react": "^18.3.18",
     "@types/react-dom": "^18.3.5",
     "@vitejs/plugin-react": "^4.3.4",
     "postcss": "^8.4.0",
     "postcss-preset-mantine": "^1.17.0",
     "postcss-simple-vars": "^7.0.0",
     "typescript": "^5.7.0",
     "vite": "^6.0.0",
     "vite-plugin-pwa": "^0.21.0"

2. Create `vite.config.ts`:
   - Import `defineConfig` from `vite`, `react` from `@vitejs/plugin-react`, `VitePWA` from `vite-plugin-pwa`, `path` from `path`.
   - Setup plugins: `react()`, `VitePWA({ registerType: 'autoUpdate', manifest: { name: 'QC Standard Wording Inspection Tool', short_name: 'QC Wording', description: 'QC Standard Wording Inspection Tool', theme_color: '#ffffff', icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }] } })`.
   - Setup resolve alias: `@` -> `path.resolve(__dirname, './src')`.

3. Create TypeScript configuration files:
   - `tsconfig.json`:
     ```json
     {
       "files": [],
       "references": [
         { "path": "./tsconfig.app.json" },
         { "path": "./tsconfig.node.json" }
       ]
     }
     ```
   - `tsconfig.app.json`:
     ```json
     {
       "compilerOptions": {
         "target": "ES2022",
         "useDefineForClassFields": true,
         "lib": ["ES2022", "DOM", "DOM.Iterable"],
         "module": "ESNext",
         "skipLibCheck": true,
         "moduleResolution": "bundler",
         "allowImportingTsExtensions": true,
         "isolatedModules": true,
         "moduleDetection": "force",
         "noEmit": true,
         "jsx": "react-jsx",
         "strict": true,
         "noUnusedLocals": true,
         "noUnusedParameters": true,
         "noFallthroughCasesInSwitch": true,
         "baseUrl": ".",
         "paths": {
           "@/*": ["src/*"]
         }
       },
       "include": ["src"]
     }
     ```
   - `tsconfig.node.json`:
     ```json
     {
       "compilerOptions": {
         "target": "ES2022",
         "lib": ["ES2022"],
         "module": "ESNext",
         "skipLibCheck": true,
         "moduleResolution": "bundler",
         "allowImportingTsExtensions": true,
         "isolatedModules": true,
         "moduleDetection": "force",
         "noEmit": true,
         "strict": true,
         "noUnusedLocals": true,
         "noUnusedParameters": true,
         "noFallthroughCasesInSwitch": true
       },
       "include": ["vite.config.ts"]
     }
     ```

4. Create `postcss.config.cjs`:
   - CommonJS format:
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

5. Create `index.html`:
   - Viewport meta tag
   - Title: 'QC Standard Wording Inspection Tool'
   - Root element `<div id="root"></div>`
   - Script `<script type="module" src="/src/main.tsx"></script>`

6. Create `public/favicon.svg`:
   - Clean SVG placeholder icon.

7. Create `src/index.css`:
   - `@import '@mantine/core/styles.css';`

8. Create `src/main.tsx`:
   - Imports React, ReactDOM, MantineProvider, App, index.css.
   - Wraps App in `<MantineProvider>` and renders to `#root`.

9. Create initial `src/App.tsx`:
   - Clean shell component using Mantine UI v7 components (e.g. AppShell, Container, Title, Text, Button, Paper, Group, Stack, Header, etc.).

10. Execute `npm install` in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`.
11. Run build verification (`npm run build` and `npx tsc --noEmit`) to ensure zero errors.

12. Write a comprehensive handoff report to `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m1\handoff.md` detailing:
    - Files created and their contents summary
    - `npm install` result
    - Verification commands and results (`npm run build`, `tsc --noEmit`)
    - Handoff status and next steps.
