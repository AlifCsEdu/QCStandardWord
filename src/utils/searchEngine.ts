import type { CategoryKey, HighlightSegment, QCItem, SearchResult, SubCategoryCode } from '../types/qc.ts';
import { ALIAS, CATKEY } from '../data/qcData.ts';

/**
 * Escapes special HTML characters to prevent XSS / script injection when rendered via dangerouslySetInnerHTML.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Computes bounded Levenshtein distance between strings `a` and `b`.
 * Returns distance if <= `cap`, otherwise returns `cap + 1`.
 */
export function lev(a: string, b: string, cap: number): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > cap) return cap + 1;

  let prev = new Array<number>(n + 1);
  let cur = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + cost
      );
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > cap) return cap + 1;
    const t = prev;
    prev = cur;
    cur = t;
  }
  return prev[n];
}

/**
 * Checks if target string `t` is a subsequence of haystack string `h`.
 */
export function subseq(t: string, h: string): boolean {
  let i = 0;
  for (let c = 0; c < h.length && i < t.length; c++) {
    if (h[c] === t[i]) i++;
  }
  return i === t.length;
}

/**
 * Normalizes string by lowercasing and removing spaces.
 */
export function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '');
}

/**
 * Determines whether a score indicates an approximate (fuzzy) match (< 80).
 */
export function isApprox(score: number): boolean {
  return score > 0 && score < 80;
}

export interface EnrichedItem extends QCItem {
  hay: string;
  normText: string;
  titleNorm: string;
  titleWords: string[];
  words: string[];
}

/**
 * Enriches a QC item with lowercased haystack, normalized text, and token words.
 */
export function enrichItem(item: QCItem): EnrichedItem {
  const hay = (item.t + ' ' + (CATKEY[item.c] || '')).toLowerCase();
  const titleLow = item.t.toLowerCase();
  return {
    ...item,
    hay,
    normText: norm(hay),
    titleNorm: norm(titleLow),
    titleWords: titleLow.split(/[^a-z0-9]+/).filter(Boolean),
    words: hay.split(/[^a-z0-9]+/).filter(Boolean),
  };
}

/**
 * Computes match score for a single term against an enriched item.
 */
export function matchTerm(e: EnrichedItem, term: string): number {
  if (!term) return 0;
  const i = e.hay.indexOf(term);
  if (i === 0) return 100;
  if (i > 0) return 92 - Math.min(i, 24) * 0.3;
  const nt = term.replace(/\s+/g, '');
  if (nt.length > 2 && e.normText.includes(nt)) return 82;

  const tol = term.length <= 4 ? 1 : term.length <= 8 ? 2 : 3;
  let best = 0;
  for (const w of e.words) {
    if (Math.abs(w.length - term.length) <= tol) {
      const d = lev(w, term, tol);
      if (d <= tol) {
        const s = 72 - d * 18;
        if (s > best) best = s;
      }
    }
    if (term.length >= 3 && subseq(term, w)) {
      if (65 > best) best = 65;
    }
  }
  if (best) return best;

  if (term.length >= 4 && subseq(term, e.hay)) return 38;
  return 0;
}

/**
 * Splits text into segments marked with isMatch for UI rendering.
 */
export function highlightSegments(text: string, query: string): HighlightSegment[] {
  if (!query.trim()) {
    return [{ text, isMatch: false }];
  }

  const qLow = query.toLowerCase().trim();
  const tokens = qLow.split(/[^a-z0-9]+/).filter(Boolean);

  if (tokens.length === 0) {
    return [{ text, isMatch: false }];
  }

  const textLow = text.toLowerCase();
  const intervals: [number, number][] = [];

  const fullIdx = textLow.indexOf(qLow);
  if (fullIdx !== -1) {
    intervals.push([fullIdx, fullIdx + qLow.length]);
  } else {
    for (const token of tokens) {
      if (token.length === 0) continue;
      let startIdx = 0;
      while (startIdx < text.length) {
        const idx = textLow.indexOf(token, startIdx);
        if (idx === -1) break;
        intervals.push([idx, idx + token.length]);
        startIdx = idx + token.length;
      }
    }
  }

  if (intervals.length === 0) {
    const words = text.split(/(\s+)/);
    const result: HighlightSegment[] = [];
    for (const word of words) {
      const wClean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      let matched = false;
      for (const token of tokens) {
        if (!wClean || !token) continue;
        const tol = token.length <= 4 ? 1 : token.length <= 8 ? 2 : 3;
        if (Math.abs(wClean.length - token.length) <= tol && lev(wClean, token, tol) <= tol) {
          matched = true;
          break;
        }
        if (token.length >= 3 && subseq(token, wClean)) {
          matched = true;
          break;
        }
      }
      result.push({ text: word, isMatch: matched });
    }
    return result;
  }

  intervals.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const interval of intervals) {
    if (merged.length === 0) {
      merged.push(interval);
    } else {
      const last = merged[merged.length - 1];
      if (interval[0] <= last[1]) {
        last[1] = Math.max(last[1], interval[1]);
      } else {
        merged.push(interval);
      }
    }
  }

  const segments: HighlightSegment[] = [];
  let currentIdx = 0;
  for (const [start, end] of merged) {
    if (start > currentIdx) {
      segments.push({ text: text.slice(currentIdx, start), isMatch: false });
    }
    segments.push({ text: text.slice(start, end), isMatch: true });
    currentIdx = end;
  }
  if (currentIdx < text.length) {
    segments.push({ text: text.slice(currentIdx), isMatch: false });
  }

  return segments;
}

