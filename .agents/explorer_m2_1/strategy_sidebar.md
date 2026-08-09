# Milestone M2 Strategy: Sticky Left Sidebar Navigation & Custom Pin Folder Manager

## 1. Executive Summary & Objective
This report details the architectural and visual refactoring strategy for `CategoryChips.tsx` and the left sticky sidebar container (`#sidebarNav`) in `App.tsx`.
The primary objective is to elevate the navigation experience to 2026 Linear/Vercel aesthetic standards while strictly maintaining backwards compatibility with DOM test contracts (`#sidebarNav`, `#nav`, `#chips`, `data-cat`, `data-folder`, `data-testid`).

### Key Features of the Refactored Component Architecture:
- **Linear/Vercel Aesthetic Token Alignment**: Onyx surface containers (`#0c0e12`), 1px razor-sharp borders (`border-white/[0.08]`), ambient cyan glow highlights (`from-cyan-500/15 via-cyan-500/10 to-transparent`, `shadow-[0_0_12px_rgba(6,182,212,0.15)]`), and 150ms ease hover states.
- **15 Dedicated Category Lucide Icons**: Screen (`Monitor`), Camera (`Camera`), Buttons (`Sliders`), Radio (`Radio`), Battery (`Battery`), Back Cover (`Smartphone`), Locks (`Lock`), Pen (`PenTool`), Water Damage (`Droplets`), Audio (`Volume2`), Body (`Cpu`), System (`Settings`), Activity (`Activity`), Codes (`Code`), Pinned (`Star`), Recent (`History`).
- **Collapsible Category & Folder Sections**: Quick Nav, Defect Categories, and Custom Pin Folders with toggle chevrons (`ChevronDown`/`ChevronRight`) and smooth transitions.
- **Custom Pin Folder CRUD Manager**: Full user folder management allowing creation (+ New Folder button & popover/inline dialog), folder renaming/editing, deletion with confirmation dialog, and folder selection.
- **Theme-Aware Cyan/Emerald Accents**: Distinct pill badges, active category indicators, left border accents (`border-l-4`), and folder color tags.

---

## 2. Current Implementation vs. 2026 Target Aesthetics Analysis

| Aspect | Current Implementation (`CategoryChips.tsx`) | 2026 Linear / Vercel Target Standard |
|---|---|---|
| **Container Background** | Plain `bg-zinc-900` / `border-zinc-800` | Onyx surface `#0c0e12` with `bg-[#0c0e12]/90` backdrop blur & 1px razor border `border-white/[0.08]` |
| **Category Nav Item Active State** | `bg-zinc-800 text-cyan-400 border-cyan-500` | Ambient cyan gradient glow `bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-transparent text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]` |
| **Hover Feedback** | `hover:bg-zinc-800/60 hover:text-zinc-200` | Micro-interaction `transition-all duration-150 ease-in-out hover:bg-white/[0.04] hover:text-zinc-100` |
| **Count Pill Badges** | `bg-cyan-500/20 text-cyan-300` / `bg-zinc-800 text-zinc-400` | Theme-aware cyan/emerald pills: `bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold px-2 py-0.5 rounded-full text-[11px]` |
| **Section Grouping** | Single flat list with divider for pin folders | 3 distinct collapsible groups: Quick Views, Categories, Custom Pin Folders |
| **Folder Manager UX** | Read-only folder listing (no create, rename, delete) | Complete Pin Folder CRUD Manager (+ Add Folder popover, inline rename input, delete action) |

---

## 3. Mandatory DOM Contracts & Test Preservation

To ensure zero regressions across JSDOM test suites (`tests/harness.js`, `tests/m3-pin-folders.test.js`, tier test suites) and Cloudflare Pages static builds, the refactored code must strictly preserve the following DOM selectors:

| Selector Type | Element / Contract | Mandatory Value | Purpose in Test Harness |
|---|---|---|---|
| ID | Sidebar container (in `App.tsx`) | `id="sidebarNav"` | Primary query for `app.getAppNavbar()` |
| ID | Category navigation container | `id="nav"` | Root wrapper in `CategoryChips.tsx` |
| ID | Chips scroll container | `id="chips"` | Scroll container in `CategoryChips.tsx` |
| Attribute | Category item buttons | `data-cat="{category.id}"` | Targeted by `app.selectCategory(catId)` |
| Attribute | Pin folder item buttons | `data-folder="{folder.id}"`, `data-cat="pinned"` | Targeted by folder selection queries |
| Attribute | Navbar test ID | `data-testid="app-navbar"` | Modern test harness selector |
| Attribute | Category test ID | `data-testid="category-tab-{category.id}"` | Component test selector |
| Attribute | Folder test ID | `data-testid="pin-folder-{folder.id}"` | Folder test selector |

