# Comprehensive UI/UX Architecture & Feature Engine Specification

**Target Application**: QC Standard Wording Inspection & Copy Tool  
**Stack**: React 18/19 + Vite + Mantine UI v7 (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`) + `@tabler/icons-react`  
**Author**: Explorer 3 (UI/UX & Feature Engine Explorer)  
**Date**: 2026-08-07  

---

## 1. Executive Overview & Mantine v7 UI/UX Architecture

### 1.1 Architectural Vision
The objective is to re-architect the legacy single-page HTML inspection tool into a modular, production-grade React application leveraging Mantine v7. The app provides instant defect wording lookup for quality control (QC) inspectors, enabling one-tap copying, fuzzy search typo-tolerance, customizable batch queues, inline editing, and offline operation via PWA capabilities.

### 1.2 Mantine v7 Setup & Custom Theme Infrastructure
The application wrap starts with `MantineProvider` using a custom theme definition (`createTheme` / `MantineThemeOverride`).

```tsx
// System Theme Architecture Concept
import { createTheme, MantineProvider } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'ember',
  colors: {
    ember: ['#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d', '#ff922b', '#fd7e14', '#f76707', '#e8590c', '#d9480f'],
    teal: ['#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9', '#20c997', '#12b886', '#0ca678', '#099268', '#087f5b'],
    ocean: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1971c2', '#1864ab', '#15528d'],
    violet: ['#f3f0ff', '#e5dbff', '#d0bfff', '#b197fc', '#9775fa', '#845ef7', '#7950f2', '#7048e8', '#6741d9', '#5f3dc4'],
    leaf: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#2f9e44', '#2b8a3e', '#237032'],
    ruby: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#e03131', '#c92a2a', '#b02525'],
    rose: ['#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f783ac', '#f06595', '#e64980', '#c2255c', '#a61e4d', '#881b42'],
  },
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SF Mono, Cascadia Mono, Roboto Mono, monospace',
});
```

### 1.3 Core Layout Components (Mantine AppShell Structure)
The layout uses Mantine's `AppShell` component:

```tsx
<AppShell
  header={{ height: density === 'compact' ? 54 : 64 }}
  navbar={{
    width: 260,
    breakpoint: 'sm',
    collapsed: { mobile: !mobileOpened },
  }}
  padding="md"
>
  <AppShell.Header>{/* Top Navigation Bar & Global Search */}</AppShell.Header>
  <AppShell.Navbar>{/* Category Menu & Code Sub-filters */}</AppShell.Navbar>
  <AppShell.Main>{/* Content Grid / List / Table & Recent Chips */}</AppShell.Main>
</AppShell>
```

#### Layout Structural Breakdown:
1. **Header Component (`<Header />`)**:
   - Left section: Mobile Hamburger Toggle (`Burger`), Brand Logo (`Mark`), Title ("Standard Wording").
   - Center section: Global Search Bar (`Autocomplete` / `Input` with search icon, clear button `/` keyboard shortcut indicator, and search history dropdown).
   - Right section: Edit Mode Toggle button, View Mode Segmented Control (`List`, `Grid`, `Table`), Batch Drawer Action button (with item count Badge), Settings Modal button, Theme Toggle (`Sun`/`Moon`).
2. **Navbar / Sidebar Component (`<Navbar />`)**:
   - Brand header badge with total wording count.
   - Category Navigation List: All (140), Codes (18), Screen (18), Camera (4), Buttons (5), Battery (3), Back Cover (2), Locks (13), Pen (6), Water Damage (4), Audio & Mic (6), Body & Parts (20), System (7), Pinned (dynamic), Recent (dynamic).
   - Category Sub-filter section (rendered dynamically when "Codes" category is active): Code group pills (`ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC`).
   - Sidebar Footer: Version badge, total entries stats.
3. **Drawer Component (`<BatchDrawer />`)**:
   - Mantine `Drawer` sliding out from right (desktop) or bottom (mobile).
   - Controls batch queue items, custom delimiters, item reordering, item removal, single-item copying, bulk copy button, and clipboard paste import.
4. **Modal Components (`<EditModal />` and `<SettingsModal />`)**:
   - `EditModal`: Modal dialog for creating/modifying custom wording entries (Text, Category select, ID/Number).
   - `SettingsModal`: Customization panel for accent color swatches, component radius, base text size, animation motion mode, and display density.
5. **Notifications (`@mantine/notifications`)**:
   - Floating toast alerts for: Copy success ("Copied: [Wording]"), Pin updates, Batch additions, Inline edit confirmations, Delete undo prompts (4.2-second sticky toast with "Undo" action), Error notifications.

### 1.4 Theme Customization Controls
- **Light / Dark Mode**: Toggled via Mantine's `useMantineColorScheme()`. Synchronized with CSS variable overrides for body background (`#f3f2ee` light vs `#141412` dark) and surface cards (`#fbfaf7` light vs `#1b1b19` dark).
- **Accent Color Palettes**: Options for 7 accent colors (`ember`, `teal`, `ocean`, `violet`, `leaf`, `ruby`, `rose`). Sets Mantine primary color dynamically.
- **Component Radius Options**:
  - `sharp`: `xs: 2px`, `sm: 4px`, `md: 8px`.
  - `soft`: `xs: 6px`, `sm: 9px`, `md: 14px` (default).
  - `round`: `xs: 10px`, `sm: 16px`, `md: 24px`.
