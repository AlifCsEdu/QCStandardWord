## 2026-08-07T01:35:54Z
You are teamwork_preview_worker for the QC Standard Wording modernization project.
Your working directory is: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_mantine_modernization

Please read ORIGINAL_REQUEST.md at:
c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md

And read PROJECT.md at:
c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\orchestrator\PROJECT.md

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task:
1. Inspect the codebase at `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`.
2. Check if `@mantine/spotlight` and `@mantine/notifications` are installed in `package.json`. If not, add them and install.
3. Ensure the following Mantine UI v7 components/features are cleanly integrated into the application:
   - Mantine Spotlight (`@mantine/spotlight`) with `Cmd+K` / `Ctrl+K` search modal to quickly search and select QC wording items with keyboard navigation.
   - `SegmentedControl` from `@mantine/core` for switching between List, Grid, and Table view modes.
   - Mantine `Affix` (`import { Affix } from '@mantine/core'`) for the floating scroll-to-top button.
   - Dynamic light/dark theme handling using `useMantineColorScheme` / `useComputedColorScheme` from `@mantine/core`.
   - Inspection Stats Dashboard header showing category breakdown badges and active filters.
   - Slide-out Mantine Drawer for batch operations, custom delimiters (\n, comma, semicolon, space), favorites/pinning, inline Edit mode, and localStorage persistence.
   - `wrangler.jsonc` configured with `"assets": {"directory": "./dist"}` and `public/_redirects` SPA fallback.
4. Run all verification commands and ensure 100% pass:
   - `npm test` (All 32+ JSDOM opaque-box test suites pass cleanly)
   - `npx tsx --test tests/searchEngine.test.ts` (15/15 search engine unit tests pass cleanly)
   - `npm run build` (`tsc && vite build` completes cleanly with 0 errors)
   - `npx wrangler deploy --dry-run` (completes cleanly with 0 errors)
5. Write your complete handoff report in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\worker_mantine_modernization\handoff.md`.
6. Send a message back to the orchestrator with your results and file path.
