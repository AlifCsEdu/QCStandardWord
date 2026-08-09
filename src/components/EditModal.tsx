import React, { useEffect, useState } from 'react';
import { CATEGORIES } from '../data/qcData.ts';
import type { CategoryKey, QCItem } from '../types/qc.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';

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
    <>
      {/* Container wrapper for backward compatibility with tests querying #modal */}
      <div
        id="modal"
        data-testid="edit-modal"
        className={`modal-container ${isOpen ? 'open' : ''}`}
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md">
            <DialogHeader>
              <DialogTitle id="mtitle" className="text-lg font-bold text-zinc-100">
                {editingItem ? `Edit Defect #${editingItem.n}` : 'Add Custom Defect Wording'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
              <div>
                <label htmlFor="mtext" className="block mb-1.5 text-xs font-semibold text-zinc-300">
                  Wording Text:
                </label>
                <Input
                  id="mtext"
                  data-testid="modal-text-input"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Screen Scratched Heavy"
                  className="w-full bg-zinc-950 border-zinc-800 text-zinc-100 text-sm focus-visible:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="mcat" className="block mb-1.5 text-xs font-semibold text-zinc-300">
                    Category:
                  </label>
                  <select
                    id="mcat"
                    data-testid="modal-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryKey)}
                    className="w-full h-9 px-3 py-1 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {categoriesOptions.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <label htmlFor="mnum" className="block mb-1.5 text-xs font-semibold text-zinc-300">
                    Number:
                  </label>
                  <Input
                    id="mnum"
                    data-testid="modal-num-input"
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-zinc-950 border-zinc-800 text-zinc-100 text-sm focus-visible:ring-cyan-500"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  id="mcancel"
                  data-testid="modal-cancel-btn"
                  variant="outline"
                  onClick={onClose}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  id="msave"
                  data-testid="modal-save-btn"
                  onClick={handleSave}
                  className="bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

