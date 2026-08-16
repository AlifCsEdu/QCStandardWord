# Survey Analysis: History Store & Auto-Sessions Architecture (R2)

**Author:** Explorer 2 (History Store & Auto-Sessions Specialist)  
**Date:** 2026-08-16  
**Target Requirement:** R2 Smart Auto-Sessions History System  
**Working Directory:** `.agents/teamwork_preview_explorer_survey_2`

---

## 1. Executive Summary

This investigation analyzed the defect copying lifecycle, history recording, local storage synchronization, and drawer UI components across the QC Standard Wording codebase. We designed a complete architecture for **R2 Smart Auto-Sessions History System**, providing:
1. **Time-Based Auto-Session Grouping**: Intelligently groups copied defects into discrete sessions based on temporal proximity (default 30-minute idle threshold or day boundaries), labeling them dynamically as *Current Session (<30m)*, *Session — HH:MM (Today)*, *Yesterday — HH:MM*, and *Earlier Dates*.
2. **Category Accents & Badges**: Enhances every historical defect item with a category badge (`rpill`), Lucide/emoji category icon, code `#itemNumber` chip, and category-colored left accent border (`borderLeftStyle`), seamlessly integrating with the Warm Charcoal design system (`#141418` containers, `#1a1a20` cards, `#22222a` drawers/popovers).
3. **In-Drawer Search & Category Filtering**: Adds category filter chips and instant full-text search directly inside `HistoryDrawer.tsx`, with live item count indicators per category.
4. **Session-Level & Item-Level Actions**: Equips each session group with "Copy All in Session" and "Add Session to Batch Queue" actions, alongside per-item 1-click copy (with tactile check feedback), pin-to-folder dropdown, and batch queue addition.
5. **Zero-Breaking Backward Compatibility**: Automatically normalizes legacy string arrays (`qc-recents`, `qc-history`) and incomplete `qc-history-entries` objects, automatically inferring defect category and item number from `activeItems`, while maintaining 100% test compatibility with all existing DOM selectors and test suites.

---

## 2. Current State & Codebase Inspection

### 2.1 Storage Keys & State Management
In `src/hooks/useQCState.ts`:
* `qc-history-entries` (JSON array of `HistoryEntry`): Primary structured history store (capped at 100 items).
* `qc-recents` and `qc-history` (JSON array of strings): Legacy recents stores (capped at 20 items), used by `HistoryBar.tsx` and legacy test suites.
* `qc-batch` (JSON array of strings): Batch queue items.
* `qc-pin-folders` (JSON array of `CustomPinFolder`): Starred and custom pin folders.

### 2.2 Copy Lifecycle & Flow
1. **Trigger**:
   - `DefectCard.tsx` (Grid/List/Table variants): User clicks defect card/row -> calls `onCopyItem(item.t)` (currently passes only string `item.t`).
   - `Spotlight / CommandDialog`: Select item -> calls `copySingleItem(item.t)`.
   - `HistoryBar.tsx`: Click recent chip -> calls `copySingleItem(text)`.
   - `HistoryDrawer.tsx`: Click copy button -> calls `copyHistoryEntry(text)`.
   - `BatchDrawer.tsx`: Click "Copy Batch" -> formats batch queue with delimiter and calls `pushHistoryEntry(formatted, { source: 'batch' })`.
2. **Handler (`copySingleItem` in `useQCState.ts`)**:
   - Executes `copyToClipboard(text)`.
   - Invokes `pushHistoryEntry(text, meta)`.
   - Triggers `triggerVibrate(20)` haptic feedback.
   - Dispatches toast notice (`Copied: "..."`).
3. **History Push (`pushHistoryEntry` in `useQCState.ts`)**:
   - Deduplicates identical entries by text: moves existing item to the top with updated `Date.now()` timestamp.
   - Slices array to max 100 entries.
   - Updates `qc-history-entries`, `qc-recents`, and `qc-history` in localStorage.

