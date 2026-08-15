import React, { useState } from 'react';
import { Copy as IconCopy, Trash2 as IconTrash, FileInput as IconFileImport, X as IconX, ArrowUp, ArrowDown } from 'lucide-react';
import type { DelimiterKey } from '../types/qc.ts';
import { Button } from './ui/button.tsx';
import { Checkbox } from './ui/checkbox.tsx';
import { Textarea } from './ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog.tsx';

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
  onMoveItemUp?: (index: number) => void;
  onMoveItemDown?: (index: number) => void;
  moveBatchItemUp?: (index: number) => void;
  moveBatchItemDown?: (index: number) => void;
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
  onMoveItemUp,
  onMoveItemDown,
  moveBatchItemUp,
  moveBatchItemDown,
}) => {
  const handleMoveUp = onMoveItemUp || moveBatchItemUp;
  const handleMoveDown = onMoveItemDown || moveBatchItemDown;
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
      {/* Backdrop overlay for backward compatibility and solid styling */}
      <div
        id="backdrop"
        data-testid="drawer-overlay"
        className={`drawer-backdrop ${isOpen ? 'block' : 'hidden'} fixed inset-0 bg-black/60 transition-opacity duration-200 z-[998]`}
        onClick={onClose}
      />

      {/* Slide-out Batch Drawer container with solid Warm Stone styling */}
      <div
        id="batchDrawer"
        data-testid="batch-drawer"
        className={`batch-drawer ${
          isOpen ? 'open translate-x-0' : 'translate-x-full'
        } fixed top-0 right-0 w-[400px] max-w-[90vw] h-full bg-stone-900 border-l border-stone-800 z-[999] flex flex-col p-4 sm:p-5 gap-4 box-border overflow-y-auto shadow-2xl transition-transform duration-300 ease-out`}
      >
        {/* Top Header Controls Bar */}
        <div className="flex justify-between items-center border-b border-stone-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm sm:text-base text-stone-100 tracking-tight">
              Batch Queue & Operations
            </span>
            <span
              id="bbcount"
              className="bg-stone-800 text-stone-300 border border-stone-700 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
            >
              {batchQueue.length}
            </span>
            <span
              id="bcount"
              data-testid="batch-count"
              className="hidden"
            >
              {batchQueue.length}
            </span>
          </div>
          <Button
            id="bclose"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-100 hover:bg-stone-800 h-8 w-8 rounded-lg"
          >
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Settings Section: Delimiter & Auto-clear */}
        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 flex flex-col gap-3 shadow-inner">
          <div className="flex justify-between items-center gap-2">
            <label htmlFor="joinSel" className="text-xs font-semibold text-stone-300">
              Delimiter:
            </label>
            <select
              id="joinSel"
              name="delimiter"
              data-testid="delimiter-select"
              value={delimiter}
              onChange={(e) => onSetDelimiter(e.target.value as DelimiterKey)}
              className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 text-stone-200 text-xs font-medium focus:outline-none focus:border-stone-700 cursor-pointer transition-colors"
            >
              <option value="nl">Newline (\n)</option>
              <option value="comma">Comma (, )</option>
              <option value="semi">Semicolon (; )</option>
              <option value="space">Space ( )</option>
              <option value="pipe">Pipe ( | )</option>
              <option value="bullet">Bullet ( • )</option>
            </select>
          </div>

          <div className="flex justify-between items-center gap-2">
            <label htmlFor="autoclear" className="text-xs font-semibold text-stone-300 cursor-pointer">
              Auto-clear on copy:
            </label>
            <input
              id="autoclear"
              data-testid="autoclear-checkbox"
              type="checkbox"
              checked={autoclear}
              onChange={(e) => onSetAutoclear(e.target.checked)}
              className="size-4 rounded border-stone-700 bg-stone-900 accent-stone-400 cursor-pointer focus:ring-stone-500/30"
            />
          </div>
        </div>

        {/* Queued Items List */}
        <div
          id="blist"
          className="flex-1 overflow-y-auto flex flex-col gap-2.5 min-h-[200px] pr-0.5"
        >
          {batchQueue.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-stone-800 rounded-xl text-stone-500 text-xs flex flex-col items-center justify-center gap-2 my-auto">
              <p className="font-semibold text-stone-400">Batch Queue Empty</p>
              <p className="text-stone-500">Click "+ Batch" on defect cards to add items for batch copy.</p>
            </div>
          ) : (
            batchQueue.map((itemText, idx) => (
              <div
                key={idx}
                data-bi={idx}
                data-testid="batch-item"
                className="bitem p-3 rounded-xl border border-stone-800 bg-stone-950 hover:border-stone-700 flex items-center justify-between gap-2.5 transition-all duration-150 shadow-xs"
              >
                <span className="bt flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-stone-200">
                  {itemText}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="bup p-1.5 rounded-md border border-stone-700 text-xs font-bold transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 bg-stone-800 hover:bg-stone-700 hover:border-stone-600"
                    data-mvup={idx}
                    data-mup={idx}
                    data-up={idx}
                    data-act="moveup"
                    data-testid={`move-up-${idx}`}
                    disabled={idx === 0}
                    onClick={() => handleMoveUp?.(idx)}
                    title="Move Up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>

                  <button
                    className="bdn p-1.5 rounded-md border border-stone-700 text-xs font-bold transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed text-stone-300 bg-stone-800 hover:bg-stone-700 hover:border-stone-600"
                    data-mvdn={idx}
                    data-mdown={idx}
                    data-down={idx}
                    data-act="movedown"
                    data-testid={`move-down-${idx}`}
                    disabled={idx === batchQueue.length - 1}
                    onClick={() => handleMoveDown?.(idx)}
                    title="Move Down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>

                  <button
                    data-bc={idx}
                    className="bcopy-item border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer"
                    onClick={async () => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        await navigator.clipboard.writeText(itemText);
                      }
                    }}
                    title="Copy single item"
                  >
                    Copy
                  </button>

                  <button
                    data-rm={idx}
                    data-testid={`remove-batch-item-${idx}`}
                    className="brm-item border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer"
                    onClick={() => onRemoveItem(idx)}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-col gap-2.5 border-t border-stone-800 pt-3.5">
          <Button
            id="bcopy"
            data-testid="copy-batch-btn"
            onClick={onCopyBatch}
            disabled={batchQueue.length === 0}
            className="w-full bg-stone-100 hover:bg-white text-stone-900 font-bold text-sm gap-2 h-10 shadow-xs transition-all duration-150 rounded-lg flex items-center justify-center cursor-pointer"
          >
            <IconCopy className="size-4" />
            <span>Copy Batch (<span id="bcopycount">{batchQueue.length}</span>)</span>
          </Button>

          <div className="flex gap-2">
            <Button
              id="bclear"
              data-testid="clear-batch-btn"
              variant="destructive"
              size="sm"
              onClick={onClearBatch}
              disabled={batchQueue.length === 0}
              className="flex-1 bg-rose-950/40 border border-rose-800/60 text-rose-400 hover:bg-rose-900/60 transition-all h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <IconTrash className="size-3.5" />
              Clear Queue
            </Button>

            <Button
              id="bpaste"
              variant="outline"
              size="sm"
              onClick={() => setPasteModalOpen(true)}
              className="flex-1 bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700 transition-all h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <IconFileImport className="size-3.5" />
              Bulk Paste
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Paste Dialog */}
      <Dialog open={pasteModalOpen} onOpenChange={setPasteModalOpen}>
        <DialogContent className="bg-stone-900 border border-stone-800 text-stone-100 max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-stone-100">
              Bulk Import Defect Lines
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste defect lines (one per line)..."
              rows={6}
              className="w-full bg-stone-950 border border-stone-800 text-stone-100 text-sm focus-visible:ring-stone-600"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPasteModalOpen(false)}
              className="bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkSubmit}
              className="bg-stone-100 text-stone-900 font-semibold hover:bg-white shadow-xs"
            >
              Import Lines
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

