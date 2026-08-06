import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Helper to wait for pending microtasks / async handlers to resolve.
 */
export const waitAsync = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * In-Memory LocalStorage Mock
 */
export class MockLocalStorage {
  constructor(initialData = {}) {
    this.store = { ...initialData };
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? String(this.store[key]) : null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(i) {
    return Object.keys(this.store)[i] || null;
  }
}

function getCompiledAppCode() {
  const entryPath = path.join(projectRoot, 'src', 'main.tsx');
  const result = esbuild.buildSync({
    entryPoints: [entryPath],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2020',
    loader: { '.tsx': 'tsx', '.ts': 'ts', '.css': 'empty' },
    define: { 'process.env.NODE_ENV': '"test"' },
  });
  return result.outputFiles[0].text;
}

const htmlTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>QC Standard Wording</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

/**
 * Boots an instance of the React QC Standard Wording app inside JSDOM.
 */
export function createAppInstance(options = {}) {
  const initialStorage = options.initialStorage || {};
  const mockStorage = new MockLocalStorage(initialStorage);

  let copiedText = null;
  let vibrateCount = 0;

  const dom = new JSDOM(htmlTemplate, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    resources: 'usable',
    beforeParse(window) {
      // Inject mock matchMedia
      window.matchMedia = window.matchMedia || function (query) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        };
      };

      // Inject mock scrollTo
      window.scrollTo = () => {};

      // Inject mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
        configurable: true
      });

      // Inject mock navigator clipboard & vibrate
      Object.defineProperty(window.navigator, 'clipboard', {
        value: {
          writeText: async (text) => {
            copiedText = text;
            return true;
          },
          readText: async () => copiedText || ''
        },
        configurable: true
      });

      Object.defineProperty(window.navigator, 'vibrate', {
        value: () => {
          vibrateCount++;
          return true;
        },
        configurable: true
      });

      // Mock URL.createObjectURL / revokeObjectURL for exports
      window.URL.createObjectURL = () => 'blob:mock-export-url';
      window.URL.revokeObjectURL = () => {};
    }
  });

  const { window } = dom;
  const { document } = window;

  // Execute bundled React application code inside JSDOM
  const scriptCode = getCompiledAppCode();
  const scriptEl = document.createElement('script');
  scriptEl.textContent = scriptCode;
  document.body.appendChild(scriptEl);

  // Helper function to safely execute DOM updates and flush inner React
  const runWithFlush = (fn) => {
    if (typeof window.flushSync === 'function') {
      try {
        window.flushSync(fn);
      } catch {
        fn();
      }
      try {
        window.flushSync(() => {});
      } catch {
        // ignore
      }
    } else {
      fn();
    }
  };

  const ensureFlushed = () => {
    if (typeof window.flushSync === 'function') {
      try {
        window.flushSync(() => {});
      } catch {
        // ignore
      }
    }
  };

  // Helper methods to interact with the DOM app opaquely
  const helpers = {
    dom,
    window,
    document,
    mockStorage,
    getCopiedText: () => copiedText,
    resetCopiedText: () => { copiedText = null; },
    getVibrateCount: () => vibrateCount,

    // Search input helper
    search: (query) => {
      runWithFlush(() => {
        const searchEl = document.querySelector('#search');
        if (!searchEl) throw new Error('#search input not found');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(searchEl, query);
        searchEl.dispatchEvent(new window.Event('input', { bubbles: true }));
        searchEl.dispatchEvent(new window.Event('change', { bubbles: true }));
      });
      return helpers;
    },

    // Submit search (Enter key)
    submitSearch: async (query) => {
      if (query !== undefined) helpers.search(query);
      runWithFlush(() => {
        const searchEl = document.querySelector('#search');
        searchEl.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    // Clear search input
    clearSearch: () => {
      runWithFlush(() => {
        const clearBtn = document.querySelector('#clearBtn');
        if (clearBtn) clearBtn.click();
      });
      return helpers;
    },

    // Select category nav/chip
    selectCategory: (catId) => {
      runWithFlush(() => {
        const btn = document.querySelector(`[data-cat="${catId}"]`);
        if (!btn) throw new Error(`Category button data-cat="${catId}" not found`);
        btn.click();
      });
      return helpers;
    },

    // Select sub-category code chip
    selectSubCategory: (subCode) => {
      runWithFlush(() => {
        const btn = document.querySelector(`[data-sub="${subCode}"]`);
        if (!btn) throw new Error(`Subcategory chip data-sub="${subCode}" not found`);
        btn.click();
      });
      return helpers;
    },

    // Get list of visible wording items rendered in current view
    getVisibleItems: () => {
      ensureFlushed();
      const rows = Array.from(document.querySelectorAll('#listwrap .row, #listwrap .gcard, #listwrap .trow'));
      return rows.map((row) => {
        const id = row.dataset.id;
        const numEl = row.querySelector('.rnum');
        const txtEl = row.querySelector('.rtxt');
        const pillEl = row.querySelector('.rpill');
        const isFuzzy = !!row.querySelector('.fz');
        const isPinned = !!row.querySelector('[data-act="pin"].pinned');
        return {
          id,
          num: numEl ? numEl.textContent.trim() : '',
          text: txtEl ? txtEl.textContent.replace(/≈/g, '').trim() : '',
          categoryPill: pillEl ? pillEl.textContent.trim() : '',
          isFuzzy,
          isPinned,
          element: row
        };
      });
    },

    // Click item row to copy (async)
    clickItemRow: async (index = 0) => {
      runWithFlush(() => {
        const rows = Array.from(document.querySelectorAll('#listwrap .row, #listwrap .gcard, #listwrap .trow'));
        if (!rows[index]) throw new Error(`Item row index ${index} not found`);
        rows[index].click();
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    // Click item action button ('pin', 'add', 'edit', 'del')
    clickItemAction: async (index = 0, action = 'add') => {
      runWithFlush(() => {
        const rows = Array.from(document.querySelectorAll('#listwrap .row, #listwrap .gcard, #listwrap .trow'));
        if (!rows[index]) throw new Error(`Item row index ${index} not found`);
        const btn = rows[index].querySelector(`[data-act="${action}"]`);
        if (!btn) throw new Error(`Action button [data-act="${action}"] not found on row ${index}`);
        btn.click();
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    // Batch Drawer items & queue helpers
    getBatchItems: () => {
      ensureFlushed();
      const bitems = Array.from(document.querySelectorAll('#blist .bitem'));
      return bitems.map((el) => {
        const idx = el.dataset.bi;
        const text = el.querySelector('.bt')?.textContent || '';
        return { index: parseInt(idx, 10), text, element: el };
      });
    },

    getBatchCount: () => {
      ensureFlushed();
      const countEl = document.querySelector('#bcount');
      return parseInt(countEl?.textContent || '0', 10);
    },

    setDelimiter: (joinerKey) => {
      runWithFlush(() => {
        const sel = document.querySelector('#joinSel');
        if (!sel) throw new Error('#joinSel select element not found');
        const opt = sel.querySelector(`option[value="${joinerKey}"]`);
        if (opt) opt.selected = true;
        if (sel._valueTracker) sel._valueTracker.setValue('');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeSetter.call(sel, joinerKey);
        sel.dispatchEvent(new window.Event('input', { bubbles: true }));
        sel.dispatchEvent(new window.Event('change', { bubbles: true }));
      });
      return helpers;
    },

    toggleAutoClear: (checked) => {
      runWithFlush(() => {
        const chk = document.querySelector('#autoclear');
        if (!chk) throw new Error('#autoclear checkbox not found');
        if (chk.checked !== checked) {
          chk.click();
        }
      });
      return helpers;
    },

    copyBatch: async () => {
      runWithFlush(() => {
        const btn = document.querySelector('#bcopy');
        if (!btn) throw new Error('#bcopy button not found');
        btn.click();
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    clearBatch: () => {
      runWithFlush(() => {
        const btn = document.querySelector('#bclear');
        if (!btn) throw new Error('#bclear button not found');
        btn.click();
      });
      return helpers;
    },

    removeBatchItem: (index) => {
      runWithFlush(() => {
        const rmBtn = document.querySelector(`[data-rm="${index}"]`);
        if (!rmBtn) throw new Error(`Remove batch item button [data-rm="${index}"] not found`);
        rmBtn.click();
      });
      return helpers;
    },

    // Recent History Chips
    getRecentHistoryItems: () => {
      ensureFlushed();
      const chips = Array.from(document.querySelectorAll('#hchips .hchip'));
      return chips.map((c) => ({
        text: c.querySelector('.htxt')?.textContent || '',
        copyAttr: c.dataset.hcopy || ''
      }));
    },

    clickRecentHistoryChip: async (index) => {
      runWithFlush(() => {
        const chips = Array.from(document.querySelectorAll('#hchips .hchip'));
        if (!chips[index]) throw new Error(`Recent history chip index ${index} not found`);
        chips[index].click();
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    clearRecentHistory: () => {
      runWithFlush(() => {
        const btn = document.querySelector('#hclearAll');
        if (btn) btn.click();
      });
      return helpers;
    },

    // Edit Mode controls
    toggleEditMode: () => {
      runWithFlush(() => {
        const btn = document.querySelector('#editBtn');
        if (!btn) throw new Error('#editBtn not found');
        btn.click();
      });
      return helpers;
    },

    isEditModeActive: () => {
      ensureFlushed();
      const btn = document.querySelector('#editBtn');
      return btn?.classList.contains('on') || false;
    },

    openAddModal: () => {
      runWithFlush(() => {
        const btn = document.querySelector('#addBtn');
        if (!btn) throw new Error('#addBtn not found');
        btn.click();
      });
      return helpers;
    },

    saveModalForm: (text, category = 'screen', number = 100) => {
      runWithFlush(() => {
        const textInput = document.querySelector('#mtext');
        const catSelect = document.querySelector('#mcat');
        const numInput = document.querySelector('#mnum');

        if (textInput) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(textInput, text);
          textInput.dispatchEvent(new window.Event('input', { bubbles: true }));
          textInput.dispatchEvent(new window.Event('change', { bubbles: true }));
        }
        if (catSelect) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          nativeSetter.call(catSelect, category);
          catSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
        }
        if (numInput) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(numInput, String(number));
          numInput.dispatchEvent(new window.Event('input', { bubbles: true }));
          numInput.dispatchEvent(new window.Event('change', { bubbles: true }));
        }
      });

      runWithFlush(() => {
        const saveBtn = document.querySelector('#msave');
        if (saveBtn) saveBtn.click();
      });

      return helpers;
    },

    cancelModal: () => {
      runWithFlush(() => {
        const cancelBtn = document.querySelector('#mcancel');
        if (cancelBtn) cancelBtn.click();
      });
      return helpers;
    },

    // Toast Notifications
    getToasts: () => {
      ensureFlushed();
      const toasts = Array.from(document.querySelectorAll('#toasts .toast'));
      return toasts.map((t) => {
        const text = t.querySelector('span')?.textContent || '';
        const isWarn = t.classList.contains('warn');
        const actionBtn = t.querySelector('.tact');
        return {
          text,
          isWarn,
          actionLabel: actionBtn ? actionBtn.textContent.trim() : null,
          actionBtn
        };
      });
    },

    triggerToastAction: (toastIndex = 0) => {
      runWithFlush(() => {
        const toasts = Array.from(document.querySelectorAll('#toasts .toast'));
        if (!toasts[toastIndex]) throw new Error(`Toast index ${toastIndex} not found`);
        const actionBtn = toasts[toastIndex].querySelector('.tact');
        if (!actionBtn) throw new Error(`Toast ${toastIndex} does not have an action button`);
        actionBtn.click();
      });
      return helpers;
    },

    // Storage Management (Export, Import, Reset)
    exportChanges: () => {
      let exportBlob = null;
      let downloadFilename = null;

      const origCreate = window.URL.createObjectURL;
      window.URL.createObjectURL = (blob) => {
        exportBlob = blob;
        return 'blob:mock-export-url';
      };

      const origAnchorClick = window.HTMLAnchorElement.prototype.click;
      window.HTMLAnchorElement.prototype.click = function() {
        downloadFilename = this.download;
      };

      runWithFlush(() => {
        const exportBtn = document.querySelector('#exportBtn');
        if (!exportBtn) throw new Error('#exportBtn not found');
        exportBtn.click();
      });

      window.HTMLAnchorElement.prototype.click = origAnchorClick;
      window.URL.createObjectURL = origCreate;

      return { blob: exportBlob, filename: downloadFilename };
    },

    resetAllChanges: () => {
      runWithFlush(() => {
        const resetBtn = document.querySelector('#resetBtn');
        if (!resetBtn) throw new Error('#resetBtn not found');
        resetBtn.click();
      });
      runWithFlush(() => {
        const resetBtn = document.querySelector('#resetBtn');
        if (!resetBtn) throw new Error('#resetBtn not found');
        resetBtn.click();
      });
      return helpers;
    },

    // Layout Settings
    setLayoutView: (layoutMode) => {
      runWithFlush(() => {
        const setBtn = document.querySelector('#setBtn');
        if (setBtn) setBtn.click();

        const layoutGroup = document.querySelector('#setLayout');
        if (layoutGroup) {
          const btn = layoutGroup.querySelector(`[data-v="${layoutMode}"]`);
          if (btn) btn.click();
        }

        const setDone = document.querySelector('#setdone');
        if (setDone) setDone.click();
      });

      return helpers;
    },

    // LocalStorage accessor
    getStorageJSON: (key) => {
      const raw = mockStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return raw;
      }
    }
  };

  return helpers;
}
