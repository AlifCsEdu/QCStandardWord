# Handoff Report: History Store & Auto-Sessions Architecture (Survey 2)

## 1. Observation
- **Authoritative Request**: `ORIGINAL_REQUEST.md` (lines 16-20) specifies:
  - Time-based auto-sessions grouping copied defect items (Current Session, Session — HH:MM, Earlier Today, Yesterday) based on activity timestamps.
  - Category badges, icons, and left accent border with category colors matching the app.
  - Category filter and search within History drawer.
  - Session actions: "Copy All in Session", "Add Session to Batch Queue", per-item re-copy/pin actions.
- **Current History Architecture**:
  - `src/types/qc.ts`: Defines `HistoryEntry` (id, text, itemNumber?, category?, timestamp, source?).
  - `src/hooks/useQCState.ts` (lines 124-143, 562-646): Manages `historyEntries` (persisted in `qc-history-entries`), `recents` (persisted in `qc-recents` and `qc-history`), `batchQueue` (persisted in `qc-batch`).
  - `src/components/DefectCard.tsx` (line 61): Currently invokes `onCopyItem(item.t)` without passing `{ itemNumber: item.n, category: item.c }`.
  - `src/components/HistoryDrawer.tsx` (lines 1-328): Radix Sheet rendering a flat list of `HistoryEntry` elements without session grouping or in-drawer category filter pills.
  - `src/utils/timeUtils.ts` (lines 1-40): Provides `formatRelativeTime` and `formatFullDateTime`.
  - `src/utils/categoryColors.ts` (lines 122-194): Provides `getCategoryBadgeStyle`, `getCategoryLeftBorderStyle`, `getCategoryColor`, and `renderCategoryIcon`.
- **Test Infrastructure**:
  - `tests/r4-history-drawer.test.js`, `tests/challenger2-production-edgecases.test.ts`, and `tests/harness.js` expect specific DOM selectors: `#historyDrawer`, `#histlist`, `.hitem`, `[data-testid="history-entry"]`, `[data-testid="history-text"]`, `[data-testid="history-time"]`, `.rpill`, `[data-testid="history-add-all-batch"]`, `#hchips .hchip`, `#hclearAll`.

## 2. Logic Chain
1. **From Flat List to Auto-Sessions**:
   - Observations show history entries currently store `timestamp: number` in milliseconds.
   - By applying a 30-minute idle gap threshold (`SESSION_GAP_MS = 1800000`) and calendar day boundary grouping, entries can be clustered into `HistorySession` objects in $O(N)$ time.
   - The newest cluster created within 30 minutes of `Date.now()` is labeled "Current Session" (with an active status dot), while earlier clusters are labeled "Session — HH:MM", "Yesterday — HH:MM", or "Month Day, Year — HH:MM".
2. **From Plain Text to Category Accents**:
   - When a defect is copied from `DefectCard.tsx`, passing metadata `{ itemNumber: item.n, category: item.c }` ensures category information is permanently attached to the `HistoryEntry`.
   - For legacy or missing category entries, `pushHistoryEntry` / `normalizeHistoryEntry` looks up `activeItems.find(i => i.t === text)`.
   - Applying `getCategoryLeftBorderStyle(category)` and `renderCategoryIcon` in each item card produces the required visual accent and cohesive surface design.
3. **In-Drawer Filtering & Dual-Level Actions**:
   - Filtering `historyEntries` by search query AND active category filter chip before grouping into sessions provides instant, reactive updates without ghost empty sessions.
   - Adding session-level actions ("Copy All in Session" and "Add Session to Batch Queue") utilizes existing clipboard and `setBatchQueue` primitives without breaking individual item actions.
4. **Backward Compatibility**:
   - Preserving simultaneous writes to `qc-history-entries`, `qc-recents`, and `qc-history` ensures 100% test compatibility and seamless user migration.

## 3. Caveats
- No direct source code changes were made during this investigation phase (Explorer role constraint).
- Timezone and locale-sensitive formatting (`toLocaleTimeString`, `toLocaleDateString`) should use standard JavaScript `Intl.DateTimeFormat` or `new Date()` options to ensure cross-platform consistency.

## 4. Conclusion
The proposed architecture provides a complete, clean, and non-breaking implementation plan for Requirement R2:
- Create `src/utils/historySessions.ts` for session grouping logic and time formatting.
- Create `src/utils/historySessions.test.ts` for unit test coverage.
- Update `src/types/qc.ts` with `HistorySession` interface.
- Update `src/hooks/useQCState.ts` with metadata enrichment and session action helpers.
- Update `src/components/DefectCard.tsx` to pass category metadata on copy.
- Upgrade `src/components/HistoryDrawer.tsx` to render Warm Charcoal multi-layer session cards, category filter chips, search input, and session-level actions.
- Update `tests/r4-history-drawer.test.js` to assert auto-session grouping, session actions, and category filtering.

## 5. Verification Method
1. **TypeScript Typecheck**:
   `npm run lint` (`tsc --noEmit`)
2. **Full Production Build**:
   `npm run build` (`tsc && vite build`)
3. **Full Test Suite Execution**:
   `npm test` (`npx tsx --test --test-concurrency=1 "tests/**/*.{js,ts}"`)
4. **Target Files to Inspect**:
   - `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_explorer_survey_2\analysis.md`
   - `src/components/HistoryDrawer.tsx`
   - `src/hooks/useQCState.ts`
   - `src/types/qc.ts`