### 2.3 Existing History Drawer UI (`src/components/HistoryDrawer.tsx`)
* Implemented using Radix UI `Sheet` (`SheetContent`, `SheetTitle`).
* Renders a flat list of `HistoryEntry` items inside `#histlist`.
* Features search input filtering `text` and `category`.
* Global actions: "Add All to Batch" (adds all filtered entries) and "Clear History" (with Radix confirmation `Dialog`).
* Per-item UI: Text display, 1-click Copy button with "Copied!" check state, category badge, relative timestamp (`formatRelativeTime`), "Add to Batch" button, "Pin to Folder" dropdown.

### 2.4 Existing HistoryBar (`src/components/HistoryBar.tsx`)
* Renders horizontal scrolling chips in `#hchips` container.
* Each chip has `data-hcopy` attribute and `.htxt` child element for test compatibility.

---

## 3. R2 Smart Auto-Sessions History System Architecture

### 3.1 Time-Based Auto-Session Grouping Algorithm
To provide a structured, chronological timeline without manual session tracking, we introduce an intelligent auto-session grouping algorithm in `src/utils/historySessions.ts`.

#### Grouping Logic:
1. **Temporal Clustering**:
   - Sort history entries in descending order by `timestamp`.
   - Iterate through entries. If the gap between `currentEntry.timestamp` and `previousEntry.timestamp` exceeds `SESSION_GAP_MS` (30 minutes = `30 * 60 * 1000 ms`), or crosses midnight (calendar day boundary), close current session and begin a new session.
2. **Session Labeling Hierarchy**:
   - **Current Session**: If the latest session's newest item was copied within the active window (e.g. `< 30m` from `now` or the active working burst), label as `"Current Session"`. Subtitle: `"Active session • N items"`.
   - **Earlier Today**: If the session occurred today but is not current, label as `"Session — HH:MM"` (e.g., `"Session — 10:45 AM"` or `"Session — 02:15 PM"`). Subtitle: `"Earlier today • N items"`.
   - **Yesterday**: If the session occurred yesterday, label as `"Yesterday — HH:MM"` (e.g., `"Yesterday — 04:20 PM"`).
   - **Earlier Dates**: If the session occurred on previous dates, label as `"[Month] [Day], [Year] — HH:MM"` (e.g., `"Aug 14, 2026 — 09:15 AM"`).

```ts
export interface HistorySession {
  id: string;             // Unique session ID: 'session_' + startTime
  title: string;          // 'Current Session', 'Session — 10:45 AM', 'Yesterday — 03:20 PM'
  timeRange: string;      // e.g. '10:45 AM - 10:58 AM' or relative time 'Just now'
  isCurrent: boolean;     // true if newest entry < 30m ago and is the first session
  startTime: number;      // timestamp of earliest item in this session
  endTime: number;        // timestamp of latest item in this session
  entries: HistoryEntry[];// list of items in this session
  itemCount: number;      // entries.length
}
```

### 3.2 Category Styling & Visual Accents
Every item within each session group will feature:
1. **Category Left Accent Border**: 4px solid border styled via `getCategoryLeftBorderStyle(category)` using the unified category palette (Screen: `#38bdf8`, Camera: `#a855f7`, Battery: `#10b981`, Buttons: `#f59e0b`, Backcover: `#ec4899`, Locks: `#eab308`, Audio: `#06b6d4`, etc.).
2. **Category Badge with Icon**: Rendered via `renderCategoryIcon` with category color background tint (`rgba(r,g,b, 0.18)`), border (`rgba(r,g,b, 0.45)`), and text color.
3. **Defect Code `#itemNumber` Badge**: Distinct monospace pill (e.g. `#104`) with subtle stone border.
4. **Surface Layering**:
   - Drawer panel: `#141418` (warm container charcoal) with `border-stone-800/80`.
   - Session group cards: `#1a1a20` (surface elevation 2) with `rounded-xl`, `border-stone-800/80`.
   - Defect item cards: `#121214` (surface elevation 1 / recessed contrast) or `#18181b` hover state.

### 3.3 Drawer Search & In-Drawer Category Filter
Inside the `HistoryDrawer.tsx` header:
1. **Full-Text Search Bar**: Retains `[data-testid="history-search-input"]`, searches defect text, category, item number, and session time.
2. **Category Filter Bar**: A horizontal scrollable strip of category pills:
   - "All" (with total history count)
   - Dynamic list of categories present in history (with individual counts, e.g. "Screen (5)", "Camera (3)")
   - Selecting a category filters the history items in real time before grouping into sessions, ensuring sessions with zero matching items are hidden cleanly.

