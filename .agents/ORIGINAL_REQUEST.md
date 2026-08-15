# Original User Request

## 2026-08-16T01:36:23+08:00

<USER_REQUEST>
Comprehensive overhaul to make the QC Standard Wording application 100% touch-screen friendly (optimized for Samsung Galaxy Tab S9+ and tablets), ensure 100% shadcn/ui component styling across every element (including custom scrollbars and Radix Selects), make all appearance settings fully functional, build a full-featured Category & Sub-Category Manager (create with icon/emoji/color, reorder, edit), and redesign the History section into a dedicated, rich inspection log drawer.

Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Integrity mode: development

## Requirements

### R1. Samsung Tab S9+ Touch Ergonomics & 100% shadcn Styling
- Tablet Touch Optimization: Minimum 44px-48px touch targets, comfortable finger padding, smooth touch scrolling (-webkit-overflow-scrolling: touch), and responsive tablet landscape/portrait layouts.
- 100% shadcn Component Polish: Replace any remaining native HTML elements (selects, inputs, scrollbars) with Radix UI / shadcn primitives (Select, ScrollArea, Popover, Dialog, DropdownMenu). Custom sleek scrollbar (w-1.5 thumb-stone-700 track-transparent).

### R2. 100% Functional Settings Engine
- Connect all settings in SettingsModal.tsx to active live state and localStorage:
  - Theme: Dark, Light, Auto/System
  - Density: Compact, Cozy, Tablet/Touch (larger buttons & touch padding)
  - Corner Radius: 0px (Sharp), 6px (Sm), 10px (Md), 16px (Lg)
  - Font Size: Small (13px), Normal (14px), Large (16px)
  - Accent Colors: Warm Amber, Sage Emerald, Slate Stone, Rose Red, Ocean Blue
  - Reduced Motion Toggle: Disable animations for high-speed performance

### R3. Advanced Category & Sub-Category Manager (Edit Mode)
- Create & Edit Categories: Hybrid icon selector (choose from curated Lucide icons OR enter any custom emoji), color picker, and position placement.
- Reorder & Organize: Move categories up/down or drag-to-reorder, with persistence in localStorage (qc-categories).
- Sub-Category Editor: Add, edit, or remove sub-code chips (e.g. FCPB, FCPW, etc.) per category.

### R4. Rich History Panel / Drawer Redesign
- Redesign from an afterthought strip into a dedicated, slide-out Inspection History Drawer:
  - Relative timestamps ("Just now", "5m ago", "10:45 AM").
  - Search & filter history items.
  - One-click copy, pin to folder, and "Add all to batch queue".
  - Clear history with confirmation.

### R5. Test Suite & Build Verification
- Maintain 100% test pass rate across all existing and new test suites with clean production build (npm run build).

## Acceptance Criteria

### Tablet & Power Features Overhaul
- [ ] 44px+ touch targets and smooth scrolling for Samsung Tab S9+ tablet ergonomics.
- [ ] 100% shadcn/ui styling with custom sleek scrollbars and Radix Select dropdowns.
- [ ] 100% functional settings (Theme, Density, Radius, Text Size, Accent Color, Reduced Motion).
- [ ] Category Manager with hybrid icon/emoji/color selection and reordering.
- [ ] Dedicated History panel/drawer with timestamps and batch actions.
- [ ] Clean build and test passes via npm run build and npm run test.
</USER_REQUEST>
