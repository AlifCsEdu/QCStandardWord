import React, { useEffect, useState } from 'react';
import { CATEGORIES } from '../data/qcData.ts';
import type { CategoryKey, QCItem } from '../types/qc.ts';

interface EditModalProps {
  isOpen: boolean;
  editingItem: QCItem | null;
  onSave: (text: string, category: CategoryKey, number: number) => void;
  onClose: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  editingItem,
  onSave,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<CategoryKey>('screen');
  const [number, setNumber] = useState<number>(100);

  useEffect(() => {
    if (editingItem) {
      setText(editingItem.t);
      setCategory(editingItem.c);
      setNumber(editingItem.n);
    } else {
      setText('');
      setCategory('screen');
      setNumber(100);
    }
  }, [editingItem, isOpen]);

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (text.trim()) {
      onSave(text.trim(), category, Number(number) || 100);
    }
  };

  const categoriesOptions = CATEGORIES.filter(
    (c) => c.id !== 'all' && c.id !== 'pinned' && c.id !== 'recent'
  );

  return (
    <div
      id="modal"
      className={`modal-container ${isOpen ? 'open' : ''}`}
      style={{
        display: isOpen ? 'flex' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '420px',
          maxWidth: '90vw',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <h3 id="mtitle" style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 700 }}>
          {editingItem ? `Edit Defect #${editingItem.n}` : 'Add Custom Defect Wording'}
        </h3>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label htmlFor="mtext" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              Wording Text:
            </label>
            <input
              id="mtext"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Screen Scratched Heavy"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ced4da',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="mcat" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                Category:
              </label>
              <select
                id="mcat"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              >
                {categoriesOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: '100px' }}>
              <label htmlFor="mnum" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                Number:
              </label>
              <input
                id="mnum"
                type="number"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              id="mcancel"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #ced4da',
                background: '#ffffff',
                color: '#495057',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="msave"
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#1971c2',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
