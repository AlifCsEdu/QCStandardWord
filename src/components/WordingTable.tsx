import React from 'react';
import type { QCItem, SearchResult } from '../types/qc.ts';

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
          <div
            key={item.id}
            data-id={item.id}
            className="trow"
            onClick={() => onCopyItem(item.t)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #edf2f7',
              background: isPinned ? '#fff9db' : '#ffffff',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span className="rnum" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#868e96', width: '32px' }}>
                #{item.n}
              </span>
              <div className="rtxt" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#212529', flex: 1 }}>
                {isApprox && (
                  <span className="fz" style={{ color: '#f59f00', fontWeight: 700, marginRight: '4px' }}>
                    ≈
                  </span>
                )}
                <span dangerouslySetInnerHTML={{ __html: highlightedText || item.t }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="rpill"
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  background: '#f1f3f5',
                  color: '#495057',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {item.c}
              </span>

              <div className="racts" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  data-act="pin"
                  className={`pin-btn ${isPinned ? 'pinned' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(item.id);
                  }}
                  title={isPinned ? 'Unpin item' : 'Pin item'}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    background: isPinned ? '#ffe066' : '#ffffff',
                    color: isPinned ? '#f59f00' : '#868e96',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  {isPinned ? '★' : '☆'}
                </button>

                <button
                  data-act="add"
                  className="add-batch-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToBatch(item.t);
                  }}
                  title="Add to batch queue"
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #1971c2',
                    background: '#e7f5ff',
                    color: '#1971c2',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Batch
                </button>

                {editMode && (
                  <>
                    <button
                      data-act="edit"
                      className="edit-item-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEdit(item);
                      }}
                      title="Edit wording item"
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid #f59f00',
                        background: '#fff9db',
                        color: '#f59f00',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      data-act="del"
                      className="del-item-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item);
                      }}
                      title="Delete wording item"
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid #e03131',
                        background: '#ffe3e3',
                        color: '#e03131',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Del
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
