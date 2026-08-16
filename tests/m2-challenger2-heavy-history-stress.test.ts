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
import type { HistoryEntry, HistorySession, QCItem } from '../src/types/qc.ts';

describe('Milestone 2 Challenger 2: Heavy History Entries & Live Badges Stress Harness', () => {

  // =========================================================================
  // 1. Heavy Volume (500 to 1,000 Entries) Performance & Memory Stress
  // =========================================================================
  describe('1. Heavy History Volume (1,000 entries) & Cluster Performance', () => {
    it('1.1: groups 1,000 history entries into sessions in under 50ms', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const entries: HistoryEntry[] = [];
      const categories = ['battery', 'screen', 'camera', 'buttons', 'locks', 'pen', 'water', 'system'];

      // Generate 1000 entries across 5 days (200 entries per day, clustered in bursts)
      for (let day = 0; day < 5; day++) {
        for (let cluster = 0; cluster < 10; cluster++) {
          const clusterBaseTime = now - day * 86400000 - cluster * (45 * 60000); // 45 min apart
          for (let item = 0; item < 20; item++) {
            const entryTime = clusterBaseTime - item * 30000; // 30s apart within cluster
            const cat = categories[(day * 200 + cluster * 20 + item) % categories.length];
            entries.push({
              id: `h_${day}_${cluster}_${item}`,
              text: `QC Defect Item #${item + 1} for ${cat} validation stress test [D${day}-C${cluster}-I${item}]`,
              itemNumber: (item % 50) + 1,
              category: cat,
              timestamp: entryTime,
              source: item % 3 === 0 ? 'batch' : 'single',
            });
          }
        }
      }

      assert.equal(entries.length, 1000);

      const start = performance.now();
      const sessions = groupHistoryIntoSessions(entries, now);
      const duration = performance.now() - start;

      assert.ok(duration < 50, `1,000 entries clustering took ${duration.toFixed(2)}ms (must be < 50ms)`);
      assert.ok(sessions.length > 0, 'Sessions must be generated');

      // Total entries across all sessions must equal 1000 exactly
      const totalSessionEntries = sessions.reduce((acc, s) => acc + s.entries.length, 0);
      assert.equal(totalSessionEntries, 1000, 'Sum of session entries must equal 1,000');

      // Verify the first session is current session (since newest entry is at `now`)
      assert.equal(sessions[0].isCurrentSession, true);
      assert.equal(sessions[0].title, 'Current Session');
    });

    it('1.2: filters 1,000 history entries by category and multi-token search in under 10ms', () => {
      const now = Date.now();
      const entries: HistoryEntry[] = [];
      const categories = ['battery', 'screen', 'camera', 'buttons', 'locks'];

      for (let i = 0; i < 1000; i++) {
        const cat = categories[i % categories.length];
        entries.push({
          id: `h_${i}`,
          text: `Sample test entry defect #${i} ${cat} anomaly detected [TAG_${i % 10}]`,
          itemNumber: i,
          category: cat,
          timestamp: now - i * 60000,
          source: 'single',
        });
      }

      const start = performance.now();
      const filtered = filterHistoryEntries(entries, 'battery', 'battery');
      const duration = performance.now() - start;

      assert.ok(duration < 10, `Filtering 1,000 entries took ${duration.toFixed(2)}ms (must be < 10ms)`);
      assert.equal(filtered.length, 200); // 1000 / 5 = 200
      assert.ok(filtered.every((e) => e.category === 'battery'));
    });
  });

  // =========================================================================
  // 2. Search Query Matching & Adversarial Input Robustness
  // =========================================================================
  describe('2. Search Query Matching & Adversarial Input Robustness', () => {
    const sampleEntries: HistoryEntry[] = [
      { id: '1', text: 'Battery drain rapid [45% / hr] with (heat > 40°C)', itemNumber: 12, category: 'battery', timestamp: 1000 },
      { id: '2', text: 'Screen touch deadzone near bottom-right corner', itemNumber: 44, category: 'screen', timestamp: 2000 },
      { id: '3', text: 'Camera lens scratch [0.5mm*2.0mm] + blur issue', itemNumber: 88, category: 'camera', timestamp: 3000 },
      { id: '4', text: 'Special regex characters $^*+?()|[]\\ testing', itemNumber: 99, category: 'system', timestamp: 4000 },
      { id: '5', text: 'Defect with emoji 🔥 and unicode symbols ⚡ 100%', itemNumber: 105, category: 'battery', timestamp: 5000 },
    ];

    it('2.1: handles special regex characters in query without crashing or throwing syntax errors', () => {
      const regexAttackQueries = [
        '.*',
        '+',
        '?',
        '^',
        '$',
        '(',
        ')',
        '[',
        ']',
        '{',
        '}',
        '|',
        '\\',
        '[0.5mm*2.0mm]',
        '(heat > 40°C)',
        '$^*+?()|[]\\',
        '+++',
        '[[[',
        '(((',
        '\\\\\\\\',
      ];

      for (const query of regexAttackQueries) {
        assert.doesNotThrow(() => {
          const results = filterHistoryEntries(sampleEntries, query, 'all');
          assert.ok(Array.isArray(results), `Results for query "${query}" must be an array`);
        }, `Query "${query}" should not throw regex exception`);
      }
    });

    it('2.2: matches exact itemNumber by "#44", "44", or text tokens', () => {
      const byHash = filterHistoryEntries(sampleEntries, '#44', 'all');
      assert.equal(byHash.length, 1);
      assert.equal(byHash[0].id, '2');

      const byNum = filterHistoryEntries(sampleEntries, '44', 'all');
      assert.equal(byNum.length, 1);
      assert.equal(byNum[0].id, '2');

      const byItemNumber12 = filterHistoryEntries(sampleEntries, '#12', 'all');
      assert.equal(byItemNumber12.length, 1);
      assert.equal(byItemNumber12[0].id, '1');
    });

    it('2.3: handles unicode characters and emojis correctly', () => {
      const emojiMatch = filterHistoryEntries(sampleEntries, '🔥', 'all');
      assert.equal(emojiMatch.length, 1);
      assert.equal(emojiMatch[0].id, '5');

      const unicodeMatch = filterHistoryEntries(sampleEntries, '⚡', 'all');
      assert.equal(unicodeMatch.length, 1);
      assert.equal(unicodeMatch[0].id, '5');
    });

    it('2.4: whitespace-only queries match all entries', () => {
      const emptyQuery = filterHistoryEntries(sampleEntries, '   \t\n  ', 'all');
      assert.equal(emptyQuery.length, sampleEntries.length);
    });

    it('2.5: category filtering combined with search query', () => {
      // Both match
      const r1 = filterHistoryEntries(sampleEntries, 'heat', 'battery');
      assert.equal(r1.length, 1);
      assert.equal(r1[0].id, '1');

      // Category mismatch despite query match
      const r2 = filterHistoryEntries(sampleEntries, 'heat', 'camera');
      assert.equal(r2.length, 0);

      // Query mismatch despite category match
      const r3 = filterHistoryEntries(sampleEntries, 'nonexistent', 'battery');
      assert.equal(r3.length, 0);
    });
  });

  // =========================================================================
  // 3. Live Badge Count Computation & Category Chip Aggregation
  // =========================================================================
  describe('3. Live Badge Count Computation & Consistency', () => {
    it('3.1: correctly computes category counts across mixed categories including custom/fallback', () => {
      const entries: HistoryEntry[] = [
        { id: '1', text: 'T1', category: 'Battery', timestamp: 100 },
        { id: '2', text: 'T2', category: 'battery', timestamp: 200 },
        { id: '3', text: 'T3', category: 'SCREEN', timestamp: 300 },
        { id: '4', text: 'T4', category: '', timestamp: 400 }, // fallback to general
        { id: '5', text: 'T5', category: undefined, timestamp: 500 }, // fallback to general
      ];

      const counts: Record<string, number> = {};
      for (const entry of entries) {
        const cat = (entry.category || 'general').toLowerCase();
        counts[cat] = (counts[cat] || 0) + 1;
      }

      assert.equal(counts['battery'], 2);
      assert.equal(counts['screen'], 1);
      assert.equal(counts['general'], 2);
      assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 5);
    });

    it('3.2: session subtitle reflects exact item count grammar (1 item vs N items)', () => {
      const now = Date.now();
      const sub1 = formatSessionSubtitle(1, true, now, now);
      assert.equal(sub1, 'Active session • 1 item');

      const sub0 = formatSessionSubtitle(0, true, now, now);
      assert.equal(sub0, 'Active session • 0 items');

      const sub5 = formatSessionSubtitle(5, true, now, now);
      assert.equal(sub5, 'Active session • 5 items');

      const subEarlier1 = formatSessionSubtitle(1, false, now, now);
      assert.equal(subEarlier1, 'Earlier today • 1 item');

      const subEarlier4 = formatSessionSubtitle(4, false, now, now);
      assert.equal(subEarlier4, 'Earlier today • 4 items');
    });
  });

  // =========================================================================
  // 4. Boundary & Edge Case Time Clustering
  // =========================================================================
  describe('4. Auto-Session Clustering Boundary & Edge Cases', () => {
    it('4.1: exactly 29m 59s gap stays in the same session; 30m 01s gap splits into new session', () => {
      const now = new Date(2026, 7, 16, 12, 0, 0).getTime();
      const t1 = now;
      const t2_within = now - (29 * 60 * 1000 + 59 * 1000); // 29m59s prior
      const t3_beyond = t2_within - (30 * 60 * 1000 + 1000); // 30m01s prior to t2

      const entries: HistoryEntry[] = [
        { id: '1', text: 'Item 1', timestamp: t1 },
        { id: '2', text: 'Item 2', timestamp: t2_within },
        { id: '3', text: 'Item 3', timestamp: t3_beyond },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 2, 'Should create exactly 2 sessions');
      assert.equal(sessions[0].entries.length, 2, 'Session 1 has 2 items');
      assert.equal(sessions[1].entries.length, 1, 'Session 2 has 1 item');
    });

    it('4.2: midnight boundary splits session even if gap is under 30 minutes', () => {
      // 11:55 PM on Day 1 and 12:05 AM on Day 2 (10 min gap, but crossing midnight)
      const day1_night = new Date(2026, 7, 15, 23, 55, 0).getTime();
      const day2_morning = new Date(2026, 7, 16, 0, 5, 0).getTime();

      const entries: HistoryEntry[] = [
        { id: '1', text: 'Midnight item 1', timestamp: day2_morning },
        { id: '2', text: 'Night item 2', timestamp: day1_night },
      ];

      const sessions = groupHistoryIntoSessions(entries, day2_morning);
      assert.equal(sessions.length, 2, 'Must split across calendar day boundary even with 10 min gap');
      assert.equal(sessions[0].isCurrentSession, true);
      assert.ok(sessions[1].title.startsWith('Yesterday — ') || sessions[1].title.includes('11:55'));
    });

    it('4.3: leap year and month boundary formatting stability', () => {
      // Leap day Feb 29, 2024
      const leapDayTime = new Date(2024, 1, 29, 14, 30, 0).getTime();
      const dateStr = formatSessionDate(leapDayTime);
      assert.equal(dateStr, 'Feb 29, 2024');

      const timeRange = formatSessionTimeRange(leapDayTime, leapDayTime + 15 * 60000);
      assert.ok(timeRange.includes('02:30 PM') || timeRange.includes('2:30 PM'));
      assert.ok(timeRange.includes('02:45 PM') || timeRange.includes('2:45 PM'));
    });
  });

  // =========================================================================
  // 5. Malformed, Corrupt & Dirty Data Normalization Stress
  // =========================================================================
  describe('5. Malformed Data Normalization & Resilient Recovery', () => {
    it('5.1: groupHistoryIntoSessions filters out nulls, undefined, non-objects, and missing text objects without crashing', () => {
      const dirtyEntries: any[] = [
        null,
        undefined,
        12345,
        'random string',
        {},
        { id: 'ok1', text: 'Valid defect text 1', timestamp: Date.now() },
        { text: null },
        { id: 'ok2', text: 'Valid defect text 2', timestamp: NaN }, // should default timestamp to now
      ];

      const sessions = groupHistoryIntoSessions(dirtyEntries);
      assert.ok(Array.isArray(sessions));
      assert.equal(sessions.length, 1);
      assert.equal(sessions[0].entries.length, 2);
      assert.equal(sessions[0].entries[0].text, 'Valid defect text 1');
      assert.equal(sessions[0].entries[1].text, 'Valid defect text 2');
    });

    it('5.2: normalizeHistoryEntry correctly migrates legacy strings and dirty objects', () => {
      const activeItems: QCItem[] = [
        { id: 'q1', n: 101, t: 'Screen flickering under low brightness', c: 'screen' },
      ];

      // String legacy entry matching an active item
      const n1 = normalizeHistoryEntry('Screen flickering under low brightness', activeItems);
      assert.equal(n1.text, 'Screen flickering under low brightness');
      assert.equal(n1.itemNumber, 101);
      assert.equal(n1.category, 'screen');
      assert.equal(n1.source, 'single');

      // String legacy entry not matching returns undefined category or fallback
      const n2 = normalizeHistoryEntry('Unknown custom defect text', activeItems);
      assert.equal(n2.text, 'Unknown custom defect text');
      assert.equal(n2.itemNumber, undefined);
      assert.equal(n2.category, undefined);

      // Dirty object with missing fields
      const n3 = normalizeHistoryEntry({ text: '  Dirty padded text  ', timestamp: 'not-a-number' }, activeItems);
      assert.equal(n3.text, 'Dirty padded text');
      assert.equal(n3.category, 'general');
      assert.ok(typeof n3.timestamp === 'number' && !isNaN(n3.timestamp));
    });
  });

  // =========================================================================
  // 6. Bulk Session Operations Under Heavy Loads
  // =========================================================================
  describe('6. Bulk Operations (Copy All & Add All to Batch)', () => {
    it('6.1: session bulk copy joins all defect texts with newline', () => {
      const session: HistorySession = {
        id: 's1',
        title: 'Session 1',
        subtitle: '3 items',
        startTime: 1000,
        endTime: 2000,
        isCurrentSession: true,
        entries: [
          { id: '1', text: 'Defect #1 text', timestamp: 1000 },
          { id: '2', text: 'Defect #2 text', timestamp: 1500 },
          { id: '3', text: 'Defect #3 text', timestamp: 2000 },
        ],
      };

      const joined = session.entries.map((e) => e.text).join('\n');
      assert.equal(joined, 'Defect #1 text\nDefect #2 text\nDefect #3 text');
    });

    it('6.2: handles empty session or empty entries gracefully', () => {
      const emptySessions = groupHistoryIntoSessions([]);
      assert.deepEqual(emptySessions, []);

      const emptyFiltered = filterHistoryEntries([], 'test', 'battery');
      assert.deepEqual(emptyFiltered, []);
    });
  });
});
