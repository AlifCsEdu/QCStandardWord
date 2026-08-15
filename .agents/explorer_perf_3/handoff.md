# Handoff Report — Explorer 3 (Search Engine & Component Render Profiler)

## 1. Observation

### Search Engine & Filtering Overhead (`src/utils/searchEngine.ts`)
- **Linear Enrichment on Every Search Call**: `searchQCItems` calls `filtered.map(enrichItem)` (`src/utils/searchEngine.ts:302`) on every character input or view change. `enrichItem` (lines 85-96) executes regex tokenization (`.split(/[^a-z0-9]+/)`), lowercasing, and multiple string norm operations for every item on every search event.
- **Eager Highlight Generation**: `highlightText` (lines 220-225) is called during scoring (lines 312, 358) for *all candidate items* in `searchQCItems` before pagination or rendering. `highlightSegments` performs repeated `indexOf` lookups, sorting of interval tuples, string slicing, and fallback Levenshtein/subsequence matching across the entire matching dataset.
- **Memory Allocation in Levenshtein Distance (`lev`)**: `lev` (lines 20-47) allocates two new arrays (`prev = new Array<number>(n + 1)` and `cur = new Array<number>(n + 1)`) on every single invocation. `matchTerm` invokes `lev` for every word token in item titles during fuzzy matching.
- **Quadratic Sorting in `recent` Category**: Sorting by `recentsList` index (lines 258-273) invokes `recentsList.indexOf(...)` inside the `.sort()` comparator function up to $O(N \log N)$ times, leading to $O(N \log N \times K)$ linear array scans.

### Caching & Memoization Bottlenecks (`src/hooks/useQCState.ts` & `src/App.tsx`)
- **Redundant Array Iterations for Category Counts**: `categoryCounts` in `App.tsx` (lines 143-153) calls `activeItems.filter(...)` to compute pinned counts, creating temporary array allocations on every render.
- **Unstable Handlers passed from `AppContent`**: Inline callbacks such as `onClearSearch={() => setSearchQuery('')}` (line 260) and un-memoized handlers (`handleToggleTheme`, `toggleMobile`) create fresh function references on every render of `AppContent`, breaking downstream memoization.

### Component Render & DOM Overhead (`src/components/`)
- **Unmemoized Top-Level View Components**: `WordingContainer` (`src/components/WordingContainer.tsx`), `WordingGrid` (`src/components/WordingGrid.tsx`), `WordingTable` (`src/components/WordingTable.tsx`), `AppHeader`, `StatsDashboard`, `HistoryBar`, and `EditToolbar` are NOT wrapped in `React.memo`. Any state change in `AppContent` (such as `scrollY`, `spotlightOpen`, or `mobileOpened`) triggers a full re-render of the entire component tree.
- **DOM Node Explosion Without Virtualization**: `WordingList`, `WordingGrid`, and `WordingTable` map over all `results` and render every `DefectCard` directly into the DOM (300+ cards). Each card includes Lucide icons, category badges, inline styles, action buttons, and Radix `DropdownMenu` components. Rendering 300 cards creates over 3,000 DOM nodes simultaneously.

### Empirical Latency Benchmark Failures (`tests/m2-challenger-latency-stress.test.ts`)
- **Scenario 6 High-Volume Operations Latency Test**:
  - Measured: `12,904.81ms`
  - Limit: `< 1,000ms` (Exceeds threshold by 12.9x)
- **Rapid Category Switching Stress Test (75 switches)**:
  - Measured: `18,914.03ms`
  - Limit: `< 1,000ms` (Exceeds threshold by 18.9x)
- **Combined View Switching and Search Latency Stress Test**:
  - Measured: `5,727.35ms`
  - Limit: `< 1,000ms` (Exceeds threshold by 5.7x)

---

## 2. Logic Chain

