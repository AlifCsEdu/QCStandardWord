# Implementation & Polish Plan

## Overview
Comprehensive visual refinement and UI/UX overhaul of QC Standard Wording application adhering to R1-R4 requirements, zero regression, and strict test suite stability.

## Milestones & Strategy

### Phase 0: Survey & Discovery
- Explorer 1: Layout & Top Navigation (Header, StatsDashboard, Sidebar, Quick Search ⌘K).
- Explorer 2: Defect Cards, List Rows, Table View, Inline Copy Micro-Interactions, Star Dropdown.
- Explorer 3: Batch Drawer, Sonner Toast Configuration, Test Harnesses & Vitest/Jest suites.

### Milestone 1: Layout De-Cluttering & Unified Header
- Consolidate redundant horizontal bars & StatsDashboard into sleek top summary.
- Implement unified top header with ⌘K spotlight search, view switcher, clean actions.
- Polish sticky sidebar with smooth indicators and pin folders.

### Milestone 2: Cards, Rows, Tables & Micro-Interactions
- Typography & contrast enhancement (#code pill, title hierarchy, clean spacing).
- Inline 'Copied ✓' feedback badge + subtle border pulse on copy triggers.
- Tactile star rating / folder dropdown & batch add buttons.

### Milestone 3: Batch Drawer & Toast Refinement
- Modernize slide-out Batch Drawer with segmented delimiter tabs (\n, ,, ;, space), smooth reordering, and prominent Copy All.
- Sleek floating Sonner toast styling.

### Milestone 4: Verification, Test Integrity & Polish
- Ensure npm run test passes 100% (203/203 suites).
- Ensure npm run build completes with 0 errors.
- Reviewer, Challenger, and Forensic Auditor verification.
