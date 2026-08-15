import React from 'react';
import type { QCItem, CustomPinFolder } from '../types/qc.ts';
import { getCategoryLeftBorderStyle, getCategoryBadgeElement } from '../utils/categoryColors.ts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu.tsx';
import { Folder, Check } from 'lucide-react';
import { escapeHtmlItem } from '../utils/searchEngine.ts';

export interface DefectCardProps {
  item: QCItem;
  variant: 'grid' | 'list' | 'table';
  isPinned: boolean;
  isApprox?: boolean;
  highlightedText?: string;
  editMode: boolean;
  onCopyItem: (text: string) => void;
  onTogglePin: (id: string | number) => void;
  onAddToBatch: (text: string) => void;
  onOpenEdit: (item: QCItem) => void;
  onDeleteItem: (item: QCItem) => void;
  folders?: CustomPinFolder[];
  onTogglePinToFolder?: (itemId: string | number, folderId: string) => void;
  isPinnedInFolder?: (itemId: string | number, folderId: string) => boolean;
}

function arePropsEqual(prevProps: Readonly<DefectCardProps>, nextProps: Readonly<DefectCardProps>): boolean {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.t === nextProps.item.t &&
    prevProps.item.c === nextProps.item.c &&
    prevProps.item.n === nextProps.item.n &&
    prevProps.isPinned === nextProps.isPinned &&
    prevProps.isApprox === nextProps.isApprox &&
    prevProps.editMode === nextProps.editMode &&
    prevProps.highlightedText === nextProps.highlightedText &&
    prevProps.variant === nextProps.variant &&
    prevProps.folders === nextProps.folders
  );
}

