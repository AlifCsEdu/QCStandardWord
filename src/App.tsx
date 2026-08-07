import React, { useMemo } from 'react';
import {
  AppShell,
  MantineProvider,
  Affix,
  Button,
  Transition,
  useMantineColorScheme,
} from '@mantine/core';
import { theme } from './theme';
import { Notifications, notifications } from '@mantine/notifications';
import { Spotlight, spotlight, type SpotlightActionData } from '@mantine/spotlight';
import { useWindowScroll, useDisclosure } from '@mantine/hooks';
import { IconArrowUp, IconSearch } from '@tabler/icons-react';

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

  const { setColorScheme } = useMantineColorScheme();

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    activeItems,
    searchResults,
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

  const [scroll, scrollTo] = useWindowScroll();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);

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
    setColorScheme(nextTheme);
  };

  // Build spotlight actions for Cmd+K search modal
  const spotlightActions: SpotlightActionData[] = useMemo(() => {
    return activeItems.map((item) => ({
      id: String(item.id),
      label: item.t,
      description: `Category: ${item.c.toUpperCase()} ${item.n ? `#${item.n}` : ''}`,
      onClick: () => {
        copySingleItem(item.t);
        notifications.show({
          title: 'Wording Copied',
          message: item.t,
          color: 'teal',
        });
      },
      leftSection: <IconSearch size={16} />,
    }));
  }, [activeItems, copySingleItem]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}
      padding="0"
    >
      <AppShell.Header id="appHeader" data-testid="app-header" className="app-header">
        <AppHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          layoutMode={layout}
          onSetLayout={setLayout}
          onOpenSpotlight={() => spotlight.open()}
          editMode={editMode}
          onToggleEditMode={toggleEditMode}
          batchCount={batchQueue.length}
          onOpenBatchDrawer={() => setBatchDrawerOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          mobileOpened={mobileOpened}
          onToggleMobile={toggleMobile}
        />
      </AppShell.Header>

      <AppShell.Navbar data-testid="app-navbar" id="sidebarNav" className="sidebar-nav" style={{ overflowY: 'auto' }}>
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedSubCategory('ALL');
          }}
          categoryCounts={categoryCounts}
        />
        <CodeSubChips
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          onSelectSubCategory={setSelectedSubCategory}
        />
      </AppShell.Navbar>

      <AppShell.Main style={{ paddingTop: '60px' }}>
        {/* Inspection Stats Dashboard Header */}
        <StatsDashboard
          categoryCounts={categoryCounts}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          searchQuery={searchQuery}
          totalFilteredCount={searchResults.length}
          batchCount={batchQueue.length}
          pinnedCount={pinsSet.size}
          onOpenSpotlight={() => spotlight.open()}
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

        {/* Toast Notifications */}
        <ToastsContainer toasts={toasts} onRemoveToast={removeToast} />

        {/* Mantine Spotlight Search Modal (Cmd+K / Ctrl+K) */}
        <Spotlight
          actions={spotlightActions}
          searchProps={{
            placeholder: 'Search QC defect wording (Press Cmd+K / Ctrl+K)...',
          }}
          shortcut={['mod + k', 'ctrl + k']}
          nothingFound="No QC wording items match search query."
          highlightQuery
        />

        {/* Floating Scroll-to-Top Button (Mantine Affix) */}
        <Affix position={{ bottom: 24, right: 24 }}>
          <Transition transition="slide-up" mounted={scroll.y > 100}>
            {(transitionStyles) => (
              <Button
                id="scrollTopBtn"
                leftSection={<IconArrowUp size={16} />}
                style={transitionStyles}
                onClick={() => scrollTo({ y: 0 })}
                variant="filled"
                color="blue"
                radius="xl"
                size="sm"
                shadow="md"
              >
                Scroll to Top
              </Button>
            )}
          </Transition>
        </Affix>
      </AppShell.Main>
    </AppShell>
  );
};

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} />
      <AppContent />
    </MantineProvider>
  );
}
