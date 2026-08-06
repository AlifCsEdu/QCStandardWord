## 2026-08-07T01:04:29Z
You are Worker M3 (React UI & Test Harness Implementer).
Your working directory is c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m3\.
Read c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md and c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md.
Read Explorer Remediation handoff report at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_remediation\handoff.md and analysis report at c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_remediation\analysis.md.

Your scope for Milestone 3 & Remediation:
1. Create src/hooks/useAppearance.ts: Manages theme (light/dark), accent palette, radius, text size, density (cozy/compact), layout mode (list, grid, table).
2. Create src/hooks/useQCState.ts: Complete reactive state hook managing 140 defect items (qcData.ts + custom edits + deletions), search query q, category cat, sub-category sub, pins set, recents array, history array, batch queue items, delimiter selection (nl, comma, semi, space), auto-clear toggle, inline edit modal state, 4.2s Undo toast state, JSON import/export, and hard reset. Persists state to 13 localStorage keys matching legacy names (qc-appearance, qc-sort, qc-theme, qc-density, qc-pins, qc-recents, qc-history, qc-batch, qc-join, qc-autoclear, qc-edits, qc-dels, qc-custom).
3. Create Mantine UI v7 modular components in src/components/:
   - AppHeader.tsx: Header, search input (#search), batch drawer toggle button (#batchBtn), badge (#bcount), view selector (#layoutSel), edit mode toggle (#editBtn), settings button (#settingsBtn), theme toggle.
   - CategoryBar.tsx: Category selector chips ([data-cat]) for all 13 categories + 2 virtual views (pinned, recent).
   - CodeSubChips.tsx: Panel code chips ([data-sub]) when category is codes (ALL, FCPB, FCPW, FCPC, RCPB, RCPW, RCPC, FCDS, RCDS, PC).
   - WordingList.tsx / WordingGrid.tsx / WordingTable.tsx: Render wording items with DOM class/id attributes (.row, .gcard, .trow, .rnum, .rtxt, .rpill, .fz, [data-act], [data-id], [data-pin]). Highlighting matched substrings and showing ≈ indicator for fuzzy matches. Supporting copy to clipboard, pin/unpin, edit item trigger.
   - BatchDrawer.tsx: Slide-out Mantine Drawer (#batchDrawer). Delimiter selector (#joinSel), auto-clear toggle (#autoclear), batch queue list, copy batch button (#bcopy), bulk paste import input (#batchImport).
   - EditModal.tsx: Inline Edit Modal (#editModal). Add custom item (#addBtn), update item, delete item with 4.2s Undo toast (#toasts, .toast, .tact), JSON export (#exportBtn), JSON import (#importBtn), armed hard reset fallback (#resetBtn).
   - SettingsModal.tsx: Theme, accent palette, radius, text size, density settings.
4. Update src/App.tsx: Main Mantine AppShell integrating all components, hooks, notifications, drawer, and modals.
5. Refactor tests/harness.js: Update createAppInstance() to compile/load src/App.tsx and render <MantineProvider><App /></MantineProvider> into JSDOM <div id="root"></div>. Ensure all DOM element IDs, classes, data-attributes, and helper method contracts in tests/harness.js match the React components so all 32+ tests in tests/*.test.js execute against src/ modules.
6. Execute npm run test and npm run build to verify 100% test pass rate and clean production build.
7. Deliver handoff report to c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m3\handoff.md.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