---

## 4. Architectural & Component Refactoring Blueprint

### 4.1 Categorization Structure & Section Grouping
The sidebar will be structured into three logical sections:

1. **Quick Navigation Group**:
   - `all` — All Defects (Icon: `Folder`, count badge)
   - `pinned` — Starred / Pinned Defects (Icon: `Star`, count badge)
   - `recent` — Copy History Feed (Icon: `History`, count badge)

2. **Defect Categories Group** (13 Categories):
   - `codes` — Panel Sub-codes (`Code`)
   - `screen` — Screen & Display (`Monitor`)
   - `camera` — Camera & Lens (`Camera`)
   - `buttons` — Buttons & Switches (`Sliders`)
   - `radio` — Wireless & Antenna (`Radio`)
   - `battery` — Battery & Power (`Battery`)
   - `backcover` — Back Cover & Body (`Smartphone`)
   - `locks` — Biometrics & Locks (`Lock`)
   - `pen` — S-Pen & Stylus (`PenTool`)
   - `water` — Water & Liquid (`Droplets`)
   - `audio` — Audio & Speaker (`Volume2`)
   - `body` — Mainboard & Frame (`Cpu`)
   - `system` — System Settings (`Settings`)

3. **Custom Pin Folders Group**:
   - Header with `Folder` icon, title, collapsible chevron, and **"+ New Folder"** action button.
   - List of user-created folders (`data-folder="{folder.id}" data-cat="pinned"`).
   - Folder Color Dot indicator (`backgroundColor: folder.color || '#06b6d4'`).
   - Folder item count pill (`folder.itemIds.length`).
   - Hover Action Menu for each folder:
     - Rename button (`Pencil` icon) -> opens inline rename input mode.
     - Delete button (`Trash2` icon) -> opens confirmation popover calling `onDeleteFolder(folder.id)`.

### 4.2 Custom Pin Folder CRUD Manager UX Flow
1. **Create Folder**:
   - Clicking **"+ New Folder"** triggers an inline creation form (or compact modal popover).
   - Inputs: Folder Name (text), Color selector palette (`#06b6d4` cyan, `#10b981` emerald, `#8b5cf6` violet, `#f59e0b` amber, `#ef4444` rose, `#3b82f6` blue).
   - On submit, calls `onCreateFolder(name, color)` from `useQCState` and auto-selects the newly created folder (`onSelectFolder(newId)`).
2. **Rename Folder**:
   - Hovering over a folder row reveals a `Pencil` edit icon.
   - Clicking edit enters inline edit mode (`editingFolderId === folder.id`), turning folder label into a sleek dark input field.
   - Pressing `Enter` or clicking check icon saves change via `onRenameFolder(folder.id, newName)`.
3. **Delete Folder**:
   - Hovering over a folder row reveals a `Trash2` delete icon.
   - Clicking delete prompts confirmation ("Delete folder '{name}'?").
   - On confirmation, calls `onDeleteFolder(folder.id)`. If deleted folder was active, `activeFolderId` resets to `null`.
4. **Folder Selection**:
   - Clicking a folder button sets `activeFolderId = folder.id` and sets `selectedCategory = 'pinned'`, filtering defect cards to only those pinned in that folder.

---

## 5. Interface Contracts & Component Props Extension

### 5.1 Updated `CategoryChipsProps` Interface
```typescript
import React from 'react';
import type { CategoryKey, CustomPinFolder } from '../types/qc.ts';

export interface CategoryChipsProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  categoryCounts?: Record<string, number>;
  folders?: CustomPinFolder[];
  activeFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
  onCreateFolder?: (name: string, color?: string) => string;
  onDeleteFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
}
```

### 5.2 Updated Integration in `App.tsx`
```tsx
<CategoryChips
  selectedCategory={selectedCategory}
  onSelectCategory={(cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory('ALL');
  }}
  categoryCounts={categoryCounts}
  folders={folders}
  activeFolderId={activeFolderId}
  onSelectFolder={setActiveFolderId}
  onCreateFolder={createFolder}
  onDeleteFolder={deleteFolder}
  onRenameFolder={renameFolder}
/>
```

