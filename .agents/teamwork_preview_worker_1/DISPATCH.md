## 2026-08-16T01:54:14Z

You are the Master Implementation Worker for the QC Standard Wording Overhaul.
Your working directory is: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_worker_1
Authoritative request: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\ORIGINAL_REQUEST.md
Scope document: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
Test Infra document: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\TEST_READY.md

Blueprint references (MUST READ):
- Ergonomics Blueprint: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_explorer_m1_1\handoff.md
- Settings Blueprint: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_explorer_m1_2\handoff.md
- Category & History Blueprint: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\teamwork_preview_explorer_m1_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Owned Files:
Implement the complete end-to-end functionality for Requirements R1, R2, R3, and R4:
1. `src/types/qc.ts`: Add `DensityMode` ('compact' | 'cozy' | 'tablet'), `RadiusOption` ('0' | '6' | '10' | '16' | 'sharp' | 'soft' | 'round'), `TextSizeOption` ('13' | '14' | '16' | 's' | 'm' | 'l'), `AccentOption` ('amber' | 'emerald' | 'stone' | 'rose' | 'blue' | string), `ThemeMode` ('dark' | 'light' | 'auto'), extended `CategoryKey`, `CategoryInfo` with `iconType`, `iconValue`, `subCodes`, `order`, and `HistoryEntry`.
2. `src/utils/timeUtils.ts`: Implement `formatRelativeTime` ("Just now", "2m ago", "1h ago", "Yesterday") and `formatFullDateTime`.
3. `src/utils/categoryColors.ts`: Implement 24 curated Lucide icons, dynamic color resolver with customCategories, `renderCategoryIcon` (Lucide + Emoji), whitespace trimming, case-insensitivity, badge and left border helpers.
4. `src/hooks/useAppearance.ts`: Dynamic root injection (`data-theme`, `data-density`, `data-radius`, `data-font-size`, `data-text-size`, `data-accent`, `data-motion`, `data-layout`, `--radius`, `document.documentElement.style.fontSize`), system theme listener for 'auto', and multi-tab `storage` event listener.
5. `src/hooks/useQCState.ts`: Master state with dynamic categories (`qc-categories`, `qc-category-order`), Category CRUD (`addCategory`, `updateCategory`, `deleteCategory`, `moveCategoryUp`, `moveCategoryDown`, `addSubCategoryCode`, `removeSubCategoryCode`), structured history (`qc-history-entries`, `addHistoryEntry`, `clearHistoryEntries`, `addAllHistoryToBatch`, `historyDrawerOpen`, `categoryManagerOpen`) while keeping legacy `qc-recents`, `qc-history`, and `#histbar` synced.
6. `src/index.css`: Density CSS (compact 36px, cozy 44px, tablet 48px), radius rules, font sizes (13px, 14px, 16px), 5 rich accent palettes (Warm Amber, Sage Emerald, Slate Stone, Rose Red, Ocean Blue), reduced motion override, touch-manipulation, and custom sleek scrollbars.
7. `src/components/SettingsModal.tsx`: Complete settings dialog with Theme, Density, Radius, Font Size, 5 Accents, Motion, preserving all legacy IDs (`#setmodal`, `#setLayout`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`, `#setdone`).
8. `src/components/CategoryManagerModal.tsx`: Dedicated modal with hybrid Lucide (24 icons) or Emoji picker, color picker (8 presets + custom hex with live badge preview), reordering, and sub-category chip editor.
9. `src/components/HistoryDrawer.tsx`: Dedicated slide-out Sheet with search/filter, relative timestamps, one-click copy, pin to folder dropdown, add all to batch, and clear history with Radix confirmation dialog.
10. `src/components/AppHeader.tsx`, `CategoryChips.tsx`, `CodeSubChips.tsx`, `DefectCard.tsx`, `BatchDrawer.tsx`, `EditModal.tsx`, `EditToolbar.tsx`, `StatsDashboard.tsx`, `App.tsx`: Standardize touch ergonomics (min 44-48px touch targets), Radix Select, shadcn Checkbox, Sheet, ToggleGroup, replace hardcoded `bg-[#121214]` with semantic tokens (`bg-background`, `bg-card`, `border-border`), and preserve all legacy DOM test IDs.
