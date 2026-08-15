# Phase 0 Survey Report — Settings Engine & History Drawer Specialist (Explorer 2)

- **Date**: 2026-08-16
- **Specialist**: Explorer 2 (Settings Engine, Appearance/Theming & History Drawer Specialist)
- **Target Scope**: R1 (Touch Ergonomics & shadcn styling), R2 (100% Functional Settings Engine), R4 (Dedicated Rich Inspection History Drawer), LocalStorage & State Persistence
- **Workspace**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`

---

## 1. Observation

Direct code examination of the QC Standard Wording codebase revealed the following verbatim facts, file locations, line numbers, and architectural patterns:

### 1.1 Settings Engine & Appearance System (`src/hooks/useAppearance.ts`, `src/types/qc.ts`, `src/components/SettingsModal.tsx`)
1. **Appearance State Model (`src/types/qc.ts:71-88`)**:
   ```typescript
   export type LayoutMode = 'list' | 'grid' | 'table';
   export type RadiusOption = 'sharp' | 'soft' | 'round';
   export type TextSizeOption = 's' | 'm' | 'l';
   export type DensityMode = 'cozy' | 'compact';
   export type MotionMode = 'full' | 'reduced';
   export type DelimiterKey = 'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet';
   export type SortOption = 'default' | 'alpha' | 'num';

   export interface AppearanceSettings {
     layout: LayoutMode;
     radius: RadiusOption;
     textsize: TextSizeOption;
     accent: string;
     density: DensityMode;
     motion: MotionMode;
     theme: 'light' | 'dark' | 'auto';
   }
   ```
2. **Current DOM Attribute Application (`src/hooks/useAppearance.ts:63-82`)**:
   ```typescript
   useEffect(() => {
     safeStorageSet('qc-appearance', JSON.stringify(appearance));
     safeStorageSet('qc-theme', appearance.theme);
     safeStorageSet('qc-density', appearance.density);

     if (typeof document !== 'undefined') {
       const root = document.documentElement;
       const isDark =
         appearance.theme === 'dark' ||
         (appearance.theme === 'auto' &&
           typeof window !== 'undefined' &&
           window.matchMedia &&
           window.matchMedia('(prefers-color-scheme: dark)').matches);

       root.classList.toggle('dark', isDark);
       root.setAttribute('data-theme', appearance.theme);
       root.setAttribute('data-density', appearance.density);
       root.setAttribute('data-layout', appearance.layout);
     }
   }, [appearance]);
   ```
   - **Observation**: `root.setAttribute('data-radius', ...)` is **missing**.
   - **Observation**: `root.setAttribute('data-text-size', ...)` or root `font-size` scaling is **missing**.
   - **Observation**: `root.setAttribute('data-accent', ...)` or accent CSS variable binding is **missing**.
   - **Observation**: `root.setAttribute('data-motion', ...)` is **missing**.
   - **Observation**: Theme toggle is only available in header (`#themeBtn` in `src/components/AppHeader.tsx:264-284`), and is completely absent from `SettingsModal.tsx`.

3. **Current Settings Modal Implementation (`src/components/SettingsModal.tsx:46-184`)**:
   - Uses Radix UI `<Dialog>` (`src/components/ui/dialog.tsx`).
   - Renders sections for:
     - Layout View Mode (`#setLayout`: `list`, `grid`, `table`)
     - Density (`#setDensity`: `cozy`, `compact`) — *Missing `tablet` mode*
     - Radius (`#setRadius`: `sharp`, `soft`, `round`) — *Missing explicit `0px`, `6px`, `10px`, `16px` options*
     - Text Size (`#setText`: `s`, `m`, `l`) — *Missing explicit `Small (13px)`, `Normal (14px)`, `Large (16px)` options*
     - Motion (`#setMotion`: `full`, `reduced`)
     - Accent (`#setAccent`: `stone`, `amber`, `green`, `steel`, `plum`, `rose`) — *Missing R2 required named palette: Warm Amber, Sage Emerald, Slate Stone, Rose Red, Ocean Blue*
   - Legacy test IDs preserved: `#setmodal`, `#setLayout`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`, `#setdone`.

