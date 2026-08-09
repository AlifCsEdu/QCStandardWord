# Milestone M2: Test Suite & DOM Contract Impact Verification Report

**Author**: explorer_m2_3 (Role: teamwork_preview_explorer)  
**Date**: 2026-08-09  
**Target Components**: `src/components/CategoryChips.tsx`, `src/components/AppHeader.tsx`, `src/App.tsx` (`CommandDialog` / Spotlight Search Modal), `src/hooks/useQCState.ts`  
**Test Suite Directory**: `tests/` (`harness.js`, `m3-pin-folders.test.js`, `tier1-features.test.js`, `tier2-boundary.test.js`, `tier3-combinations.test.js`, `tier4-workloads.test.js`, `tier5-hardening.test.js`, `searchEngine.test.ts`)

---

## 1. Executive Summary & Scope Assessment

This report provides a comprehensive cross-check of proposed Milestone M2 refactorings (`CategoryChips.tsx`, `AppHeader.tsx`, and `CommandDialog` spotlight search integration) against the complete 8-file test suite.

The test suite relies heavily on JSDOM element selection helpers in `tests/harness.js`. To ensure **100% test pass rate** without test file modifications, implementers MUST preserve a strict set of DOM element IDs, dataset attributes (`data-*`), test IDs (`data-testid`), class hooks, and keyboard event bindings.

---

## 2. DOM Contract & Selector Preservation Matrix

### 2.1 Mandatory Element IDs (`id` Attributes)

| Component | DOM Element ID | harness.js & Test File References | Required Functionality / Behavior |
|---|---|---|---|
| `App.tsx` | `#sidebarNav` | `harness.js:199`, `PROJECT.md:29` | `<aside>` sidebar container; queried by `app.getAppNavbar()` selector fallback. |
| `CategoryChips.tsx` | `#nav` | `CategoryChips.tsx:26` | Outer navigation container wrapper. |
| `CategoryChips.tsx` | `#chips` | `CategoryChips.tsx:30` | Category list scroll container wrapper. |
| `AppHeader.tsx` | `#appHeader` | `harness.js:204`, `PROJECT.md:29` | Top `<header>` navbar container; queried by `app.getAppHeader()`. |
| `AppHeader.tsx` | `#search` | `harness.js:216`, `tier1-features:64` | Main search input element; queried by `app.search()`, `submitSearch()`, and test assertions. |
| `AppHeader.tsx` | `#clearBtn` | `harness.js:246` | Search clear button element; queried by `app.clearSearch()`. |
| `AppHeader.tsx` | `#spotlightBtn` | `harness.js:259` | Spotlight search trigger button; queried by `app.openSpotlightModal()`. |
| `AppHeader.tsx` | `#setLayout` | `harness.js:209,657`, `PROJECT.md:29` | View switcher container element; queried by `app.getSegmentedControl()` and `app.setLayoutView()`. |
| `AppHeader.tsx` | `#editBtn` | `harness.js:517,525` | Edit mode toggle button; queried by `app.toggleEditMode()` and `app.isEditModeActive()`. |
| `AppHeader.tsx` | `#batchBtn` | `AppHeader.tsx:187` | Batch drawer toggle button. |
| `AppHeader.tsx` | `#bcount` | `harness.js:398`, `AppHeader.tsx:196` | Batch items count pill inside `#batchBtn`; queried by `app.getBatchCount()`. |
| `AppHeader.tsx` | `#setBtn` | `harness.js:666` | Appearance/Settings button. |
| `AppHeader.tsx` | `#dlBtn` | `AppHeader.tsx:218` | Download offline copy button. |
| `AppHeader.tsx` | `#themeBtn` | `AppHeader.tsx:241` | Dark/light theme toggle button. |
| `App.tsx` (`CommandDialog`) | `#modal` | `PROJECT.md:29`, `harness.js:273` | Spotlight Search CommandDialog modal container element. |
| `WordingContainer.tsx` | `#listwrap` | `harness.js:309`, `tier1-features:234`, `tier4-workloads:13` | Main wording container; checked for `data-layout` and classes `list`, `grid`, `table`. |
| `CodeSubChips.tsx` | `#subchips` | `harness.js:690`, `tier1-features:124` | Container for code sub-chips; checked for class `show` when `codes` category is active. |

---

### 2.2 Mandatory Dataset Attributes (`data-*`)