---

## 6. Detailed Refactoring Implementation Blueprint for `CategoryChips.tsx`

```tsx
import React, { useState } from 'react';
import { CATEGORIES } from '../data/qcData.ts';
import type { CategoryKey, CustomPinFolder } from '../types/qc.ts';
import { getCategoryIconComponent, getCategoryLeftBorderStyle } from '../utils/categoryColors.ts';
import {
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Star,
  History,
} from 'lucide-react';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';

const FOLDER_COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

export interface CategoryChipsProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  categoryCounts?: Record<string, number>;
  folders?: CustomPinFolder[];
  activeFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
  onCreateFolder?: (name: string, color?: string) => string;
  onDeleteFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  folders = [],
  activeFolderId = null,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
}) => {
  // Section collapsible state
  const [quickNavOpen, setQuickNavOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);

  // Folder creation & editing state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#06b6d4');

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const quickNavItems = [
    { id: 'all' as CategoryKey, name: 'All Defects', icon: Folder },
    { id: 'pinned' as CategoryKey, name: 'Starred Defects', icon: Star },
    { id: 'recent' as CategoryKey, name: 'Recent History', icon: History },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    if (onCreateFolder) {
      const createdId = onCreateFolder(newFolderName.trim(), newFolderColor);
      if (onSelectFolder) onSelectFolder(createdId);
      onSelectCategory('pinned');
    }
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleStartRename = (folder: CustomPinFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const handleSaveRename = (folderId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingFolderName.trim() && onRenameFolder) {
      onRenameFolder(folderId, editingFolderName.trim());
    }
    setEditingFolderId(null);
  };

  const handleDelete = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this pin folder? Pinned items will remain in Starred Defects.')) {
      if (onDeleteFolder) onDeleteFolder(folderId);
    }
  };

  return (
    <div id="nav" className="category-nav-container p-3 space-y-4 text-zinc-200 select-none">
      <div id="chips" className="chips-scroll-container flex flex-col gap-3">
        
        {/* SECTION 1: Quick Navigation */}
        <div className="space-y-1">
          <button
            onClick={() => setQuickNavOpen((prev) => !prev)}
            className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors"
          >
            <span>Quick Views</span>
            {quickNavOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
          
          {quickNavOpen && (
            <div className="space-y-1 pt-0.5">
              {quickNavItems.map((item) => {
                const isActive = selectedCategory === item.id && !activeFolderId;
                const count = categoryCounts[item.id] || 0;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    data-cat={item.id}
                    data-testid={`category-tab-${item.id}`}
                    onClick={() => {
                      if (onSelectFolder) onSelectFolder(null);
                      onSelectCategory(item.id);
                    }}
                    className={`chip-btn group flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 ease-in-out cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-transparent text-cyan-300 font-semibold border-l-4 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <IconComponent className={`size-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-zinc-300 border border-zinc-700/40'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Custom Pin Folders Manager */}
        <div className="pt-2 border-t border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={() => setFoldersOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors"
            >
              <Folder className="size-3.5 text-cyan-400" />
              <span>Pin Folders</span>
              <span className="text-[10px] text-zinc-400">({folders.length})</span>
              {foldersOpen ? <ChevronDown className="size-3.5 ml-1" /> : <ChevronRight className="size-3.5 ml-1" />}
            </button>

            <button
              onClick={() => setIsCreatingFolder((prev) => !prev)}
              className="p-1 rounded text-zinc-400 hover:text-cyan-400 hover:bg-white/[0.06] transition-colors"
              title="Create New Pin Folder"
            >
              <FolderPlus className="size-3.5" />
            </button>
          </div>

          {/* Inline Folder Creation Form */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateSubmit} className="p-2.5 my-1 bg-[#14171f] rounded-lg border border-cyan-500/30 space-y-2">
              <div className="text-[11px] font-semibold text-cyan-300">Create Pin Folder</div>
              <Input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                className="h-7 text-xs bg-zinc-900/90 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500"
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-400">Color:</span>
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewFolderColor(color)}
                    className={`size-4 rounded-full transition-transform ${newFolderColor === color ? 'scale-125 ring-2 ring-white/80' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingFolder(false)}
                  className="h-6 px-2 text-[11px] text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newFolderName.trim()}
                  className="h-6 px-2.5 text-[11px] bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold"
                >
                  Create
                </Button>
              </div>
            </form>
          )}

          {/* Folder Item List */}
          {foldersOpen && (
            <div className="space-y-1 pt-0.5">
              {folders.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-400 italic">No custom pin folders created.</div>
              ) : (
                folders.map((folder) => {
                  const isFolderActive = activeFolderId === folder.id;
                  const isEditing = editingFolderId === folder.id;

                  if (isEditing) {
                    return (
                      <form
                        key={folder.id}
                        onSubmit={(e) => handleSaveRename(folder.id, e)}
                        className="flex items-center gap-1 px-2 py-1 bg-[#14171f] rounded-lg border border-cyan-500/30"
                      >
                        <Input
                          type="text"
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          autoFocus
                          className="h-6 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-cyan-500 flex-1"
                        />
                        <button type="submit" className="p-1 text-cyan-400 hover:text-cyan-300">
                          <Check className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFolderId(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-200"
                        >
                          <X className="size-3.5" />
                        </button>
                      </form>
                    );
                  }

                  return (
                    <button
                      key={folder.id}
                      data-folder={folder.id}
                      data-cat="pinned"
                      data-testid={`pin-folder-${folder.id}`}
                      onClick={() => {
                        if (onSelectFolder) onSelectFolder(folder.id);
                        onSelectCategory('pinned');
                      }}
                      className={`chip-btn group flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ease-in-out cursor-pointer border-l-4 ${
                        isFolderActive
                          ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-transparent text-cyan-300 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100 border-transparent'
                      }`}
                      style={{ borderLeftColor: folder.color || '#06b6d4' }}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <span
                          className="size-2 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: folder.color || '#06b6d4' }}
                        />
                        <span className="truncate">{folder.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Hover CRUD Actions */}
                        <div className="hidden group-hover:flex items-center gap-0.5 mr-1">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleStartRename(folder, e)}
                            className="p-0.5 rounded text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800 transition-colors"
                            title="Rename folder"
                          >
                            <Pencil className="size-3" />
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleDelete(folder.id, e)}
                            className="p-0.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                            title="Delete folder"
                          >
                            <Trash2 className="size-3" />
                          </span>
                        </div>

                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/40 font-mono">
                          {folder.itemIds?.length || 0}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: Defect Categories */}
        <div className="pt-2 border-t border-white/[0.08] space-y-1">
          <button
            onClick={() => setCategoriesOpen((prev) => !prev)}
            className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors"
          >
            <span>Defect Categories</span>
            {categoriesOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>

          {categoriesOpen && (
            <div className="space-y-1 pt-0.5">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id && !activeFolderId;
                const count = categoryCounts[cat.id];
                const IconComponent = getCategoryIconComponent(cat.id);
                const borderStyle = getCategoryLeftBorderStyle(cat.id);

                return (
                  <button
                    key={cat.id}
                    data-cat={cat.id}
                    data-testid={`category-tab-${cat.id}`}
                    onClick={() => {
                      if (onSelectFolder) onSelectFolder(null);
                      onSelectCategory(cat.id);
                    }}
                    className={`chip-btn group flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 ease-in-out cursor-pointer border-l-4 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-transparent text-cyan-300 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100 border-transparent'
                    }`}
                    style={isActive ? undefined : borderStyle}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <IconComponent
                        className={`size-4 shrink-0 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {count !== undefined && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                            : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-zinc-300 border border-zinc-700/40'
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

      </div>
    </div>
  );
};
```

---

## 7. Verification Method & Acceptance Criteria

1. **DOM Attributes Verification**:
   - Verify `App.tsx` sidebar wrapper renders `<aside data-testid="app-navbar" id="sidebarNav" className="sidebar-nav ...">`.
   - Verify `CategoryChips.tsx` renders `<div id="nav">` and `<div id="chips">`.
   - Verify category buttons carry `data-cat="{cat.id}"`.
   - Verify pin folder buttons carry `data-folder="{folder.id}"` and `data-cat="pinned"`.

2. **Test Suite Verification**:
   - Run `npm test` to execute node test suites across Tiers 1-5 and Milestone 3 pin folder tests (`tests/m3-pin-folders.test.js`).
   - Confirm 100% pass rate.

3. **Build & Type Safety Verification**:
   - Run `npm run build` to verify TypeScript type checking and Vite build bundle generation into `dist/`.
