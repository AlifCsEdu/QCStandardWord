import React from 'react';
import type { QCItem, CustomPinFolder } from '../types/qc.ts';
import { getCategoryLeftBorderStyle, getCategoryBadgeElement } from '../utils/categoryColors.ts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu.tsx';
import { Folder } from 'lucide-react';
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
  const containerClass = `${variant === 'grid' ? 'gcard' : variant === 'list' ? 'row' : 'trow'} ${
    isPinned ? 'pinned bg-amber-500/[0.06] border-amber-500/40 shadow-xs' : 'bg-stone-900 border-stone-800 hover:border-stone-700 hover:shadow-xs'
  } border-l-4 transition-all duration-150 ease-in-out cursor-pointer rounded-xl text-stone-100 group`;

  const borderLeftStyle = getCategoryLeftBorderStyle(item.c);

  const renderActionButtons = (compact = false) => (
    <div className="racts flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {folders && folders.length > 1 && onTogglePinToFolder && isPinnedInFolder ? (
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              data-act="pin"
              className={`pin-btn ${
                isPinned
                  ? 'pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40'
                  : 'text-stone-400 hover:text-amber-300 bg-stone-800 border-stone-700 hover:bg-amber-500/10 hover:border-amber-400/50'
              } px-2.5 py-1 rounded-md border text-xs flex items-center gap-1 transition-all duration-150`}
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
            <DropdownMenuContent className="bg-stone-900 border-stone-800 text-stone-100 min-w-[160px] shadow-xl">
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
                    className="flex items-center justify-between text-xs cursor-pointer hover:bg-stone-800 focus:bg-stone-800"
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
          className={`pin-btn ${
            isPinned
              ? 'pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40'
              : 'text-stone-400 hover:text-amber-300 bg-stone-800 border-stone-700 hover:bg-amber-500/10 hover:border-amber-400/50'
          } px-2.5 py-1 rounded-md border text-xs transition-all duration-150`}
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
        className="add-batch-btn bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700 hover:border-stone-600 hover:text-stone-100 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1"
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
            className="edit-item-btn bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700 hover:border-stone-600 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1"
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
            className="del-item-btn bg-rose-950/40 border border-rose-800/60 text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1"
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

  if (variant === 'grid') {
    return (
      <div
        data-id={item.id}
        className={`${containerClass} flex flex-col justify-between p-4 shadow-xs`}
        style={borderLeftStyle}
        onClick={() => onCopyItem(item.t)}
      >
        <div className="flex justify-between items-center mb-2.5">
          <span className="rnum font-mono text-xs font-bold text-stone-400 group-hover:text-stone-200 transition-colors">
            #{item.n}
          </span>
          {getCategoryBadgeElement(item.c)}
        </div>

        <div className="rtxt font-sans text-sm font-semibold tracking-tight text-stone-100 mb-3 flex-1 leading-relaxed">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>

        <div className="flex justify-end pt-2.5 border-t border-stone-800">
          {renderActionButtons(false)}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        data-id={item.id}
        className={`${containerClass} flex sm:grid sm:grid-cols-12 items-center justify-between px-3.5 sm:px-4 py-2.5 text-sm shadow-xs transition-colors duration-150 gap-2`}
        style={borderLeftStyle}
        onClick={() => onCopyItem(item.t)}
      >
        <span className="rnum font-mono text-xs font-bold text-stone-400 group-hover:text-stone-200 transition-colors sm:col-span-1 shrink-0">
          #{item.n}
        </span>
        <div className="rtxt font-sans text-xs sm:text-sm font-semibold tracking-tight text-stone-100 flex-1 sm:col-span-7 truncate pr-2">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>

        <div className="sm:col-span-2 flex items-center shrink-0">
          {getCategoryBadgeElement(item.c)}
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
      className={`${containerClass} flex items-center justify-between p-3.5 sm:p-4 shadow-xs gap-3 transition-colors duration-150`}
      style={borderLeftStyle}
      onClick={() => onCopyItem(item.t)}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <span className="rnum font-mono text-xs font-bold text-stone-400 group-hover:text-stone-200 transition-colors min-w-[38px] shrink-0">
          #{item.n}
        </span>
        <div className="rtxt font-sans text-sm font-semibold tracking-tight text-stone-100 flex-1 leading-relaxed">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtmlItem(item) }} />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {getCategoryBadgeElement(item.c)}
        {renderActionButtons(false)}
      </div>
    </div>
  );
}, arePropsEqual);

export default DefectCard;