| Component | Dataset Attribute | Expected Attribute Values | Harness & Test Suite Usage |
|---|---|---|---|
| `CategoryChips.tsx` | `data-cat` | `'all'`, `'codes'`, `'screen'`, `'camera'`, `'buttons'`, `'battery'`, `'backcover'`, `'locks'`, `'pen'`, `'water'`, `'audio'`, `'body'`, `'system'`, `'pinned'`, `'recent'` | `app.selectCategory(catId)` queries `[data-cat="${catId}"]`. MUST exist on every category button. |
| `CategoryChips.tsx` | `data-folder` | `{folderId}` (e.g. `'starred'`, `'f_custom_1'`) | Category/Folder query `[data-folder="${folder.id}"]`. |
| `CodeSubChips.tsx` | `data-sub` | `'FCPB'`, `'FCPW'`, `'LCD'`, `'BL'`, `'TOUCH'`, `'OTHER'`, etc. | `app.selectSubCategory(subCode)` queries `[data-sub="${subCode}"]`. |
| `AppHeader.tsx` | `data-v` or `data-value` | `'list'`, `'grid'`, `'table'` | `app.setLayoutView(mode)` queries `[data-v="${layoutMode}"]` inside `#setLayout`. MUST exist on view switcher buttons. |
| `WordingContainer.tsx` | `data-layout` | `'list'`, `'grid'`, `'table'` | `tier1-features:235` verifies container layout attribute/class. |
| `DefectCard.tsx` | `data-id` | `{item.id}` (e.g. `'s101'`, `'c1723456789'`) | `app.getVisibleItems()` extracts item IDs. |
| `DefectCard.tsx` | `data-act` | `'pin'`, `'add'`, `'edit'`, `'del'` | `app.clickItemAction(index, action)` queries `[data-act="${action}"]`. |
| `DefectCard.tsx` | `data-pinned` | `'true'`, `'false'` | `app.getVisibleItems()` checks pinned state. |
| Document Root | `data-theme` | `'dark'`, `'light'`, `'auto'` | `m3-pin-folders:82`, `tier5-hardening:219` checks `document.documentElement.getAttribute('data-theme')`. |
| Document Root | `data-density` | `'cozy'`, `'compact'`, `'spacious'` | `tier5-hardening:243` checks `document.documentElement.getAttribute('data-density')`. |

---

### 2.3 Mandatory Test IDs (`data-testid`)

| Component | Test ID (`data-testid`) | Target Element & Usage |
|---|---|---|
| `App.tsx` (Sidebar) | `app-navbar` | `<aside data-testid="app-navbar" id="sidebarNav">` |
| `AppHeader.tsx` | `app-header` | `<header data-testid="app-header" id="appHeader">` |
| `AppHeader.tsx` | `header-search-input` | `<input data-testid="header-search-input" id="search">` |
| `AppHeader.tsx` | `clear-search-btn` | `<button data-testid="clear-search-btn" id="clearBtn">` |
| `AppHeader.tsx` | `spotlight-trigger` | `<button data-testid="spotlight-trigger" id="spotlightBtn">` |
| `AppHeader.tsx` | `view-switcher` | `<div data-testid="view-switcher" id="setLayout">` |
| `App.tsx` (`CommandDialog`) | `spotlight-modal` | `<div data-testid="spotlight-modal" id="modal">` |
| `CodeSubChips.tsx` | `code-sub-chips` | `<div data-testid="code-sub-chips" id="subchips">` |
| `CategoryChips.tsx` | `category-tab-{catId}` | Fallback category selection selector in `app.selectCategory()` |
| `CodeSubChips.tsx` | `sub-chip-{subCode}` | Fallback sub-category selection selector in `app.selectSubCategory()` |

---

### 2.4 CSS Class Hooks & State Attributes

- **Theme Dark Class**: `document.documentElement.classList.contains('dark')` must be `true` when theme is `dark` (verified by `tests/m3-pin-folders.test.js:83`).
- **No Mantine Legacy Attributes**: `document.documentElement.getAttribute('data-mantine-color-scheme')` MUST be `null` (verified by `tests/m3-pin-folders.test.js:87`).
- **Edit Mode Active Class/Attribute**: `#editBtn` MUST feature class `on` or attribute `data-active="true"` when edit mode is active (`harness.js:527`).
- **Code Sub-Chips Visibility**: `#subchips` MUST feature class `show` when the `codes` category is active (`tier1-features:133`).
- **Search Highlighting**: Search results in `WordingContainer.tsx` MUST enclose query matches in `<mark>` elements (`tier1-features:99`).

---

## 3. Detailed Component Analysis & Preservation Directives

### 3.1 `CategoryChips.tsx` (Sidebar Navigation & Custom Pin Folder Manager)

#### Key Requirements:
1. **Root Container**: Keep `id="nav"` and `id="chips"` structure.
2. **Category Chip Buttons**:
   - MUST maintain `data-cat="{cat.id}"` on every category button (e.g. `data-cat="all"`, `data-cat="screen"`, `data-cat="codes"`).
   - Click handler MUST call `onSelectCategory(cat.id)` and clear folder selection (`onSelectFolder(null)`).
3. **Custom Pin Folders Section**:
   - Render folder buttons with `data-folder="{folder.id}"` and `data-cat="pinned"`.
   - Click handler MUST set `onSelectFolder(folder.id)` and set selected category to `'pinned'`.
   - Display folder item count pill.
