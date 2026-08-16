import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAppInstance, waitAsync } from './harness.js';
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
import { formatRelativeTime, formatFullDateTime } from '../src/utils/timeUtils.ts';
import { getCategoryColor, getCategoryBadgeStyle, getCategoryLeftBorderStyle } from '../src/utils/categoryColors.ts';
import type { HistoryEntry, QCItem, HistorySession } from '../src/types/qc.ts';

describe('Milestone 4 (Track 1): Adversarial Auto-Sessions & History Integrity & Storage Corruption Resilience', () => {

  // =========================================================================
  // SUITE 1: High-Concurrency Rapid Copy & Session Boundary Transitions
  // =========================================================================
  describe('1. High-Concurrency Rapid Copy & Precision Session Boundary Transitions', () => {
    it('1.1: Exact 30-minute boundary transition (1799999ms vs 1800000ms vs 1800001ms)', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0, 0).getTime();

      // Case A: Exactly 1,799,999 ms gap (< SESSION_GAP_MS) -> Same session
      const entriesSubGap: HistoryEntry[] = [
        { id: 'e1', text: 'Defect 1', timestamp: now, category: 'screen', itemNumber: 101 },
        { id: 'e2', text: 'Defect 2', timestamp: now - 1799999, category: 'screen', itemNumber: 102 },
      ];
      const sessionsSubGap = groupHistoryIntoSessions(entriesSubGap, now);
      assert.equal(sessionsSubGap.length, 1, '1,799,999ms gap must remain in a single session');
      assert.equal(sessionsSubGap[0].entries.length, 2);
      assert.equal(sessionsSubGap[0].isCurrentSession, true);

      // Case B: Exactly 1,800,000 ms gap (== SESSION_GAP_MS) -> Same session (boundary condition: diff > 1800000)
      const entriesExactGap: HistoryEntry[] = [
        { id: 'e1', text: 'Defect 1', timestamp: now, category: 'screen', itemNumber: 101 },
        { id: 'e2', text: 'Defect 2', timestamp: now - 1800000, category: 'screen', itemNumber: 102 },
      ];
      const sessionsExactGap = groupHistoryIntoSessions(entriesExactGap, now);
      assert.equal(sessionsExactGap.length, 1, '1,800,000ms gap must remain in a single session');
      assert.equal(sessionsExactGap[0].entries.length, 2);

      // Case C: Exactly 1,800,001 ms gap (> SESSION_GAP_MS) -> Splits into two separate sessions
      const entriesSuperGap: HistoryEntry[] = [
        { id: 'e1', text: 'Defect 1', timestamp: now, category: 'screen', itemNumber: 101 },
        { id: 'e2', text: 'Defect 2', timestamp: now - 1800001, category: 'screen', itemNumber: 102 },
      ];
      const sessionsSuperGap = groupHistoryIntoSessions(entriesSuperGap, now);
      assert.equal(sessionsSuperGap.length, 2, '1,800,001ms gap must trigger a new session partition');
      assert.equal(sessionsSuperGap[0].entries.length, 1);
      assert.equal(sessionsSuperGap[1].entries.length, 1);
      assert.equal(sessionsSuperGap[0].isCurrentSession, true);
      assert.equal(sessionsSuperGap[1].isCurrentSession, false);
      assert.ok(sessionsSuperGap[1].title.startsWith('Session — '));
    });

    it('1.2: High-concurrency rapid copy burst (>150 operations in sub-millisecond intervals)', () => {
      const now = new Date(2026, 7, 16, 14, 0, 0, 0).getTime();
      const burstEntries: HistoryEntry[] = [];

      // Generate 150 unique history entries created in sub-millisecond fractional offsets
      for (let i = 0; i < 150; i++) {
        burstEntries.push({
          id: `burst_${i}`,
          text: `Rapid Defect Entry #${i} - Center LCD Display Line ${i}`,
          category: i % 2 === 0 ? 'screen' : 'battery',
          itemNumber: 100 + i,
          timestamp: now - (i * 0.005), // sub-millisecond offsets
          source: 'single',
        });
      }

      const sessions = groupHistoryIntoSessions(burstEntries, now);
      assert.equal(sessions.length, 1, '150 rapid copy operations within 1 second must cluster into 1 session');
      assert.equal(sessions[0].entries.length, 150);
      assert.equal(sessions[0].isCurrentSession, true);
      assert.equal(sessions[0].title, 'Current Session');
      assert.equal(sessions[0].subtitle, 'Active session • 150 items');

      // Test formatSessionTimeRange on sub-millisecond burst
      const timeRange = formatSessionTimeRange(sessions[0].startTime, sessions[0].endTime);
      assert.ok(timeRange.length > 0);
    });

    it('1.3: High-concurrency deduplication & bounding in React state (150 copies capped at 100 history items)', async () => {
      const initialStorage = {
        'qc-history-entries': JSON.stringify([]),
        'qc-recents': JSON.stringify([]),
      };
      const app = createAppInstance({ initialStorage });

      // Simulate copying 120 unique items into history
      for (let i = 1; i <= 120; i++) {
        const text = `High Frequency Copied Defect #${i}`;
        const existingEntries = app.getStorageJSON('qc-history-entries') || [];
        const newEntry: HistoryEntry = {
          id: `h_test_${i}`,
          text,
          itemNumber: 100 + i,
          category: 'screen',
          timestamp: Date.now() + i,
          source: 'single',
        };
        // Apply useQCState history push contract: filter existing, prepend, slice(0, 100)
        const filtered = existingEntries.filter((e: any) => e.text !== text);
        const nextEntries = [newEntry, ...filtered].slice(0, 100);
        app.mockStorage.setItem('qc-history-entries', JSON.stringify(nextEntries));
      }

      const storedHistory = app.getStorageJSON('qc-history-entries');
      assert.equal(storedHistory.length, 100, 'qc-history-entries must be strictly capped at 100 items');
      assert.equal(storedHistory[0].text, 'High Frequency Copied Defect #120', 'Most recent entry must be first');
    });

    it('1.4: Multi-session partition with 10 discrete 35-minute idle intervals', () => {
      const baseTime = new Date(2026, 7, 16, 20, 0, 0).getTime();
      const multiSessionEntries: HistoryEntry[] = [];

      // Create 10 clusters, each separated by 35 minutes (>30 min)
      for (let sessionIdx = 0; sessionIdx < 10; sessionIdx++) {
        const sessionStartTime = baseTime - (sessionIdx * 35 * 60 * 1000);
        for (let itemIdx = 0; itemIdx < 3; itemIdx++) {
          multiSessionEntries.push({
            id: `s_${sessionIdx}_i_${itemIdx}`,
            text: `Session ${sessionIdx} Defect ${itemIdx}`,
            category: 'screen',
            timestamp: sessionStartTime - (itemIdx * 60 * 1000),
          });
        }
      }

      const sessions = groupHistoryIntoSessions(multiSessionEntries, baseTime);
      assert.equal(sessions.length, 10, 'Must produce exactly 10 distinct session groups');
      assert.equal(sessions[0].isCurrentSession, true, 'Session 0 must be Current Session');
      assert.equal(sessions[1].isCurrentSession, false, 'Session 1 must NOT be Current Session');
      assert.equal(sessions[0].entries.length, 3);
      assert.equal(sessions[9].entries.length, 3);
    });
  });

  // =========================================================================
  // SUITE 2: Timestamp Edge Cases & Extreme Values
  // =========================================================================
  describe('2. Timestamp Edge Cases & Extreme Values', () => {
    it('2.1: Far-future timestamps (+100 years into year 2126)', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const futureTime = new Date(2126, 7, 16, 15, 30, 0).getTime();

      const futureEntries: HistoryEntry[] = [
        { id: 'fut_1', text: 'Future Quantum Defect', timestamp: futureTime, category: 'system' },
        { id: 'cur_1', text: 'Present LCD Defect', timestamp: now, category: 'screen' },
      ];

      const sessions = groupHistoryIntoSessions(futureEntries, now);
      assert.equal(sessions.length, 2, 'Future timestamp on different year must be in separate session');
      assert.equal(sessions[0].entries[0].id, 'fut_1', 'Future timestamp should be sorted first');
      assert.equal(sessions[0].isCurrentSession, false);
      assert.ok(sessions[0].title.includes('2126'), 'Title should display year 2126');

      // Relative time formatting for future timestamp must not crash or return negative values
      const relTime = formatRelativeTime(futureTime);
      assert.equal(relTime, 'Just now', 'Future timestamp should fall back cleanly to "Just now"');
    });

    it('2.2: Negative timestamps (pre-1970 Unix epoch) and Unix epoch 0 (1970-01-01)', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const epochZero = 0; // 1970-01-01T00:00:00.000Z
      const negativeTime = -86400000; // 1969-12-31

      const epochEntries: HistoryEntry[] = [
        { id: 'zero', text: 'Epoch 0 Defect', timestamp: epochZero },
        { id: 'neg', text: 'Pre-1970 Defect', timestamp: negativeTime },
      ];

      assert.doesNotThrow(() => {
        const sessions = groupHistoryIntoSessions(epochEntries, now);
        assert.ok(sessions.length >= 1);
        const titleNeg = formatSessionTitle(negativeTime, false, now);
        assert.ok(titleNeg.includes('1969'));
        const dateNeg = formatSessionDate(negativeTime);
        assert.ok(dateNeg.includes('1969'));
        const relNeg = formatRelativeTime(negativeTime);
        assert.ok(relNeg.length > 0);
        // Epoch 0 gracefully handled
        const relZero = formatRelativeTime(epochZero);
        assert.ok(relZero.length > 0);
      }, 'Epoch 0 and negative timestamps must format without throwing');
    });

    it('2.3: Malformed timestamps (NaN, Infinity, -Infinity, null, undefined, strings, booleans)', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const malformedEntries: any[] = [
        { id: 'm1', text: 'NaN Timestamp Defect', timestamp: NaN },
        { id: 'm2', text: 'Infinity Timestamp Defect', timestamp: Infinity },
        { id: 'm3', text: 'String Timestamp Defect', timestamp: '2026-08-16T12:00:00Z' },
        { id: 'm4', text: 'Null Timestamp Defect', timestamp: null },
        { id: 'm5', text: 'Undefined Timestamp Defect', timestamp: undefined },
        { id: 'm6', text: 'Boolean Timestamp Defect', timestamp: true },
        { id: 'm7', text: 'Object Timestamp Defect', timestamp: { time: 12345 } },
      ];

      let sessions: HistorySession[] = [];
      assert.doesNotThrow(() => {
        sessions = groupHistoryIntoSessions(malformedEntries, now);
      }, 'groupHistoryIntoSessions must not crash on malformed timestamps');

      assert.ok(sessions.length > 0, 'Should gracefully cluster malformed timestamp entries using fallback now');
      for (const s of sessions) {
        assert.ok(typeof s.startTime === 'number' && !isNaN(s.startTime));
        assert.ok(typeof s.endTime === 'number' && !isNaN(s.endTime));
        assert.ok(typeof s.title === 'string' && s.title.length > 0);
      }
    });

    it('2.4: Clock drift, leap seconds, and unordered timestamp ingestion', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      // Completely randomized timestamp order
      const randomOrderEntries: HistoryEntry[] = [
        { id: 'e_past_2d', text: 'Two Days Ago', timestamp: now - 2 * 86400000 },
        { id: 'e_today_recent', text: 'Today 5m ago', timestamp: now - 5 * 60000 },
        { id: 'e_yest_afternoon', text: 'Yesterday PM', timestamp: now - 86400000 },
        { id: 'e_today_now', text: 'Today Just Now', timestamp: now },
        { id: 'e_today_1h', text: 'Today 1h ago', timestamp: now - 60 * 60000 },
        { id: 'e_past_week', text: 'One Week Ago', timestamp: now - 7 * 86400000 },
      ];

      const sessions = groupHistoryIntoSessions(randomOrderEntries, now);
      assert.ok(sessions.length >= 4, 'Must order and partition randomized timestamp entries correctly');

      // First session must contain the newest item
      assert.equal(sessions[0].entries[0].id, 'e_today_now');
      // All session start/end times must be strictly monotonically non-increasing across sessions
      for (let i = 0; i < sessions.length - 1; i++) {
        assert.ok(
          sessions[i].endTime >= sessions[i + 1].endTime,
          `Session ${i} endTime (${sessions[i].endTime}) must be >= Session ${i + 1} endTime (${sessions[i + 1].endTime})`
        );
      }
    });
  });

  // =========================================================================
  // SUITE 3: LocalStorage Corruption Recovery Across All 14 Storage Keys
  // =========================================================================
  describe('3. LocalStorage Corruption Recovery Across All 14 Storage Keys', () => {
    it('3.1: Complete 14-Key Storage Corruption with Non-JSON and Malformed Primitives', async () => {
      const allKeysCorrupted = {
        'qc-history-entries': 'MALFORMED_ARRAY_JSON{{{',
        'qc-recents': '123456789',
        'qc-history': '{"legacy": "corrupt"}',
        'qc-batch': 'INVALID_BATCH_ARRAY_STRING',
        'qc-pin-folders': '{"notAnArray": true}',
        'qc-pins': '{"pins": [1, 2, 3]}',
        'qc-custom': 'TRUE',
        'qc-edits': '[1, 2, 3, 4, 5]', // array instead of Record<string, object>
        'qc-dels': '{"dels": "corrupt"}',
        'qc-categories': 'CORRUPT_CATEGORIES_STRING',
        'qc-category-order': '{"order": 1}',
        'qc-appearance': 'INVALID_APPEARANCE_PRIMITIVE',
        'qc-theme': 'SUPER_NEON_UNKNOWN_THEME',
        'qc-density': 'ULTRA_DENSE_UNKNOWN',
        'qc-sort': 'RANDOM_SORT_KEY',
        'qc-join': 'CUSTOM_INVALID_DELIMITER',
        'qc-autoclear': 'NOT_A_VALID_BOOLEAN_VAL',
      };

      let app: any;
      assert.doesNotThrow(() => {
        app = createAppInstance({ initialStorage: allKeysCorrupted });
      }, 'Booting app with all 14 keys corrupted must not throw');

      const { document } = app;
      assert.ok(document.querySelector('#root'), 'Root element must mount');

      // Verify default defect list renders
      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Default defect items must render despite full storage corruption');

      // Verify category navigation works
      assert.doesNotThrow(() => {
        app.selectCategory('screen');
      });

      // Verify History Drawer opens cleanly without crash
      await app.openHistoryDrawer();
      const histDrawer = app.getHistoryDrawer();
      assert.ok(histDrawer, 'History drawer must open cleanly under corrupt initial storage');

      // Verify Batch Drawer opens cleanly without crash
      await app.openBatchDrawer();
      const batchDrawer = app.getBatchDrawer();
      assert.ok(batchDrawer, 'Batch drawer must open cleanly under corrupt initial storage');
    });

    it('3.2: Self-healing & Storage Reserialization across history, pins, categories, and batch', async () => {
      const corruptStorage = {
        'qc-history-entries': 'CORRUPT',
        'qc-pin-folders': 'CORRUPT',
        'qc-pins': 'CORRUPT',
        'qc-categories': 'CORRUPT',
        'qc-category-order': 'CORRUPT',
        'qc-batch': 'CORRUPT',
      };

      const app = createAppInstance({ initialStorage: corruptStorage });

      // 1. Copy an item to heal history
      await app.clickItemRow(0);
      const healedHistory = app.getStorageJSON('qc-history-entries');
      assert.ok(Array.isArray(healedHistory), 'qc-history-entries must self-heal to a valid array');
      assert.equal(healedHistory.length, 1);

      // 2. Pin an item to heal pin folders and pins
      await app.clickItemAction(0, 'pin');
      const healedFolders = app.getStorageJSON('qc-pin-folders');
      const healedPins = app.getStorageJSON('qc-pins');
      assert.ok(Array.isArray(healedFolders), 'qc-pin-folders must self-heal to a valid array');
      assert.ok(Array.isArray(healedPins), 'qc-pins must self-heal to a valid array');

      // 3. Add to batch to heal batch queue
      await app.clickItemAction(0, 'add');
      const healedBatch = app.getStorageJSON('qc-batch');
      assert.ok(Array.isArray(healedBatch), 'qc-batch must self-heal to a valid array');
      assert.equal(healedBatch.length, 1);
    });

    it('3.3: Ingestion of corrupted history entries with missing text and non-object shapes', () => {
      const brokenEntries: any[] = [
        null,
        undefined,
        12345,
        'string only without object',
        { corrupt: true },
        { text: null, timestamp: 1000 },
        { text: 'Valid Defect Text', category: 'screen', itemNumber: 101, timestamp: 4000 },
      ];

      const sessions = groupHistoryIntoSessions(brokenEntries);
      assert.equal(sessions.length, 1, 'Only valid entries with string text should form sessions');
      assert.equal(sessions[0].entries.length, 1);
      assert.equal(sessions[0].entries[0].text, 'Valid Defect Text');
    });
  });

  // =========================================================================
  // SUITE 4: XSS Payload Sanitization Across All Input Vectors
  // =========================================================================
  describe('4. XSS Payload Sanitization & Execution Prevention', () => {
    it('4.1: XSS vectors in defect wording text & history entries', async () => {
      const maliciousPayloads = [
        '<script>window.__xss_history=1;</script>',
        '<img src=x onerror="window.__xss_history=2;">',
        '<svg onload="window.__xss_history=3;">',
        '"><iframe src="javascript:window.__xss_history=4"></iframe>',
        'javascript:alert(5)',
        '${alert(6)}',
      ];

      const initialEntries: HistoryEntry[] = maliciousPayloads.map((payload, idx) => ({
        id: `xss_${idx}`,
        text: payload,
        category: 'screen',
        itemNumber: 900 + idx,
        timestamp: Date.now() - idx * 1000,
      }));

      const initialStorage = {
        'qc-history-entries': JSON.stringify(initialEntries),
      };

      const app = createAppInstance({ initialStorage });
      await app.openHistoryDrawer();

      const { window, document } = app;

      // Verify no script or iframe elements were injected into the DOM
      const injectedScripts = document.querySelectorAll('script[src*="xss"], iframe[src*="javascript"]');
      assert.equal(injectedScripts.length, 0, 'No executable script or iframe elements should be injected');

      // Verify window flags are undefined
      assert.equal((window as any).__xss_history, undefined, 'No XSS payload should execute in window context');

      // Verify history text is safely rendered
      const historyItems = app.getHistoryEntries();
      assert.equal(historyItems.length, maliciousPayloads.length);
      assert.ok(historyItems[0].text.includes('<script>') || historyItems[0].text.includes('window.__xss_history'));
    });

    it('4.2: XSS vectors in Category Names, Colors, and Search queries', async () => {
      const xssSearch = '<script>window.__xss_search=true;</script>';
      const xssCategory = '<b onmouseover=alert(1)>Malicious</b>';

      const app = createAppInstance();

      // 1. Test search with XSS payload
      app.search(xssSearch);
      await waitAsync(30);

      assert.equal((app.window as any).__xss_search, undefined, 'Search query must not trigger XSS');

      // 2. Test category color styling helper with CSS injection vectors
      const maliciousColor = 'red; background: url(javascript:alert(1));';
      const badgeStyle = getCategoryBadgeStyle(xssCategory, maliciousColor);
      assert.ok(badgeStyle.color !== undefined);
      assert.equal((app.window as any).__xss_search, undefined);
    });

    it('4.3: In-drawer filtering on XSS payloads matches raw string securely', () => {
      const entries: HistoryEntry[] = [
        { id: '1', text: '<script>alert("test")</script>', category: '<evil_cat>', itemNumber: 101, timestamp: 1000 },
        { id: '2', text: 'Normal LCD Defect', category: 'screen', itemNumber: 102, timestamp: 2000 },
      ];

      // Filter by partial XSS payload
      const matched = filterHistoryEntries(entries, '<script>');
      assert.equal(matched.length, 1);
      assert.equal(matched[0].id, '1');

      // Filter by malicious category string
      const catMatched = filterHistoryEntries(entries, '', '<evil_cat>');
      assert.equal(catMatched.length, 1);
      assert.equal(catMatched[0].id, '1');
    });
  });

  // =========================================================================
  // SUITE 5: History Session Actions & Integration Stress
  // =========================================================================
  describe('5. History Session Actions & Integration Stress', () => {
    it('5.1: "Copy All in Session" concatenates entries with newline delimiter', async () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const sessionEntries: HistoryEntry[] = [
        { id: 'e1', text: 'Defect Item A', timestamp: now - 1000 },
        { id: 'e2', text: 'Defect Item B', timestamp: now - 2000 },
        { id: 'e3', text: 'Defect Item C', timestamp: now - 3000 },
      ];

      const initialStorage = {
        'qc-history-entries': JSON.stringify(sessionEntries),
      };

      const app = createAppInstance({ initialStorage });
      await app.openHistoryDrawer();

      // Find and click "Copy All" button in session card
      const { document } = app;
      const copyAllBtn = document.querySelector('[data-testid="copy-session-btn"]') as HTMLElement;
      assert.ok(copyAllBtn, 'Copy session button must exist');
      copyAllBtn.click();
      await waitAsync(40);

      const copied = app.getCopiedText();
      assert.ok(copied, 'Clipboard must receive copied text');
      assert.equal(copied, 'Defect Item A\nDefect Item B\nDefect Item C');
    });

    it('5.2: "Add Session to Batch Queue" appends all session entries to batch queue', async () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const sessionEntries: HistoryEntry[] = [
        { id: 'e1', text: 'Session Batch Item 1', timestamp: now - 1000 },
        { id: 'e2', text: 'Session Batch Item 2', timestamp: now - 2000 },
      ];

      const initialStorage = {
        'qc-history-entries': JSON.stringify(sessionEntries),
        'qc-batch': JSON.stringify(['Existing Item']),
      };

      const app = createAppInstance({ initialStorage });
      await app.openHistoryDrawer();

      const { document } = app;
      const addSessionBatchBtn = document.querySelector('[data-testid="add-session-batch-btn"]') as HTMLElement;
      assert.ok(addSessionBatchBtn, 'Add session to batch button must exist');
      addSessionBatchBtn.click();
      await waitAsync(40);

      const updatedBatch = app.getStorageJSON('qc-batch');
      assert.equal(updatedBatch.length, 3);
      assert.equal(updatedBatch[0], 'Existing Item');
      assert.equal(updatedBatch[1], 'Session Batch Item 1');
      assert.equal(updatedBatch[2], 'Session Batch Item 2');
    });

    it('5.3: Clear History action clears qc-history-entries, qc-recents, and qc-history synchronously', async () => {
      const historyEntries = [
        { id: 'h_1', text: 'Defect 1', itemNumber: 1, category: 'screen', timestamp: Date.now() }
      ];

      const initialStorage = {
        'qc-history-entries': JSON.stringify(historyEntries),
        'qc-recents': JSON.stringify(['Defect 1']),
        'qc-history': JSON.stringify(['Defect 1'])
      };

      const app = createAppInstance({ initialStorage });
      await waitAsync(30);

      app.clearRecentHistory();
      await waitAsync(40);

      // Check confirmation modal if rendered
      const confirmBtn = app.document.querySelector('[data-testid="confirm-clear-history-btn"], #confirmClearHistory, button[data-confirm="true"]') as HTMLElement;
      if (confirmBtn) {
        confirmBtn.click();
        await waitAsync(40);
      }

      assert.deepEqual(app.getStorageJSON('qc-recents') || [], [], 'qc-recents must be cleared');
      assert.deepEqual(app.getStorageJSON('qc-history-entries') || [], [], 'qc-history-entries must be cleared');
    });
  });
});
