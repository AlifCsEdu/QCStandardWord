# Refactoring Strategy: Hardcoded Light Inline Style Purge (Milestone M1)

## Executive Summary
This document provides a comprehensive, line-by-line refactoring strategy for purging legacy light-mode inline styles from `HistoryBar.tsx`, `EditToolbar.tsx`, and `CodeSubChips.tsx`. It establishes 2026 dark-theme Tailwind CSS v4 replacements aligned with the Deep Void Midnight (`#050608`) and Onyx (`#0c0e12`) visual palette while strictly preserving 100% of DOM IDs (`#histbar`, `#editstrip`, `#subchips`, `#hchips`, `#hclearAll`, `#addBtn`, `#exportBtn`, `#importBtn`, `#resetBtn`), data attributes (`data-hcopy`, `data-sub`), and key CSS class hooks.

---

## 1. Scope & Inventory of Legacy Light Inline Styles

### 1.1 `HistoryBar.tsx`
- **File Path**: `src/components/HistoryBar.tsx`
- **Current Inline Styles**:
  - **Line 16**: `style={{ display: 'none' }}` (empty history state container)
  - **Lines 24-31**: `style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px', background: '#fff9db', borderBottom: '1px solid #ffe066' }}`
    - Hardcoded yellow background (`#fff9db`) and yellow border (`#ffe066`).
  - **Line 33**: `style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59f00', whiteSpace: 'nowrap' }}`
    - Hardcoded orange/amber text (`#f59f00`).
  - **Lines 39-45**: `style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1, scrollbarWidth: 'thin' }}`
  - **Lines 54-65**: `style={{ padding: '3px 10px', borderRadius: '12px', border: '1px solid #fcc419', background: '#ffffff', color: '#343a40', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}`
    - Light white background (`#ffffff`), yellow border (`#fcc419`), dark slate text (`#343a40`).
  - **Lines 76-86**: `style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #fcc419', background: '#fff3bf', color: '#e67700', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}`
    - Light yellow background (`#fff3bf`), border (`#fcc419`), orange text (`#e67700`).

### 1.2 `EditToolbar.tsx`
- **File Path**: `src/components/EditToolbar.tsx`
- **Current Inline Styles**:
  - **Lines 60-67**: `style={{ display: editMode ? 'flex' : 'none', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#e7f5ff', borderBottom: '1px solid #a5d8ff' }}`
    - Light blue background (`#e7f5ff`) and light blue border (`#a5d8ff`).
  - **Line 69**: `style={{ display: 'flex', alignItems: 'center', gap: '8px' }}`
  - **Line 70**: `style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1971c2' }}`
    - Light blue text (`#1971c2`).
  - **Lines 76-85**: `style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #1971c2', background: '#1971c2', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}`
  - **Lines 95-104**: `style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #495057', background: '#ffffff', color: '#495057', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}`
  - **Lines 112-121**: `style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #495057', background: '#ffffff', color: '#495057', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}`
  - **Line 131**: `style={{ display: 'none' }}`
  - **Lines 138-148**: `style={{ padding: '6px 12px', borderRadius: '6px', border: armedReset ? '1px solid #e03131' : '1px solid #ced4da', background: armedReset ? '#e03131' : '#ffffff', color: armedReset ? '#ffffff' : '#c92a2a', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' }}`

### 1.3 `CodeSubChips.tsx`
- **File Path**: `src/components/CodeSubChips.tsx`
- **Current Inline Styles**:
  - **Lines 22-31**: `style={{ display: isVisible ? 'flex' : 'none', flexWrap: 'wrap', gap: '6px', padding: '10px 12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', margin: '8px 10px', border: '1px solid var(--border-contrast, #334155)' }}`
  - **Lines 41-52**: `style={{ padding: '4px 10px', borderRadius: '6px', border: isActive ? '1px solid #7048e8' : '1px solid var(--border-contrast, #334155)', background: isActive ? '#7048e8' : 'var(--container-charcoal, #1e293b)', color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)', fontWeight: isActive ? 600 : 500, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}`
    - Hardcoded violet (`#7048e8`) for active state.

---

## 2. 2026 Dark Theme Palette Alignment & Tailwind Replacement Rules

