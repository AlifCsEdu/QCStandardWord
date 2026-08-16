import React from 'react';
import type { LayoutMode, QCItem, SearchResult, CustomPinFolder } from '../types/qc.ts';
import { DefectCard } from './DefectCard.tsx';
import { WordingGrid } from './WordingGrid.tsx';
import { WordingList } from './WordingList.tsx';
import { WordingTable } from './WordingTable.tsx';

interface WordingContainerProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onClearSearch?: () => void;
  results: SearchResult[];
  layoutMode: LayoutMode;
  onSetLayout?: (layout: LayoutMode) => void;
  pinsSet: Set<string | number>;
  editMode: boolean;
  onCopyItem: (text: string, meta?: { itemNumber?: number; category?: string }) => void;
  onTogglePin: (id: string | number) => void;
  onAddToBatch: (text: string) => void;
  onOpenEdit: (item: QCItem) => void;
  onDeleteItem: (item: QCItem) => void;
  folders?: CustomPinFolder[];
  onTogglePinToFolder?: (itemId: string | number, folderId: string) => void;
  isPinnedInFolder?: (itemId: string | number, folderId: string) => boolean;
}

export const WordingContainer: React.FC<WordingContainerProps> = React.memo(({
  results,
  layoutMode,
  pinsSet,
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
  return (
    <div id="wordingContainer" className="wording-container p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div id="countLabel" className="text-xs sm:text-sm font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-2">
          <span>{results.length} {results.length === 1 ? 'wording' : 'wordings'}</span>
        </div>
      </div>

      {/* Main List/Grid/Table Wrapper */}
      <div id="listwrap" data-testid="wording-container" data-layout={layoutMode} className={`listwrap ${layoutMode}`}>
        {results.length === 0 ? (
          <div
            id="empty"
            className="p-12 text-center border border-dashed border-stone-800/80 rounded-xl bg-[#1a1a20] text-stone-400 text-sm flex flex-col items-center justify-center gap-3 min-h-[220px]"
          >
            <p className="font-semibold text-stone-300">No matching QC wording defects found</p>
            <p className="text-xs text-stone-500 max-w-sm">Try adjusting your search query or selecting a different category filter.</p>
          </div>
        ) : (
          <div
            className={
              layoutMode === 'grid'
                ? 'wording-grid-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4'
                : layoutMode === 'table'
                ? 'wording-table-wrapper wording-table-body flex flex-col divide-y divide-stone-800/80 border border-stone-800/80 rounded-xl bg-[#1a1a20] overflow-x-auto touch-scroll shadow-xs'
                : 'wording-list-body flex flex-col gap-2.5'
            }
          >
            {layoutMode === 'table' && (
              <div className="hidden sm:grid grid-cols-12 px-4 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-800/80 bg-[#141418]">
                <span className="col-span-1">Code</span>
                <span className="col-span-7">QC Defect Wording Standard</span>
                <span className="col-span-2">Category</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>
            )}
            {results.map(({ item, isApprox, highlightedText }) => {
              const isPinned = pinsSet.has(item.id) || pinsSet.has(item.n);
              return (
                <DefectCard
                  key={item.id}
                  item={item}
                  variant={layoutMode}
                  isPinned={isPinned}
                  isApprox={isApprox}
                  highlightedText={highlightedText}
                  editMode={editMode}
                  onCopyItem={onCopyItem}
                  onTogglePin={onTogglePin}
                  onAddToBatch={onAddToBatch}
                  onOpenEdit={onOpenEdit}
                  onDeleteItem={onDeleteItem}
                  folders={folders}
                  onTogglePinToFolder={onTogglePinToFolder}
                  isPinnedInFolder={isPinnedInFolder}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});


