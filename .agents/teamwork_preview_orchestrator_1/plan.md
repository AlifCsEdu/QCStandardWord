# Project Plan: QC Standard Wording Overhaul

## Overview
Comprehensive overhaul to make the QC Standard Wording application 100% touch-screen friendly (Samsung Tab S9+), 100% shadcn/ui component styling, fully functional settings engine, advanced Category & Sub-Category Manager with edit mode, and rich Inspection History Drawer with 100% test pass and build verification.

## Phase 0: Survey & Scope Enumeration
- **Task 0.1**: Dispatch 3 parallel Explorers / Spec Miners to investigate:
  1. Explorer 1: Frontend UI architecture, touch ergonomics, Tailwind/CSS variables, existing components, layout, scrollbars, radix/shadcn primitives.
  2. Explorer 2: Settings engine, theme/density/radius/font/accent/motion state management, localStorage persistence, History storage & components.
  3. Explorer 3: Categories & sub-categories data model, wording items, current CRUD/editing flows, existing tests (`npm test`, vitest/jest, playwright/cypress, etc.) and build scripts (`npm run build`).
- **Task 0.2**: Merge explorer findings into `PROJECT.md` with complete Feature Inventory, Architecture, Milestones, and Code Layout.

## Phase 1: Dual-Track Execution
### Track A: E2E & Unit Test Infrastructure (R5)
- Establish comprehensive test harness (Tiers 1-4: Feature, Boundary, Cross-feature, Real-world).
- Publish `TEST_INFRA.md` and `TEST_READY.md`.

### Track B: Implementation Milestones
- **Milestone 1 (R1)**: Samsung Tab S9+ Touch Ergonomics & 100% shadcn/ui Styling (44-48px touch targets, custom scrollbars, Radix Selects/Dialogs/Dropdowns, responsive layout).
- **Milestone 2 (R2)**: 100% Functional Settings Engine (Theme: Dark/Light/Auto, Density: Compact/Cozy/Tablet, Radius: 0/6/10/16px, Font: 13/14/16px, Accents: Amber/Emerald/Stone/Red/Blue, Motion toggle - all live and persisted in localStorage).
- **Milestone 3 (R3)**: Advanced Category & Sub-Category Manager with Edit Mode (Create & Edit with Lucide/Emoji picker, color picker, position placement; Reorder & Organize with localStorage; Sub-category editor with chips).
- **Milestone 4 (R4)**: Rich Inspection History Drawer Redesign (Dedicated slide-out drawer, relative timestamps, search & filter, one-click copy, pin to folder, batch queue action, clear confirmation).

## Phase 2: Final Verification & Adversarial Hardening (R5)
- **Phase 2.1**: Pass 100% of E2E and unit test suite.
- **Phase 2.2**: Adversarial coverage hardening (Challengers + White-box source review).
- **Phase 2.3**: Clean production build verification (`npm run build` and `npm run test`).
- **Phase 2.4**: Final Forensic Audit & Completion Declaration.
