# Original User Request

## 2026-08-09T12:41:38Z

<USER_REQUEST>
Completely overhaul and migrate the QC Standard Wording React + Vite web application from Mantine UI to shadcn/ui (Tailwind CSS + Radix UI + Lucide React Icons + Sonner Toasts). Implement custom user pin folders/categories, category color-coding, and modern 2026 shadcn component design standards.

Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Integrity mode: development

## Requirements

### R1. Complete Migration to shadcn/ui Architecture
- Remove all @mantine/* packages from package.json and replace with Tailwind CSS v4, @radix-ui/* primitives, lucide-react, class-variance-authority, clsx, tailwind-merge, next-themes, and sonner.
- Zinc Dark Theme Palette: Deep Zinc dark background (#09090b), container cards (#18181b), crisp border outlines (#27272a), and cool cyan accent highlights (#06b6d4).
- Core Components:
  - Sheet (glassmorphic slide-out Batch Drawer)
  - Command (Cmd+K Spotlight Search Dialog)
  - Tabs & ScrollArea (Category & Sub-code Navigation)
  - Card, Badge, Button, Input, Dialog, DropdownMenu, Tooltip, Select, ToggleGroup

### R2. Iconography & Enhanced Category Color Coding
- Dedicated Lucide icon for every category (Screen, Camera, Buttons, Battery, Back Cover, Locks, Pen, Water Damage, Audio, Body, System, Codes, Custom Folders).
- Theme-aware visual badges and left border accents for each defect category.

### R3. Custom User Pin Categories & Favorites Folders
- Enable users to star/pin items and create custom named folders/categories for personal inspection routines (e.g. "Screen Inspection", "Common Defects").
- Persistent localStorage state for custom categories, batch queue, custom wording edits, and theme settings.

### R4. Cloudflare Pages & Build Integrity
- Maintain valid static asset build (dist/) and wrangler.jsonc ("pages_build_output_dir": "./dist").
- Pass 100% of TypeScript compilation and test suites (npm run build & npm run test).

## Acceptance Criteria

### Component & Design Migration
- [ ] 0 @mantine/* packages remaining in package.json.
- [ ] Genuine shadcn/ui component structure with Radix UI + Lucide React icons.
- [ ] Custom user pin folders/categories system active with localStorage persistence.
- [ ] Sonner floating toasts for instant copy feedback.

## 2026-08-09T21:11:43Z

<USER_REQUEST>
Complete visual and UX overhaul of the QC Standard Wording application into a state-of-the-art 2026 web application inspired by Linear.app, Vercel, and Apple design standards. Built with React, Vite, Tailwind CSS v4, shadcn/ui primitives, and Geist/Inter typography.

Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Integrity mode: development

## Requirements

### R1. Linear / Vercel 2026 Aesthetic Engine & Typography
- Palette: Deep Void Midnight background (#050608), Onyx surface containers (#0c0e12), subtle 1px razor-sharp borders (border-white/[0.08] / border-zinc-800), ambient cyan glow highlights (from-cyan-500/20 to-blue-500/10), and crisp Geist/Inter + JetBrains Mono font typography.
- Visual Contrast & Micro-Details: Sharp contrast between defect cards/rows, clear hover states (150ms ease), category pill badges with theme-aware cyan/emerald accents, and bold typography hierarchy.

### R2. Ultra-Clean Dashboard Layout & Component Refinement
- Sidebar & Top Header: Sticky left sidebar with category Lucide icons, count pills, custom user pin folder manager, and collapsible groups. Top header with hero search bar (⌘K / Ctrl+K Spotlight modal trigger), view switcher (List, Grid Cards, Table), and settings.
- Card & List Redesign:
  - Grid: High-contrast defect cards with subtle ambient glow on hover, code badges (JetBrains Mono), and clean action buttons.
  - Table: Modern compact table with subtle row hover highlighting and clean action menus.
- Floating Toasts & Batch Drawer: Minimalist floating toasts with glowing copy feedback and a glassmorphic side drawer (backdrop-blur-xl bg-zinc-950/85).

### R3. Performance & Build Integrity
- Maintain zero layout shift, instant search responsiveness, TypeScript type safety, and clean Cloudflare Pages build (npm run build).

## Acceptance Criteria

### UI & UX Overhaul
- [ ] Linear/Vercel 2026 visual design with Deep Void (#050608) dark theme and ambient glows.
- [ ] Geist/Inter font integration and JetBrains Mono code badges.
- [ ] Unified sticky left sidebar navigation and hero search bar.
- [ ] Custom user pin folders & category color badges active.
- [ ] npm run build and npm run test pass cleanly with 100% success rate.
</USER_REQUEST>
