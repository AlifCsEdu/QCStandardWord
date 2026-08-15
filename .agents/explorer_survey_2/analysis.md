# QC Standard Wording — Comprehensive UI Feature & State Architecture Analysis

## 1. Executive Summary

This report presents a comprehensive survey and architectural breakdown of the **QC Standard Wording** web application codebase at `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`. The analysis was conducted by `explorer_survey_2` to evaluate existing features, state management models, UI component structures, interface contracts, and design tokens against the design overhaul requirements specified in `ORIGINAL_REQUEST.md`.

### Core Assessment
- **Current Aesthetic Baseline**: The application currently implements a **Zinc Dark / Deep Void** palette (`#050608` / `#0c0e12` / `#18181b`) with cyan accent highlights (`#06b6d4`), cyan glow borders, cyan selection halos, and heavy backdrop blur filters (`backdrop-blur-xl`, `backdrop-blur-2xl`).
- **Target Aesthetic (`ORIGINAL_REQUEST.md`)**: The application requires a complete elimination of AI design tropes (heavy glassmorphism blurs, neon gradients, dark void halos) and a full migration to a **Raycast Warm Stone** palette (`#121214` dark / `#fcfcfc` light, warm grey borders `border-stone-800` / `border-stone-200`, soft muted category pills, and crisp tactile cards).
- **Functional Completeness**: All functional systems—state management (14 localStorage keys), custom user pin folder manager, ⌘K spotlight modal, batch drawer operations, view toggles, and toast notifications—are fully implemented and operational. The primary focus of upcoming work is visual palette refinement, theme token overhaul, and eliminating neon glow/glassmorphism blurs while maintaining 100% test suite and DOM ID contract compliance.

---

## 2. Comprehensive UI & Feature Inventory

### 2.1 Top Header (`src/components/AppHeader.tsx`)
- **Existing Functionality**:
  - Fixed sticky header (`#appHeader`, `data-testid="app-header"`) pinned to top (`sticky top-0 z-40`).
  - Left section: Mobile menu toggle button (`Menu` icon, visible `< sm`), app title ("QC Standard Wording"), version badge ("v2.0").
  - Center section: Real-time defect search input (`#search`, `data-testid="header-search-input"`), search clear button (`#clearBtn`), and ⌘K Spotlight modal trigger button (`#spotlightBtn`, `data-testid="spotlight-trigger"`).
  - Right section: View switcher toggle group (`#setLayout`, `data-testid="view-switcher"`) supporting `list`, `grid`, and `table` layout modes; optional Pin Folder Manager button; Edit mode toggle button (`#editBtn`); Batch Queue drawer toggle button (`#batchBtn`) with live count badge (`#bcount`); Settings modal toggle button (`#setBtn`); Offline Copy HTML exporter button (`#dlBtn`); Dark/Light theme toggle button (`#themeBtn`).
- **State Dependencies**:
  - `searchQuery`, `setSearchQuery`, `layoutMode`, `onSetLayout`, `editMode`, `onToggleEditMode`, `batchCount`, `onOpenBatchDrawer`, `settingsModalOpen`, `theme`, `onToggleTheme`, `mobileOpened`.
- **Current Styling**:
  - `bg-[#0c0e12]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.4)]`.
  - Active view mode uses `bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]`.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - Heavy backdrop blur (`backdrop-blur-xl`) and dark onyx background (`#0c0e12`) must be replaced with solid, subtle Raycast Warm Stone header surfaces (`#121214` dark / `#fcfcfc` light).
  - Glowing cyan active highlights and borders must be replaced with warm grey borders (`border-stone-800` / `border-stone-200`) and warm stone active button fills.

