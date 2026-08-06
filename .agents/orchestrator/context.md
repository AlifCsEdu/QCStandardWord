# Context & Environment Index

## Environment Information
- OS: Windows
- Project Root: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
- Orchestrator Directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\orchestrator
- Original Request File: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\ORIGINAL_REQUEST.md

## Key Technical Specifications & Goals
- UI Library: Mantine UI v7 (@mantine/core, @mantine/hooks, @tabler/icons-react)
- Build System: React + Vite
- Data Source: 139+ QC defect entries in original HTML file across 13 standard categories
- Fuzzy Search: Levenshtein distance, token matching, sub-sequence scoring, alias expansion, chip filters (FCPB, FCPW, FCPC, RCPB, RCPW, RCPC, FCDS, RCDS, PC)
- Batch Drawer: Delimiter selection (newline, comma, semicolon, space), reordering, auto-clear on copy, bulk import/export
- State & Persistence: Pinning/Favorites, inline Edit mode, theme options, local storage persistence
- PWA: Offline readiness, manifest, service worker
