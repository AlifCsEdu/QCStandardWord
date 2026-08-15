import { useCallback, useMemo, useRef, useState } from 'react';
import { BASE_ITEMS } from '../data/qcData.ts';
import type { CategoryKey, CustomPinFolder, DelimiterKey, QCItem, SearchResult, SubCategoryCode, ToastNotice } from '../types/qc.ts';
import { copyToClipboard, triggerVibrate } from '../utils/clipboard.ts';
import { searchQCItems } from '../utils/searchEngine.ts';

function safeJSONParse<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key: string, value: any): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, val);
  } catch (err) {
    console.warn(`Failed to set storage key ${key}:`, err);
  }
}

export function useQCState() {
  // Search and Category Navigation State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryCode>('ALL');

  // Storage State Keys (14 keys)
  const [folders, setFolders] = useState<CustomPinFolder[]>(() => {
    const saved = safeJSONParse<CustomPinFolder[]>('qc-pin-folders', []);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      const valid = saved.filter((f) => f && typeof f === 'object' && typeof f.name === 'string');
      if (valid.length > 0) {
        return valid.map((f) => ({
          ...f,
          itemIds: Array.isArray(f.itemIds) ? f.itemIds : [],
        }));
      }
    }
    // Auto-migration from legacy qc-pins to default "Starred Defects" folder if no folders exist
    const legacyPins = safeJSONParse<(string | number)[]>('qc-pins', []);
    const defaultFolder: CustomPinFolder = {
      id: 'starred',
      name: 'Starred Defects',
      color: '#78716c',
      itemIds: Array.isArray(legacyPins) ? legacyPins : [],
      createdAt: Date.now(),
    };
    const initialFolders = [defaultFolder];
    safeStorageSet('qc-pin-folders', initialFolders);
    return initialFolders;
  });

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const pins = useMemo(() => {
    return Array.from(new Set(folders.flatMap((f) => f.itemIds || [])));
  }, [folders]);

  const updateFoldersAndPins = useCallback(
    (updater: CustomPinFolder[] | ((prev: CustomPinFolder[]) => CustomPinFolder[])) => {
      setFolders((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        safeStorageSet('qc-pin-folders', next);
        const allPinnedIds = Array.from(new Set(next.flatMap((f) => f.itemIds || [])));
        safeStorageSet('qc-pins', allPinnedIds);
        return next;
      });
    },
    []
  );

  const [recents, setRecents] = useState<string[]>(() => {
    const r = safeJSONParse<string[]>('qc-recents', []);
    if (Array.isArray(r) && r.length > 0) {
      return r.map(String);
    }
    const h = safeJSONParse<string[]>('qc-history', []);
    return Array.isArray(h) ? h.map(String) : [];
  });

  const [batchQueue, setBatchQueue] = useState<string[]>(() => {
    const saved = safeJSONParse<any>('qc-batch', []);
    return Array.isArray(saved) ? saved.map(String) : [];
  });

  const [delimiter, setDelimiterState] = useState<DelimiterKey>(() => {
    if (typeof localStorage === 'undefined') return 'nl';
    try {
      const raw = localStorage.getItem('qc-join');
      if (!raw) return 'nl';
      let clean = raw;
      if (clean.startsWith('"') && clean.endsWith('"')) {
        try {
          clean = JSON.parse(clean);
        } catch {
          // ignore
        }
      }
      return (['nl', 'comma', 'semi', 'space', 'pipe', 'bullet'].includes(clean) ? clean : 'nl') as DelimiterKey;
    } catch {
      return 'nl';
    }
  });

  const [autoclear, setAutoclearState] = useState<boolean>(() => {
    if (typeof localStorage === 'undefined') return true;
    const raw = localStorage.getItem('qc-autoclear');
    if (raw === null) return true;
    return raw === 'true' || raw === '"true"';
  });

  const delimiterRef = useRef(delimiter);
  delimiterRef.current = delimiter;

  const autoclearRef = useRef(autoclear);
  autoclearRef.current = autoclear;

  const [qcEdits, setQcEdits] = useState<Record<string, { t: string; c: CategoryKey; n: number }>>(() => {
    const saved = safeJSONParse<Record<string, any>>('qc-edits', {});
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  });

  const [qcDels, setQcDels] = useState<(string | number)[]>(() => {
    const saved = safeJSONParse<(string | number)[]>('qc-dels', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [qcCustom, setQcCustom] = useState<QCItem[]>(() => {
    const saved = safeJSONParse<QCItem[]>('qc-custom', []);
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item === 'object' && item.t) : [];
  });

  // UI State: Edit Mode, Modals, Drawer, Toasts
  const [editMode, setEditMode] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<QCItem | null>(null);
  const [batchDrawerOpen, setBatchDrawerOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Calculate active dataset from BASE_ITEMS + edits - dels + custom
  const activeItems = useMemo<QCItem[]>(() => {
    const delSet = new Set(qcDels.map(String));

    const baseProcessed = BASE_ITEMS.filter(
      (item) => !delSet.has(String(item.id)) && !delSet.has(String(item.n))
    ).map((item) => {
      const edit = qcEdits[item.id];
      if (edit) {
        return { ...item, t: edit.t, c: edit.c, n: edit.n };
      }
      return item;
    });

    const customProcessed = qcCustom.filter(
      (item) => !delSet.has(String(item.id)) && !delSet.has(String(item.n))
    );

    return [...baseProcessed, ...customProcessed];
  }, [qcEdits, qcDels, qcCustom]);

  // Compute search results
  const activeFolder = useMemo(() => {
    if (!activeFolderId) return null;
    return folders.find((f) => f.id === activeFolderId) || null;
  }, [folders, activeFolderId]);

  const pinsSet = useMemo(() => {
    if (activeFolder) {
      return new Set(activeFolder.itemIds);
    }
    return new Set(pins);
  }, [activeFolder, pins]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const res = searchQCItems(
      activeItems,
      searchQuery,
      selectedCategory,
      selectedSubCategory,
      pinsSet,
      recents
    );
    return res;
  }, [activeItems, searchQuery, selectedCategory, selectedSubCategory, pinsSet, recents]);

  // Toasts helper
  const removeToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (msg: string, warn = false, action?: ToastNotice['action']) => {
      const id = 't_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastNotice = { id, msg, warn, action };

      // Refresh timers for all existing active toasts to retain queue state during consecutive dispatches
      toastTimersRef.current.forEach((timer, existingId) => {
        clearTimeout(timer);
        const refreshedTimer = setTimeout(() => {
          removeToast(existingId);
        }, 4200);
        toastTimersRef.current.set(existingId, refreshedTimer);
      });

      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, 4200);

      toastTimersRef.current.set(id, timer);
    },
    [removeToast]
  );

  // Pin Folders Action Methods
  const createFolder = useCallback(
    (name: string, color?: string): string => {
      const id = 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newFolder: CustomPinFolder = {
        id,
        name: name.trim() || 'New Folder',
        color: color || '#78716c',
        itemIds: [],
        createdAt: Date.now(),
      };
      updateFoldersAndPins((prev) => [...prev, newFolder]);
      return id;
    },
    [updateFoldersAndPins]
  );

  const deleteFolder = useCallback(
    (folderId: string) => {
      updateFoldersAndPins((prev) => prev.filter((f) => f.id !== folderId));
      setActiveFolderId((prev) => (prev === folderId ? null : prev));
    },
    [updateFoldersAndPins]
  );

  const renameFolder = useCallback(
    (folderId: string, newName: string) => {
      if (!newName.trim()) return;
      updateFoldersAndPins((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: newName.trim() } : f))
      );
    },
    [updateFoldersAndPins]
  );

  const togglePinToFolder = useCallback(
    (itemId: string | number, folderId: string) => {
      updateFoldersAndPins((prev) =>
        prev.map((f) => {
          if (f.id !== folderId) return f;
          const exists = f.itemIds.some((id) => String(id) === String(itemId));
          const nextItems = exists
            ? f.itemIds.filter((id) => String(id) !== String(itemId))
            : [...f.itemIds, itemId];
          return { ...f, itemIds: nextItems };
        })
      );
    },
    [updateFoldersAndPins]
  );

  const itemFolderMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const f of folders) {
      if (!Array.isArray(f.itemIds)) continue;
      for (const id of f.itemIds) {
        const strId = String(id);
        let set = map.get(strId);
        if (!set) {
          set = new Set();
          map.set(strId, set);
        }
        set.add(f.id);
      }
    }
    return map;
  }, [folders]);

  const isPinnedInFolder = useCallback(
    (itemId: string | number, folderId: string): boolean => {
      return itemFolderMap.get(String(itemId))?.has(folderId) ?? false;
    },
    [itemFolderMap]
  );

  const getItemFolderIds = useCallback(
    (itemId: string | number): string[] => {
      const set = itemFolderMap.get(String(itemId));
      if (!set || set.size === 0) return [];
      return folders.filter((f) => set.has(f.id)).map((f) => f.id);
    },
    [folders, itemFolderMap]
  );

  // Pinning
  const togglePin = useCallback(
    (id: string | number) => {
      const targetFolderId =
        activeFolderId && folders.some((f) => f.id === activeFolderId)
          ? activeFolderId
          : folders[0]?.id || 'starred';

      const targetFolderExists = folders.some((f) => f.id === targetFolderId);

      if (!targetFolderExists) {
        const newFolder: CustomPinFolder = {
          id: targetFolderId,
          name: 'Starred Defects',
          color: '#78716c',
          itemIds: [id],
          createdAt: Date.now(),
        };
        updateFoldersAndPins([newFolder]);
      } else {
        togglePinToFolder(id, targetFolderId);
      }
    },
    [activeFolderId, folders, updateFoldersAndPins, togglePinToFolder]
  );

  // Recents & Copy
  const pushRecent = useCallback((text: string) => {
    if (!text.trim()) return;
    setRecents((prev) => {
      const filtered = prev.filter((r) => r !== text);
      const next = [text, ...filtered].slice(0, 20);
      safeStorageSet('qc-recents', next);
      safeStorageSet('qc-history', next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    safeStorageSet('qc-recents', []);
    safeStorageSet('qc-history', []);
  }, []);

  const copySingleItem = useCallback(
    async (text: string) => {
      await copyToClipboard(text);
      pushRecent(text);
      triggerVibrate(20);
      addToast(`Copied: "${text.substring(0, 35)}${text.length > 35 ? '...' : ''}"`);
    },
    [pushRecent, addToast]
  );

  // Batch Queue
  const addToBatch = useCallback(
    (text: string) => {
      setBatchQueue((prev) => {
        const next = [...prev, text];
        safeStorageSet('qc-batch', next);
        return next;
      });
      triggerVibrate(15);
      addToast(`Added to batch: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    },
    [addToast]
  );

  const removeFromBatch = useCallback((index: number) => {
    setBatchQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      safeStorageSet('qc-batch', next);
      return next;
    });
  }, []);

  const moveBatchItemUp = useCallback((index: number) => {
    if (index <= 0) return;
    setBatchQueue((prev) => {
      if (index >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      safeStorageSet('qc-batch', next);
      return next;
    });
  }, []);

  const moveBatchItemDown = useCallback((index: number) => {
    setBatchQueue((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      safeStorageSet('qc-batch', next);
      return next;
    });
  }, []);

  const clearBatch = useCallback(() => {
    setBatchQueue([]);
    safeStorageSet('qc-batch', []);
  }, []);

  const setDelimiter = useCallback((key: DelimiterKey) => {
    setDelimiterState(key);
    delimiterRef.current = key;
    safeStorageSet('qc-join', key);
  }, []);

  const setAutoclear = useCallback((val: boolean) => {
    setAutoclearState(val);
    autoclearRef.current = val;
    safeStorageSet('qc-autoclear', String(val));
  }, []);

  const copyBatch = useCallback(async () => {
    if (batchQueue.length === 0) return;

    const curDelim = delimiterRef.current;
    let sep = '\n';
    if (curDelim === 'comma') sep = ', ';
    else if (curDelim === 'semi') sep = '; ';
    else if (curDelim === 'space') sep = ' ';
    else if (curDelim === 'pipe') sep = ' | ';
    else if (curDelim === 'bullet') sep = ' • ';

    const formatted = batchQueue.join(sep);
    await copyToClipboard(formatted);
    pushRecent(formatted);
    triggerVibrate(30);

    if (autoclearRef.current) {
      clearBatch();
    }
    addToast(`Copied batch (${batchQueue.length} items)`);
  }, [batchQueue, pushRecent, clearBatch, addToast]);

  const bulkImportBatch = useCallback((rawText: string) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setBatchQueue((prev) => {
      const next = [...prev, ...lines];
      safeStorageSet('qc-batch', next);
      return next;
    });
    addToast(`Bulk imported ${lines.length} items into batch queue`);
  }, [addToast]);

  // Edit Mode & Modals
  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: QCItem) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
  }, []);

  const saveWordingItem = useCallback(
    (text: string, category: CategoryKey, number: number) => {
      if (!text.trim()) return;

      if (editingItem) {
        if (editingItem.custom) {
          setQcCustom((prev) => {
            const next = prev.map((item) =>
              item.id === editingItem.id ? { ...item, t: text, c: category, n: number } : item
            );
            safeStorageSet('qc-custom', next);
            return next;
          });
        } else {
          setQcEdits((prev) => {
            const next = { ...prev, [editingItem.id]: { t: text, c: category, n: number } };
            safeStorageSet('qc-edits', next);
            return next;
          });
        }
        addToast(`Updated defect #${number}`);
      } else {
        const newItem: QCItem = {
          id: 'c' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          n: number,
          t: text,
          c: category,
          custom: true,
        };
        setQcCustom((prev) => {
          const next = [...prev, newItem];
          safeStorageSet('qc-custom', next);
          return next;
        });
        addToast(`Added custom defect #${number}`);
      }
      closeModal();
    },
    [editingItem, closeModal, addToast]
  );

  const deleteWordingItem = useCallback(
    (item: QCItem) => {
      if (item.custom) {
        setQcCustom((prev) => {
          const next = prev.filter((c) => c.id !== item.id);
          safeStorageSet('qc-custom', next);
          return next;
        });
      } else {
        setQcDels((prev) => {
          const next = [...prev, item.id];
          safeStorageSet('qc-dels', next);
          return next;
        });
      }

      addToast(`Deleted item #${item.n} (${item.t})`, true, {
        label: 'Undo',
        fn: () => {
          if (item.custom) {
            setQcCustom((prev) => {
              const next = [...prev, item];
              safeStorageSet('qc-custom', next);
              return next;
            });
          } else {
            setQcDels((prev) => {
              const next = prev.filter(
                (id) => String(id) !== String(item.id) && String(id) !== String(item.n)
              );
              safeStorageSet('qc-dels', next);
              return next;
            });
          }
          addToast('Restored deleted item');
        },
      });
    },
    [addToast]
  );

  // Storage Operations: Export, Import, Reset
  const exportChanges = useCallback(() => {
    const payload = {
      edits: qcEdits,
      dels: qcDels,
      customs: qcCustom,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const filename = 'qc-wording-changes.json';

    if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (window.URL.revokeObjectURL) {
        window.URL.revokeObjectURL(url);
      }
    }
    addToast('Exported wording changes');
    return { blob, filename };
  }, [qcEdits, qcDels, qcCustom, addToast]);

  const importChanges = useCallback(
    (payload: any) => {
      if (!payload || typeof payload !== 'object') {
        addToast('Invalid import file payload', true);
        return;
      }
      const edits = payload.edits || {};
      const dels = Array.isArray(payload.dels) ? payload.dels : Array.isArray(payload.deletions) ? payload.deletions : [];
      const customs = Array.isArray(payload.customs) ? payload.customs : Array.isArray(payload.custom) ? payload.custom : [];

      setQcEdits(edits);
      setQcDels(dels);
      setQcCustom(customs);

      safeStorageSet('qc-edits', edits);
      safeStorageSet('qc-dels', dels);
      safeStorageSet('qc-custom', customs);

      addToast('Imported wording changes successfully');
    },
    [addToast]
  );

  const resetAllChanges = useCallback(() => {
    setQcEdits({});
    setQcDels([]);
    setQcCustom([]);

    safeStorageSet('qc-edits', {});
    safeStorageSet('qc-dels', []);
    safeStorageSet('qc-custom', []);

    addToast('Reset all wording changes to default');
  }, [addToast]);

  return {
    // Search & Filtering
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    activeItems,
    searchResults,

    // Custom Pin Folders State & Methods
    folders,
    activeFolderId,
    setActiveFolderId,
    createFolder,
    deleteFolder,
    renameFolder,
    togglePinToFolder,
    isPinnedInFolder,
    getItemFolderIds,

    // Pinning
    pins,
    pinsSet,
    togglePin,

    // Recents & History
    recents,
    pushRecent,
    clearRecents,
    copySingleItem,

    // Batch Queue & Delimiters
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

    // Edit Mode & Modals
    editMode,
    toggleEditMode,
    modalOpen,
    editingItem,
    openAddModal,
    openEditModal,
    closeModal,
    saveWordingItem,
    deleteWordingItem,

    // Drawers & Modals UI state
    batchDrawerOpen,
    setBatchDrawerOpen,
    settingsModalOpen,
    setSettingsModalOpen,

    // Toasts
    toasts,
    addToast,
    removeToast,

    // Storage Management
    exportChanges,
    importChanges,
    resetAllChanges,
  };
}
