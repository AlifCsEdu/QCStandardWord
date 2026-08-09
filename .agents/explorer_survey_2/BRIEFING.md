# BRIEFING — 2026-08-09T20:43:00Z

## Mission
Survey all @mantine/* and @tabler/icons-react usages across the QCStandardWording codebase, map Mantine UI components and providers to shadcn/ui primitives / Radix UI / Lucide icons, list all UI files and component boundaries needing migration, and write handoff.md.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigator / Mantine UI & Icons Auditor
- Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_survey_2
- Original parent: ab4d18e8-e0b8-4828-86c9-78ea6701f987
- Milestone: Step 0 Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT modify source code.
- Write findings only to your directory (.agents/explorer_survey_2).

## Current Parent
- Conversation ID: ab4d18e8-e0b8-4828-86c9-78ea6701f987
- Updated: 2026-08-09T20:43:00Z

## Investigation State
- **Explored paths**:
  - `package.json`, `postcss.config.cjs`, `vite.config.ts`, `src/index.css`
  - `src/App.tsx`, `src/main.tsx`
  - All `src/components/*.tsx` (AppHeader, BatchDrawer, CategoryChips, CodeSubChips, DefectCard, EditModal, EditToolbar, HistoryBar, SettingsModal, StatsDashboard, ToastsContainer, WordingContainer, WordingGrid, WordingList, WordingTable)
  - `src/hooks/*.ts` (useAppearance, useQCState)
  - `src/utils/*.ts` (notifications, categoryColors, searchEngine)
  - `src/theme/*.ts` (index, tokens)
  - `tests/harness.js` & test suites for DOM selector requirements
- **Key findings**:
  - 5 Mantine packages (`core`, `hooks`, `notifications`, `spotlight`, `postcss-preset-mantine`) + `@tabler/icons-react` to be removed.
  - Complete mapping created for 15+ Mantine components to shadcn/ui (Radix UI + Lucide + Sonner + Command).
  - DOM IDs (`#appHeader`, `#sidebarNav`, `#setLayout`, `#batchDrawer`, `#toasts`, `#search`) and `data-testid` attributes identified to preserve test suite compatibility.
- **Unexplored areas**: None. Comprehensive survey complete.

## Key Decisions Made
- Fully documented all Mantine/Tabler package dependencies, component mappings, icon replacements, and target UI file boundaries in `handoff.md`.

## Artifact Index
- handoff.md — Complete survey findings report
