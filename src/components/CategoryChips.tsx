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

const FOLDER_COLORS = ['#78716c', '#10b981', '#71717a', '#f59e0b', '#ef4444', '#3b82f6'];

const QUICK_NAV_ITEMS = [
  { id: 'all' as CategoryKey, name: 'All Defects', icon: Folder },
  { id: 'pinned' as CategoryKey, name: 'Starred Defects', icon: Star },
  { id: 'recent' as CategoryKey, name: 'Recent History', icon: History },
];

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

export const CategoryChips: React.FC<CategoryChipsProps> = React.memo(({
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
  const [newFolderColor, setNewFolderColor] = useState('#78716c');

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

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
    <div id="nav" className="category-nav-container p-3 space-y-4 text-stone-200 select-none">
      <div id="chips" className="chips-scroll-container flex flex-col gap-3">
        
        {/* SECTION 1: Quick Navigation */}
        <div className="space-y-1">
          <button
            onClick={() => setQuickNavOpen((prev) => !prev)}
            className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider hover:text-stone-200 transition-colors cursor-pointer"
          >
            <span>Quick Views</span>
            {quickNavOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
          
          {quickNavOpen && (
            <div className="space-y-1 pt-0.5">
              {QUICK_NAV_ITEMS.map((item) => {
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
                        ? 'bg-stone-800 text-stone-100 font-semibold border-l-4 border-stone-400'
                        : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-100 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <IconComponent className={`size-4 shrink-0 transition-colors ${isActive ? 'text-stone-200' : 'text-stone-400 group-hover:text-stone-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                        isActive
                          ? 'bg-stone-700 text-stone-100 font-bold border border-stone-600'
                          : 'bg-stone-800/80 text-stone-400 group-hover:bg-stone-800 group-hover:text-stone-300 border border-stone-700/40'
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
        <div className="pt-2 border-t border-stone-800 space-y-1">
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={() => setFoldersOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider hover:text-stone-200 transition-colors cursor-pointer"
            >
              <Folder className="size-3.5 text-stone-400" />
              <span>Pin Folders</span>
              <span className="text-[10px] text-stone-400">({folders.length})</span>
              {foldersOpen ? <ChevronDown className="size-3.5 ml-1" /> : <ChevronRight className="size-3.5 ml-1" />}
            </button>

            <button
              onClick={() => setIsCreatingFolder((prev) => !prev)}
              className="p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Create New Pin Folder"
            >
              <FolderPlus className="size-3.5" />
            </button>
          </div>

          {/* Inline Folder Creation Form */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateSubmit} className="p-2.5 my-1 bg-stone-900 rounded-lg border border-stone-800 space-y-2">
              <div className="text-[11px] font-semibold text-stone-300">Create Pin Folder</div>
              <Input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                className="h-7 text-xs bg-stone-950 border-stone-800 text-stone-100 placeholder:text-stone-500 focus:border-stone-700"
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-400">Color:</span>
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewFolderColor(color)}
                    className={`size-4 rounded-full transition-transform cursor-pointer ${newFolderColor === color ? 'scale-125 ring-2 ring-stone-300' : 'hover:scale-110'}`}
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
                  className="h-6 px-2 text-[11px] text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newFolderName.trim()}
                  className="h-6 px-2.5 text-[11px] bg-stone-100 hover:bg-white text-stone-900 font-semibold cursor-pointer"
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
                <div className="px-3 py-2 text-xs text-stone-400 italic">No custom pin folders created.</div>
              ) : (
                folders.map((folder) => {
                  const isFolderActive = activeFolderId === folder.id;
                  const isEditing = editingFolderId === folder.id;

                  if (isEditing) {
                    return (
                      <form
                        key={folder.id}
                        onSubmit={(e) => handleSaveRename(folder.id, e)}
                        className="flex items-center gap-1 px-2 py-1 bg-stone-900 rounded-lg border border-stone-800"
                      >
                        <Input
                          type="text"
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          autoFocus
                          className="h-6 text-xs bg-stone-950 border-stone-800 text-stone-100 focus:border-stone-700 flex-1"
                        />
                        <button type="submit" className="p-1 text-stone-200 hover:text-white">
                          <Check className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFolderId(null)}
                          className="p-1 text-stone-400 hover:text-stone-200"
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
                      data-testid={`pin-folder-${folder.id}`}
                      onClick={() => {
                        if (onSelectFolder) onSelectFolder(folder.id);
                        onSelectCategory('pinned');
                      }}
                      className={`chip-btn group flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ease-in-out cursor-pointer border-l-4 ${
                        isFolderActive
                          ? 'bg-stone-800 text-stone-100 font-semibold'
                          : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-100 border-transparent'
                      }`}
                      style={{ borderLeftColor: folder.color || '#a1a1aa' }}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <span
                          className="size-2 rounded-xs shrink-0 shadow-xs"
                          style={{ backgroundColor: folder.color || '#a1a1aa' }}
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
                            className="p-0.5 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                            title="Rename folder"
                          >
                            <Pencil className="size-3" />
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleDelete(folder.id, e)}
                            className="p-0.5 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                            title="Delete folder"
                          >
                            <Trash2 className="size-3" />
                          </span>
                        </div>

                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-800/80 text-stone-400 border border-stone-700/40 font-mono">
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
        <div className="pt-2 border-t border-stone-800 space-y-1">
          <button
            onClick={() => setCategoriesOpen((prev) => !prev)}
            className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider hover:text-stone-200 transition-colors cursor-pointer"
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
                        ? 'bg-stone-800 text-stone-100 font-semibold border-stone-400'
                        : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-100 border-transparent'
                    }`}
                    style={isActive ? undefined : borderStyle}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <IconComponent
                        className={`size-4 shrink-0 transition-colors ${
                          isActive ? 'text-stone-200' : 'text-stone-400 group-hover:text-stone-200'
                        }`}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {count !== undefined && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
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

      </div>
    </div>
  );
});


