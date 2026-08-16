import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  SESSION_GAP_MS,
  groupHistoryIntoSessions,
  formatSessionTitle,
  formatSessionSubtitle,
  formatSessionTime,
  formatSessionDate,
  formatSessionTimeRange,
  isSameCalendarDay,
  isYesterday,
  normalizeHistoryEntry,
  filterHistoryEntries,
} from '../src/utils/historySessions.ts';
import type { HistoryEntry, HistorySession, QCItem, CustomPinFolder } from '../src/types/qc.ts';
import { createAppInstance, waitAsync } from './harness.js';

describe('Milestone 2 Challenger 1 Empirical & Adversarial Stress Suite', () => {

  // =========================================================================
  // Section 1: Auto-Sessions Clustering Engine & Edge Conditions
  // =========================================================================
  describe('1. Auto-Sessions Clustering Engine Boundary & Edge Conditions', () => {

    it('1.1: exactly 30 min boundary (gap == 1,800,000 ms) clusters into the SAME session', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const t1 = now - 5 * 60 * 1000;
      const t2 = t1 - 30 * 60 * 1000; // Exactly 30 mins earlier

      const entries: HistoryEntry[] = [
        { id: 'e1', text: 'Item 1', timestamp: t1, category: 'screen', itemNumber: 101 },
        { id: 'e2', text: 'Item 2', timestamp: t2, category: 'screen', itemNumber: 102 },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 1, 'Exactly 30 min gap (1,800,000 ms) must remain in the SAME session');
      assert.equal(sessions[0].entries.length, 2);
      assert.equal(sessions[0].startTime, t2);
      assert.equal(sessions[0].endTime, t1);
    });

    it('1.2: 29 min boundary (gap == 1,740,000 ms) clusters into the SAME session', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const t1 = now - 2 * 60 * 1000;
      const t2 = t1 - 29 * 60 * 1000; // 29 minutes gap

      const entries: HistoryEntry[] = [
        { id: 'e1', text: 'Item 1', timestamp: t1 },
        { id: 'e2', text: 'Item 2', timestamp: t2 },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 1, '29 min gap must remain in the SAME session');
      assert.equal(sessions[0].entries.length, 2);
    });

    it('1.3: 30 min + 1 ms boundary (gap == 1,800,001 ms) SPLITS into separate sessions', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const t1 = now - 5 * 60 * 1000;
      const t2 = t1 - (30 * 60 * 1000 + 1); // 30 min + 1 ms

      const entries: HistoryEntry[] = [
        { id: 'e1', text: 'Item 1', timestamp: t1 },
        { id: 'e2', text: 'Item 2', timestamp: t2 },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 2, '30 min + 1 ms gap must SPLIT into 2 separate sessions');
      assert.equal(sessions[0].entries[0].id, 'e1');
      assert.equal(sessions[1].entries[0].id, 'e2');
    });

    it('1.4: crossing midnight boundary SPLITS sessions across calendar days even with small time gap', () => {
      // Midnight transition: Day 1 23:59:50 -> Day 2 00:00:10 (only 20 seconds difference)
      const day2Midnight = new Date(2026, 7, 17, 0, 0, 10).getTime();
      const day1Night = new Date(2026, 7, 16, 23, 59, 50).getTime();
      const now = day2Midnight + 60000;

      const entries: HistoryEntry[] = [
        { id: 'e_today', text: 'Day 2 Defect', timestamp: day2Midnight },
        { id: 'e_yesterday', text: 'Day 1 Defect', timestamp: day1Night },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 2, 'Must split across midnight calendar boundary');
      assert.equal(sessions[0].isCurrentSession, true);
      assert.equal(sessions[0].title, 'Current Session');
      assert.ok(sessions[1].title.startsWith('Yesterday — '), `Previous day session must be titled Yesterday, got "${sessions[1].title}"`);
    });

    it('1.5: out-of-order and shuffled timestamps are automatically sorted and clustered descendingly', () => {
      const now = new Date(2026, 7, 16, 18, 0, 0).getTime();
      const baseTimes = [
        now - 2 * 60 * 1000,    // Session A
        now - 10 * 60 * 1000,   // Session A
        now - 20 * 60 * 1000,   // Session A
        now - 80 * 60 * 1000,   // Session B
        now - 95 * 60 * 1000,   // Session B
        now - 300 * 60 * 1000,  // Session C
      ];

      // Create shuffled entries
      const entries: HistoryEntry[] = [
        { id: 'e4', text: 'Item B2', timestamp: baseTimes[4] },
        { id: 'e1', text: 'Item A2', timestamp: baseTimes[1] },
        { id: 'e5', text: 'Item C1', timestamp: baseTimes[5] },
        { id: 'e0', text: 'Item A1', timestamp: baseTimes[0] },
        { id: 'e3', text: 'Item B1', timestamp: baseTimes[3] },
        { id: 'e2', text: 'Item A3', timestamp: baseTimes[2] },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 3, 'Should group into exactly 3 sessions despite shuffled input');
      assert.equal(sessions[0].entries.length, 3, 'Session A should have 3 items');
      assert.equal(sessions[1].entries.length, 2, 'Session B should have 2 items');
      assert.equal(sessions[2].entries.length, 1, 'Session C should have 1 item');

      // Verify strict descending ordering inside sessions
      for (const sess of sessions) {
        for (let i = 0; i < sess.entries.length - 1; i++) {
          assert.ok(sess.entries[i].timestamp >= sess.entries[i + 1].timestamp, 'Session entries must be sorted descending');
        }
      }
    });

    it('1.6: duplicate timestamps are handled cleanly without infinite loops or session splits', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const sameTime = now - 5 * 60 * 1000;

      const entries: HistoryEntry[] = [
        { id: 'e1', text: 'Defect 1', timestamp: sameTime },
        { id: 'e2', text: 'Defect 2', timestamp: sameTime },
        { id: 'e3', text: 'Defect 3', timestamp: sameTime },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 1, 'Identical timestamps must cluster into 1 session');
      assert.equal(sessions[0].entries.length, 3);
      assert.equal(sessions[0].startTime, sameTime);
      assert.equal(sessions[0].endTime, sameTime);
    });

    it('1.7: empty, null, undefined, or invalid array input returns [] safely', () => {
      assert.deepEqual(groupHistoryIntoSessions([]), []);
      assert.deepEqual(groupHistoryIntoSessions(null as any), []);
      assert.deepEqual(groupHistoryIntoSessions(undefined as any), []);
      assert.deepEqual(groupHistoryIntoSessions('not an array' as any), []);
      assert.deepEqual(groupHistoryIntoSessions([null as any, undefined as any, {} as any]), []);
    });

    it('1.8: single entry history returns exactly 1 session with accurate properties', () => {
      const now = new Date(2026, 7, 16, 10, 0, 0).getTime();
      const entryTime = now - 4 * 60 * 1000;

      const singleEntry: HistoryEntry = {
        id: 'single_1',
        text: 'Screen dead pixel',
        category: 'screen',
        itemNumber: 105,
        timestamp: entryTime,
        source: 'single',
      };

      const sessions = groupHistoryIntoSessions([singleEntry], now);
      assert.equal(sessions.length, 1);
      assert.equal(sessions[0].isCurrentSession, true);
      assert.equal(sessions[0].title, 'Current Session');
      assert.equal(sessions[0].subtitle, 'Active session • 1 item');
      assert.equal(sessions[0].startTime, entryTime);
      assert.equal(sessions[0].endTime, entryTime);
      assert.equal(sessions[0].entries[0].text, 'Screen dead pixel');
    });

    it('1.9: corrupted timestamps (NaN, undefined, string) default safely to current time', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const corrupted: any[] = [
        { id: 'c1', text: 'Corrupt 1', timestamp: NaN },
        { id: 'c2', text: 'Corrupt 2', timestamp: 'not-a-number' },
        { id: 'c3', text: 'Corrupt 3', timestamp: undefined },
      ];

      const sessions = groupHistoryIntoSessions(corrupted, now);
      assert.ok(sessions.length >= 1, 'Should process entries without throwing');
      assert.equal(sessions[0].entries.length, 3);
    });

    it('1.10: dynamic titling correctly differentiates Current, Today, Yesterday, and Older dates', () => {
      const now = new Date(2026, 7, 16, 15, 0, 0).getTime(); // Aug 16, 2026 3:00 PM

      // Current Session: 10 min ago
      const currentEntry: HistoryEntry = { id: '1', text: 'Current', timestamp: now - 10 * 60 * 1000 };
      // Earlier Today: 2 hours ago
      const todayEntry: HistoryEntry = { id: '2', text: 'Today Earlier', timestamp: now - 120 * 60 * 1000 };
      // Yesterday: Aug 15, 2026 4:30 PM
      const yesterdayTime = new Date(2026, 7, 15, 16, 30, 0).getTime();
      const yesterdayEntry: HistoryEntry = { id: '3', text: 'Yesterday Item', timestamp: yesterdayTime };
      // Older Date: Aug 10, 2026 9:15 AM
      const olderTime = new Date(2026, 7, 10, 9, 15, 0).getTime();
      const olderEntry: HistoryEntry = { id: '4', text: 'Older Item', timestamp: olderTime };

      const sessions = groupHistoryIntoSessions([currentEntry, todayEntry, yesterdayEntry, olderEntry], now);
      assert.equal(sessions.length, 4);

      // Session 0: Current
      assert.equal(sessions[0].isCurrentSession, true);
      assert.equal(sessions[0].title, 'Current Session');
      assert.equal(sessions[0].subtitle, 'Active session • 1 item');

      // Session 1: Earlier Today
      assert.equal(sessions[1].isCurrentSession, false);
      assert.ok(sessions[1].title.startsWith('Session — '), `Expected "Session — HH:MM", got "${sessions[1].title}"`);
      assert.equal(sessions[1].subtitle, 'Earlier today • 1 item');

      // Session 2: Yesterday
      assert.equal(sessions[2].isCurrentSession, false);
      assert.ok(sessions[2].title.startsWith('Yesterday — '), `Expected "Yesterday — HH:MM", got "${sessions[2].title}"`);
      assert.equal(sessions[2].subtitle, 'Yesterday • 1 item');

      // Session 3: Older Date
      assert.equal(sessions[3].isCurrentSession, false);
      assert.ok(sessions[3].title.includes('Aug 10, 2026'), `Expected "Aug 10, 2026 — HH:MM", got "${sessions[3].title}"`);
      assert.equal(sessions[3].subtitle, 'Aug 10 • 1 item');
    });

    it('1.11: normalizeHistoryEntry correctly populates metadata and converts legacy strings', () => {
      const activeItems: QCItem[] = [
        { id: 'i1', n: 101, t: 'Main screen blank or no backlight', c: 'screen' },
        { id: 'i2', n: 205, t: 'Battery swollen > 2mm', c: 'battery' },
      ];

      // Legacy string
      const normFromString = normalizeHistoryEntry('Main screen blank or no backlight', activeItems);
      assert.equal(normFromString.text, 'Main screen blank or no backlight');
      assert.equal(normFromString.itemNumber, 101);
      assert.equal(normFromString.category, 'screen');
      assert.equal(normFromString.source, 'single');
      assert.ok(normFromString.id.startsWith('h_migrated_'));

      // Partial object
      const normFromObj = normalizeHistoryEntry({ text: 'Battery swollen > 2mm' }, activeItems);
      assert.equal(normFromObj.text, 'Battery swollen > 2mm');
      assert.equal(normFromObj.itemNumber, 205);
      assert.equal(normFromObj.category, 'battery');

      // Custom object with explicit category
      const customNorm = normalizeHistoryEntry({ text: 'Custom defect note', category: 'custom', itemNumber: 999 });
      assert.equal(customNorm.text, 'Custom defect note');
      assert.equal(customNorm.category, 'custom');
      assert.equal(customNorm.itemNumber, 999);
    });

    it('1.12: filterHistoryEntries filters by search query and category correctly', () => {
      const entries: HistoryEntry[] = [
        { id: '1', text: 'Main screen flickering', category: 'screen', itemNumber: 101, timestamp: 1000 },
        { id: '2', text: 'Battery draining rapidly', category: 'battery', itemNumber: 205, timestamp: 2000 },
        { id: '3', text: 'Camera blurry autofocus', category: 'camera', itemNumber: 301, timestamp: 3000 },
        { id: '4', text: 'Screen touch deadzone', category: 'screen', itemNumber: 104, timestamp: 4000 },
      ];

      // Category filter 'screen'
      const screenEntries = filterHistoryEntries(entries, '', 'screen');
      assert.equal(screenEntries.length, 2);

      // Search query 'blur'
      const cameraSearch = filterHistoryEntries(entries, 'blur', 'all');
      assert.equal(cameraSearch.length, 1);
      assert.equal(cameraSearch[0].id, '3');

      // Search query item number '205' and '#205'
      const numSearch1 = filterHistoryEntries(entries, '205', 'all');
      assert.equal(numSearch1.length, 1);
      assert.equal(numSearch1[0].id, '2');

      const numSearch2 = filterHistoryEntries(entries, '#205', 'all');
      assert.equal(numSearch2.length, 1);
      assert.equal(numSearch2[0].id, '2');

      // Combined search + category filter
      const screenSearch = filterHistoryEntries(entries, 'flickering', 'screen');
      assert.equal(screenSearch.length, 1);
      assert.equal(screenSearch[0].id, '1');

      const noMatch = filterHistoryEntries(entries, 'flickering', 'battery');
      assert.equal(noMatch.length, 0);
    });

  });

  // =========================================================================
  // Section 2: Session Bulk Actions (Copy All in Session, Add Session to Batch)
  // =========================================================================
  describe('2. Session Bulk Actions & State Synchronization', () => {

    it('2.1: "Copy All in Session" formats all session texts with newline separation', async () => {
      const now = Date.now();
      const testEntries: HistoryEntry[] = [
        { id: 'h1', text: 'Defect 1: Screen glass shattered', category: 'screen', itemNumber: 101, timestamp: now - 1000 },
        { id: 'h2', text: 'Defect 2: Battery swollen', category: 'battery', itemNumber: 201, timestamp: now - 2000 },
        { id: 'h3', text: 'Defect 3: Camera focus error', category: 'camera', itemNumber: 301, timestamp: now - 3000 },
      ];

      const initialStorage = {
        'qc-history-entries': JSON.stringify(testEntries),
      };

      const app = createAppInstance({ initialStorage });
      await app.openHistoryDrawer();
      await waitAsync(40);

      const historyDrawer = app.getHistoryDrawer();
      assert.ok(historyDrawer, 'History drawer must be rendered');

      // Find "Copy All" button in session group
      const copyAllBtn = historyDrawer.querySelector('[data-testid="copy-session-btn"]') as HTMLElement;
      assert.ok(copyAllBtn, 'Copy All button must exist in session card');

      app.resetCopiedText();
      copyAllBtn.click();
      await waitAsync(50);

      // Verify copied text contains all 3 entries joined with \n
      const expectedText = 'Defect 1: Screen glass shattered\nDefect 2: Battery swollen\nDefect 3: Camera focus error';
      assert.equal(app.getCopiedText(), expectedText, 'Copy All must copy newline-joined defect texts of the session');

      // Verify button feedback state changes to "Copied!"
      assert.ok(copyAllBtn.textContent?.includes('Copied!'), 'Copy All button should show "Copied!" feedback');

      // Wait for feedback timer
      await waitAsync(1300);
      assert.ok(copyAllBtn.textContent?.includes('Copy All'), 'Copy All button text should revert back');
    });

    it('2.2: "Add Session to Batch Queue" appends session items to batch without wiping existing batch items', async () => {
      const now = Date.now();
      const existingBatch = ['Existing Batch Defect A', 'Existing Batch Defect B'];
      const sessionEntries: HistoryEntry[] = [
        { id: 'h1', text: 'Session Defect 1', category: 'screen', itemNumber: 101, timestamp: now - 1000 },
        { id: 'h2', text: 'Session Defect 2', category: 'screen', itemNumber: 102, timestamp: now - 2000 },
      ];

      const initialStorage = {
        'qc-batch': JSON.stringify(existingBatch),
        'qc-history-entries': JSON.stringify(sessionEntries),
      };

      const app = createAppInstance({ initialStorage });
      assert.equal(app.getBatchCount(), 2, 'Initial batch count should be 2');

      await app.openHistoryDrawer();
      await waitAsync(40);

      const historyDrawer = app.getHistoryDrawer();
      const addBatchBtn = historyDrawer?.querySelector('[data-testid="add-session-batch-btn"]') as HTMLElement;
      assert.ok(addBatchBtn, '+ Batch button must exist in session card');

      addBatchBtn.click();
      await waitAsync(50);

      // Verify batch count increased from 2 to 4
      assert.equal(app.getBatchCount(), 4, 'Batch count must increase by 2 to 4');

      // Verify LocalStorage qc-batch state
      const updatedBatchStorage = app.getStorageJSON('qc-batch');
      assert.deepEqual(
        updatedBatchStorage,
        ['Existing Batch Defect A', 'Existing Batch Defect B', 'Session Defect 1', 'Session Defect 2'],
        'LocalStorage qc-batch must contain appended items in order'
      );
    });

    it('2.3: "Add All to Batch" from History Drawer header adds all filtered items to batch queue', async () => {
      const now = Date.now();
      const entries: HistoryEntry[] = [
        { id: 'h1', text: 'Defect 1', category: 'screen', timestamp: now - 1000 },
        { id: 'h2', text: 'Defect 2', category: 'battery', timestamp: now - 2000 },
        { id: 'h3', text: 'Defect 3', category: 'screen', timestamp: now - 3000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(entries),
          'qc-batch': '[]',
        },
      });

      await app.openHistoryDrawer();
      await waitAsync(40);

      // Filter by 'screen' category chip in drawer
      const screenChip = app.document.querySelector('[data-testid="history-cat-chip-screen"]') as HTMLElement;
      assert.ok(screenChip, 'Screen category chip must exist in history drawer');
      screenChip.click();
      await waitAsync(30);

      // Click header "Add All to Batch"
      const addAllBtn = app.document.querySelector('[data-testid="history-add-all-batch"]') as HTMLElement;
      assert.ok(addAllBtn, 'Add All to Batch header button must exist');
      addAllBtn.click();
      await waitAsync(50);

      // Should add 2 screen items (not the battery item)
      assert.equal(app.getBatchCount(), 2, 'Only filtered (screen) items should be added to batch queue');
      const batchStorage = app.getStorageJSON('qc-batch');
      assert.deepEqual(batchStorage, ['Defect 1', 'Defect 3']);
    });

    it('2.4: 1-click re-copy per history entry copies item text and triggers toast/feedback', async () => {
      const now = Date.now();
      const entries: HistoryEntry[] = [
        { id: 'h1', text: 'Unique Re-Copy Defect Item', category: 'locks', timestamp: now - 5000 },
      ];

      const app = createAppInstance({
        initialStorage: { 'qc-history-entries': JSON.stringify(entries) },
      });

      await app.openHistoryDrawer();
      await waitAsync(40);

      const copyItemBtn = app.document.querySelector('[data-testid="history-entry"] button[data-act="copy"]') as HTMLElement;
      assert.ok(copyItemBtn, 'Re-copy button on history item must exist');

      app.resetCopiedText();
      copyItemBtn.click();
      await waitAsync(50);

      assert.equal(app.getCopiedText(), 'Unique Re-Copy Defect Item', 'Must copy single item text');
      assert.ok(copyItemBtn.textContent?.includes('Copied!'), 'Item copy button should display Copied! feedback');
    });

    it('2.5: clear history action requires confirmation dialog and wipes storage synchronously', async () => {
      const entries: HistoryEntry[] = [
        { id: 'h1', text: 'Defect to clear 1', timestamp: Date.now() - 1000 },
        { id: 'h2', text: 'Defect to clear 2', timestamp: Date.now() - 2000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(entries),
          'qc-recents': JSON.stringify(['Defect to clear 1', 'Defect to clear 2']),
          'qc-history': JSON.stringify(['Defect to clear 1', 'Defect to clear 2']),
        },
      });

      await app.openHistoryDrawer();
      await waitAsync(40);

      const clearBtn = app.document.querySelector('[data-testid="clear-history-btn"]') as HTMLElement;
      assert.ok(clearBtn, 'Clear history button must exist');

      // Click clear button opens confirmation dialog
      clearBtn.click();
      await waitAsync(40);

      const confirmBtn = app.document.querySelector('[data-testid="confirm-clear-history-btn"]') as HTMLElement;
      assert.ok(confirmBtn, 'Confirmation dialog button must appear');

      // Click confirm clear
      confirmBtn.click();
      await waitAsync(50);

      // Verify all history storage keys cleared
      assert.deepEqual(app.getStorageJSON('qc-history-entries'), []);
      assert.deepEqual(app.getStorageJSON('qc-recents'), []);
      assert.deepEqual(app.getStorageJSON('qc-history'), []);
    });

  });

  // =========================================================================
  // Section 3: End-to-End JSDOM Workflow & UI Accent Flow Integration
  // =========================================================================
  describe('3. End-to-End Auto-Sessions Integration & Category Accent Flow', () => {

    it('3.1: copying defect cards from main view automatically enriches and clusters into History Drawer auto-sessions', async () => {
      const app = createAppInstance();
      await app.setLayoutView('list');
      await waitAsync(30);

      // Copy 2 defects from defect list
      const rows = app.document.querySelectorAll('#listwrap .row');
      assert.ok(rows.length >= 2, 'At least 2 rows exist in main view');

      const item1Text = (rows[0] as HTMLElement).textContent || '';
      const item2Text = (rows[1] as HTMLElement).textContent || '';

      (rows[0] as HTMLElement).click();
      await waitAsync(50);
      (rows[1] as HTMLElement).click();
      await waitAsync(50);

      // Open history drawer
      await app.openHistoryDrawer();
      await waitAsync(50);

      const historyEntries = app.getHistoryEntries();
      assert.ok(historyEntries.length >= 2, 'History drawer should display copied items');

      // Verify session group rendered
      const sessionCards = app.document.querySelectorAll('[data-testid="history-session-group"]');
      assert.ok(sessionCards.length >= 1, 'At least 1 session group card rendered');

      const firstSession = sessionCards[0] as HTMLElement;
      assert.ok(firstSession.textContent?.includes('Current Session'), 'Should be titled Current Session');
    });

    it('3.2: history items render category pill badges and left accent border styles correctly', async () => {
      const now = Date.now();
      const entries: HistoryEntry[] = [
        { id: 'h1', text: 'Battery issue', category: 'battery', itemNumber: 201, timestamp: now - 1000 },
        { id: 'h2', text: 'Screen issue', category: 'screen', itemNumber: 101, timestamp: now - 2000 },
      ];

      const app = createAppInstance({
        initialStorage: { 'qc-history-entries': JSON.stringify(entries) },
      });

      await app.openHistoryDrawer();
      await waitAsync(40);

      const renderedEntries = app.document.querySelectorAll('[data-testid="history-entry"]');
      assert.equal(renderedEntries.length, 2);

      // Verify category left borders
      const firstEntryStyle = (renderedEntries[0] as HTMLElement).getAttribute('style') || '';
      assert.ok(firstEntryStyle.includes('border-left-color'), 'History entry must have border-left-color inline style');

      // Verify category pill badges
      const badgePill = renderedEntries[0].querySelector('.rpill') as HTMLElement;
      assert.ok(badgePill, 'Category pill badge must exist on history item');
      assert.equal(badgePill.textContent?.trim().toLowerCase(), 'battery');
    });

    it('3.3: in-drawer live search updates filtered count and session grouping in real time', async () => {
      const now = Date.now();
      const entries: HistoryEntry[] = [
        { id: 'h1', text: 'Apple iPhone Screen crack', category: 'screen', itemNumber: 101, timestamp: now - 1000 },
        { id: 'h2', text: 'Samsung Galaxy Battery bulge', category: 'battery', itemNumber: 201, timestamp: now - 2000 },
        { id: 'h3', text: 'Google Pixel Camera scratch', category: 'camera', itemNumber: 301, timestamp: now - 3000 },
      ];

      const app = createAppInstance({
        initialStorage: { 'qc-history-entries': JSON.stringify(entries) },
      });

      await app.openHistoryDrawer();
      await waitAsync(40);

      const searchInput = app.document.querySelector('[data-testid="history-search-input"]') as HTMLInputElement;
      assert.ok(searchInput, 'History search input must exist');

      // Search for 'Galaxy'
      const nativeSetter = Object.getOwnPropertyDescriptor(app.window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(searchInput, 'Galaxy');
      searchInput.dispatchEvent(new app.window.Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new app.window.Event('change', { bubbles: true }));
      await waitAsync(40);

      const visibleEntries = app.document.querySelectorAll('[data-testid="history-entry"]');
      assert.equal(visibleEntries.length, 1, 'Only 1 entry should match "Galaxy" search');
      assert.ok((visibleEntries[0] as HTMLElement).textContent?.includes('Samsung Galaxy Battery bulge'));
    });

  });

});
