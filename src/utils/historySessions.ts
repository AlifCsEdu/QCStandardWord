import type { HistoryEntry, HistorySession, QCItem } from '../types/qc.ts';

/**
 * 30-minute idle gap threshold in milliseconds for session clustering.
 */
export const SESSION_GAP_MS = 30 * 60 * 1000; // 1,800,000 ms

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Checks if two timestamps or Date objects are on the same calendar day.
 */
export function isSameCalendarDay(d1: Date | number, d2: Date | number): boolean {
  const date1 = typeof d1 === 'number' ? new Date(d1) : d1;
  const date2 = typeof d2 === 'number' ? new Date(d2) : d2;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Checks if the given timestamp occurred on the day prior to nowRef.
 */
export function isYesterday(d: Date | number, nowRef: Date | number): boolean {
  const date = typeof d === 'number' ? new Date(d) : d;
  const nowDate = typeof nowRef === 'number' ? new Date(nowRef) : nowRef;
  const yesterday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 1);
  return isSameCalendarDay(date, yesterday);
}

/**
 * Formats a timestamp into HH:MM AM/PM string.
 */
export function formatSessionTime(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return '';
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  return `${displayHours}:${minutes} ${ampm}`;
}

/**
 * Formats a timestamp into "[Month] [Day], [Year]" string (e.g. "Aug 14, 2026").
 */