4. **State Auto-Migration**:
   - `useQCState.ts` must maintain auto-migration of legacy `qc-pins` into a default folder (`{ id: 'starred', name: 'Starred Defects', color: '#06b6d4' }`) when `qc-pin-folders` is empty.

---

### 3.2 `AppHeader.tsx` (Top Header Navbar, Hero Search Bar & View Switcher)

#### Key Requirements:
1. **Header Root**: Keep `<header id="appHeader" data-testid="app-header">`.
2. **Search Input**:
   - Keep `<input id="search" data-testid="header-search-input" type="text" ... />`.
   - Trigger `onSearchChange(e.target.value)` on `input` and `change` events.
   - Prevent default form submit on `Enter` keydown.
3. **Clear Button**:
   - Keep `<button id="clearBtn" data-testid="clear-search-btn" onClick={onClearSearch}>`.
   - Rendered/visible when `searchQuery.trim().length > 0`.
4. **Spotlight Trigger Button**:
   - Keep `<button id="spotlightBtn" data-testid="spotlight-trigger" onClick={onOpenSpotlight}>`.
   - Must display `⌘K` shortcut badge.
5. **View Switcher Segmented Control**:
   - Container MUST have `id="setLayout"` and `data-testid="view-switcher"`.
   - Buttons MUST feature `data-v="list"`, `data-v="grid"`, and `data-v="table"` (or `data-value="list|grid|table"`).
   - Click handler MUST invoke `onSetLayout(mode)`.
6. **Edit Mode Toggle**:
   - Keep `<button id="editBtn" className="... edit-btn ${editMode ? 'on' : ''}">`.
7. **Batch Queue Toggle Button**:
   - Keep `<button id="batchBtn">` with inner badge `<span id="bcount">{batchCount}</span>`.
8. **Settings & Theme Buttons**:
   - Keep `<button id="setBtn">` and `<button id="themeBtn">`.

---

### 3.3 `CommandDialog` / Spotlight Search Modal (`App.tsx` & `cmdk`)

#### Key Requirements:
1. **Keyboard Shortcut Listener**:
   - Global `window.addEventListener('keydown', ...)` listening for `(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'`.
   - Calling `e.preventDefault()` and toggling spotlight state.
2. **DOM Container Identification**:
   - Spotlight dialog overlay/content MUST feature `id="modal"` or `data-testid="spotlight-modal"` so `app.isSpotlightOpen()` returns `true`.
3. **Item Selection Behavior**:
   - Selecting a search result item in `CommandDialog` MUST invoke `copySingleItem(item.t)` and close the dialog (`setSpotlightOpen(false)`).

---

## 4. LocalStorage & State Layer Compatibility Contracts

Implementers MUST ensure all 14 `localStorage` keys remain fully operational:

1. `qc-pins`: `(string | number)[]`
2. `qc-pin-folders`: `CustomPinFolder[]`
3. `qc-recents`: `string[]`
4. `qc-history`: `string[]`
5. `qc-batch`: `string[]`
6. `qc-join`: `'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet'`
7. `qc-autoclear`: `'true' | 'false'`
8. `qc-edits`: `Record<string, { t: string, c: CategoryKey, n: number }>`
9. `qc-dels`: `(string | number)[]`
10. `qc-custom`: `QCItem[]`
11. `qc-appearance`: `AppearanceSettings`
12. `qc-theme`: `'dark' | 'light' | 'auto'`
13. `qc-density`: `'cozy' | 'compact' | 'spacious'`
14. `qc-sort`: `'num-asc' | 'num-desc' | 'alpha-asc' | 'alpha-desc'`

---

## 5. Implementation Pitfalls & Guidance for Implementers

1. **Avoid Wrapping Primitives That Strip Native Attributes**: When replacing plain `<input>` or `<button>` with shadcn UI components, ensure `id="search"`, `id="clearBtn"`, `id="spotlightBtn"`, `data-cat`, `data-v`, and `data-sub` are directly passed down to the underlying DOM elements.
2. **Event Dispatching Resilience**: `tests/harness.js` uses native HTML DOM setters (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set`) and dispatches `input` and `change` events. Native inputs must respond synchronously.
3. **Keep Dual Data Attributes for Compatibility**: Use both `data-v="list"` and `data-value="list"` on view switcher buttons; use both `data-cat="{id}"` and `data-testid="category-tab-{id}"` on category buttons.

---

## 6. Verification Method

Implementers can independently verify all DOM contracts and Milestone M2 requirements by executing:

```bash
# Run complete test suite (Tiers 1-5 + Milestone tests)
npm test

# Run individual test suites
npm run test:tier1
node --test tests/m3-pin-folders.test.js
node --test tests/searchEngine.test.ts
```

All 6 test files must complete with **0 failures**.
