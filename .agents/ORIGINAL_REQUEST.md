# Original User Request

## 2026-08-07T13:21:42Z

Complete 2026 UI/UX design overhaul of the QC Standard Wording application featuring a Deep Slate & Charcoal color palette (#0f172a / #1e293b), sticky left sidebar navigation, high-contrast cards and table rows, modern floating toast notifications, and non-intrusive backdrop-filtered batch drawer.

Working directory: c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording
Integrity mode: development

## Requirements

### R1. 2026 Modern Deep Slate & Charcoal Design Theme
- **Theme Palette**: Deep Slate background (#0f172a), Charcoal containers (#1e293b), high-contrast border outlines (#334155), and cool cyan accent highlights (#06b6d4 / #0284c7).
- **Sidebar & Header Layout**: Clean split layout — sticky left sidebar for category tabs (All, Codes, Screen, Camera, etc.) and sub-code chips (FCPB, FCPW, etc.); top header for search bar (Cmd+K Spotlight modal trigger), view switcher (List, Grid, Table), and appearance settings.
- **Visual Contrast & Differentiation**: Sharp visual separation between defect cards/rows, clear hover states (150ms ease), category pill badges with distinct theme colors, and bold typography hierarchy.

### R2. Modern 2026 Floating Notifications & Non-Intrusive Drawer
- **Toast Notifications**: Modern floating toast pills with category icons, subtle glow, copy feedback animations, and progress timers.
- **Glassmorphic Batch Drawer**: Slide-out panel with subtle background blur (backdrop-filter: blur(8px)), non-dimming overlay (rgba(15, 23, 42, 0.4)), and quick batch reorder/copy controls.

### R3. Dependencies & Performance
- Update @mantine/core, @mantine/hooks, @mantine/notifications, @mantine/spotlight to latest available packages.
- Zero layout shift, 100% responsive desktop/mobile support, and clean TypeScript build (npm run build).

## Acceptance Criteria

### UI & UX Overhaul
- [ ] Deep Slate (#0f172a) & Charcoal (#1e293b) theme with high contrast borders (#334155).
- [ ] Unified sticky left sidebar navigation with no duplicate stats headers.
- [ ] Floating glassmorphic toast notifications with category icons.
- [ ] Non-intrusive backdrop-filtered batch drawer.
- [ ] npm run build and npm run test pass with 100% success rate.
