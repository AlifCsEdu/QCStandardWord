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
  List,
  LayoutGrid,
  Table as TableIcon,
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

export const AppHeader: React.FC<AppHeaderProps> = React.memo(({
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
      className="app-header sticky top-0 z-40 w-full border-b border-stone-800 bg-[#121214] px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap min-h-[60px] box-border text-stone-100 shadow-xs"
    >
      {/* Left side: Mobile Burger + Logo/Title + Version badge */}
      <div className="flex items-center gap-3">
        {onToggleMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobile}
            className="sm:hidden text-stone-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            <Menu className="size-5" />
          </Button>
        )}
        <h2 className="m-0 text-lg font-bold text-stone-100 whitespace-nowrap tracking-tight">
          QC Standard Wording
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 font-semibold">
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
            className="w-full pr-9 bg-stone-900 border-stone-800 text-stone-100 text-sm placeholder:text-stone-500 focus-visible:ring-1 focus-visible:ring-stone-600 focus-visible:border-stone-600 transition-all duration-200"
          />
          {hasQuery && (
            <button
              id="clearBtn"
              data-testid="clear-search-btn"
              className={`clear-btn ${hasQuery ? 'show' : ''} absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-100 bg-transparent border-0 cursor-pointer p-1 transition-colors`}
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
          className="spotlight-btn bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-stone-100 text-xs gap-2 whitespace-nowrap h-9 px-3 transition-all"
          variant="outline"
          onClick={onOpenSpotlight}
          title="Quick Search (Cmd+K / Ctrl+K)"
        >
          <Search className="size-3.5 text-stone-400" />
          <span className="font-mono text-[10px] tracking-tight bg-stone-800 text-stone-300 border border-stone-700 px-1.5 py-0.5 rounded-md font-semibold">⌘K</span>
        </Button>
      </div>

      {/* Right side: View Switcher ToggleGroup & Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {onSetLayout && (
          <div id="setLayout" data-testid="view-switcher" className="inline-flex rounded-lg bg-stone-900 p-1 border border-stone-800">
            {(['list', 'grid', 'table'] as LayoutMode[]).map((mode) => {
              const IconComp = mode === 'list' ? List : mode === 'grid' ? LayoutGrid : TableIcon;
              return (
                <button
                  key={mode}
                  data-v={mode}
                  data-value={mode}
                  onClick={() => onSetLayout(mode)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-all duration-150 border-0 cursor-pointer capitalize flex items-center gap-1.5 ${
                    layoutMode === mode
                      ? 'bg-stone-800 text-stone-100 border border-stone-700 font-bold shadow-xs'
                      : 'bg-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <IconComp className="size-3.5" />
                  <span>{mode}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Pin Folder Manager Button (if provided) */}
        {onOpenFolderManager && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFolderManager}
            className="bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-stone-100 gap-1.5 h-8 text-xs"
            title="Manage Pin Folders"
          >
            <Folder className="size-3.5 text-stone-400" />
            <span className="hidden md:inline">Folders</span>
            {folderCount !== undefined && (
              <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.2 rounded-full font-bold border border-stone-700">
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
              ? 'on bg-stone-100 text-stone-900 font-bold hover:bg-white shadow-xs'
              : 'bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-800'
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
          className="batch-btn bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-800 h-8 text-xs font-semibold gap-2"
          onClick={onOpenBatchDrawer}
          title="Open Batch Drawer"
        >
          <span>Batch Queue</span>
          <span
            id="bcount"
            className="bcount bg-stone-800 text-stone-200 border border-stone-700 px-2 py-0.5 rounded-full text-[11px] font-bold"
          >
            {batchCount}
          </span>
        </Button>

        {/* Settings Button */}
        <Button
          id="setBtn"
          size="sm"
          variant="outline"
          className="set-btn settings-btn bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-800 h-8 text-xs font-semibold gap-1.5"
          onClick={onOpenSettings}
          title="Appearance & Layout Settings"
        >
          <Settings className="size-3.5 text-stone-400" />
          <span className="hidden sm:inline">Settings</span>
        </Button>

        {/* Download Offline Copy */}
        <Button
          id="dlBtn"
          size="sm"
          variant="outline"
          className="dl-btn bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 h-8 text-xs font-medium gap-1.5"
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
          <Download className="size-3.5 text-stone-400" />
          <span className="hidden md:inline">Offline Copy</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          id="themeBtn"
          size="sm"
          variant="outline"
          className="theme-btn bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 h-8 text-xs font-medium gap-1.5"
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
              <Moon className="size-3.5 text-stone-400" />
              <span>Dark</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
});