/**
 * Returns string with matching query substrings wrapped in <mark> tags.
 */
export function highlightText(text: string, query: string): string {
  const segments = highlightSegments(text, query);
  return segments
    .map((s) => (s.isMatch ? `<mark>${escapeHtml(s.text)}</mark>` : escapeHtml(s.text)))
    .join('');
}

/**
 * Main search engine function for querying, filtering, and scoring QC items.
 */
export function searchQCItems(
  items: QCItem[],
  query: string,
  category: CategoryKey = 'all',
  subCategory: SubCategoryCode = 'ALL',
  pinsSet: Set<string | number> = new Set(),
  recentsList: (string | number)[] = []
): SearchResult[] {
  let filtered = items;

  if (category === 'pinned') {
    filtered = items.filter(
      (item) =>
        pinsSet.has(item.id) ||
        pinsSet.has(item.n) ||
        pinsSet.has(String(item.id)) ||
        pinsSet.has(String(item.n))
    );
  } else if (category === 'recent') {
    const recentsSet = new Set(recentsList);
    filtered = items.filter(
      (item) =>
        recentsSet.has(item.t) ||
        recentsSet.has(item.id) ||
        recentsSet.has(item.n) ||
        recentsSet.has(String(item.id)) ||
        recentsSet.has(String(item.n))
    );
    filtered.sort((a, b) => {
      const getIdx = (item: QCItem) => {
        let i = recentsList.indexOf(item.t);
        if (i !== -1) return i;
        i = recentsList.indexOf(item.id);
        if (i !== -1) return i;
        i = recentsList.indexOf(String(item.id));
        if (i !== -1) return i;
        i = recentsList.indexOf(item.n as any);
        if (i !== -1) return i;
        return recentsList.indexOf(String(item.n) as any);
      };
      const idxA = getIdx(a);
      const idxB = getIdx(b);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });
  } else if (category !== 'all') {
    filtered = items.filter((item) => item.c === category);
  }

  if (category === 'codes' && subCategory !== 'ALL') {
    const subLow = subCategory.toLowerCase();
    filtered = filtered.filter((item) => {
      if (item.sub) {
        return item.sub === subCategory;
      }
      return norm(item.t).startsWith(subLow);
    });
  }

  const qTrim = query.trim();

  if (!qTrim) {
    return filtered.map((item) => ({
      item,
      score: 100,
      isApprox: false,
      highlightedText: item.t,
    }));
  }

  const qLow = qTrim.toLowerCase();
  const tokens = qLow.split(/[^a-z0-9]+/).filter(Boolean);

  const enriched = filtered.map(enrichItem);
  const scored: SearchResult[] = [];

  for (const e of enriched) {
    // If full exact match query matches item title
    if (e.hay.indexOf(qLow) === 0 || e.t.toLowerCase() === qLow) {
      scored.push({
        item: { id: e.id, n: e.n, t: e.t, c: e.c, sub: e.sub, custom: e.custom },
        score: 100,
        isApprox: false,
        highlightedText: highlightText(e.t, qTrim),
      });
      continue;
    }

    let itemScore = 0;
    let matchedTokenCount = 0;

    for (const token of tokens) {
      if (token.length < 2) continue;
      const termsToTry = [token];
      if (ALIAS[token]) {
        termsToTry.push(ALIAS[token]);
      }

      let bestTokenScore = 0;
      for (const tm of termsToTry) {
        const score = matchTerm(e, tm);
        if (score > bestTokenScore) {
          bestTokenScore = score;
        }
      }

      if (bestTokenScore > 0) {
        matchedTokenCount++;
        itemScore += bestTokenScore;
      }
    }

    // Check multi-token match logic
    if (tokens.length > 0 && matchedTokenCount > 0) {
      if (tokens.length > 1) {
        if (matchedTokenCount === tokens.length) {
          itemScore += 20; // Bonus for matching all query tokens
        } else {
          itemScore = Math.floor(itemScore * (matchedTokenCount / tokens.length));
        }
      }

      // Average / scale score
      const finalScore = Math.min(99, Math.round(itemScore / Math.max(1, tokens.length)));

      scored.push({
        item: { id: e.id, n: e.n, t: e.t, c: e.c, sub: e.sub, custom: e.custom },
        score: finalScore,
        isApprox: isApprox(finalScore),
        highlightedText: highlightText(e.t, qTrim),
      });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.item.n - b.item.n);

  return scored;
}