### 3.4 Session-Level Actions & Per-Item Actions
* **Session Header Actions**:
  1. **"Copy All in Session"** (`Copy` icon):
     - Joins all wording texts in the session with newline (`\n`) or active delimiter.
     - Copies to clipboard, triggers vibration (25ms), and displays toast: `Copied 4 defects from session`.
     - Displays brief tactile checkmark on the session copy button.
  2. **"Add Session to Batch Queue"** (`+ Batch` / `Layers` icon):
     - Pushes all items in the session to `batchQueue`.
     - Saves to `qc-batch` and displays toast: `Added 4 session items to batch queue`.
* **Per-Item Actions**:
  1. **1-Click Copy**: Fast copy with visual `Copied ✓` feedback state.
  2. **Add to Batch**: Direct `+ Batch` action per item.
  3. **Pin to Folder**: Radix dropdown menu allowing pinning to Starred or custom folders.

---

## 4. Data Structures & Backward Compatibility

### 4.1 Schema Normalization
To guarantee resilience against corrupt, legacy, or imported localStorage payloads:

```ts
export function normalizeHistoryEntry(raw: any, activeItems: QCItem[]): HistoryEntry {
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
    text: text,
    itemNumber: typeof raw?.itemNumber === 'number' ? raw.itemNumber : matched?.n,
    category: raw?.category || matched?.c || 'general',
    timestamp: typeof raw?.timestamp === 'number' && !isNaN(raw.timestamp) ? raw.timestamp : Date.now(),
    source: raw?.source === 'batch' ? 'batch' : 'single',
    pinned: Boolean(raw?.pinned),
  };
}
```

### 4.2 Storage Synchronization
* When `pushHistoryEntry`, `clearHistoryEntries`, or `copySingleItem` is executed:
  - `qc-history-entries` is updated with full `HistoryEntry[]` objects.
  - `qc-recents` is updated with string `text[]` (max 20).
  - `qc-history` is updated with string `text[]` (max 20).
* This guarantees dual-version backwards compatibility with all existing test suites.

---

## 5. Proposed File Modifications & Additions

| File Path | Action | Description |
|---|---|---|
| `src/types/qc.ts` | **Modify** | Add `HistorySession` interface; add optional `sessionId` / `meta` fields to `HistoryEntry`. |
| `src/utils/historySessions.ts` | **Create** | Implement `groupHistoryIntoSessions`, `formatSessionTitle`, `formatSessionTimeRange`, and `SESSION_GAP_MS` constants. |
| `src/utils/historySessions.test.ts` | **Create** | Comprehensive unit tests for session grouping, gap calculation, boundary dates, and search/category filtering. |
| `src/hooks/useQCState.ts` | **Modify** | Enhance `pushHistoryEntry` with auto-lookup of item metadata; add `copyHistorySession` and `addHistorySessionToBatch` helpers. |
| `src/components/DefectCard.tsx` | **Modify** | Pass metadata `{ itemNumber: item.n, category: item.c }` to `onCopyItem` callback so category is always recorded. |
| `src/components/HistoryDrawer.tsx` | **Modify** | Re-architect drawer with session groups, session headers, category filter chips, search input, left accent borders, and session action buttons. |
| `src/components/HistoryBar.tsx` | **Modify** | Preserve test compatibility; enhance chip hover states and category dot indicators. |
| `src/theme/tokens.ts` & `src/index.css` | **Modify** | Verify multi-layer depth tokens (`#141418`, `#1a1a20`, `#22222a`) and border definitions. |
| `tests/r4-history-drawer.test.js` | **Modify** | Add test cases for auto-sessions grouping, session copy, session batch queueing, and in-drawer category filtering. |

---

## 6. Detailed Design of `HistoryDrawer.tsx` Component

