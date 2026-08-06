import { useCallback, useMemo, useRef, useState } from 'react';
import { BASE_ITEMS } from '../data/qcData.ts';
import type { CategoryKey, DelimiterKey, QCItem, SearchResult, SubCategoryCode, ToastNotice } from '../types/qc.ts';
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

  // Storage State Keys (13 keys)
  const [pins, setPins] = useState<(string | number)[]>(() => {
    return safeJSONParse<(string | number)[]>('qc-pins', []);
  });

  const [recents, setRecents] = useState<string[]>(() => {
    const r = safeJSONParse<string[]>('qc-recents', []);
    if (r.length === 0) {
      return safeJSONParse<string[]>('qc-history', []);
    }
    return r;
  });

  const [batchQueue, setBatchQueue] = useState<string[]>(() => {
    return safeJSONParse<string[]>('qc-batch', []);
  });

  const [delimiter, setDelimiterState] = useState<DelimiterKey>(() => {
    const d = safeJSONParse<string>('qc-join', 'nl');
    return (['nl', 'comma', 'semi', 'space'].includes(d) ? d : 'nl') as DelimiterKey;
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
    return safeJSONParse<Record<string, { t: string; c: CategoryKey; n: number }>>('qc-edits', {});
  });

  const [qcDels, setQcDels] = useState<(string | number)[]>(() => {
    return safeJSONParse<(string | number)[]>('qc-dels', []);
  });

  const [qcCustom, setQcCustom] = useState<QCItem[]>(() => {
    return safeJSONParse<QCItem[]>('qc-custom', []);
  });

  // UI State: Edit Mode, Modals, Drawer, Toasts
  const [editMode, setEditMode] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<QCItem | null>(null);
  const [batchDrawerOpen, setBatchDrawerOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

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
  const pinsSet = useMemo(() => new Set(pins), [pins]);

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
  const addToast = useCallback((msg: string, warn = false, action?: ToastNotice['action']) => {
    const id = 't_' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotice = { id, msg, warn, action };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.2 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Pinning
  const togglePin = useCallback((id: string | number) => {
    setPins((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((p) => p !== id) : [...prev, id];
      safeStorageSet('qc-pins', next);
      return next;
    });
  }, []);

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
      const snapshotEdits = { ...qcEdits };
      const snapshotDels = [...qcDels];
      const snapshotCustom = [...qcCustom];

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
          setQcEdits(snapshotEdits);
          setQcDels(snapshotDels);
          setQcCustom(snapshotCustom);
          safeStorageSet('qc-edits', snapshotEdits);
          safeStorageSet('qc-dels', snapshotDels);
          safeStorageSet('qc-custom', snapshotCustom);
          addToast('Restored deleted item');
        },
      });
    },
    [qcEdits, qcDels, qcCustom, addToast]
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
