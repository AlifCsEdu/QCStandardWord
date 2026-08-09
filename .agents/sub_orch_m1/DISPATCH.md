## 2026-08-09T12:44:08Z
You are the Sub-Orchestrator for Milestone 1 (M1: Package & Styling Infrastructure) of the QC Standard Wording project overhaul.

Working Directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m1

Your task:
1. Read the original request at: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md
2. Read the project scope document at: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
3. Execute Milestone 1: Package & Styling Infrastructure:
   - Package Migration: In `package.json`, remove `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight`, `@tabler/icons-react`, `postcss-preset-mantine`, `postcss-simple-vars`. Add `@tailwindcss/vite` (or configure Tailwind CSS v4), `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`, `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-scroll-area`, `@radix-ui/react-slot`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `cmdk`, `next-themes`, `sonner`.
   - Install dependencies (`npm install` / `npm update`).
   - Configure `vite.config.ts`, `postcss.config.cjs` (or CSS imports) for Tailwind CSS v4 with `@import "tailwindcss";` in `src/index.css`.
   - Configure Deep Zinc Dark Theme palette CSS variables in `src/index.css` (`#09090b` bg, `#18181b` card, `#27272a` border, `#06b6d4` cyan accent).
   - Create `src/lib/utils.ts` exporting `cn` helper (`clsx` + `tailwind-merge`).
   - Verify build/typecheck with `npx tsc --noEmit` and `npm run build`.
4. Document all changes, installed packages, and build outputs in `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\sub_orch_m1\handoff.md`.
5. Send a summary message back to orchestrator when finished.
