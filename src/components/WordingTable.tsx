import React from 'react';
import type { QCItem, SearchResult, CustomPinFolder } from '../types/qc.ts';
import { DefectCard } from './DefectCard.tsx';

interface WordingViewProps {
  results: SearchResult[];
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

export const WordingTable: React.FC<WordingViewProps> = ({
  results,
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
    <div className="wording-table-wrapper rounded-xl border border-white/[0.08] bg-[#0c0e12]/90 backdrop-blur-md overflow-hidden shadow-sm">
      <div className="hidden sm:grid grid-cols-12 px-4 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 border-b border-white/[0.08] bg-zinc-950/60">
        <span className="col-span-1">Code</span>
        <span className="col-span-7">QC Defect Wording Standard</span>
        <span className="col-span-2">Category</span>
        <span className="col-span-2 text-right">Actions</span>
      </div>
      <div className="wording-table-body flex flex-col divide-y divide-zinc-800/40">
        {results.map(({ item, isApprox, highlightedText }) => {
          const isPinned = pinsSet.has(item.id) || pinsSet.has(item.n);
          return (
            <DefectCard
              key={item.id}
              item={item}
              variant="table"
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
    </div>
  );
};


