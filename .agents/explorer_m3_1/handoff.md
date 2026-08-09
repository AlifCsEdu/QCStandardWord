# Milestone M3 Explorer Handoff Report: Grid & Table View Redesign

## 1. Observation

### Codebase Components Inspected
1. **`src/components/DefectCard.tsx`** (Lines 1–240)
   - `DefectCard` handles 3 rendering variants: `grid` (lines 143–174), `table` (lines 176–206), and `list` (lines 208–237).
   - Container class composition (line 41–43):
     ```tsx
     const containerClass = `${variant === 'grid' ? 'gcard' : variant === 'list' ? 'row' : 'trow'} ${
       isPinned ? 'pinned' : ''
     } border-l-4 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer rounded-lg text-zinc-100`;
     ```
   - Left border accent styling (lines 45 & 148, 181, 213): `style={borderLeftStyle}` derived from `getCategoryLeftBorderStyle(item.c)`.
   - Code badge / number element (lines 152–154, 185–187, 216–218): `<span className="rnum text-xs font-mono text-zinc-400">#{item.n}</span>`.
   - Wording title element (lines 164–167, 188–191, 219–222): `<div className="rtxt text-sm text-zinc-100 ...">` rendering fuzzy match indicator `<span className="fz font-bold text-amber-400 mr-1">≈</span>` and HTML highlighted text `<span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtml(item.t) }} />`.
   - Category pill badge (lines 155–161, 195–201, 227–233): `<span className="rpill text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1" style={getCategoryBadgeStyle(item.c)}>`.
   - Action buttons wrapper (lines 48–141): `<div className="racts flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>` containing:
     - Star / Pin button: `data-act="pin" className="pin-btn ..."` (with `.pinned` class when `isPinned` is true).
     - Pin to Folder Dropdown: Radix `DropdownMenu` trigger wrapping `.pin-btn` when `folders` are present.
     - Add to Batch button: `data-act="add" className="add-batch-btn bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 px-2 py-1 rounded text-xs font-medium transition-colors"`.
     - Edit Wording button: `data-act="edit" className="edit-item-btn ..."` (visible when `editMode` is true).
     - Delete Wording button: `data-act="del" className="del-item-btn ..."` (visible when `editMode` is true).

2. **`src/components/WordingContainer.tsx`** (Lines 1–106)
   - Root element (line 41): `<div className="wording-container p-4 sm:p-5">`.
   - Count label (line 43–45): `<div id="countLabel" className="text-xs sm:text-sm font-semibold text-zinc-400 whitespace-nowrap">`.
   - List wrapper (line 49): `<div id="listwrap" data-testid="wording-container" data-layout={layoutMode} className={`listwrap ${layoutMode}`}>`.
   - Empty state (lines 51–56): `<div id="empty" className="p-10 text-center text-zinc-400 text-sm border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900">`.
   - Layout delegates: `WordingGrid` (`layoutMode === 'grid'`), `WordingTable` (`layoutMode === 'table'`), and `WordingList` (default / `'list'`).

3. **Layout View Containers**:
   - `src/components/WordingGrid.tsx` (line 33): `<div className="wording-grid-body grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">`.
   - `src/components/WordingList.tsx` (line 33): `<div className="wording-list-body flex flex-col gap-2">`.
   - `src/components/WordingTable.tsx` (line 33): `<div className="wording-table-body flex flex-col gap-1">`.

4. **`src/index.css` Aesthetic Engine Definitions** (Lines 339–518)
   - Card/row background & border tokens: `--defect-card-bg` (`#0c0e12`), `--defect-card-border` (`rgba(255, 255, 255, 0.08)`).
   - Glow utility classes: `.ambient-cyan-glow`, `.glow-cyan-subtle`, `.glow-cyan-border`.
   - Highlight mark styling: `.rtxt mark { background: rgba(6, 182, 212, 0.25); color: #06b6d4; border-radius: 2px; padding: 0 2px; }`.

