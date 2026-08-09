## 2026-08-09T12:54:08Z
You are Sub-Orchestrator / Specialist Worker for Milestone 4 (M4: Application Layout & Component Overhaul) of the QC Standard Wording project overhaul.

Working Directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m4

Your task:
1. Read original request at: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md
2. Read project scope document at: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
3. Execute Milestone 4: Application Layout & Component Overhaul:
   - Overhaul `src/App.tsx`: Completely remove `MantineProvider`, `AppShell`, `Spotlight`, `Notifications`, `Affix`, `Transition`. Replace with Tailwind CSS v4 flex/grid layout, `ThemeProvider`, `CommandDialog` (Cmd+K Spotlight search), `Toaster` (Sonner), and fixed Scroll-to-Top button.
   - Overhaul `AppHeader.tsx`: Replace `SegmentedControl` with `ToggleGroup`, `Burger` with `Button`, Tabler icons with Lucide icons (`Search`, `Sliders`, `Plus`, `Folder`). Add Custom Pin Folder management triggers.
   - Overhaul `CategoryChips.tsx`: Render dedicated Lucide icons for all 15 categories, left border accent indicators, and Custom User Pin Folder navigation tabs.
   - Overhaul `DefectCard.tsx`: Deep Zinc Dark Card styling (`bg-zinc-900 border-zinc-800`), category Lucide icon, left border accent (`border-l-4`), multi-folder starring dropdown/modal, single-click copy, batch add button.
   - Overhaul `BatchDrawer.tsx`: Convert Mantine `Drawer` into glassmorphic slide-out `Sheet` (`@radix-ui/react-dialog`). Update drawer controls with shadcn primitives (`Button`, `Select`, `Checkbox`, `Textarea`).
   - Overhaul `EditModal.tsx` & `SettingsModal.tsx`: Convert custom backdrops into shadcn `Dialog` primitives.
   - Overhaul `StatsDashboard.tsx`: Convert `Paper` to shadcn `Card` with Lucide icons (`LayoutDashboard`, `Filter`, `Bookmark`, `Copy`).
   - Overhaul `WordingList.tsx`, `WordingGrid.tsx`, `WordingTable.tsx`: Update layouts to use new shadcn `Card`, `Badge`, `Button`, `Table` primitives.
   - Ensure ZERO `@mantine` imports remain in any component file in `src/`.
   - Preserve all required DOM IDs (`#appHeader`, `#sidebarNav`, `#setLayout`, `#batchDrawer`, `#toasts`, `#search`) and `data-testid` markers (`app-header`, `app-navbar`, `view-switcher`, `floating-toast`, `batch-drawer`).
   - Verify execution with `npx tsc --noEmit` (0 errors), `npm run build` (clean dist output), and `npm test` (all tests passing).
4. Document all updated files, component mappings, and test results in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m4\handoff.md`.
5. Send a summary message back to orchestrator when finished.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
