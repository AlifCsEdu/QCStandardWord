import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { colors, shadows, transitions } from '../src/theme/tokens.ts';
import { theme } from '../src/theme/index.ts';

describe('Milestone 2 Empirical Stress Test: Design Tokens & Mantine Theme', () => {
  test('Design Tokens Integrity in tokens.ts', () => {
    // Check palette lengths (Mantine v7 requires exactly 10 shades per palette tuple)
    assert.strictEqual(colors.deepSlate.length, 10, 'deepSlate palette must have 10 shades');
    assert.strictEqual(colors.cyanAccent.length, 10, 'cyanAccent palette must have 10 shades');
    assert.strictEqual(colors.dark.length, 10, 'dark palette must have 10 shades');

    // Required color constants check
    assert.strictEqual(colors.deepSlate[9], '#0f172a', 'deepSlate[9] must be #0f172a (Deep Slate bg)');
    assert.strictEqual(colors.deepSlate[8], '#1e293b', 'deepSlate[8] must be #1e293b (Container Charcoal)');
    assert.strictEqual(colors.deepSlate[7], '#334155', 'deepSlate[7] must be #334155 (Border Contrast)');

    assert.strictEqual(colors.dark[9], '#0f172a', 'dark[9] must be #0f172a (Deep Slate bg)');
    assert.strictEqual(colors.dark[8], '#1e293b', 'dark[8] must be #1e293b (Container Charcoal)');
    assert.strictEqual(colors.dark[7], '#334155', 'dark[7] must be #334155 (Border Contrast)');

    assert.strictEqual(colors.cyanAccent[5], '#06b6d4', 'cyanAccent[5] must be #06b6d4 (Accent Cyan)');
    assert.strictEqual(colors.cyanAccent[7], '#0284c7', 'cyanAccent[7] must be #0284c7 (Accent Sky)');

    // Shadows & Transitions check
    assert.ok(shadows.xs && shadows.sm && shadows.md && shadows.lg && shadows.xl, 'Shadow tokens must be present');
    assert.strictEqual(transitions.fast, '150ms ease', 'transitions.fast must be 150ms ease');
    assert.strictEqual(transitions.normal, '250ms ease', 'transitions.normal must be 250ms ease');
  });

  test('Mantine Theme Configuration in theme/index.ts', () => {
    assert.strictEqual(theme.primaryColor, 'cyanAccent', 'primaryColor must be set to cyanAccent');
    assert.deepStrictEqual(theme.colors.dark, colors.dark, 'theme.colors.dark must match colors.dark token');
    assert.deepStrictEqual(theme.colors.deepSlate, colors.deepSlate, 'theme.colors.deepSlate must match colors.deepSlate token');
    assert.deepStrictEqual(theme.colors.cyanAccent, colors.cyanAccent, 'theme.colors.cyanAccent must match colors.cyanAccent token');

    // Component default overrides & styles
    const components = theme.components || {};

    // Card
    assert.ok(components.Card, 'Card component override must exist');
    assert.strictEqual((components.Card as any).defaultProps?.bg, 'var(--container-charcoal, #1e293b)');
    assert.strictEqual((components.Card as any).defaultProps?.withBorder, true);
    assert.strictEqual((components.Card as any).styles?.root?.borderColor, 'var(--border-contrast, #334155)');

    // Paper
    assert.ok(components.Paper, 'Paper component override must exist');
    assert.strictEqual((components.Paper as any).defaultProps?.bg, 'var(--container-charcoal, #1e293b)');
    assert.strictEqual((components.Paper as any).defaultProps?.withBorder, true);
    assert.strictEqual((components.Paper as any).styles?.root?.borderColor, 'var(--border-contrast, #334155)');

    // Drawer
    assert.ok(components.Drawer, 'Drawer component override must exist');
    assert.strictEqual((components.Drawer as any).styles?.content?.backgroundColor, 'var(--container-charcoal, #1e293b)');
    assert.strictEqual((components.Drawer as any).styles?.content?.borderColor, 'var(--border-contrast, #334155)');
    assert.strictEqual((components.Drawer as any).styles?.overlay?.backgroundColor, 'var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))');
    assert.strictEqual((components.Drawer as any).styles?.overlay?.backdropFilter, 'var(--drawer-backdrop-blur, blur(8px))');

    // Modal
    assert.ok(components.Modal, 'Modal component override must exist');
    assert.strictEqual((components.Modal as any).styles?.content?.backgroundColor, 'var(--container-charcoal, #1e293b)');
    assert.strictEqual((components.Modal as any).styles?.content?.borderColor, 'var(--border-contrast, #334155)');
    assert.strictEqual((components.Modal as any).styles?.overlay?.backgroundColor, 'var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))');
    assert.strictEqual((components.Modal as any).styles?.overlay?.backdropFilter, 'var(--drawer-backdrop-blur, blur(8px))');
  });

  test('CSS Variables Completeness and Theme Switching in index.css', () => {
    const cssPath = path.join(process.cwd(), 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Dark Mode tokens
    assert.ok(cssContent.includes('--bg-deep-slate: #0f172a;'), 'index.css must define --bg-deep-slate: #0f172a');
    assert.ok(cssContent.includes('--container-charcoal: #1e293b;'), 'index.css must define --container-charcoal: #1e293b');
    assert.ok(cssContent.includes('--border-contrast: #334155;'), 'index.css must define --border-contrast: #334155');
    assert.ok(cssContent.includes('--accent-cyan: #06b6d4;'), 'index.css must define --accent-cyan: #06b6d4');
    assert.ok(cssContent.includes('--accent-sky: #0284c7;'), 'index.css must define --accent-sky: #0284c7');
    assert.ok(cssContent.includes('--text-primary: #f8fafc;'), 'index.css must define --text-primary: #f8fafc');
    assert.ok(cssContent.includes('--text-secondary: #94a3b8;'), 'index.css must define --text-secondary: #94a3b8');

    // Light Mode tokens support
    assert.ok(cssContent.includes("[data-theme='light']"), 'index.css must contain light theme selector');
    assert.ok(cssContent.includes("[data-mantine-color-scheme='light']"), 'index.css must contain light color scheme selector');
    assert.ok(cssContent.includes('--bg-deep-slate: #f8fafc;'), 'index.css light mode must have fallback background');
    assert.ok(cssContent.includes('--container-charcoal: #ffffff;'), 'index.css light mode must have fallback container');
  });

  test('App & useAppearance Default Theme Configuration', () => {
    const appPath = path.join(process.cwd(), 'src', 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');
    assert.ok(appContent.includes('defaultColorScheme="dark"'), 'App.tsx must set defaultColorScheme="dark" on MantineProvider');
    assert.ok(appContent.includes("import { theme } from './theme'"), 'App.tsx must import custom theme from ./theme');

    const hookPath = path.join(process.cwd(), 'src', 'hooks', 'useAppearance.ts');
    const hookContent = fs.readFileSync(hookPath, 'utf8');
    assert.ok(hookContent.includes("theme: 'dark'"), 'useAppearance.ts DEFAULT_SETTINGS theme must be dark');
  });
});
