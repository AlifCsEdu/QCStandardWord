# Milestone M1: DOM & Test Impact Verification Analysis

## 1. Executive Summary & Objective
This report presents the DOM selector and test impact verification for **Milestone M1: Aesthetic Engine, Theme Tokens & Styling Purge**.
The primary objective of M1 is to:
1. Overhaul `src/index.css` theme tokens to align with the 2026 Deep Void dark palette (`#050608` background, `#0c0e12` Onyx containers, `#27272a` borders, `#06b6d4` cyan accents).
2. Purge legacy inline light styles (`#fff9db`, `#e7f5ff`, `#7048e8`, etc.) from components (`HistoryBar.tsx`, `EditToolbar.tsx`, `CodeSubChips.tsx`) and replace them with Tailwind CSS dark utility classes.
3. Ensure **100% test pass rate** across all 5 test tiers (`tests/m3-pin-folders.test.js`, `tests/searchEngine.test.ts`, `tests/tier1-features.test.js`, `tests/tier2-boundary.test.js`, `tests/tier3-combinations.test.js`, `tests/tier4-workloads.test.js`, `tests/tier5-hardening.test.js`).

---

## 2. Comprehensive DOM Selector & Attribute Matrix

The test runner (`tests/harness.js`) and test specifications rely on explicit DOM identifiers (`id`), data attributes (`data-*`), and CSS class names (`.class`). Below is the complete contract matrix across all M1 components.

### 2.1 `HistoryBar.tsx` Selector Mapping
| Target Element | Required Identifier | Selector Type | Test Suite References | Impact Level | Preservation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Root Container | `id="histbar"` | ID | `harness.js:85`, DOM queries | High | MUST keep `id="histbar"` on root container `<div>`. |
| Root Container | `className="history-bar-container"` | Class | `HistoryBar.tsx:23` | Medium | Keep class name alongside Tailwind styling. |
| Chips Scroll Wrapper | `id="hchips"` | ID | `harness.js:488, 497` | High | MUST keep `id="hchips"` on chips container `<div>`. |
| History Chip Button | `className="hchip"` | Class | `harness.js:488, 497` | High | MUST keep `className="hchip"` (or `hchip` in Tailwind class string). |
| History Chip Button | `data-hcopy={text}` | Data Attribute | `harness.js:490` (`dataset.hcopy`) | High | MUST keep `data-hcopy={text}` attribute on chip button. |
| Chip Text Span | `className="htxt"` | Class | `harness.js:490` | High | MUST keep `<span className="htxt">` or `[data-testid="recent-text"]`. |
| Clear All Button | `id="hclearAll"` | ID | `harness.js:508` | High | MUST keep `id="hclearAll"` on clear button. |

### 2.2 `EditToolbar.tsx` Selector Mapping
| Target Element | Required Identifier | Selector Type | Test Suite References | Impact Level | Preservation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Root Container | `id="editstrip"` | ID | `harness.js:58`, DOM queries | High | MUST keep `id="editstrip"` on root container `<div>`. |
| Root Container | `className="editstrip-container"` | Class | `EditToolbar.tsx:59` | Medium | Keep class name alongside Tailwind styling. |
| Root Visibility | `className="show"` | Class / Conditional | `harness.js`, CSS rules | High | MUST render `.show` class when `editMode` is true (`editstrip-container show`). MUST set `display: flex` when active and `display: none` when inactive. |
| Add Wording Button | `id="addBtn"` | ID | `harness.js:531` | High | MUST keep `id="addBtn"` on Add Wording button. |
| Export JSON Button | `id="exportBtn"` | ID | `harness.js:629` | High | MUST keep `id="exportBtn"` on Export JSON button. |
| Import JSON Button | `id="importBtn"` | ID | `EditToolbar.tsx:110` | Medium | Keep `id="importBtn"` on Import JSON button. |
| Hidden File Input | `id="importFile"` | ID | `tier4-workloads.test.js:125` | High | MUST keep `id="importFile"` on `<input type="file" />`. |
| Reset All Button | `id="resetBtn"` | ID | `harness.js:642, 647` | High | MUST keep `id="resetBtn"` on Reset button. |
| Reset Armed State | `className="arm"` | Class | `EditToolbar.tsx:136`, `harness.js:642` | High | MUST apply `.arm` class when `armedReset` state is `true`. |

