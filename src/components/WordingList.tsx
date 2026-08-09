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

export const WordingList: React.FC<WordingViewProps> = ({
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
    <div className="wording-list-body flex flex-col gap-2">
      {results.map(({ item, isApprox, highlightedText }) => {
        const isPinned = pinsSet.has(item.id) || pinsSet.has(item.n);
        return (
          <DefectCard
            key={item.id}
            item={item}
            variant="list"
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
  );
};


