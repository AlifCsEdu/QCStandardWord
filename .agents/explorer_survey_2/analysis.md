# Milestone R2 Architectural Analysis & Technical Specification
## Defect Cards, List Rows, Table View & Inline Copy Micro-Interactions

### 1. Executive Summary & Problem Scope
Milestone R2 focuses on the core defect wording presentation and micro-interaction layer in the QC Standard Wording application. While the application already provides Grid, List, and Table layout views, the current visual presentation lacks tactile responsiveness and instant localized micro-feedback:
1. **Lack of Instant Localized Feedback**: Clicking a defect card triggers a global floating toast and copies text to the clipboard, but the card itself offers no immediate inline visual confirmation or tactile pulse.
2. **Typography & Contrast Refinement**: The defect number (`#code` badge) and title text (`.rtxt`) can be elevated with sharper contrast, refined monospace capsules, and improved visual hierarchy between dark/light themes.
3. **Tactile Action Buttons**: The Star (★/☆) folder dropdown and `+ Batch` action buttons can feature smoother hover/active micro-states (`active:scale-95`, warm glow borders) to feel tactile and responsive.
4. **Test Suite Invariants**: The project has 203 automated tests across 58 test suites checking specific DOM class names (`.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `.pin-btn`, `.add-batch-btn`), data attributes (`data-id`, `data-act`), and style properties (`border-left`, `border-l-4`). Any visual enhancements must strictly preserve 100% test compatibility.

---

### 2. Component Mapping & Architecture

The presentation layer for defect items is concentrated in `src/components/DefectCard.tsx` and orchestrated by `src/components/WordingContainer.tsx`.

```
src/
├── components/
│   ├── DefectCard.tsx          # Core polymorphic card/row/trow component (Grid, List, Table)
│   ├── WordingContainer.tsx    # List wrapper, layout routing, empty state, and item counts
│   ├── WordingGrid.tsx         # Standalone Grid wrapper (maps to DefectCard variant="grid")
│   ├── WordingList.tsx         # Standalone List wrapper (maps to DefectCard variant="list")
│   ├── WordingTable.tsx        # Standalone Table wrapper (maps to DefectCard variant="table")
│   ├── ToastsContainer.tsx     # Floating toast notifications container
│   └── ui/
│       └── dropdown-menu.tsx   # Radix dropdown menu for multi-folder star pinning
├── hooks/
│   ├── useQCState.ts           # State layer: copySingleItem, addToBatch, togglePin, folders
│   └── useAppearance.ts        # Theme & appearance tokens
├── utils/
│   ├── categoryColors.ts       # Category badge elements (.rpill), border accents (.border-l-4)
│   ├── clipboard.ts            # Clipboard copy helper & navigator.vibrate wrapper
│   ├── notifications.ts        # Sonner toast dispatcher & toast icons
│   └── searchEngine.ts         # Highlighting & HTML escape helpers
└── index.css                   # Tailwind v4 theme variables, hover transitions & animations
```

#### Detailed Breakdown of `DefectCard.tsx`
`DefectCard` is a memoized React functional component (`React.memo` with `arePropsEqual`). It receives:
- `item: QCItem` (`id`, `n` (number), `t` (text), `c` (category), `custom?`)
- `variant: 'grid' | 'list' | 'table'`
- `isPinned: boolean`
- `isApprox?: boolean`
- `highlightedText?: string`
- `editMode: boolean`
- `onCopyItem: (text: string) => void`
- `onTogglePin: (id: string | number) => void`
- `onAddToBatch: (text: string) => void`
- `onOpenEdit: (item: QCItem) => void`
- `onDeleteItem: (item: QCItem) => void`
- `folders?: CustomPinFolder[]`
- `onTogglePinToFolder?: (itemId: string | number, folderId: string) => void`
- `isPinnedInFolder?: (itemId: string | number, folderId: string) => boolean`

---

### 3. Typography, Contrast & Badge Styling

#### Font Stacks & Theme Variables
- **Sans Font**: `'Geist', 'Inter', system-ui, sans-serif` (`--font-sans`)
- **Mono Font**: `'JetBrains Mono', ui-monospace, monospace` (`--font-mono`)
- **Backgrounds**: Dark theme `#121214` (surface), `#18181b` (cards); Light theme `#fcfcfc` (surface), `#ffffff` (cards).

#### Visual Hierarchy Refinements

| Element | Class Selector | Current Styling | Proposed Refinement |
| :--- | :--- | :--- | :--- |
| **Defect Number Badge** | `.rnum` | `font-mono text-xs font-bold text-stone-400` | Elegant capsule pill: `bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-700/80 text-stone-300 font-mono text-[11px] font-bold group-hover:text-stone-100 group-hover:border-stone-500 shadow-xs transition-all` |
| **Defect Title Text** | `.rtxt` | `font-sans text-sm font-semibold tracking-tight text-stone-100` | High-contrast typography: `font-sans text-sm font-semibold tracking-tight text-stone-100 group-hover:text-white leading-relaxed transition-colors` with gold-tinted mark highlights |
| **Category Pill** | `.rpill` | `text-[11px] font-semibold px-2.5 py-0.5 rounded-full border` | Muted semantic pill with crisp Lucide icon, subtle semitransparent background, `hover:scale-105 transition-transform` |
| **Approx Indicator** | `.fz` | `fz font-bold text-amber-400 mr-1.5` | Crisp amber `≈` symbol indicating fuzzy match or terminology alias expansion |
| **Left Border Accent** | `border-l-4` + `style` | Dynamic inline `borderLeftColor` & `borderLeftWidth: 4px` | Preserved inline `style={borderLeftStyle}` to guarantee 100% test compatibility for all 15 defect categories |

---

### 4. Copy Interaction & Inline 'Copied ✓' Micro-Interaction

#### Current Execution Flow
1. User clicks anywhere on `.gcard`, `.row`, or `.trow` container.
2. Container `onClick` handler calls `onCopyItem(item.t)`.
3. In `useQCState.ts`:
   - Calls `copyToClipboard(text)` (`navigator.clipboard.writeText(text)`).
   - Calls `pushRecent(text)` (persists to `qc-recents` & `qc-history` in `localStorage`).
   - Calls `triggerVibrate(20)` (mobile vibration).
   - Calls `addToast(...)` (spawns floating toast notification in Sonner / `ToastsContainer`).

#### Proposed Inline Micro-Interaction Design
Alongside the global floating toast, provide instant, localized card-level feedback:
1. **Local State**: In `DefectCard.tsx`, introduce:
   ```tsx
   const [copied, setCopied] = React.useState(false);
   const copiedTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

   const handleCopy = React.useCallback(() => {
     onCopyItem(item.t);
     if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
     setCopied(true);
     copiedTimeoutRef.current = setTimeout(() => {
       setCopied(false);
     }, 1200);
   }, [item.t, onCopyItem]);

   React.useEffect(() => {
     return () => {
       if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
     };
   }, []);
   ```

2. **Border Pulse & Ring Glow Transition**:
   When `copied === true`, the container dynamically gains:
   - `ring-2 ring-emerald-500/50 border-emerald-500/70 bg-emerald-950/20 scale-[1.008]`
   - Smooth CSS transitions (`transition-all duration-200 ease-out`).

3. **Inline 'Copied ✓' Badge**:
   Render an animated badge within the card/row header:
   ```tsx
   {copied && (
     <span
       data-testid="inline-copied-badge"
       className="inline-copied-badge inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-in fade-in zoom-in-95 duration-150 shadow-xs"
     >
       <Check className="size-3 stroke-[2.5]" />
       <span>Copied ✓</span>
     </span>
   )}
   ```
   *Note: All core DOM nodes (`.rnum`, `.rtxt`, `.rpill`, `.racts`) remain present and unreplaced in the DOM to ensure test queries never fail.*

---

### 5. Tactile Action Buttons Specification

Action buttons reside in `<div className="racts flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>`.

#### A. Pin / Star Button (`data-act="pin"`, `.pin-btn`)
- **Unpinned State**: `text-stone-400 hover:text-amber-300 bg-stone-800/80 border-stone-700/80 hover:bg-amber-500/10 hover:border-amber-400/50 active:scale-90 transition-all duration-150`
- **Pinned State**: `pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30 hover:border-amber-400 shadow-xs active:scale-90 transition-all duration-150`
- **Multi-Folder Mode**: Wrapped with Radix `DropdownMenu` with folder color pills and `✓` indicators for each folder containing the item.

#### B. `+ Batch` Button (`data-act="add"`, `.add-batch-btn`)
- Styling: `bg-stone-800/90 border border-stone-700/80 text-stone-200 hover:bg-stone-700 hover:border-stone-500 hover:text-stone-100 active:scale-95 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1 shadow-xs`
- Icon integration: Optional Lucide `Plus` icon (`size-3`) alongside `+ Batch` text.

#### C. Edit Mode Action Buttons (`Edit`, `Del`)
- **Edit Item Button (`.edit-item-btn`, `data-act="edit"`)**: `bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 active:scale-95 transition-all font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1`
- **Delete Item Button (`.del-item-btn`, `data-act="del"`)**: `bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 active:scale-95 transition-all font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1`

---

### 6. View Layouts: Grid vs List vs Table

#### Grid View (`variant === 'grid'`, `.gcard`)
- Layout: Card structure with `p-4 flex flex-col justify-between rounded-xl border min-h-[140px]`.
- Top Section: `#item.n` code pill, inline `Copied ✓` badge (when copied), and category badge `.rpill`.
- Center Section: Title text `.rtxt` with search term highlighting and approximate indicator `.fz`.
- Bottom Section: Subtle divider `border-t border-stone-800/80 pt-2.5` with `.racts` aligned to the right.

#### List View (`variant === 'list'`, `.row`)
- Layout: Single horizontal row with `p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3`.
- Left Section: `#item.n` code pill + title text `.rtxt`.
- Right Section: Inline `Copied ✓` badge (when copied), category badge `.rpill`, and `.racts` buttons.

#### Table View (`variant === 'table'`, `.trow`)
- Layout: Responsive grid/flex table row with `px-3.5 sm:px-4 py-2.5 text-sm sm:grid sm:grid-cols-12 items-center justify-between gap-2 border-l-4`.
- Column Structure (12 cols):
  - Col 1: `#item.n` code pill (`.rnum`, `sm:col-span-1`)
  - Col 7: Defect title (`.rtxt`, `sm:col-span-7`, truncate)
  - Col 2: Category badge (`.rpill`, `sm:col-span-2`)
  - Col 2: Inline `Copied ✓` / Action buttons (`.racts`, `sm:col-span-2`, `justify-end`)

---

### 7. Test Suite Invariants & Verification Plan

All 203 automated test suites rely on specific DOM contracts:
1. **DOM Class Names**:
   - Grid cards: `.gcard`
   - List rows: `.row`
   - Table rows: `.trow`
   - Defect code: `.rnum`
   - Defect title: `.rtxt`
   - Category badge: `.rpill`
   - Action buttons container: `.racts`
   - Pin button: `.pin-btn`
   - Add button: `.add-batch-btn`
2. **Data Attributes**:
   - `data-id={item.id}` on each card/row container
   - `data-act="pin"`, `data-act="add"`, `data-act="edit"`, `data-act="del"` on action buttons
   - `data-folder` attributes on folder elements
   - `data-layout="grid" | "list" | "table"` on wording container
3. **Style Properties**:
   - `border-l-4` class and inline `style.borderLeftColor`
   - Category color matching (e.g. Battery `#38a169`, Buttons `#d97706`, Screen `#4682b4`, Locks `#f43f5e`, Pen `#9d4edd`).
4. **Behavioral Invariants**:
   - Clicking card row triggers copy and toast.
   - Clicking `.pin-btn` toggles pin state and adds/removes `.pinned` class.
   - Clicking `.add-batch-btn` adds item to batch queue.
   - Clicking `.edit-item-btn` opens edit modal.
   - Clicking `.del-item-btn` deletes item and triggers undo toast.

---

### 8. Implementation Code Snippets (Ready for Implementer)

#### A. Updated `DefectCard.tsx` (Micro-Interactions & Tactile States)
```tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { QCItem, CustomPinFolder } from '../types/qc.ts';
import { getCategoryLeftBorderStyle, getCategoryBadgeElement } from '../utils/categoryColors.ts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu.tsx';
import { Folder, Check } from 'lucide-react';
import { escapeHtmlItem } from '../utils/searchEngine.ts';

export interface DefectCardProps {
  item: QCItem;
  variant: 'grid' | 'list' | 'table';
  isPinned: boolean;
  isApprox?: boolean;
  highlightedText?: string;
  editMode: boolean;
  onCopyItem: (text: string) => void;
  onTogglePin: (id: string | number) => void;
  onAddToBatch: (text: string) => void;
  onOpenEdit: (item: QCItem) => void;
  onDeleteItem: (item: QCItem) => void;
  folders?: CustomPinFolder[];
  onTogglePinToFolder?: (itemId: string | number, folderId: string) => void;
  isPinnedInFolder?: (itemId: string | number, folderId: string) => boolean;
}

function arePropsEqual(prevProps: Readonly<DefectCardProps>, nextProps: Readonly<DefectCardProps>): boolean {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.t === nextProps.item.t &&
    prevProps.item.c === nextProps.item.c &&
    prevProps.item.n === nextProps.item.n &&
    prevProps.isPinned === nextProps.isPinned &&
    prevProps.isApprox === nextProps.isApprox &&
    prevProps.editMode === nextProps.editMode &&
    prevProps.highlightedText === nextProps.highlightedText &&
    prevProps.variant === nextProps.variant &&
    prevProps.folders === nextProps.folders
  );
}

export const DefectCard: React.FC<DefectCardProps> = React.memo(({
  item,
  variant,
  isPinned,
  isApprox,
  highlightedText,
  editMode,
  onCopyItem,
  onTogglePin,
  onAddToBatch,
  onOpenEdit,
  onDeleteItem,
  folders,
  onTogglePinToFolder,
  isPinnedInFolder,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(() => {
    onCopyItem(item.t);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setCopied(true);
    copiedTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, 1200);
  }, [item.t, onCopyItem]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const containerClass = `${variant === 'grid' ? 'gcard' : variant === 'list' ? 'row' : 'trow'} ${
    isPinned
      ? 'pinned bg-amber-500/[0.07] border-amber-500/40 shadow-xs'
      : copied
      ? 'bg-emerald-950/20 border-emerald-500/70 ring-2 ring-emerald-500/40 shadow-md'
      : 'bg-stone-900 border-stone-800 hover:border-stone-700 hover:shadow-xs'
  } border-l-4 transition-all duration-150 ease-in-out cursor-pointer rounded-xl text-stone-100 group select-none`;

  const borderLeftStyle = getCategoryLeftBorderStyle(item.c);

  const renderActionButtons = (compact = false) => (
    <div className="racts flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {folders && folders.length > 1 && onTogglePinToFolder && isPinnedInFolder ? (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              data-act="pin"
              className={`pin-btn ${
                isPinned
                  ? 'pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30'
                  : 'text-stone-400 hover:text-amber-300 bg-stone-800/80 border-stone-700 hover:bg-amber-500/10 hover:border-amber-400/50'
              } px-2.5 py-1 rounded-md border text-xs flex items-center gap-1 active:scale-90 transition-all duration-150`}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(item.id);
              }}
              title={isPinned ? 'Unpin item / Select folder' : 'Pin item to folder'}
            >
              <span>{isPinned ? '★' : '☆'}</span>
            </button>
          </DropdownMenuTrigger>
          {dropdownOpen && (
            <DropdownMenuContent className="bg-stone-900 border-stone-800 text-stone-100 min-w-[160px] shadow-xl">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1 border-b border-stone-800">
                <Folder className="size-3 text-stone-400" />
                <span>Pin to Folders</span>
              </div>
              {folders.map((folder) => {
                const pinnedInThis = isPinnedInFolder(item.id, folder.id);
                return (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => {
                      onTogglePinToFolder(item.id, folder.id);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center justify-between text-xs cursor-pointer hover:bg-stone-800 focus:bg-stone-800"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: folder.color || '#a1a1aa' }} />
                      {folder.name}
                    </span>
                    {pinnedInThis && <span className="text-amber-400 font-bold text-xs">✓</span>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      ) : (
        <button
          data-act="pin"
          className={`pin-btn ${
            isPinned
              ? 'pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30'
              : 'text-stone-400 hover:text-amber-300 bg-stone-800/80 border-stone-700 hover:bg-amber-500/10 hover:border-amber-400/50'
          } px-2.5 py-1 rounded-md border text-xs active:scale-90 transition-all duration-150`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(item.id);
          }}
          title={isPinned ? 'Unpin item' : 'Pin item'}
        >
          {isPinned ? '★' : '☆'}
        </button>
      )}

      <button
        data-act="add"
        className="add-batch-btn bg-stone-800/90 border border-stone-700 text-stone-200 hover:bg-stone-700 hover:border-stone-500 hover:text-stone-100 active:scale-95 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1 shadow-xs"
        onClick={(e) => {
          e.stopPropagation();
          onAddToBatch(item.t);
        }}
        title="Add to batch queue"
      >
        + Batch
      </button>

      {editMode && (
        <>
          <button
            data-act="edit"
            className="edit-item-btn bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 active:scale-95 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onOpenEdit(item);
            }}
            title="Edit wording item"
          >
            Edit
          </button>
          <button
            data-act="del"
            className="del-item-btn bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 active:scale-95 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item);
            }}
            title="Delete wording item"
          >
            Del
          </button>
        </>
      )}
    </div>
  );

  const renderCopiedBadge = () => (
    <span
      data-testid="inline-copied-badge"
      className="inline-copied-badge inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-in fade-in zoom-in-95 duration-150 shadow-xs"
    >
      <Check className="size-3 stroke-[2.5]" />
      <span>Copied ✓</span>
    </span>
  );

  if (variant === 'grid') {
    return (
      <div
        data-id={item.id}
        className={`${containerClass} flex flex-col justify-between p-4 shadow-xs min-h-[140px]`}
        style={borderLeftStyle}
        onClick={handleCopy}
      >
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-2">
            <span className="rnum font-mono text-[11px] font-bold text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700/80 group-hover:text-stone-100 group-hover:border-stone-500 transition-all">
              #{item.n}
            </span>
            {copied && renderCopiedBadge()}
          </div>
          {getCategoryBadgeElement(item.c)}
        </div>

        <div className="rtxt font-sans text-sm font-semibold tracking-tight text-stone-100 group-hover:text-white mb-3 flex-1 leading-relaxed transition-colors">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>

        <div className="flex justify-end pt-2.5 border-t border-stone-800/80">
          {renderActionButtons(false)}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        data-id={item.id}
        className={`${containerClass} flex sm:grid sm:grid-cols-12 items-center justify-between px-3.5 sm:px-4 py-2.5 text-sm shadow-xs transition-colors duration-150 gap-2`}
        style={borderLeftStyle}
        onClick={handleCopy}
      >
        <div className="flex items-center gap-2 sm:col-span-1 shrink-0">
          <span className="rnum font-mono text-[11px] font-bold text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700/80 group-hover:text-stone-100 group-hover:border-stone-500 transition-all">
            #{item.n}
          </span>
        </div>
        <div className="rtxt font-sans text-xs sm:text-sm font-semibold tracking-tight text-stone-100 group-hover:text-white flex-1 sm:col-span-7 truncate pr-2 transition-colors">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2 shrink-0">
          {getCategoryBadgeElement(item.c)}
          {copied && renderCopiedBadge()}
        </div>
        <div className="sm:col-span-2 flex justify-end shrink-0">
          {renderActionButtons(true)}
        </div>
      </div>
    );
  }

  // Default: variant === 'list'
  return (
    <div
      data-id={item.id}
      className={`${containerClass} flex items-center justify-between p-3.5 sm:p-4 shadow-xs gap-3 transition-colors duration-150`}
      style={borderLeftStyle}
      onClick={handleCopy}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <span className="rnum font-mono text-[11px] font-bold text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700/80 group-hover:text-stone-100 group-hover:border-stone-500 transition-all shrink-0">
          #{item.n}
        </span>
        <div className="rtxt font-sans text-sm font-semibold tracking-tight text-stone-100 group-hover:text-white flex-1 leading-relaxed transition-colors">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {copied && renderCopiedBadge()}
        {getCategoryBadgeElement(item.c)}
        {renderActionButtons(false)}
      </div>
    </div>
  );
}, arePropsEqual);

export default DefectCard;
```
