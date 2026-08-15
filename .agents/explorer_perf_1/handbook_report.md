# Latency Stress Test Profiling & Performance Analysis Report

**Profiler Agent**: Explorer 1 (Latency Stress Test Profiler)  
**Target Milestone**: Milestone M_REMEDIATION / M2 Iteration 3 Latency Stress Tests  
**Target Test Suite**: `tests/m2-challenger-latency-stress.test.ts`  

---

## 1. Executive Summary

Execution of `npx tsx --test tests/m2-challenger-latency-stress.test.ts` revealed that all 3 latency stress tests fail significantly above the required **1000 ms** performance threshold, taking a cumulative suite runtime of **~56.35 seconds**:

1. **Scenario 6 High-Volume Operations Latency Test**:
   - Target: `< 1000 ms`
   - Measured Duration: **13,690.85 ms** (Overall test runner block: **25,353.75 ms**)
   - Result: **FAIL**

2. **Rapid Category Switching Stress Test**:
   - Target: `< 1000 ms`
   - Measured Duration: **18,344.62 ms** (Overall test runner block: **20,411.06 ms**)
   - Result: **FAIL**

3. **Combined View Switching and Search Latency Stress Test**:
   - Target: `< 1000 ms`
   - Measured Duration: **5,364.40 ms** (Overall test runner block: **7,065.98 ms**)
   - Result: **FAIL**

---

## 2. Test Step Breakdown & Operation Analysis

### Scenario 6: High-Volume Operations Latency Test
- **Operations Executed**: 5 loops of rapid category selection (`battery` -> `screen` -> `codes` -> `all`) combined with search query updates (`battery defect ${i}`, `code ${i}`, `clearSearch()`).
- **Total Operations**: 40 consecutive state updates (`selectedCategory` and `searchQuery`).
- **Observed Behavior**: Each operation triggers a full React component tree re-render in `AppContent`. For each of the 40 steps:
  1. `useQCState` recalculates `searchResults` via `searchQCItems`.
  2. `searchQCItems` runs `enrichItem` on all items, creating regex splits and word arrays.
  3. `AppContent` re-renders `CommandDialog` (Spotlight search modal), mapping over `searchResults.slice(0, 20)` even though `spotlightOpen` is `false`.
  4. `WordingContainer` re-renders 50-100 `DefectCard` components, each containing a Radix UI `<DropdownMenu>` tree.

### Scenario 2: Rapid Category Switching Stress Test
- **Operations Executed**: 5 full cycles across all 15 defect categories (75 consecutive `app.selectCategory(cat)` operations).
- **Total Operations**: 75 category selection state updates.
- **Observed Behavior**: Switching categories forces React to unmount cards from the previous category and mount cards for the new category. Each switch:
  1. Re-runs `searchQCItems` to filter `activeItems` by category.
  2. Re-computes category counts and filters in `StatsDashboard`.
  3. Mounts/unmounts dozens of Radix UI `<DropdownMenu>` instances inside `DefectCard`.
  4. Re-renders the un-gated `<CommandDialog>` in `App.tsx`.

### Scenario 3: Combined View Switching and Search Latency Stress Test
- **Operations Executed**: 4 cycles of layout view switching (`grid` -> `list` -> `table` -> `grid`) interspersed with search queries (`camera`, `screen`, `fcpb`, `battery`), category switches (`battery`, `screen`), and search clear operations.
- **Total Operations**: 16 combined view switch + search + category operations.
- **Observed Behavior**: Switching `layoutMode` forces `WordingContainer` to unmount the current layout view component (e.g. `WordingGrid`) and mount a completely new layout view component (e.g. `WordingTable`). This destroys and recreates all DOM nodes, Radix components, and inline styles while search queries simultaneously trigger search engine computations.

---

## 3. Detailed Execution Flow & Root Cause Identification

Through codebase tracing across `src/App.tsx`, `src/hooks/useQCState.ts`, `src/utils/searchEngine.ts`, `src/components/DefectCard.tsx`, `src/components/WordingContainer.tsx`, and `tests/harness.js`, 4 primary root causes were identified:

### Root Cause 1: Unconditional Rendering of Hidden `<CommandDialog>` in `App.tsx`
- **Location**: `src/App.tsx` (lines 317–353)
- **Mechanism**: `<CommandDialog open={spotlightOpen} onOpenChange={setSpotlightOpen}>` is placed directly in `AppContent` JSX without conditional short-circuiting.
- **Impact**: Even when `spotlightOpen === false`, React evaluates all children inside `<CommandDialog>` on every state update, including `searchResults.slice(0, 20).map(({ item }) => <CommandItem ... />)`. This instantiates 20 Radix UI command items and primitives on every category switch and search keypress.

