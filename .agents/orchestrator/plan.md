# Master Orchestration Plan — QC Standard Wording

## Objective
Transform single-page HTML QC Standard Wording inspection tool into a production-grade React + Vite + Mantine UI v7 web app.

## Execution Strategy
Using Project Pattern with strict dual track:
1. **Implementation Track**:
   - M1: Project Setup & Mantine v7 Scaffolding
   - M2: Data Extraction, Standard Categories & Typo-Tolerant Fuzzy Engine
   - M3: Mantine UI Components, Themes (Light/Dark/Palette/Density), & View Modes (List/Grid/Table)
   - M4: Batch Operation Drawer, Inline Edit Mode, Favorites, & Storage Persistence
   - M5: PWA Setup, Service Worker & Offline Capability
2. **E2E & Unit Testing Track**:
   - Comprehensive test suite covering feature tests, boundary/typo cases, combinatorial filters, and real-world batch workloads.

## Verification Gate Criteria
- Zero TypeScript / Lint / Bundling errors (`npm run build` passes cleanly).
- 100% clipboard copy reliability & toast visual feedback.
- Instant search performance with highlighted sub-sequences and approximate match indicators (`≈`).
- Complete offline capability & browser storage persistence.
- Forensic Auditor CLEAN verdict (Zero cheating / zero facade implementations).
