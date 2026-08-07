import React from 'react';
import type { LayoutMode, QCItem, SearchResult } from '../types/qc.ts';
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
}) => {
  return (
    <div className="wording-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div id="countLabel" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', whiteSpace: 'nowrap' }}>
          {results.length} {results.length === 1 ? 'wording' : 'wordings'}
        </div>
      </div>

      {/* Main List/Grid/Table Wrapper */}
      <div id="listwrap" className={`listwrap ${layoutMode}`}>
        {results.length === 0 ? (
          <div
            id="empty"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary, #94a3b8)',
              fontSize: '1rem',
              border: '2px dashed var(--border-contrast, #334155)',
              borderRadius: '8px',
              background: 'var(--container-charcoal, #1e293b)',
            }}
          >
            No matching QC wording defects found.
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
          />
        )}
      </div>
    </div>
  );
};