### 2.2 Sticky Left Sidebar & Navigation (`src/components/CategoryChips.tsx` & `src/components/CodeSubChips.tsx`)
- **Existing Functionality**:
  - Navigation container (`#sidebarNav`, `#nav`, `data-testid="app-navbar"`) positioned `fixed sm:sticky top-[60px] h-[calc(100vh-60px)] w-[260px] overflow-y-auto`.
  - Section 1 — **Quick Views**: "All Defects" (`all`), "Starred Defects" (`pinned`), "Recent History" (`recent`).
  - Section 2 — **Pin Folders**: Custom user pin folder manager section with expandable list, inline folder creation form, color picker circles (`#06b6d4`, `#10b981`, `#8b5cf6`, `#f59e0b`, `#ef4444`, `#3b82f6`), hover actions for inline renaming (pencil icon) and deletion (trash icon).
  - Section 3 — **Defect Categories**: 15 defect categories (`all`, `codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`, `pinned`, `recent`) with dedicated Lucide icons (`Monitor`, `Camera`, `Sliders`, `Battery`, `Smartphone`, `Lock`, `PenTool`, `Droplets`, `Volume2`, `Cpu`, `Settings`, `Code`, `Folder`, `Star`, `History`) and real-time item count badges.
  - **Code Sub-Chips (`CodeSubChips.tsx`)**: Mounted inside sidebar (`#subchips`), automatically visible when `codes` category is active. Displays 10 sub-code filter buttons (`ALL`, `FCPB`, `FCPW`, `FCPC`, `RCPB`, `RCPW`, `RCPC`, `FCDS`, `RCDS`, `PC`).
- **State Dependencies**:
  - `selectedCategory`, `setSelectedCategory`, `selectedSubCategory`, `setSelectedSubCategory`, `categoryCounts`, `folders`, `activeFolderId`, `setActiveFolderId`, `createFolder`, `deleteFolder`, `renameFolder`.
- **Current Styling**:
  - `bg-[#0c0e12] border-r border-white/[0.08]`. Active tabs use `bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-transparent text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]`.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - Gradient background glows (`from-cyan-500/15`) and cyan shadow glows must be replaced with clean Warm Stone surfaces (`#121214` dark / `#fcfcfc` light) and warm grey borders (`border-stone-800` / `border-stone-200`).
  - Category tabs must use soft muted left border indicators (`border-l-4`) and warm grey text states without neon halos.

### 2.3 Defect Cards, Container & View Modes (`src/components/DefectCard.tsx`, `WordingGrid.tsx`, `WordingList.tsx`, `WordingTable.tsx`, `WordingContainer.tsx`)
- **Existing Functionality**:
  - Main container (`#wordingContainer`, `#listwrap`, `data-testid="wording-container"`) rendering defect items in 3 layout modes:
    - **List View (`WordingList.tsx`)**: Full-width row cards (`row`) with `#n` defect number, search match highlighting (`<mark>`), category pill, and action bar.
    - **Grid View (`WordingGrid.tsx`)**: Multi-column cards (`gcard`) in 1, 2, or 3 column responsive grid.
    - **Table View (`WordingTable.tsx`)**: Ultra-compact rows (`trow`) for dense inspection workflows.
  - Card Action Bar (`.racts`):
    - **Star / Folder Pin Button** (`.pin-btn`): Toggles item pin state. When custom pin folders exist, triggers a `DropdownMenu` allowing multi-folder starring (`onTogglePinToFolder`, `isPinnedInFolder`).
    - **+ Batch Button** (`.add-batch-btn`): Adds defect text to batch queue.
    - **Edit / Del Buttons** (`.edit-item-btn`, `.del-item-btn`): Visible in Edit Mode (`editMode = true`).
  - Item Click Handler: Clicking anywhere on the card copies defect wording to clipboard (`onCopyItem`).
- **State Dependencies**:
  - `results` (`SearchResult[]`), `layoutMode`, `pinsSet`, `editMode`, `onCopyItem`, `onTogglePin`, `onAddToBatch`, `onOpenEdit`, `onDeleteItem`, `folders`, `onTogglePinToFolder`, `isPinnedInFolder`.
- **Current Styling**:
  - Cards use `bg-[#0c0e12] border-white/[0.08] hover:border-cyan-500/50 hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.25)]`.
  - Pinned cards use `bg-amber-500/[0.06] border-amber-500/40 shadow-[0_0_15px_rgba(245,159,0,0.15)]`.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - Glowing hover halos (`hover:shadow-[0_0_20px... cyan]`) and neon amber glow shadows must be removed.
  - Cards must be styled as Raycast crisp tactile surfaces (`#121214` dark / `#fcfcfc` light) with warm grey borders (`border-stone-800` / `border-stone-200`) and clean typography.

