import React from 'react';
import type { QCItem } from '../types/qc.ts';
import { getCategoryBadgeStyle } from '../utils/categoryColors.ts';

export interface DefectCardProps {
  item: QCItem;
  variant: 'grid' | 'list' | 'table';
  isPinned: boolean;
  isApprox?: boolean;
  highlightedText?: string;
  editMode: boolean;
  onCopyItem: (text: string) => void;
  onTogglePin: (id: string | number) => void;
  onAddToBatch: (text: string) => void;
  onOpenEdit: (item: QCItem) => void;
  onDeleteItem: (item: QCItem) => void;
}

export const DefectCard: React.FC<DefectCardProps> = ({
  item,
  variant,
  isPinned,
  isApprox,
  highlightedText,
  editMode,
  onCopyItem,
  onTogglePin,
  onAddToBatch,
  onOpenEdit,
  onDeleteItem,
}) => {
  const containerClass = `${variant === 'grid' ? 'gcard' : variant === 'list' ? 'row' : 'trow'} ${
    isPinned ? 'pinned' : ''
  }`;

  const renderActionButtons = (compact = false) => (
    <div className="racts" style={{ display: 'flex', alignItems: 'center', gap: compact ? '4px' : '6px' }}>
      <button
        data-act="pin"
        className={`pin-btn ${isPinned ? 'pinned' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(item.id);
        }}
        title={isPinned ? 'Unpin item' : 'Pin item'}
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
          >
            Del
          </button>
        </>
      )}
    </div>
  );

  if (variant === 'grid') {
    return (
      <div
        data-id={item.id}
        className={containerClass}
        onClick={() => onCopyItem(item.t)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '12px',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <span className="rnum" style={{ fontSize: '0.8rem' }}>
            #{item.n}
          </span>
          <span className="rpill" style={getCategoryBadgeStyle(item.c)}>
            {item.c}
          </span>
        </div>

        <div className="rtxt" style={{ fontSize: '0.95rem', marginBottom: '12px', flex: 1 }}>
          {isApprox && <span className="fz">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || item.t }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {renderActionButtons(false)}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        data-id={item.id}
        className={containerClass}
        onClick={() => onCopyItem(item.t)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <span className="rnum" style={{ fontSize: '0.8rem', width: '32px' }}>
            #{item.n}
          </span>
          <div className="rtxt" style={{ fontSize: '0.875rem', flex: 1 }}>
            {isApprox && <span className="fz">≈</span>}
            <span dangerouslySetInnerHTML={{ __html: highlightedText || item.t }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="rpill" style={getCategoryBadgeStyle(item.c)}>
            {item.c}
          </span>
          {renderActionButtons(true)}
        </div>
      </div>
    );
  }

  // Default: variant === 'list'
  return (
    <div
      data-id={item.id}
      className={containerClass}
      onClick={() => onCopyItem(item.t)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span className="rnum" style={{ fontSize: '0.85rem', minWidth: '36px' }}>
          #{item.n}
        </span>
        <div className="rtxt" style={{ fontSize: '0.95rem', flex: 1 }}>
          {isApprox && <span className="fz">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || item.t }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="rpill" style={getCategoryBadgeStyle(item.c)}>
          {item.c}
        </span>
        {renderActionButtons(false)}
      </div>
    </div>
  );
};
