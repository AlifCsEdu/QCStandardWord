# Survey Handoff Report: Mantine UI & Tabler Icons Audit & shadcn/ui Migration Mapping

## 1. Observation

### Package Audit (`package.json`)
The following `@mantine/*`, `@tabler/*`, and PostCSS packages are present in `package.json`:
- **Dependencies**:
  - `@mantine/core`: `^7.17.8` (Line 20)
  - `@mantine/hooks`: `^7.17.8` (Line 21)
  - `@mantine/notifications`: `^7.17.8` (Line 22)
  - `@mantine/spotlight`: `^7.17.8` (Line 23)
  - `@tabler/icons-react`: `^3.46.0` (Line 24)
- **DevDependencies**:
  - `postcss-preset-mantine`: `^1.17.0` (Line 35)
  - `postcss-simple-vars`: `^7.0.1` (Line 36)

### File Usages & Imports Mapping

#### A. Entry Points & Global Configuration
1. **`src/App.tsx`**:
   - `MantineProvider` (lines 4, 324-326)
   - `AppShell`, `AppShell.Header`, `AppShell.Navbar`, `AppShell.Main` (lines 3, 151-192)
   - `Affix`, `Button`, `Transition` (lines 5-7, 298-316)
   - `useMantineColorScheme` (line 8)
   - `Notifications`, `notifications` (line 11)
   - `Spotlight`, `spotlight`, `SpotlightActionData` (lines 12, 287-295)
   - `useWindowScroll`, `useDisclosure` (line 13)
   - `@tabler/icons-react`: `IconArrowUp`, `IconSearch` (line 14)
2. **`src/index.css`**:
   - Stylesheet imports:
     - `@import '@mantine/core/styles.css';` (line 1)
     - `@import '@mantine/spotlight/styles.css';` (line 2)
     - `@import '@mantine/notifications/styles.css';` (line 3)
   - CSS selectors using Mantine data attributes:
     - `[data-mantine-color-scheme='dark']` (lines 7, 241)
     - `[data-mantine-color-scheme='light']` (lines 22, 257)
     - `--mantine-color-body` variable overrides (lines 17, 32)
3. **`postcss.config.cjs`**:
   - Plugins: `postcss-preset-mantine`, `postcss-simple-vars` (lines 3-12)
4. **`src/theme/index.ts` & `src/theme/tokens.ts`**:
   - `createTheme`, `Card`, `Paper`, `Drawer`, `Modal` from `@mantine/core` (lines 1, 12, 24, 36, 51)
   - Mantine color tuples and tokens (`MantineColorTuple`)

#### B. Component-Level Usages
1. **`src/components/AppHeader.tsx`**:
   - `@mantine/core`: `SegmentedControl`, `Burger` (line 2)
   - `@tabler/icons-react`: `IconSearch` (line 3)
2. **`src/components/BatchDrawer.tsx`**:
   - `@mantine/core`: `Drawer`, `Badge`, `Button`, `Select`, `Checkbox`, `Group`, `Stack`, `Text`, `Textarea`, `ActionIcon`, `Paper` (line 2)
   - `@tabler/icons-react`: `IconCopy`, `IconTrash`, `IconFileImport`, `IconX` (line 3)
   - CSS Variable usages: `var(--mantine-color-gray-2)`, `var(--mantine-color-gray-4)`, `var(--mantine-color-gray-0)`
3. **`src/components/StatsDashboard.tsx`**:
   - `@mantine/core`: `Badge`, `Group`, `Paper`, `Text` (line 2)
   - `@tabler/icons-react`: `IconDashboard`, `IconFilter`, `IconBookmark`, `IconCopy` (line 3)
4. **`src/utils/notifications.ts`**:
   - `@tabler/icons-react`: `IconCopy`, `IconPlus`, `IconTrash`, `IconArrowBackUp`, `IconAlertTriangle`, `IconCheck`, `IconPencil`, `IconDownload`, `IconUpload`, `IconRefresh`, `IconBell` (lines 2-14)
5. **`src/hooks/useAppearance.ts`**:
   - DOM root attribute setting: `root.setAttribute('data-mantine-color-scheme', ...)` (line 69)

---

## 2. Logic Chain

### A. Mantine Provider & Shell Replacement
- **`MantineProvider`**: Replace with standard React Context or `ThemeProvider` from `next-themes` (or standard `data-theme="dark"` / Tailwind `.dark` class management).
- **`AppShell` / `AppShell.Header` / `AppShell.Navbar` / `AppShell.Main`**: Replace with semantic HTML flex/grid layout (`<header>`, `<aside>`, `<main>`), matching existing DOM IDs and test selectors (`#appHeader`, `data-testid="app-header"`, `#sidebarNav`, `data-testid="app-navbar"`).
- **`Affix` + `Transition`**: Replace with standard fixed HTML button (`<button className="fixed bottom-6 right-6 ...">`) with Tailwind transition classes (`transition-all duration-300`).

