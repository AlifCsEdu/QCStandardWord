# Codebase Survey & UI Analysis Report

**Date**: 2026-08-09
**Author**: `explorer_survey_1`
**Target Workspace**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording`

---

## Executive Summary

The **QC Standard Wording** application is a React 19 + Vite 6 + TypeScript 5 application styled with Tailwind CSS v4 and Radix UI primitives. A thorough audit of the existing codebase reveals that while the functional architecture (state management, 14-key `localStorage` persistence, category filtering, search, custom pin folders, and command spotlight) is robust, the visual layer heavily incorporates generic "AI-looking design" tropes: deep void backgrounds (`#050608`, `#0c0e12`), glowing cyan accents (`#06b6d4`), heavy glassmorphism blurs (`backdrop-blur-xl`, `backdrop-blur-2xl`), cyan radial glow shadows, and high-contrast neon badges.

This document details all existing UI components, styling patterns, design tropes to eliminate, and presents a proposed **Raycast Warm Stone** palette mapping (`#121214` dark / `#fcfcfc` light) with muted semantic color pills and crisp tactile card surfaces.

---

## 1. Existing UI Component Architecture & Inventory

### 1.1 Core Layout & Application Shell Components

| Component File | Role / Purpose | Key Element IDs & `data-testid` Markers | Current Styling & Tropes Observed |
|---|---|---|---|
| `src/App.tsx` | Main application container, layout grid, Cmd+K modal, scroll listener | Roots `min-h-screen`, `Cmd+K` Spotlight dialog | `bg-zinc-950`, `selection:bg-cyan-500/30`, cyan badge highlights |
| `src/components/AppHeader.tsx` | Sticky top header bar with search, view switcher, drawer triggers, theme toggle | `#appHeader`, `data-testid="app-header"`, `#search`, `data-testid="header-search-input"`, `#clearBtn`, `#spotlightBtn`, `#setLayout`, `data-testid="view-switcher"`, `#editBtn`, `#batchBtn`, `#bcount`, `#setBtn`, `#dlBtn`, `#themeBtn` | `bg-[#0c0e12]/80`, `backdrop-blur-xl`, cyan glows on active view mode and buttons, `shadow-[0_4px_30px_rgba(0,0,0,0.4)]` |
| `src/components/CategoryChips.tsx` | Sticky left sidebar navigation: Quick Views, Pin Folders CRUD manager, Defect Categories | `#sidebarNav`, `data-testid="app-navbar"`, `#chips`, `data-testid="category-tab-*"` | `bg-[#0c0e12]`, `bg-[#14171f]`, active tabs use cyan gradients `from-cyan-500/15`, cyan border accent `border-cyan-400`, `shadow-[0_0_12px_rgba(6,182,212,0.15)]` |
| `src/components/CodeSubChips.tsx` | Sub-category filter chips for Panel Codes (FCPB, FCPW, etc.) | `#subchips`, `data-sub="*"` | `bg-zinc-900/60`, active sub-chips use `bg-cyan-600 border-cyan-400` |
| `src/components/StatsDashboard.tsx` | Summary dashboard showing matching wordings count, active filters, pinned/batch stats | `#statsDashboard`, `data-testid="stats-dashboard"` | `bg-zinc-900 border-zinc-800`, cyan and amber badges with cyan icons |
| `src/components/HistoryBar.tsx` | Horizontal copy history feed with quick re-copy chips | `#histbar`, `#hchips`, `data-hcopy="*"`, `#hclearAll` | `bg-amber-950/20`, `backdrop-blur-md`, amber text highlights |
| `src/components/EditToolbar.tsx` | Action toolbar visible in Edit Mode (+ Add Wording, Export, Import, Reset) | `#editstrip`, `#addBtn`, `#exportBtn`, `#importBtn`, `#resetBtn` | `bg-cyan-950/20`, `backdrop-blur-md`, cyan header, pulse reset button |
| `src/components/WordingContainer.tsx` | Parent wrapper for wording items (Grid / List / Table) and empty state | `#wordingContainer`, `#countLabel`, `#listwrap`, `data-testid="wording-container"`, `data-layout="*"`, `#empty` | `bg-[#0c0e12]/80`, `backdrop-blur-md` on empty state |
| `src/components/WordingGrid.tsx` | Grid layout renderer for defect items | `.wording-grid-body` | 3-column responsive grid container |
| `src/components/WordingList.tsx` | Single-column list layout renderer | `.wording-list-body` | Vertical stack container |
| `src/components/WordingTable.tsx` | Compact table view renderer | `.wording-table-body` | Dense table row container |
| `src/components/DefectCard.tsx` | Individual defect card / row / table row item renderer | `data-id="*"`, `.gcard`, `.row`, `.trow`, `.rnum`, `.rtxt`, `.rpill`, `.racts`, `.pin-btn`, `.add-batch-btn`, `.edit-item-btn`, `.del-item-btn` | `bg-[#0c0e12]`, `backdrop-blur-md`, hover border glow `hover:border-cyan-500/50`, `hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.25)]`, category pill inline RGB styles, left border `border-l-4` |
| `src/components/BatchDrawer.tsx` | Slide-out drawer for multi-item batch copy operations and delimiter settings | `#backdrop`, `data-testid="drawer-overlay"`, `#batchDrawer`, `data-testid="batch-drawer"`, `#bclose`, `#joinSel`, `#autoclear`, `#blist`, `data-testid="batch-item"`, `.bup`, `.bdn`, `.bcopy-item`, `.brm-item`, `#bcopy`, `#bclear`, `#bpaste` | `bg-zinc-950/80 backdrop-blur-xl` overlay, `bg-[#0c0e12]/90 backdrop-blur-2xl` panel, cyan glow on batch copy button `shadow-[0_0_20px_rgba(6,182,212,0.3)]` |
| `src/components/ToastsContainer.tsx` | Floating toast notifications stack | `#toasts`, `.toasts-container`, `.toast`, `.ticon`, `.toast-message`, `.tact`, `.tprogress` | `backdrop-filter: blur(16px)`, `box-shadow: 0 10px 38px rgba(0,0,0,0.5), 0 0 20px rgba(6,182,212,0.20)`, glowing cyan progress bar |
| `src/components/EditModal.tsx` | Modal dialog for creating and editing defect wording items | `#modal`, `data-testid="edit-modal"`, `#mtext`, `#mcat`, `#mnum`, `#mcancel`, `#msave` | `bg-zinc-900 border-zinc-800`, cyan save button |
| `src/components/SettingsModal.tsx` | Modal dialog for density, radius, layout, accent, motion settings | `#setmodal`, `data-testid="settings-modal"`, `#setLayout`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`, `#setdone` | `bg-zinc-900 border-zinc-800`, cyan highlighted preference chips |

