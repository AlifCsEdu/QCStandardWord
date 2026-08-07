import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Challenger M2: Deep Slate & Charcoal Theme Empirical Tests', () => {
  it('should verify tokens.ts contains exact required colors for Deep Slate & Charcoal specification', () => {
    const tokensPath = path.join(projectRoot, 'src', 'theme', 'tokens.ts');
    const tokensContent = fs.readFileSync(tokensPath, 'utf8');

    // Requirement R1: Deep Slate (#0f172a), Charcoal (#1e293b), high contrast borders (#334155), cyan accents (#06b6d4 / #0284c7)
    assert.ok(tokensContent.includes('#0f172a'), 'tokens.ts must contain #0f172a (Deep Slate bg)');
    assert.ok(tokensContent.includes('#1e293b'), 'tokens.ts must contain #1e293b (Charcoal container)');
    assert.ok(tokensContent.includes('#334155'), 'tokens.ts must contain #334155 (Border contrast)');
    assert.ok(tokensContent.includes('#06b6d4'), 'tokens.ts must contain #06b6d4 (Cyan accent)');
    assert.ok(tokensContent.includes('#0284c7'), 'tokens.ts must contain #0284c7 (Sky accent)');
  });

  it('should verify index.ts configures Mantine theme with primaryColor: cyanAccent', () => {
    const themePath = path.join(projectRoot, 'src', 'theme', 'index.ts');
    const themeContent = fs.readFileSync(themePath, 'utf8');

    assert.ok(themeContent.includes("primaryColor: 'cyanAccent'"), 'index.ts must specify primaryColor: cyanAccent');
    assert.ok(themeContent.includes('Card: Card.extend'), 'index.ts must configure Card overrides');
    assert.ok(themeContent.includes('Paper: Paper.extend'), 'index.ts must configure Paper overrides');
    assert.ok(themeContent.includes('Drawer: Drawer.extend'), 'index.ts must configure Drawer overrides');
    assert.ok(themeContent.includes('Modal: Modal.extend'), 'index.ts must configure Modal overrides');
  });

  it('should contain all required CSS custom properties in src/index.css', () => {
    const cssPath = path.join(projectRoot, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const requiredVars = [
      '--bg-deep-slate: #0f172a;',
      '--container-charcoal: #1e293b;',
      '--border-contrast: #334155;',
      '--accent-cyan: #06b6d4;',
      '--accent-sky: #0284c7;',
      '--text-primary: #f8fafc;',
      '--text-secondary: #94a3b8;',
      '--drawer-backdrop-bg: rgba(15, 23, 42, 0.4);',
      '--drawer-backdrop-blur: blur(8px);',
      '--mantine-color-body: var(--bg-deep-slate);',
      '--header-bg: var(--container-charcoal);',
    ];

    for (const varDef of requiredVars) {
      assert.ok(
        cssContent.includes(varDef),
        `src/index.css is missing required CSS variable definition: ${varDef}`
      );
    }
  });

  it('should successfully mount JSDOM app instance with custom theme import and defaultColorScheme="dark"', () => {
    const app = createAppInstance();
    const { document } = app;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    assert.ok(htmlEl, 'HTML element must exist');
    assert.ok(bodyEl, 'Body element must exist');

    // Check root attributes set by useAppearance hook on load
    const colorScheme = htmlEl.getAttribute('data-mantine-color-scheme');
    const themeAttr = htmlEl.getAttribute('data-theme');

    assert.equal(colorScheme, 'dark', 'root data-mantine-color-scheme should be "dark"');
    assert.equal(themeAttr, 'dark', 'root data-theme should be "dark"');
  });

  it('should support dynamic theme switching in JSDOM without crashing', () => {
    const app = createAppInstance();
    const { window, document } = app;

    const htmlEl = document.documentElement;
    assert.equal(htmlEl.getAttribute('data-theme'), 'dark', 'initial data-theme should be dark');

    // Verify theme toggle button works and updates root attributes
    const themeToggleBtn = document.querySelector('[aria-label*="theme"], [data-testid="theme-toggle"], #themeToggle');
    if (themeToggleBtn) {
      themeToggleBtn.click();
      assert.equal(htmlEl.getAttribute('data-theme'), 'light', 'data-theme should switch to light after click');
    }
  });
});