### 2.4 Category Pills & Muted Color Coding (`src/utils/categoryColors.ts` & `src/data/qcData.ts`)
- **Existing Functionality**:
  - `getCategoryColor(categoryKey)` maps categories to hex colors defined in `qcData.ts`.
  - `getCategoryBadgeStyle(categoryKey)` generates inline CSS object (`backgroundColor: rgba(rgb, 0.18)`, `borderColor: rgba(rgb, 0.45)`, `color: hexColor`).
  - `getCategoryLeftBorderStyle(categoryKey)` generates left border accent style (`borderLeftWidth: '4px'`, `borderLeftColor: color`).
  - `CATEGORY_ICON_MAP` maps all 15 category keys to dedicated Lucide icon components.
- **Current Color Definitions (`qcData.ts`)**:
  - `all`: `#8a8577`, `codes`: `#7048e8` (Purple), `screen`: `#1971c2` (Blue), `camera`: `#15aabf` (Cyan), `buttons`: `#f59f00` (Amber), `battery`: `#2f9e44` (Green), `backcover`: `#b08020` (Gold), `locks`: `#e03131` (Red), `pen`: `#c2255c` (Plum), `water`: `#0b7285` (Deep Teal), `audio`: `#0ca678` (Emerald), `body`: `#64748b` (Slate), `system`: `#e8590c` (Orange), `pinned`: `#e8930c`, `recent`: `#8a8577`.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - R2 explicitly requires **Purposeful Muted Color-Coding**:
    - Soft Green for Battery (`#34d399` / `#22c55e` muted)
    - Muted Amber for Buttons (`#fbbf24` / `#f59e0b` muted)
    - Steel Blue for Screen (`#60a5fa` / `#3b82f6` muted)
    - Muted Plum for Pen (`#c084fc` / `#a855f7` muted)
    - Rose for Locks (`#f43f5e` / `#e11d48` muted)
  - Color pill styles need refinement to fit soft muted Raycast aesthetics (subtle backgrounds, warm grey contrast borders).

### 2.5 Left Border Accent Indicators (`border-l-4`)
- **Existing Functionality**:
  - Rendered on defect cards (`DefectCard.tsx:43`), list rows, table rows, and active category sidebar tabs (`CategoryChips.tsx:129,269,346`).
- **Current Styling**:
  - Uses `border-l-4` with inline `borderLeftColor` derived from category hex colors.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - Ensure high visual contrast against Warm Stone background (`#121214` dark / `#fcfcfc` light) without relying on surrounding neon glow shadows.

### 2.6 Custom User Pin Folder Manager (`src/hooks/useQCState.ts` & `src/components/CategoryChips.tsx`)
- **Existing Functionality**:
  - Data structure: `CustomPinFolder` (`{ id, name, color, itemIds, createdAt }`).
  - Storage key: `qc-pin-folders` (with legacy auto-migration from `qc-pins` to default folder "Starred Defects" `#06b6d4`).
  - Operations in `useQCState`:
    - `createFolder(name, color)`
    - `deleteFolder(folderId)`
    - `renameFolder(folderId, newName)`
    - `togglePinToFolder(itemId, folderId)`
    - `isPinnedInFolder(itemId, folderId)`
    - `getItemFolderIds(itemId)`
  - UI in `CategoryChips.tsx`: Expandable "Pin Folders" accordion, inline creation form with color palette swatches, hover pencil/trash buttons, inline rename input.
  - UI in `DefectCard.tsx`: Pin star button triggers `DropdownMenu` with checkboxes for starring across multiple folders.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - Functionality is 100% complete. Needs visual styling adaptation to match the Raycast Warm Stone palette (`#121214` / `#fcfcfc`, stone borders).

### 2.7 ⌘K Spotlight Search Modal (`src/App.tsx` & `src/components/ui/command.tsx`)
- **Existing Functionality**:
  - Keyboard listener: `Cmd+K` / `Ctrl+K` opens `CommandDialog` modal (`spotlightOpen` state).
  - Modal contents: `CommandInput` search bar, `CommandList` displaying top 20 defect results with `#n` number badge, defect text `t`, and category badge `c`. Selecting item copies text to clipboard and closes modal. Keyboard hints footer (`↑↓ Navigate`, `↵ Copy & Close`, `ESC Exit`).
