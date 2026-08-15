import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from './ui/sheet.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.tsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu.tsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import {
  History,
  Copy,
  Check,
  Trash2,
  Layers,
  Search,
  X,
  Star,
  Clock,
} from 'lucide-react';
import type { CustomPinFolder, HistoryEntry } from '../types/qc.ts';
import { formatRelativeTime, formatFullDateTime } from '../utils/timeUtils.ts';
import { getCategoryBadgeStyle, getCategoryLeftBorderStyle } from '../utils/categoryColors.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyEntries: HistoryEntry[];
  onCopyEntry: (text: string) => void;
  onClearHistory: () => void;
  onAddToBatch: (text: string) => void;
  onAddAllToBatch: (entries: HistoryEntry[]) => void;
  folders: CustomPinFolder[];
  onPinToFolder: (text: string, folderId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyEntries,
  onCopyEntry,
  onClearHistory,
  onAddToBatch,
  onAddAllToBatch,
  folders,
  onPinToFolder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter history entries by instant search
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return historyEntries;
    return historyEntries.filter(
      (e) =>
        e.text.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q))
    );
  }, [historyEntries, searchQuery]);

  const handleCopy = (entry: HistoryEntry) => {
    onCopyEntry(entry.text);
    setCopiedId(entry.id);
    setTimeout(() => {
      setCopiedId((cur) => (cur === entry.id ? null : cur));
    }, 1200);
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setConfirmClearOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          id="historyDrawer"
          data-testid="history-drawer"
          className="history-drawer w-full sm:max-w-lg md:max-w-xl bg-[#18181b] border-stone-800 text-stone-100 p-0 flex flex-col h-full"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-800 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="size-5 text-stone-300" />
                <SheetTitle className="text-base sm:text-lg font-bold text-stone-100">
                  Inspection History
                </SheetTitle>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  {historyEntries.length}
                </span>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2 pr-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filteredEntries.length === 0}
                  onClick={() => onAddAllToBatch(filteredEntries)}
                  className="min-h-[40px] h-10 px-3 text-xs bg-stone-950 border-stone-800 text-stone-200 hover:bg-stone-800 gap-1.5 rounded-lg"
                  title="Add all shown history to batch queue"
                >
                  <Layers className="size-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Add All to Batch</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={historyEntries.length === 0}
                  onClick={() => setConfirmClearOpen(true)}
                  className="min-h-[40px] h-10 px-3 text-xs bg-stone-950 border-stone-800 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg"
                  title="Clear history"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search history records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-[44px] h-11 pl-9 pr-9 text-xs sm:text-sm bg-stone-950 border-stone-800 text-stone-100 placeholder:text-stone-500 rounded-lg"
              />
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="min-h-[36px] min-w-[36px] absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Drawer Body: History Feed */}
          <div id="histlist" className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y-0 touch-scroll">
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-500 space-y-2">
                <Clock className="size-8 stroke-1" />
                <span className="text-sm font-medium">
                  {searchQuery ? 'No matching history entries found.' : 'No copy history yet.'}
                </span>
                <span className="text-xs text-stone-600">
                  Wordings copied from defect cards or batch queue will appear here.
                </span>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const isCopied = copiedId === entry.id;
                const leftBorderStyle = entry.category
                  ? getCategoryLeftBorderStyle(entry.category)
                  : undefined;

                return (
                  <div
                    key={entry.id}
                    data-testid="history-entry"
                    className="hitem p-3.5 bg-stone-950/70 hover:bg-stone-950 rounded-lg border border-stone-800/90 transition-all space-y-2.5"
                    style={leftBorderStyle}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        data-testid="history-text"
                        className="htxt text-xs sm:text-sm font-medium text-stone-200 leading-snug flex-1 select-text"
                      >
                        {entry.text}
                      </div>

                      {/* 1-Click Copy Action */}
                      <Button
                        size="sm"
                        variant={isCopied ? 'default' : 'outline'}
                        onClick={() => handleCopy(entry)}
                        className={`min-h-[40px] h-10 px-3 text-xs font-semibold transition-all shrink-0 rounded-lg cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="size-3.5 mr-1 text-white" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 mr-1" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Metadata & Quick Actions Strip */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-900 text-[11px] text-stone-400">
                      <div className="flex items-center gap-2">
                        {entry.category && (
                          <span
                            className="rpill uppercase text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                            style={getCategoryBadgeStyle(entry.category)}
                          >
                            {entry.category}
                          </span>
                        )}
                        <span
                          data-testid="history-time"
                          title={formatFullDateTime(entry.timestamp)}
                          className="htime flex items-center gap-1 font-mono"
                        >
                          <Clock className="size-3 text-stone-500" />
                          <span>{formatRelativeTime(entry.timestamp)}</span>
                        </span>
                        {entry.source === 'batch' && (
                          <span className="text-[10px] bg-stone-800/80 text-stone-400 px-1.5 py-0.2 rounded font-mono">
                            Batch
                          </span>
                        )}
                      </div>

                      {/* Secondary Actions: Add to Batch & Pin to Folder */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onAddToBatch(entry.text)}
                          className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-stone-400 hover:text-emerald-400 hover:bg-stone-800 transition-colors flex items-center justify-center cursor-pointer"
                          title="Add to Batch Queue"
                        >
                          <Layers className="size-4" />
                        </button>

                        {folders.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors flex items-center justify-center cursor-pointer"
                                title="Pin to Folder"
                              >
                                <Star className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#18181b] border-stone-800 text-stone-200"
                            >
                              {folders.map((f) => (
                                <DropdownMenuItem
                                  key={f.id}
                                  onClick={() => onPinToFolder(entry.text, f.id)}
                                  className="text-xs cursor-pointer flex items-center gap-2 hover:bg-stone-800 min-h-[36px] py-2"
                                >
                                  <span
                                    className="size-2 rounded-xs"
                                    style={{ backgroundColor: f.color }}
                                  />
                                  <span>{f.name}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Radix Confirmation Dialog for Clear History */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="max-w-md bg-[#18181b] border-stone-800 text-stone-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-400">
              <Trash2 className="size-5" />
              <span>Clear Inspection History?</span>
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-sm">
              This will permanently remove all {historyEntries.length} inspection history records from local storage. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setConfirmClearOpen(false)}
              className="min-h-[44px] h-11 px-4 text-xs text-stone-400 hover:text-stone-200 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmClear}
              className="min-h-[44px] h-11 px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
            >
              Clear All History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
