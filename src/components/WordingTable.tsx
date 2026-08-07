import React from 'react';
import type { QCItem, SearchResult } from '../types/qc.ts';
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
}) => {
  return (
    <div className="wording-table-body" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
          />
        );
      })}
    </div>
  );
};

