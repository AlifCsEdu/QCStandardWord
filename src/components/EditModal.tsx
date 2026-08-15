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
        className={`modal-container ${isOpen ? 'block' : 'hidden'}`}
      >
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-w-md">
            <DialogHeader>
              <DialogTitle id="mtitle" className="text-lg font-bold text-stone-100">
                {editingItem ? `Edit Defect #${editingItem.n}` : 'Add Custom Defect Wording'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
              <div>
                <label htmlFor="mtext" className="block mb-1.5 text-xs font-semibold text-stone-300">
                  Wording Text:
                </label>
                <Input
                  id="mtext"
                  data-testid="modal-text-input"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Screen Scratched Heavy"
                  className="w-full bg-stone-950 border-stone-800 text-stone-100 text-sm focus-visible:ring-stone-600"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="mcat" className="block mb-1.5 text-xs font-semibold text-stone-300">
                    Category:
                  </label>
                  <select
                    id="mcat"
                    data-testid="modal-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryKey)}
                    className="w-full h-9 px-3 py-1 rounded-md border border-stone-800 bg-stone-950 text-stone-100 text-sm focus:outline-none focus:ring-1 focus:ring-stone-600"
                  >
                    {categoriesOptions.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <label htmlFor="mnum" className="block mb-1.5 text-xs font-semibold text-stone-300">
                    Number:
                  </label>
                  <Input
                    id="mnum"
                    data-testid="modal-num-input"
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-stone-950 border-stone-800 text-stone-100 text-sm focus-visible:ring-stone-600"
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
                  className="bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  id="msave"
                  data-testid="modal-save-btn"
                  onClick={handleSave}
                  className="bg-stone-100 text-stone-900 font-bold hover:bg-white"
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