- **Current Styling**:
  - Uses cyan accent badges (`bg-cyan-500/10 text-cyan-400 border-cyan-500/20`), cyan item hover state (`data-[selected=true]:bg-cyan-500/10 text-cyan-200`).
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - Redesign Spotlight modal to Raycast Warm Stone aesthetic (`#121214` dark / `#fcfcfc` light surface, warm grey borders `border-stone-800` / `border-stone-200`, refined typography, muted accent badges).

### 2.8 View Switcher Toggles (`src/components/AppHeader.tsx` & `src/hooks/useAppearance.ts`)
- **Existing Functionality**:
  - View switcher container (`#setLayout`, `data-testid="view-switcher"`) rendering 3 view mode buttons: `list`, `grid`, `table`.
  - State managed via `useAppearance` hook (`layout` state), persisted in `qc-appearance` and `data-layout` attribute on `document.documentElement`.
- **Current Styling**:
  - Active button uses `bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]`.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - Remove cyan glow shadow. Implement Raycast tactile button toggle styling using Warm Stone palette.

### 2.9 Batch Drawer (`src/components/BatchDrawer.tsx`)
- **Existing Functionality**:
  - Slide-out drawer (`#batchDrawer`, `data-testid="batch-drawer"`) with backdrop overlay (`#backdrop`, `data-testid="drawer-overlay"`).
  - Delimiter dropdown (`#joinSel`, `data-testid="delimiter-select"`) supporting `nl` (\n), `comma` (, ), `semi` (; ), `space` ( ), `pipe` ( | ), `bullet` ( • ).
  - Auto-clear checkbox (`#autoclear`, `data-testid="autoclear-checkbox"`).
  - Queued item cards (`.bitem`, `data-testid="batch-item"`) with up/down reorder buttons (`data-act="moveup"`, `data-act="movedown"`), single copy button (`.bcopy-item`), remove item button (`.brm-item`, `data-testid="remove-batch-item-${idx}"`).
  - Action buttons: "Copy Batch" (`#bcopy`, `data-testid="copy-batch-btn"`), "Clear Queue" (`#bclear`, `data-testid="clear-batch-btn"`), "Bulk Paste" (`#bpaste`, opens `Dialog` for multi-line defect text import).
- **Current Styling**:
  - Drawer uses `bg-[#0c0e12]/90 backdrop-blur-2xl border-l border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)]`.
  - Overlay uses `bg-zinc-950/80 backdrop-blur-xl`.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - R3 explicitly requires: **solid subtle overlays (no heavy blurs)**.
  - Backdrop overlay must use solid subtle overlay without `backdrop-blur-xl`.
  - Drawer panel must use Raycast Warm Stone surface (`#121214` dark / `#fcfcfc` light) and warm grey borders without heavy glassmorphic blurs (`backdrop-blur-2xl`).

### 2.10 Sonner Toast Integration (`src/utils/notifications.ts` & `src/components/ToastsContainer.tsx`)
- **Existing Functionality**:
  - `notifications.ts` exports `showNotice`, `createToastNotice`, `showFloatingToast`, which trigger `sonner.toast()` with Lucide icons (`Copy`, `Pin`, `Plus`, `Trash2`, `ArrowBackUp`, `Pencil`, `Download`, `Upload`, `Refresh`, `AlertTriangle`).
  - `ToastsContainer.tsx` renders custom toast stack (`#toasts`) fixed at bottom-right (`bottom: 24px, right: 24px`) with automatic 4.2s progress bar (`.tprogress`).
- **Current Styling**:
  - Custom toast uses `background: rgba(12, 14, 18, 0.90)`, `backdrop-filter: blur(16px)`, `box-shadow: 0 10px 38px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.20)`.
- **Missing Requirements vs ORIGINAL_REQUEST.md**:
  - R3 explicitly requires **Minimalist floating Sonner toasts**.
  - Remove cyan glow shadows (`0 0 20px rgba(6,182,212,0.20)`) and heavy glassmorphic blur filters (`blur(16px)`).
  - Style toasts using clean Raycast Warm Stone palette (`#121214` dark / `#fcfcfc` light, `border-stone-800` / `border-stone-200`, crisp Lucide iconography).

---

## 3. State Management & Persistence Layer Architecture