5. **`tests/harness.js` Contract Analysis** (Lines 309–322, 357–366)
   - Test harness queries `#listwrap .row, #listwrap .gcard, #listwrap .trow`.
   - Test harness checks `.rnum` (item number), `.rtxt` (item title text), `.rpill` (category badge), `.fz` (fuzzy indicator `≈`), `[data-act="pin"].pinned` (pinned indicator), `[data-act="add"]`, `[data-act="edit"]`, `[data-act="del"]`.
   - Test harness queries container `#listwrap` with `data-layout` and `data-testid="wording-container"`.
   - Test harness queries `#countLabel` and `#empty`.
   - Test harness queries `#wordingContainer` (contract required in `PROJECT.md` line 29).

---

## 2. Logic Chain

1. **Observation**: `PROJECT.md` and `ORIGINAL_REQUEST.md` require 2026 Linear / Vercel design standards (Deep Void Midnight `#050608` background, Onyx `#0c0e12` surface containers, 1px razor-sharp borders `border-white/[0.08]` / `border-zinc-800`, ambient cyan glow hover states `from-cyan-500/20 to-blue-500/10` or hover glow effects, Geist/Inter font for text, and JetBrains Mono for code badges).
2. **Observation**: Currently `DefectCard.tsx` relies on `bg-zinc-900 border-zinc-800 hover:border-zinc-700` inline Tailwind classes, which produce standard dark grey cards rather than the state-of-the-art Onyx `#0c0e12` dark surfaces with cyan ambient hover glow and 1px razor-sharp borders.
3. **Observation**: Grid layout in `WordingGrid.tsx` uses `grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3`. Updating to responsive grid classes `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4` improves desktop card presentation and alignment on modern displays.
4. **Observation**: Table view in `WordingTable.tsx` currently renders a simple list of `.trow` divs without table headers or high-contrast row dividers. Introducing a crisp header bar (Code, Wording, Category, Actions) and a unified rounded container with `divide-y divide-zinc-800/60 border border-white/[0.08] bg-[#0c0e12]` significantly improves Table UX while preserving every individual `.trow` div selector and dataset attribute.
5. **Observation**: `tests/harness.js` strictly requires preserving `.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.fz`, `.racts`, `[data-act="pin"]` (`.pin-btn`), `[data-act="add"]` (`.add-batch-btn`), `[data-act="edit"]` (`.edit-item-btn`), `[data-act="del"]` (`.del-item-btn`), `#countLabel`, `#empty`, `#listwrap`, `data-layout`, `data-testid="wording-container"`, and `#wordingContainer`.
6. **Conclusion**: We can completely overhaul `DefectCard.tsx`, `WordingContainer.tsx`, `WordingGrid.tsx`, `WordingList.tsx`, and `WordingTable.tsx` with state-of-the-art 2026 Linear/Vercel visual aesthetics while preserving 100% of DOM contract selectors and attributes required by all Tier 1–5 tests.

---

## 3. Caveats

- **CSS & Utility Class Coexistence**: `DefectCard.tsx` uses both inline CSS variables (`borderLeftStyle`, `getCategoryBadgeStyle`) and Tailwind utility classes. When applying new 2026 Tailwind classes, the category left border accent (`borderLeftStyle`) must be preserved as inline style to maintain dynamic category color rendering.
- **`<mark>` Highlight Tags**: Highlighted search matches are injected as raw HTML string into `dangerouslySetInnerHTML`. Styling for `<mark>` elements inside `.rtxt` is governed by `src/index.css`. Ensure `.rtxt mark` has glowing cyan styling (`bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded px-1`).
- No other caveats.

---

## 4. Conclusion & Recommended Implementation Plan

### Overview of Refactoring Plan

#### Component 1: `src/components/DefectCard.tsx`
- **Surface & Razor Border**:
  - Replace `bg-zinc-900 border-zinc-800 hover:border-zinc-700` with `bg-[#0c0e12] border-white/[0.08] hover:border-cyan-500/50 hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.25)] transition-all duration-150 ease-in-out backdrop-blur-md rounded-xl`.
  - Pinned items styling: Add `.pinned` class with `bg-amber-500/[0.06] border-amber-500/40 shadow-[0_0_15px_rgba(245,159,0,0.15)]`.
