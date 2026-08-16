import React, { useState } from 'react';
import { CATEGORIES } from '../data/qcData.ts';
import type { CategoryInfo, CategoryKey, CustomPinFolder } from '../types/qc.ts';
import { renderCategoryIcon, getCategoryLeftBorderStyle } from '../utils/categoryColors.ts';
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
  Sliders,
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
  categories?: CategoryInfo[];
  categoryCounts?: Record<string, number>;
  folders?: CustomPinFolder[];
  activeFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
  onCreateFolder?: (name: string, color?: string) => string;
  onDeleteFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onOpenCategoryManager?: () => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = React.memo(({
  selectedCategory,
  onSelectCategory,
  categories = CATEGORIES,
  categoryCounts = {},
  folders = [],
  activeFolderId = null,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onOpenCategoryManager,
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

  // Filter out system views from defect categories
  const displayCategories = categories.filter(
    (c) => c.id !== 'all' && c.id !== 'pinned' && c.id !== 'recent'
  );

  return (
    <div id="nav" className="category-nav-container p-3 space-y-3.5 text-stone-200 select-none">
      <div id="chips" className="chips-scroll-container flex flex-col gap-3">
        
        {/* SECTION 1: Quick Views */}
        <div className="space-y-1">
          <button
            onClick={() => setQuickNavOpen((prev) => !prev)}
            className="flex items-center justify-between w-full min-h-[44px] px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider hover:text-stone-200 transition-colors cursor-pointer"
          >
            <span>Quick Views</span>
            {quickNavOpen ? <ChevronDown className="size-3.5 text-stone-400" /> : <ChevronRight className="size-3.5 text-stone-400" />}
          </button>
          
          {quickNavOpen && (
            <div className="space-y-0.5 pt-0.5">
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
                    className={`chip-btn group flex items-center justify-between w-full min-h-[44px] px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 ease-in-out cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-stone-800 text-stone-100 font-semibold border-l-4 border-stone-400 shadow-xs'
                        : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-100 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <IconComponent className={`size-4 shrink-0 transition-colors ${isActive ? 'text-stone-200' : 'text-stone-400 group-hover:text-stone-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono transition-colors shrink-0 ${
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
          <div className="flex items-center justify-between px-2 py-1 min-h-[44px]">
            <button
              onClick={() => setFoldersOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider hover:text-stone-200 transition-colors cursor-pointer"
            >
              <Folder className="size-3.5 text-stone-400" />
              <span>Pin Folders</span>
              <span className="text-[10px] text-stone-400 font-mono">({folders.length})</span>
              {foldersOpen ? <ChevronDown className="size-3.5 ml-0.5 text-stone-400" /> : <ChevronRight className="size-3.5 ml-0.5 text-stone-400" />}
            </button>

            <button
              onClick={() => setIsCreatingFolder((prev) => !prev)}
              className="min-h-[44px] min-w-[44px] size-11 p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Create New Pin Folder"
            >
              <FolderPlus className="size-4" />
            </button>
          </div>

          {/* Inline Folder Creation Form */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateSubmit} className="p-3 my-1 bg-[#1a1a20] rounded-xl border border-stone-800/80 space-y-2.5">
              <div className="text-xs font-semibold text-stone-300">Create Pin Folder</div>
              <Input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                className="min-h-[40px] h-10 text-xs bg-[#141418] border-stone-800/80 text-stone-100 placeholder:text-stone-500 focus:border-stone-700 rounded-lg"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-stone-400">Color:</span>
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewFolderColor(color)}
                    className={`size-6 rounded-full transition-transform cursor-pointer ${newFolderColor === color ? 'scale-125 ring-2 ring-stone-300' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingFolder(false)}
                  className="min-h-[36px] h-9 px-3 text-xs bg-[#141418] border-stone-800/80 text-stone-400 hover:text-stone-200 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newFolderName.trim()}
                  className="min-h-[36px] h-9 px-3 text-xs bg-stone-100 text-stone-900 font-semibold hover:bg-white rounded-lg"
                >
                  Save
                </Button>
              </div>
            </form>
          )}

          {/* Folder Chips List */}
          {foldersOpen && (
            <div className="space-y-0.5 pt-0.5">
              {folders.length === 0 && !isCreatingFolder ? (
                <div className="text-[11px] text-stone-400 px-3 py-2 italic font-mono">
                  No pin folders created yet.
                </div>
              ) : (
                folders.map((folder) => {
                  const isFolderActive = activeFolderId === folder.id;
                  const isEditing = editingFolderId === folder.id;

                  if (isEditing) {
                    return (
                      <form
                        key={folder.id}
                        onSubmit={(e) => handleSaveRename(folder.id, e)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a20] rounded-lg border border-stone-800/80"
                      >
                        <Input
                          type="text"
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          autoFocus
                          className="min-h-[36px] h-9 text-xs bg-[#141418] border-stone-800/80 text-stone-100 focus:border-stone-700 flex-1 rounded-lg"
                        />
                        <button type="submit" className="min-h-[44px] min-w-[44px] size-11 p-2 text-stone-200 hover:text-white active:scale-95 cursor-pointer flex items-center justify-center">
                          <Check className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFolderId(null)}
                          className="min-h-[44px] min-w-[44px] size-11 p-2 text-stone-400 hover:text-stone-200 active:scale-95 cursor-pointer flex items-center justify-center"
                        >
                          <X className="size-4" />
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
                      className={`chip-btn group flex items-center justify-between w-full min-h-[44px] px-3 py-2.5 text-xs font-medium rounded-lg transition-all duration-150 ease-in-out cursor-pointer border-l-4 active:scale-95 ${
                        isFolderActive
                          ? 'bg-stone-800 text-stone-100 font-semibold shadow-xs'
                          : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-100 border-transparent'
                      }`}
                      style={{ borderLeftColor: folder.color || '#a1a1aa' }}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <span
                          className="size-2.5 rounded-xs shrink-0 shadow-xs"
                          style={{ backgroundColor: folder.color || '#a1a1aa' }}
                        />
                        <span className="truncate">{folder.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Hover CRUD Actions */}
                        <div className="hidden group-hover:flex items-center gap-0.5 mr-1">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleStartRename(folder, e)}
                            className="min-h-[44px] min-w-[44px] size-11 p-2 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
                            title="Rename folder"
                          >
                            <Pencil className="size-3.5" />
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleDelete(folder.id, e)}
                            className="min-h-[44px] min-w-[44px] size-11 p-2 rounded-md text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
                            title="Delete folder"
                          >
                            <Trash2 className="size-3.5" />
                          </span>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800/80 text-stone-400 border border-stone-700/40 font-mono">
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
          <div className="flex items-center justify-between px-2 py-1 min-h-[44px]">
            <button
              onClick={() => setCategoriesOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider hover:text-stone-200 transition-colors cursor-pointer"
            >
              <span>Defect Categories</span>
              <span className="text-[10px] text-stone-400 font-mono">({displayCategories.length})</span>
              {categoriesOpen ? <ChevronDown className="size-3.5 ml-0.5 text-stone-400" /> : <ChevronRight className="size-3.5 ml-0.5 text-stone-400" />}
            </button>

            {onOpenCategoryManager && (
              <button
                onClick={onOpenCategoryManager}
                data-testid="open-category-manager-btn"
                className="min-h-[44px] min-w-[44px] size-11 p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
                title="Manage Categories"
              >
                <Sliders className="size-4" />
              </button>
            )}
          </div>

          {categoriesOpen && (
            <div className="space-y-0.5 pt-0.5">
              {displayCategories.map((cat) => {
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
                    className={`chip-btn group flex items-center justify-between w-full min-h-[44px] sm:min-h-[48px] px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 ease-in-out cursor-pointer border-l-4 active:scale-95 ${
                      isActive
                        ? 'bg-stone-800 text-stone-100 font-semibold shadow-xs'
                        : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-100 border-transparent'
                    }`}
                    style={borderStyle}
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

      </div>
    </div>
  );
});