The state architecture is encapsulated in two core custom hooks: `useQCState` and `useAppearance`. Together, they manage **14 localStorage keys** to maintain complete client-side data persistence.

### 3.1 `useQCState` Storage Key Mapping

| # | Storage Key | Data Type | Default / Fallback | Description |
|---|---|---|---|---|
| 1 | `qc-pin-folders` | `CustomPinFolder[]` | `[{ id: 'starred', name: 'Starred Defects', color: '#06b6d4', itemIds: [], createdAt: Date.now() }]` | Array of custom pin folders created by user. Auto-migrates legacy `qc-pins` on initial launch. |
| 2 | `qc-pins` | `(string \| number)[]` | `[]` | Flattened set of all pinned item IDs across all folders. Legacy key retained for backwards compatibility. |
| 3 | `qc-recents` | `string[]` | `[]` | Array of last 20 copied defect wording strings. |
| 4 | `qc-history` | `string[]` | `[]` | Fallback history log for recents compatibility. |
| 5 | `qc-batch` | `string[]` | `[]` | Queued defect wording strings in batch drawer. |
| 6 | `qc-join` | `DelimiterKey` | `'nl'` | Batch join delimiter (`'nl'`, `'comma'`, `'semi'`, `'space'`, `'pipe'`, `'bullet'`). |
| 7 | `qc-autoclear` | `boolean` | `true` | Auto-clear batch queue after copying (`"true"` / `"false"` string). |
| 8 | `qc-edits` | `Record<string, { t, c, n }>` | `{}` | Key-value store of edited base defect items (keyed by `item.id`). |
| 9 | `qc-dels` | `(string \| number)[]` | `[]` | Array of deleted base defect item IDs. |
| 10 | `qc-custom` | `QCItem[]` | `[]` | Array of user-created custom defect items (`{ id, n, t, c, custom: true }`). |

### 3.2 `useAppearance` Storage Key Mapping

| # | Storage Key | Data Type | Default / Fallback | Description |
|---|---|---|---|---|
| 11 | `qc-appearance` | `AppearanceSettings` | `{ layout: 'list', radius: 'soft', textsize: 'm', accent: 'indigo', density: 'cozy', motion: 'full', theme: 'dark' }` | Settings object for layout, radius, text size, density, motion, theme. |
| 12 | `qc-theme` | `'light' \| 'dark' \| 'auto'` | `'dark'` | Theme preference. Directly toggles `.dark` class and `data-theme` attribute on `document.documentElement`. |
| 13 | `qc-density` | `'cozy' \| 'compact'` | `'cozy'` | Layout density mode. Sets `data-density` attribute on `document.documentElement`. |
| 14 | `qc-sort` | `'default' \| 'alpha' \| 'num'` | `'default'` | Sort order preference for wording list. |

---

## 4. Interface Boundaries & DOM Contracts

To guarantee that unit, integration, and E2E test suites pass without regressions, all existing DOM IDs, CSS classes, and `data-testid` markers must be strictly preserved during the Raycast Warm Stone palette migration:

### Mandatory DOM Element Identifiers
1. **Header & Navigation**: `#appHeader`, `#sidebarNav`, `#setLayout`, `#search`, `#clearBtn`, `#spotlightBtn`, `#editBtn`, `#batchBtn`, `#setBtn`, `#dlBtn`, `#themeBtn`, `#nav`, `#chips`, `#subchips`.
2. **Main Container & Cards**: `#wordingContainer`, `#countLabel`, `#listwrap`, `#empty`, `.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn`.
3. **Batch Drawer & Overlay**: `#backdrop`, `#batchDrawer`, `#bclose`, `#joinSel`, `#autoclear`, `#blist`, `.bitem`, `.bup`, `.bdn`, `.bcopy-item`, `.brm-item`, `#bcopy`, `#bclear`, `#bpaste`, `#bcount`, `#bbcount`, `#bcopycount`.
4. **Toasts System**: `#toasts`, `.toasts-container`, `.toast`, `.ticon`, `.toast-message`, `.tact`, `.tprogress`.
5. **Mandatory `data-testid` Attributes**:
   - `data-testid="app-header"`
   - `data-testid="app-navbar"`
   - `data-testid="header-search-input"`
   - `data-testid="clear-search-btn"`
   - `data-testid="spotlight-trigger"`
   - `data-testid="view-switcher"`
   - `data-testid="wording-container"`
   - `data-testid="batch-drawer"`
   - `data-testid="drawer-overlay"`
   - `data-testid="delimiter-select"`
   - `data-testid="autoclear-checkbox"`
   - `data-testid="batch-item"`
   - `data-testid="copy-batch-btn"`
   - `data-testid="clear-batch-btn"`
   - `data-testid="category-tab-${id}"`
   - `data-testid="pin-folder-${id}"`
   - `data-testid="move-up-${idx}"`, `data-testid="move-down-${idx}"`, `data-testid="remove-batch-item-${idx}"`

