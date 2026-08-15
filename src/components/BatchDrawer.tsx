import React, { useState } from 'react';
import {
  Copy as IconCopy,
  Trash2 as IconTrash,
  FileInput as IconFileImport,
  X as IconX,
  ArrowUp,
  ArrowDown,
  Layers as IconLayers,
  Sparkles,
} from 'lucide-react';
import type { DelimiterKey } from '../types/qc.ts';
import { Button } from './ui/button.tsx';
import { Textarea } from './ui/textarea.tsx';
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

interface DelimiterOption {
  key: DelimiterKey;
  display: string;
  label: string;
  name: string;
  title: string;
}

const DELIMITER_OPTIONS: DelimiterOption[] = [
  { key: 'nl', display: '\\n', label: 'Line', name: 'Newline', title: 'Newline (\\n)' },
  { key: 'comma', display: ',', label: 'Comma', name: 'Comma', title: 'Comma (, )' },
  { key: 'semi', display: ';', label: 'Semi', name: 'Semicolon', title: 'Semicolon (; )' },
  { key: 'space', display: '␣', label: 'Space', name: 'Space', title: 'Space ( )' },
  { key: 'pipe', display: '|', label: 'Pipe', name: 'Pipe', title: 'Pipe ( | )' },
  { key: 'bullet', display: '•', label: 'Bullet', name: 'Bullet', title: 'Bullet ( • )' },
];

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
  const [copiedItemIndex, setCopiedItemIndex] = useState<number | null>(null);

  const handleBulkSubmit = () => {
    if (pasteText.trim()) {
      onBulkImport(pasteText);
      setPasteText('');
      setPasteModalOpen(false);
    }
  };

  const handleCopySingle = async (itemText: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(itemText);
      setCopiedItemIndex(idx);
      setTimeout(() => {
        setCopiedItemIndex((curr) => (curr === idx ? null : curr));
      }, 1200);
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
        } fixed top-0 right-0 w-[420px] max-w-[92vw] h-full bg-[#18181b] border-l border-stone-800 z-[999] flex flex-col p-4 sm:p-5 gap-4 box-border overflow-hidden shadow-2xl transition-transform duration-300 ease-out touch-manipulation`}
      >
        {/* Top Header Controls Bar */}
        <div className="flex justify-between items-center border-b border-stone-800 pb-3.5 shrink-0 min-h-[48px]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-stone-800/80 border border-stone-700/60 text-stone-300">
              <IconLayers className="size-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-stone-100 tracking-tight">
                Batch Queue
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
          </div>
          <Button
            id="bclose"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close batch drawer"
            className="text-stone-400 hover:text-stone-100 hover:bg-stone-800 min-h-[44px] min-w-[44px] size-11 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
          >
            <IconX className="size-5" />
          </Button>
        </div>

        {/* Settings Section: Delimiter & Auto-clear */}
        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950/80 flex flex-col gap-3.5 shadow-inner shrink-0">
          {/* Segmented Delimiter Control */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="joinSel" className="text-xs font-semibold text-stone-300">
                Join Delimiter:
              </label>
              <span className="text-[11px] font-mono text-stone-400">
                {DELIMITER_OPTIONS.find((o) => o.key === delimiter)?.name || 'Newline'}
              </span>
            </div>

            {/* Sleek Segmented Control Tabs */}
            <div className="grid grid-cols-6 gap-1 bg-stone-900 border border-stone-800 p-1 rounded-lg">
              {DELIMITER_OPTIONS.map((opt) => {
                const isActive = delimiter === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    title={opt.title}
                    onClick={() => onSetDelimiter(opt.key)}
                    className={`min-h-[44px] py-2 px-1 rounded-md text-xs font-mono text-center flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                      isActive
                        ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700 shadow-xs'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 border border-transparent'
                    }`}
                  >
                    <span className="text-xs leading-none">{opt.display}</span>
                    <span className="text-[9px] opacity-75 font-sans truncate w-full mt-0.5">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Strictly PRESERVED select element for 100% test harness compatibility */}
            <select
              id="joinSel"
              name="delimiter"
              data-testid="delimiter-select"
              value={delimiter}
              onChange={(e) => onSetDelimiter(e.target.value as DelimiterKey)}
              className="sr-only"
              aria-label="Delimiter selector fallback"
            >
              <option value="nl">Newline (\n)</option>
              <option value="comma">Comma (, )</option>
              <option value="semi">Semicolon (; )</option>
              <option value="space">Space ( )</option>
              <option value="pipe">Pipe ( | )</option>
              <option value="bullet">Bullet ( • )</option>
            </select>
          </div>

          {/* Auto-clear Toggle */}
          <div className="flex justify-between items-center gap-2 pt-1 border-t border-stone-800/80 min-h-[44px]">
            <label
              htmlFor="autoclear"
              className="text-xs font-medium text-stone-300 cursor-pointer select-none"
            >
              Auto-clear queue on copy:
            </label>
            <input
              id="autoclear"
              name="autoclear"
              data-testid="autoclear-checkbox"
              type="checkbox"
              checked={autoclear}
              onChange={(e) => onSetAutoclear(e.target.checked)}
              className="size-5 rounded border-stone-700 bg-stone-900 accent-stone-300 cursor-pointer focus:ring-stone-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Queued Items List */}
        <div
          id="blist"
          className="flex-1 overflow-y-auto flex flex-col gap-2.5 min-h-[160px] pr-0.5 touch-scroll"
        >
          {batchQueue.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-stone-800 rounded-xl text-stone-500 text-xs flex flex-col items-center justify-center gap-2 my-auto">
              <div className="p-3 rounded-full bg-stone-800/50 border border-stone-800 text-stone-400">
                <Sparkles className="size-5" />
              </div>
              <p className="font-semibold text-stone-300 text-sm">Batch Queue Empty</p>
              <p className="text-stone-400 max-w-[240px]">
                Click "+ Batch" on defect wording cards to collect items for quick multi-copy.
              </p>
            </div>
          ) : (
            batchQueue.map((itemText, idx) => (
              <div
                key={idx}
                data-bi={idx}
                data-testid="batch-item"
                className="bitem group p-3 rounded-xl border border-stone-800 bg-stone-950 hover:border-stone-700 flex items-center justify-between gap-2.5 transition-all duration-150 shadow-xs min-h-[52px]"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="font-mono text-[11px] font-semibold text-stone-400 w-4 text-right shrink-0">
                    {idx + 1}.
                  </span>
                  <span
                    className="bt flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-stone-200 group-hover:text-stone-100 select-text"
                    data-testid="batch-item-text"
                    title={itemText}
                  >
                    {itemText}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Reorder Up Button */}
                  <button
                    type="button"
                    className="bup min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] p-2.5 rounded-lg border border-stone-700 text-xs font-bold transition-all duration-150 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-90 text-stone-300 bg-stone-800 hover:bg-stone-700 hover:border-stone-600 hover:text-stone-100 cursor-pointer"
                    data-mvup={idx}
                    data-mup={idx}
                    data-up={idx}
                    data-act="moveup"
                    data-testid={`move-up-${idx}`}
                    disabled={idx === 0}
                    onClick={() => handleMoveUp?.(idx)}
                    title="Move Up"
                    aria-label={`Move item ${idx + 1} up`}
                  >
                    <ArrowUp className="size-4" />
                  </button>

                  {/* Reorder Down Button */}
                  <button
                    type="button"
                    className="bdn min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] p-2.5 rounded-lg border border-stone-700 text-xs font-bold transition-all duration-150 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-90 text-stone-300 bg-stone-800 hover:bg-stone-700 hover:border-stone-600 hover:text-stone-100 cursor-pointer"
                    data-mvdn={idx}
                    data-mdown={idx}
                    data-down={idx}
                    data-act="movedown"
                    data-testid={`move-down-${idx}`}
                    disabled={idx === batchQueue.length - 1}
                    onClick={() => handleMoveDown?.(idx)}
                    title="Move Down"
                    aria-label={`Move item ${idx + 1} down`}
                  >
                    <ArrowDown className="size-4" />
                  </button>

                  {/* Single Item Copy Button */}
                  <button
                    type="button"
                    data-bc={idx}
                    className="bcopy-item min-h-[40px] sm:min-h-[44px] border border-stone-700 bg-stone-800 hover:bg-stone-700 hover:text-stone-100 text-stone-300 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    onClick={() => handleCopySingle(itemText, idx)}
                    title="Copy single item"
                    aria-label={`Copy item: ${itemText}`}
                  >
                    <IconCopy className="size-3.5" />
                    <span>{copiedItemIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>

                  {/* Remove Item Button */}
                  <button
                    type="button"
                    data-rm={idx}
                    data-testid={`remove-batch-item-${idx}`}
                    className="brm-item min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 p-2.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-90 cursor-pointer flex items-center justify-center"
                    onClick={() => onRemoveItem(idx)}
                    title="Remove item"
                    aria-label={`Remove item: ${itemText}`}
                  >
                    <IconX className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-col gap-2.5 border-t border-stone-800 pt-3.5 shrink-0">
          {/* Prominent High-Contrast Copy All Button */}
          <Button
            id="bcopy"
            data-testid="copy-batch-btn"
            onClick={onCopyBatch}
            disabled={batchQueue.length === 0}
            className="w-full bg-stone-100 hover:bg-white text-stone-900 font-bold text-sm gap-2 min-h-[48px] h-12 shadow-sm transition-all duration-150 rounded-lg flex items-center justify-center cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IconCopy className="size-4" />
            <span>
              Copy Batch (<span id="bcopycount">{batchQueue.length}</span>)
            </span>
          </Button>

          {/* Secondary Actions: Clear Queue & Bulk Paste */}
          <div className="flex gap-2">
            <Button
              id="bclear"
              data-testid="clear-batch-btn"
              variant="destructive"
              size="sm"
              onClick={onClearBatch}
              disabled={batchQueue.length === 0}
              className="flex-1 bg-rose-950/40 border border-rose-800/60 text-rose-400 hover:bg-rose-900/60 hover:text-rose-300 transition-all duration-150 active:scale-95 min-h-[44px] h-11 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IconTrash className="size-4" />
              Clear Queue
            </Button>

            <Button
              id="bpaste"
              variant="outline"
              size="sm"
              onClick={() => setPasteModalOpen(true)}
              className="flex-1 bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700 hover:text-stone-100 transition-all duration-150 active:scale-95 min-h-[44px] h-11 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <IconFileImport className="size-4" />
              Bulk Paste
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Paste Dialog */}
      <Dialog open={pasteModalOpen} onOpenChange={setPasteModalOpen}>
        <DialogContent className="bg-[#18181b] border border-stone-800 text-stone-100 max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-stone-100 flex items-center gap-2">
              <IconFileImport className="size-4 text-stone-300" />
              Bulk Import Defect Lines
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste defect lines (one per line)..."
              rows={6}
              className="w-full bg-stone-950 border border-stone-800 text-stone-100 text-sm focus-visible:ring-stone-600 font-mono rounded-lg p-3"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setPasteModalOpen(false)}
              className="min-h-[44px] h-11 px-4 bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 cursor-pointer rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkSubmit}
              className="min-h-[44px] h-11 px-5 bg-stone-100 text-stone-900 font-semibold hover:bg-white shadow-xs cursor-pointer rounded-lg"
            >
              Import Lines
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
