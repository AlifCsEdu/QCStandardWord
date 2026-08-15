## 2026-08-09T14:00:58Z
<USER_REQUEST>
You are a Test Writer subagent for the E2E Testing Track (Milestone 5 - Tier 4 Workloads).
Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\test_writer_m5

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read specification files:
1. c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md
2. c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\PROJECT.md
3. c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\TEST_INFRA.md
4. c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m1_3\analysis.md

File Ownership: You exclusively own `tests/tier4-workloads.test.js`. DO NOT modify `src/` files.

Task:
1. Write/expand `tests/tier4-workloads.test.js` to implement Milestone 5 (Tier 4 Real-World Application Scenarios).
2. Ensure there are at least 6 real-world application workflow scenario tests:
   - Scenario 1: Complete Quality Inspector Audit Workflow (Sidebar navigation -> Category filter -> Sub-chip selection -> Starring defect into custom folder -> Verifying badge & storage persistence).
   - Scenario 2: Multi-Category Defect Batch Queue & Custom Delimiter Export (Search defects across categories -> Add items to batch drawer -> Reorder batch items -> Change delimiter to semicolon -> Copy batch -> Verify Sonner toast & auto-clear).
   - Scenario 3: Spotlight Search & Keyboard Driven Workflow (Trigger Cmd+K Spotlight modal -> Search query -> Select result -> View switcher toggle List/Grid/Table -> Settings modal customization).
   - Scenario 4: Warm Stone Theme & Aesthetic Purge Verification (Toggle dark/light mode -> Verify `#121214`/`#fcfcfc` surfaces -> Confirm 0 backdrop-blur and 0 neon gradients -> Page reload persistence).
   - Scenario 5: Custom Pin Folder Lifecycle & Legacy Migration (Create multiple folders -> Multi-folder starring -> Rename folder -> Delete folder with item cleanup -> Auto-migration from legacy `qc-pins`).
   - Scenario 6: Full System E2E Performance, Build, and Storage Integrity (Simulate high-volume operations -> Verify zero layout shift & sub-1000ms latency -> Cloudflare Pages dist asset integrity -> localStorage event sync across keys).
3. Use `tests/harness.js` and `node:test` (`describe`, `it`, `assert`).
4. Execute `npm run test:tier4` to verify all Tier 4 tests pass 100% with exit code 0.
5. Write `changes.md` and `handoff.md` in your working directory. Send a message to parent when done.
</USER_REQUEST>