### 1.2 Primitive UI Components (`src/components/ui/`)

- `badge.tsx`: Radix-based badge variant (`bg-cyan-500/15 text-cyan-400`, `border-cyan-500/30`).
- `button.tsx`: CVA button variant with default cyan theme (`bg-cyan-500 text-zinc-950 hover:bg-cyan-400`).
- `card.tsx`: Surface cards (`bg-zinc-900 border-zinc-800`).
- `checkbox.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `scroll-area.tsx`, `select.tsx`, `sheet.tsx`, `textarea.tsx`, `toggle-group.tsx`, `tooltip.tsx`: Radix UI wrappers configured with cyan focus rings (`focus-visible:ring-cyan-500`).

---

## 2. Current Styling Patterns & AI Design Tropes Inventory

The audit identified three major categories of generic AI design tropes across the codebase:

### 2.1 Heavy Glassmorphism Blurs & Layered Overlays
- **`src/index.css`**:
  - Line 46-47: `--drawer-backdrop-blur: blur(12px)`
  - Line 140-141: `.toast` uses `backdrop-filter: blur(16px)`
  - Line 290-291: `#backdrop, .drawer-backdrop` uses `backdrop-filter: blur(12px)`
  - Line 299-300: `#batchDrawer, .batch-drawer` uses `backdrop-filter: blur(12px)`
- **Component Files**:
  - `AppHeader.tsx:65`: `backdrop-blur-xl`, `bg-[#0c0e12]/80`
  - `BatchDrawer.tsx:64`: `bg-zinc-950/80 backdrop-blur-xl` on backdrop overlay
  - `BatchDrawer.tsx:77`: `bg-[#0c0e12]/90 backdrop-blur-2xl` on drawer container
  - `DefectCard.tsx:43`: `backdrop-blur-md` on card container
  - `DefectCard.tsx:69`: `backdrop-blur-xl` on dropdown menu content
  - `HistoryBar.tsx:23`: `backdrop-blur-md` on history bar container
  - `EditToolbar.tsx:59`: `backdrop-blur-md` on edit strip container
  - `WordingContainer.tsx:53`: `backdrop-blur-md` on empty state container

