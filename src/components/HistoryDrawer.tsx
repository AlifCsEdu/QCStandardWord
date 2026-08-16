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
  Folder,
} from 'lucide-react';
import type { CustomPinFolder, HistoryEntry, HistorySession } from '../types/qc.ts';
import { formatRelativeTime, formatFullDateTime } from '../utils/timeUtils.ts';
import {
  getCategoryBadgeStyle,
  getCategoryLeftBorderStyle,
  getCategoryColor,
  getCategoryIconComponent,
} from '../utils/categoryColors.ts';
import { groupHistoryIntoSessions, filterHistoryEntries } from '../utils/historySessions.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyEntries: HistoryEntry[];
  onCopyEntry: (text: string) => void;
  onCopySessionAll?: (session: HistorySession) => void;
  onAddSessionToBatch?: (session: HistorySession) => void;
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
  onCopySessionAll,
  onAddSessionToBatch,
  onClearHistory,
  onAddToBatch,
  onAddAllToBatch,
  folders,
  onPinToFolder,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);
  const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // Compute available categories with item counts for filter chips
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of historyEntries) {
      const cat = (entry.category || 'general').toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [historyEntries]);

  const categoryChipsList = useMemo(() => {
    const keys = Object.keys(categoryCounts).sort();
    return keys.map((catKey) => ({
      id: catKey,
      count: categoryCounts[catKey],
      color: getCategoryColor(catKey),
      Icon: getCategoryIconComponent(catKey),
    }));
  }, [categoryCounts]);

  // Instant full-text filtering across defect text, category, and item numbers
  const filteredEntries = useMemo(() => {
    return filterHistoryEntries(historyEntries, searchQuery, selectedCategory);
  }, [historyEntries, searchQuery, selectedCategory]);

  // Group filtered history into dynamic time-clustered auto-sessions
  const sessions = useMemo(() => {
    return groupHistoryIntoSessions(filteredEntries);
  }, [filteredEntries]);

  // Copy single history entry handler with feedback
  const handleCopyEntry = (entry: HistoryEntry) => {
    onCopyEntry(entry.text);
    setCopiedEntryId(entry.id);
    setTimeout(() => {
      setCopiedEntryId((cur) => (cur === entry.id ? null : cur));
    }, 1200);
  };

  // Copy all entries in a session
  const handleCopySession = (session: HistorySession) => {
    if (onCopySessionAll) {
      onCopySessionAll(session);
    } else {
      const joined = session.entries.map((e) => e.text).join('\n');
      onCopyEntry(joined);
    }
    setCopiedSessionId(session.id);
    setTimeout(() => {
      setCopiedSessionId((cur) => (cur === session.id ? null : cur));
    }, 1200);
  };

  // Add entire session to batch queue
  const handleAddSessionToBatch = (session: HistorySession) => {
    if (onAddSessionToBatch) {
      onAddSessionToBatch(session);
    } else {
      onAddAllToBatch(session.entries);
    }
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
          className="history-drawer w-full sm:max-w-lg md:max-w-xl bg-[#22222a] border-stone-700/60 text-stone-100 p-0 flex flex-col h-full shadow-2xl"
        >
          {/* Drawer Header (Layer 3 Warm Charcoal) */}
          <div className="p-4 sm:p-5 border-b border-stone-700/60 bg-[#22222a] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="size-5 text-stone-300" />
                <SheetTitle className="text-base sm:text-lg font-bold text-stone-100 tracking-tight">
                  Inspection History
                </SheetTitle>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-800/90 text-stone-300 border border-stone-700/80">
                  {historyEntries.length}
                </span>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2 pr-6">
                <Button
                  id="haddAllBatch"
                  data-testid="history-add-all-batch"
                  variant="outline"
                  size="sm"
                  disabled={filteredEntries.length === 0}
                  onClick={() => onAddAllToBatch(filteredEntries)}
                  className="min-h-[44px] h-11 px-3.5 text-xs bg-[#1a1a20] border-stone-700/80 text-stone-200 hover:bg-[#141418] hover:text-emerald-300 gap-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                  title="Add all shown history to batch queue"
                >
                  <Layers className="size-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Add All to Batch</span>
                </Button>

                <Button
                  id="hclearAll"
                  data-testid="clear-history-btn"
                  variant="outline"
                  size="sm"
                  disabled={historyEntries.length === 0}
                  onClick={() => setConfirmClearOpen(true)}
                  className="min-h-[44px] h-11 px-3 text-xs bg-[#1a1a20] border-stone-700/80 text-stone-400 hover:text-rose-400 hover:bg-[#141418] rounded-lg active:scale-95 transition-all cursor-pointer"
                  title="Clear history"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Full-Text Instant Search Input */}
            <div className="relative">
              <Input
                type="text"
                data-testid="history-search-input"
                placeholder="Search history records or defect codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-[44px] h-11 pl-9 pr-9 text-xs sm:text-sm bg-[#141418] border-stone-800/80 text-stone-100 placeholder:text-stone-500 rounded-lg focus-visible:ring-1 focus-visible:ring-stone-600"
              />
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="min-h-[44px] min-w-[44px] size-11 absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 flex items-center justify-center cursor-pointer active:scale-95 transition-all rounded"
                  title="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* In-Drawer Category Filter Chips */}
            <div
              id="hcatchips"
              data-testid="history-category-chips"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin pt-0.5"
            >
              <button
                type="button"
                data-testid="history-cat-chip-all"
                data-cat="all"
                onClick={() => setSelectedCategory('all')}
                className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  selectedCategory === 'all'
                    ? 'bg-stone-800 text-stone-100 border-stone-600 shadow-xs'
                    : 'bg-[#141418] text-stone-400 border-stone-800/80 hover:text-stone-200 hover:bg-[#1a1a20]'
                }`}
              >
                <span>All</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded-full bg-stone-900/60 text-stone-400 border border-stone-800">
                  {historyEntries.length}
                </span>
              </button>

              {categoryChipsList.map(({ id, count, color, Icon }) => {
                const isSelected = selectedCategory === id;
                return (
                  <button
                    key={id}
                    type="button"
                    data-testid={`history-cat-chip-${id}`}
                    data-cat={id}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : id)}
                    className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-stone-800 text-stone-100 border-stone-600 shadow-xs'
                        : 'bg-[#141418] text-stone-400 border-stone-800/80 hover:text-stone-200 hover:bg-[#1a1a20]'
                    }`}
                  >
                    <Icon className="size-3 shrink-0" style={{ color }} />
                    <span className="capitalize">{id}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded-full bg-stone-900/60 text-stone-400 border border-stone-800">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Body: Time-Clustered Auto-Sessions Timeline */}
          <div id="histlist" className="flex-1 overflow-y-auto p-4 space-y-4 touch-scroll">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-500 space-y-2">
                <Clock className="size-8 stroke-1" />
                <span className="text-sm font-medium">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'No matching history entries found.'
                    : 'No copy history yet.'}
                </span>
                <span className="text-xs text-stone-600 max-w-xs text-center">
                  Wordings copied from defect cards or batch queue will appear here clustered into auto-sessions.
                </span>
              </div>
            ) : (
              sessions.map((session) => {
                const isSessionCopied = copiedSessionId === session.id;

                return (
                  <div
                    key={session.id}
                    data-testid="history-session-group"
                    className="session-card bg-[#1a1a20] rounded-xl border border-stone-800/80 p-3.5 space-y-3 shadow-xs"
                  >
                    {/* Session Header */}
                    <div className="flex items-center justify-between border-b border-stone-800/60 pb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {session.isCurrentSession ? (
                          <span
                            className="size-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"
                            title="Current Active Session"
                          />
                        ) : (
                          <Clock className="size-3.5 text-stone-400 shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm font-bold text-stone-200 font-sans tracking-tight truncate">
                          {session.title}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700/80 shrink-0">
                          {session.entries.length}{' '}
                          {session.entries.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Session Level Bulk Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          data-testid="copy-session-btn"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopySession(session)}
                          className={`min-h-[44px] h-11 px-3.5 text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer ${
                            isSessionCopied
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-[#141418] border border-stone-800/80 text-stone-300 hover:text-stone-100 hover:bg-[#22222a]'
                          }`}
                          title="Copy all defects in this session"
                        >
                          {isSessionCopied ? (
                            <>
                              <Check className="size-3 mr-1 text-white" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3 mr-1 text-stone-400" />
                              <span>Copy All</span>
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          data-testid="add-session-batch-btn"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddSessionToBatch(session)}
                          className="min-h-[44px] h-11 px-3.5 text-xs font-semibold rounded-lg bg-[#141418] border border-stone-800/80 text-stone-300 hover:text-emerald-300 hover:bg-[#22222a] transition-all active:scale-95 cursor-pointer"
                          title="Add session items to batch queue"
                        >
                          <Layers className="size-3 mr-1 text-emerald-400" />
                          <span>+ Batch</span>
                        </Button>
                      </div>
                    </div>

                    {/* Session Entries List (Recessed Layer 0/1 #141418) */}
                    <div className="space-y-2">
                      {session.entries.map((entry) => {
                        const isEntryCopied = copiedEntryId === entry.id;
                        const leftBorderStyle = entry.category
                          ? getCategoryLeftBorderStyle(entry.category)
                          : undefined;

                        return (
                          <div
                            key={entry.id}
                            data-testid="history-entry"
                            className="hitem p-3 bg-[#141418] hover:bg-[#1a1a20] rounded-lg border border-stone-800/70 transition-all space-y-2 group select-none"
                            style={leftBorderStyle}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div
                                data-testid="history-text"
                                className="htxt text-xs sm:text-sm font-medium text-stone-200 leading-snug flex-1 select-text"
                              >
                                {entry.text}
                              </div>

                              {/* 1-Click Re-Copy Button */}
                              <Button
                                type="button"
                                data-act="copy"
                                size="sm"
                                variant={isEntryCopied ? 'default' : 'outline'}
                                onClick={() => handleCopyEntry(entry)}
                                className={`min-h-[44px] h-11 px-3.5 text-xs font-semibold transition-all shrink-0 rounded-lg cursor-pointer active:scale-95 ${
                                  isEntryCopied
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-[#1a1a20] border-stone-700/80 text-stone-300 hover:bg-[#22222a] hover:text-stone-100'
                                }`}
                              >
                                {isEntryCopied ? (
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

                            {/* Metadata & Quick Actions Row */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/60 text-[11px] text-stone-400">
                              <div className="flex items-center gap-2 flex-wrap">
                                {typeof entry.itemNumber === 'number' && (
                                  <span className="rnum font-mono text-[10px] font-bold text-stone-300 bg-stone-800/90 px-1.5 py-0.5 rounded border border-stone-700/80">
                                    #{entry.itemNumber}
                                  </span>
                                )}

                                {entry.category && (
                                  <span
                                    className="rpill uppercase text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                                    style={getCategoryBadgeStyle(entry.category)}
                                  >
                                    {entry.category}
                                  </span>
                                )}

                                <span
                                  data-testid="history-time"
                                  title={formatFullDateTime(entry.timestamp)}
                                  className="htime flex items-center gap-1 font-mono text-[10px] sm:text-[11px]"
                                >
                                  <Clock className="size-3 text-stone-500" />
                                  <span>{formatRelativeTime(entry.timestamp)}</span>
                                </span>

                                {entry.source === 'batch' && (
                                  <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.2 rounded font-mono border border-stone-700/80">
                                    Batch
                                  </span>
                                )}
                              </div>

                              {/* Secondary Actions: Add to Batch & Pin to Folder */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onAddToBatch(entry.text)}
                                  className="min-h-[44px] min-w-[44px] size-11 p-2 rounded-lg text-stone-400 hover:text-emerald-400 hover:bg-[#1a1a20] transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                                  title="Add to Batch Queue"
                                >
                                  <Layers className="size-4" />
                                </button>

                                {folders.length > 0 && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        className="min-h-[44px] min-w-[44px] size-11 p-2 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-[#1a1a20] transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                                        title="Pin to Folder"
                                      >
                                        <Star className="size-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="bg-[#22222a] border-stone-700/60 text-stone-200 rounded-xl min-w-[160px] shadow-2xl"
                                    >
                                      <div className="px-2 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1 border-b border-stone-700/60">
                                        <Folder className="size-3 text-stone-400" />
                                        <span>Pin to Folders</span>
                                      </div>
                                      {folders.map((f) => (
                                        <DropdownMenuItem
                                          key={f.id}
                                          onClick={() => onPinToFolder(entry.text, f.id)}
                                          className="text-xs cursor-pointer flex items-center gap-2 hover:bg-[#1a1a20] focus:bg-[#1a1a20] min-h-[44px] py-2 rounded-lg"
                                        >
                                          <span
                                            className="size-2 rounded-xs"
                                            style={{ backgroundColor: f.color || '#a1a1aa' }}
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
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog for Clear History */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="max-w-md bg-[#22222a] border-stone-700/60 text-stone-100 p-6 rounded-xl shadow-2xl">
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
              type="button"
              variant="ghost"
              onClick={() => setConfirmClearOpen(false)}
              className="min-h-[44px] h-11 px-4 text-xs text-stone-400 hover:text-stone-200 rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              id="confirmClearHistory"
              data-testid="confirm-clear-history-btn"
              data-confirm="true"
              onClick={handleConfirmClear}
              className="min-h-[44px] h-11 px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer"
            >
              Clear All History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
