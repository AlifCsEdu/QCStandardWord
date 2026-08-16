# Original User Request

## Initial Request — 2026-08-16T12:06:09+08:00

Execute a comprehensive design system overhaul and history upgrade across the QC Standard Wording application. Unify all components into a cohesive, intentional visual language (Warm Charcoal Multi-Layer #0e0e11/#141418/#1a1a20, shared border radii, harmonious semantic category tokens, unified typography hierarchy) and transform History into an advanced Smart Auto-Sessions Log with category badges, colors, and session actions.

Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Integrity mode: development

## Requirements

### R1. Cohesive Visual Language & Unified Surface Architecture
- Warm Charcoal Multi-Layer Depth:
  - Base Canvas: #0e0e11
  - Containers / Sidebar / Header: #141418
  - Defect Cards / List Rows / Table Containers: #1a1a20 (border: border-stone-800/80)
  - Popovers / Drawers / Modals: #22222a (border: border-stone-700/60)
- Shared Design Tokens & Rhythms: Consistent corner radii (rounded-xl for cards/drawers, rounded-lg for interactive chips, rounded-md for badges), uniform font scaling, and aligned margins across every component so everything feels designed together.
- Harmonious Category Accents: Category color tokens and icons flow consistently across sidebar navigation, defect cards, table rows, history session items, and batch drawers.

### R2. Smart Auto-Sessions History System
- Smart Time-Based Auto-Sessions: Automatically group copied defect items into clean inspection sessions (e.g. "Current Session", "Session — 11:30 AM", "Earlier Today", "Yesterday") based on activity timestamps.
- Category Badges & Colors: Every entry in History displays its category badge, icon, and left accent border with category colors matching the rest of the application.
- Category Filter & Search in History: Filter history items by category or search text within historical records.
- Session Actions: One-click "Copy All in Session", "Add Session to Batch Queue", and per-item re-copy/pin actions.

### R3. Component Polish & Tablet Fluidity
- Seamless integration between AppHeader, Sidebar, Defect Grid/List/Table, History Drawer, Batch Drawer, Category Manager, and Settings Modal.
- Smooth tactile micro-interactions on cards, tabs, and session items with Samsung Tab S9+ touch responsiveness.

### R4. Test Suite & Build Verification
- Maintain 100% test pass rate across all existing and new test suites with clean production build (npm run build).

## Acceptance Criteria

### Unified Design & History Overhaul
- [ ] 100% visual cohesion across all components with shared Warm Charcoal Multi-Layer depth.
- [ ] Smart Auto-Sessions History active with time-based session grouping, category color badges, and session batch actions.
- [ ] Category filter and search within History drawer.
- [ ] Clean build and test passes via npm run build and npm run test.
