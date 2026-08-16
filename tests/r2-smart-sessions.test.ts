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
import type { HistoryEntry, QCItem } from '../src/types/qc.ts';

describe('Milestone 2 (R2): Smart Auto-Sessions History System Tests', () => {

  // =========================================================================
  // 1. SESSION_GAP_MS Constant & Date Helper Functions
  // =========================================================================
  describe('1. Session Gap Constants & Calendar Helpers', () => {
    it('1.1: SESSION_GAP_MS is strictly equal to 30 minutes (1,800,000 ms)', () => {
      assert.equal(SESSION_GAP_MS, 1800000, 'SESSION_GAP_MS must equal 1800000 ms');
      assert.equal(SESSION_GAP_MS, 30 * 60 * 1000);
    });

    it('1.2: isSameCalendarDay identifies same and different calendar days accurately', () => {
      const day1_morning = new Date(2026, 7, 16, 9, 30).getTime();
      const day1_evening = new Date(2026, 7, 16, 23, 45).getTime();
      const day2_morning = new Date(2026, 7, 17, 0, 5).getTime();

      assert.equal(isSameCalendarDay(day1_morning, day1_evening), true);
      assert.equal(isSameCalendarDay(day1_evening, day2_morning), false);
    });

    it('1.3: isYesterday identifies previous day correctly', () => {
      const now = new Date(2026, 7, 16, 14, 0).getTime();
      const yesterday = new Date(2026, 7, 15, 18, 30).getTime();
      const twoDaysAgo = new Date(2026, 7, 14, 18, 30).getTime();
      const todayEarlier = new Date(2026, 7, 16, 10, 0).getTime();

      assert.equal(isYesterday(yesterday, now), true);
      assert.equal(isYesterday(twoDaysAgo, now), false);
      assert.equal(isYesterday(todayEarlier, now), false);
    });
  });

  // =========================================================================
  // 2. Dynamic Session Titling & Subtitling Logic
  // =========================================================================
  describe('2. Dynamic Session Titling & Subtitles', () => {
    it('2.1: formats "Current Session" when isCurrentSession is true', () => {
      const now = new Date(2026, 7, 16, 12, 0).getTime();
      const title = formatSessionTitle(now, true, now);
      assert.equal(title, 'Current Session');

      const sub1 = formatSessionSubtitle(1, true, now, now);
      assert.equal(sub1, 'Active session • 1 item');

      const sub4 = formatSessionSubtitle(4, true, now, now);
      assert.equal(sub4, 'Active session • 4 items');
    });

    it('2.2: formats "Session — HH:MM" for earlier today', () => {
      const now = new Date(2026, 7, 16, 15, 0).getTime();
      const earlierToday = new Date(2026, 7, 16, 10, 30).getTime();
      const title = formatSessionTitle(earlierToday, false, now);

      assert.ok(title.startsWith('Session — '), `Title should start with "Session — ", got "${title}"`);
      assert.ok(title.includes('10:30 AM') || title.includes('10:30'), `Title must include time, got "${title}"`);

      const subtitle = formatSessionSubtitle(3, false, earlierToday, now);
      assert.equal(subtitle, 'Earlier today • 3 items');
    });

    it('2.3: formats "Yesterday — HH:MM" for prior day sessions', () => {
      const now = new Date(2026, 7, 16, 15, 0).getTime();
      const yesterdayTime = new Date(2026, 7, 15, 16, 45).getTime();
      const title = formatSessionTitle(yesterdayTime, false, now);

      assert.ok(title.startsWith('Yesterday — '), `Title should start with "Yesterday — ", got "${title}"`);
      assert.ok(title.includes('04:45 PM') || title.includes('4:45 PM') || title.includes('16:45'), `Title must include time, got "${title}"`);

      const subtitle = formatSessionSubtitle(2, false, yesterdayTime, now);
      assert.equal(subtitle, 'Yesterday • 2 items');
    });

    it('2.4: formats "[Month] [Day], [Year] — HH:MM" for earlier dates', () => {
      const now = new Date(2026, 7, 16, 15, 0).getTime();
      const priorDateTime = new Date(2026, 7, 10, 9, 15).getTime();
      const title = formatSessionTitle(priorDateTime, false, now);

      assert.ok(title.includes('Aug 10, 2026'), `Title should include "Aug 10, 2026", got "${title}"`);
      assert.ok(title.includes('—'), `Title should include delimiter —, got "${title}"`);
      assert.ok(title.includes('09:15 AM') || title.includes('9:15 AM') || title.includes('09:15'));

      const subtitle = formatSessionSubtitle(5, false, priorDateTime, now);
      assert.equal(subtitle, 'Aug 10 • 5 items');
    });
  });

  // =========================================================================
  // 3. Time Range Formatting
  // =========================================================================
  describe('3. Session Time Range Formatting', () => {
    it('3.1: formatSessionTimeRange formats single-point and range timestamps cleanly', () => {
      const t1 = new Date(2026, 7, 16, 10, 15).getTime();
      const t2 = new Date(2026, 7, 16, 10, 28).getTime();

      const singleRange = formatSessionTimeRange(t1, t1);
      assert.ok(singleRange.includes('10:15'));

      const dualRange = formatSessionTimeRange(t1, t2);
      assert.ok(dualRange.includes('10:15') && dualRange.includes('10:28') && dualRange.includes('–'));
    });
  });

  // =========================================================================
  // 4. groupHistoryIntoSessions Auto-Clustering Engine
  // =========================================================================
  describe('4. groupHistoryIntoSessions Clustering Engine', () => {
    it('4.1: returns empty array for empty, null, or undefined history input', () => {
      assert.deepEqual(groupHistoryIntoSessions([]), []);
      assert.deepEqual(groupHistoryIntoSessions(null as any), []);
      assert.deepEqual(groupHistoryIntoSessions(undefined as any), []);
    });

    it('4.2: groups items within 30 minutes into a single session', () => {
      const now = new Date(2026, 7, 16, 12, 0).getTime();
      const entries: HistoryEntry[] = [
        { id: '1', text: 'Defect A', timestamp: now - 5 * 60 * 1000, category: 'screen', itemNumber: 101 },
        { id: '2', text: 'Defect B', timestamp: now - 10 * 60 * 1000, category: 'battery', itemNumber: 102 },
        { id: '3', text: 'Defect C', timestamp: now - 18 * 60 * 1000, category: 'camera', itemNumber: 103 },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 1, 'Should form exactly 1 session');
      assert.equal(sessions[0].isCurrentSession, true, 'Should be marked current session');
      assert.equal(sessions[0].title, 'Current Session');
      assert.equal(sessions[0].entries.length, 3);
    });

    it('4.3: splits into separate sessions when idle gap exceeds 30 minutes', () => {
      const now = new Date(2026, 7, 16, 15, 0).getTime();
      const entries: HistoryEntry[] = [
        // Session 1: Current session (< 30 min from now)
        { id: '1', text: 'Defect 1', timestamp: now - 5 * 60 * 1000, category: 'screen', itemNumber: 101 },
        { id: '2', text: 'Defect 2', timestamp: now - 10 * 60 * 1000, category: 'screen', itemNumber: 102 },
        // Session 2: 2 hours ago (>30m gap)
        { id: '3', text: 'Defect 3', timestamp: now - 120 * 60 * 1000, category: 'battery', itemNumber: 103 },
        { id: '4', text: 'Defect 4', timestamp: now - 130 * 60 * 1000, category: 'battery', itemNumber: 104 },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 2, 'Should create 2 sessions');

      assert.equal(sessions[0].isCurrentSession, true);
      assert.equal(sessions[0].title, 'Current Session');
      assert.equal(sessions[0].entries.length, 2);

      assert.equal(sessions[1].isCurrentSession, false);
      assert.ok(sessions[1].title.startsWith('Session — '));
      assert.equal(sessions[1].entries.length, 2);
    });

    it('4.4: splits sessions across midnight (day boundary) even if time gap is < 30 minutes', () => {
      const now = new Date(2026, 7, 16, 0, 10).getTime(); // 00:10 on Aug 16
      const entries: HistoryEntry[] = [
        { id: '1', text: 'Defect Today 1', timestamp: new Date(2026, 7, 16, 0, 5).getTime() },
        // 10 minutes prior, but on previous day (Aug 15 23:55)
        { id: '2', text: 'Defect Yesterday 1', timestamp: new Date(2026, 7, 15, 23, 55).getTime() },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.equal(sessions.length, 2, 'Must split across calendar day boundary');
      assert.equal(sessions[0].isCurrentSession, true);
      assert.equal(sessions[0].title, 'Current Session');
      assert.ok(sessions[1].title.startsWith('Yesterday — '));
    });

    it('4.5: automatically sorts unsorted input timestamps in descending order', () => {
      const now = new Date(2026, 7, 16, 12, 0).getTime();
      const entries: HistoryEntry[] = [
        { id: 'oldest', text: 'Oldest', timestamp: now - 60 * 60 * 1000 },
        { id: 'newest', text: 'Newest', timestamp: now - 2 * 60 * 1000 },
        { id: 'middle', text: 'Middle', timestamp: now - 30 * 60 * 1000 },
      ];

      const sessions = groupHistoryIntoSessions(entries, now);
      assert.ok(sessions.length >= 1);
      assert.equal(sessions[0].entries[0].id, 'newest', 'Newest entry must be first in first session');
    });
  });

  // =========================================================================
  // 5. normalizeHistoryEntry & filterHistoryEntries
  // =========================================================================
  describe('5. Normalization & In-Drawer Filtering', () => {
    it('5.1: normalizeHistoryEntry handles legacy strings and activeItems metadata lookup', () => {
      const activeItems: QCItem[] = [
        { id: 'c1', n: 105, t: 'Dead Pixel in Center LCD', c: 'screen' },
      ];

      const normalized = normalizeHistoryEntry('Dead Pixel in Center LCD', activeItems);
      assert.equal(normalized.text, 'Dead Pixel in Center LCD');
      assert.equal(normalized.itemNumber, 105);
      assert.equal(normalized.category, 'screen');
      assert.equal(normalized.source, 'single');
    });

    it('5.2: normalizeHistoryEntry fills missing category and number for incomplete objects', () => {
      const activeItems: QCItem[] = [
        { id: 'c2', n: 202, t: 'Battery swollen 2mm', c: 'battery' },
      ];

      const raw = { text: 'Battery swollen 2mm' };
      const normalized = normalizeHistoryEntry(raw, activeItems);
      assert.equal(normalized.text, 'Battery swollen 2mm');
      assert.equal(normalized.itemNumber, 202);
      assert.equal(normalized.category, 'battery');
    });

    it('5.3: filterHistoryEntries filters by search query across text, category, and #itemNumber', () => {
      const entries: HistoryEntry[] = [
        { id: '1', text: 'Main screen flickering', category: 'screen', itemNumber: 101, timestamp: 1000 },
        { id: '2', text: 'Battery draining fast', category: 'battery', itemNumber: 205, timestamp: 2000 },
        { id: '3', text: 'Camera lens blur', category: 'camera', itemNumber: 301, timestamp: 3000 },
      ];

      // Filter by category
      const screenOnly = filterHistoryEntries(entries, '', 'screen');
      assert.equal(screenOnly.length, 1);
      assert.equal(screenOnly[0].id, '1');

      // Filter by text query
      const batterySearch = filterHistoryEntries(entries, 'draining', 'all');
      assert.equal(batterySearch.length, 1);
      assert.equal(batterySearch[0].id, '2');

      // Filter by item number query
      const numSearch = filterHistoryEntries(entries, '#301', 'all');
      assert.equal(numSearch.length, 1);
      assert.equal(numSearch[0].id, '3');
    });
  });
});