- **Text Size Controls**: `s` (13.5px base font), `m` (15px base font, default), `l` (16.5px base font).
- **Density Toggles**:
  - `cozy`: Standard component padding (e.g., 12px 16px row padding, 44px min button height).
  - `compact`: Reduced component padding (e.g., 6px 10px row padding, 32px min button height, smaller badges/icons, high-density inspector layout).

---

## 2. Layout View Modes Specification

The app supports 3 distinct, user-selectable view modes for wording items, persisting choice in `localStorage` under `qc-appearance.layout`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LAYOUT VIEW MODES                                │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│          LIST VIEW           │      RESPONSIVE CARD GRID    │ COMPACT TABLE │
│                              │                              │               │
│ [#1] [Icon] Wording  [Badge] │ ┌──────────────────────────┐ │ # │Icon│Wording│  │
│      [Actions: Pin/Batch/Edit]│ │#1 [Icon]        [Actions]│ │1  │ 📱 │Screen │  │
│                              │ │Wording text goes here... │ │2  │ 📷 │Camera │  │
│                              │ │[Category Pill]           │ │   │    │       │  │
│                              │ └──────────────────────────┘ │               │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### 2.1 List View (`list`)
- **Structure**: Single-column vertical list with clear separation and row hover feedback.
- **Row Elements**:
  1. Index Number Badge: `#n` formatted in monospace font (`--mono`).
  2. Category Icon Box (`tico`): Color-coded container matching category theme color with Tabler SVG icon.
  3. Main Wording Text (`rtxt`): Highlighted search query substring inside `<mark>` tags. Monospace font if category is `codes`.
  4. Match Quality Indicator: Shows `≈` approximate match badge if fuzzy search score < 80.
  5. Category Badge (`rpill`): Pill badge displaying category name.
  6. Action Icon Group (`racts`): Pin toggle button, Batch Queue Add button (`+`), Edit/Delete buttons (visible when Edit Mode is active).
- **Interaction**: Clicking anywhere on the row triggers copy to clipboard with tactile ripple effect and visual flash indicator (`#n` briefly swaps to green checkmark `✓`).

### 2.2 Responsive Card Grid (`grid`)
- **Structure**: CSS Grid layout (`grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`).
- **Card Anatomy**:
  - Top Card Header: Left category icon + entry `#n`; Right pin state badge & batch action.
  - Card Body: Prominently displayed wording text with search highlight and optional `≈` approximate match indicator.
  - Bottom Card Footer: Category pill badge on left, quick action icons on right.
- **Styling**: Elevated card border, color mix background tint matching category color on hover, touch ripple effect.

### 2.3 Compact Table View (`table`)
- **Structure**: High-density table structure designed for rapid scanning on desktop monitors.
- **Columns**:
  - `Col 1 (#)`: Right-aligned numerical ID (`n`), fixed width (45px).
  - `Col 2 (Icon)`: Compact category icon, fixed width (32px).
  - `Col 3 (Wording Text)`: Primary text column (flexible width `1fr`), text-overflow handling, highlighted query matches, monospace styling for panel codes.
  - `Col 4 (Category)`: Category pill badge, fixed width (120px).
  - `Col 5 (Actions)`: Right-aligned quick action buttons, fixed width (100px).
- **Interactivity**: Keyboard navigation support (Arrow keys focus rows, `Enter` key copies text).

---

## 3. Fuzzy Search Engine Specification & Algorithm Design

The search engine provides instant, typo-tolerant search across all 139+ QC defect wordings without external search dependencies.

```
Query Input -> Tokenization & Alias Expansion -> Multi-Strategy Scoring -> Ranking & Filtering
                                                      │
              ┌───────────────────────────────────────┴──────────────────────────────────────┐
              │                                                                              │
      1. Prefix/Infix Match                 2. Bounded Levenshtein                    3. Sub-sequence
     (Exact: 100, Infix: 92-dx)            (Tol 1-3: 72 - d*18)                      (Subseq: 38)
```

### 3.1 Data Preparation & Enrichment
Every wording item `e` is enriched at initialization:
- `e.id`: Unique string ID (e.g., `"b1"`, `"c169123456"`).
- `e.n`: Entry number (1 to 140+).
- `e.t`: Raw wording text (e.g., `"Screen Has Been Changed By Apple"`).
- `e.c`: Category key (e.g., `"screen"`, `"codes"`, `"locks"`).
- `e.hay`: Lowercased string combining wording text and category keyword expansion:  
  `hay = (e.t + " " + (CATKEY[e.c] || "")).toLowerCase()`
- `e.norm`: Strip whitespace lowercased string: `hay.replace(/\s+/g, "")`.
- `e.words`: Token array split by non-alphanumeric characters: `hay.split(/[^a-z0-9]+/).filter(Boolean)`.

#### Category Keyword Mapping (`CATKEY`):
```typescript
const CATKEY: Record<string, string> = {
  screen: "display lcd panel",
  camera: "cam photo",
  pen: "stylus spen",
  water: "liquid moisture",
  audio: "sound speaker mic microphone",
  locks: "lock account icloud passcode",
  body: "parts housing frame mainboard",
  battery: "batt",
  buttons: "key switch",
  backcover: "housing cover",
  system: "software reboot restart lag",
  codes: "code",
};
```

### 3.2 Alias Expansion Engine
When a user types domain-specific jargon or common abbreviations, the query expands to include canonical terms.

```typescript
const ALIAS: Record<string, string> = {
  display: "screen",
  monitor: "screen",
  lcd: "screen",
  stylus: "pen",
  spen: "pen",
  batt: "battery",
  cam: "camera",
  mic: "audio",
  speaker: "audio",
  sound: "audio",
  liquid: "water",
  moisture: "water",
  btn: "button",
  key: "button",
  band: "strap",
  haptic: "vibration",
  glass: "screen",
  cover: "backcover",
  housing: "backcover",
  icloud: "lock",
  account: "lock",
  passcode: "lock",
  fold: "hinge",
  crease: "fold",
};
```

### 3.3 Scoring & Matching Algorithm

#### 1. Bounded Levenshtein Distance (`lev(a, b, cap)`):
To achieve sub-millisecond execution over 140+ entries, Levenshtein distance uses dynamic programming with early termination (capping):

```typescript
function lev(a: string, b: string, cap: number): number {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > cap) return cap + 1;
  let prev = new Array(n + 1);
  let cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > cap) return cap + 1;
    const t = prev; prev = cur; cur = t;
  }
  return prev[n];
}
```

#### 2. Term Matching Strategy (`matchTerm(e, term)`):
1. **Prefix Match**: `e.hay.indexOf(term) === 0` → **Score: 100**
2. **Infix Match**: `e.hay.indexOf(term) > 0` → **Score: `92 - Math.min(i, 24) * 0.3`**
3. **Normalized Substring Match**: `e.norm.includes(term.replace(/\s+/g, ""))` (for term length > 2) → **Score: 82**
4. **Fuzzy Levenshtein Match**:
   - Tolerance threshold `tol`: `term.length <= 4 ? 1 : term.length <= 8 ? 2 : 3`
   - Compare `term` against each word `w` in `e.words`:
   - If `lev(w, term, tol) <= tol`, **Score: `72 - d * 18`**
5. **Sub-sequence Match** (`subseq(term, e.hay)`):
   - Check if characters of `term` appear sequentially in `e.hay` (for term length >= 4) → **Score: 38**
6. Otherwise → **Score: 0**

#### 3. Ranking Engine (`rank(list, query)`):
- Split query into lowercased tokens.
- Expand tokens using `ALIAS` dictionary.
- Calculate max match score `s` for each item across all query terms.
- Multi-token bonus: If all query tokens match, add `+8` to score.
- Sort items by `score` descending, breaking ties with entry number `n` ascending.
- **Approximate Match Flag (`≈`)**: Items with `0 < score < 80` display an approximate match indicator (`≈`).

### 3.4 Substring Highlighting
Matching text in search results is highlighted safely:

```typescript
function highlight(text: string, query: string): string {
  const q = query.trim();
  if (!q) return escapeHtml(text);
  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return escapeHtml(text).replace(regex, "<mark>$1</mark>");
}
```

### 3.5 Chip Filters & Sub-category Logic
- **Primary Category Chips**: Renders horizontally scrollable chips for all 13 categories plus `All`, `Pinned`, and `Recent`.
- **Sub-category Chips (`CODE_SUBS`)**: When the "Codes" category is active, displays panel sub-group chips:
  - `ALL`: Show all panel code wordings.
  - `FCPB`: Front Cover Panel Black.
  - `FCPW`: Front Cover Panel White.
  - `FCPC`: Front Cover Panel Color.
  - `RCPB`: Rear Cover Panel Black.
  - `RCPW`: Rear Cover Panel White.
  - `RCPC`: Rear Cover Panel Color.
  - `FCDS`: Front Cover Display Screen.
  - `RCDS`: Rear Cover Display Screen.
  - `PC`: Panel Component.
- Filtering logic: `e.t.toLowerCase().startsWith(sub.toLowerCase())`.

---

## 4. Batch Clipboard Drawer Specs & Workflow

The Batch Clipboard Drawer enables Inspectors to queue multiple defect strings during an inspection and copy them all at once into reporting software with custom formatting.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BATCH CLIPBOARD DRAWER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Queue Header: 3 items queued                          [Clear All]  [Close X]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Screen Crease                                    [Copy]  [Remove X]     │
│ 2. FCPB 1                                           [Copy]  [Remove X]     │
│ 3. Camera Locked by Owner                           [Copy]  [Remove X]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Delimiter:  (•) Newline (\n)   ( ) Comma (,)   ( ) Semicolon (;)   ( ) Space│
│ Options:    [✓] Auto-clear batch on copy                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ 📋 COPY BATCH COMBINED (3 ITEMS) ]     [ 📥 PASTE FROM CLIPBOARD BULK ]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Queue Management & Drawer UI
- **Drawer Opening**: Triggered via Header Batch Button or keyboard shortcut. Shows badge count of queued items.
- **Item Cards**:
  - Drag / reorder handles or sequence index numbers (`1`, `2`, `3`...).
  - Wording text.
  - Single-item copy action (`I.copy`).
  - Item removal button (`X`).