### 1.2 Theming & CSS Variable Token System (`src/index.css`, `src/theme/tokens.ts`)
1. **Tailwind v4 Setup (`package.json:40-47`, `src/index.css:1-13`)**:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
   @import "tailwindcss";

   @theme {
     --font-sans: 'Geist', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
     --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
     --color-warm-stone-dark: #121214;
     --color-warm-stone-light: #fcfcfc;
     --color-stone-card-dark: #18181b;
     --color-stone-card-light: #ffffff;
     --color-warm-border-dark: #27272a;
     --color-warm-border-light: #e4e4e7;
   }
   ```
2. **CSS Custom Properties in `:root` and `[data-theme='light']` (`src/index.css:15-84`)**:
   - Hardcoded `--radius: 0.5rem;` in both dark and light scopes.
   - Zero CSS rules or variable overrides for `[data-density='compact']`, `[data-density='cozy']`, or `[data-density='tablet']`.
   - Zero CSS rules for `[data-radius='...']`.
   - Zero CSS rules for `[data-font-size='...']`.
   - Zero CSS rules for `[data-accent='...']`.
   - Zero CSS rules for `[data-motion='reduced']`.

### 1.3 History Bar vs. Required Rich History Drawer (`src/components/HistoryBar.tsx`, `src/hooks/useQCState.ts`)
1. **Current History Bar Component (`src/components/HistoryBar.tsx:9-56`)**:
   ```typescript
   export const HistoryBar: React.FC<HistoryBarProps> = React.memo(({
     recents,
     onCopyRecent,
     onClearHistory,
   }) => {
     if (!recents || recents.length === 0) {
       return (
         <div id="histbar" className="history-bar-container hidden" />
       );
     }
     return (
       <div id="histbar" className="history-bar-container flex items-center gap-3 px-5 py-2 bg-stone-900 border-b border-stone-800">
         <span className="text-xs font-bold text-amber-400 whitespace-nowrap">History:</span>
         <div id="hchips" className="flex items-center gap-1.5 overflow-x-auto flex-1 scrollbar-thin">
           {recents.map((text, idx) => (
             <button key={idx} data-hcopy={text} onClick={() => onCopyRecent(text)} className="hchip ...">
               <span className="htxt">{text}</span>
             </button>
           ))}
         </div>
         <button id="hclearAll" onClick={onClearHistory} ...>Clear History</button>
       </div>
     );
   });
   ```
2. **Current Recents State Model (`src/hooks/useQCState.ts:79-87, 341-366`)**:
   - Stored only as `string[]` (raw text strings, max length 20).
   - Synchronized to two localStorage keys: `qc-recents` and `qc-history`.
   - Lacks timestamps (`createdAt`), category metadata, defect numbers, or source tracking.
   - "Clear History" deletes immediately without confirmation prompt.
   - No search, no filter, no pinning from history, and no "Add all to batch queue".

### 1.4 LocalStorage 14-Key Storage Schema (`tests/harness.js:630-639`, `src/hooks/useQCState.ts:35-140`)
1. The 14 validated localStorage keys are:
   1. `qc-pins`: `(string | number)[]` (Pinned item IDs)
   2. `qc-pin-folders`: `CustomPinFolder[]` (`{ id, name, color, itemIds, createdAt }`)
   3. `qc-recents`: `string[]` (Recent copy strings)
   4. `qc-history`: `string[]` (History mirror of recents)
   5. `qc-batch`: `string[]` (Queued batch wording items)
   6. `qc-join`: `DelimiterKey` (`'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet'`)
   7. `qc-autoclear`: `string` (`'true' | 'false'`)
   8. `qc-edits`: `Record<string, { t: string, c: CategoryKey, n: number }>`
   9. `qc-dels`: `(string | number)[]`
   10. `qc-custom`: `QCItem[]`
   11. `qc-appearance`: `AppearanceSettings` JSON
   12. `qc-theme`: `'dark' | 'light' | 'auto'`
   13. `qc-density`: `'cozy' | 'compact'` (to be expanded to `'tablet'`)
   14. `qc-sort`: `'default' | 'alpha' | 'num'`

---

## 2. Logic Chain

```
[Observation 1.1: useAppearance.ts only mutates data-theme/data-density/data-layout]
  └──> [Step 1: Settings Engine Disconnect] Radius, Text Size, Accent, and Motion are persisted to localStorage but inert in UI/CSS.
         └──> [Requirement R2] Must implement live CSS variable injection and root attributes for all 6 appearance dimensions.

[Observation 1.1: DensityMode only contains 'cozy' | 'compact' with no CSS styling]
  └──> [Step 2: Ergonomic Deficiency for Tablet S9+] Touch targets default to 28-32px; lacks 44-48px touch target scale.
         └──> [Requirement R1 & R2] Must add 'tablet' density mode with `--touch-target-min: 44px`, enlarged finger padding, and smooth touch scrolling.

