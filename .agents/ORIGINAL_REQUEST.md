# Original User Request

## Initial Request — 2026-08-07T00:49:28+08:00

Recreate and transform the single-page HTML QC Standard Wording inspection tool into a production-grade, highly optimized, full-stack React + Vite web application powered by Mantine UI v7.

Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Integrity mode: development

## Requirements

### R1. Modern UI Architecture with Mantine UI v7
- Implement a responsive layout with Mantine's AppShell, Navbar, Header, Drawer, Modal, and Notification system.
- Provide dynamic light/dark mode toggling, accent color palettes, component radius options, text size controls, and density toggles (Cozy vs Compact).
- Support multiple layout display modes for wording entries: List view, Responsive Card Grid, and Compact Table view.

### R2. Complete QC Wording Data & Instant Typo-Tolerant Search Engine
- Retain all 139+ QC defect entries across 13 standard categories (Codes, Screen, Camera, Buttons, Battery, Back Cover, Locks, Pen, Water Damage, Audio & Mic, Body & Parts, System).
- Implement instant typo-safe fuzzy search using Levenshtein distance, token matching, sub-sequence scoring, and alias expansion.
- Provide sub-category chip filtering for specialized panel codes (FCPB, FCPW, FCPC, RCPB, RCPW, RCPC, FCDS, RCDS, PC).

### R3. Advanced Batch Clipboard & Power Inspection Workflow
- Slide-out Mantine Drawer for batch operations: queue multiple defect strings, choose custom delimiters (newline, comma, semicolon, space), reorder/remove items, auto-clear on copy, and bulk paste/import.
- Pinning/Favorites system, copy history feed with quick re-copy, and full inline Edit Mode (add, update, delete custom entries with JSON import/export and reset fallback).
- Full PWA support / offline readiness with localStorage state persistence.

## Acceptance Criteria

### UI & Aesthetics
- [ ] Built cleanly with React, Vite, and Mantine UI v7 (@mantine/core, @mantine/hooks, @tabler/icons-react).
- [ ] Stunning visual hierarchy with custom badges, micro-interactions, smooth animations, and crisp dark/light themes.

### Functionality & Performance
- [ ] Instant search results with highlighted matching substrings and approximate match indicators (≈).
- [ ] 100% clipboard copy reliability across desktop and mobile devices with visual feedback toast notifications.
- [ ] Complete state persistence (pins, batch queue, custom wording edits, theme/appearance settings) in browser storage.
- [ ] Automated build verification passes cleanly via npm run build without any TypeScript or bundling errors.
