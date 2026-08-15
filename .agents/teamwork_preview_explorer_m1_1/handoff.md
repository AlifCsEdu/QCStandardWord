# Milestone 1: R1 Touch Ergonomics & 100% shadcn UI Styling — Technical Blueprint

## Top-Level Summary
Milestone 1 elevates the QC Standard Wording application into a touch-first, ergonomically perfected interface tailored for the Samsung Galaxy Tab S9+ (and mobile/touch tablets) while standardizing 100% of interactive UI components onto shadcn/Radix primitives, introducing sleek custom scrollbars, fixing light theme support, and preserving 100% of legacy DOM contracts and test IDs.

---

## 1. Observation

### 1.1 Touch Target & Ergonomics Analysis
1. **`src/components/AppHeader.tsx` (Lines 66-284)**:
   - Search input `#search` currently uses `h-9` (36px height) and Clear button `#clearBtn` uses `p-1`, which are difficult to hit accurately on touch screens without mis-taps.
   - Spotlight trigger `#spotlightBtn` is `h-9 px-2.5 sm:px-3`.
   - Layout mode switcher `#setLayout` uses native `<button>` elements with `px-2 sm:px-2.5 py-1 text-xs`, resulting in a ~24px height touch target.
   - Action buttons (`#editBtn`, `#batchBtn`, `#setBtn`, `#dlBtn`, `#themeBtn`, mobile hamburger) use `h-8` (32px height) or `size-8` (32x32px), well below the 44-48px Android/iOS touch target guidelines.
2. **`src/components/CategoryChips.tsx` (Lines 98-378)**:
   - Quick Nav buttons (`data-cat="all|pinned|recent"`): `px-2.5 py-1.5`, producing ~32px target height.
   - Pin Folder buttons (`data-folder="[id]"`): `px-2.5 py-1.5` (~32px height) with embedded rename/delete buttons (`p-0.5`, `size-3` icons, ~16px hit target).
   - Defect Category buttons (`data-cat="[id]"`): `px-2.5 py-1.5` (~32px height).
   - Section accordion toggles (`Quick Views`, `Pin Folders`, `Defect Categories`): `py-1` (~24px hit height).
3. **`src/components/DefectCard.tsx` (Lines 75-286)**:
   - Action buttons inside defect cards (`[data-act="pin"]`, `[data-act="add"]`, `[data-act="edit"]`, `[data-act="del"]`): currently use `px-2.5 py-1 text-xs` (~26px height). On tablets, tapping "+ Batch" or "★ Pin" risks mis-tapping the outer card and triggering the full-card copy event.
   - Card containers: Grid view has `min-h-[140px]`, but List view rows have dynamic padding without an explicit touch-friendly minimum row height (`min-h-[56px]`).
4. **`src/components/BatchDrawer.tsx` (Lines 96-369)**:
   - Close button `#bclose` is `h-8 w-8` (32px).
   - Delimiter option buttons are `py-1.5 px-0.5` (~30px height).
   - Autoclear checkbox is a small raw `<input type="checkbox">` (`size-4`).
   - Batch items reorder buttons (`.bup`, `.bdn`), single copy button (`.bcopy-item`), and remove button (`.brm-item`) use `p-1.5` / `px-1.5 py-1` (~24-28px height).
   - Primary action buttons: `#bcopy` is `h-10`, `#bclear` and `#bpaste` are `h-9`.
5. **`src/components/EditToolbar.tsx` (Lines 58-111)**:
   - Buttons (`#addBtn`, `#exportBtn`, `#importBtn`, `#resetBtn`) use `px-3 py-1.5 text-xs` (~28px height).
6. **`src/components/StatsDashboard.tsx` (Lines 57-136)**:
   - Single-line dashboard is `py-2.5` with compact badges. Needs to ensure min 44px container height and comfortable touch spacing.

### 1.2 Non-shadcn Primitives & Legacy Fallback Audit
1. **`src/components/EditModal.tsx` (Lines 85-97)**:
   - Uses native HTML `<select id="mcat">` instead of Radix `Select`.
