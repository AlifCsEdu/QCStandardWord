import React from 'react';
import { SegmentedControl } from '@mantine/core';
import type { LayoutMode, QCItem, SearchResult } from '../types/qc.ts';
import { WordingGrid } from './WordingGrid.tsx';
import { WordingList } from './WordingList.tsx';
import { WordingTable } from './WordingTable.tsx';

interface WordingContainerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
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
  searchQuery,
  onSearchChange,
  onClearSearch,
  results,
  layoutMode,
  onSetLayout,
  pinsSet,
  editMode,
  onCopyItem,
  onTogglePin,
  onAddToBatch,
  onOpenEdit,
  onDeleteItem,
}) => {
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="wording-container" style={{ padding: '20px' }}>
      {/* Search Input Bar & View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            placeholder="Search QC defects (e.g. FCPB, battery, display, crease)..."
            style={{
              width: '100%',
              padding: '10px 36px 10px 14px',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {hasQuery && (
            <button
              id="clearBtn"
              className={`clear-btn ${hasQuery ? 'show' : ''}`}
              onClick={onClearSearch}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                color: '#868e96',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode SegmentedControl from @mantine/core */}
        {onSetLayout && (
          <SegmentedControl
            size="xs"
            value={layoutMode}
            onChange={(val) => onSetLayout(val as LayoutMode)}
            data={[
              { label: 'List', value: 'list' },
              { label: 'Grid', value: 'grid' },
              { label: 'Table', value: 'table' },
            ]}
          />
        )}

        <div id="countLabel" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#495057', whiteSpace: 'nowrap' }}>
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
              color: '#868e96',
              fontSize: '1rem',
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              background: '#f8f9fa',
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
