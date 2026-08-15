import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  X,
  Sliders,
} from 'lucide-react';
import type { CategoryInfo } from '../types/qc.ts';
import {
  CURATED_CATEGORY_ICONS,
  renderCategoryIcon,
  getCategoryBadgeStyle,
} from '../utils/categoryColors.ts';

const PRESET_COLORS = [
  '#78716c',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
];

const PRESET_EMOJIS = [
  '📱',
  '🔋',
  '🔍',
  '⚡',
  '💧',
  '🛠️',
  '🔒',
  '🏷️',
  '🖥️',
  '📷',
  '✨',
  '🎧',
  '📦',
  '⚙️',
  '⚠️',
  '🎯',
];

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  categoryOrder: string[];
  onAddCategory: (category: Omit<CategoryInfo, 'id'> & { id?: string }) => string;
  onUpdateCategory: (id: string, updates: Partial<CategoryInfo>) => void;
  onDeleteCategory: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onAddSubCode: (categoryId: string, code: string) => void;
  onRemoveSubCode: (categoryId: string, code: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  categoryOrder,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onMoveUp,
  onMoveDown,
  onAddSubCode,
  onRemoveSubCode,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [iconType, setIconType] = useState<'lucide' | 'emoji'>('lucide');
  const [iconValue, setIconValue] = useState('Tag');
  const [newSubCode, setNewSubCode] = useState('');

  // Sorted categories excluding system views (all, pinned, recent)
  const sortedCategories = React.useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]));
    const result: CategoryInfo[] = [];
    for (const id of categoryOrder) {
      const cat = map.get(id);
      if (cat) result.push(cat);
    }
    for (const cat of categories) {
      if (!categoryOrder.includes(cat.id)) result.push(cat);
    }
    return result.filter((c) => c.id !== 'all' && c.id !== 'pinned' && c.id !== 'recent');
  }, [categories, categoryOrder]);

  const activeEditCategory = React.useMemo(() => {
    return categories.find((c) => c.id === editingCatId) || null;
  }, [categories, editingCatId]);

  const handleStartEdit = (cat: CategoryInfo) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setDesc(cat.desc || '');
    setColor(cat.color || '#3b82f6');
    setIconType(cat.iconType || 'lucide');
    setIconValue(cat.iconValue || 'Tag');
  };

  const handleStartCreate = () => {
    setEditingCatId('__new__');
    setName('');
    setDesc('');
    setColor('#3b82f6');
    setIconType('lucide');
    setIconValue('Tag');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCatId === '__new__') {
      onAddCategory({
        name: name.trim(),
        desc: desc.trim(),
        color,
        iconType,
        iconValue,
        subCodes: [],
      });
    } else if (editingCatId) {
      onUpdateCategory(editingCatId, {
        name: name.trim(),
        desc: desc.trim(),
        color,
        iconType,
        iconValue,
      });
    }
    setEditingCatId(null);
  };

  const handleAddSubCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode.trim() || !editingCatId || editingCatId === '__new__') return;
    onAddSubCode(editingCatId, newSubCode.trim().toUpperCase());
    setNewSubCode('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="category-manager-modal"
        className="max-w-3xl bg-[#18181b] border-stone-800 text-stone-100 p-6 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
            <Sliders className="size-5 text-stone-300" />
            <span>Category & Sub-Category Manager</span>
          </DialogTitle>
          <DialogDescription className="text-stone-400 text-xs sm:text-sm">
            Customize defect categories, hybrid icons (Lucide or Emoji), color accents, order, and sub-category codes.
          </DialogDescription>
        </DialogHeader>

        {editingCatId ? (
          /* Category Edit / Create Form */
          <form onSubmit={handleSave} className="space-y-5 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-sm font-semibold text-stone-200">
                {editingCatId === '__new__' ? 'Create New Category' : `Edit Category: ${activeEditCategory?.name}`}
              </h3>
              {/* Live Preview Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Live Preview:</span>
                <span
                  className="rpill text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5"
                  style={getCategoryBadgeStyle('', color)}
                >
                  {renderCategoryIcon({ iconType, iconValue, id: editingCatId })}
                  <span>{name || 'Preview Name'}</span>
                </span>
              </div>
            </div>

            {/* Inputs: Name & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Category Name *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Display Panel, Thermal Issues"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-[44px] h-11 text-sm bg-stone-950 border-stone-800 text-stone-100 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Description</label>
                <Input
                  type="text"
                  placeholder="Short description of defect types"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="min-h-[44px] h-11 text-sm bg-stone-950 border-stone-800 text-stone-100 rounded-lg"
                />
              </div>
            </div>

            {/* Hybrid Icon Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-300">Category Iconography</label>
                <div className="flex bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setIconType('lucide')}
                    className={`min-h-[36px] px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      iconType === 'lucide'
                        ? 'bg-stone-800 text-stone-100 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Lucide Icons (24)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconType('emoji')}
                    className={`min-h-[36px] px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      iconType === 'emoji'
                        ? 'bg-stone-800 text-stone-100 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Custom Emoji
                  </button>
                </div>
              </div>

              {iconType === 'lucide' ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-stone-950 rounded-lg border border-stone-800 max-h-44 overflow-y-auto">
                  {CURATED_CATEGORY_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = iconValue === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIconValue(item.name)}
                        title={item.label}
                        className={`min-h-[44px] flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-stone-800 border-stone-400 text-stone-100 ring-2 ring-stone-400'
                            : 'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                        }`}
                      >
                        <IconComp className="size-5" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIconValue(emoji)}
                        className={`min-h-[44px] min-w-[44px] size-11 text-lg flex items-center justify-center rounded-lg border transition-transform cursor-pointer ${
                          iconValue === emoji
                            ? 'bg-stone-800 border-stone-400 scale-110 ring-2 ring-stone-400'
                            : 'bg-stone-900 border-stone-800 hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Custom Emoji:</span>
                    <Input
                      type="text"
                      maxLength={4}
                      value={iconValue}
                      onChange={(e) => setIconValue(e.target.value)}
                      placeholder="e.g. 🛠️"
                      className="w-24 min-h-[40px] h-10 bg-stone-900 border-stone-800 text-center text-base"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color Accent Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300">Accent Color</label>
              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`min-h-[36px] min-w-[36px] size-9 rounded-full border border-stone-700 transition-transform cursor-pointer ${
                      color === hex ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                    }`}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-stone-400 font-mono">Hex:</span>
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="w-28 min-h-[40px] h-10 font-mono text-xs bg-stone-950 border-stone-800 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Category Codes Section (for existing categories) */}
            {editingCatId !== '__new__' && activeEditCategory && (
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <label className="text-xs font-semibold text-stone-300">Sub-Category Codes</label>
                <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2.5 bg-stone-950 rounded-lg border border-stone-800">
                  {!activeEditCategory.subCodes || activeEditCategory.subCodes.length === 0 ? (
                    <span className="text-xs text-stone-500 italic">No sub-category codes defined.</span>
                  ) : (
                    activeEditCategory.subCodes.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-800 text-stone-200 text-xs font-mono border border-stone-700"
                      >
                        <span>{code}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveSubCode(activeEditCategory.id, code)}
                          className="hover:text-rose-400 cursor-pointer p-0.5"
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    type="text"
                    placeholder="Add sub-code (e.g. FCPB, TOP)..."
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="min-h-[44px] h-11 text-xs bg-stone-950 border-stone-800 font-mono rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSubCodeSubmit}
                    disabled={!newSubCode.trim()}
                    className="min-h-[44px] h-11 px-4 text-xs bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg"
                  >
                    Add Code
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingCatId(null)}
                className="min-h-[44px] h-11 px-4 text-xs text-stone-400 hover:text-stone-200 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-h-[44px] h-11 px-6 text-xs font-semibold bg-stone-100 hover:bg-white text-stone-900 rounded-lg"
              >
                Save Category
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Categories List & Management View */
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Defect Categories ({sortedCategories.length})
              </span>
              <Button
                onClick={handleStartCreate}
                size="sm"
                className="min-h-[44px] h-11 px-4 text-xs font-semibold bg-stone-100 hover:bg-white text-stone-900 flex items-center gap-1.5 rounded-lg"
              >
                <Plus className="size-4" />
                <span>Add Category</span>
              </Button>
            </div>

            <div className="divide-y divide-stone-800/80 border border-stone-800 rounded-lg overflow-hidden bg-stone-950/60">
              {sortedCategories.map((cat, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === sortedCategories.length - 1;

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-stone-900/60 transition-colors min-h-[52px]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="size-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="flex items-center gap-2">
                        {renderCategoryIcon(cat, { className: 'size-4 text-stone-300' })}
                        <span className="font-semibold text-sm text-stone-200 truncate">{cat.name}</span>
                        {cat.isDefault && (
                          <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded font-mono">
                            Default
                          </span>
                        )}
                        {cat.subCodes && cat.subCodes.length > 0 && (
                          <span className="text-[10px] bg-stone-800/90 text-stone-300 px-1.5 py-0.5 rounded font-mono border border-stone-700/60">
                            {cat.subCodes.length} codes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => onMoveUp(cat.id)}
                        className="min-h-[40px] min-w-[40px] p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                        title="Move Up"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => onMoveDown(cat.id)}
                        className="min-h-[40px] min-w-[40px] p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                        title="Move Down"
                      >
                        <ArrowDown className="size-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="min-h-[40px] min-w-[40px] p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 cursor-pointer ml-1 flex items-center justify-center"
                        title="Edit Category"
                      >
                        <Pencil className="size-4" />
                      </button>

                      {/* Delete Button (if not default/system) */}
                      {!cat.isDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}"?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="min-h-[40px] min-w-[40px] p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 cursor-pointer flex items-center justify-center"
                          title="Delete Category"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
