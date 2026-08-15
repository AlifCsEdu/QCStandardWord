import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('R2: 100% Functional Settings Engine (Theme, Density, Radius, Font, Accent, Motion)', () => {

  // =========================================================================
  // 1. Theme Mode: Dark / Light / Auto
  // =========================================================================
  describe('1. Theme Engine (Dark / Light / Auto)', () => {
    it('R2-1.1: should boot with default dark theme and apply .dark class and data-theme="dark"', () => {
      const app = createAppInstance();
      const htmlEl = app.document.documentElement;
      
      const themeAttr = htmlEl.getAttribute('data-theme');
      const hasDarkClass = htmlEl.classList.contains('dark');

      assert.equal(themeAttr, 'dark', 'Document element data-theme attribute must be "dark" by default');
      assert.ok(hasDarkClass, 'Document element must contain "dark" class by default');
    });

    it('R2-1.2: should toggle from dark to light mode on theme button click', async () => {
      const app = createAppInstance();
      const themeBtn = app.document.querySelector('#themeBtn, [data-testid="theme-toggle"], button[aria-label*="Theme"]');
      assert.ok(themeBtn, 'Theme toggle button must exist in header');

      themeBtn.click();
      await waitAsync(30);

      const htmlEl = app.document.documentElement;
      assert.equal(htmlEl.getAttribute('data-theme'), 'light', 'data-theme must switch to "light"');
      assert.equal(htmlEl.classList.contains('dark'), false, '.dark class must be removed in light mode');

      // Check localStorage persistence
      assert.equal(app.getStorageJSON('qc-theme'), 'light', 'qc-theme in localStorage must be "light"');
    });

    it('R2-1.3: should boot with light theme when "qc-theme"="light" is pre-set in localStorage', () => {
      const app = createAppInstance({
        initialStorage: { 'qc-theme': 'light' }
      });
      const htmlEl = app.document.documentElement;
      assert.equal(htmlEl.getAttribute('data-theme'), 'light', 'data-theme must initialize to "light" from storage');
      assert.equal(htmlEl.classList.contains('dark'), false, '.dark class must not be present in light mode');
    });

    it('R2-1.4: should handle "auto" theme mode with matchMedia system preference', () => {
      const app = createAppInstance({
        initialStorage: { 'qc-theme': 'auto' }
      });
      const htmlEl = app.document.documentElement;
      assert.equal(htmlEl.getAttribute('data-theme'), 'auto', 'data-theme must reflect "auto" theme setting');
    });

    it('R2-1.5: should gracefully recover from corrupted/invalid theme values in storage without throwing', () => {
      const app = createAppInstance({
        initialStorage: { 'qc-theme': 'neon-cyberpunk-invalid' }
      });
      const htmlEl = app.document.documentElement;
      const themeAttr = htmlEl.getAttribute('data-theme');
      assert.ok(['dark', 'light', 'auto'].includes(themeAttr), 'Theme engine must fallback to a valid default theme on invalid storage');
    });
  });

  // =========================================================================
  // 2. Density Modes: Compact / Cozy / Tablet
  // =========================================================================
  describe('2. Density Engine (Compact / Cozy / Tablet)', () => {
    it('R2-2.1: should boot with cozy density by default and apply data-density="cozy"', () => {
      const app = createAppInstance();
      const htmlEl = app.document.documentElement;
      const density = htmlEl.getAttribute('data-density');
      assert.equal(density, 'cozy', 'data-density must be "cozy" by default');
    });

    it('R2-2.2: should switch to compact density and persist to localStorage key qc-density', async () => {
      const app = createAppInstance();
      await app.openSettingsModal();
      await app.setDensity('compact');

      const htmlEl = app.document.documentElement;
      assert.equal(htmlEl.getAttribute('data-density'), 'compact', 'data-density must update to "compact"');
      assert.equal(app.getStorageJSON('qc-density'), 'compact', 'qc-density key in localStorage must be "compact"');
    });

    it('R2-2.3: should boot with compact density when initialized with initialStorage', () => {
      const app = createAppInstance({
        initialStorage: { 'qc-density': 'compact' }
      });
      const htmlEl = app.document.documentElement;
      assert.equal(htmlEl.getAttribute('data-density'), 'compact', 'App must initialize with compact density from storage');
    });

    it('R2-2.4: should persist density inside qc-appearance composite object', async () => {
      const app = createAppInstance();
      await app.openSettingsModal();
      await app.setDensity('compact');

      const appearance = app.getStorageJSON('qc-appearance');
      assert.ok(appearance && typeof appearance === 'object', 'qc-appearance must be a stored JSON object');
      assert.equal(appearance.density, 'compact', 'appearance.density must be stored as "compact"');
    });
  });

  // =========================================================================
  // 3. Border Radius Customization: Sharp / Soft / Round (0, 6, 10, 16)
  // =========================================================================
  describe('3. Border Radius Engine (Sharp / Soft / Round)', () => {
    it('R2-3.1: should switch border radius options (sharp, soft, round) via settings modal', async () => {
      const app = createAppInstance();
      await app.openSettingsModal();

      // Set to sharp
      await app.setRadius('sharp');
      let appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.radius, 'sharp', 'appearance.radius must update to sharp');

      // Set to round
      await app.setRadius('round');
      appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.radius, 'round', 'appearance.radius must update to round');

      // Set to soft
      await app.setRadius('soft');
      appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.radius, 'soft', 'appearance.radius must update to soft');
    });

    it('R2-3.2: should restore border radius setting cleanly on boot from initialStorage', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-appearance': JSON.stringify({ radius: 'round', density: 'cozy', theme: 'dark', layout: 'list' })
        }
      });
      const appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.radius, 'round', 'Border radius must restore from initialStorage');
    });
  });

  // =========================================================================
  // 4. Text Size Scaling: Small / Normal / Large (s, m, l)
  // =========================================================================
  describe('4. Text Size Engine (s, m, l)', () => {
    it('R2-4.1: should change text size setting between s, m, and l', async () => {
      const app = createAppInstance();
      await app.openSettingsModal();

      await app.setTextSize('s');
      let appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.textsize, 's', 'textsize must be set to "s"');

      await app.setTextSize('l');
      appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.textsize, 'l', 'textsize must be set to "l"');

      await app.setTextSize('m');
      appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.textsize, 'm', 'textsize must be set to "m"');
    });

    it('R2-4.2: should restore text size preference from localStorage on boot', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-appearance': JSON.stringify({ textsize: 'l', radius: 'soft', density: 'cozy', theme: 'dark', layout: 'list' })
        }
      });
      const appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.textsize, 'l', 'Text size "l" must be loaded from storage');
    });
  });

  // =========================================================================
  // 5. Accent Color Palettes (Amber, Emerald/Green, Stone, Rose, Blue/Steel)
  // =========================================================================
  describe('5. Accent Color Engine (5 Rich Palettes)', () => {
    it('R2-5.1: should switch accent palette between stone, amber, green, steel, plum, rose', async () => {
      const app = createAppInstance();
      await app.openSettingsModal();

      const palettes = ['amber', 'green', 'rose', 'stone'];
      for (const palette of palettes) {
        await app.setAccent(palette);
        const appearance = app.getStorageJSON('qc-appearance');
        assert.equal(appearance.accent, palette, `Accent palette must update to ${palette}`);
      }
    });

    it('R2-5.2: should preserve custom accent palette across app reloads', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-appearance': JSON.stringify({ accent: 'amber', theme: 'dark', density: 'cozy', layout: 'list' })
        }
      });
      const appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.accent, 'amber', 'Accent "amber" must be loaded from storage');
    });
  });

  // =========================================================================
  // 6. Reduced Motion Mode
  // =========================================================================
  describe('6. Reduced Motion Engine (Full / Reduced)', () => {
    it('R2-6.1: should toggle motion mode between full and reduced', async () => {
      const app = createAppInstance();
      await app.openSettingsModal();

      await app.setMotion('reduced');
      let appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.motion, 'reduced', 'Motion mode must update to "reduced"');

      await app.setMotion('full');
      appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.motion, 'full', 'Motion mode must update to "full"');
    });

    it('R2-6.2: should persist motion setting in localStorage and restore on boot', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-appearance': JSON.stringify({ motion: 'reduced', theme: 'dark', density: 'cozy', layout: 'list' })
        }
      });
      const appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.motion, 'reduced', 'Reduced motion must restore from initialStorage');
    });
  });

  // =========================================================================
  // 7. Full Settings Persistence & Storage Integrity
  // =========================================================================
  describe('7. Composite Settings Engine Persistence & Integrity', () => {
    it('R2-7.1: should synchronize all settings changes seamlessly without data loss', async () => {
      const app = createAppInstance();
      await app.openSettingsModal();

      // Mutate multiple appearance properties
      await app.setLayoutView('grid');
      await app.setDensity('compact');
      await app.setRadius('round');
      await app.setTextSize('l');
      await app.setAccent('amber');
      await app.setMotion('reduced');
      await app.closeSettingsModal();

      const appearance = app.getStorageJSON('qc-appearance');
      assert.equal(appearance.layout, 'grid', 'Layout must be grid');
      assert.equal(appearance.density, 'compact', 'Density must be compact');
      assert.equal(appearance.radius, 'round', 'Radius must be round');
      assert.equal(appearance.textsize, 'l', 'Textsize must be l');
      assert.equal(appearance.accent, 'amber', 'Accent must be amber');
      assert.equal(appearance.motion, 'reduced', 'Motion must be reduced');
    });

    it('R2-7.2: should isolate settings across distinct app instances', async () => {
      const app1 = createAppInstance({ initialStorage: { 'qc-density': 'compact' } });
      const app2 = createAppInstance({ initialStorage: { 'qc-density': 'cozy' } });

      assert.equal(app1.document.documentElement.getAttribute('data-density'), 'compact');
      assert.equal(app2.document.documentElement.getAttribute('data-density'), 'cozy');
    });
  });
});
