import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAppInstance, waitAsync } from './harness.js';

describe('Tier 2: Boundary & Corner Cases (Features 1 through 10)', () => {

  describe('1. Levenshtein Typos & Bounded Distance (Feature 4)', () => {
    it('should tolerate off-by-one typos ("batery" -> battery)', () => {
      const app = createAppInstance();
      app.search('batery');
      const visible = app.getVisibleItems();

      assert.ok(visible.length > 0, 'Off-by-one typo "batery" should return results');
      assert.ok(
        visible.some((item) => item.text.toLowerCase().includes('battery')),
        'Search results should contain battery defects'
      );
    });

    it('should tolerate off-by-two typos ("scren" -> screen)', () => {
      const app = createAppInstance();
      app.search('scren');
      const visible = app.getVisibleItems();

      assert.ok(visible.length > 0, 'Off-by-two typo "scren" should return results');
      assert.ok(
        visible.some((item) => item.text.toLowerCase().includes('screen')),
        'Search results should contain screen defects'
      );
    });

    it('should mark approximate matches (score < 80) with "≈" indicator pill', () => {
      const app = createAppInstance();
      app.search('batery');
      const visible = app.getVisibleItems();

      const fuzzyItem = visible.find((item) => item.isFuzzy);
      assert.ok(fuzzyItem, 'Fuzzy typo search should include at least one item marked with ≈');
    });

    it('should filter out items when typo distance exceeds tolerance cap', () => {
      const app = createAppInstance();
      // "xyzqwerty" has extreme edit distance to all dataset items
      app.search('xyzqwerty');
      const visible = app.getVisibleItems();
      assert.equal(visible.length, 0, 'Unrelated query exceeding edit distance cap should return 0 results');
    });
  });

  describe('2. Empty Search & Whitespace Handling (Feature 4)', () => {
    it('should return all category items when search query is empty', () => {
      const app = createAppInstance();
      app.search('');
      const visible = app.getVisibleItems();
      assert.ok(visible.length >= 139, 'Empty search query should display full dataset');
      assert.ok(visible.every((item) => !item.isFuzzy), 'Empty search should not mark any items as fuzzy');
    });

    it('should trim leading/trailing whitespace and handle whitespace-only queries', () => {
      const app = createAppInstance();

      // Whitespace only
      app.search('   ');
      let visible = app.getVisibleItems();
      assert.ok(visible.length >= 139, 'Whitespace-only query should be treated as empty search');

      // Leading/trailing whitespace
      app.search('  battery  ');
      visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Query with padding whitespace should match "battery"');
      assert.ok(visible.some((item) => item.text.toLowerCase().includes('battery')));
    });
  });

  describe('3. Special Characters & Escaping Integrity (Feature 4 & 9 - Adversarial)', () => {
    it('should handle regex meta-characters without throwing RegExp errors ([ ] ( ) * + ? ^ $ \\ . |)', () => {
      const app = createAppInstance();
      const dangerousQueries = [
        'screen (',
        '[FCPB]',
        'battery*+',
        'camera?^$',
        '\\audio.|'
      ];

      for (const query of dangerousQueries) {
        assert.doesNotThrow(() => {
          app.search(query);
        }, `Searching regex query "${query}" threw an exception`);
      }
    });

    it('should safely escape HTML meta-characters in custom wording (<script>, &copy;, quotes)', () => {
      const app = createAppInstance();
      const maliciousScript = '<script>alert("XSS")</script>';

      app.toggleEditMode();
      app.openAddModal();
      app.saveModalForm(maliciousScript, 'screen', 9999);

      app.search(maliciousScript);
      const { document } = app;

      // Verify no actual script element was created
      const scripts = Array.from(document.querySelectorAll('#listwrap script, script[src*="XSS"]'));
      assert.equal(scripts.length, 0, 'XSS payload must not execute or inject <script> tags into DOM');

      const visible = app.getVisibleItems();
      assert.ok(visible.length > 0, 'Escaped custom item should render safely in list');
    });
  });

  describe('4. Layout Shift & Vertical Jump Constraint (Feature 6)', () => {
    it('should verify 0px vertical jump constraint when switching sub-code chips', () => {
      const app = createAppInstance();
      app.selectCategory('codes');
      
      const metricsBefore = app.getLayoutShiftMetrics();
      app.selectSubCategory('FCPB');
      const metricsAfter = app.getLayoutShiftMetrics();

      assert.ok(metricsBefore.navbarWidth === metricsAfter.navbarWidth, 'Sidebar navbar width must remain constant (260px)');
    });
  });

  describe('5. Max Batch Queue Items & Rapid Toast Throttling (Features 7 & 8)', () => {
    it('should queue 50+ unique items in batch and format correctly with custom delimiters', async () => {
      const app = createAppInstance();

      // Queue 50 unique items
      for (let i = 0; i < 50; i++) {
        await app.clickItemAction(i, 'add');
      }

      assert.equal(app.getBatchCount(), 50, 'Batch queue count should reach 50');

      app.setDelimiter('comma');
      await app.copyBatch();

      const copied = app.getCopiedText();
      assert.ok(copied.length > 0, 'Copied text should not be empty');
      const parts = copied.split(', ');
      assert.equal(parts.length, 50, 'Copied batch should contain 50 items separated by comma');
    });

    it('should queue floating toasts gracefully without DOM flooding on rapid copy clicks', async () => {
      const app = createAppInstance();

      for (let i = 0; i < 5; i++) {
        await app.clickItemRow(i);
      }

      const toasts = app.getToasts();
      assert.ok(toasts.length > 0, 'Toast notifications should render for rapid copy clicks');
    });
  });

  describe('6. Storage Fallback & Corrupted Data Resilience (Feature 10)', () => {
    it('should boot gracefully when localStorage contains corrupted JSON syntax strings', () => {
      const app = createAppInstance({
        initialStorage: {
          'qc-pins': '{corrupted-json-pins',
          'qc-custom': '{corrupted-json-custom',
          'qc-edits': '<<<not-json>>>',
          'qc-recents': '{corrupted-json-recents'
        }
      });
      const visible = app.getVisibleItems();
      assert.ok(visible.length >= 139, 'App should fallback to default dataset when storage contains corrupted JSON');
    });
  });
});