---

## 5. Requirement Gap Matrix vs `ORIGINAL_REQUEST.md`

| Requirement ID | Specification | Current Implementation | Gap Status | Required Transformation |
|---|---|---|---|---|
| **R1.1** | No Heavy Glassmorphism | Uses `backdrop-blur-xl`, `backdrop-blur-2xl`, `backdrop-blur-md` across header, drawer, and toasts. | **NON-COMPLIANT** | Remove heavy backdrop blur stacks; replace with solid/subtle Raycast surfaces (`#121214` dark / `#fcfcfc` light). |
| **R1.2** | No Neon Halos or Cyan Gradients | Uses `shadow-[0_0_20px_rgba(6,182,212,0.25)]`, cyan selection halos, and cyan gradient button fills. | **NON-COMPLIANT** | Eliminate neon cyan glows, radial background halos, and gradient fills. |
| **R1.3** | Raycast Warm Stone Palette | Uses Deep Zinc / Dark Void palette (`#050608`, `#0c0e12`, `#18181b`). | **NON-COMPLIANT** | Update CSS variables and Tailwind classes to Raycast Warm Stone charcoal (`#121214` dark / `#fcfcfc` light) and warm stone borders (`border-stone-800` / `border-stone-200`). |
| **R2.1** | Purposeful Muted Color-Coding | Uses bright/vibrant category colors (`#7048e8`, `#1971c2`, `#15aabf`, `#f59f00`). | **NEEDS OVERHAUL** | Implement muted color palette: Soft Green (Battery), Muted Amber (Buttons), Steel Blue (Screen), Muted Plum (Pen), Rose (Locks). |
| **R2.2** | Muted Category Pills & Lucide Icons | Badges use high-contrast semi-transparent backgrounds with bright text. | **NEEDS REFINEMENT** | Soften category pill backgrounds and borders for a harmonious muted appearance with Lucide icons. |
| **R2.3** | Left Border Accent Indicators (`border-l-4`) | Present on cards and sidebar tabs, but paired with glowing shadows. | **NEEDS REFINEMENT** | Maintain `border-l-4` indicator with clean visual contrast against warm charcoal surfaces without neon glow shadows. |
| **R3.1** | Sticky Left Sidebar Navigation | Fully functional sticky sidebar with Quick Views, Pin Folders, and Defect Categories. | **STYLE GAP ONLY** | Retain 100% functionality; update colors/borders to Raycast Warm Stone palette. |
| **R3.2** | Clean Top Header & Search Bar | Fully functional header with search, Spotlight ⌘K trigger, view switcher, settings, theme toggle. | **STYLE GAP ONLY** | Retain 100% functionality and DOM IDs; update surface styles to solid Warm Stone. |
| **R3.3** | Solid Subtle Overlays & Batch Drawer | Slide-out drawer functions with overlay backdrop, but uses `backdrop-blur-xl`/`2xl`. | **NON-COMPLIANT** | Replace glassmorphic blurs with solid subtle overlays and clean Warm Stone drawer panel. |
| **R3.4** | Minimalist Floating Sonner Toasts | Toast system functions with Lucide icons, but uses `blur(16px)` and cyan glow shadows. | **STYLE GAP ONLY** | Remove glassmorphic blur and cyan glow; re-style toasts into minimalist Warm Stone floating pills. |
| **R4** | Performance & Build Integrity | Clean React 19 + Vite 6 + Tailwind setup; TypeScript type safe. | **COMPLIANT** | Maintain zero layout shift, instant search responsiveness, and 100% test pass rate. |