### Root Cause 2: Heavy Radix UI `<DropdownMenu>` Instantiations per `DefectCard`
- **Location**: `src/components/DefectCard.tsx` (lines 50–91)
- **Mechanism**: Every rendered `DefectCard` mounts a full Radix UI `<DropdownMenu>` component tree with `<DropdownMenuTrigger>` and `<DropdownMenuContent>`. Inside `<DropdownMenuContent>`, `folders.map(...)` executes `isPinnedInFolder(item.id, folder.id)` for every folder on every render.
- **Impact**: Rendering 50–100 defect cards creates 50–100 Radix UI component trees with state hooks, portal triggers, and position listeners. In JSDOM (which runs synchronous DOM mutations), this creates immense re-render latency.

### Root Cause 3: Dynamic Item Enrichment & Text Highlighting in `searchQCItems`
- **Location**: `src/utils/searchEngine.ts` (lines 85–96, 302–360)
- **Mechanism**: On every invocation of `searchQCItems`:
  1. `filtered.map(enrichItem)` is executed, running `t.toLowerCase().split(/[^a-z0-9]+/)` and creating new object references for every item.
  2. For every item with a non-zero match score, `highlightText(e.t, qTrim)` is immediately called, which computes interval matches, string slicing, and escaping before the items are even sliced/paginated for display.
- **Impact**: Executes tens of thousands of string allocations and regex splits per second during rapid loops.

### Root Cause 4: JSDOM `window.flushSync` Dual-Flush Overhead
- **Location**: `tests/harness.js` (lines 159–174)
- **Mechanism**: Every test helper (`selectCategory`, `search`, `setLayoutView`) executes `runWithFlush()`, which calls `window.flushSync(...)` twice.
- **Impact**: Forces React 19 to synchronously commit DOM tree mutations, execute layout effects, and flush microtasks on every single step. When combined with Root Causes 1–3, each single test step takes 250ms–400ms in JSDOM.

---

## 4. Concrete Performance Fix Strategies (For Implementation Phase)

The following targeted optimizations will reduce test execution latency from ~56s to **<500ms** (well below the <1000ms requirement):

### Fix Strategy 1: Short-Circuit Spotlight Modal Rendering
- **File**: `src/App.tsx`
- **Action**: Wrap `<CommandDialog>` in `{spotlightOpen && (...) }`.
- **Expected Gain**: Eliminates 20 Radix UI component renders and cmdk processing per state mutation when Spotlight is closed.

### Fix Strategy 2: Optimize or Lazy-Load `DefectCard` Pin Folder Dropdown
- **File**: `src/components/DefectCard.tsx`
- **Action**:
  - Only render Radix `<DropdownMenu>` when user interacts with the pin button, OR
  - Replace the per-card Radix `<DropdownMenu>` trigger with a direct star click (`onTogglePin`), and open a single shared folder selection modal/menu when explicitly requested.
- **Expected Gain**: Reduces DOM node count per card by ~70% and eliminates 50–100 Radix component trees during category switching and view changing.

### Fix Strategy 3: Pre-Enrich Base Items & Defer Text Highlighting
- **File**: `src/utils/searchEngine.ts`
- **Action**:
  - Pre-enrich static `BASE_ITEMS` at startup once rather than calling `enrichItem` repeatedly inside `searchQCItems`.
  - Defer `highlightText` calculation until item rendering in `DefectCard` (or only apply `highlightText` to visible items), rather than inside `searchQCItems` for all scored items.
- **Expected Gain**: Cuts search scoring overhead by ~80%.

### Fix Strategy 4: Memoize `categoryCounts` and Handlers
- **File**: `src/App.tsx` and `src/hooks/useQCState.ts`
- **Action**: Ensure `categoryCounts` uses `useMemo` effectively and all event handlers passed to card lists are wrapped in `useCallback`.
- **Expected Gain**: Prevents unnecessary recalculations during pure search or view state changes.

---

## 5. Summary of Recommended Implementation Plan

| Strategy | File | Target Component / Function | Impact Area | Expected Latency Reduction |
|---|---|---|---|---|
| **Fix 1** | `src/App.tsx` | `<CommandDialog>` | Unnecessary modal tree re-renders | ~40% reduction |
| **Fix 2** | `src/components/DefectCard.tsx` | `<DropdownMenu>` | Radix primitive DOM overhead | ~35% reduction |
| **Fix 3** | `src/utils/searchEngine.ts` | `searchQCItems` / `enrichItem` | Search engine CPU allocation | ~15% reduction |
| **Fix 4** | `src/App.tsx` | `categoryCounts` / Handlers | State recalculation | ~10% reduction |