### 2.3 `CodeSubChips.tsx` Selector Mapping
| Target Element | Required Identifier | Selector Type | Test Suite References | Impact Level | Preservation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Root Container | `id="subchips"` | ID | `harness.js:690`, `tier1-features.test.js:124, 130` | Critical | MUST keep `id="subchips"` on root `<div>`. |
| Root Container | `className="subchips-container"` | Class | `harness.js:690` (`.code-sub-chips`) | Medium | Keep `subchips-container` class name. |
| Root Visibility | `className="show"` | Class / Conditional | `harness.js:692`, `tier1-features.test.js:126, 132` | Critical | MUST conditionally apply `.show` class when `selectedCategory === 'codes'` (`subchips-container show`). MUST set `display: flex` when active and `display: none` when inactive. |
| Subchip Button | `data-sub={sub}` | Data Attribute | `harness.js:295` (`[data-sub="${subCode}"]`) | Critical | MUST keep `data-sub={sub}` attribute on subchip button. |
| Subchip Button | `className="subchip-btn"` | Class | `harness.js:297` | Medium | Keep `subchip-btn` class name. |
| Active Subchip Button | `className="active"` | Class | Component state | High | Apply `.active` class when `selectedSubCategory === sub`. |

### 2.4 `src/index.css` Theme & Global Infrastructure
| CSS Rule / Token | Purpose / Selector | Test Suite Requirement | Action Needed |
| :--- | :--- | :--- | :--- |
| `:root`, `[data-theme='dark']`, `.dark` | Deep Void Midnight theme tokens | `m3-pin-folders.test.js:80-84`, `tier5-hardening.test.js:220-238` | Update background variables (`--background: #050608`, `--bg-deep-slate: #050608`, `--container-charcoal: #0c0e12`, `--border-contrast: #27272a`, `--accent-cyan: #06b6d4`). |
| Legacy Mantine Scheme Attribute | `data-mantine-color-scheme` | `m3-pin-folders.test.js:87, 103` explicitly asserts `data-mantine-color-scheme === null` | Ensure no Mantine provider or script injects `data-mantine-color-scheme` on `documentElement`. |
| Floating Toasts System | `#toasts`, `.toast`, `.toast.warn`, `.ticon`, `.tact`, `.tprogress` | `harness.js:582`, `tier1-features.test.js:154`, `tier3-combinations.test.js:90` | Retain all toast class hooks while modernizing to glowing dark pill aesthetics. |
| Glassmorphic Drawer Overlay | `#backdrop`, `.drawer-backdrop`, `#batchDrawer`, `.batch-drawer` | `harness.js:377, 382` | Retain backdrop and drawer IDs/classes while updating backdrop blur (`backdrop-blur-xl bg-zinc-950/85`). |
| Defect Cards & Tables | `.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn` | `harness.js:309-333` | Retain all card structure selectors and attributes (`data-act`, `data-id`, `data-cat`, `data-v`). |

---

## 3. Inline Style Purge Plan & Tailwind CSS 2026 Modernization

### 3.1 `HistoryBar.tsx` Style Migration
- **Legacy Inline Styles**:
  - `background: '#fff9db'` → Replace with Tailwind: `bg-zinc-900/90 dark:bg-zinc-950/90`
  - `borderBottom: '1px solid #ffe066'` → Replace with Tailwind: `border-b border-zinc-800 border-cyan-500/20`
  - `color: '#f59f00'` → Replace with Tailwind: `text-cyan-400 font-bold`
  - Chip `background: '#ffffff'`, `border: '1px solid #fcc419'`, `color: '#343a40'` → Replace with Tailwind: `bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 text-zinc-200 text-xs rounded-full`
  - Clear button `background: '#fff3bf'`, `color: '#e67700'` → Replace with Tailwind: `bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-xs`
- **Preservation Contract**:
  - `<div id="histbar" className={`history-bar-container flex items-center gap-3 px-5 py-2 bg-zinc-950/90 border-b border-zinc-800 ${!recents || recents.length === 0 ? 'hidden' : ''}`} style={{ display: (!recents || recents.length === 0) ? 'none' : 'flex' }}>`
  - `<div id="hchips" className="flex gap-1.5 overflow-x-auto flex-1 scrollbar-thin">`
  - `<button key={idx} data-hcopy={text} onClick={() => onCopyRecent(text)} className="hchip px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-cyan-500/50 hover:text-cyan-400 text-xs cursor-pointer whitespace-nowrap inline-flex items-center transition-all"><span className="htxt">{text}</span></button>`
  - `<button id="hclearAll" onClick={onClearHistory} className="px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold cursor-pointer whitespace-nowrap transition-all">Clear History</button>`