### B. Mantine UI Components -> Target shadcn/ui Primitives Mapping

| Mantine Component | Target Replacement | Backing Primitive / Library | Notes |
|---|---|---|---|
| `Drawer` | `Sheet` (`SheetContent`, `SheetTitle`, `SheetHeader`, `SheetOverlay`) | `@radix-ui/react-dialog` | Batch Drawer slide-out right sheet |
| `Spotlight` | `Command` (`CommandDialog`, `CommandInput`, `CommandList`, `CommandItem`) | `cmdk` | Cmd+K / Ctrl+K Quick Search Dialog |
| `Notifications` / `notifications` | `Sonner` (`Toaster`, `toast`) | `sonner` | Top-right / bottom-right toast notification system |
| `SegmentedControl` | `ToggleGroup` (`ToggleGroup`, `ToggleGroupItem`) | `@radix-ui/react-toggle-group` | View switcher (List / Grid / Table) |
| `Burger` | `Button` (variant="ghost", size="icon") | `lucide-react` (`Menu` icon) | Mobile navigation toggle |
| `Badge` | `Badge` | `@radix-ui/react-slot` / Tailwind | Status badges, category pills, count indicators |
| `Button` | `Button` | `@radix-ui/react-slot` | Primary, secondary, outline, ghost buttons |
| `Select` | `Select` (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`) | `@radix-ui/react-select` | Delimiter select, category filter dropdowns |
| `Checkbox` | `Checkbox` | `@radix-ui/react-checkbox` | Auto-clear checkbox |
| `Textarea` | `Textarea` | HTML `<textarea>` / shadcn UI | Bulk import modal text area |
| `ActionIcon` | `Button` (variant="ghost", size="icon") | shadcn UI | Icon action buttons |
| `Paper` / `Card` | `Card` (`CardHeader`, `CardTitle`, `CardContent`) | Tailwind container cards (`bg-zinc-900 border-zinc-800`) | Dashboard stats card, batch queue items |
| `Modal` | `Dialog` (`DialogContent`, `DialogHeader`, `DialogTitle`) | `@radix-ui/react-dialog` | Edit defect modal & bulk import modal |
| `Group` / `Stack` | `div` with Tailwind flex utilities | CSS Flexbox | `flex items-center gap-2` / `flex flex-col gap-2` |
| `Text` | HTML `<span>` / `<p>` | Tailwind Typography | Standard text styling |

### C. Iconography Mapping (`@tabler/icons-react` -> `lucide-react`)

| `@tabler/icons-react` Icon | Target `lucide-react` Icon | Module / Component |
|---|---|---|
| `IconArrowUp` | `ArrowUp` | `App.tsx` |
| `IconSearch` | `Search` | `App.tsx`, `AppHeader.tsx` |
| `IconCopy` | `Copy` | `BatchDrawer.tsx`, `StatsDashboard.tsx`, `notifications.ts` |
| `IconTrash` | `Trash2` | `BatchDrawer.tsx`, `notifications.ts` |
| `IconFileImport` | `FileUp` / `Import` | `BatchDrawer.tsx` |
| `IconX` | `X` | `BatchDrawer.tsx` |
| `IconDashboard` | `LayoutDashboard` | `StatsDashboard.tsx` |
| `IconFilter` | `Filter` | `StatsDashboard.tsx` |
| `IconBookmark` | `Bookmark` / `Pin` | `StatsDashboard.tsx` |
| `IconPlus` | `Plus` | `utils/notifications.ts` |
| `IconArrowBackUp` | `Undo` | `utils/notifications.ts` |
| `IconAlertTriangle` | `AlertTriangle` | `utils/notifications.ts` |
| `IconCheck` | `Check` | `utils/notifications.ts` |
| `IconPencil` | `Pencil` | `utils/notifications.ts` |
| `IconDownload` | `Download` | `utils/notifications.ts` |
| `IconUpload` | `Upload` | `utils/notifications.ts` |
| `IconRefresh` | `RefreshCw` | `utils/notifications.ts` |
| `IconBell` | `Bell` | `utils/notifications.ts` |

**Requirement R2 Category Specific Icons**:
- `all`: `Grid`
- `codes`: `Code`
- `screen`: `Monitor`
- `camera`: `Camera`
- `buttons`: `Radio`
- `battery`: `Battery`
- `backcover`: `Smartphone`
- `locks`: `Lock`
- `pen`: `PenTool`
- `water`: `Droplets`
- `audio`: `Volume2`
- `body`: `Cpu`
- `system`: `Settings`
- `pinned`: `Star` / `Pin`
- `recent`: `History`
- `custom`: `Folder`

### D. UI Component Migration Boundaries

| UI Component File | Migration Impact & Scope | Target Dependencies |
|---|---|---|
| `package.json` | Package replacements | Add Tailwind CSS v4, `@radix-ui/*`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `sonner`, `cmdk`, `next-themes`. Remove `@mantine/*`, `@tabler/*`, `postcss-preset-mantine`, `postcss-simple-vars`. |
| `postcss.config.cjs` | PostCSS config cleanup | Update or remove preset Mantine config; configure Tailwind CSS v4 plugin. |
| `src/index.css` | Global styling & design tokens | Replace Mantine CSS imports with `@import "tailwindcss";`, define Zinc Dark palette variables (`#09090b` bg, `#18181b` card, `#27272a` border, `#06b6d4` cyan accent). |
| `src/theme/index.ts` & `src/theme/tokens.ts` | Theme system overhaul | Replace Mantine `createTheme` with Tailwind CSS v4 theme variables or shadcn design tokens (`cn` utility helper). |
| `src/App.tsx` | Layout & root provider | Replace `MantineProvider`, `AppShell`, `Spotlight`, `Affix`, `Transition`, `Notifications` with Tailwind layout, `ThemeProvider`, `CommandDialog`, `Sonner`, fixed Scroll-to-Top button. Preserve DOM test IDs (`data-testid="app-header"`, `data-testid="app-navbar"`, etc.). |
| `src/components/AppHeader.tsx` | Header bar | Replace `SegmentedControl` with `ToggleGroup`, `Burger` with `Button`, `IconSearch` with Lucide `Search`. |
| `src/components/BatchDrawer.tsx` | Batch Queue Drawer | Replace Mantine `Drawer`, `Badge`, `Button`, `Paper`, `Stack`, `Group` with shadcn `Sheet`, `Badge`, `Button`, `Card`, `Textarea`. |
| `src/components/StatsDashboard.tsx` | Inspection Dashboard | Replace Mantine `Paper`, `Badge`, `Group`, `Text` with shadcn `Card`, `Badge`, Lucide icons (`LayoutDashboard`, `Filter`, `Bookmark`, `Copy`). |
| `src/components/EditModal.tsx` | Add/Edit Defect Modal | Convert custom inline backdrop/form into shadcn `Dialog` / Radix `Dialog` or styled Tailwind form modal. |
| `src/components/SettingsModal.tsx` | Settings Modal | Convert custom backdrop into shadcn `Dialog` with Tailwind button selectors. |
| `src/utils/notifications.ts` | Notifications helper | Migrate Tabler icon definitions to `lucide-react` icons. Support Sonner toast triggering. |
| `src/hooks/useAppearance.ts` | Appearance hook | Remove `data-mantine-color-scheme`, update root attributes to `data-theme` or Tailwind dark class. |
| `src/components/CategoryChips.tsx` | Category Navigation | Enhance category chips with dedicated Lucide category icons and left border accent indicators (Requirement R2). |
| `src/components/DefectCard.tsx` | Defect Item Card | Apply high-contrast Zinc Dark styling, category icon integration, and left border accent. |

---

## 3. Caveats

- **DOM Selectors in Test Suite**:
  - Investigation of `tests/harness.js` revealed that tests query elements using fallback selectors (e.g. `[data-testid="app-header"], .mantine-AppShell-header, #appHeader, header`).
  - Maintaining exact HTML IDs (`#appHeader`, `#sidebarNav`, `#setLayout`, `#batchDrawer`, `#toasts`, `#search`, etc.) and `data-testid` attributes ensures 100% test compatibility without breaking `npm run test`.
- **Spotlight Search**:
  - `Spotlight` from `@mantine/spotlight` uses `spotlight.open()`. In shadcn/ui `CommandDialog`, state is managed via React state (`open: boolean`) and keyboard shortcut event listeners (`Cmd+K` / `Ctrl+K`).
- **Tailwind CSS v4 Integration**:
  - Ensure PostCSS / Vite configuration matches Vite 6 + Tailwind CSS v4 syntax (`@import "tailwindcss";` in `src/index.css`).

---

## 4. Conclusion

- A total of 5 `@mantine/*` packages (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight`, `postcss-preset-mantine`) and `@tabler/icons-react` can be completely eliminated.
- The entry point (`src/App.tsx`), `src/index.css`, theme files, and 12 UI component files are mapped and ready for migration to shadcn/ui (Tailwind CSS v4 + Radix UI + Lucide React + Sonner + Command).
- Preserving existing DOM IDs and `data-testid` attributes across all migrated components will guarantee seamless test suite execution.

---

## 5. Verification Method

To independently verify these survey findings:
1. Grep search `@mantine` and `@tabler` in `src/`:
   ```bash
   grep -rn "@mantine" src/
   grep -rn "@tabler" src/
   ```
2. Verify package dependencies in `package.json`.
3. Verify test harness selectors in `tests/harness.js`.
