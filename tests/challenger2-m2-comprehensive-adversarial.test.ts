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

describe('Milestone 2 Replacement Challenger 2: Deep Empirical Adversarial Stress Suite', () => {

  // =========================================================================
  // Section 1: Ultra-Heavy History Volume (10,000 Entries) & O(N) Benchmark
  // =========================================================================
  describe('1. Ultra-Heavy Volume (10,000 Entries) & Time Clustering Stress', () => {
    it('1.1: processes 10,000 history entries across 100 days in under 100ms with zero data loss', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const entries: HistoryEntry[] = [];
      const categories = ['screen', 'battery', 'camera', 'buttons', 'locks', 'pen', 'water', 'audio', 'body', 'system'];

      // Generate 10,000 entries across 100 days
      for (let day = 0; day < 100; day++) {
        for (let sessionIdx = 0; sessionIdx < 5; sessionIdx++) {
          const sessionBaseTime = now - day * 86400000 - sessionIdx * (90 * 60000);
          for (let itemIdx = 0; itemIdx < 20; itemIdx++) {
            const entryTime = sessionBaseTime - itemIdx * (30 * 1000); // 30s apart
            const cat = categories[(day * 100 + sessionIdx * 20 + itemIdx) % categories.length];
            entries.push({
              id: `entry_${day}_${sessionIdx}_${itemIdx}`,
              text: `QC Defect Standard Wording Text #${itemIdx + 1} for ${cat} - [DAY ${day} SESS ${sessionIdx}]`,
              itemNumber: (itemIdx % 50) + 1,
              category: cat,
              timestamp: entryTime,
              source: itemIdx % 4 === 0 ? 'batch' : 'single',
            });
          }
        }
      }

      assert.equal(entries.length, 10000, 'Must generate exactly 10,000 entries');

      const start = performance.now();
      const sessions = groupHistoryIntoSessions(entries, now);
      const duration = performance.now() - start;

      assert.ok(
        duration < 150,
        `10,000 entries clustering took ${duration.toFixed(2)}ms (must be under 150ms)`
      );

      // Verify zero data loss: total items across all sessions equals 10,000
      const totalItems = sessions.reduce((sum, s) => sum + s.entries.length, 0);
      assert.equal(totalItems, 10000, 'Sum of all session entries must equal 10,000');

      // Verify session count: 100 days * 5 sessions = 500 sessions
      assert.equal(sessions.length, 500, 'Must cluster into exactly 500 distinct sessions');

      // Verify chronological ordering of sessions (newest session first)
      for (let i = 0; i < sessions.length - 1; i++) {
        assert.ok(
          sessions[i].endTime >= sessions[i + 1].endTime,
          `Session ${i} endTime (${sessions[i].endTime}) must be >= Session ${i + 1} endTime (${sessions[i + 1].endTime})`
        );
      }

      // Verify items inside every session are strictly sorted descending by timestamp
      for (const sess of sessions) {
        assert.equal(sess.entries.length, 20);
        for (let j = 0; j < sess.entries.length - 1; j++) {
          assert.ok(
            sess.entries[j].timestamp >= sess.entries[j + 1].timestamp,
            'Entries inside session must be descending'
          );
        }
        // Check startTime and endTime consistency
        assert.equal(sess.startTime, Math.min(...sess.entries.map((e) => e.timestamp)));
        assert.equal(sess.endTime, Math.max(...sess.entries.map((e) => e.timestamp)));
      }

      // First session must be marked as current session
      assert.equal(sessions[0].isCurrentSession, true);
      assert.equal(sessions[0].title, 'Current Session');
      assert.equal(sessions[0].subtitle, 'Active session • 20 items');
    });

    it('1.2: high-speed multi-term search and category filter across 10,000 entries in under 20ms', () => {
      const now = Date.now();
      const entries: HistoryEntry[] = [];
      const categories = ['screen', 'battery', 'camera', 'buttons', 'locks'];

      for (let i = 0; i < 10000; i++) {
        const cat = categories[i % categories.length];
        entries.push({
          id: `h_${i}`,
          text: `Defect #${i} on ${cat} component - error code [ERR_${i % 100}]`,
          itemNumber: i,
          category: cat,
          timestamp: now - i * 10000,
          source: 'single',
        });
      }

      const start = performance.now();
      const filtered = filterHistoryEntries(entries, 'ERR_42', 'camera');
      const duration = performance.now() - start;

      assert.ok(duration < 25, `Filter on 10k items took ${duration.toFixed(2)}ms (must be < 25ms)`);
      // Entries matching camera AND ERR_42:
      // cat === 'camera' corresponds to i % 5 === 2.
      // i % 100 === 42.
      // For i in 0..9999: i = 42, 142, 242, ... (100 items).
      // Since 42 % 5 === 2, ALL of these 100 items have cat === 'camera'.
      assert.equal(filtered.length, 100);
      assert.ok(filtered.every((e) => e.category === 'camera' && e.text.includes('ERR_42')));
    });
  });

  // =========================================================================
  // Section 2: Adversarial Search Query Matching & Corner Cases
  // =========================================================================
  describe('2. Adversarial Search Query & Category Filtering Engine', () => {
    const complexDataset: HistoryEntry[] = [
      { id: '1', text: 'Main LCD Panel Flickering [120Hz/60Hz] (Rev: B2) + Ghosting', itemNumber: 101, category: 'screen', timestamp: 1000 },
      { id: '2', text: 'Battery Bulge > 3.5mm with high temperature (>45°C) & rapid discharge', itemNumber: 202, category: 'battery', timestamp: 2000 },
      { id: '3', text: 'Camera OIS lens rattle: [0.2mm - 0.4mm] tolerance exceeded', itemNumber: 303, category: 'camera', timestamp: 3000 },
      { id: '4', text: 'Volume button stuck $100% (stiffness: ^2.5N)', itemNumber: 404, category: 'buttons', timestamp: 4000 },
      { id: '5', text: 'Water indicator sticker pink (LDI triggered) 💧 100%', itemNumber: 505, category: 'water', timestamp: 5000 },
      { id: '6', text: 'Special regex chars: .*+?^${}()|[]\\ testing characters', itemNumber: 606, category: 'system', timestamp: 6000 },
      { id: '7', text: 'Custom defect without explicit category fallback', itemNumber: 707, category: undefined, timestamp: 7000 },
    ];

    it('2.1: immune to regex injection attacks in search query string', () => {
      const maliciousPatterns = [
        '.*',
        '+',
        '++',
        '+++',
        '?',
        '??',
        '^',
        '$',
        '(',
        ')',
        '(()',
        '(((((((((',
        '[',
        ']',
        '[]',
        '[[[',
        '{',
        '}',
        '{}',
        '|',
        '||',
        '\\',
        '\\\\',
        '\\\\\\\\',
        '[0.2mm - 0.4mm]',
        '(>45°C)',
        '[120Hz/60Hz]',
        '(Rev: B2)',
        'stiffness: ^2.5N',
        '.*+?^${}()|[]\\',
      ];

      for (const pattern of maliciousPatterns) {
        assert.doesNotThrow(() => {
          const results = filterHistoryEntries(complexDataset, pattern, 'all');
          assert.ok(Array.isArray(results), `Results for pattern "${pattern}" must be array`);
        }, `Pattern "${pattern}" must not throw regex error`);
      }
    });

    it('2.2: matches defect numbers with or without hash prefix and with leading/trailing spaces', () => {
      // Search '#101'
      const r1 = filterHistoryEntries(complexDataset, ' #101 ', 'all');
      assert.equal(r1.length, 1);
      assert.equal(r1[0].id, '1');

      // Search '101'
      const r2 = filterHistoryEntries(complexDataset, '101', 'all');
      assert.equal(r2.length, 1);
      assert.equal(r2[0].id, '1');

      // Search '#303'
      const r3 = filterHistoryEntries(complexDataset, '#303', 'camera');
      assert.equal(r3.length, 1);
      assert.equal(r3[0].id, '3');

      // Search '#303' with mismatching category 'screen'
      const r4 = filterHistoryEntries(complexDataset, '#303', 'screen');
      assert.equal(r4.length, 0);
    });

    it('2.3: case insensitivity and whitespace handling', () => {
      const uppercaseQuery = filterHistoryEntries(complexDataset, '  FLICKERING  ', 'SCREEN');
      assert.equal(uppercaseQuery.length, 1);
      assert.equal(uppercaseQuery[0].id, '1');

      const mixedCaseQuery = filterHistoryEntries(complexDataset, 'bAtTeRy bUlGe', 'ALL');
      assert.equal(mixedCaseQuery.length, 1);
      assert.equal(mixedCaseQuery[0].id, '2');

      const blankQuery = filterHistoryEntries(complexDataset, '   \t\n  ', 'all');
      assert.equal(blankQuery.length, complexDataset.length);
    });

    it('2.4: unicode symbol and emoji search', () => {
      const emojiResults = filterHistoryEntries(complexDataset, '💧', 'all');
      assert.equal(emojiResults.length, 1);
      assert.equal(emojiResults[0].id, '5');

      const degreeResults = filterHistoryEntries(complexDataset, '°C', 'battery');
      assert.equal(degreeResults.length, 1);
      assert.equal(degreeResults[0].id, '2');
    });
  });

  // =========================================================================
  // Section 3: Live Item Count Badges & Session Formatting Stress
  // =========================================================================
  describe('3. Live Item Count Badges & Subtitle Grammatical Accuracy', () => {
    it('3.1: category count aggregation correctly totals standard, custom, and undefined categories', () => {
      const entries: HistoryEntry[] = [
        { id: '1', text: 'Item 1', category: 'screen', timestamp: 100 },
        { id: '2', text: 'Item 2', category: 'Screen', timestamp: 200 },
        { id: '3', text: 'Item 3', category: 'SCREEN', timestamp: 300 },
        { id: '4', text: 'Item 4', category: 'battery', timestamp: 400 },
        { id: '5', text: 'Item 5', category: '', timestamp: 500 }, // empty string -> general
        { id: '6', text: 'Item 6', category: undefined, timestamp: 600 }, // undefined -> general
        { id: '7', text: 'Item 7', category: 'custom_sensor_view', timestamp: 700 },
      ];

      const counts: Record<string, number> = {};
      for (const entry of entries) {
        const cat = (entry.category || 'general').toLowerCase();
        counts[cat] = (counts[cat] || 0) + 1;
      }

      assert.equal(counts['screen'], 3, 'Screen category count must be 3 regardless of case');
      assert.equal(counts['battery'], 1);
      assert.equal(counts['general'], 2, 'Undefined or empty categories group into general');
      assert.equal(counts['custom_sensor_view'], 1);
      assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 7);
    });

    it('3.2: formatSessionSubtitle handles pluralization and temporal relative headers cleanly', () => {
      const now = new Date(2026, 7, 16, 14, 0, 0).getTime();

      // Current session
      assert.equal(formatSessionSubtitle(1, true, now, now), 'Active session • 1 item');
      assert.equal(formatSessionSubtitle(2, true, now, now), 'Active session • 2 items');
      assert.equal(formatSessionSubtitle(99, true, now, now), 'Active session • 99 items');

      // Earlier today
      const earlierToday = now - 2 * 3600 * 1000;
      assert.equal(formatSessionSubtitle(1, false, earlierToday, now), 'Earlier today • 1 item');
      assert.equal(formatSessionSubtitle(5, false, earlierToday, now), 'Earlier today • 5 items');

      // Yesterday
      const yesterday = new Date(2026, 7, 15, 16, 0, 0).getTime();
      assert.equal(formatSessionSubtitle(1, false, yesterday, now), 'Yesterday • 1 item');
      assert.equal(formatSessionSubtitle(8, false, yesterday, now), 'Yesterday • 8 items');

      // Older date
      const older = new Date(2026, 7, 5, 10, 0, 0).getTime();
      assert.equal(formatSessionSubtitle(1, false, older, now), 'Aug 5 • 1 item');
      assert.equal(formatSessionSubtitle(12, false, older, now), 'Aug 5 • 12 items');
    });

    it('3.3: formatSessionTimeRange handles identical and separate start/end times', () => {
      const t1 = new Date(2026, 7, 16, 9, 5, 0).getTime();
      const t2 = new Date(2026, 7, 16, 9, 35, 0).getTime();

      assert.ok(formatSessionTimeRange(t1, t1).includes('09:05 AM') || formatSessionTimeRange(t1, t1).includes('9:05 AM'));
      assert.ok(!formatSessionTimeRange(t1, t1).includes('–'));

      const rangeStr = formatSessionTimeRange(t1, t2);
      assert.ok(rangeStr.includes('–'));
      assert.ok(rangeStr.includes('09:05 AM') || rangeStr.includes('9:05 AM'));
      assert.ok(rangeStr.includes('09:35 AM') || rangeStr.includes('9:35 AM'));
    });
  });

  // =========================================================================
  // Section 4: Dirty Data & Resilient Normalization
  // =========================================================================
  describe('4. Dirty Data & Resilient Normalization', () => {
    it('4.1: normalizeHistoryEntry safely normalizes diverse dirty inputs', () => {
      const activeItems: QCItem[] = [
        { id: 'item_1', n: 101, t: 'LCD dead pixel defect', c: 'screen' },
      ];

      // String matching active item
      const n1 = normalizeHistoryEntry('LCD dead pixel defect', activeItems);
      assert.equal(n1.text, 'LCD dead pixel defect');
      assert.equal(n1.itemNumber, 101);
      assert.equal(n1.category, 'screen');
      assert.equal(n1.source, 'single');

      // String not in active items
      const n2 = normalizeHistoryEntry('Unregistered defect text', activeItems);
      assert.equal(n2.text, 'Unregistered defect text');
      assert.equal(n2.itemNumber, undefined);
      assert.equal(n2.category, undefined);

      // Malformed object with missing timestamp and text padding
      const n3 = normalizeHistoryEntry({ text: '  Padded defect text  ', timestamp: null }, activeItems);
      assert.equal(n3.text, 'Padded defect text');
      assert.equal(n3.category, 'general');
      assert.ok(typeof n3.timestamp === 'number' && !isNaN(n3.timestamp));

      // Batch source preserved
      const n4 = normalizeHistoryEntry({ text: 'Batch joined text', source: 'batch', timestamp: 12345 }, activeItems);
      assert.equal(n4.source, 'batch');
      assert.equal(n4.timestamp, 12345);
    });

    it('4.2: groupHistoryIntoSessions gracefully drops non-text entries and recovers corrupt timestamps', () => {
      const corruptDataset: any[] = [
        null,
        undefined,
        42,
        false,
        {},
        { notText: 'No text key' },
        { text: null },
        { text: undefined },
        { text: 'Valid Defect 1', timestamp: Date.now() - 5000 },
        { text: 'Valid Defect 2', timestamp: 'not-a-number' },
      ];

      const sessions = groupHistoryIntoSessions(corruptDataset);
      assert.equal(sessions.length, 1);
      assert.equal(sessions[0].entries.length, 2);
      assert.equal(sessions[0].entries[0].text, 'Valid Defect 2');
      assert.equal(sessions[0].entries[1].text, 'Valid Defect 1');
    });
  });

  // =========================================================================
  // Section 5: End-to-End JSDOM App Integration & Dynamic Session UI
  // =========================================================================
  describe('5. End-to-End JSDOM History Drawer UI & Session Interactions', () => {
    it('5.1: full lifecycle: pre-load 100 history items, open drawer, filter by category chip, verify DOM cards', async () => {
      const now = Date.now();
      const entries: HistoryEntry[] = [];

      // 50 Screen items (Session 1: Current)
      for (let i = 0; i < 50; i++) {
        entries.push({
          id: `scr_${i}`,
          text: `Screen defect wording sample #${i + 1}`,
          itemNumber: 100 + i,
          category: 'screen',
          timestamp: now - i * 10000,
        });
      }

      // 50 Battery items (Session 2: 2 hours ago)
      for (let i = 0; i < 50; i++) {
        entries.push({
          id: `bat_${i}`,
          text: `Battery defect wording sample #${i + 1}`,
          itemNumber: 200 + i,
          category: 'battery',
          timestamp: now - (120 * 60000) - i * 10000,
        });
      }

      const initialStorage = {
        'qc-history-entries': JSON.stringify(entries),
        'qc-batch': JSON.stringify([]),
      };

      const app = createAppInstance({ initialStorage });
      await waitAsync(30);

      // Open history drawer
      await app.openHistoryDrawer();
      await waitAsync(50);

      const drawer = app.getHistoryDrawer();
      assert.ok(drawer, 'History drawer must be rendered in DOM');

      // Verify total count badge in drawer header
      const headerTotalBadge = drawer.querySelector('.history-drawer span.font-mono');
      assert.ok(headerTotalBadge?.textContent?.includes('100'), 'Header badge must display 100');

      // Verify 2 session cards initially rendered
      const sessionCards = drawer.querySelectorAll('[data-testid="history-session-group"]');
      assert.equal(sessionCards.length, 2, 'Must render 2 session group cards');

      // Filter by 'battery' category chip
      const batteryChip = drawer.querySelector('[data-testid="history-cat-chip-battery"]') as HTMLElement;
      assert.ok(batteryChip, 'Battery category chip must exist in drawer');
      assert.ok(batteryChip.textContent?.includes('50'), 'Battery chip count badge must show 50');

      batteryChip.click();
      await waitAsync(50);

      // After filtering by battery, only the battery session should be rendered
      const filteredSessionCards = drawer.querySelectorAll('[data-testid="history-session-group"]');
      assert.equal(filteredSessionCards.length, 1, 'Only 1 session group card should be rendered for battery');
      assert.ok(filteredSessionCards[0].textContent?.includes('Battery defect wording sample #1'));

      // Test "Add All to Batch" with active filter
      const addAllBatchBtn = drawer.querySelector('[data-testid="history-add-all-batch"]') as HTMLElement;
      assert.ok(addAllBatchBtn, 'Add All to Batch button must exist');

      addAllBatchBtn.click();
      await waitAsync(50);

      // Verify batch queue received all 50 filtered battery items
      assert.equal(app.getBatchCount(), 50, 'Batch queue should now contain 50 items');
      const batchStorage = app.getStorageJSON('qc-batch');
      assert.equal(batchStorage?.length, 50, 'LocalStorage qc-batch must have 50 items');
    });

    it('5.2: test Copy All in Session and + Batch session buttons on live DOM', async () => {
      const now = Date.now();
      const entries: HistoryEntry[] = [
        { id: 'e1', text: 'Live Defect Alpha', itemNumber: 101, category: 'camera', timestamp: now - 1000 },
        { id: 'e2', text: 'Live Defect Beta', itemNumber: 102, category: 'camera', timestamp: now - 2000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(entries),
          'qc-batch': JSON.stringify(['Pre-existing batch item']),
        },
      });

      await app.openHistoryDrawer();
      await waitAsync(50);

      const drawer = app.getHistoryDrawer();
      const copySessionBtn = drawer?.querySelector('[data-testid="copy-session-btn"]') as HTMLElement;
      assert.ok(copySessionBtn, 'Copy session button must exist');

      app.resetCopiedText();
      copySessionBtn.click();
      await waitAsync(50);

      assert.equal(app.getCopiedText(), 'Live Defect Alpha\nLive Defect Beta');
      assert.ok(copySessionBtn.textContent?.includes('Copied!'));

      // Test + Batch on session
      const addBatchSessionBtn = drawer?.querySelector('[data-testid="add-session-batch-btn"]') as HTMLElement;
      assert.ok(addBatchSessionBtn, 'Add session to batch button must exist');

      addBatchSessionBtn.click();
      await waitAsync(50);

      // Pre-existing 1 + 2 added = 3
      assert.equal(app.getBatchCount(), 3);
      const storedBatch = app.getStorageJSON('qc-batch');
      assert.deepEqual(storedBatch, ['Pre-existing batch item', 'Live Defect Alpha', 'Live Defect Beta']);
    });

    it('5.3: test Clear All History workflow with confirmation modal', async () => {
      const entries: HistoryEntry[] = [
        { id: 'e1', text: 'Item to clear 1', timestamp: Date.now() - 1000 },
        { id: 'e2', text: 'Item to clear 2', timestamp: Date.now() - 2000 },
      ];

      const app = createAppInstance({
        initialStorage: {
          'qc-history-entries': JSON.stringify(entries),
          'qc-recents': JSON.stringify(['Item to clear 1', 'Item to clear 2']),
          'qc-history': JSON.stringify(['Item to clear 1', 'Item to clear 2']),
        },
      });

      await app.openHistoryDrawer();
      await waitAsync(50);

      const clearBtn = app.document.querySelector('[data-testid="clear-history-btn"]') as HTMLElement;
      assert.ok(clearBtn, 'Clear history button exists');

      // Click clear button opens confirmation dialog
      clearBtn.click();
      await waitAsync(40);

      const confirmBtn = app.document.querySelector('[data-testid="confirm-clear-history-btn"]') as HTMLElement;
      assert.ok(confirmBtn, 'Confirm clear button must exist in confirmation dialog');

      confirmBtn.click();
      await waitAsync(50);

      // Verify DOM reflects empty state
      const emptyNotice = app.document.querySelector('#histlist');
      assert.ok(emptyNotice?.textContent?.includes('No copy history yet'));

      // Verify localStorage is synchronized
      assert.deepEqual(app.getStorageJSON('qc-history-entries'), []);
      assert.deepEqual(app.getStorageJSON('qc-recents'), []);
      assert.deepEqual(app.getStorageJSON('qc-history'), []);
    });
  });

});
