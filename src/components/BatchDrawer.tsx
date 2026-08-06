import React, { useState } from 'react';
import type { DelimiterKey } from '../types/qc.ts';

interface BatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batchQueue: string[];
  onRemoveItem: (index: number) => void;
  onClearBatch: () => void;
  delimiter: DelimiterKey;
  onSetDelimiter: (key: DelimiterKey) => void;
  autoclear: boolean;
  onSetAutoclear: (val: boolean) => void;
  onCopyBatch: () => void;
  onBulkImport: (rawText: string) => void;
}

export const BatchDrawer: React.FC<BatchDrawerProps> = ({
  isOpen,
  onClose,
  batchQueue,
  onRemoveItem,
  onClearBatch,
  delimiter,
  onSetDelimiter,
  autoclear,
  onSetAutoclear,
  onCopyBatch,
  onBulkImport,
}) => {
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleBulkSubmit = () => {
    if (pasteText.trim()) {
      onBulkImport(pasteText);
      setPasteText('');
      setPasteModalOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        id="backdrop"
        className={`drawer-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        style={{
          display: isOpen ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 998,
        }}
      />

      {/* Slide-out Batch Drawer */}
      <div
        id="batchDrawer"
        className={`batch-drawer ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '360px',
          maxWidth: '90vw',
          height: '100vh',
          background: '#ffffff',
          boxShadow: '-2px 0 12px rgba(0,0,0,0.15)',
          zIndex: 999,
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          transition: 'transform 0.25s ease-in-out',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Batch Queue</h3>
            <span id="bbcount" className="badge" style={{ background: '#1971c2', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              {batchQueue.length}
            </span>
          </div>

          <button
            id="bclose"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer', color: '#868e96' }}
          >
            ✕
          </button>
        </div>

        {/* Delimiter & Settings Section */}
        <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="joinSel" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#495057' }}>
              Delimiter:
            </label>
            <select
              id="joinSel"
              value={delimiter}
              onChange={(e) => onSetDelimiter(e.target.value as DelimiterKey)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '0.85rem' }}
            >
              <option value="nl">Newline (\n)</option>
              <option value="comma">Comma (, )</option>
              <option value="semi">Semicolon (; )</option>
              <option value="space">Space ( )</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="autoclear" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#495057', cursor: 'pointer' }}>
              Auto-clear on copy:
            </label>
            <input
              id="autoclear"
              type="checkbox"
              checked={autoclear}
              onChange={(e) => onSetAutoclear(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
          </div>
        </div>

        {/* Queued Items List */}
        <div
          id="blist"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {batchQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#adb5bd', fontSize: '0.9rem' }}>
              No items in batch queue. Click "+ Batch" on wording rows to add.
            </div>
          ) : (
            batchQueue.map((itemText, idx) => (
              <div
                key={idx}
                data-bi={idx}
                className="bitem"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  background: '#f8f9fa',
                  fontSize: '0.875rem',
                }}
              >
                <span className="bt" style={{ flex: 1, fontWeight: 500, color: '#212529', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {itemText}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    data-bc={idx}
                    onClick={async () => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        await navigator.clipboard.writeText(itemText);
                      }
                    }}
                    title="Copy single item"
                    style={{ border: 'none', background: '#e7f5ff', color: '#1971c2', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Copy
                  </button>

                  <button
                    data-rm={idx}
                    onClick={() => onRemoveItem(idx)}
                    title="Remove item"
                    style={{ border: 'none', background: '#ffe3e3', color: '#e03131', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px', borderTop: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            id="bcopy"
            onClick={onCopyBatch}
            disabled={batchQueue.length === 0}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              background: batchQueue.length > 0 ? '#1971c2' : '#adb5bd',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: batchQueue.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Copy Batch (<span id="bcopycount">{batchQueue.length}</span>)
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              id="bclear"
              onClick={onClearBatch}
              disabled={batchQueue.length === 0}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid #ced4da',
                background: '#ffffff',
                color: '#e03131',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: batchQueue.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Clear Queue
            </button>

            <button
              id="bpaste"
              onClick={() => setPasteModalOpen(true)}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid #ced4da',
                background: '#ffffff',
                color: '#495057',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Bulk Paste
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Paste Modal */}
      {pasteModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ background: '#ffffff', width: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Bulk Import Defect Lines</h4>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste defect lines (one per line)..."
              rows={6}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ced4da' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setPasteModalOpen(false)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ced4da', background: '#fff', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleBulkSubmit} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#1971c2', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