export const DefectCard: React.FC<DefectCardProps> = React.memo(({
  item,
  variant,
  isPinned,
  isApprox,
  highlightedText,
  editMode,
  onCopyItem,
  onTogglePin,
  onAddToBatch,
  onOpenEdit,
  onDeleteItem,
  folders,
  onTogglePinToFolder,
  isPinnedInFolder,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const copiedTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = React.useCallback(() => {
    onCopyItem(item.t);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setCopied(true);
    copiedTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, 1200);
  }, [item.t, onCopyItem]);

  React.useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const containerClass = `${variant === 'grid' ? 'gcard' : variant === 'list' ? 'row' : 'trow'} ${
    isPinned
      ? 'pinned bg-amber-500/[0.07] border-amber-500/40 shadow-xs'
      : copied
      ? 'bg-emerald-950/20 border-emerald-500/70 ring-2 ring-emerald-500/40 shadow-md'
      : 'bg-card border-border hover:border-border hover:shadow-xs'
  } border-l-4 transition-all duration-150 ease-in-out cursor-pointer rounded-xl text-foreground group select-none touch-manipulation`;

  const borderLeftStyle = getCategoryLeftBorderStyle(item.c);

  const renderActionButtons = (compact = false) => (
    <div
      className="racts flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {folders && folders.length > 1 && onTogglePinToFolder && isPinnedInFolder ? (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              data-act="pin"
              className={`pin-btn min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] ${
                isPinned
                  ? 'pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30 hover:border-amber-400'
                  : 'text-stone-400 hover:text-amber-300 bg-stone-800/80 border-stone-700 hover:bg-amber-500/10 hover:border-amber-400/50'
              } p-2.5 rounded-lg border text-sm flex items-center justify-center gap-1 active:scale-90 transition-all duration-150 cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(item.id);
              }}
              title={isPinned ? 'Unpin item / Select folder' : 'Pin item to folder'}
            >
              <span>{isPinned ? '★' : '☆'}</span>
            </button>
          </DropdownMenuTrigger>
          {dropdownOpen && (
            <DropdownMenuContent className="bg-[#18181b] border-stone-800 text-stone-100 min-w-[160px] shadow-xl">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1 border-b border-stone-800">
                <Folder className="size-3 text-stone-400" />
                <span>Pin to Folders</span>
              </div>
              {folders.map((folder) => {
                const pinnedInThis = isPinnedInFolder(item.id, folder.id);
                return (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => {
                      onTogglePinToFolder(item.id, folder.id);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center justify-between text-xs cursor-pointer hover:bg-stone-800 focus:bg-stone-800 min-h-[36px] py-2"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: folder.color || '#a1a1aa' }} />
                      {folder.name}
                    </span>
                    {pinnedInThis && <span className="text-amber-400 font-bold text-xs">✓</span>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      ) : (
        <button
          data-act="pin"
          className={`pin-btn min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] ${
            isPinned
              ? 'pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30 hover:border-amber-400'
              : 'text-stone-400 hover:text-amber-300 bg-stone-800/80 border-stone-700 hover:bg-amber-500/10 hover:border-amber-400/50'
          } p-2.5 rounded-lg border text-sm flex items-center justify-center active:scale-90 transition-all duration-150 cursor-pointer`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(item.id);
          }}
          title={isPinned ? 'Unpin item' : 'Pin item'}
        >
          {isPinned ? '★' : '☆'}
        </button>
      )}

      <button
        data-act="add"
        className="add-batch-btn min-h-[40px] sm:min-h-[44px] px-3.5 py-2 bg-stone-800/90 border border-stone-700 text-stone-200 hover:bg-stone-700 hover:border-stone-500 hover:text-stone-100 active:scale-95 transition-all duration-150 font-semibold text-xs rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onAddToBatch(item.t);
        }}
        title="Add to batch queue"
      >
        + Batch
      </button>

      {editMode && (
        <>
          <button
            data-act="edit"
            className="edit-item-btn min-h-[40px] sm:min-h-[44px] px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 active:scale-95 transition-all duration-150 font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onOpenEdit(item);
            }}
            title="Edit wording item"
          >
            Edit
          </button>
          <button
            data-act="del"
            className="del-item-btn min-h-[40px] sm:min-h-[44px] px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 active:scale-95 transition-all duration-150 font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item);
            }}
            title="Delete wording item"
          >
            Del
          </button>
        </>
      )}
    </div>
  );

  const renderCopiedBadge = () => (
    <span
      data-testid="inline-copied-badge"
      className="inline-copied-badge inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-in fade-in zoom-in-95 duration-150 shadow-xs"
    >
      <Check className="size-3 stroke-[2.5]" />
      <span>Copied ✓</span>
    </span>
  );

  if (variant === 'grid') {
    return (
      <div
        data-id={item.id}
        className={`${containerClass} flex flex-col justify-between p-4 shadow-xs min-h-[140px]`}
        style={borderLeftStyle}
        onClick={handleCopy}
      >
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-2">
            <span className="rnum font-mono text-[11px] font-bold text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700/80 group-hover:text-stone-100 group-hover:border-stone-500 transition-all shrink-0">
              #{item.n}
            </span>
            {copied && renderCopiedBadge()}
          </div>
          {getCategoryBadgeElement(item.c)}
        </div>

        <div className="rtxt font-sans text-sm font-semibold tracking-tight text-foreground group-hover:text-foreground mb-3 flex-1 leading-relaxed transition-colors">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>

        <div className="flex justify-end pt-2.5 border-t border-border/80">
          {renderActionButtons(false)}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        data-id={item.id}
        className={`${containerClass} flex sm:grid sm:grid-cols-12 items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[48px] sm:min-h-[52px] text-sm shadow-xs transition-colors duration-150 gap-2`}
        style={borderLeftStyle}
        onClick={handleCopy}
      >
        <div className="flex items-center gap-2 sm:col-span-1 shrink-0">
          <span className="rnum font-mono text-[11px] font-bold text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700/80 group-hover:text-stone-100 group-hover:border-stone-500 transition-all shrink-0">
            #{item.n}
          </span>
        </div>
        <div className="rtxt font-sans text-xs sm:text-sm font-semibold tracking-tight text-foreground group-hover:text-foreground flex-1 sm:col-span-7 truncate pr-2 transition-colors">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2 shrink-0">
          {getCategoryBadgeElement(item.c)}
          {copied && renderCopiedBadge()}
        </div>
        <div className="sm:col-span-2 flex justify-end shrink-0">
          {renderActionButtons(true)}
        </div>
      </div>
    );
  }

  // Default: variant === 'list'
  return (
    <div
      data-id={item.id}
      className={`${containerClass} flex items-center justify-between p-3.5 sm:p-4 min-h-[56px] sm:min-h-[64px] shadow-xs gap-3 transition-colors duration-150`}
      style={borderLeftStyle}
      onClick={handleCopy}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <span className="rnum font-mono text-[11px] font-bold text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded border border-stone-700/80 group-hover:text-stone-100 group-hover:border-stone-500 transition-all shrink-0">
          #{item.n}
        </span>
        <div className="rtxt font-sans text-sm font-semibold tracking-tight text-foreground group-hover:text-foreground flex-1 leading-relaxed transition-colors">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {copied && renderCopiedBadge()}
        {getCategoryBadgeElement(item.c)}
        {renderActionButtons(false)}
      </div>
    </div>
  );
}, arePropsEqual);

export default DefectCard;
