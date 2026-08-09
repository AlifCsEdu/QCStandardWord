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
        className={`drawer-backdrop ${isOpen ? 'show' : ''} fixed inset-0 bg-zinc-950/80 backdrop-blur-xl transition-opacity duration-200 z-[998]`}
        onClick={onClose}
        style={{
          display: isOpen ? 'block' : 'none',
        }}
      />

      {/* Slide-out Batch Drawer container with glassmorphic styling */}
      <div
        id="batchDrawer"
        data-testid="batch-drawer"
        className={`batch-drawer ${
          isOpen ? 'open translate-x-0' : 'translate-x-full'
        } fixed top-0 right-0 w-[400px] max-w-[90vw] h-full bg-[#0c0e12]/90 backdrop-blur-2xl border-l border-white/[0.08] z-[999] flex flex-col p-4 sm:p-5 gap-4 box-border overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out`}
        style={{
          display: isOpen ? 'flex' : 'none',
        }}
      >
        {/* Top Header Controls Bar */}
        <div className="flex justify-between items-center border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm sm:text-base text-zinc-100 tracking-tight">
              Batch Queue & Operations
            </span>
            <span
              id="bbcount"
              className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
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
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 h-8 w-8 rounded-lg"
          >
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Settings Section: Delimiter & Auto-clear */}
        <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#12151c]/80 flex flex-col gap-3 shadow-inner">
          <div className="flex justify-between items-center gap-2">
            <label htmlFor="joinSel" className="text-xs font-semibold text-zinc-300">
              Delimiter:
            </label>
            <select
              id="joinSel"
              name="delimiter"
              data-testid="delimiter-select"
              value={delimiter}
              onChange={(e) => onSetDelimiter(e.target.value as DelimiterKey)}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/90 text-zinc-200 text-xs font-medium focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-colors"
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
            <label htmlFor="autoclear" className="text-xs font-semibold text-zinc-300 cursor-pointer">
              Auto-clear on copy:
            </label>
            <input
              id="autoclear"
              data-testid="autoclear-checkbox"
              type="checkbox"
              checked={autoclear}
              onChange={(e) => onSetAutoclear(e.target.checked)}
              className="size-4 rounded border-zinc-700 bg-zinc-900 accent-cyan-500 cursor-pointer focus:ring-cyan-500/30"
            />
          </div>
        </div>

        {/* Queued Items List */}
        <div
          id="blist"
          className="flex-1 overflow-y-auto flex flex-col gap-2.5 min-h-[200px] pr-0.5"
        >
          {batchQueue.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-800/80 rounded-xl text-zinc-500 text-xs flex flex-col items-center justify-center gap-2 my-auto">
              <p className="font-semibold text-zinc-400">Batch Queue Empty</p>
              <p className="text-zinc-500">Click "+ Batch" on defect cards to add items for batch copy.</p>
            </div>
          ) : (
            batchQueue.map((itemText, idx) => (
              <div
                key={idx}
                data-bi={idx}
                data-testid="batch-item"
                className="bitem p-3 rounded-xl border border-white/[0.08] bg-[#12151c]/90 hover:border-cyan-500/30 flex items-center justify-between gap-2.5 transition-all duration-150 shadow-sm"
              >
                <span className="bt flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-zinc-200">
                  {itemText}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="bup p-1.5 rounded-md border border-white/[0.08] text-xs font-bold transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-500/40"
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
                    className="bdn p-1.5 rounded-md border border-white/[0.08] text-xs font-bold transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-500/40"
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
                    className="bcopy-item border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer"
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
                    className="brm-item border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer"
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
        <div className="flex flex-col gap-2.5 border-t border-white/[0.08] pt-3.5">
          <Button
            id="bcopy"
            data-testid="copy-batch-btn"
            onClick={onCopyBatch}
            disabled={batchQueue.length === 0}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm gap-2 h-10 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-150 rounded-lg flex items-center justify-center"
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
              className="flex-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-400 transition-all h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <IconTrash className="size-3.5" />
              Clear Queue
            </Button>

            <Button
              id="bpaste"
              variant="outline"
              size="sm"
              onClick={() => setPasteModalOpen(true)}
              className="flex-1 bg-zinc-900 border border-white/[0.08] text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 transition-all h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <IconFileImport className="size-3.5" />
              Bulk Paste
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Paste Dialog */}
      <Dialog open={pasteModalOpen} onOpenChange={setPasteModalOpen}>
        <DialogContent className="bg-[#0c0e12] border border-white/[0.08] text-zinc-100 max-w-md shadow-2xl backdrop-blur-2xl">
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
              className="w-full bg-zinc-950/90 border border-white/[0.08] text-zinc-100 text-sm focus-visible:ring-cyan-500"
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
              className="bg-cyan-500 text-zinc-950 font-semibold hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            >
              Import Lines
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

