## 2026-08-09T12:52:04Z
You are Sub-Orchestrator / Specialist Worker for Milestone 3 (M3: Custom Pin Folders & State Layer Overhaul) of the QC Standard Wording project overhaul.

Working Directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m3

Your task:
1. Read original request at: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md
2. Read project scope document at: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
3. Execute Milestone 3: Custom Pin Folders & State Layer:
   - In `src/types/qc.ts`, define `CustomPinFolder` interface (`id`, `name`, `color`, `itemIds`, `createdAt`).
   - In `src/hooks/useQCState.ts`, add `qc-pin-folders` localStorage key (14th key). Implement auto-migration from legacy `qc-pins` to a default "Starred Defects" folder if no folders exist.
   - Add state & action methods to `useQCState`: `folders`, `activeFolderId`, `setActiveFolderId`, `createFolder`, `deleteFolder`, `renameFolder`, `togglePinToFolder`, `isPinnedInFolder`, `getItemFolderIds`.
   - Preserve all existing 13 localStorage keys (`qc-pins`, `qc-recents`, `qc-history`, `qc-batch`, `qc-join`, `qc-autoclear`, `qc-edits`, `qc-dels`, `qc-custom`, `qc-appearance`, `qc-theme`, `qc-density`, `qc-sort`).
   - In `src/hooks/useAppearance.ts`, remove all `@mantine/*` references (`data-mantine-color-scheme`, etc.). Support dark class (`classList.toggle('dark')`) and `data-theme` attribute management for Deep Zinc Dark Theme palette.
   - Verify execution with `npx tsc --noEmit` and `npm test`.
4. Document all updated files, hook interfaces, and test results in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m3\handoff.md`.
5. Send a summary message back to orchestrator when finished.
