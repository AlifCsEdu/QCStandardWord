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
    isPinned ? 'pinned bg-amber-500/[0.06] border-amber-500/40 shadow-[0_0_15px_rgba(245,159,0,0.15)]' : 'bg-[#0c0e12] border-white/[0.08] hover:border-cyan-500/50 hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.25)]'
  } border-l-4 transition-all duration-150 ease-in-out cursor-pointer rounded-xl text-zinc-100 group backdrop-blur-md`;

  const borderLeftStyle = getCategoryLeftBorderStyle(item.c);
  const CategoryIcon = getCategoryIconComponent(item.c);

  const renderActionButtons = (compact = false) => (
    <div className="racts flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {folders && folders.length > 0 && onTogglePinToFolder && isPinnedInFolder ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-act="pin"
              className={`pin-btn ${
                isPinned
                  ? 'pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,159,0,0.2)]'
                  : 'text-zinc-400 hover:text-amber-300 bg-zinc-900/80 border-white/[0.08] hover:bg-amber-500/10 hover:border-amber-400/50'
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
          <DropdownMenuContent className="bg-[#0c0e12] border-white/[0.08] text-zinc-100 min-w-[160px] shadow-xl backdrop-blur-xl">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1 border-b border-white/[0.08]">
              <Folder className="size-3 text-cyan-400" />
              <span>Pin to Folders</span>
            </div>
            {folders.map((folder) => {
              const pinnedInThis = isPinnedInFolder(item.id, folder.id);
              return (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => onTogglePinToFolder(item.id, folder.id)}
                  className="flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-800/80 focus:bg-zinc-800/80"
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
          className={`pin-btn ${
            isPinned
              ? 'pinned text-amber-400 font-bold bg-amber-500/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,159,0,0.2)]'
              : 'text-zinc-400 hover:text-amber-300 bg-zinc-900/80 border-white/[0.08] hover:bg-amber-500/10 hover:border-amber-400/50'
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
        className="add-batch-btn bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 hover:border-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1"
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
            className="edit-item-btn bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400 hover:text-indigo-100 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1"
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
            className="del-item-btn bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 hover:border-rose-400 hover:text-rose-200 transition-all duration-150 font-semibold text-xs rounded-md px-2.5 py-1 flex items-center gap-1"
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
        className={`${containerClass} flex flex-col justify-between p-4 shadow-sm`}
        style={borderLeftStyle}
        onClick={() => onCopyItem(item.t)}
      >
        <div className="flex justify-between items-center mb-2.5">
          <span className="rnum font-mono text-xs font-bold text-zinc-400 group-hover:text-cyan-400 transition-colors">
            #{item.n}
          </span>
          <span
            className="rpill text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-transform hover:scale-105"
            style={getCategoryBadgeStyle(item.c)}
          >
            <CategoryIcon className="size-3.5" />
            <span>{item.c}</span>
          </span>
        </div>

        <div className="rtxt font-sans text-sm font-semibold tracking-tight text-zinc-100 mb-3 flex-1 leading-relaxed">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtml(item.t) }} />
        </div>

        <div className="flex justify-end pt-2.5 border-t border-white/[0.06]">
          {renderActionButtons(false)}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        data-id={item.id}
        className={`${containerClass} flex items-center justify-between px-3.5 py-2.5 text-sm shadow-sm transition-colors duration-150`}
        style={borderLeftStyle}
        onClick={() => onCopyItem(item.t)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
          <span className="rnum font-mono text-xs font-bold text-zinc-400 group-hover:text-cyan-400 transition-colors w-9 shrink-0">
            #{item.n}
          </span>
          <div className="rtxt font-sans text-xs sm:text-sm font-semibold tracking-tight text-zinc-100 flex-1 truncate">
            {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
            <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtml(item.t) }} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className="rpill text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-transform hover:scale-105"
            style={getCategoryBadgeStyle(item.c)}
          >
            <CategoryIcon className="size-3.5" />
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
      className={`${containerClass} flex items-center justify-between p-3.5 sm:p-4 shadow-sm gap-3 transition-colors duration-150`}
      style={borderLeftStyle}
      onClick={() => onCopyItem(item.t)}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <span className="rnum font-mono text-xs font-bold text-zinc-400 group-hover:text-cyan-400 transition-colors min-w-[38px] shrink-0">
          #{item.n}
        </span>
        <div className="rtxt font-sans text-sm font-semibold tracking-tight text-zinc-100 flex-1 leading-relaxed">
          {isApprox && <span className="fz font-bold text-amber-400 mr-1.5">≈</span>}
          <span dangerouslySetInnerHTML={{ __html: highlightedText || escapeHtml(item.t) }} />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className="rpill text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-transform hover:scale-105"
          style={getCategoryBadgeStyle(item.c)}
        >
          <CategoryIcon className="size-3.5" />
          <span>{item.c}</span>
        </span>
        {renderActionButtons(false)}
      </div>
    </div>
  );
};


