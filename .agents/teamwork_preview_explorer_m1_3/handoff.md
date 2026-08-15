# Milestone 2/3 Technical Architecture & Implementation Blueprint
## Category & Sub-Category Manager and Dedicated History Drawer Architecture

**Agent**: Explorer 3 (Milestone 2/3)  
**Date**: 2026-08-16  
**Status**: Ready for Implementation  

---

## 1. Observation

Direct code review and codebase investigation across `src/` and `tests/` revealed the following structural details, baseline states, and architectural requirements:

### 1.1 Category Data Model & Navigation State
- **Current Category Types (`src/types/qc.ts:1-53`)**:
  - `CategoryKey` is currently a fixed union of 15 hardcoded strings (`'all' | 'codes' | 'screen' | 'camera' | 'buttons' | 'battery' | 'backcover' | 'locks' | 'pen' | 'water' | 'audio' | 'body' | 'system' | 'pinned' | 'recent'`).
  - `CategoryInfo` contains only `{ id: CategoryKey, name: string, color: string, desc: string }`.
  - `SubCategoryCode` is a fixed union (`'ALL' | 'FCPB' | 'FCPW' | 'FCPC' | 'RCPB' | 'RCPW' | 'RCPC' | 'FCDS' | 'RCDS' | 'PC'`).
- **Current Category Seed Data (`src/data/qcData.ts:145-236`)**:
  - `CATEGORIES` contains the 14 default categories + `recent`.
  - `CODE_SUBS` (`src/data/qcData.ts:238-249`) contains the 10 static panel/part codes.
- **Current Category State in `useQCState.ts` (`src/hooks/useQCState.ts:31-33`)**:
  - `selectedCategory` and `selectedSubCategory` are maintained, but categories themselves are static imports (`CATEGORIES` from `qcData.ts`), without local storage persistence or CRUD capabilities.
- **Current Category Styling (`src/utils/categoryColors.ts:24-145`)**:
  - `CATEGORY_COLOR_MAP` and `CATEGORY_ICON_MAP` statically map the hardcoded 15 category keys to hex colors and Lucide icons.
  - Tests in `tests/m2-empirical-stress-harness.test.ts` strictly require case-insensitivity and whitespace trimming on all lookup functions (`getCategoryColor`, `getCategoryBadgeStyle`, `getCategoryLeftBorderStyle`, `getCategoryIconComponent`).

### 1.2 History & Recents State
- **Current History State (`src/hooks/useQCState.ts:79-86, 341-356`)**:
  - Recents are stored only as a flat array of strings `recents: string[]` under `qc-recents` and `qc-history` (max 20 items).
  - No rich metadata (timestamps, category association, defect item number, or copy source) is preserved.
- **Current History UI (`src/components/HistoryBar.tsx:1-57`)**:
  - Renders a horizontal bar `#histbar` with chips `#hchips`, items `[data-hcopy]`, text `.htxt`, and button `#hclearAll`.
  - No slide-out sheet, no search/filter within history, no relative timestamps ("2m ago"), no one-click pin to custom folder, and no "Add all to batch queue".

