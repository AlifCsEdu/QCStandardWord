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
- [ ] Clean build and test passes via npm run build and npm run test.
</USER_REQUEST>