### 2.2 Neon Cyan Gradients & Glowing Halos
- **`src/index.css`**:
  - Lines 101-112:
    - `.ambient-cyan-glow`: `linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.1))`
    - `.glow-cyan-subtle`: `box-shadow: 0 0 20px -3px rgba(6, 182, 212, 0.25)`
    - `.glow-cyan-border`: `border-color: rgba(6, 182, 212, 0.4); box-shadow: 0 0 12px rgba(6, 182, 212, 0.2)`
  - Lines 143, 153, 228: `.toast` cyan glow `box-shadow: 0 10px 38px rgba(0,0,0,0.5), 0 0 20px rgba(6, 182, 212, 0.20)` and `.tprogress` linear cyan-to-blue gradient `linear-gradient(90deg, #06b6d4, #3b82f6)`.
  - Line 316: `--defect-card-glow-hover: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.2)`
  - Line 360-368: `.row:hover` and `.trow:hover` cyan box shadows `rgba(6, 182, 212, 0.18)`
- **Component Files**:
  - Active button highlights use cyan glow halos: `shadow-[0_0_15px_rgba(6,182,212,0.3)]`, `shadow-[0_0_20px_rgba(6,182,212,0.3)]`, `shadow-[0_0_12px_rgba(6,182,212,0.15)]`.

### 2.3 Dark Void & Onyx Color Variables
- **`src/index.css`**:
  - `--color-deep-void: #050608`
  - `--color-onyx: #0c0e12`
  - `--background: #050608`
  - `--card: #0c0e12`
- Hardcoded dark void surface hex codes (`#050608`, `#0c0e12`, `#12151c`, `#14171f`) scattered across `AppHeader.tsx`, `CategoryChips.tsx`, `DefectCard.tsx`, `BatchDrawer.tsx`, `WordingContainer.tsx`.

---

## 3. Proposed Raycast Warm Stone Palette Mapping (#121214 / #fcfcfc)

