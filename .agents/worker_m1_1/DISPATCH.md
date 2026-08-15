## 2026-08-09T13:41:40Z
<USER_REQUEST>
You are Worker 1 for Milestone 1 (Warm Stone Base Theme & AI Tropes Elimination).
Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m1_1

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Mandatory Inputs:
- Read c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md
- Read c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
- Read c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m1_1\handoff.md
- Read c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m1_2\handoff.md
- Read c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m1_3\handoff.md

Your Mission:
1. Update `src/index.css`, `@theme` declarations, and theme tokens for the Raycast Warm Stone palette:
   - Base dark background: `#121214`
   - Base light background: `#fcfcfc`
   - Warm grey borders: `border-stone-800` (`#292524`) for dark mode / `border-stone-200` (`#e7e5e4`) for light mode
   - Tactile card surfaces (`#18181b` dark / `#ffffff` light with clean 1px border and tactile shadow)
   - Solid subtle overlays for drawers and modals (`bg-black/60`, zero blur).
2. Completely eliminate generic AI design tropes across `src/`:
   - 0 heavy glassmorphism blurs (`backdrop-blur-*`, `backdrop-filter: blur(...)`)
   - 0 neon cyan/purple/pink gradients (`bg-gradient-to-r`, `linear-gradient(135deg, rgba(6, 182, 212, ...))`)
   - 0 glowing halos or radial neon shadows (`shadow-[0_0_...]`, `.glow-cyan-*`, `.ambient-cyan-glow`)
   - 0 white opacity glass borders (`border-white/[0.08]`)
3. Refactor hardcoded inline styles into dark-theme Warm Stone Tailwind classes:
   - `HistoryBar.tsx`: Purge redundant `style={{ display: ... }}` and `#fff9db` or neon amber styles. Preserve element IDs (`id="histbar"`, `#hclearAll`, etc.) and test attributes (`data-hcopy`).
   - `EditToolbar.tsx`: Purge redundant `style={{ display: ... }}` and `#e7f5ff` / cyan styles. Preserve element IDs (`id="editstrip"`, `#importFile`, `#addBtn`, etc.).
   - `CodeSubChips.tsx`: Purge redundant `style={{ display: ... }}` and cyan styles. Preserve element IDs (`id="subchips"`, `data-sub`).
   - `BatchDrawer.tsx`, `EditModal.tsx`, `SettingsModal.tsx`: Purge redundant `style={{ display: ... }}` and `backdrop-blur-*` or `#0c0e12` hexes.
   - `DefectCard.tsx`, `CategoryChips.tsx`, `AppHeader.tsx`, `WordingContainer.tsx`, `WordingTable.tsx`, `ui/sheet.tsx`, `ui/dialog.tsx`: Purge `backdrop-blur-*`, neon gradients, and glowing halos.
4. Execute build and test verification:
   - Run `npm run build` and ensure clean static asset build without errors.
   - Run `npm run test` and ensure 100% of tests pass.
5. Write your completion handoff report to `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_m1_1\handoff.md` including exact build and test outputs, and update `progress.md` in your directory.
6. When complete, send a message to the parent (conversation ID: 0bbef02d-1eed-4b0a-b759-e5df0a8e3939).
</USER_REQUEST>