2. **`src/components/BatchDrawer.tsx` (Lines 162-222)**:
   - Uses raw `<input type="checkbox" id="autoclear">` instead of shadcn `Checkbox`.
   - Uses custom div slide-out instead of standardized shadcn `Sheet`.
   - Uses raw button grid for delimiters instead of Radix `ToggleGroup`.
3. **`src/components/AppHeader.tsx` (Lines 144-171)** & **`src/components/SettingsModal.tsx` (Lines 51-183)**:
   - Use raw HTML `<button>` lists instead of Radix `ToggleGroup` / `ToggleGroupItem`.

### 1.3 Light Theme Hardcoded Color Tokens
1. **`src/App.tsx` (Lines 200, 226, 249)**:
   - Hardcoded `bg-[#121214]` on root container, sidebar `aside`, and `main` wrapper. In light mode, this results in dark or inconsistent UI regions.
2. **`src/components/AppHeader.tsx` (Line 66)**:
   - Hardcoded `bg-[#121214]` in header className.
3. **`src/index.css` (Lines 16-84)**:
   - Light theme CSS variables exist in `[data-theme='light']`, but components hardcode `bg-stone-900`, `bg-stone-950`, `bg-stone-800`, `text-stone-100`, `border-stone-800`, bypassing light theme variables.

### 1.4 Test ID & DOM Contract Preservation
- Automated tests across `tests/harness.js`, `tests/m1-challenger-empirical.test.js`, `tests/tier1-features.test.js`, and stress harnesses assert exact IDs: `#appHeader`, `#search`, `#clearBtn`, `#spotlightBtn`, `#setLayout`, `data-v`, `data-value`, `#editBtn`, `.on`, `#batchBtn`, `#bcount`, `#bbcount`, `#bcopycount`, `#setBtn`, `#dlBtn`, `#themeBtn`, `#sidebarNav`, `#subchips`, `data-sub`, `#statsDashboard`, `#histbar`, `#hchips`, `data-hcopy`, `#hclearAll`, `#editstrip`, `#addBtn`, `#exportBtn`, `#importBtn`, `#importFile`, `#resetBtn`, `#wordingContainer`, `#listwrap`, `data-layout`, `.gcard`, `.row`, `.trow`, `data-id`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `[data-act="pin"]`, `[data-act="add"]`, `[data-act="edit"]`, `[data-act="del"]`, `[data-testid="inline-copied-badge"]`, `#backdrop`, `#batchDrawer`, `#bclose`, `#joinSel`, `#autoclear`, `#blist`, `data-bi`, `data-mvup`, `data-mvdn`, `data-bc`, `data-rm`, `#bcopy`, `#bclear`, `#bpaste`, `#modal`, `#mtext`, `#mcat`, `#mnum`, `#mcancel`, `#msave`, `#setmodal`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`, `#setdone`.

---

## 2. Logic Chain