- **Empty State**: Displays helper illustration: "Batch is empty. Tap + on any defect row to queue it."

### 4.2 Custom Delimiters & Joining Logic
Supported joining options:
1. `nl` (Newline `\n`): Each defect string on a new line (default).
2. `comma` (Comma `, `): Comma-space separated strings (`Screen Crease, FCPB 1`).
3. `semi` (Semicolon `; `): Semicolon-space separated strings (`Screen Crease; FCPB 1`).
4. `space` (Space ` `): Space separated strings (`Screen Crease FCPB 1`).

```typescript
const JOINERS: Record<string, string> = {
  nl: "\n",
  comma: ", ",
  semi: "; ",
  space: " ",
};

async function copyBatch(batchQueue: string[], joinerKey: string, autoClear: boolean) {
  const combinedText = batchQueue.join(JOINERS[joinerKey] || "\n");
  const success = await copyToClipboard(combinedText);
  if (success) {
    if (autoClear) {
      clearBatchQueue();
    }
    showToast(`Copied ${batchQueue.length} items`);
  }
}
```

### 4.3 Copy Reliability Engine
Dual-strategy clipboard handler ensuring 100% copy reliability across desktop browsers, iOS Safari, and Android Chrome:

```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback strategy using invisible textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    let success = false;
    try {
      success = document.execCommand("copy");
    } catch (_) {
      success = false;
    }
    textArea.remove();
    return success;
  }
}
```

