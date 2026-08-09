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
      {/* Backdrop overlay for backward compatibility and glassmorphic styling */}
      <div
        id="backdrop"
        data-testid="drawer-overlay"
        className={`drawer-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        style={{
          display: isOpen ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 9, 11, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 998,
        }}
      />

      {/* Slide-out Batch Drawer container with glassmorphic styling */}
      <div
        id="batchDrawer"
        data-testid="batch-drawer"
        className={`batch-drawer ${isOpen ? 'open' : ''} fixed top-0 right-0 w-[380px] max-w-[90vw] h-full bg-zinc-900/95 backdrop-blur-md border-l border-zinc-800 z-[999] flex flex-col p-4 gap-4 box-border overflow-y-auto shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          display: isOpen ? 'flex' : 'none',
        }}
      >
        {/* Top Header Controls Bar */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-zinc-100">
              Batch Queue & Operations
            </span>
            <span
              id="bbcount"
              className="bg-cyan-500 text-zinc-950 px-2 py-0.5 rounded-full text-xs font-bold"
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
            className="text-zinc-400 hover:text-zinc-100 h-8 w-8"
          >
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Settings Section: Delimiter & Auto-clear */}
        <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <label htmlFor="joinSel" className="text-xs font-semibold text-zinc-200">
              Delimiter:
            </label>
            <select
              id="joinSel"
              name="delimiter"
              data-testid="delimiter-select"
              value={delimiter}
              onChange={(e) => onSetDelimiter(e.target.value as DelimiterKey)}
              className="px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="nl">Newline (\n)</option>
              <option value="comma">Comma (, )</option>
              <option value="semi">Semicolon (; )</option>
              <option value="space">Space ( )</option>
              <option value="pipe">Pipe ( | )</option>
              <option value="bullet">Bullet ( • )</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <label htmlFor="autoclear" className="text-xs font-semibold text-zinc-200 cursor-pointer">
              Auto-clear on copy:
            </label>
            <input
              id="autoclear"
              data-testid="autoclear-checkbox"
              type="checkbox"
              checked={autoclear}
              onChange={(e) => onSetAutoclear(e.target.checked)}
              className="size-4 rounded border-zinc-800 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Queued Items List */}
        <div
          id="blist"
          className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[200px]"
        >
          {batchQueue.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No items in batch queue. Click "+ Batch" on wording rows to add.
            </div>
          ) : (
            batchQueue.map((itemText, idx) => (
              <div
                key={idx}
                data-bi={idx}
                data-testid="batch-item"
                className="bitem p-2.5 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-2"
              >
                <span className="bt flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-zinc-200">
                  {itemText}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    className="bup px-1.5 py-0.5 rounded border border-zinc-800 text-xs font-bold transition-colors"
                    data-mvup={idx}
                    data-mup={idx}
                    data-up={idx}
                    data-act="moveup"
                    data-testid={`move-up-${idx}`}
                    disabled={idx === 0}
                    onClick={() => handleMoveUp?.(idx)}
                    title="Move Up"
                    style={{
                      background: idx === 0 ? 'rgba(39, 39, 42, 0.4)' : 'rgba(6, 182, 212, 0.1)',
                      color: idx === 0 ? '#64748b' : '#38bdf8',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ▲
                  </button>

                  <button
                    className="bdn px-1.5 py-0.5 rounded border border-zinc-800 text-xs font-bold transition-colors"
                    data-mvdn={idx}
                    data-mdown={idx}
                    data-down={idx}
                    data-act="movedown"
                    data-testid={`move-down-${idx}`}
                    disabled={idx === batchQueue.length - 1}
                    onClick={() => handleMoveDown?.(idx)}
                    title="Move Down"
                    style={{
                      background: idx === batchQueue.length - 1 ? 'rgba(39, 39, 42, 0.4)' : 'rgba(6, 182, 212, 0.1)',
                      color: idx === batchQueue.length - 1 ? '#64748b' : '#38bdf8',
                      cursor: idx === batchQueue.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ▼
                  </button>

                  <button
                    data-bc={idx}
                    className="bcopy-item border border-cyan-500/30 bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 px-2 py-0.5 rounded text-xs font-semibold cursor-pointer"
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
                    className="brm-item border border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25 px-2 py-0.5 rounded text-xs font-semibold cursor-pointer"
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
        <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
          <Button
            id="bcopy"
            data-testid="copy-batch-btn"
            onClick={onCopyBatch}
            disabled={batchQueue.length === 0}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm gap-2 h-10"
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
              className="flex-1 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 gap-1.5 h-9"
            >
              <IconTrash className="size-3.5" />
              Clear Queue
            </Button>

            <Button
              id="bpaste"
              variant="outline"
              size="sm"
              onClick={() => setPasteModalOpen(true)}
              className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-800 gap-1.5 h-9"
            >
              <IconFileImport className="size-3.5" />
              Bulk Paste
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Paste Dialog */}
      <Dialog open={pasteModalOpen} onOpenChange={setPasteModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-100">
              Bulk Import Defect Lines
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste defect lines (one per line)..."
              rows={6}
              className="w-full bg-zinc-950 border-zinc-800 text-zinc-100 text-sm focus-visible:ring-cyan-500"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPasteModalOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkSubmit}
              className="bg-cyan-500 text-zinc-950 font-semibold hover:bg-cyan-400"
            >
              Import Lines
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