export function formatSessionDate(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return '';
  const date = new Date(timestamp);
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Dynamic session title generator:
 * - "Current Session" (<30 min from now on the current day)
 * - "Session — HH:MM" (earlier today)
 * - "Yesterday — HH:MM" (prior day)
 * - "[Month] [Day], [Year] — HH:MM" (earlier dates)
 */
export function formatSessionTitle(
  endTime: number,
  isCurrentSession: boolean,
  now: number = Date.now()
): string {
  if (isCurrentSession) {
    return 'Current Session';
  }
  const timeStr = formatSessionTime(endTime);
  if (isSameCalendarDay(endTime, now)) {
    return `Session — ${timeStr}`;
  }
  if (isYesterday(endTime, now)) {
    return `Yesterday — ${timeStr}`;
  }
  const dateStr = formatSessionDate(endTime);
  return `${dateStr} — ${timeStr}`;
}

/**
 * Dynamic session subtitle generator:
 * - "Active session • N items"
 * - "Earlier today • N items"
 * - "Yesterday • N items"
 * - "[Month] [Day] • N items"
 */
export function formatSessionSubtitle(
  count: number,
  isCurrentSession: boolean,
  endTime: number,
  now: number = Date.now()
): string {
  const itemText = count === 1 ? '1 item' : `${count} items`;
  if (isCurrentSession) {
    return `Active session • ${itemText}`;
  }
  if (isSameCalendarDay(endTime, now)) {
    return `Earlier today • ${itemText}`;
  }
  if (isYesterday(endTime, now)) {
    return `Yesterday • ${itemText}`;
  }
  const date = new Date(endTime);
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day} • ${itemText}`;
}

/**
 * Formats a time range for a session (e.g. "10:45 AM – 10:58 AM" or "10:45 AM").
 */
export function formatSessionTimeRange(startTime: number, endTime: number): string {
  const startStr = formatSessionTime(startTime);
  const endStr = formatSessionTime(endTime);
  if (startStr === endStr) return startStr;
  return `${startStr} – ${endStr}`;
}

/**
 * Groups history entries into time-clustered auto-sessions:
 * 1. Clusters entries with gap <= 30 minutes on the same calendar day.
 * 2. Starts a new session when idle gap > 30 minutes or crossing midnight.
 * 3. Assigns dynamic titles ("Current Session", "Session — HH:MM", "Yesterday — HH:MM", "[Month] [Day], [Year] — HH:MM").
 */
export function groupHistoryIntoSessions(
  entries: HistoryEntry[],
  now: number = Date.now()
): HistorySession[] {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  // Filter valid entries, ensuring numeric timestamp and non-empty text
  const validEntries = entries
    .filter((e) => e && typeof e === 'object' && (e.text || typeof e.text === 'string'))
    .map((e) => ({
      ...e,
      text: String(e.text || '').trim(),
      timestamp: typeof e.timestamp === 'number' && !isNaN(e.timestamp) ? e.timestamp : now,
    }))
    .sort((a, b) => b.timestamp - a.timestamp); // Newest first

  if (validEntries.length === 0) return [];

  const rawGroups: HistoryEntry[][] = [];
  let currentGroup: HistoryEntry[] = [];

  for (let i = 0; i < validEntries.length; i++) {
    const entry = validEntries[i];
    if (currentGroup.length === 0) {
      currentGroup.push(entry);
    } else {
      const prevEntry = currentGroup[currentGroup.length - 1];
      const timeDiff = prevEntry.timestamp - entry.timestamp; // since sorted descending, prevEntry is newer
      const diffDay = !isSameCalendarDay(prevEntry.timestamp, entry.timestamp);

      if (timeDiff > SESSION_GAP_MS || diffDay) {
        rawGroups.push(currentGroup);
        currentGroup = [entry];
      } else {
        currentGroup.push(entry);
      }
    }
  }

  if (currentGroup.length > 0) {
    rawGroups.push(currentGroup);
  }

  return rawGroups.map((sessionEntries, idx) => {
    const timestamps = sessionEntries.map((e) => e.timestamp);
    const startTime = Math.min(...timestamps);
    const endTime = Math.max(...timestamps);
    const isFirstGroup = idx === 0;
    const isWithinActiveWindow =
      now - endTime < SESSION_GAP_MS && isSameCalendarDay(endTime, now);
    const isCurrentSession = isFirstGroup && isWithinActiveWindow;

    const title = formatSessionTitle(endTime, isCurrentSession, now);
    const subtitle = formatSessionSubtitle(sessionEntries.length, isCurrentSession, endTime, now);
    const id = `session_${startTime}_${endTime}_${sessionEntries.length}`;

    return {
      id,
      title,
      subtitle,
      startTime,
      endTime,
      isCurrentSession,
      entries: sessionEntries,
    };
  });
}

/**
 * Normalizes raw or legacy history entry representations into a valid HistoryEntry object.
 */
export function normalizeHistoryEntry(raw: any, activeItems: QCItem[] = []): HistoryEntry {
  if (typeof raw === 'string') {
    const matched = activeItems.find((i) => i.t === raw);
    return {
      id: 'h_migrated_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      text: raw,
      itemNumber: matched?.n,
      category: matched?.c,
      timestamp: Date.now(),
      source: 'single',
    };
  }

  const text = String(raw?.text || '').trim();
  const matched = (!raw?.category || !raw?.itemNumber) ? activeItems.find((i) => i.t === text) : null;

  return {
    id: raw?.id || 'h_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    text,
    itemNumber: typeof raw?.itemNumber === 'number' ? raw.itemNumber : matched?.n,
    category: raw?.category || matched?.c || 'general',
    timestamp: typeof raw?.timestamp === 'number' && !isNaN(raw.timestamp) ? raw.timestamp : Date.now(),
    source: raw?.source === 'batch' ? 'batch' : 'single',
  };
}

/**
 * Filters a list of HistoryEntry items by search query and category.
 */
export function filterHistoryEntries(
  entries: HistoryEntry[],
  query = '',
  category = 'all'
): HistoryEntry[] {
  const cleanQ = query.trim().toLowerCase();
  const cleanCat = category.trim().toLowerCase();

  return entries.filter((entry) => {
    if (cleanCat && cleanCat !== 'all') {
      if (!entry.category || entry.category.toLowerCase() !== cleanCat) {
        return false;
      }
    }

    if (!cleanQ) return true;

    const matchesText = entry.text.toLowerCase().includes(cleanQ);
    const matchesCat = entry.category ? entry.category.toLowerCase().includes(cleanQ) : false;
    const matchesNum = entry.itemNumber ? String(entry.itemNumber).includes(cleanQ) || `#${entry.itemNumber}`.includes(cleanQ) : false;

    return matchesText || matchesCat || matchesNum;
  });
}