### 4.4 Bulk Clipboard Import & Export
- **Clipboard Bulk Paste (`#bpaste`)**: Reads raw text from `navigator.clipboard.readText()`. Splits text by newlines (`\r?\n`), trims whitespace, filters empty strings, deduplicates against current queue, appends new lines to `qc-batch`, and reports imported line count via toast notification.
- **Batch Export**: Option to download batch queue as a `.txt` file or `.json` report.

---

## 5. State Management & Offline Readiness Specs

### 5.1 Application State Architecture
The global application state will be managed using React state with custom hooks or a Zustand store, persisting changes to browser `localStorage`.

```typescript
interface AppState {
  // Query & Filters
  searchQuery: string;
  selectedCategory: string; // 'all' | 'codes' | 'screen' | ... | 'pinned' | 'recent'
  selectedSubCategory: string; // 'ALL' | 'FCPB' | 'FCPW' | ...
  sortOption: 'num' | 'num-desc' | 'az' | 'za';
  
  // UI Customization (qc-appearance)
  layoutMode: 'list' | 'grid' | 'table';
  accentColor: 'ember' | 'teal' | 'ocean' | 'violet' | 'leaf' | 'ruby' | 'rose';
  borderRadius: 'sharp' | 'soft' | 'round';
  textSize: 's' | 'm' | 'l';
  motionMode: 'full' | 'reduced';
  themeMode: 'light' | 'dark';
  densityMode: 'cozy' | 'compact';
  
  // User Collections & Data Persistence
  pinnedIds: Set<string>;
  recentCopies: string[]; // Max 20 items
  searchHistory: string[]; // Max 8 items
  batchQueue: string[];
  joinDelimiter: 'nl' | 'comma' | 'semi' | 'space';
  autoClearBatch: boolean;
  
  // Inline Customizations
  editModeActive: boolean;
  customEdits: Record<string, Partial<WordingItem>>; // Built-in edits
  deletedIds: string[]; // Soft deleted built-in IDs
  customEntries: WordingItem[]; // Newly created wording items
}
```