### 1.3 UI Primitive & Layout Inventory
- **Radix UI Primitives (`src/components/ui/`)**:
  - `sheet.tsx` (`Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`) is available and configured for smooth sliding animations.
  - `dialog.tsx` (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`) is available for modals and confirmation alerts.
  - `dropdown-menu.tsx`, `select.tsx`, `toggle-group.tsx`, `scroll-area.tsx`, and `input.tsx` are available for rich interactive controls.
- **Test Integrity Constraints (`tests/harness.js`)**:
  - Existing tests across Tiers 1-5 verify 14 localStorage keys, DOM IDs (`#appHeader`, `#search`, `#chips`, `#subchips`, `#histbar`, `#hchips`, `#hclearAll`, `#editBtn`, `#batchBtn`, `#setBtn`, `#themeBtn`), and high-frequency event isolation. All existing test hooks must remain 100% operational.

---

## 2. Logic Chain

1. **Dynamic Category Store**:
   - To fulfill R3 and enable dynamic categories, `useQCState.ts` must maintain a `categories: CategoryInfo[]` state initialized from `qc-categories` (with fallback to `CATEGORIES` seed data) and `categoryOrder: string[]` from `qc-category-order`.
   - `CategoryInfo` must be extended to support `iconType: 'lucide' | 'emoji'`, `iconValue: string`, `subCodes?: string[]`, `order?: number`, and `isDefault?: boolean`.
   - `useQCState` must expose `addCategory`, `updateCategory`, `deleteCategory`, `reorderCategories`, `moveCategoryUp`, `moveCategoryDown`, `addSubCategoryCode`, and `removeSubCategoryCode`.
   - Deleting a category must safeguard system views (`all`, `pinned`, `recent`), and reset `selectedCategory` to `'all'` if the deleted category was active.

2. **Category Manager Modal / Drawer (`CategoryManagerModal.tsx`)**:
   - Built with Radix `Dialog` / `Sheet` and 44-48px touch targets for Samsung Galaxy Tab S9+ ergonomics.
   - Provides a hybrid icon picker: 24 curated Lucide icons (Monitor, Camera, Sliders, Radio, Battery, Smartphone, Lock, PenTool, Droplets, Volume2, Cpu, Settings, Activity, Code, Folder, Star, History, Sparkles, ShieldCheck, Layers, Tag, Wrench, Flame, Zap) OR custom emoji text input and quick emoji swatches (`📱`, `🔋`, `🔍`, `⚡`, `💧`, `🛠️`, `🔒`, `🏷️`, `🖥️`, `📷`, `✨`, `🎧`, `📦`, `⚙️`, `⚠️`, `🎯`).
   - Color picker: 8 preset palette swatches (`#78716c`, `#10b981`, `#f59e0b`, `#ef4444`, `#3b82f6`, `#8b5cf6`, `#ec4899`, `#06b6d4`) + custom hex color input with real-time preview and validation.
   - Sub-Category Code Editor: Allows adding custom sub-codes (e.g. `TOP`, `BOT`, `FCPB`) and removing codes for any category.
   - Position placement controls: Up/Down arrow buttons to adjust category sequence order with instant localStorage persistence.

3. **Dynamic Category Navigation & Styling**:
   - `categoryColors.ts` must dynamically resolve colors and icons from the dynamic categories list, falling back to default maps.
   - Whitespace trimming and case-insensitivity must be strictly preserved to satisfy performance and adversarial tests.
   - `CategoryChips.tsx` renders dynamic categories with custom left border accents, Lucide/Emoji icons, item count badges, and a "Manage Categories" button.
   - `CodeSubChips.tsx` dynamically renders subchips for whichever category defines `subCodes` (not just static `'codes'`).

4. **Dedicated Rich Inspection History Drawer (`HistoryDrawer.tsx`)**:
   - Radix `Sheet` slide-out drawer (`data-testid="history-drawer"`) accessible from top header and category navigation.
   - `HistoryEntry` data model stores `{ id, text, itemNumber, category, timestamp, source }` in `qc-history-entries` (keeping `qc-recents` and `qc-history` string arrays synchronized for backward compatibility).
   - Relative timestamps rendered via `timeUtils.ts` ("Just now", "2m ago", "1h ago", "Yesterday").
   - Instant search and category filter inside the drawer.
   - Action buttons on each item: 1-Click Copy with visual/tactile feedback ("Copied!"), Pin to Folder dropdown, and Add to Batch.
   - "Add all to batch queue" button queues all filtered/visible history entries.
   - "Clear History" button prompts a Radix confirmation dialog before purging history records.
   - Inline `#histbar` remains active for existing workflows and test backward compatibility.

---

## 3. Caveats

1. **14-Key Storage Schema & Backward Compatibility**:
   - `qc-recents` and `qc-history` must stay synchronized whenever a `HistoryEntry` is added or cleared so legacy test assertions continue to pass without error.
   - On boot, if `qc-history-entries` is missing but `qc-recents` has items, auto-migrate string records into `HistoryEntry` objects.
2. **Category Key Format & Case Insensitivity**:
   - Dynamic category IDs should be sanitized strings (e.g. `cat_172381293_ab3`). Built-in categories retain their IDs (`screen`, `battery`, `codes`, etc.).
   - All color, badge, and icon lookups must safely execute `(categoryKey || '').trim().toLowerCase()` to prevent crashes on undefined or padded strings.
3. **Touch Ergonomics**:
   - All buttons, icon picker swatches, sub-code tags, and history action buttons must maintain minimum 44px touch targets (or comfortable padding in cozy/tablet modes).
4. **Emoji Rendering**:
   - Custom emojis must be wrapped in `span` elements with proper line-height and font rendering so they align seamlessly with Lucide SVG icons.

---

## 4. Conclusion & Complete Implementation Blueprint

### 4.1 Type Definitions: `src/types/qc.ts`

```typescript
// Extended CategoryKey allowing dynamic category IDs
export type CategoryKey =
  | 'all'
  | 'codes'
  | 'screen'
  | 'camera'
  | 'buttons'
  | 'battery'
  | 'backcover'
  | 'locks'
  | 'pen'
  | 'water'
  | 'audio'
  | 'body'
  | 'system'
  | 'pinned'
  | 'recent'
  | (string & {});

export type SubCategoryCode = string;

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  desc: string;
  iconType?: 'lucide' | 'emoji';
  iconValue?: string;
  subCodes?: string[];
  order?: number;
  isDefault?: boolean;
}

export interface HistoryEntry {
  id: string;
  text: string;
  itemNumber?: number;
  category?: string;
  timestamp: number;
  source?: 'single' | 'batch';
}
```

---

### 4.2 Relative Time Utilities: `src/utils/timeUtils.ts`

```typescript
/**
 * Formats a millisecond timestamp into a human-friendly relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return 'Recently';
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1m ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 7200) return '1h ago';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  
  const days = Math.floor(diffSec / 86400);
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDateTime(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return '';
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
```

---

### 4.3 Dynamic Category Colors & Iconography: `src/utils/categoryColors.ts`

```typescript
import React from 'react';
import {
  Monitor,
  Camera,
  Sliders,
  Radio,
  Battery,
  Smartphone,
  Lock,
  PenTool,
  Droplets,
  Volume2,
  Cpu,
  Settings,
  Activity,
  Code,
  Folder,
  Star,
  History,
  Sparkles,
  ShieldCheck,
  Layers,
  Tag,
  Wrench,
  Flame,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES } from '../data/qcData.ts';
import type { CategoryInfo } from '../types/qc.ts';

// 24 Curated Lucide Icons for Category Picker
export const CURATED_CATEGORY_ICONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'Monitor', label: 'Screen/Monitor', icon: Monitor },
  { name: 'Camera', label: 'Camera', icon: Camera },
  { name: 'Sliders', label: 'Buttons/Controls', icon: Sliders },
  { name: 'Radio', label: 'Wireless/Radio', icon: Radio },
  { name: 'Battery', label: 'Battery', icon: Battery },
  { name: 'Smartphone', label: 'Device/Backcover', icon: Smartphone },
  { name: 'Lock', label: 'Locks/Security', icon: Lock },
  { name: 'PenTool', label: 'S-Pen/Stylus', icon: PenTool },
  { name: 'Droplets', label: 'Water/Liquid', icon: Droplets },
  { name: 'Volume2', label: 'Audio/Speaker', icon: Volume2 },
  { name: 'Cpu', label: 'Body/Mainboard', icon: Cpu },
  { name: 'Settings', label: 'System/Settings', icon: Settings },
  { name: 'Activity', label: 'Activity/Diagnostics', icon: Activity },
  { name: 'Code', label: 'Part Codes', icon: Code },
  { name: 'Folder', label: 'Folder/General', icon: Folder },
  { name: 'Star', label: 'Starred/Favorites', icon: Star },
  { name: 'History', label: 'Recent/History', icon: History },
  { name: 'Sparkles', label: 'Special/Cosmetic', icon: Sparkles },
  { name: 'ShieldCheck', label: 'Inspection/QC', icon: ShieldCheck },
  { name: 'Layers', label: 'Layers/Assembly', icon: Layers },
  { name: 'Tag', label: 'Labels/Tags', icon: Tag },
  { name: 'Wrench', label: 'Hardware/Tools', icon: Wrench },
  { name: 'Flame', label: 'Thermal/Heat', icon: Flame },
  { name: 'Zap', label: 'Power/Charging', icon: Zap },
];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  screen: Monitor,
  monitor: Monitor,
  camera: Camera,
  buttons: Sliders,
  radio: Radio,
  battery: Battery,
  backcover: Smartphone,
  locks: Lock,
  pen: PenTool,
  water: Droplets,
  audio: Volume2,
  body: Cpu,
  system: Settings,
  activity: Activity,
  codes: Code,
  folder: Folder,
  folders: Folder,
  all: Folder,
  pinned: Star,
  favorites: Star,
  recent: History,
  sparkles: Sparkles,
  shieldcheck: ShieldCheck,
  layers: Layers,
  tag: Tag,
  wrench: Wrench,
  flame: Flame,
  zap: Zap,
};

const DEFAULT_CATEGORY_COLOR_MAP: Record<string, string> = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id.trim().toLowerCase()] = cat.color;
  return acc;
}, {} as Record<string, string>);

export function getCategoryColor(categoryKey: string, customCategories?: CategoryInfo[]): string {
  const key = (categoryKey || '').trim().toLowerCase();
  if (customCategories && Array.isArray(customCategories)) {
    const found = customCategories.find((c) => (c.id || '').trim().toLowerCase() === key);
    if (found && found.color) return found.color;
  }
  return DEFAULT_CATEGORY_COLOR_MAP[key] || '#64748b';
}

function hexToRgb(hex: string): string {
  let c = (hex || '').replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '100, 116, 139';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function getCategoryBadgeStyle(categoryKey: string, customColor?: string): React.CSSProperties {
  const key = (categoryKey || '').trim().toLowerCase();
  const color = customColor || getCategoryColor(key);
  const rgb = hexToRgb(color);
  return {
    backgroundColor: `rgba(${rgb}, 0.18)`,
    borderColor: `rgba(${rgb}, 0.45)`,
    color: color,
  };
}

export function getCategoryLeftBorderStyle(categoryKey: string, customColor?: string): React.CSSProperties {
  const key = (categoryKey || '').trim().toLowerCase();
  const color = customColor || getCategoryColor(key);
  return {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: color,
  };
}

export function getCategoryIconComponent(categoryKey: string): LucideIcon {
  const key = (categoryKey || '').trim().toLowerCase();
  return CATEGORY_ICON_MAP[key] || Folder;
}

export function renderCategoryIcon(
  category: { iconType?: 'lucide' | 'emoji'; iconValue?: string; id?: string } | string,
  props: { className?: string; style?: React.CSSProperties } = {}
): React.ReactNode {
  const cls = props.className || 'size-4';
  if (typeof category === 'string') {
    const IconComp = getCategoryIconComponent(category);
    return React.createElement(IconComp, { className: cls, style: props.style });
  }

  if (category?.iconType === 'emoji' && category?.iconValue) {
    return React.createElement(
      'span',
      { className: `inline-flex items-center justify-center text-sm leading-none shrink-0 select-none ${cls}`, style: props.style },
      category.iconValue
    );
  }

  if (category?.iconType === 'lucide' && category?.iconValue) {
    const foundIcon = CURATED_CATEGORY_ICONS.find(
      (i) => i.name.toLowerCase() === category.iconValue?.toLowerCase()
    )?.icon;
    if (foundIcon) {
      return React.createElement(foundIcon, { className: cls, style: props.style });
    }
  }

  const IconComp = getCategoryIconComponent(category?.id || '');
  return React.createElement(IconComp, { className: cls, style: props.style });
}
```

---

### 4.4 Dynamic Category & History Store in `src/hooks/useQCState.ts`

```typescript
// --- Dynamic Categories State Initialization ---
const [categories, setCategories] = useState<CategoryInfo[]>(() => {
  const saved = safeJSONParse<CategoryInfo[]>('qc-categories', []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.filter((c) => c && typeof c === 'object' && c.name);
  }
  // Initialize from default CATEGORIES
  const initial = CATEGORIES.map((cat, idx) => ({
    ...cat,
    iconType: 'lucide' as const,
    iconValue: cat.id,
    subCodes: cat.id === 'codes' ? CODE_SUBS : [],
    order: idx,
    isDefault: true,
  }));
  safeStorageSet('qc-categories', initial);
  return initial;
});

const [categoryOrder, setCategoryOrder] = useState<string[]>(() => {
  const saved = safeJSONParse<string[]>('qc-category-order', []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  const initialOrder = CATEGORIES.map((c) => c.id);
  safeStorageSet('qc-category-order', initialOrder);
  return initialOrder;
});

// --- Dynamic History Entries State Initialization ---
const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => {
  const saved = safeJSONParse<HistoryEntry[]>('qc-history-entries', []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.filter((h) => h && typeof h === 'object' && h.text);
  }
  // Migrate legacy recents
  const legacyRecents = safeJSONParse<string[]>('qc-recents', []);
  if (Array.isArray(legacyRecents) && legacyRecents.length > 0) {
    const migrated: HistoryEntry[] = legacyRecents.map((text, idx) => ({
      id: 'h_migrated_' + (Date.now() - idx * 60000),
      text: String(text),
      timestamp: Date.now() - idx * 60000,
      source: 'single',
    }));
    safeStorageSet('qc-history-entries', migrated);
    return migrated;
  }
  return [];
});

const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

// --- Category Store CRUD Methods ---
const addCategory = useCallback((categoryData: Omit<CategoryInfo, 'id'> & { id?: string }): string => {
  const newId = categoryData.id?.trim() || 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const newCategory: CategoryInfo = {
    ...categoryData,
    id: newId,
    name: categoryData.name.trim() || 'New Category',
    color: categoryData.color || '#78716c',
    desc: categoryData.desc?.trim() || '',
    iconType: categoryData.iconType || 'lucide',
    iconValue: categoryData.iconValue || 'Folder',
    subCodes: categoryData.subCodes || [],
    isDefault: false,
    order: categories.length,
  };

  setCategories((prev) => {
    const next = [...prev, newCategory];
    safeStorageSet('qc-categories', next);
    return next;
  });

  setCategoryOrder((prev) => {
    const next = [...prev, newId];
    safeStorageSet('qc-category-order', next);
    return next;
  });

  addToast(`Created category "${newCategory.name}"`);
  return newId;
}, [categories.length, addToast]);

const updateCategory = useCallback((id: string, updates: Partial<CategoryInfo>) => {
  setCategories((prev) => {
    const next = prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat));
    safeStorageSet('qc-categories', next);
    return next;
  });
  addToast('Category updated successfully');
}, [addToast]);

const deleteCategory = useCallback((id: string) => {
  // Prevent deleting system views
  if (id === 'all' || id === 'pinned' || id === 'recent') {
    addToast('System categories cannot be deleted', true);
    return;
  }

  setCategories((prev) => {
    const deletedCat = prev.find((c) => c.id === id);
    const next = prev.filter((c) => c.id !== id);
    safeStorageSet('qc-categories', next);

    addToast(`Deleted category "${deletedCat?.name || id}"`, true, {
      label: 'Undo',
      fn: () => {
        if (deletedCat) {
          setCategories((cur) => {
            const restored = [...cur, deletedCat];
            safeStorageSet('qc-categories', restored);
            return restored;
          });
          setCategoryOrder((cur) => {
            const restored = [...cur, deletedCat.id];
            safeStorageSet('qc-category-order', restored);
            return restored;
          });
          addToast('Restored category');
        }
      },
    });
    return next;
  });

  setCategoryOrder((prev) => {
    const next = prev.filter((catId) => catId !== id);
    safeStorageSet('qc-category-order', next);
    return next;
  });

  setSelectedCategory((cur) => (cur === id ? 'all' : cur));
}, [addToast]);

const moveCategoryUp = useCallback((id: string) => {
  setCategoryOrder((prev) => {
    const idx = prev.indexOf(id);
    if (idx <= 0) return prev;
    const next = [...prev];
    const temp = next[idx];
    next[idx] = next[idx - 1];
    next[idx - 1] = temp;
    safeStorageSet('qc-category-order', next);
    return next;
  });
}, []);

const moveCategoryDown = useCallback((id: string) => {
  setCategoryOrder((prev) => {
    const idx = prev.indexOf(id);
    if (idx < 0 || idx >= prev.length - 1) return prev;
    const next = [...prev];
    const temp = next[idx];
    next[idx] = next[idx + 1];
    next[idx + 1] = temp;
    safeStorageSet('qc-category-order', next);
    return next;
  });
}, []);

const addSubCategoryCode = useCallback((categoryId: string, code: string) => {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return;
  setCategories((prev) => {
    const next = prev.map((cat) => {
      if (cat.id !== categoryId) return cat;
      const currentSubs = cat.subCodes || [];
      if (currentSubs.includes(cleanCode)) return cat;
      return { ...cat, subCodes: [...currentSubs, cleanCode] };
    });
    safeStorageSet('qc-categories', next);
    return next;
  });
  addToast(`Added sub-code "${cleanCode}"`);
}, [addToast]);

const removeSubCategoryCode = useCallback((categoryId: string, code: string) => {
  setCategories((prev) => {
    const next = prev.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return { ...cat, subCodes: (cat.subCodes || []).filter((s) => s !== code) };
    });
    safeStorageSet('qc-categories', next);
    return next;
  });
  setSelectedSubCategory((cur) => (cur === code ? 'ALL' : cur));
}, []);

// --- History Store CRUD Methods ---
const pushHistoryEntry = useCallback((text: string, meta?: { itemNumber?: number; category?: string; source?: 'single' | 'batch' }) => {
  if (!text.trim()) return;
  const newEntry: HistoryEntry = {
    id: 'h_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    text: text.trim(),
    itemNumber: meta?.itemNumber,
    category: meta?.category,
    timestamp: Date.now(),
    source: meta?.source || 'single',
  };

  setHistoryEntries((prev) => {
    const filtered = prev.filter((h) => h.text !== newEntry.text);
    const next = [newEntry, ...filtered].slice(0, 100);
    safeStorageSet('qc-history-entries', next);
    return next;
  });

  // Sync with legacy recents arrays
  setRecents((prev) => {
    const filtered = prev.filter((r) => r !== text.trim());
    const next = [text.trim(), ...filtered].slice(0, 20);
    safeStorageSet('qc-recents', next);
    safeStorageSet('qc-history', next);
    return next;
  });
}, []);

const clearHistoryEntries = useCallback(() => {
  setHistoryEntries([]);
  setRecents([]);
  safeStorageSet('qc-history-entries', []);
  safeStorageSet('qc-recents', []);
  safeStorageSet('qc-history', []);
  addToast('Cleared inspection history');
}, [addToast]);

const addAllHistoryToBatch = useCallback((entriesToAdd?: HistoryEntry[]) => {
  const target = entriesToAdd || historyEntries;
  if (target.length === 0) return;
  const texts = target.map((e) => e.text);
  setBatchQueue((prev) => {
    const next = [...prev, ...texts];
    safeStorageSet('qc-batch', next);
    return next;
  });
  addToast(`Added ${texts.length} history items to batch queue`);
}, [historyEntries, addToast]);
```

---

### 4.5 Category Manager Modal: `src/components/CategoryManagerModal.tsx`

```tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Check,
  X,
  Sliders,
  FolderPlus,
  Palette,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { CategoryInfo } from '../types/qc.ts';
import {
  CURATED_CATEGORY_ICONS,
  renderCategoryIcon,
  getCategoryBadgeStyle,
} from '../utils/categoryColors.ts';

const PRESET_COLORS = [
  '#78716c', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
];

const PRESET_EMOJIS = [
  '📱', '🔋', '🔍', '⚡', '💧', '🛠️',
  '🔒', '🏷️', '🖥️', '📷', '✨', '🎧',
  '📦', '⚙️', '⚠️', '🎯',
];

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  categoryOrder: string[];
  onAddCategory: (category: Omit<CategoryInfo, 'id'> & { id?: string }) => string;
  onUpdateCategory: (id: string, updates: Partial<CategoryInfo>) => void;
  onDeleteCategory: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onAddSubCode: (categoryId: string, code: string) => void;
  onRemoveSubCode: (categoryId: string, code: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  categoryOrder,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onMoveUp,
  onMoveDown,
  onAddSubCode,
  onRemoveSubCode,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [iconType, setIconType] = useState<'lucide' | 'emoji'>('lucide');
  const [iconValue, setIconValue] = useState('Tag');
  const [newSubCode, setNewSubCode] = useState('');

  // Sorted categories
  const sortedCategories = React.useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]));
    const result: CategoryInfo[] = [];
    for (const id of categoryOrder) {
      const cat = map.get(id);
      if (cat) result.push(cat);
    }
    for (const cat of categories) {
      if (!categoryOrder.includes(cat.id)) result.push(cat);
    }
    return result.filter((c) => c.id !== 'all' && c.id !== 'pinned' && c.id !== 'recent');
  }, [categories, categoryOrder]);

  const activeEditCategory = React.useMemo(() => {
    return categories.find((c) => c.id === editingCatId) || null;
  }, [categories, editingCatId]);

  const handleStartEdit = (cat: CategoryInfo) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setDesc(cat.desc || '');
    setColor(cat.color || '#3b82f6');
    setIconType(cat.iconType || 'lucide');
    setIconValue(cat.iconValue || 'Tag');
  };

  const handleStartCreate = () => {
    setEditingCatId('__new__');
    setName('');
    setDesc('');
    setColor('#3b82f6');
    setIconType('lucide');
    setIconValue('Tag');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCatId === '__new__') {
      onAddCategory({
        name: name.trim(),
        desc: desc.trim(),
        color,
        iconType,
        iconValue,
        subCodes: [],
      });
    } else if (editingCatId) {
      onUpdateCategory(editingCatId, {
        name: name.trim(),
        desc: desc.trim(),
        color,
        iconType,
        iconValue,
      });
    }
    setEditingCatId(null);
  };

  const handleAddSubCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode.trim() || !editingCatId || editingCatId === '__new__') return;
    onAddSubCode(editingCatId, newSubCode.trim().toUpperCase());
    setNewSubCode('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="category-manager-modal"
        className="max-w-3xl bg-stone-900 border-stone-800 text-stone-100 p-6 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2.5">
            <Sliders className="size-5 text-stone-300" />
            <span>Category & Sub-Category Manager</span>
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-sm">
            Customize defect categories, hybrid icons (Lucide or Emoji), color accents, order, and sub-category codes.
          </DialogDescription>
        </DialogHeader>

        {editingCatId ? (
          /* Category Edit / Create Form */
          <form onSubmit={handleSave} className="space-y-5 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-sm font-semibold text-stone-200">
                {editingCatId === '__new__' ? 'Create New Category' : `Edit Category: ${activeEditCategory?.name}`}
              </h3>
              {/* Live Preview Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Live Preview:</span>
                <span
                  className="rpill text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5"
                  style={getCategoryBadgeStyle('', color)}
                >
                  {renderCategoryIcon({ iconType, iconValue, id: editingCatId })}
                  <span>{name || 'Preview Name'}</span>
                </span>
              </div>
            </div>

            {/* Inputs: Name & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Category Name *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Display Panel, Thermal Issues"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 text-sm bg-stone-950 border-stone-800 text-stone-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Description</label>
                <Input
                  type="text"
                  placeholder="Short description of defect types"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="h-10 text-sm bg-stone-950 border-stone-800 text-stone-100"
                />
              </div>
            </div>

            {/* Hybrid Icon Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-300">Category Iconography</label>
                <div className="flex bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setIconType('lucide')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      iconType === 'lucide' ? 'bg-stone-800 text-stone-100 font-semibold' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Lucide Icons (24)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconType('emoji')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      iconType === 'emoji' ? 'bg-stone-800 text-stone-100 font-semibold' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Custom Emoji
                  </button>
                </div>
              </div>

              {iconType === 'lucide' ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-stone-950 rounded-lg border border-stone-800 max-h-40 overflow-y-auto">
                  {CURATED_CATEGORY_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = iconValue === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIconValue(item.name)}
                        title={item.label}
                        className={`min-h-[44px] flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-stone-800 border-stone-400 text-stone-100 ring-2 ring-stone-400'
                            : 'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                        }`}
                      >
                        <IconComp className="size-5" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIconValue(emoji)}
                        className={`size-10 text-lg flex items-center justify-center rounded-lg border transition-transform cursor-pointer ${
                          iconValue === emoji
                            ? 'bg-stone-800 border-stone-400 scale-110 ring-2 ring-stone-400'
                            : 'bg-stone-900 border-stone-800 hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Custom Emoji:</span>
                    <Input
                      type="text"
                      maxLength={4}
                      value={iconValue}
                      onChange={(e) => setIconValue(e.target.value)}
                      placeholder="e.g. 🛠️"
                      className="w-24 h-9 bg-stone-900 border-stone-800 text-center text-base"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color Accent Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300">Accent Color</label>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`size-8 rounded-full border border-stone-700 transition-transform cursor-pointer ${
                      color === hex ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                    }`}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-stone-400 font-mono">Hex:</span>
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="w-28 h-9 font-mono text-xs bg-stone-950 border-stone-800 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Category Codes Section (for existing categories) */}
            {editingCatId !== '__new__' && activeEditCategory && (
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <label className="text-xs font-semibold text-stone-300">Sub-Category Codes</label>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-stone-950 rounded-lg border border-stone-800">
                  {(!activeEditCategory.subCodes || activeEditCategory.subCodes.length === 0) ? (
                    <span className="text-xs text-stone-500 italic">No sub-category codes defined.</span>
                  ) : (
                    activeEditCategory.subCodes.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 text-stone-200 text-xs font-mono border border-stone-700"
                      >
                        <span>{code}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveSubCode(activeEditCategory.id, code)}
                          className="hover:text-rose-400 cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    type="text"
                    placeholder="Add sub-code (e.g. FCPB, TOP)..."
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="h-9 text-xs bg-stone-950 border-stone-800 font-mono"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSubCodeSubmit}
                    disabled={!newSubCode.trim()}
                    className="h-9 px-3 text-xs bg-stone-800 hover:bg-stone-700 text-stone-100"
                  >
                    Add Code
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingCatId(null)}
                className="h-10 px-4 text-xs text-stone-400 hover:text-stone-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 px-5 text-xs font-semibold bg-stone-100 hover:bg-white text-stone-900"
              >
                Save Category
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Categories List & Management View */
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Defect Categories ({sortedCategories.length})
              </span>
              <Button
                onClick={handleStartCreate}
                size="sm"
                className="h-9 px-3 text-xs font-semibold bg-stone-100 hover:bg-white text-stone-900 flex items-center gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Add Category</span>
              </Button>
            </div>

            <div className="divide-y divide-stone-800/80 border border-stone-800 rounded-lg overflow-hidden bg-stone-950/60">
              {sortedCategories.map((cat, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === sortedCategories.length - 1;

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3.5 py-3 hover:bg-stone-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="flex items-center gap-2">
                        {renderCategoryIcon(cat, { className: 'size-4 text-stone-300' })}
                        <span className="font-semibold text-sm text-stone-200 truncate">{cat.name}</span>
                        {cat.isDefault && (
                          <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded font-mono">
                            Default
                          </span>
                        )}
                        {cat.subCodes && cat.subCodes.length > 0 && (
                          <span className="text-[10px] bg-stone-800/90 text-stone-300 px-1.5 py-0.5 rounded font-mono border border-stone-700/60">
                            {cat.subCodes.length} codes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => onMoveUp(cat.id)}
                        className="p-1.5 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => onMoveDown(cat.id)}
                        className="p-1.5 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-800 cursor-pointer ml-1"
                        title="Edit Category"
                      >
                        <Pencil className="size-3.5" />
                      </button>

                      {/* Delete Button (if not default/system) */}
                      {!cat.isDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}"?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800 cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

---

### 4.6 Dedicated Inspection History Drawer: `src/components/HistoryDrawer.tsx`

```tsx
import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './ui/sheet.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.tsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import {
  History,
  Copy,
  Check,
  Trash2,
  Layers,
  Search,
  X,
  Star,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { CustomPinFolder, HistoryEntry } from '../types/qc.ts';
import { formatRelativeTime, formatFullDateTime } from '../utils/timeUtils.ts';
import { getCategoryBadgeStyle, getCategoryLeftBorderStyle } from '../utils/categoryColors.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyEntries: HistoryEntry[];
  onCopyEntry: (text: string) => void;
  onClearHistory: () => void;
  onAddToBatch: (text: string) => void;
  onAddAllToBatch: (entries: HistoryEntry[]) => void;
  folders: CustomPinFolder[];
  onPinToFolder: (text: string, folderId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyEntries,
  onCopyEntry,
  onClearHistory,
  onAddToBatch,
  onAddAllToBatch,
  folders,
  onPinToFolder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter history entries by instant search
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return historyEntries;
    return historyEntries.filter(
      (e) =>
        e.text.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q))
    );
  }, [historyEntries, searchQuery]);

  const handleCopy = (entry: HistoryEntry) => {
    onCopyEntry(entry.text);
    setCopiedId(entry.id);
    setTimeout(() => {
      setCopiedId((cur) => (cur === entry.id ? null : cur));
    }, 1200);
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setConfirmClearOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          data-testid="history-drawer"
          className="w-full sm:max-w-lg md:max-w-xl bg-stone-900 border-stone-800 text-stone-100 p-0 flex flex-col h-full"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-800 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="size-5 text-stone-300" />
                <SheetTitle className="text-base sm:text-lg font-bold text-stone-100">
                  Inspection History
                </SheetTitle>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  {historyEntries.length}
                </span>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2 pr-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filteredEntries.length === 0}
                  onClick={() => onAddAllToBatch(filteredEntries)}
                  className="h-8 px-2.5 text-xs bg-stone-950 border-stone-800 text-stone-200 hover:bg-stone-800 gap-1.5"
                  title="Add all shown history to batch queue"
                >
                  <Layers className="size-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Add All to Batch</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={historyEntries.length === 0}
                  onClick={() => setConfirmClearOpen(true)}
                  className="h-8 px-2 text-xs bg-stone-950 border-stone-800 text-stone-400 hover:text-rose-400 hover:bg-stone-800"
                  title="Clear history"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search history records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 pr-8 text-xs bg-stone-950 border-stone-800 text-stone-100 placeholder:text-stone-500 rounded-lg"
              />
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Drawer Body: History Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y-0 scrollbar-thin">
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-500 space-y-2">
                <Clock className="size-8 stroke-1" />
                <span className="text-sm font-medium">
                  {searchQuery ? 'No matching history entries found.' : 'No copy history yet.'}
                </span>
                <span className="text-xs text-stone-600">
                  Wordings copied from defect cards or batch queue will appear here.
                </span>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const isCopied = copiedId === entry.id;
                const leftBorderStyle = entry.category ? getCategoryLeftBorderStyle(entry.category) : undefined;

                return (
                  <div
                    key={entry.id}
                    className="p-3 bg-stone-950/70 hover:bg-stone-950 rounded-lg border border-stone-800/90 transition-all space-y-2"
                    style={leftBorderStyle}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs sm:text-sm font-medium text-stone-200 leading-snug flex-1">
                        {entry.text}
                      </div>

                      {/* 1-Click Copy Action */}
                      <Button
                        size="sm"
                        variant={isCopied ? 'default' : 'outline'}
                        onClick={() => handleCopy(entry)}
                        className={`h-8 px-2.5 text-xs font-semibold transition-all shrink-0 ${
                          isCopied
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="size-3.5 mr-1 text-white" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 mr-1" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Metadata & Quick Actions Strip */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-900 text-[11px] text-stone-400">
                      <div className="flex items-center gap-2">
                        {entry.category && (
                          <span
                            className="rpill uppercase text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                            style={getCategoryBadgeStyle(entry.category)}
                          >
                            {entry.category}
                          </span>
                        )}
                        <span title={formatFullDateTime(entry.timestamp)} className="flex items-center gap-1 font-mono">
                          <Clock className="size-3 text-stone-500" />
                          <span>{formatRelativeTime(entry.timestamp)}</span>
                        </span>
                        {entry.source === 'batch' && (
                          <span className="text-[10px] bg-stone-800/80 text-stone-400 px-1.5 py-0.2 rounded font-mono">
                            Batch
                          </span>
                        )}
                      </div>

                      {/* Secondary Actions: Add to Batch & Pin to Folder */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onAddToBatch(entry.text)}
                          className="p-1 rounded text-stone-400 hover:text-emerald-400 hover:bg-stone-800 transition-colors"
                          title="Add to Batch Queue"
                        >
                          <Layers className="size-3.5" />
                        </button>

                        {folders.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="p-1 rounded text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
                                title="Pin to Folder"
                              >
                                <Star className="size-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-stone-900 border-stone-800 text-stone-200">
                              {folders.map((f) => (
                                <DropdownMenuItem
                                  key={f.id}
                                  onClick={() => onPinToFolder(entry.text, f.id)}
                                  className="text-xs cursor-pointer flex items-center gap-2 hover:bg-stone-800"
                                >
                                  <span className="size-2 rounded-xs" style={{ backgroundColor: f.color }} />
                                  <span>{f.name}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Radix Confirmation Dialog for Clear History */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="max-w-md bg-stone-900 border-stone-800 text-stone-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-400">
              <Trash2 className="size-5" />
              <span>Clear Inspection History?</span>
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-sm">
              This will permanently remove all {historyEntries.length} inspection history records from local storage. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setConfirmClearOpen(false)}
              className="h-9 px-4 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmClear}
              className="h-9 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
            >
              Clear All History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
```

---

### 4.7 Category Navigation Updates: `src/components/CategoryChips.tsx`

```tsx
// Inside Defect Categories Section of CategoryChips:
<div className="pt-2 border-t border-stone-800 space-y-1">
  <div className="flex items-center justify-between px-2 py-1">
    <button
      onClick={() => setCategoriesOpen((prev) => !prev)}
      className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider hover:text-stone-200 transition-colors cursor-pointer"
    >
      <span>Defect Categories</span>
      <span className="text-[10px] text-stone-500 font-mono">({categories.length})</span>
      {categoriesOpen ? <ChevronDown className="size-3.5 text-stone-400" /> : <ChevronRight className="size-3.5 text-stone-400" />}
    </button>

    <button
      onClick={onOpenCategoryManager}
      data-testid="open-category-manager-btn"
      className="p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
      title="Manage Categories"
    >
      <Sliders className="size-3.5" />
    </button>
  </div>

  {categoriesOpen && (
    <div className="space-y-0.5 pt-0.5">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id && !activeFolderId;
        const count = categoryCounts[cat.id];
        const borderStyle = getCategoryLeftBorderStyle(cat.id, cat.color);

        return (
          <button
            key={cat.id}
            data-cat={cat.id}
            data-testid={`category-tab-${cat.id}`}
            onClick={() => {
              if (onSelectFolder) onSelectFolder(null);
              onSelectCategory(cat.id);
            }}
            className={`chip-btn group flex items-center justify-between w-full min-h-[44px] px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 ease-in-out cursor-pointer border-l-4 ${
              isActive
                ? 'bg-stone-800 text-stone-100 font-semibold border-stone-400 shadow-xs'
                : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-100 border-transparent'
            }`}
            style={isActive ? undefined : borderStyle}
          >
            <div className="flex items-center gap-2.5 min-w-0 truncate">
              {renderCategoryIcon(cat, {
                className: `size-4 shrink-0 transition-colors ${
                  isActive ? 'text-stone-200' : 'text-stone-400 group-hover:text-stone-200'
                }`,
              })}
              <span className="truncate">{cat.name}</span>
            </div>
            {count !== undefined && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono transition-colors shrink-0 ${
                  isActive
                    ? 'bg-stone-700 text-stone-100 font-bold border border-stone-600'
                    : 'bg-stone-800/80 text-stone-400 group-hover:bg-stone-800 group-hover:text-stone-300 border border-stone-700/40'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  )}
</div>
```

---

### 4.8 Dynamic Subchips Bar: `src/components/CodeSubChips.tsx`

```tsx
export const CodeSubChips: React.FC<CodeSubChipsProps> = React.memo(({
  selectedCategory,
  selectedSubCategory,
  onSelectSubCategory,
  categories = [],
}) => {
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const subCodes = activeCategoryObj?.subCodes && activeCategoryObj.subCodes.length > 0
    ? activeCategoryObj.subCodes
    : selectedCategory === 'codes'
    ? CODE_SUBS
    : [];

  const isVisible = subCodes.length > 0;

  return (
    <div
      id="subchips"
      data-testid="code-sub-chips"
      className={`subchips-container ${
        isVisible ? 'flex' : 'hidden'
      } flex-wrap gap-1.5 p-2.5 bg-stone-900/80 border border-stone-800 rounded-lg mx-2.5 my-2 shadow-xs select-none overflow-x-auto`}
    >
      {subCodes.map((sub) => {
        const isActive = selectedSubCategory === sub;
        return (
          <button
            key={sub}
            data-sub={sub}
            onClick={() => onSelectSubCategory(sub)}
            className={`subchip-btn min-h-[36px] ${
              isActive
                ? 'active bg-stone-700 text-stone-100 border-stone-600 font-bold shadow-xs'
                : 'bg-stone-800/80 text-stone-400 border-stone-700/80 hover:bg-stone-700/80 hover:text-stone-200 font-medium'
            } px-3 py-1.5 rounded-md border text-xs cursor-pointer whitespace-nowrap font-mono transition-all duration-150 active:scale-95`}
          >
            {sub}
          </button>
        );
      })}
    </div>
  );
});
```

---

## 5. Verification Method

### 5.1 Automated Command Line Verification
```bash
# 1. Full Test Suite Execution
npm test

# 2. TypeScript compilation & production build check
npm run build
```

### 5.2 Specific Verification Test Cases
1. **Dynamic Category Lifecycle**:
   - `addCategory`: Verify category is added to `qc-categories`, `qc-category-order`, and rendered with Lucide/Emoji icon.
   - `updateCategory`: Verify changes to name, color, and icon persist dynamically.
   - `deleteCategory`: Verify category is removed, active selection falls back to `'all'`, and system categories (`all`, `pinned`, `recent`) cannot be deleted.
   - `reorderCategories`: Verify Up/Down buttons update `qc-category-order` and DOM order.
   - `subCodes`: Verify adding/removing sub-codes updates `CodeSubChips` dynamically.
2. **Dedicated History Drawer**:
   - Verify slide-out `Sheet` opens from header History button or Quick View tab.
   - Verify `qc-history-entries` persists `HistoryEntry` items with timestamps and metadata.
   - Verify relative timestamp displays ("Just now", "1m ago").
   - Verify 1-click copy with "Copied!" feedback.
   - Verify "Add all to batch queue" inserts all records into `qc-batch`.
   - Verify "Clear History" opens confirmation dialog before purging storage.
   - Verify inline `#histbar` remains backward-compatible and functional.
3. **Invalidation Conditions**:
   - Any test failure in Tiers 1-5 or challenger harnesses invalidates the implementation.
   - Any layout shift, unhandled NaN in timestamps, or broken localStorage key invalidates the implementation.
