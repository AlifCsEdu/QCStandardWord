import React, { useMemo } from 'react';
import { AppShell, MantineProvider, createTheme } from '@mantine/core';
import { AppHeader } from './components/AppHeader.tsx';
import { BatchDrawer } from './components/BatchDrawer.tsx';
import { CategoryChips } from './components/CategoryChips.tsx';
import { CodeSubChips } from './components/CodeSubChips.tsx';
import { EditModal } from './components/EditModal.tsx';
import { EditToolbar } from './components/EditToolbar.tsx';
import { HistoryBar } from './components/HistoryBar.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { ToastsContainer } from './components/ToastsContainer.tsx';
import { WordingContainer } from './components/WordingContainer.tsx';
import { useAppearance } from './hooks/useAppearance.ts';
import { useQCState } from './hooks/useQCState.ts';

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
    pinsSet,
    togglePin,
    recents,
    clearRecents,
    copySingleItem,
    batchQueue,
    addToBatch,
    removeFromBatch,
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
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppShell header={{ height: 60 }} padding="0">
      <AppShell.Header>
        <AppHeader
          editMode={editMode}
          onToggleEditMode={toggleEditMode}
          batchCount={batchQueue.length}
          onOpenBatchDrawer={() => setBatchDrawerOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </AppShell.Header>

      <AppShell.Main style={{ paddingTop: '60px' }}>
        {/* Category Navigation Chips */}
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedSubCategory('ALL');
          }}
          categoryCounts={categoryCounts}
        />

        {/* Panel Sub-code Chips (for 'codes' category) */}
        <CodeSubChips
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          onSelectSubCategory={setSelectedSubCategory}
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
      </AppShell.Main>
    </AppShell>
  );
};

const defaultTheme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
});

export default function App() {
  return (
    <MantineProvider theme={defaultTheme}>
      <AppContent />
    </MantineProvider>
  );
}