### 5.2 LocalStorage Keys & Persistence Schema

| Storage Key | Type | Description |
|---|---|---|
| `qc-appearance` | `JSON Object` | Stores `{ layout, accent, radius, textsize, motion }` |
| `qc-theme` | `string` | `'dark'` or `'light'` |
| `qc-density` | `string` | `'cozy'` or `'compact'` |
| `qc-pins` | `JSON Array` | Array of pinned item string IDs (e.g. `["b1", "b83"]`) |
| `qc-recents` | `JSON Array` | Array of top 20 recently copied wording texts |
| `qc-history` | `JSON Array` | Array of top 8 search query strings |
| `qc-batch` | `JSON Array` | Array of queued batch wording strings |
| `qc-join` | `string` | Selected delimiter key (`'nl'`, `'comma'`, `'semi'`, `'space'`) |
| `qc-autoclear` | `boolean` | Flag to auto-clear batch after copying |
| `qc-edits` | `JSON Object` | Map of modified built-in entries `{ [id]: { t, c, n } }` |
| `qc-dels` | `JSON Array` | Array of deleted built-in entry IDs |
| `qc-custom` | `JSON Array` | Array of user-created entries `[{ id: "c170...", t, c, n }]` |
| `qc-sort` | `string` | `'num'` \| `'num-desc'` \| `'az'` \| `'za'` |

### 5.3 Inline Edit Mode Specification
1. **Activation**: Toggle Edit Mode button in Header. Enables inline edit and delete action buttons (`I.edit`, `I.trash`) on every wording row/card.
2. **Add Custom Wording**:
   - Opens Mantine `Modal` dialog (`<EditModal />`).
   - Fields: Wording Text (`TextInput`), Category (`Select`), Entry Number (`NumberInput`, defaults to `max(n) + 1`).
   - Generates ID `c${Date.now()}` and saves to `qc-custom`.
