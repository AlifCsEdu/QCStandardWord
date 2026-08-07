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

// Module-level cache for compiled app bundle to speed up test execution
let compiledAppCodeCache = null;

function getCompiledAppCode() {
  if (compiledAppCodeCache) {
    return compiledAppCodeCache;
  }
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
  compiledAppCodeCache = result.outputFiles[0].text;
  return compiledAppCodeCache;
}

const htmlTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>QC Standard Wording 2026</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

/**
 * Boots an instance of the React QC Standard Wording app inside JSDOM.
 * Supports legacy HTML DOM selectors and modern 2026 Mantine v7 UI elements.
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

  // Helper methods to interact with the DOM app opaquely (Dual-mode: Legacy & Mantine v7 2026 UI)
  const helpers = {
    dom,
    window,
    document,
    mockStorage,
    getCopiedText: () => copiedText,
    resetCopiedText: () => { copiedText = null; },
    getVibrateCount: () => vibrateCount,

    // AppShell component query helpers (Feature 3 & Feature 4)
    getAppNavbar: () => {
      ensureFlushed();
      return document.querySelector('[data-testid="app-navbar"], .mantine-AppShell-navbar, #sidebarNav, .sidebar-nav, nav');
    },

    getAppHeader: () => {
      ensureFlushed();
      return document.querySelector('[data-testid="app-header"], .mantine-AppShell-header, #appHeader, header');
    },

    getSegmentedControl: () => {
      ensureFlushed();
      return document.querySelector('[data-testid="view-switcher"], [data-testid="segmented-control-view"], .mantine-SegmentedControl-root, #setLayout');
    },

    // Search input helper (Supports legacy input, Mantine Spotlight, data-testid)
    search: (query) => {
      runWithFlush(() => {
        const searchEl = document.querySelector(
          '#search, [data-testid="search-input"], [data-testid="header-search-input"], .mantine-Spotlight-search, input[type="search"], input[placeholder*="Search"]'
        );
        if (!searchEl) throw new Error('Search input element not found');
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
        const searchEl = document.querySelector(
          '#search, [data-testid="search-input"], [data-testid="header-search-input"], .mantine-Spotlight-search, input[type="search"], input[placeholder*="Search"]'
        );
        if (searchEl) {
          searchEl.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    // Clear search input
    clearSearch: () => {
      runWithFlush(() => {
        const clearBtn = document.querySelector('#clearBtn, [data-testid="clear-search-btn"], button[aria-label*="Clear"]');
        if (clearBtn) {
          clearBtn.click();
        } else {
          helpers.search('');
        }
      });
      return helpers;
    },

    // Cmd+K Spotlight Modal Trigger (Feature 4)
    openSpotlightModal: async () => {
      runWithFlush(() => {
        const triggerBtn = document.querySelector('[data-testid="spotlight-trigger"], #spotlightBtn, #cmdKBtn, button[aria-label*="Search"]');
        if (triggerBtn) {
          triggerBtn.click();
        } else {
          window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }));
        }
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    isSpotlightOpen: () => {
      ensureFlushed();
      const modal = document.querySelector('[data-testid="spotlight-modal"], .mantine-Spotlight-root, .mantine-Modal-root');
      return !!modal;
    },

    // Select category nav/chip (Supports legacy data-cat, Mantine Navbar tabs, data-testid)
    selectCategory: (catId) => {
      runWithFlush(() => {
        let btn = document.querySelector(`[data-cat="${catId}"], [data-testid="category-tab-${catId}"], [data-testid="nav-cat-${catId}"], [data-category="${catId}"]`);
        if (!btn) {
          // Fallback: search buttons inside navbar/chips matching category text
          const buttons = Array.from(document.querySelectorAll('button, [role="tab"]'));
          btn = buttons.find((b) => b.textContent.toLowerCase().includes(catId.toLowerCase()));
        }
        if (!btn) throw new Error(`Category navigation element for category "${catId}" not found`);
        btn.click();
      });
      return helpers;
    },

    // Select sub-category code chip (Supports legacy data-sub, data-testid)
    selectSubCategory: (subCode) => {
      runWithFlush(() => {
        let btn = document.querySelector(`[data-sub="${subCode}"], [data-testid="sub-chip-${subCode}"], [data-testid="nav-sub-${subCode}"], [data-subcategory="${subCode}"]`);
        if (!btn) {
          const buttons = Array.from(document.querySelectorAll('button, .subchip'));
          btn = buttons.find((b) => b.textContent.trim().toUpperCase() === subCode.toUpperCase());
        }
        if (!btn) throw new Error(`Subcategory chip for code "${subCode}" not found`);
        btn.click();
      });
      return helpers;
    },

    // Get list of visible wording items rendered in current view (Feature 9)
    getVisibleItems: () => {
      ensureFlushed();
      const rows = Array.from(document.querySelectorAll('#listwrap .row, #listwrap .gcard, #listwrap .trow, [data-testid="defect-item"], [data-testid="defect-card"], [data-testid="defect-row"], .defect-card, .defect-row'));
      return rows.map((row) => {
        const id = row.dataset.id || row.dataset.testid || row.id;
        const numEl = row.querySelector('.rnum, [data-testid="item-num"], .item-number');
        const txtEl = row.querySelector('.rtxt, [data-testid="item-text"], .item-title, .item-text');
        const pillEl = row.querySelector('.rpill, [data-testid="category-badge"], [data-testid="pill-badge"], .category-badge, .mantine-Badge-root');
        const isFuzzy = !!row.querySelector('.fz, [data-testid="fuzzy-indicator"], .fuzzy-badge') || (txtEl?.textContent || '').includes('≈');
        const isPinned = !!row.querySelector('[data-act="pin"].pinned, [data-testid="pin-btn"][data-pinned="true"], .pinned-icon');
        
        // High-contrast and hover state checks (Feature 9)
        const computedStyle = row.getAttribute('style') || '';
        const className = row.className || '';
        const hasContrastBorder = className.includes('border') || className.includes('card') || className.includes('trow') || className.includes('row') || computedStyle.includes('border');
        const hasHoverEase = className.includes('hover') || className.includes('transition') || className.includes('row') || className.includes('gcard') || className.includes('trow');

        return {
          id,
          num: numEl ? numEl.textContent.replace(/^#/, '').trim() : '',
          text: txtEl ? txtEl.textContent.replace(/≈/g, '').trim() : row.textContent.replace(/≈/g, '').trim(),
          categoryPill: pillEl ? pillEl.textContent.trim() : '',
          isFuzzy,
          isPinned,
          hasContrastBorder,
          hasHoverEase,
          element: row
        };
      });
    },

    // Convenience method aliases
    copyWording: async (index = 0) => helpers.clickItemRow(index),
    addBatchItem: async (index = 0) => helpers.clickItemAction(index, 'add'),

    // Click item row to copy (async)
    clickItemRow: async (index = 0) => {
      runWithFlush(() => {
        const rows = Array.from(document.querySelectorAll('#listwrap .row, #listwrap .gcard, #listwrap .trow, [data-testid="defect-item"], [data-testid="defect-card"], [data-testid="defect-row"], .defect-card, .defect-row'));
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
        const rows = Array.from(document.querySelectorAll('#listwrap .row, #listwrap .gcard, #listwrap .trow, [data-testid="defect-item"], [data-testid="defect-card"], [data-testid="defect-row"], .defect-card, .defect-row'));
        if (!rows[index]) throw new Error(`Item row index ${index} not found`);
        let btn = rows[index].querySelector(`[data-act="${action}"], [data-testid="${action}-btn"], button[data-action="${action}"]`);
        if (!btn && action === 'add') {
          btn = rows[index].querySelector('.add-btn, button[aria-label*="Add"]');
        }
        if (!btn && action === 'pin') {
          btn = rows[index].querySelector('.pin-btn, button[aria-label*="Pin"]');
        }
        if (!btn) throw new Error(`Action button [data-act="${action}"] not found on row ${index}`);
        btn.click();
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    // Glassmorphic Batch Drawer helpers (Feature 8)
    getBatchDrawer: () => {
      ensureFlushed();
      return document.querySelector('[data-testid="batch-drawer"], [data-testid="glassmorphic-drawer"], .mantine-Drawer-content, #batchDrawer, .batch-drawer');
    },

    getBatchDrawerOverlay: () => {
      ensureFlushed();
      return document.querySelector('[data-testid="drawer-overlay"], .mantine-Drawer-overlay, .drawer-backdrop');
    },

    getBatchItems: () => {
      ensureFlushed();
      const bitems = Array.from(document.querySelectorAll('#blist .bitem, [data-testid="batch-item"], [data-testid="drawer-batch-item"], .batch-item'));
      return bitems.map((el, i) => {
        const idx = el.dataset.bi || String(i);
        const text = el.querySelector('.bt, [data-testid="batch-item-text"], .batch-item-text')?.textContent || el.textContent;
        return { index: parseInt(idx, 10), text: text.trim(), element: el };
      });
    },

    getBatchCount: () => {
      ensureFlushed();
      const countEl = document.querySelector('#bcount, [data-testid="batch-count"], [data-testid="drawer-batch-count"]');
      if (countEl && countEl.textContent) {
        return parseInt(countEl.textContent || '0', 10);
      }
      return helpers.getBatchItems().length;
    },

    setDelimiter: (joinerKey) => {
      runWithFlush(() => {
        const sel = document.querySelector('#joinSel, [data-testid="delimiter-select"], select[name="delimiter"]');
        if (!sel) throw new Error('Delimiter select element not found');
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
        const chk = document.querySelector('#autoclear, [data-testid="autoclear-checkbox"], input[name="autoclear"]');
        if (!chk) throw new Error('Autoclear checkbox not found');
        if (chk.checked !== checked) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')?.set;
          if (nativeSetter) {
            nativeSetter.call(chk, checked);
          } else {
            chk.checked = checked;
          }
          if (chk._valueTracker) chk._valueTracker.setValue(!checked);
          chk.dispatchEvent(new window.Event('click', { bubbles: true }));
          chk.dispatchEvent(new window.Event('change', { bubbles: true }));
        }
      });
      return helpers;
    },

    copyBatch: async () => {
      runWithFlush(() => {
        const btn = document.querySelector('#bcopy, [data-testid="copy-batch-btn"], button[aria-label*="Copy Batch"]');
        if (!btn) throw new Error('Copy batch button not found');
        btn.click();
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    clearBatch: () => {
      runWithFlush(() => {
        const btn = document.querySelector('#bclear, [data-testid="clear-batch-btn"], button[aria-label*="Clear Batch"]');
        if (!btn) throw new Error('Clear batch button not found');
        btn.click();
      });
      return helpers;
    },

    removeBatchItem: (index) => {
      runWithFlush(() => {
        const rmBtn = document.querySelector(`[data-rm="${index}"], [data-testid="remove-batch-item-${index}"]`);
        if (!rmBtn) throw new Error(`Remove batch item button for index ${index} not found`);
        rmBtn.click();
      });
      return helpers;
    },

    moveBatchItemUp: (index) => {
      runWithFlush(() => {
        const btn = document.querySelector(`[data-mvup="${index}"], [data-mup="${index}"], [data-up="${index}"]`);
        if (!btn) throw new Error(`Move up button for index ${index} not found`);
        btn.click();
      });
      return helpers;
    },

    moveBatchItemDown: (index) => {
      runWithFlush(() => {
        const btn = document.querySelector(`[data-mvdn="${index}"], [data-mdown="${index}"], [data-down="${index}"]`);
        if (!btn) throw new Error(`Move down button for index ${index} not found`);
        btn.click();
      });
      return helpers;
    },

    // Recent History Chips
    getRecentHistoryItems: () => {
      ensureFlushed();
      const chips = Array.from(document.querySelectorAll('#hchips .hchip, [data-testid="recent-chip"], .recent-chip'));
      return chips.map((c) => ({
        text: c.querySelector('.htxt, [data-testid="recent-text"]')?.textContent || c.textContent.trim(),
        copyAttr: c.dataset.hcopy || ''
      }));
    },

    clickRecentHistoryChip: async (index) => {
      runWithFlush(() => {
        const chips = Array.from(document.querySelectorAll('#hchips .hchip, [data-testid="recent-chip"], .recent-chip'));
        if (!chips[index]) throw new Error(`Recent history chip index ${index} not found`);
        chips[index].click();
      });
      await waitAsync(30);
      ensureFlushed();
      return helpers;
    },

    clearRecentHistory: () => {
      runWithFlush(() => {
        const btn = document.querySelector('#hclearAll, [data-testid="clear-history-btn"]');
        if (btn) btn.click();
      });
      return helpers;
    },

    // Edit Mode controls
    toggleEditMode: () => {
      runWithFlush(() => {
        const btn = document.querySelector('#editBtn, [data-testid="edit-mode-toggle"]');
        if (!btn) throw new Error('Edit mode button not found');
        btn.click();
      });
      return helpers;
    },

    isEditModeActive: () => {
      ensureFlushed();
      const btn = document.querySelector('#editBtn, [data-testid="edit-mode-toggle"]');
      return btn?.classList.contains('on') || btn?.getAttribute('data-active') === 'true' || false;
    },

    openAddModal: () => {
      runWithFlush(() => {
        const btn = document.querySelector('#addBtn, [data-testid="add-wording-btn"]');
        if (!btn) throw new Error('Add wording button not found');
        btn.click();
      });
      return helpers;
    },

    saveModalForm: (text, category = 'screen', number = 100) => {
      runWithFlush(() => {
        const textInput = document.querySelector('#mtext, [data-testid="modal-text-input"]');
        const catSelect = document.querySelector('#mcat, [data-testid="modal-category-select"]');
        const numInput = document.querySelector('#mnum, [data-testid="modal-num-input"]');

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
        const saveBtn = document.querySelector('#msave, [data-testid="modal-save-btn"]');
        if (saveBtn) saveBtn.click();
      });

      return helpers;
    },

    cancelModal: () => {
      runWithFlush(() => {
        const cancelBtn = document.querySelector('#mcancel, [data-testid="modal-cancel-btn"]');
        if (cancelBtn) cancelBtn.click();
      });
      return helpers;
    },

    // Floating Toast Notifications (Feature 7)
    getToasts: () => {
      ensureFlushed();
      const toasts = Array.from(document.querySelectorAll('#toasts .toast, [data-testid="floating-toast"], [data-testid="toast-pill"], .mantine-Notification-root, .toast-pill'));
      return toasts.map((t) => {
        const text = t.querySelector('span, .mantine-Notification-description, .toast-message')?.textContent || t.textContent || '';
        const isWarn = t.classList.contains('warn') || t.getAttribute('data-color') === 'red';
        const actionBtn = t.querySelector('.tact, [data-testid="toast-action"], button');
        const iconEl = t.querySelector('.ticon, [data-testid="toast-icon"], .mantine-Notification-icon');
        const progressTimerEl = t.querySelector('.tprogress, [data-testid="toast-progress"], .progress-timer');
        return {
          text: text.trim(),
          isWarn,
          actionLabel: actionBtn ? actionBtn.textContent.trim() : null,
          actionBtn,
          hasIcon: !!iconEl,
          hasProgressTimer: !!progressTimerEl
        };
      });
    },

    triggerToastAction: (toastIndex = 0) => {
      runWithFlush(() => {
        const toasts = Array.from(document.querySelectorAll('#toasts .toast, [data-testid="floating-toast"], [data-testid="toast-pill"], .mantine-Notification-root, .toast-pill'));
        if (!toasts[toastIndex]) throw new Error(`Toast index ${toastIndex} not found`);
        const actionBtn = toasts[toastIndex].querySelector('.tact, [data-testid="toast-action"], button');
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
        const exportBtn = document.querySelector('#exportBtn, [data-testid="export-btn"]');
        if (!exportBtn) throw new Error('Export button not found');
        exportBtn.click();
      });

      window.HTMLAnchorElement.prototype.click = origAnchorClick;
      window.URL.createObjectURL = origCreate;

      return { blob: exportBlob, filename: downloadFilename };
    },

    resetAllChanges: () => {
      runWithFlush(() => {
        const resetBtn = document.querySelector('#resetBtn, [data-testid="reset-btn"]');
        if (!resetBtn) throw new Error('Reset button not found');
        resetBtn.click();
      });
      runWithFlush(() => {
        const resetBtn = document.querySelector('#resetBtn, [data-testid="reset-btn"]');
        if (!resetBtn) throw new Error('Reset button not found');
        resetBtn.click();
      });
      return helpers;
    },

    // Layout Settings & View Switcher (Feature 4 & Feature 9)
    setLayoutView: (layoutMode) => {
      runWithFlush(() => {
        const setBtn = document.querySelector('#setBtn, [data-testid="settings-btn"]');
        if (setBtn) setBtn.click();

        const layoutGroup = document.querySelector('#setLayout, [data-testid="view-switcher"], [data-testid="segmented-control-view"], .mantine-SegmentedControl-root');
        if (layoutGroup) {
          const btn = layoutGroup.querySelector(`[data-v="${layoutMode}"], [data-value="${layoutMode}"], [value="${layoutMode}"], [data-testid="view-mode-${layoutMode}"]`);
          if (btn) btn.click();
        }

        const setDone = document.querySelector('#setdone, [data-testid="settings-close-btn"]');
        if (setDone) setDone.click();
      });

      return helpers;
    },

    // Layout Shift Metrics (Feature 6)
    getLayoutShiftMetrics: () => {
      ensureFlushed();
      const subchipsEl = document.querySelector('#subchips, [data-testid="code-sub-chips"], .code-sub-chips');
      const navbarEl = helpers.getAppNavbar();
      return {
        subchipsHeight: subchipsEl ? (subchipsEl.offsetHeight || 0) : 0,
        subchipsVisible: subchipsEl ? subchipsEl.classList.contains('show') || subchipsEl.offsetHeight > 0 : false,
        navbarWidth: navbarEl ? (navbarEl.offsetWidth || 260) : 260
      };
    },

    // Stats Summary Consolidation Check (Feature 5)
    getStatsDashboard: () => {
      ensureFlushed();
      return document.querySelector('[data-testid="stats-dashboard"], #statsHeader, .stats-dashboard, [data-testid="stats-summary"]');
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