To achieve an authentic, human-crafted Raycast-inspired interface, we map all application surfaces to Warm Stone charcoal (#121214 dark / #fcfcfc light), warm grey borders, and muted semantic category color-coding.

### 3.1 Core Surface & Background Palette

| Theme | UI Token | Old Value (AI Void) | New Proposed Raycast Warm Stone Value | Tailwind Class Equivalent |
|---|---|---|---|---|
| **Dark** | Application Background | `#050608` / `#09090b` | `#121214` (Warm Charcoal) | `bg-[#121214]` / `bg-stone-950` |
| **Dark** | Elevated Card / Container | `#0c0e12` / `#18181b` | `#18181b` / `#1c1c1f` | `bg-[#18181b]` / `bg-stone-900` |
| **Dark** | Sidebar / Header Panel | `#0c0e12` | `#121214` (Solid) | `bg-[#121214]` |
| **Dark** | Subtle Borders | `rgba(255,255,255,0.08)` | `#27272a` / `#292524` | `border-stone-800` / `border-zinc-800` |
| **Dark** | Primary Text | `#f8fafc` | `#fcfcfc` / `#f5f5f4` | `text-stone-100` |
| **Dark** | Secondary / Muted Text | `#94a3b8` | `#a1a1aa` / `#78716c` | `text-stone-400` |
| **Light** | Application Background | `#f8fafc` / `#ffffff` | `#fcfcfc` (Soft Warm Off-White) | `bg-[#fcfcfc]` / `bg-stone-50` |
| **Light** | Elevated Card / Container | `#ffffff` | `#ffffff` (Crisp White Card) | `bg-white` |
| **Light** | Sidebar / Header Panel | `#ffffff` | `#fafafa` / `#f5f5f4` | `bg-stone-100` |
| **Light** | Subtle Borders | `#e2e8f0` / `#e4e4e7` | `#e7e5e4` / `#e4e4e7` | `border-stone-200` |
| **Light** | Primary Text | `#0f172a` | `#121214` / `#1c1917` | `text-stone-900` |
| **Light** | Secondary / Muted Text | `#475569` | `#57534e` / `#78716c` | `text-stone-600` |

### 3.2 Requirement R2: Purposeful Muted Color-Coding & Iconography

In accordance with requirement **R2**, high-saturation neon badges are replaced by muted, harmonious semantic color pills paired with clean Lucide icons.

| Category ID | Category Name | Dedicated Lucide Icon | Base Hex Accent | Dark Theme Pill Styling (Muted) | Light Theme Pill Styling (Muted) |
|---|---|---|---|---|---|
| `battery` | Battery | `Battery` | `#2e7d32` | `bg-emerald-950/40 text-emerald-300 border-emerald-800/50` | `bg-emerald-50 text-emerald-800 border-emerald-200` |
| `buttons` | Buttons | `Sliders` | `#b45309` | `bg-amber-950/40 text-amber-300 border-amber-800/50` | `bg-amber-50 text-amber-800 border-amber-200` |
| `screen` | Screen | `Monitor` | `#1d4ed8` | `bg-sky-950/40 text-sky-300 border-sky-800/50` | `bg-sky-50 text-sky-800 border-sky-200` |
| `pen` | Pen | `PenTool` | `#701a75` | `bg-purple-950/40 text-purple-300 border-purple-800/50` | `bg-purple-50 text-purple-800 border-purple-200` |
| `locks` | Locks | `Lock` | `#9f1239` | `bg-rose-950/40 text-rose-300 border-rose-800/50` | `bg-rose-50 text-rose-800 border-rose-200` |
| `camera` | Camera | `Camera` | `#0f766e` | `bg-teal-950/40 text-teal-300 border-teal-800/50` | `bg-teal-50 text-teal-800 border-teal-200` |
| `codes` | Codes | `Code` | `#6d28d9` | `bg-violet-950/40 text-violet-300 border-violet-800/50` | `bg-violet-50 text-violet-800 border-violet-200` |
| `backcover` | Back Cover | `Smartphone` | `#a16207` | `bg-stone-900 text-stone-300 border-stone-700` | `bg-stone-100 text-stone-700 border-stone-300` |
| `water` | Water Damage | `Droplets` | `#0e7490` | `bg-cyan-950/40 text-cyan-300 border-cyan-800/50` | `bg-cyan-50 text-cyan-800 border-cyan-200` |
| `audio` | Audio & Mic | `Volume2` | `#047857` | `bg-emerald-950/40 text-emerald-300 border-emerald-800/50` | `bg-emerald-50 text-emerald-800 border-emerald-200` |
| `body` | Body & Parts | `Cpu` | `#475569` | `bg-stone-900 text-stone-300 border-stone-700` | `bg-stone-100 text-stone-700 border-stone-300` |
| `system` | System | `Settings` | `#c2410c` | `bg-orange-950/40 text-orange-300 border-orange-800/50` | `bg-orange-50 text-orange-800 border-orange-200` |
| `pinned` | Pinned | `Star` | `#d97706` | `bg-amber-950/40 text-amber-300 border-amber-800/50` | `bg-amber-50 text-amber-800 border-amber-200` |
| `all` / `recent` | All / Recent | `Folder` / `History` | `#78716c` | `bg-stone-900 text-stone-400 border-stone-800` | `bg-stone-100 text-stone-600 border-stone-200` |

---

## 4. Component Refinement Roadmap

1. **`src/index.css`**:
   - Replace `:root` / `.dark` / `[data-theme='dark']` CSS variables with Warm Stone definitions:
     `--background: #121214`, `--card: #18181b`, `--border: #27272a`, `--primary: #e7e5e4`.
   - Remove `.ambient-cyan-glow`, `.glow-cyan-subtle`, `.glow-cyan-border`, and cyan glow shadows.
   - Replace blur backdrop filters with solid subtle overlays (`rgba(18, 18, 20, 0.85)` / `rgba(0, 0, 0, 0.6)`).
2. **`src/components/AppHeader.tsx`**:
   - Change background from `bg-[#0c0e12]/80 backdrop-blur-xl` to solid `bg-[#121214] border-stone-800`.
   - Remove cyan glow shadows from view mode toggle and spotlight trigger.
3. **`src/components/CategoryChips.tsx`**:
   - Change background to `bg-[#121214]`.
   - Change active category selection from `bg-gradient-to-r from-cyan-500/15` to clean Warm Stone highlight `bg-stone-800/80 text-stone-100 border-stone-700`.
4. **`src/components/DefectCard.tsx`**:
   - Replace card background `bg-[#0c0e12]` with `bg-[#18181b] border-stone-800`.
   - Remove `backdrop-blur-md` and `hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.25)]`.
   - Implement crisp left border accent indicators (`border-l-4`) and muted category color pills.
5. **`src/components/BatchDrawer.tsx`**:
   - Replace backdrop `backdrop-blur-xl` with solid semi-transparent overlay `bg-black/60`.
   - Replace drawer container `bg-[#0c0e12]/90 backdrop-blur-2xl` with solid Warm Stone container `bg-[#121214] border-l border-stone-800`.
6. **`src/components/ToastsContainer.tsx` & `src/utils/notifications.ts`**:
   - Replace toast blur `backdrop-filter: blur(16px)` and cyan glow shadow with clean floating pill `bg-[#18181b] border border-stone-800 text-stone-100 shadow-lg`.

---

## Conclusion & Verification

All structural components, DOM identifiers, test IDs, and state interfaces (`useQCState`, `useAppearance`, `notifications.ts`) are fully cataloged. The proposed Warm Stone redesign preserves 100% of DOM IDs and test contracts while completely eliminating generic AI design tropes in favor of a clean, Raycast-inspired interface.