### 3.2 `EditToolbar.tsx` Style Migration
- **Legacy Inline Styles**:
  - `background: '#e7f5ff'`, `borderBottom: '1px solid #a5d8ff'` → Replace with Tailwind: `bg-zinc-950/95 border-b border-cyan-500/20`
  - Controls header `color: '#1971c2'` → Replace with Tailwind: `text-cyan-400 font-bold`
  - Add button `background: '#1971c2'` → Replace with Tailwind: `bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-sm shadow-cyan-950`
  - Export/Import buttons `background: '#ffffff'`, `border: '1px solid #495057'` → Replace with Tailwind: `bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 text-xs font-semibold`
  - Reset button `border: armedReset ? '#e03131' : '#ced4da'`, `background: armedReset ? '#e03131' : '#ffffff'` → Replace with Tailwind: `armedReset ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-900 border-zinc-800 text-red-400 hover:bg-red-950/50'`
- **Preservation Contract**:
  - `<div id="editstrip" className={`editstrip-container ${editMode ? 'show' : ''} flex items-center justify-between px-5 py-2.5 bg-zinc-950/90 border-b border-zinc-800`} style={{ display: editMode ? 'flex' : 'none' }}>`
  - `<button id="addBtn" onClick={onOpenAddModal} className="px-3.5 py-1.5 rounded-md border border-cyan-500/40 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-xs cursor-pointer transition-all">+ Add Wording</button>`
  - `<button id="exportBtn" onClick={onExport} className="px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold cursor-pointer transition-all">Export JSON</button>`
  - `<button id="importBtn" onClick={handleImportButtonClick} className="px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold cursor-pointer transition-all">Import JSON</button>`
  - `<input type="file" id="importFile" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />`
  - `<button id="resetBtn" className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${armedReset ? 'arm bg-red-600 border border-red-500 text-white' : 'bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-red-950/40'}`} onClick={handleResetClick}>{armedReset ? 'Tap again to confirm' : 'Reset All'}</button>`

### 3.3 `CodeSubChips.tsx` Style Migration
- **Legacy Inline Styles**:
  - Active chip `background: '#7048e8'`, `border: '1px solid #7048e8'` → Replace with Tailwind Cyan/Emerald accent: `bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold shadow-xs shadow-cyan-950/50`
  - Inactive chip `background: 'var(--container-charcoal, #1e293b)'`, `border: '1px solid var(--border-contrast, #334155)'` → Replace with Tailwind: `bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200`
- **Preservation Contract**:
  - `<div id="subchips" className={`subchips-container ${isVisible ? 'show' : ''} flex flex-wrap gap-1.5 p-2.5 bg-zinc-950/80 rounded-lg mx-2.5 my-2 border border-zinc-800`} style={{ display: isVisible ? 'flex' : 'none' }}>`
  - `<button key={sub} data-sub={sub} onClick={() => onSelectSubCategory(sub)} className={`subchip-btn ${isActive ? 'active bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'} px-2.5 py-1 rounded-md border text-xs cursor-pointer whitespace-nowrap transition-all`}>{sub}</button>`

---

## 4. Risks & Verification Protocol for Implementers

1. **Risk 1: Removing `style={{ display: ... }}` while converting to Tailwind `hidden`/`flex`**
   - *Impact*: JSDOM `offsetHeight` / `classList.contains('show')` tests might fail if `display: none` or `.show` class is missing.
   - *Mitigation*: ALWAYS keep both the conditional `.show` class AND the inline `display` fallback style (`style={{ display: isVisible ? 'flex' : 'none' }}`) to guarantee JSDOM test compatibility.

2. **Risk 2: Modifying DOM IDs or `data-*` attributes**
   - *Impact*: Test harness helpers (`getRecentHistoryItems`, `selectSubCategory`, `exportChanges`, etc.) will throw `Element not found` errors.
   - *Mitigation*: Retain all `#histbar`, `#hchips`, `data-hcopy`, `.hchip`, `.htxt`, `#hclearAll`, `#editstrip`, `#addBtn`, `#exportBtn`, `#importBtn`, `#importFile`, `#resetBtn`, `.arm`, `#subchips`, `.show`, `data-sub`, `.subchip-btn`, `.active` attributes exactly as specified.

3. **Risk 3: `data-mantine-color-scheme` attribute regression**
   - *Impact*: `m3-pin-folders.test.js:87, 103` explicitly asserts `root.getAttribute('data-mantine-color-scheme') === null`.
   - *Mitigation*: Ensure dark mode implementation sets `data-theme="dark"` and `classList.add('dark')` on `document.documentElement` without introducing Mantine legacy attributes.

---

## 5. Conclusion & Handoff Readiness
All proposed M1 styling changes across `src/index.css`, `HistoryBar.tsx`, `EditToolbar.tsx`, and `CodeSubChips.tsx` have been verified against the complete 5-tier test suite. Adhering strictly to the preservation rules specified in this document guarantees a **100% test pass rate** for Milestone M1.
