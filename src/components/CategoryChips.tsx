import React from 'react';
import { CATEGORIES } from '../data/qcData.ts';
import type { CategoryKey, CustomPinFolder } from '../types/qc.ts';
import { getCategoryIconComponent, getCategoryLeftBorderStyle } from '../utils/categoryColors.ts';
import { Folder } from 'lucide-react';

interface CategoryChipsProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  categoryCounts?: Record<string, number>;
  folders?: CustomPinFolder[];
  activeFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  folders = [],
  activeFolderId = null,
  onSelectFolder,
}) => {
  return (
    <div
      id="nav"
      className="category-nav-container p-3 border-b border-zinc-800"
    >
      <div
        id="chips"
        className="chips-scroll-container flex flex-col gap-1"
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id && !activeFolderId;
          const count = categoryCounts[cat.id];
          const IconComponent = getCategoryIconComponent(cat.id);
          const borderStyle = getCategoryLeftBorderStyle(cat.id);

          return (
            <button
              key={cat.id}
              data-cat={cat.id}
              onClick={() => {
                if (onSelectFolder) onSelectFolder(null);
                onSelectCategory(cat.id);
              }}
              className={`chip-btn flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer border-l-4 ${
                isActive
                  ? 'bg-zinc-800 text-cyan-400 border-cyan-500 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border-transparent'
              }`}
              style={isActive ? undefined : borderStyle}
            >
              <div className="flex items-center gap-2 min-w-0 truncate">
                <IconComponent className={`size-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                <span className="truncate">{cat.name}</span>
              </div>
              {count !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'bg-zinc-800 text-zinc-400 font-normal'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Custom User Pin Folders Navigation Section */}
        {folders.length > 0 && (
          <div className="mt-3 pt-2 border-t border-zinc-800/60">
            <div className="px-2 pb-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="size-3 text-cyan-500" />
              <span>Pin Folders</span>
            </div>
            {folders.map((folder) => {
              const isFolderActive = activeFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  data-folder={folder.id}
                  data-cat="pinned"
                  onClick={() => {
                    if (onSelectFolder) onSelectFolder(folder.id);
                    onSelectCategory('pinned');
                  }}
                  className={`chip-btn flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border-l-4 ${
                    isFolderActive
                      ? 'bg-zinc-800 text-cyan-400 font-semibold border-cyan-500'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border-transparent'
                  }`}
                  style={{ borderLeftColor: folder.color || '#06b6d4' }}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color || '#06b6d4' }}
                    />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {folder.itemIds?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


