import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BASE_ITEMS, CODE_SUBS } from '../data/qcData.ts';
import { isApprox, lev, searchQCItems, subseq } from './searchEngine.ts';

describe('Search Engine Unit Tests', () => {
  describe('Algorithm Primitives', () => {
    it('bounded Levenshtein distance lev(a, b, cap)', () => {
      assert.equal(lev('screen', 'screen', 2), 0);
      assert.equal(lev('screen', 'scrn', 2), 2);
      assert.equal(lev('screen', 'scr', 2), 3); // exceeds cap 2
    });

    it('sub-sequence matching subseq(t, h)', () => {
      assert.equal(subseq('scrn', 'screen'), true);
      assert.equal(subseq('crse', 'crease'), true);
      assert.equal(subseq('xyz', 'screen'), false);
    });

    it('approximate match detection isApprox(score)', () => {
      assert.equal(isApprox(100), false);
      assert.equal(isApprox(82), false);
      assert.equal(isApprox(72), true);
      assert.equal(isApprox(38), true);
      assert.equal(isApprox(0), false);
    });
  });

  describe('Category Filtering', () => {
    it('filters by screen category', () => {
      const results = searchQCItems(BASE_ITEMS, '', 'screen');
      assert.ok(results.length > 0);
      assert.ok(results.every((r) => r.item.c === 'screen'));
    });

    it('filters by camera category', () => {
      const results = searchQCItems(BASE_ITEMS, '', 'camera');
      assert.ok(results.length > 0);
      assert.ok(results.every((r) => r.item.c === 'camera'));
    });

    it('filters by codes category', () => {
      const results = searchQCItems(BASE_ITEMS, '', 'codes');
      assert.ok(results.length > 0);
      assert.ok(results.every((r) => r.item.c === 'codes'));
    });

    it('handles virtual view pinned', () => {
      const pinsSet = new Set(['b83', 'b2']); // Screen Crease & Symbol B
      const results = searchQCItems(BASE_ITEMS, '', 'pinned', 'ALL', pinsSet);
      assert.equal(results.length, 2);
      const ids = results.map((r) => r.item.id);
      assert.ok(ids.includes('b83'));
      assert.ok(ids.includes('b2'));
    });

    it('handles virtual view recent in order', () => {
      const recentsList = ['b83', 'b62', 'b7']; // Screen Crease, icloud Lock, Fake Battery
      const results = searchQCItems(BASE_ITEMS, '', 'recent', 'ALL', new Set(), recentsList);
      assert.equal(results.length, 3);
      assert.equal(results[0].item.id, 'b83');
      assert.equal(results[1].item.id, 'b62');
      assert.equal(results[2].item.id, 'b7');
    });
  });

  describe('Sub-category Panel Code Filtering', () => {
    it('filters by each code sub-chip', () => {
      const codeSubs = CODE_SUBS.filter((c) => c !== 'ALL');
      for (const sub of codeSubs) {
        const results = searchQCItems(BASE_ITEMS, '', 'codes', sub);
        assert.ok(results.length > 0, `Sub-category ${sub} should yield results`);
        const subLow = sub.toLowerCase();
        assert.ok(
          results.every((r) => r.item.sub === sub || r.item.t.toLowerCase().replace(/\s+/g, '').startsWith(subLow)),
          `All results for ${sub} must match sub-category code`
        );
      }
    });
  });

  describe('Typo Tolerance', () => {
    it('matches "scrn crse" to "Screen Crease"', () => {
      const results = searchQCItems(BASE_ITEMS, 'scrn crse', 'all');
      assert.ok(results.length > 0);
      assert.equal(results[0].item.t, 'Screen Crease');
    });

    it('matches "cam blur" to "Front Camera Blur" / "Rear Camera Blur"', () => {
      const results = searchQCItems(BASE_ITEMS, 'cam blur', 'all');
      assert.ok(results.length >= 2);
      const titles = results.map((r) => r.item.t);
      assert.ok(titles.includes('Front Camera Blur'));
      assert.ok(titles.includes('Rear Camera Blur'));
    });
  });

  describe('Alias Expansion', () => {
    it('expands "icloud" to lock entries', () => {
      const results = searchQCItems(BASE_ITEMS, 'icloud', 'all');
      assert.ok(results.length > 0);
      assert.ok(results.some((r) => r.item.c === 'locks' || r.item.t.toLowerCase().includes('lock')));
    });

    it('expands "display" to screen entries', () => {
      const results = searchQCItems(BASE_ITEMS, 'display', 'all');
      assert.ok(results.length > 0);
      assert.ok(results.some((r) => r.item.c === 'screen'));
    });
  });

  describe('Approximate Match Flag', () => {
    it('marks fuzzy matches with isApprox: true', () => {
      const results = searchQCItems(BASE_ITEMS, 'scrn crse', 'all');
      assert.ok(results.length > 0);
      const topMatch = results[0];
      assert.equal(topMatch.item.t, 'Screen Crease');
      assert.equal(topMatch.isApprox, true);
    });

    it('marks exact prefix matches with isApprox: false', () => {
      const results = searchQCItems(BASE_ITEMS, 'Screen Crease', 'all');
      assert.ok(results.length > 0);
      assert.equal(results[0].item.t, 'Screen Crease');
      assert.equal(results[0].isApprox, false);
    });
  });
});