```tsx
// Architectural Sketch of HistoryDrawer layout:
<Sheet open={isOpen} onOpenChange={...}>
  <SheetContent className="history-drawer w-full sm:max-w-lg md:max-w-xl bg-[#141418] border-stone-800 text-stone-100 p-0 flex flex-col h-full">
    {/* Header */}
    <div className="p-4 sm:p-5 border-b border-stone-800 bg-[#141418] space-y-3 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <History className="size-5 text-stone-300" />
          <SheetTitle className="text-base sm:text-lg font-bold text-stone-100">Inspection History</SheetTitle>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
            {historyEntries.length}
          </span>
        </div>
        <div className="flex items-center gap-2 pr-6">
          <Button data-testid="history-add-all-batch" onClick={handleAddAllToBatch} ...>
            <Layers className="size-3.5 text-emerald-400" />
            <span>Add All to Batch</span>
          </Button>
          <Button data-testid="clear-history-btn" onClick={() => setConfirmClearOpen(true)} ...>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Input data-testid="history-search-input" placeholder="Search history records or defect codes..." ... />
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button className={activeCategory === 'all' ? 'active-chip' : 'chip'} onClick={() => setActiveCategory('all')}>
          All ({historyEntries.length})
        </button>
        {categoryListWithCounts.map(cat => (
          <button key={cat.id} className={activeCategory === cat.id ? 'active-chip' : 'chip'} onClick={() => setActiveCategory(cat.id)}>
            {cat.icon} {cat.name} ({cat.count})
          </button>
        ))}
      </div>
    </div>

    {/* Body: Session Grouping Timeline */}
    <div id="histlist" className="flex-1 overflow-y-auto p-4 space-y-4 touch-scroll">
      {sessions.map(session => (
        <div key={session.id} data-testid="history-session-group" className="session-card bg-[#1a1a20] rounded-xl border border-stone-800/80 p-3.5 space-y-3">
          {/* Session Header */}
          <div className="flex items-center justify-between border-b border-stone-800/60 pb-2.5">
            <div className="flex items-center gap-2">
              {session.isCurrent ? <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> : <Clock className="size-3.5 text-stone-400" />}
              <span className="text-xs font-bold text-stone-200 font-sans">{session.title}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">{session.itemCount} items</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => handleCopySession(session)} title="Copy all in session">
                <Copy className="size-3 text-stone-300" />
                <span className="text-[11px]">Copy All</span>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleAddSessionToBatch(session)} title="Add session to batch">
                <Layers className="size-3 text-emerald-400" />
                <span className="text-[11px]">+ Batch</span>
              </Button>
            </div>
          </div>

          {/* Session Items */}
          <div className="space-y-2">
            {session.entries.map(entry => (
              <div key={entry.id} data-testid="history-entry" className="hitem p-3 bg-[#121214] hover:bg-[#18181b] rounded-lg border border-stone-800/70" style={getCategoryLeftBorderStyle(entry.category)}>
                {/* Defect text, item # badge, category badge with icon, 1-click copy, pin to folder, relative time */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </SheetContent>
</Sheet>
```

---

## 7. Verification Method & Test Plan

1. **Unit Testing (`src/utils/historySessions.test.ts`)**:
   - Test session grouping with various timestamp gaps (<30m, >30m, yesterday, multi-day).
   - Test empty history, single item history, and identical timestamps.
   - Test session title formatting and time ranges.
   - Test category filtering and text search integration.
2. **Component & Integration Testing (`tests/r4-history-drawer.test.js`)**:
   - Verify that copying defects creates history entries with category and item number.
   - Verify that sessions are grouped and session headers display valid titles.
   - Verify that "Copy All in Session" copies all items in the session.
   - Verify that "Add Session to Batch" appends session items to `qc-batch`.
   - Verify that searching and category filtering within history drawer updates rendered sessions.
   - Verify that all existing DOM selectors (`#historyDrawer`, `#histlist`, `.hitem`, `[data-testid="history-entry"]`, `[data-testid="history-text"]`, `[data-testid="history-time"]`, `[data-testid="history-add-all-batch"]`, `#hchips .hchip`, `#hclearAll`) are preserved 100%.
3. **Build & Full Test Verification**:
   - Run `npm run build` (`tsc && vite build`) to ensure zero TypeScript errors.
   - Run `npm test` across all test tiers to verify 100% pass rate.