| Context / Element | Legacy Light Style | 2026 Dark Tailwind Class | Visual Description |
|---|---|---|---|
| History Bar Container | `#fff9db` bg, `#ffe066` border | `bg-amber-950/20 border-b border-amber-500/20 backdrop-blur-md` | Glassmorphic dark amber strip |
| History Title | `#f59f00` | `text-amber-400 font-bold text-xs` | Subtle warm amber indicator |
| History Chips | `#ffffff` bg, `#fcc419` border | `bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/80 hover:border-amber-500/50 rounded-full px-2.5 py-0.5 text-xs` | Slate chip with amber hover edge |
| History Clear Button | `#fff3bf` bg, `#e67700` text | `bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-2 py-0.5 text-xs font-semibold` | Low-saturation amber pill button |
| Edit Toolbar Container | `#e7f5ff` bg, `#a5d8ff` border | `bg-cyan-950/20 border-b border-cyan-500/20 backdrop-blur-md` | Glassmorphic dark cyan strip |
| Edit Controls Label | `#1971c2` | `text-cyan-400 font-bold text-sm` | Cool cyan section label |
| Add Wording Button | `#1971c2` bg & border | `bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-colors shadow-sm` | Primary cyan action button |
| Export/Import JSON | `#ffffff` bg, `#495057` text | `bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors` | Modern dark zinc buttons |
| Reset All Button (Normal) | `#ffffff` bg, `#c92a2a` text | `bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-md text-xs font-semibold transition-all` | Low-key red danger button |
| Reset All Button (Armed) | `#e03131` bg & border | `bg-red-600 hover:bg-red-500 text-white border border-red-500 px-3 py-1.5 rounded-md text-xs font-semibold animate-pulse` | Pulsing red confirm button |
| Code SubChips Container | `rgba(15, 23, 42, 0.4)` bg | `bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 mx-2.5 my-2` | Modern dark zinc panel |
| SubChip (Active) | `#7048e8` violet | `bg-cyan-600 text-white border border-cyan-400 font-semibold shadow-xs` | High-visibility cyan active chip |
| SubChip (Inactive) | `#1e293b` bg, `#94a3b8` text | `bg-zinc-800/80 text-zinc-400 border border-zinc-700/80 hover:bg-zinc-700/80 hover:text-zinc-200 font-medium` | Subtle zinc sub-code chip |

---

## 3. Detailed Component Refactoring Specifications

### 3.1 Refactored `HistoryBar.tsx`

```tsx
import React from 'react';

interface HistoryBarProps {
  recents: string[];
  onCopyRecent: (text: string) => void;
  onClearHistory: () => void;
}

export const HistoryBar: React.FC<HistoryBarProps> = ({
  recents,
  onCopyRecent,
  onClearHistory,
}) => {
  if (!recents || recents.length === 0) {
    return <div id="histbar" className="hidden" />;
  }

  return (
    <div
      id="histbar"
      className="history-bar-container flex items-center gap-3 px-5 py-2 bg-amber-950/20 border-b border-amber-500/20 backdrop-blur-md"
    >
      <span className="text-xs font-bold text-amber-400 whitespace-nowrap">
        History:
      </span>

      <div
        id="hchips"
        className="flex items-center gap-1.5 overflow-x-auto flex-1 scrollbar-thin"
      >
        {recents.map((text, idx) => (
          <button
            key={idx}
            data-hcopy={text}
            onClick={() => onCopyRecent(text)}
            className="hchip bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/80 hover:border-amber-500/50 rounded-full px-2.5 py-0.5 text-xs transition-colors duration-150 inline-flex items-center cursor-pointer whitespace-nowrap"
            title="Click to re-copy"
          >
            <span className="htxt">{text}</span>
          </button>
        ))}
      </div>

      <button
        id="hclearAll"
        onClick={onClearHistory}
        title="Clear copy history"
        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-2 py-0.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-150"
      >
        Clear History
      </button>
    </div>
  );
};
```

### 3.2 Refactored `EditToolbar.tsx`

