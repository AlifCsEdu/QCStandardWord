# Migration Plan: Mantine UI to shadcn/ui (QC Standard Wording)

## Objectives
1. Migrate from Mantine UI to shadcn/ui (Tailwind CSS v4 + Radix UI + Lucide React + Sonner).
2. Deep Zinc Dark Palette styling (#09090b bg, #18181b cards, #27272a borders, #06b6d4 cyan accents).
3. Custom User Pin Folders/Categories with localStorage persistence.
4. Dedicated Lucide icons and color-coded badges for all defect categories.
5. Cloudflare Pages compatibility (`dist/` output, `wrangler.jsonc`).
6. Zero `@mantine/*` dependencies remaining, clean build (`npm run build`) and clean test suite (`npm run test`).

## Workflow Steps
- **Step 0: Survey**: 3 parallel Explorers map codebase, dependencies, test setup, and Mantine usages.
- **Step 1: Architecture & E2E Plan**: Formulate `PROJECT.md` and `TEST_INFRA.md`.
- **Step 2: Dual Track Execution**:
  - Track 1: E2E Testing Orchestrator (Tiers 1-4 tests -> `TEST_READY.md`)
  - Track 2: Implementation Milestones (Mantine Removal -> Tailwind/Radix Setup -> shadcn Primitives -> Feature Enhancements -> E2E Final Pass & Tier 5 Hardening)
- **Step 3: Completion Audit**: Forensic audit & final verification.