- **Typography & Badges**:
  - Code number `.rnum`: Apply `font-mono text-xs font-bold text-zinc-400 group-hover:text-cyan-400 transition-colors` (JetBrains Mono).
  - Wording text `.rtxt`: Apply `font-sans text-sm font-semibold tracking-tight text-zinc-100 leading-relaxed` (Geist/Inter).
  - Fuzzy indicator `.fz`: Maintain `<span className="fz font-bold text-amber-400 mr-1.5">≈</span>`.
  - Category badge `.rpill`: Enhance badge layout with Lucide icon (`size-3.5`), `text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border transition-transform hover:scale-105 flex items-center gap-1.5`.
- **Action Buttons (`.racts`)**:
  - Pin button `[data-act="pin"]`: Refine `.pin-btn` with `px-2 py-1 text-xs rounded-md bg-zinc-900/80 border border-white/[0.08] hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-300 transition-colors`. When pinned: `pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,159,0,0.2)]`.
  - Batch button `[data-act="add"]`: Refine `.add-batch-btn` with `bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1`.
  - Edit button `[data-act="edit"]`: Refine `.edit-item-btn` with `bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400 hover:text-indigo-100 transition-all font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1`.
  - Delete button `[data-act="del"]`: Refine `.del-item-btn` with `bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 hover:border-rose-400 hover:text-rose-200 transition-all font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1`.

#### Component 2: `src/components/WordingContainer.tsx`
- Add `id="wordingContainer"` to outer wrapper div (`className="wording-container p-4 sm:p-6 space-y-4"`).
- Count label `#countLabel`: Enhance styling with `text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2`.
- List wrapper `#listwrap`: Preserve `data-testid="wording-container"` and `data-layout={layoutMode}`.
- Empty state `#empty`: Modern glassmorphic empty state card `p-12 text-center border border-dashed border-zinc-800/80 rounded-xl bg-[#0c0e12]/80 backdrop-blur-md text-zinc-400 text-sm flex flex-col items-center gap-3`.

#### Component 3: `src/components/WordingGrid.tsx`
- Grid container: Update class to `wording-grid-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4`.

#### Component 4: `src/components/WordingTable.tsx`
- Table wrapper: Wrap table rows in a modern glassmorphic container:
  ```tsx
  <div className="wording-table-wrapper rounded-xl border border-white/[0.08] bg-[#0c0e12]/90 backdrop-blur-md overflow-hidden shadow-sm">
    <div className="hidden sm:grid grid-cols-12 px-4 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 border-b border-white/[0.08] bg-zinc-950/60">
      <span className="col-span-1">Code</span>
      <span className="col-span-7">QC Defect Wording Standard</span>
      <span className="col-span-2">Category</span>
      <span className="col-span-2 text-right">Actions</span>
    </div>
    <div className="wording-table-body flex flex-col divide-y divide-zinc-800/40">
      {/* DefectCard items with variant="table" */}
    </div>
  </div>
  ```

---

## 5. Verification Method

To verify the implementation independently after edits are applied:

1. **Build Verification**:
   ```bash
   npm run build
   ```
   Must compile without TypeScript errors and generate static production output in `dist/`.

2. **Test Suite Verification**:
   ```bash
   npm test
   ```
   Must pass 100% of tests across Tier 1 through Tier 5 (including `m3-pin-folders.test.js`).

3. **DOM Selector & Contract Inspection**:
   Verify the following selectors in rendered DOM:
   - `#wordingContainer` exists as outer container.
   - `#countLabel` exists.
   - `#listwrap` has `data-layout` (`list`, `grid`, or `table`) and `data-testid="wording-container"`.
   - Cards/rows have `data-id={item.id}` and `.gcard`, `.row`, `.trow`.
   - Sub-elements present: `.rnum`, `.rtxt`, `.rpill`, `.racts`, `[data-act="pin"]`, `[data-act="add"]`, `[data-act="edit"]`, `[data-act="del"]`.
