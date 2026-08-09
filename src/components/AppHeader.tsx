import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Plus,
  Folder,
  Layers,
  Settings,
  Download,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import type { LayoutMode } from '../types/qc.ts';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group.tsx';

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  layoutMode: LayoutMode;
  onSetLayout?: (layout: LayoutMode) => void;
  onOpenSpotlight: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  batchCount: number;
  onOpenBatchDrawer: () => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark' | 'auto';
  onToggleTheme: () => void;
  mobileOpened?: boolean;
  onToggleMobile?: () => void;
  onOpenFolderManager?: () => void;
  folderCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  layoutMode,
  onSetLayout,
  onOpenSpotlight,
  editMode,
  onToggleEditMode,
  batchCount,
  onOpenBatchDrawer,
  onOpenSettings,
  theme,
  onToggleTheme,
  mobileOpened = false,
  onToggleMobile,
  onOpenFolderManager,
  folderCount,
}) => {
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <header
      id="appHeader"
      data-testid="app-header"
      className="app-header sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0c0e12]/80 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap min-h-[60px] box-border text-zinc-100 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
    >
      {/* Left side: Mobile Burger + Logo/Title + Version badge */}
      <div className="flex items-center gap-3">
        {onToggleMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobile}
            className="sm:hidden text-zinc-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            <Menu className="size-5" />
          </Button>
        )}
        <h2 className="m-0 text-lg font-bold text-zinc-100 whitespace-nowrap tracking-tight">
          QC Standard Wording
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
          v2.0
        </span>
      </div>

      {/* Middle: Search Bar + Clear Button + Cmd+K Spotlight Trigger */}
      <div className="flex items-center gap-2.5 flex-1 max-w-[480px] min-w-[220px]">
        <div className="relative flex-1">
          <Input
            id="search"
            data-testid="header-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            placeholder="Search QC defects (e.g. FCPB, battery, display, crease)..."
            className="w-full pr-9 bg-[#0c0e12] border-white/[0.08] text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all duration-200"
          />
          {hasQuery && (
            <button
              id="clearBtn"
              data-testid="clear-search-btn"
              className={`clear-btn ${hasQuery ? 'show' : ''} absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-cyan-400 bg-transparent border-0 cursor-pointer p-1 transition-colors`}
              onClick={onClearSearch}
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Cmd+K Spotlight Modal Trigger */}
        <Button
          id="spotlightBtn"
          data-testid="spotlight-trigger"
          className="spotlight-btn bg-[#0c0e12] border border-white/[0.08] text-zinc-300 hover:bg-zinc-900 hover:border-cyan-500/40 hover:text-zinc-100 text-xs gap-2 whitespace-nowrap h-9 px-3 transition-all"
          variant="outline"
          onClick={onOpenSpotlight}
          title="Quick Search (Cmd+K / Ctrl+K)"
        >
          <Search className="size-3.5 text-cyan-400" />
          <span className="font-mono text-[10px] tracking-tight bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-md font-semibold">⌘K</span>
        </Button>
      </div>

      {/* Right side: View Switcher ToggleGroup & Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {onSetLayout && (
          <div id="setLayout" data-testid="view-switcher" className="inline-flex rounded-lg bg-[#0c0e12] p-1 border border-white/[0.08]">
            {(['list', 'grid', 'table'] as LayoutMode[]).map((mode) => (
              <button
                key={mode}
                data-v={mode}
                data-value={mode}
                onClick={() => onSetLayout(mode)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all duration-150 border-0 cursor-pointer capitalize ${
                  layoutMode === mode
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-bold'
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {/* Pin Folder Manager Button (if provided) */}
        {onOpenFolderManager && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFolderManager}
            className="bg-[#0c0e12] border-white/[0.08] text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 gap-1.5 h-8 text-xs"
            title="Manage Pin Folders"
          >
            <Folder className="size-3.5 text-cyan-400" />
            <span className="hidden md:inline">Folders</span>
            {folderCount !== undefined && (
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.2 rounded-full font-bold">
                {folderCount}
              </span>
            )}
          </Button>
        )}

        {/* Edit Mode Toggle */}
        <Button
          id="editBtn"
          size="sm"
          variant={editMode ? 'default' : 'outline'}
          className={`edit-btn ${
            editMode
              ? 'on bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-[#0c0e12] border-white/[0.08] text-zinc-200 hover:bg-zinc-800'
          } h-8 text-xs font-semibold`}
          onClick={onToggleEditMode}
          title="Toggle Edit Mode"
        >
          Edit Mode
        </Button>

        {/* Batch Drawer Button */}
        <Button
          id="batchBtn"
          size="sm"
          variant="outline"
          className="batch-btn bg-[#0c0e12] border-white/[0.08] text-zinc-200 hover:bg-zinc-800 h-8 text-xs font-semibold gap-2"
          onClick={onOpenBatchDrawer}
          title="Open Batch Drawer"
        >
          <span>Batch Queue</span>
          <span
            id="bcount"
            className="bcount bg-cyan-400 text-zinc-950 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]"
          >
            {batchCount}
          </span>
        </Button>

        {/* Settings Button */}
        <Button
          id="setBtn"
          size="sm"
          variant="outline"
          className="set-btn settings-btn bg-[#0c0e12] border-white/[0.08] text-zinc-200 hover:bg-zinc-800 h-8 text-xs font-semibold gap-1.5"
          onClick={onOpenSettings}
          title="Appearance & Layout Settings"
        >
          <Settings className="size-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Settings</span>
        </Button>

        {/* Download Offline Copy */}
        <Button
          id="dlBtn"
          size="sm"
          variant="outline"
          className="dl-btn bg-[#0c0e12] border-white/[0.08] text-zinc-300 hover:bg-zinc-800 h-8 text-xs font-medium gap-1.5"
          onClick={() => {
            if (typeof document === 'undefined') return;
            const html = document.documentElement.outerHTML;
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qc-standard-wording-offline.html';
            a.click();
            URL.revokeObjectURL(url);
          }}
          title="Download Offline Copy"
        >
          <Download className="size-3.5 text-zinc-400" />
          <span className="hidden md:inline">Offline Copy</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          id="themeBtn"
          size="sm"
          variant="outline"
          className="theme-btn bg-[#0c0e12] border-white/[0.08] text-zinc-300 hover:bg-zinc-800 h-8 text-xs font-medium gap-1.5"
          onClick={onToggleTheme}
          title="Toggle Dark/Light Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="size-3.5 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="size-3.5 text-cyan-400" />
              <span>Dark</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};

