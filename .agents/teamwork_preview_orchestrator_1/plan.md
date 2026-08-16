# Orchestration Plan: Design System Overhaul & Smart Auto-Sessions History Upgrade

## Phase 0: Survey & Discovery
1. Spawn 3 `teamwork_preview_explorer` agents in parallel:
   - **Explorer 1 (Visual Design System & Tokens)**: Inspect Tailwind config, global styles, color tokens (#0e0e11 base, #141418 containers, #1a1a20 cards/rows, #22222a popovers/modals), borders, rounded tokens, category accent integration.
   - **Explorer 2 (History Store & Auto-Sessions Architecture)**: Inspect existing history state management, local storage persistence, copy triggers, session time-grouping logic, search/filtering, session actions (Copy All, Add to Batch, Pin/Re-copy).
   - **Explorer 3 (Component Integration & Test Harness)**: Inspect AppHeader, Sidebar, Defect Grid/List/Table, Batch Drawer, Category Manager, Settings Modal, tablet/touch responsiveness, vitest/jest test suites and test runner scripts.
2. Collect Explorer findings and synthesize into `PROJECT.md` with full Feature Inventory, Architecture, and Milestone boundaries.

## Phase 1: Milestone 1 — Visual Language & Unified Surface Architecture
- Explorer -> Worker -> Reviewers x2 -> Challengers x2 -> Forensic Auditor -> Gate.
- Implement Warm Charcoal Multi-Layer Depth, unified design tokens, harmonious category accents across all surfaces.

## Phase 2: Milestone 2 — Smart Auto-Sessions History System
- Explorer -> Worker -> Reviewers x2 -> Challengers x2 -> Forensic Auditor -> Gate.
- Implement time-based auto-session grouping, category badges/accents in history, search/filter, "Copy All in Session", "Add Session to Batch Queue", pin/re-copy.

## Phase 3: Milestone 3 — Component Polish & Tablet Fluidity
- Explorer -> Worker -> Reviewers x2 -> Challengers x2 -> Forensic Auditor -> Gate.
- Seamless component integration, tactile micro-interactions, Samsung Tab S9+ touch responsiveness.

## Phase 4: Milestone 4 — Test Suite & Adversarial Coverage Hardening
- Dual track E2E / Unit testing verification, all tests passing 100%, production build verification, adversarial edge-case hardening.