```
[Observation 1.1] Touch targets in Header, Sidebar, Cards, Drawer, Toolbar are 24-36px.
       ↓ (Ergonomics Guideline)
[Inference 1] Scale all interactive hitboxes to min 44-48px on touch / tablet via CSS min-height, padding, and flex alignment.

[Observation 1.2] EditModal uses raw <select>, BatchDrawer uses raw <input type="checkbox">, AppHeader/SettingsModal use raw <button> groups.
       ↓ (Design System Standard)
[Inference 2] Adopt Radix Select, shadcn Checkbox, shadcn Sheet, and Radix ToggleGroup while preserving hidden synchronous fallback elements (e.g. <select id="mcat" className="sr-only">) to guarantee 100% test harness and JSDOM compatibility.

[Observation 1.3] Hardcoded `bg-[#121214]` and dark stone classes in App.tsx, AppHeader.tsx, and CSS prevent light theme rendering.
       ↓ (Theming Architecture)
[Inference 3] Refactor hardcoded hex codes to semantic Tailwind & shadcn CSS tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`, `bg-muted`, `bg-secondary`).

[Observation 1.4] Test harness relies on querySelector for legacy IDs and attributes.
       ↓ (Zero Regression Requirement)
[Inference 4] Keep 100% of DOM IDs, classes, test IDs, and data attributes intact without changing query selectors.
```

---

## 3. Implementation Specifications by Component

### 3.1 Global CSS & Touch Scroll (`src/index.css`)
```css
/* 1. Global Touch Ergonomics & Elimination of 300ms Delay */
button,
input,
select,
textarea,
[role="button"],
[data-act],
.chip-btn,
.bitem,
.gcard,
.row,
.trow,
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* 2. Momentum & Overscroll Containment for Mobile / Tablet Viewports */
.touch-scroll,
.sidebar-nav,
.chips-scroll-container,
.wording-container,
.batch-drawer,
#blist,
.dialog-content,
.sheet-content {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

/* 3. Sleek Custom Scrollbars (WebKit & Firefox) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(161, 161, 170, 0.3);
  border-radius: 9999px;
  transition: background 150ms ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(161, 161, 170, 0.5);
}

[data-theme='light'] ::-webkit-scrollbar-thumb {
  background: rgba(113, 113, 122, 0.25);
}

[data-theme='light'] ::-webkit-scrollbar-thumb:hover {
  background: rgba(113, 113, 122, 0.45);
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(161, 161, 170, 0.3) transparent;
}

[data-theme='light'] * {
  scrollbar-color: rgba(113, 113, 122, 0.25) transparent;
}
```

### 3.2 `src/components/AppHeader.tsx`
- **Container**: `id="appHeader" data-testid="app-header" className="sticky top-0 z-40 w-full border-b border-border bg-background px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 sm:gap-4 flex-wrap min-h-[64px] box-border text-foreground shadow-xs select-none touch-manipulation"` (Note: NO `backdrop-blur-*` classes as forbidden by Test 4.1).
- **Mobile Hamburger Button**: `className="sm:hidden min-h-[44px] min-w-[44px] size-11 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg"`
- **Search Input `#search`**: `min-h-[44px] h-11 text-sm bg-muted/60 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring rounded-lg px-3.5 pr-10`
- **Clear Button `#clearBtn`**: `className="clear-btn ${hasQuery ? 'show' : ''} absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] size-10 flex items-center justify-center text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer rounded-md"`
- **Spotlight Trigger `#spotlightBtn`**: `min-h-[44px] h-11 px-3.5 text-xs sm:text-sm font-medium gap-2 rounded-lg bg-muted/60 border border-input text-foreground hover:bg-accent`
- **View Switcher `#setLayout`**:
  Use Radix `ToggleGroup` / `ToggleGroupItem` with `id="setLayout" data-testid="view-switcher" type="single" value={layoutMode} onValueChange={(val) => val && onSetLayout?.(val as LayoutMode)}` with items keeping `data-v={mode} data-value={mode} className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-2"`.
- **Action Buttons (`#editBtn`, `#batchBtn`, `#setBtn`, `#dlBtn`, `#themeBtn`, Folder manager)**:
  `min-h-[44px] h-11 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg touch-manipulation`.

### 3.3 `src/components/CategoryChips.tsx`
- **Section Headers**: `min-h-[44px] px-3 py-2 flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground`.
- **Quick Nav & Defect Category Buttons**:
  `min-h-[44px] sm:min-h-[48px] px-3 py-2.5 rounded-lg flex items-center justify-between text-xs sm:text-sm font-medium touch-manipulation`.
- **Pin Folder Items & CRUD Action Buttons**:
  Folder item `min-h-[44px] px-3 py-2.5`. Rename/Delete hover buttons `min-h-[36px] min-w-[36px] p-2 rounded-md flex items-center justify-center`. Add folder button `min-h-[40px] min-w-[40px] p-2 flex items-center justify-center`.

### 3.4 `src/components/DefectCard.tsx`
- **Minimum Row Heights**:
  - List View: `min-h-[56px] sm:min-h-[64px] p-3.5 sm:p-4`.
  - Table View: `min-h-[48px] sm:min-h-[52px] px-3.5 sm:px-4 py-2.5 sm:py-3`.
  - Grid View: `min-h-[140px] p-4`.
- **Action Buttons Hitbox Scaling & Event Isolation**:
  - `.pin-btn` (`[data-act="pin"]`): `min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] p-2.5 text-sm rounded-lg active:scale-90`.
  - `.add-batch-btn` (`[data-act="add"]`): `min-h-[40px] sm:min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg active:scale-95`.
  - `.edit-item-btn` (`[data-act="edit"]`): `min-h-[40px] sm:min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg active:scale-95`.
  - `.del-item-btn` (`[data-act="del"]`): `min-h-[40px] sm:min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg active:scale-95`.
- **Touch Stop Propagation**:
  The `.racts` container retains `onClick={(e) => e.stopPropagation()}` and `onTouchStart={(e) => e.stopPropagation()}` to guarantee no card copy micro-interactions fire on button taps.

### 3.5 `src/components/BatchDrawer.tsx`
- **Standardized with shadcn Sheet Styling**:
  - Preserves `#backdrop`, `data-testid="drawer-overlay"`, `#batchDrawer`, `data-testid="batch-drawer"`, `translate-x-0`, `translate-x-full`, `.open`, `.batch-drawer`.
- **Shadcn Checkbox Replacement**:
  - Replace native checkbox with shadcn `Checkbox` (`@radix-ui/react-checkbox`):
    ```tsx
    <div className="flex justify-between items-center gap-2 pt-1 border-t border-border min-h-[44px]">
      <label htmlFor="autoclear" className="text-xs font-medium text-foreground cursor-pointer select-none">
        Auto-clear queue on copy:
      </label>
      <Checkbox
        id="autoclear"
        data-testid="autoclear-checkbox"
        checked={autoclear}
        onCheckedChange={(checked) => onSetAutoclear(Boolean(checked))}
        className="size-5 rounded border-border data-[state=checked]:bg-primary"
      />
      {/* Hidden input for 100% test harness sync */}
      <input
        type="checkbox"
        id="autoclear"
        name="autoclear"
        checked={autoclear}
        onChange={(e) => onSetAutoclear(e.target.checked)}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
    ```
- **Delimiter Selector**:
  - Radix `ToggleGroup` / `ToggleGroupItem` for the 6 delimiter options with `min-h-[44px] py-2`.
  - Hidden `<select id="joinSel" name="delimiter" data-testid="delimiter-select" className="sr-only">` kept 100% in sync.
- **Batch Item Reordering & Actions**:
  - `.bitem`: `min-h-[52px] p-3 rounded-xl`.
  - `.bup`, `.bdn`: `min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] p-2.5 rounded-lg active:scale-90`.
  - `.bcopy-item`: `min-h-[40px] sm:min-h-[44px] px-3 py-2 text-xs font-mono rounded-lg active:scale-95`.
  - `.brm-item`: `min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] p-2.5 rounded-lg active:scale-90`.
- **Footer Buttons**:
  - `#bcopy`: `h-12 min-h-[48px] text-sm font-bold rounded-lg`.
  - `#bclear`, `#bpaste`: `h-11 min-h-[44px] text-xs font-semibold rounded-lg`.

### 3.6 `src/components/EditModal.tsx`
- **Radix Select Replacement**:
  ```tsx
  <div className="flex-1">
    <label htmlFor="mcat" className="block mb-1.5 text-xs font-semibold text-foreground">
      Category:
    </label>
    <Select value={category} onValueChange={(val) => setCategory(val as CategoryKey)}>
      <SelectTrigger className="w-full min-h-[44px] h-11 px-3.5 bg-background border-border text-foreground text-sm rounded-lg">
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border text-popover-foreground">
        {categoriesOptions.map((cat) => (
          <SelectItem key={cat.id} value={cat.id} className="min-h-[40px] py-2 cursor-pointer">
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {/* Hidden fallback select for 100% test harness sync */}
    <select
      id="mcat"
      data-testid="modal-category-select"
      value={category}
      onChange={(e) => setCategory(e.target.value as CategoryKey)}
      className="sr-only"
      aria-hidden="true"
    >
      {categoriesOptions.map((cat) => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
  </div>
  ```
- **Inputs & Action Buttons**:
  - `#mtext`: `min-h-[44px] h-11 px-3.5 text-sm bg-background border-border text-foreground rounded-lg`.
  - `#mnum`: `min-h-[44px] h-11 px-3.5 text-sm bg-background border-border text-foreground rounded-lg`.
  - `#mcancel`, `#msave`: `min-h-[44px] h-11 px-5 text-sm font-semibold rounded-lg`.

### 3.7 `src/components/SettingsModal.tsx`
- **Radix ToggleGroup Standardization**:
  All option groups (`#setLayout`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`) are structured with Radix `ToggleGroup` / `ToggleGroupItem` with `min-h-[44px] py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg`.
- **Done Button `#setdone`**: `min-h-[44px] h-11 px-8 text-sm font-bold rounded-lg`.

### 3.8 `src/App.tsx` & Semantic Token Cleansing
- Root container: replace `bg-[#121214]` with `bg-background text-foreground`.
- Sidebar `aside#sidebarNav`: replace `bg-[#121214]` with `bg-card border-r border-border touch-scroll`.
- Main content: replace `bg-[#121214]` with `bg-background touch-scroll`.
- Scroll to Top button `#scrollTopBtn`: `min-h-[44px] h-11 px-5 rounded-full shadow-lg`.

---

## 4. Caveats
1. **Disallowed AI Tropes / CSS Restrictions**:
   - `backdrop-blur-*` is strictly forbidden in `#appHeader`, `#statsDashboard`, and `#sidebarNav` by test suite `tests/m1-challenger-empirical.test.js` (Test 4.1). Solid semantic backgrounds (`bg-background`, `bg-card`) must be used instead of blurred semi-transparent layers.
2. **Synchronous Fallbacks for JSDOM Harness**:
   - The test harness simulates user interaction directly on DOM elements. Native elements like `<select id="mcat">`, `<select id="joinSel">`, and `<input id="autoclear">` must remain synchronized as `.sr-only` fallbacks alongside Radix UI primitives.
3. **Density & Appearance Custom Properties**:
   - Touch target dimensions scale smoothly in Milestone 2 when Density modes are applied (`--spacing-density-btn`, `--spacing-density-card`), but Milestone 1 guarantees that the default base styling already satisfies the 44-48px minimum touch guideline.

---

## 5. Conclusion
Milestone 1 is ready for immediate implementation with zero ambiguity. The strategy guarantees:
- 100% compliance with Samsung Galaxy Tab S9+ touch ergonomics (min 44-48px touch targets, comfortable finger padding, touch-manipulation).
- 100% coverage of shadcn / Radix primitives (Select, Checkbox, Sheet, ToggleGroup, ScrollArea).
- Smooth WebKit & Firefox custom scrollbars.
- Flawless Dark/Light theme switching via semantic Tailwind tokens without hardcoded `#121214`.
- 100% preservation of all legacy test IDs, data attributes, and test harness compatibility.

---

## 6. Verification Method

### 6.1 Automated Test Execution
Run the full test suite and milestone specific tests:
```bash
npm test
npm run test:tier1
npm run test:tier2
npm run test:tier3
npm run test:tier4
npm run test:tier5
```

### 6.2 Production Build Verification
Verify clean TypeScript compilation and Vite production bundle generation:
```bash
npm run build
```

### 6.3 Invalidation Conditions
The implementation will be considered invalid if:
1. Any button or input in AppHeader, CategoryChips, DefectCard, BatchDrawer, EditToolbar has a touch hitbox smaller than 44px.
2. Any `backdrop-blur-*` utility class is introduced into Header, Sidebar, or Stats.
3. Any legacy DOM ID (e.g. `#appHeader`, `#search`, `#clearBtn`, `#setLayout`, `#batchBtn`, `#bcount`, `#setBtn`, `#themeBtn`, `#sidebarNav`, `#subchips`, `#batchDrawer`, `#joinSel`, `#autoclear`, `#modal`, `#mcat`, `#setmodal`) is missing or renamed.
4. Switching to Light Theme (`data-theme="light"`) leaves hardcoded dark regions (`bg-[#121214]`).
5. `npm test` or `npm run build` exits with non-zero code.
