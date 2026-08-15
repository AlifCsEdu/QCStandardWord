import React from 'react';
import {
  Search,
  X,
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
  ShieldCheck,
  History,
} from 'lucide-react';
import type { LayoutMode } from '../types/qc.ts';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';

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
  onOpenHistory?: () => void;
  historyCount?: number;
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
  onOpenHistory,
  historyCount,
}) => {
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <header
      id="appHeader"
      data-testid="app-header"
      className="app-header sticky top-0 z-40 w-full border-b border-border bg-[#121214] px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 sm:gap-4 flex-wrap min-h-[64px] box-border text-foreground shadow-xs select-none touch-manipulation"
    >
      {/* 1. Left Column: Mobile Hamburger + Brand Logo Mark + Title + Version */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {onToggleMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobile}
            className="sm:hidden min-h-[44px] min-w-[44px] size-11 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg"
            aria-label="Toggle navigation"
          >
            <Menu className="size-5" />
          </Button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground shadow-xs">
            <ShieldCheck className="size-4.5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="m-0 text-base sm:text-lg font-bold text-foreground tracking-tight whitespace-nowrap">
              QC Standard Wording
            </h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              v2.0
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center Column: Hero Search Bar + Clear Button + Cmd+K Spotlight Trigger */}
      <div className="flex items-center gap-2 flex-1 max-w-[460px] min-w-[200px] order-3 md:order-2">
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
            className="w-full pr-10 min-h-[44px] h-11 bg-muted/60 border-input text-foreground text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-all duration-150 rounded-lg px-3.5"
          />
          {hasQuery && (
            <button
              id="clearBtn"
              data-testid="clear-search-btn"
              className={`clear-btn ${hasQuery ? 'show' : ''} absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] size-10 flex items-center justify-center text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer p-1 transition-colors rounded-md`}
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
          className="spotlight-btn bg-muted/60 border border-input text-foreground hover:bg-accent text-xs gap-1.5 whitespace-nowrap min-h-[44px] h-11 px-3.5 sm:px-4 transition-all rounded-lg shrink-0 cursor-pointer"
          variant="outline"
          onClick={onOpenSpotlight}
          title="Quick Search (Cmd+K / Ctrl+K)"
        >
          <Search className="size-3.5 text-muted-foreground" />
          <span className="font-mono text-[10px] tracking-tight bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded-md font-semibold">
            ⌘K
          </span>
        </Button>
      </div>

      {/* 3. Right Column: View Switcher Segmented Control & Clean Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap order-2 md:order-3">
        {onSetLayout && (
          <div
            id="setLayout"
            data-testid="view-switcher"
            className="inline-flex rounded-lg bg-muted/60 p-1 border border-border"
          >
            {(['list', 'grid', 'table'] as LayoutMode[]).map((mode) => {
              const IconComp = mode === 'list' ? List : mode === 'grid' ? LayoutGrid : TableIcon;
              const isActive = layoutMode === mode;
              return (
                <button
                  key={mode}
                  data-v={mode}
                  data-value={mode}
                  onClick={() => onSetLayout(mode)}
                  className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-2 text-xs rounded-md transition-all duration-150 border-0 cursor-pointer capitalize flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-stone-800 text-stone-100 border border-stone-700/80 font-semibold shadow-xs'
                      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted font-medium'
                  }`}
                >
                  <IconComp className="size-3.5" />
                  <span className="hidden sm:inline">{mode}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Pin Folder Manager Trigger (if provided) */}
        {onOpenFolderManager && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFolderManager}
            className="bg-card border-border text-foreground hover:bg-accent gap-1.5 min-h-[44px] h-11 px-3 text-xs rounded-lg cursor-pointer"
            title="Manage Pin Folders"
          >
            <Folder className="size-3.5 text-muted-foreground" />
            <span className="hidden md:inline">Folders</span>
            {folderCount !== undefined && (
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.2 rounded-full font-bold border border-border font-mono">
                {folderCount}
              </span>
            )}
          </Button>
        )}

        {/* Inspection History Trigger (if provided) */}
        {onOpenHistory && (
          <Button
            id="histBtn"
            data-testid="history-btn"
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="bg-card border-border text-foreground hover:bg-accent gap-1.5 min-h-[44px] h-11 px-3.5 text-xs font-semibold rounded-lg cursor-pointer"
            title="Open Inspection History"
          >
            <History className="size-3.5 text-muted-foreground" />
            <span className="hidden lg:inline">History</span>
            {historyCount !== undefined && (
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.2 rounded-full font-bold border border-border font-mono">
                {historyCount}
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
              ? 'on bg-foreground text-background font-bold hover:bg-foreground/90 shadow-xs'
              : 'bg-card border-border text-foreground hover:bg-accent'
          } min-h-[44px] h-11 px-3.5 text-xs font-semibold rounded-lg cursor-pointer`}
          onClick={onToggleEditMode}
          title="Toggle Edit Mode"
        >
          <span>Edit Mode</span>
        </Button>

        {/* Batch Drawer Button */}
        <Button
          id="batchBtn"
          data-testid="batch-btn"
          size="sm"
          variant="outline"
          className="batch-btn bg-card border-border text-foreground hover:bg-accent min-h-[44px] h-11 px-3.5 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 rounded-lg cursor-pointer"
          onClick={onOpenBatchDrawer}
          title="Open Batch Drawer"
        >
          <span className="hidden sm:inline">Batch Queue</span>
          <span className="sm:hidden">Batch</span>
          <span
            id="bcount"
            className="bcount bg-muted text-foreground border border-border px-1.5 sm:px-2 py-0.5 rounded-full text-[11px] font-bold font-mono"
          >
            {batchCount}
          </span>
        </Button>

        {/* Settings Button */}
        <Button
          id="setBtn"
          data-testid="settings-btn"
          size="sm"
          variant="outline"
          className="set-btn settings-btn bg-card border-border text-foreground hover:bg-accent min-h-[44px] h-11 px-3.5 text-xs font-semibold gap-1.5 rounded-lg cursor-pointer"
          onClick={onOpenSettings}
          title="Appearance & Layout Settings"
        >
          <Settings className="size-3.5 text-muted-foreground" />
          <span className="hidden lg:inline">Settings</span>
        </Button>

        {/* Download Offline Copy */}
        <Button
          id="dlBtn"
          data-testid="download-offline-btn"
          size="sm"
          variant="outline"
          className="dl-btn bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent min-h-[44px] h-11 px-3.5 text-xs font-medium gap-1.5 rounded-lg cursor-pointer"
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
          <Download className="size-3.5 text-muted-foreground" />
          <span className="hidden xl:inline">Offline Copy</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          id="themeBtn"
          data-testid="theme-toggle"
          size="sm"
          variant="outline"
          className="theme-btn bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent min-h-[44px] h-11 px-3.5 text-xs font-medium gap-1.5 rounded-lg cursor-pointer"
          onClick={onToggleTheme}
          title="Toggle Dark/Light Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="size-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="size-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
});
