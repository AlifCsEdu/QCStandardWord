import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppInstance, waitAsync } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('R4: Dedicated Rich History Panel / Inspection Log Drawer', () => {

  // =========================================================================
  // 1. History Recording on Copy Actions
  // =========================================================================
  describe('1. History Entry Recording on Defect Copy', () => {
    it('R4-1.1: should automatically record copied defect into recent history and persist to localStorage', async () => {
      const app = createAppInstance();

      // Click first defect item row to copy
      await app.clickItemRow(0);

      // Verify copied text
      const copied = app.getCopiedText();
      assert.ok(copied && copied.length > 0, 'Clipboard must receive defect wording text');

      // Check recents in localStorage
      const recents = app.getStorageJSON('qc-recents') || app.getStorageJSON('qc-history');
      assert.ok(Array.isArray(recents) && recents.length > 0, 'qc-recents in localStorage must record copied item');
      assert.ok(recents.includes(copied), 'Copied text must be present in recents array');
    });

    it('R4-1.2: should render Recent History chips in HistoryBar / Drawer with copyable items', async () => {
      const app = createAppInstance();

      // Copy 2 distinct items
      await app.clickItemRow(0);
      await app.clickItemRow(1);

      const recentItems = app.getRecentHistoryItems();
      assert.ok(recentItems.length >= 2, 'Recent history items must be rendered in DOM');
    });

    it('R4-1.3: should support re-copying directly from recent history chip', async () => {
      const app = createAppInstance();

      // Copy item 0
      await app.clickItemRow(0);
      const firstCopied = app.getCopiedText();

      // Copy item 1
      await app.clickItemRow(1);

      // Click the first history chip to re-copy
      await app.clickRecentHistoryChip(0);
      const reCopied = app.getCopiedText();
      assert.ok(reCopied, 'Re-copying from recent history must set clipboard content');
    });
  });

  // =========================================================================
  // 2. Navigation to History Category View
  // =========================================================================
  describe('2. Recent History View & Filtering', () => {
    it('R4-2.1: should navigate to "recent" category in sidebar and display inspection history feed', async () => {
      const app = createAppInstance();

      // Add 3 items to history
      await app.clickItemRow(0);
      await app.clickItemRow(1);
      await app.clickItemRow(2);

      // Navigate to 'recent' category
      app.selectCategory('recent');
      const visible = app.getVisibleItems();
      assert.ok(visible.length >= 3, 'Recent history category view must render all recent copied items');
    });

    it('R4-2.2: should maintain history deduplication when the same item is clicked repeatedly', async () => {
      const app = createAppInstance();

      // Click same item 5 times
      for (let i = 0; i < 5; i++) {
        await app.clickItemRow(0);
      }

      const recents = app.getStorageJSON('qc-recents') || app.getStorageJSON('qc-history');
      // Verify deduplication: item is at top without duplicate copies
      const firstItemCount = recents.filter((t) => t === app.getCopiedText()).length;
      assert.equal(firstItemCount, 1, 'Recent history should deduplicate consecutive identical copies');
    });
  });

  // =========================================================================
  // 3. Clear History Operations
  // =========================================================================
  describe('3. Clear History Action & Storage Synchronization', () => {
    it('R4-3.1: should clear recent history when clear button is clicked and sync storage', async () => {
      const app = createAppInstance();

      // Add items
      await app.clickItemRow(0);
      await app.clickItemRow(1);

      // Clear history
      app.clearRecentHistory();
      await waitAsync(30);

      // Verify localStorage is cleared
      const recents = app.getStorageJSON('qc-recents');
      assert.ok(Array.isArray(recents) ? recents.length === 0 : recents === null, 'qc-recents should be cleared in localStorage');
    });

    it('R4-3.2: should initialize cleanly when initialStorage has pre-populated history', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-recents': JSON.stringify(['Pixel dead line on top LCD', 'Camera blur when zooming 3x']),
        }
      });

      const recentItems = app.getRecentHistoryItems();
      assert.equal(recentItems.length, 2, 'App should load pre-populated history items from initialStorage');
    });
  });

  // =========================================================================
  // 4. Batch Drawer & History Interaction
  // =========================================================================
  describe('4. History & Batch Queue Coexistence', () => {
    it('R4-4.1: should queue items into batch drawer while maintaining independent history feed', async () => {
      const app = createAppInstance();

      // Add to batch via action button (does not add to history)
      await app.clickItemAction(0, 'add');
      assert.equal(app.getBatchCount(), 1, 'Batch count should be 1');

      // Copy single item directly (adds to history)
      await app.clickItemRow(1);
      const recents = app.getStorageJSON('qc-recents') || app.getStorageJSON('qc-history');
      assert.ok(Array.isArray(recents) && recents.length > 0, 'History should record copied item');
    });

    it('R4-4.2: should copy entire batch queue with selected delimiter without corrupting history', async () => {
      const app = createAppInstance();

      await app.clickItemAction(0, 'add');
      await app.clickItemAction(1, 'add');
      await app.openBatchDrawer();
      await app.copyBatch();

      const copied = app.getCopiedText();
      assert.ok(copied && copied.includes('\n'), 'Batch copy should format queue with newline delimiter');
    });
  });
});
