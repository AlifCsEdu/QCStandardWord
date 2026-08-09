import React, { useMemo, useState, useEffect } from 'react';
import { ArrowUp, Search as IconSearch, Folder, Copy, Star } from 'lucide-react';

import { AppHeader } from './components/AppHeader.tsx';
import { BatchDrawer } from './components/BatchDrawer.tsx';
import { CategoryChips } from './components/CategoryChips.tsx';
import { CodeSubChips } from './components/CodeSubChips.tsx';
import { EditModal } from './components/EditModal.tsx';
import { EditToolbar } from './components/EditToolbar.tsx';
import { HistoryBar } from './components/HistoryBar.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { StatsDashboard } from './components/StatsDashboard.tsx';
import { ToastsContainer } from './components/ToastsContainer.tsx';
import { WordingContainer } from './components/WordingContainer.tsx';
import { Button } from './components/ui/button.tsx';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './components/ui/command.tsx';
import { useAppearance } from './hooks/useAppearance.ts';
import { useQCState } from './hooks/useQCState.ts';

if (typeof window !== 'undefined') {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as any;
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id: number) => clearTimeout(id);
  }
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }
  if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {};
  }
}

export const AppContent: React.FC = () => {
  const {
    appearance,
    theme,
    layout,
    radius,
    density,
    setTheme,
    setLayout,
    setRadius,
    setDensity,
    setTextSize,
    setMotion,
    setAccent,
  } = useAppearance();

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    activeItems,
    searchResults,
    folders,
    activeFolderId,
    setActiveFolderId,
    createFolder,
    deleteFolder,
    renameFolder,
    togglePinToFolder,
    isPinnedInFolder,
    pinsSet,
    togglePin,
    recents,
    clearRecents,
    copySingleItem,
    batchQueue,
    addToBatch,
    removeFromBatch,
    moveBatchItemUp,
    moveBatchItemDown,
    clearBatch,
    delimiter,
    setDelimiter,
    autoclear,
    setAutoclear,
    copyBatch,
    bulkImportBatch,
    editMode,
    toggleEditMode,
    modalOpen,
    editingItem,
    openAddModal,
    openEditModal,
    closeModal,
    saveWordingItem,
    deleteWordingItem,
    batchDrawerOpen,
    setBatchDrawerOpen,
    settingsModalOpen,
    setSettingsModalOpen,
    toasts,
    removeToast,
    exportChanges,
    importChanges,
    resetAllChanges,
  } = useQCState();

  const [scrollY, setScrollY] = useState(0);
  const [mobileOpened, setMobileOpened] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMobile = () => setMobileOpened((prev) => !prev);

  // Compute category item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activeItems.length,
      pinned: activeItems.filter((item) => pinsSet.has(item.id) || pinsSet.has(item.n)).length,
      recent: recents.length,
    };
    for (const item of activeItems) {
      counts[item.c] = (counts[item.c] || 0) + 1;
    }
    return counts;
  }, [activeItems, pinsSet, recents]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        layoutMode={layout}
        onSetLayout={setLayout}
        onOpenSpotlight={() => setSpotlightOpen(true)}
        editMode={editMode}
        onToggleEditMode={toggleEditMode}
        batchCount={batchQueue.length}
        onOpenBatchDrawer={() => setBatchDrawerOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        mobileOpened={mobileOpened}
        onToggleMobile={toggleMobile}
        folderCount={folders.length}
      />

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside
          data-testid="app-navbar"
          id="sidebarNav"
          className={`sidebar-nav fixed sm:sticky top-[60px] h-[calc(100vh-60px)] w-[260px] bg-[#0c0e12] border-r border-white/[0.08] overflow-y-auto z-30 transition-transform duration-200 ${
            mobileOpened ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
          }`}
        >
          <CategoryChips
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedSubCategory('ALL');
            }}
            categoryCounts={categoryCounts}
            folders={folders}
            activeFolderId={activeFolderId}
            onSelectFolder={setActiveFolderId}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            onRenameFolder={renameFolder}
          />
          <CodeSubChips
            selectedCategory={selectedCategory}
            selectedSubCategory={selectedSubCategory}
            onSelectSubCategory={setSelectedSubCategory}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col bg-zinc-950">
          {/* Inspection Stats Dashboard Header */}
          <StatsDashboard
            categoryCounts={categoryCounts}
            selectedCategory={selectedCategory}
            selectedSubCategory={selectedSubCategory}
            searchQuery={searchQuery}
            totalFilteredCount={searchResults.length}
            batchCount={batchQueue.length}
            pinnedCount={pinsSet.size}
            onOpenSpotlight={() => setSpotlightOpen(true)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedSubCategory('ALL');
            }}
          />

          {/* Copy History Feed Bar */}
          <HistoryBar
            recents={recents}
            onCopyRecent={copySingleItem}
            onClearHistory={clearRecents}
          />

          {/* Edit Mode Toolbar */}
          <EditToolbar
            editMode={editMode}
            onOpenAddModal={openAddModal}
            onExport={exportChanges}
            onImport={importChanges}
            onReset={resetAllChanges}
          />

          {/* Search & Wording Items Container */}
          <WordingContainer
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            results={searchResults}
            layoutMode={layout}
            onSetLayout={setLayout}
            pinsSet={pinsSet}
            editMode={editMode}
            onCopyItem={copySingleItem}
            onTogglePin={togglePin}
            onAddToBatch={addToBatch}
            onOpenEdit={openEditModal}
            onDeleteItem={deleteWordingItem}
            folders={folders}
            onTogglePinToFolder={togglePinToFolder}
            isPinnedInFolder={isPinnedInFolder}
          />

          {/* Batch Drawer */}
          <BatchDrawer
            isOpen={batchDrawerOpen}
            onClose={() => setBatchDrawerOpen(false)}
            batchQueue={batchQueue}
            onRemoveItem={removeFromBatch}
            onClearBatch={clearBatch}
            onMoveItemUp={moveBatchItemUp}
            onMoveItemDown={moveBatchItemDown}
            moveBatchItemUp={moveBatchItemUp}
            moveBatchItemDown={moveBatchItemDown}
            delimiter={delimiter}
            onSetDelimiter={setDelimiter}
            autoclear={autoclear}
            onSetAutoclear={setAutoclear}
            onCopyBatch={copyBatch}
            onBulkImport={bulkImportBatch}
          />

          {/* Add/Edit Wording Modal */}
          <EditModal
            isOpen={modalOpen}
            editingItem={editingItem}
            onSave={saveWordingItem}
            onClose={closeModal}
          />

          {/* Settings Modal */}
          <SettingsModal
            isOpen={settingsModalOpen}
            onClose={() => setSettingsModalOpen(false)}
            appearance={appearance}
            onSetLayout={setLayout}
            onSetRadius={setRadius}
            onSetDensity={setDensity}
            onSetTextSize={setTextSize}
            onSetMotion={setMotion}
            onSetAccent={setAccent}
          />

          {/* Cmd+K Spotlight Search CommandDialog */}
          <CommandDialog open={spotlightOpen} onOpenChange={setSpotlightOpen}>
            <CommandInput placeholder="Search QC defects or type a command (e.g. battery, screen)..." />
            <CommandList className="max-h-[360px]">
              <CommandEmpty className="py-8 text-center text-sm text-zinc-500 font-sans">
                No matching QC wording defects found.
              </CommandEmpty>
              <CommandGroup heading="QC Wording Defects">
                {searchResults.slice(0, 20).map(({ item }) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      copySingleItem(item.t);
                      setSpotlightOpen(false);
                    }}
                    className="cursor-pointer flex items-center justify-between py-2.5 px-3 rounded-lg data-[selected=true]:bg-cyan-500/10 data-[selected=true]:text-cyan-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        #{item.n}
                      </span>
                      <span className="truncate text-sm text-zinc-100 font-sans font-medium">{item.t}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/80 font-mono capitalize">
                      {item.c}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2 bg-zinc-950/80 text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-3">
                <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">↵</kbd> Copy & Close</span>
              </div>
              <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">ESC</kbd> Exit</span>
            </div>
          </CommandDialog>

          {/* Toast Notifications */}
          <ToastsContainer toasts={toasts} onRemoveToast={removeToast} />

          {/* Floating Scroll-to-Top Button */}
          {scrollY > 100 && (
            <Button
              id="scrollTopBtn"
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg z-50 gap-1.5 h-10 px-4"
            >
              <ArrowUp className="size-4" />
              <span>Scroll to Top</span>
            </Button>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}