```tsx
import React, { useRef, useState } from 'react';

interface EditToolbarProps {
  editMode: boolean;
  onOpenAddModal: () => void;
  onExport: () => void;
  onImport: (payload: any) => void;
  onReset: () => void;
}

export const EditToolbar: React.FC<EditToolbarProps> = ({
  editMode,
  onOpenAddModal,
  onExport,
  onImport,
  onReset,
}) => {
  const [armedReset, setArmedReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        onImport(parsed);
      } catch (err) {
        console.error('Failed to parse import file:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetClick = () => {
    if (!armedReset) {
      setArmedReset(true);
      setTimeout(() => {
        setArmedReset(false);
      }, 4000);
    } else {
      setArmedReset(false);
      onReset();
    }
  };

  return (
    <div
      id="editstrip"
      className={`editstrip-container ${editMode ? 'flex' : 'hidden'} items-center justify-between px-5 py-2.5 bg-cyan-950/20 border-b border-cyan-500/20 backdrop-blur-md ${editMode ? 'show' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-cyan-400">
          Edit Mode Controls:
        </span>
        <button
          id="addBtn"
          onClick={onOpenAddModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 px-3.5 py-1.5 rounded-md font-semibold text-xs cursor-pointer transition-colors shadow-sm"
        >
          + Add Wording
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="exportBtn"
          onClick={onExport}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
        >
          Export JSON
        </button>

        <button
          id="importBtn"
          onClick={handleImportButtonClick}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
        >
          Import JSON
        </button>
        <input
          type="file"
          id="importFile"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        <button
          id="resetBtn"
          onClick={handleResetClick}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-150 border ${
            armedReset
              ? 'arm bg-red-600 hover:bg-red-500 border-red-500 text-white animate-pulse'
              : 'bg-red-950/20 hover:bg-red-950/40 border-red-500/30 text-red-400'
          }`}
        >
          {armedReset ? 'Tap again to confirm' : 'Reset All'}
        </button>
      </div>
    </div>
  );
};
```

### 3.3 Refactored `CodeSubChips.tsx`

```tsx
import React from 'react';
import { CODE_SUBS } from '../data/qcData.ts';
import type { CategoryKey, SubCategoryCode } from '../types/qc.ts';

interface CodeSubChipsProps {
  selectedCategory: CategoryKey;
  selectedSubCategory: SubCategoryCode;
  onSelectSubCategory: (sub: SubCategoryCode) => void;
}

export const CodeSubChips: React.FC<CodeSubChipsProps> = ({
  selectedCategory,
  selectedSubCategory,
  onSelectSubCategory,
}) => {
  const isVisible = selectedCategory === 'codes';

  return (
    <div
      id="subchips"
      className={`subchips-container ${isVisible ? 'flex' : 'hidden'} flex-wrap gap-1.5 p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg mx-2.5 my-2 ${isVisible ? 'show' : ''}`}
    >
      {CODE_SUBS.map((sub) => {
        const isActive = selectedSubCategory === sub;
        return (
          <button
            key={sub}
            data-sub={sub}
            onClick={() => onSelectSubCategory(sub)}
            className={`subchip-btn px-2.5 py-1 rounded-md text-xs whitespace-nowrap cursor-pointer transition-all duration-150 border ${
              isActive
                ? 'active bg-cyan-600 text-white border-cyan-400 font-semibold shadow-xs'
                : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/80 hover:bg-zinc-700/80 hover:text-zinc-200 font-medium'
            }`}
          >
            {sub}
          </button>
        );
      })}
    </div>
  );
};
```

---

## 4. Preservation Matrix

| File | Preserved DOM ID | Preserved CSS Class Hooks | Preserved Custom Attributes | Functional Preservations |
|---|---|---|---|---|
| `HistoryBar.tsx` | `#histbar`, `#hchips`, `#hclearAll` | `.history-bar-container`, `.hchip`, `.htxt` | `data-hcopy={text}`, `title="Click to re-copy"`, `title="Clear copy history"` | Empty array returns `#histbar` with `hidden` class |
| `EditToolbar.tsx` | `#editstrip`, `#addBtn`, `#exportBtn`, `#importBtn`, `#importFile`, `#resetBtn` | `.editstrip-container`, `.show`, `.arm` | `accept=".json"` on file input | Armed state toggle (4s reset timer), file upload trigger |
| `CodeSubChips.tsx` | `#subchips` | `.subchips-container`, `.show`, `.subchip-btn`, `.active` | `data-sub={sub}` | `selectedCategory === 'codes'` visibility toggle |

---

## 5. Implementation & Verification Instructions
1. **Implementation Target**: Replace entire inline style blocks in `src/components/HistoryBar.tsx`, `src/components/EditToolbar.tsx`, and `src/components/CodeSubChips.tsx` with the clean Tailwind implementations specified in Section 3.
2. **Build Check**: Run `npm run build` to confirm zero TypeScript compilation errors and valid Vite build outputs in `dist/`.
3. **Test Suite Check**: Run `npm test` to verify 100% test pass rate across DOM selector assertions and behavior suites.