1. **Premise A (Search Engine Efficiency)**: Search responsiveness depends on minimizing work done per character keystroke. Pre-enriching item text once when data changes, reusing memory buffers in Levenshtein calculations, and deferring string highlighting to render time eliminates redundant regex splits, string normalizations, and array allocations.
2. **Premise B (React Render Tree Efficiency)**: When top-level layout wrappers (`WordingContainer`, `WordingGrid`, `WordingTable`) lack `React.memo` and receive un-memoized props, state changes unrelated to list content (e.g. scroll position, modal visibility) force full re-renders of all card items.
3. **Premise C (DOM Mounting Bottleneck)**: When filtering or switching categories across 15 categories rapidly (75 switches), mounting and unmounting 300+ full React component cards with multiple nested SVG icons and Radix primitives creates heavy DOM reflow and layout churn.
4. **Deduction**: Combining pre-enriched search indexing, deferred highlight parsing, component memoization (`React.memo`), stable function callbacks, and DOM list virtualization/windowing (or slice rendering) will reduce DOM node count by ~90% and lower search & category-switch latency from 18,914ms to strictly below the 1,000ms threshold.

---

## 3. Caveats

- **Test Harness DOM Expectations**: `tests/harness.js` query methods (e.g. `getVisibleItems()`) query DOM selectors like `#listwrap .row, #listwrap .gcard, #listwrap .trow`. Virtualization or windowing must ensure that all matching items required by tests remain queryable or that visible items in the window accurately satisfy test assertions without breaking DOM selector contracts.
- **Highlight Segment Semantics**: `highlightText` returns string HTML formatted with `<mark>`. If highlight text computation is deferred to `DefectCard`, card rendering must handle string escaping safely.
- **Read-Only Scope**: This report provides analysis and proposed code structures; source code implementation will be performed by implementer agents.

---

## 4. Conclusion & Proposed Optimizations

### Optimization Proposal 1: Search Engine Pre-Enrichment & Buffer Reuse (`src/utils/searchEngine.ts`)
- **Pre-Enrichment Cache**: Maintain a memoized/pre-computed cache of `EnrichedItem` objects for `activeItems`. Tokenize titles and build haystacks only when dataset items are added/modified.
- **Deferred Highlighting**: Remove `highlightText` calls from the search scoring loop in `searchQCItems`. Store search token match indices or pass `query` to `DefectCard` so highlighting is computed lazily during component render.
- **Levenshtein Buffer Reuse**: Use static/reusable `Int32Array` buffers for `prev` and `cur` rows in `lev(a, b, cap)` to eliminate array creation per word match.
- **Recents Map Indexing**: Build a `Map<string | number, number>` for `recentsList` lookup prior to sorting in `category === 'recent'`.

### Optimization Proposal 2: React Component Memoization & Prop Stability (`src/components/`)
- Wrap `WordingContainer`, `WordingGrid`, `WordingTable`, `AppHeader`, `StatsDashboard`, `HistoryBar`, and `EditToolbar` in `React.memo`.
- Wrap inline callbacks in `AppContent` (`onClearSearch`, `handleToggleTheme`, `toggleMobile`, `scrollToTop`) with `useCallback`.
- Optimize `categoryCounts` in `App.tsx` to compute all category counts in a single $O(N)$ pass over `activeItems` without intermediate `.filter()` array creations.

### Optimization Proposal 3: DOM Node Virtualization / Windowing (`src/components/WordingContainer.tsx`)
- Implement windowed rendering (or infinite scroll / viewport slicing of 40-50 visible items) for list/grid/table views to keep DOM node count low (~400 nodes instead of 4,000 nodes).
- Conditionally render or lazy-load Radix `DropdownMenu` inside `DefectCard` only when the pin menu is opened.

---

## 5. Verification Method

To verify performance improvements after implementation:
1. Run latency stress test suite:
   ```bash
   npx tsx --test tests/m2-challenger-latency-stress.test.ts
   ```
2. Verify all latency test scenarios pass comfortably under the 1000ms threshold:
   - Scenario 6 High-Volume Latency (< 1000ms, down from 12,904ms)
   - Rapid Category Switching Latency (75 switches) (< 1000ms, down from 18,914ms)
   - Combined View Switch & Search Latency (< 1000ms, down from 5,727ms)
3. Run full project test suite to verify 100% test pass rate:
   ```bash
   npm run test
   ```
4. Verify clean production build:
   ```bash
   npm run build
   ```