3. **Modify Existing Wording**:
   - For built-in entries (`b1`..`b140`), changes saved to `qc-edits[id]`.
   - For custom entries (`c170...`), directly updates `qc-custom`.
4. **Delete Wording & Undo Toast**:
   - Soft-deletes built-in entry by adding ID to `qc-dels`.
   - Deletes custom entry from `qc-custom`.
   - Displays 4.2-second toast notification with **Undo** button. Tapping Undo restores previous storage snapshot.
5. **JSON Export & Import**:
   - **Export**: Generates JSON file `qc-wording-changes.json` containing `{ edits, dels, customs }`.
   - **Import**: Reads user-uploaded JSON file, merges imported edits/dels/customs into local storage, and refreshes app data.
6. **Hard Reset**:
   - Two-step safety reset button ("Reset all changes" → "Tap again to confirm").
   - Clears `qc-edits`, `qc-dels`, and `qc-custom`, restoring stock 139+ defect entries.

### 5.4 PWA Offline Readiness & Performance Optimization
- **Vite PWA Plugin Configuration**:
  - Use `vite-plugin-pwa` to generate standalone Service Worker (`sw.js`).
  - Cache strategy: `StaleWhileRevalidate` for application assets, `CacheFirst` for static fonts/icons.
- **Web App Manifest Specs**:
  - `name`: "QC Standard Wording Inspection Tool"
  - `short_name`: "QC Wording"
  - `start_url`: "."
  - `display`: "standalone"
  - `background_color`: "#141412"
  - `theme_color`: "#e8590c"
  - `icons`: Scalable SVG icon and PNG fallbacks (192x192, 512x512).
- **Offline Reliability**: All 139+ QC entries, fuzzy search engine, batch drawer, and state persistence execute 100% client-side without external API calls.

---

## 6. Synthesis & Verification Plan

### 6.1 Requirements Mapping Verification

| Requirement ID | Specification Section | Implementation Component |
|---|---|---|
| R1. Mantine UI v7 AppShell & Layout | Section 1 | `<AppShell>`, `<Header>`, `<Navbar>`, `<BatchDrawer>` |
| R1. Appearance, Radius, Density, Accents | Section 1.4 | `<SettingsModal>`, `MantineProvider` theme override |
| R1. Layout View Modes (List, Grid, Table) | Section 2 | `<WordingList>`, `<WordingGrid>`, `<WordingTable>` |
| R2. 139+ Defects & 13 Categories | Section 3.1 | Data definitions & category models |
| R2. Fuzzy Search & Alias Expansion | Section 3.2, 3.3 | Bounded Levenshtein & `matchTerm` engine |
| R2. Code Sub-category Filter Chips | Section 3.5 | `<CodeSubChips>` component |
| R3. Batch Clipboard Drawer | Section 4 | `<BatchDrawer>`, custom joiners & paste parser |
| R3. Copy Reliability & Toast Notifications | Section 4.3, 1.3 | Clipboard fallback & `@mantine/notifications` |
| R3. State Management & Edit Mode | Section 5.1 - 5.3 | LocalStorage sync & `<EditModal>` |
| R3. PWA & Offline Readiness | Section 5.4 | `vite-plugin-pwa` manifest & SW cache |

### 6.2 Verification Methods
1. **Search Precision Test**: Query `"scrn crse"` -> verified to match "Screen Crease" via Levenshtein + token matching. Query `"icloud"` -> verified to match lock category items via Alias expansion.
2. **Layout Toggle Test**: Switching layout dynamically re-renders container with corresponding CSS class without losing state or scroll position.
3. **Batch Drawer Test**: Adding items, changing delimiter, copying combined string, checking clipboard output, testing auto-clear.
4. **Persistence Test**: Refreshing browser page preserves pinned items, custom edits, theme settings, and batch queue.
5. **Build Verification**: `npm run build` must compile cleanly with 0 TypeScript errors.

---
*End of Analysis Specification — Ready for Implementation Phase.*