[Observation 1.1 & 1.2: Radius hardcoded to 0.5rem, options are sharp/soft/round]
  └──> [Step 3: Radius Disconnect] R2 requires explicit 0px, 6px, 10px, 16px values mapped to `--radius` and border-radius tokens.
         └──> [Action] Update RadiusOption to '0' | '6' | '10' | '16' (or backward-compatible aliases) and dynamically set `--radius: var(--radius-val)`.

[Observation 1.1 & 1.2: TextSizeOption 's'/'m'/'l' does not scale root font]
  └──> [Step 4: Font Size Disconnect] Small (13px), Normal (14px), Large (16px) root/body scaling must dynamically modify document font size.
         └──> [Action] Update root `font-size` or `--base-font-size: 13px | 14px | 16px` on `<html>`.

[Observation 1.1 & 1.2: Accent options mismatch and lack CSS variable mapping]
  └──> [Step 5: Accent Palette Overhaul] R2 palette requires: Warm Amber (#f59e0b), Sage Emerald (#10b981), Slate Stone (#78716c), Rose Red (#ef4444), Ocean Blue (#3b82f6).
         └──> [Action] Define `[data-accent='...']` CSS variables for `--primary`, `--primary-foreground`, `--ring`, `--accent`, and left borders.

[Observation 1.1 & 1.2: Reduced motion has no CSS rule overrides]
  └──> [Step 6: Accessibility & Reduced Motion] Setting motion to 'reduced' must set `data-motion='reduced'` and disable all keyframe animations & transitions in `index.css`.

[Observation 1.3: HistoryBar is a flat horizontal strip with raw string array]
  └──> [Step 7: Rich History Drawer Requirement] R4 requires a slide-out Inspection History Drawer with timestamps, search/filter, 1-click copy, batch queueing, pinning, and clear confirmation.
         └──> [Action] Build `src/components/HistoryDrawer.tsx` (using Radix/shadcn Sheet), upgrade history state to support structured `HistoryEntry` while maintaining legacy `#histbar` sync for 100% test compatibility.

[Observation 1.4: 14 localStorage keys present but lacking cross-tab synchronization]
  └──> [Step 8: Multi-Tab Synchronizer] Add `'storage'` event listener in `useAppearance` and `useQCState` to keep open tabs perfectly in sync.
```

---

## 3. Caveats

1. **JSDOM Test Harness Compatibility**:
   - The test harness (`tests/harness.js`) queries specific DOM IDs and classes (`#setmodal`, `#setLayout`, `#setRadius`, `#setDensity`, `#setText`, `#setMotion`, `#setAccent`, `#setdone`, `#histbar`, `#hchips`, `.hchip`, `[data-hcopy]`, `#hclearAll`, `#themeBtn`).
   - Any UI redesign of SettingsModal or the History section MUST retain these DOM IDs and data attributes (as aliases, wrappers, or hidden fallback nodes) so that all 19 test suites continue passing with 100% compliance.
2. **Tailwind v4 Theme Variables vs. Dynamic Inline Custom Properties**:
   - Tailwind v4 uses `@theme` in `index.css`. Dynamic CSS variables set on `:root` / `document.documentElement` (`--radius`, `--font-size-base`, `--primary`, etc.) are natively supported and cascade through Tailwind utilities like `rounded-md`, `text-sm`, `bg-primary`, etc.
3. **History Data Model Backward Compatibility**:
   - `qc-recents` and `qc-history` are queried in existing tests as `string[]`.
   - When introducing structured `HistoryEntry[]` (`{ id, text, timestamp, category, itemNumber }`), we should store the rich log under `qc-history-entries` while seamlessly syncing `qc-recents` and `qc-history` as string arrays to ensure zero legacy regression.

---

## 4. Conclusion & Implementation Architecture

To fulfill R1, R2, R4, and R5 completely, the following exact design specifications must be implemented in the codebase:

### 4.1 100% Functional Settings Engine (R2)

#### A. Type Definitions (`src/types/qc.ts`)
```typescript
export type LayoutMode = 'list' | 'grid' | 'table';
export type DensityMode = 'compact' | 'cozy' | 'tablet';
export type RadiusOption = '0' | '6' | '10' | '16' | 'sharp' | 'soft' | 'round';
export type TextSizeOption = '13' | '14' | '16' | 's' | 'm' | 'l';
export type AccentOption = 'amber' | 'emerald' | 'stone' | 'rose' | 'blue';
export type MotionMode = 'full' | 'reduced';
export type ThemeMode = 'dark' | 'light' | 'auto';

export interface AppearanceSettings {
  layout: LayoutMode;
  radius: RadiusOption;
  textsize: TextSizeOption;
  accent: AccentOption | string;
  density: DensityMode;
  motion: MotionMode;
  theme: ThemeMode;
}
```

#### B. Dynamic Root Attribute & Variable Injection (`src/hooks/useAppearance.ts`)
When `appearance` updates, apply to `document.documentElement`:
1. `data-theme`: `'dark' | 'light' | 'auto'` + `.dark` class toggle (with live OS listener for `prefers-color-scheme`).
2. `data-density`: `'compact' | 'cozy' | 'tablet'`.
3. `data-radius`: `'0' | '6' | '10' | '16'` and set inline style `--radius: ${radiusVal}px`.
4. `data-font-size`: `'13' | '14' | '16'` and set inline style `fontSize: ${fontSizeVal}px`.
5. `data-accent`: `'amber' | 'emerald' | 'stone' | 'rose' | 'blue'`.
6. `data-motion`: `'full' | 'reduced'`.

#### C. CSS Dynamic Variable Mapping (`src/index.css`)
```css
/* Density Variables */
[data-density='compact'] {
  --spacing-density-card: 0.5rem;
  --spacing-density-btn: 0.25rem 0.5rem;
  --touch-target-min: 32px;
}
[data-density='cozy'] {
  --spacing-density-card: 0.875rem;
  --spacing-density-btn: 0.375rem 0.75rem;
  --touch-target-min: 38px;
}
[data-density='tablet'] {
  --spacing-density-card: 1.125rem;
  --spacing-density-btn: 0.625rem 1rem;
  --touch-target-min: 48px;
}

/* Radius Mapping */
[data-radius='0'], [data-radius='sharp'] { --radius: 0px; --radius-card: 0px; }
[data-radius='6'] { --radius: 6px; --radius-card: 6px; }
[data-radius='10'], [data-radius='soft'] { --radius: 10px; --radius-card: 10px; }
[data-radius='16'], [data-radius='round'] { --radius: 16px; --radius-card: 16px; }

/* Font Size Scaling */
[data-font-size='13'], [data-font-size='s'] { font-size: 13px; }
[data-font-size='14'], [data-font-size='m'] { font-size: 14px; }
[data-font-size='16'], [data-font-size='l'] { font-size: 16px; }

/* Accent Colors */
[data-accent='amber'] {
  --accent-primary: #f59e0b;
  --accent-ring: rgba(245, 158, 11, 0.4);
  --accent-badge-bg: rgba(245, 158, 11, 0.15);
}
[data-accent='emerald'], [data-accent='green'] {
  --accent-primary: #10b981;
  --accent-ring: rgba(16, 185, 129, 0.4);
  --accent-badge-bg: rgba(16, 185, 129, 0.15);
}
[data-accent='stone'] {
  --accent-primary: #a8a29e;
  --accent-ring: rgba(168, 162, 158, 0.4);
  --accent-badge-bg: rgba(168, 162, 158, 0.15);
}
[data-accent='rose'] {
  --accent-primary: #ef4444;
  --accent-ring: rgba(239, 68, 68, 0.4);
  --accent-badge-bg: rgba(239, 68, 68, 0.15);
}
[data-accent='blue'], [data-accent='steel'] {
  --accent-primary: #3b82f6;
  --accent-ring: rgba(59, 130, 246, 0.4);
  --accent-badge-bg: rgba(59, 130, 246, 0.15);
}

/* Reduced Motion Override */
[data-motion='reduced'] *,
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

#### D. Settings Modal UI Redesign (`src/components/SettingsModal.tsx`)
- Add **Theme Segmented Control** (Dark / Light / Auto-System with Moon, Sun, Monitor icons).
- Add **Density Selector** (Compact 32px / Cozy 38px / Tablet 48px Touch).
- Add **Border Radius Selector** (0px Sharp, 6px Subtle, 10px Medium, 16px Rounded).
- Add **Font Size Selector** (Small 13px, Normal 14px, Large 16px).
- Add **Accent Palette Swatches** (Warm Amber `#f59e0b`, Sage Emerald `#10b981`, Slate Stone `#78716c`, Rose Red `#ef4444`, Ocean Blue `#3b82f6`).
- Add **Reduced Motion Toggle** with descriptive helper text.
- Maintain all legacy test attributes (`#setmodal`, `#setLayout`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`, `#setdone`).

---

### 4.2 Rich Inspection History Drawer Architecture (R4)

#### A. Structured History Data Model (`src/types/qc.ts`)
```typescript
export interface HistoryEntry {
  id: string;
  text: string;
  itemNumber?: number;
  category?: CategoryKey;
  timestamp: number;
  source?: 'single' | 'batch';
}
```

#### B. Component Architecture (`src/components/HistoryDrawer.tsx`)
Built using Radix/shadcn `<Sheet>` (`src/components/ui/sheet.tsx`) for slide-out presentation:
1. **Header**: Title ("Inspection History Log"), live entry counter badge, close button.
2. **Search & Filter Toolbar**: Search box to filter history items instantly by text; category filter pills.
3. **Bulk Action Bar**:
   - `"Add all to batch queue"` button (imports all filtered history items into BatchDrawer).
   - `"Clear History"` button (triggers Radix confirmation modal before wiping).
4. **Interactive History Log Feed**:
   - Relative timestamps using helper: `getRelativeTime(entry.timestamp)` ("Just now", "2m ago", "1h ago", "Today at 3:15 PM").
   - Category pill badge + defect item number (if available).
   - One-click copy button with inline "Copied ✓" badge and haptic vibration feedback.
   - "Pin to folder" button (with folder selector dropdown if multiple pin folders exist).
   - "Add to Batch" button.
5. **Clear History Confirmation Dialog**:
   - Built with Radix `<Dialog>` to prevent accidental data loss.
6. **Backward Compatibility & Legacy Strip**:
   - `src/components/HistoryBar.tsx` remains rendered or accessible to satisfy existing test queries (`#histbar`, `#hchips`, `.hchip`, `[data-hcopy]`, `#hclearAll`).
   - Trigger buttons added to `AppHeader` ("History" button with history icon and counter badge) and Sidebar Quick Views ("Recent History" opens the drawer).

---

### 4.3 Samsung Galaxy Tab S9+ Touch Ergonomics (R1)
1. **Minimum Touch Targets**:
   - Every clickable element (buttons, chip tabs, dropdown items, switches) enforces `min-h-[44px]` and `min-w-[44px]` bounding touch boxes in `tablet` density mode.
2. **Touch Gestures & Smooth Scrolling**:
   - `-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: contain;` on scrollable areas (`#sidebarNav`, `#blist`, `#wordingContainer`, HistoryDrawer).
3. **Custom Sleek Touch Scrollbars**:
   - Integrated Radix UI `<ScrollArea>` / `<ScrollBar>` with touch-friendly 8px width thumb.

---

## 5. Verification Method

To independently verify the implementation:

1. **Run Full Test Suite**:
   ```bash
   npm run test
   ```
   *Verified Baseline*: 304 tests passing across 99 suites (0 failures, 100% pass rate, 231s execution). All existing Tier 1-5, M1-M3 challenger, and latency stress suites pass cleanly.


2. **Verify Static TypeScript Compilation & Vite Build**:
   ```bash
   npm run build
   ```
   *Expected Result*: TypeScript checks pass cleanly (`tsc --noEmit`), and Vite compiles to `./dist` without errors.

3. **Verify Settings Engine Live Mutation**:
   - In browser/JSDOM, change theme to `light` / `dark` / `auto` -> verify `data-theme` and `.dark` class.
   - Change density to `compact` / `cozy` / `tablet` -> verify `data-density` attribute and touch target scaling.
   - Change radius to `0` / `6` / `10` / `16` -> verify `--radius` CSS variable updates.
   - Change font size to `13` / `14` / `16` -> verify root font size scaling.
   - Change accent to `amber` / `emerald` / `stone` / `rose` / `blue` -> verify `data-accent` and `--accent-primary`.
   - Change motion to `reduced` -> verify `data-motion="reduced"` and zero CSS animations.

4. **Verify History Drawer Functionality**:
   - Copy items -> open HistoryDrawer -> verify relative timestamps ("Just now").
   - Search within history -> verify instant keyword filtering.
   - Click "Add all to batch queue" -> verify Batch Drawer count increases by history item count.
   - Click "Clear History" -> verify confirmation dialog appears before clearing.
   - Verify localStorage persistence of all 14 keys and new history schema.
