# Orchestration Plan — 2026 UI/UX Overhaul for QC Standard Wording

## Objective
Execute full UI/UX design overhaul of the QC Standard Wording application according to 2026 design system standards: Deep Slate (#0f172a) & Charcoal (#1e293b) theme, sticky left sidebar navigation, floating glassmorphic notifications, non-intrusive backdrop-filtered batch drawer, high-contrast cards/rows, dependency updates, and comprehensive test & forensic verification.

## Execution Strategy (Dual Track Project Pattern)

### Track 1: E2E & Verification Track
- **E2E Testing Orchestrator**: Create comprehensive opaque-box test suite for 4 tiers (Feature coverage, Boundary cases, Pairwise interactions, Real-world scenarios).
- **TEST_READY.md**: Publish test runner instructions and feature coverage matrix.

### Track 2: Implementation Track (Milestone Sequence)
1. **Milestone 1: Dependency Updates & Baseline Setup**
   - Update `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight`, `@tabler/icons-react`.
   - Verify `npm run build` and `npm run test` baseline.
2. **Milestone 2: 2026 Deep Slate & Charcoal Theme & Tokens**
   - Implement Mantine theme overrides: `#0f172a` bg, `#1e293b` container, `#334155` border, `#06b6d4`/`#0284c7` cyan accents.
   - Configure global CSS custom properties and color schemes.
3. **Milestone 3: Sticky Left Sidebar Navigation & Header Refactoring**
   - Add `<AppShell.Navbar>` sticky left sidebar hosting category tabs and sub-code chips.
   - Refactor `<AppHeader.tsx>` to include Cmd+K Spotlight search trigger and List/Grid/Table view switcher.
   - Remove duplicate `StatsDashboard.tsx` category count header block.
   - Eliminate 45px vertical layout shift on sub-code chip toggling.
4. **Milestone 4: Modern Floating Toast Notifications**
   - Implement floating toast notifications with category icons, subtle glow, copy feedback animations, and progress timers.
5. **Milestone 5: Glassmorphic Non-Intrusive Batch Drawer**
   - Refactor slide-out batch drawer with backdrop filter (`backdrop-filter: blur(8px)`), non-dimming overlay (`rgba(15, 23, 42, 0.4)`), reorder, and copy controls.
6. **Milestone 6: High-Contrast Cards, Tables & Visual Differentiation**
   - Style defect cards, grid items, and table rows with high-contrast borders (`#334155`), clear 150ms hover ease animations, pill badges, and bold typography.
7. **Milestone 7: Final E2E Test Suite Pass & Forensic Integrity Audit**
   - Pass 100% of E2E tests (Tiers 1-4).
   - Conduct Tier 5 adversarial coverage hardening.
   - Run `teamwork_preview_auditor` for binary integrity veto check.

## Iteration Loop per Milestone
Each milestone will be executed via:
`Explorer` -> `Worker` -> `Reviewer` (x2) -> `Challenger` (x2) -> `Forensic Auditor` -> `Gate Check`.
- **Integrity Warning**: Included in worker prompts.
- **Binary Veto**: Failure or cheating detected by Forensic Auditor causes immediate loop rollback.

## Milestone Status Tracking
- Milestone 1: IN_PROGRESS
- Milestone 2: PLANNED
- Milestone 3: PLANNED
- Milestone 4: PLANNED
- Milestone 5: PLANNED
- Milestone 6: PLANNED
- Milestone 7: PLANNED
