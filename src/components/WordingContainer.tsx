import React from 'react';
import type { LayoutMode, QCItem, SearchResult, CustomPinFolder } from '../types/qc.ts';
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
  onCopyItem: (text: string) => void;
  onTogglePin: (id: string | number) => void;
  onAddToBatch: (text: string) => void;
  onOpenEdit: (item: QCItem) => void;
  onDeleteItem: (item: QCItem) => void;
  folders?: CustomPinFolder[];
  onTogglePinToFolder?: (itemId: string | number, folderId: string) => void;
  isPinnedInFolder?: (itemId: string | number, folderId: string) => boolean;
}

export const WordingContainer: React.FC<WordingContainerProps> = ({
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
        <div id="countLabel" className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <span>{results.length} {results.length === 1 ? 'wording' : 'wordings'}</span>
        </div>
      </div>

      {/* Main List/Grid/Table Wrapper */}
      <div id="listwrap" data-testid="wording-container" data-layout={layoutMode} className={`listwrap ${layoutMode}`}>
        {results.length === 0 ? (
          <div
            id="empty"
            className="p-12 text-center border border-dashed border-zinc-800/80 rounded-xl bg-[#0c0e12]/80 backdrop-blur-md text-zinc-400 text-sm flex flex-col items-center justify-center gap-3 min-h-[220px]"
          >
            <p className="font-semibold text-zinc-300">No matching QC wording defects found</p>
            <p className="text-xs text-zinc-500 max-w-sm">Try adjusting your search query or selecting a different category filter.</p>
          </div>
        ) : layoutMode === 'grid' ? (
          <WordingGrid
            results={results}
            pinsSet={pinsSet}
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
        ) : layoutMode === 'table' ? (
          <WordingTable
            results={results}
            pinsSet={pinsSet}
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
        ) : (
          <WordingList
            results={results}
            pinsSet={pinsSet}
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
        )}
      </div>
    </div>
  );
};


