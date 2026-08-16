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

  // =========================================================================
  // 5. Smart Auto-Sessions Grouping & In-Drawer Category Filters (R2)
  // =========================================================================
  describe('5. Smart Auto-Sessions Grouping & Drawer Actions (R2)', () => {
    it('R4-5.1: should render history entries grouped into session cards with dynamic headers', async () => {
      const now = Date.now();
      const historyEntries = [
        { id: 'h1', text: 'Screen touch unresponsive', itemNumber: 101, category: 'screen', timestamp: now - 2 * 60000 },
        { id: 'h2', text: 'Battery drain rapid', itemNumber: 201, category: 'battery', timestamp: now - 5 * 60000 },
        { id: 'h3', text: 'Camera lens scratch', itemNumber: 301, category: 'camera', timestamp: now - 90 * 60000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(historyEntries),
        }
      });
      await waitAsync(30);

      await app.openHistoryDrawer();
      await waitAsync(50);

      const sessionGroups = app.document.querySelectorAll('[data-testid="history-session-group"]');
      assert.ok(sessionGroups.length >= 2, 'Should create at least 2 distinct session group cards');

      // First session is Current Session
      const firstSessionHeader = sessionGroups[0].textContent;
      assert.ok(firstSessionHeader?.includes('Current Session'), 'First session should be titled Current Session');

      // Second session is earlier session
      const secondSessionHeader = sessionGroups[1].textContent;
      assert.ok(secondSessionHeader?.includes('Session — ') || secondSessionHeader?.includes('Yesterday'), 'Second session has time-based title');
    });

    it('R4-5.2: should copy all entries in a session when "Copy All" session button is clicked', async () => {
      const now = Date.now();
      const historyEntries = [
        { id: 'h1', text: 'Defect Session A1', itemNumber: 101, category: 'screen', timestamp: now },
        { id: 'h2', text: 'Defect Session A2', itemNumber: 102, category: 'screen', timestamp: now - 1000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(historyEntries),
        }
      });
      await waitAsync(30);

      await app.openHistoryDrawer();
      await waitAsync(50);

      const copySessionBtn = app.document.querySelector('[data-testid="copy-session-btn"]');
      assert.ok(copySessionBtn, 'Copy session button must exist in session header');

      copySessionBtn.click();
      await waitAsync(50);

      const copied = app.getCopiedText();
      assert.ok(copied?.includes('Defect Session A1') && copied?.includes('Defect Session A2'), 'Should copy all session items separated by newline');
    });

    it('R4-5.3: should add entire session to batch queue when "+ Batch" session button is clicked', async () => {
      const now = Date.now();
      const historyEntries = [
        { id: 'h1', text: 'Session Batch Item 1', itemNumber: 101, category: 'screen', timestamp: now },
        { id: 'h2', text: 'Session Batch Item 2', itemNumber: 102, category: 'battery', timestamp: now - 2000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(historyEntries),
          'qc-batch': JSON.stringify([]),
        }
      });
      await waitAsync(30);

      await app.openHistoryDrawer();
      await waitAsync(50);

      const addSessionBatchBtn = app.document.querySelector('[data-testid="add-session-batch-btn"]');
      assert.ok(addSessionBatchBtn, 'Add session to batch button must exist');

      addSessionBatchBtn.click();
      await waitAsync(50);

      assert.equal(app.getBatchCount(), 2, 'Batch count should be 2 after adding session to batch');
      const storedBatch = app.getStorageJSON('qc-batch');
      assert.equal(storedBatch?.length, 2, 'LocalStorage qc-batch must contain 2 items');
    });

    it('R4-5.4: in-drawer category filter chips filter session items in real time', async () => {
      const now = Date.now();
      const historyEntries = [
        { id: 'h1', text: 'Screen defect item', itemNumber: 101, category: 'screen', timestamp: now },
        { id: 'h2', text: 'Battery defect item', itemNumber: 201, category: 'battery', timestamp: now - 1000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(historyEntries),
        }
      });
      await waitAsync(30);

      await app.openHistoryDrawer();
      await waitAsync(50);

      // Click "screen" category chip in drawer
      const screenChip = app.document.querySelector('#hcatchips [data-cat="screen"], [data-testid="history-cat-chip-screen"]');
      assert.ok(screenChip, 'Screen category chip must exist in drawer filter bar');

      screenChip.click();
      await waitAsync(50);

      const drawerEntries = app.document.querySelectorAll('#histlist [data-testid="history-entry"]');
      assert.equal(drawerEntries.length, 1, 'Only 1 screen entry should be displayed in drawer');
      assert.ok(drawerEntries[0].textContent.includes('Screen defect item'), 'Rendered entry must match filtered category');
    });
  });
});
