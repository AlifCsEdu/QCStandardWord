import React from 'react';
import type { QCItem, CustomPinFolder } from '../types/qc.ts';
import { getCategoryBadgeStyle, getCategoryLeftBorderStyle, getCategoryIconComponent } from '../utils/categoryColors.ts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu.tsx';
import { Folder } from 'lucide-react';
import { escapeHtml } from '../utils/searchEngine.ts';

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

export const DefectCard: React.FC<DefectCardProps> = ({
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
  const containerClass = `${variant === 'grid' ? 'gcard' : variant === 'list' ? 'row' : 'trow'} ${
    isPinned ? 'pinned' : ''
  } border-l-4 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer rounded-lg text-zinc-100`;

  const borderLeftStyle = getCategoryLeftBorderStyle(item.c);
  const CategoryIcon = getCategoryIconComponent(item.c);

  const renderActionButtons = (compact = false) => (
    <div className="racts flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {folders && folders.length > 0 && onTogglePinToFolder && isPinnedInFolder ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-act="pin"
              className={`pin-btn ${isPinned ? 'pinned text-amber-400 font-bold' : 'text-zinc-400 hover:text-amber-300'} px-2 py-1 rounded bg-zinc-800/80 border border-zinc-700/60 hover:bg-zinc-700 text-xs flex items-center gap-1 transition-colors`}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(item.id);
              }}
              title={isPinned ? 'Unpin item / Select folder' : 'Pin item to folder'}
            >
              <span>{isPinned ? '★' : '☆'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-100 min-w-[160px]">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Folder className="size-3 text-cyan-400" />
              <span>Pin to Folders</span>
            </div>
            {folders.map((folder) => {
              const pinnedInThis = isPinnedInFolder(item.id, folder.id);
              return (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => onTogglePinToFolder(item.id, folder.id)}
                  className="flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: folder.color || '#06b6d4' }} />
                    {folder.name}
                  </span>
                  {pinnedInThis && <span className="text-amber-400 font-bold text-xs">✓</span>}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          data-act="pin"
          className={`pin-btn ${isPinned ? 'pinned text-amber-400 font-bold' : 'text-zinc-400 hover:text-amber-300'} px-2 py-1 rounded bg-zinc-800/80 border border-zinc-700/60 hover:bg-zinc-700 text-xs transition-colors`}
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
        className="add-batch-btn bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 px-2 py-1 rounded text-xs font-medium transition-colors"
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
            className="edit-item-btn bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 px-2 py-1 rounded text-xs font-medium transition-colors"
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
            className="del-item-btn bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 px-2 py-1 rounded text-xs font-medium transition-colors"
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
        className={`${containerClass} flex flex-col justify-between p-3.5 shadow-sm`}
        style={borderLeftStyle}
        onClick={() => onCopyItem(item.t)}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="rnum text-xs font-mono text-zinc-400">
            #{item.n}
          </span>
          <span
            className="rpill text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
            style={getCategoryBadgeStyle(item.c)}
          >
            <CategoryIcon className="size-3" />
            <span>{item.c}</span>
          </span>
        </div>

        <div className="rtxt text-sm text-zinc-100 mb-3 flex-1 leading-relaxed">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtml(item.t) }} />
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800/50">
          {renderActionButtons(false)}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        data-id={item.id}
        className={`${containerClass} flex items-center justify-between px-3 py-2 text-sm shadow-sm`}
        style={borderLeftStyle}
        onClick={() => onCopyItem(item.t)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
          <span className="rnum text-xs font-mono text-zinc-400 w-8 shrink-0">
            #{item.n}
          </span>
          <div className="rtxt text-xs sm:text-sm text-zinc-100 flex-1 truncate">
            {isApprox && <span className="fz font-bold text-amber-400 mr-1">≈</span>}
            <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtml(item.t) }} />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="rpill text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
            style={getCategoryBadgeStyle(item.c)}
          >
            <CategoryIcon className="size-3" />
            <span className="hidden sm:inline">{item.c}</span>
          </span>
          {renderActionButtons(true)}
        </div>
      </div>
    );
  }

  // Default: variant === 'list'
  return (
    <div
      data-id={item.id}
      className={`${containerClass} flex items-center justify-between p-3.5 shadow-sm gap-3`}
      style={borderLeftStyle}
      onClick={() => onCopyItem(item.t)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="rnum text-xs font-mono text-zinc-400 min-w-[36px] shrink-0">
          #{item.n}
        </span>
        <div className="rtxt text-sm text-zinc-100 flex-1">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtml(item.t) }} />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className="rpill text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
          style={getCategoryBadgeStyle(item.c)}
        >
          <CategoryIcon className="size-3" />
          <span>{item.c}</span>
        </span>
        {renderActionButtons(false)}
      </div>
    </div>
  );
};

