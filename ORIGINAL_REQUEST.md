# Original User Request

## Initial Request — 2026-08-16T00:27:51+08:00

Execute a comprehensive UI/UX overhaul and deep visual refinement across the entire QC Standard Wording application. Eliminate visual clutter, de-duplicate stacked horizontal toolbars, unify the header and sidebar navigation, elevate card/row typography and tactile interactions with inline 'Copied ✓' micro-interactions, and deliver a smooth, high-end, human-crafted experience.

Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Integrity mode: development

## Requirements

### R1. Layout De-Cluttering & Unified Header
- Eliminate Stacked Horizontal Strips: Replace bulky StatsDashboard banners and redundant bars with an integrated sleek status summary (e.g. 139 Defects • 12 Categories • 3 Starred) and clean, non-intrusive action controls.
- Top Header Modernization: Balanced layout with brand logo, central hero search bar (⌘K Spotlight), view switcher (List / Grid / Table), and clean action group.
- Sticky Sidebar Polish: Refined category buttons with smooth active indicator bars, crisp Lucide icons, aligned count pills, and sleek Pin Folders accordion.

### R2. Defect Cards, List Rows & Inline Copy Micro-Interactions
- Typography & Visual Polish: Enhanced font weights, line-heights, and contrast for defect titles and #code labels.
- Instant Copy Micro-Interactions: Visual feedback upon clicking/copying with a subtle border pulse and an inline Copied ✓ badge transition alongside the floating toast notification.
- Tactile Action Buttons: Refined Star (★/☆) folder dropdown and sleek + Batch button with smooth hover states.

### R3. Batch Drawer & Floating Toasts Polish
- Batch Drawer: Clean slide-out panel with delimiter segmented tabs (\n, ,, ;, space), smooth item reordering, and prominent "Copy All" action.
- Floating Toasts: Minimalist, non-intrusive floating Sonner pills with copy preview and auto-dismiss timer.

### R4. Performance & Test Suite Integrity
- Maintain 100% test pass rate across all 203 test suites and 0 build errors (npm run build & npm run test).

## Acceptance Criteria

### Deep UI/UX Polish
- [ ] Clean, uncluttered layout without redundant stacked horizontal strips.
- [ ] Sleek top header, refined sidebar navigation, and polished pin folders.
- [ ] Elevated typography, contrast, and tactile button styling across List, Grid, and Table views.
- [ ] Inline Copied ✓ micro-interaction and subtle border pulse on click.
- [ ] Polished slide-out Batch Drawer and floating toast feedback.
- [ ] npm run build and npm run test pass cleanly with 100% success rate (203/203 tests passing).
