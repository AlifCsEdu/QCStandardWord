# Orchestrator Plan — Generation 2

## Objective
Complete UI/UX overhaul of QC Standard Wording by executing M3 Gate Verification and Milestone M4 Final Verification & Audit.

## Phase 1: Milestone M3 Gate Verification
- Target components: `src/components/BatchDrawer.tsx`, `src/components/ToastsContainer.tsx`, `src/utils/notifications.ts`, `src/index.css`.
- Subagents to dispatch concurrently:
  1. `reviewer_m3_1` (`teamwork_preview_reviewer`): Code review, selector contract compliance, UI polish review, test run.
  2. `reviewer_m3_2` (`teamwork_preview_reviewer`): Independent verification of segmented delimiter tabs, micro-interactions, floating toast progress/actions, test run.
  3. `challenger_m3_1` (`teamwork_preview_challenger`): Stress and boundary test verification of batch drawer reordering, delimiter changes, bulk import, toast notifications.
  4. `challenger_m3_2` (`teamwork_preview_challenger`): Independent adversarial test generation for toast queueing, autoclear behaviors, rapid copy/paste interactions.
  5. `auditor_m3_gen2` (`teamwork_preview_auditor`): Forensic integrity verification for Milestone M3 changes (no dummy/facade implementations, genuine logic, no backdrop-blur-* classes).
- Criteria to Pass: 2 APPROVE from Reviewers, 2 APPROVE from Challengers, CLEAN from Auditor, 100% tests pass.

## Phase 2: Milestone M4 Final Hardening & Comprehensive Audit
- Target: Full application integration across all 4 requirements (R1, R2, R3, R4).
- Subagents:
  1. Final Test Runner / Verifier (`teamwork_preview_worker` or `teamwork_preview_challenger`): Run full 80+ test suites (all 258+ tests) and production Vite build.
  2. Final Comprehensive Auditor (`teamwork_preview_auditor`): Full codebase forensic integrity audit across all components, hooks, utilities, and styles.
- Criteria to Pass: 100% test pass rate, 0 build errors, CLEAN forensic audit.

## Phase 3: Final Completion & Reporting
- Deliver final completion report to parent (`b667c620-f35b-410d-8f2d-eaf8fcec27b1`).
