import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';

describe('Milestone 3: Custom Pin Folders & State Layer Overhaul', () => {
  describe('CustomPinFolder Schema & Auto-Migration', () => {
    it('should auto-migrate legacy qc-pins into default "Starred Defects" folder when qc-pin-folders is empty', () => {
      const legacyPins = [101, 102, 'c_custom_1'];
      const app = createAppInstance({
        initialStorage: {
          'qc-pins': JSON.stringify(legacyPins),
        },
      });

      const rawFolders = app.window.localStorage.getItem('qc-pin-folders');
      assert.ok(rawFolders, 'qc-pin-folders should be saved to localStorage');
      
      const folders = JSON.parse(rawFolders);
      assert.equal(folders.length, 1, 'Should have auto-created 1 default folder');
      assert.equal(folders[0].name, 'Starred Defects');
      assert.equal(folders[0].color, '#78716c');
      assert.deepEqual(folders[0].itemIds, legacyPins);
      assert.ok(folders[0].createdAt > 0, 'createdAt timestamp should be set');
    });

    it('should load existing qc-pin-folders when present without overwriting', () => {
      const existingFolders = [
        { id: 'f_custom_1', name: 'Screen Inspection', color: '#3b82f6', itemIds: [101, 103], createdAt: 1600000000000 },
        { id: 'f_custom_2', name: 'Camera Issues', color: '#ef4444', itemIds: [201], createdAt: 1600000001000 },
      ];
      const app = createAppInstance({
        initialStorage: {
          'qc-pin-folders': JSON.stringify(existingFolders),
        },
      });

      const rawFolders = app.window.localStorage.getItem('qc-pin-folders');
      assert.ok(rawFolders, 'qc-pin-folders should exist');
      const folders = JSON.parse(rawFolders);
      assert.equal(folders.length, 2, 'Should keep both existing folders');
      assert.equal(folders[0].name, 'Screen Inspection');
      assert.equal(folders[1].name, 'Camera Issues');
    });

    it('should preserve all 14 localStorage keys in storage layer', () => {
      const app = createAppInstance();
      const storageKeys = [
        'qc-pins',
        'qc-pin-folders',
        'qc-recents',
        'qc-history',
        'qc-batch',
        'qc-join',
        'qc-autoclear',
        'qc-edits',
        'qc-dels',
        'qc-custom',
        'qc-appearance',
        'qc-theme',
        'qc-density',
        'qc-sort',
      ];

      const { window } = app;
      assert.ok(window.localStorage, 'localStorage should be available');
      
      for (const key of storageKeys) {
        assert.doesNotThrow(() => window.localStorage.getItem(key), `Accessing key ${key} should not throw`);
      }
    });
  });

  describe('Appearance Hook & Theme Attribute Management', () => {
    it('should toggle dark class and set data-theme attribute on documentElement', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-theme': 'dark',
        },
      });
      const root = app.document.documentElement;

      assert.equal(root.getAttribute('data-theme'), 'dark', 'data-theme should be dark');
      assert.ok(root.classList.contains('dark'), 'classList should contain dark');
      assert.equal(
        root.getAttribute('data-mantine-color-scheme'),
        null,
        'data-mantine-color-scheme should NOT exist'
      );
    });

    it('should set light theme without dark class when qc-theme is light', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-theme': 'light',
        },
      });
      const root = app.document.documentElement;

      assert.equal(root.getAttribute('data-theme'), 'light', 'data-theme should be light');
      assert.equal(root.classList.contains('dark'), false, 'classList should NOT contain dark');
      assert.equal(
        root.getAttribute('data-mantine-color-scheme'),
        null,
        'data-mantine-color-scheme should NOT exist'
      );
    });
  });
});
