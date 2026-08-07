# Mantine & Tabler Dependency Analysis — QC Standard Wording

## 1. Overview & Objective
This report presents a thorough analysis of all usages of `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/spotlight`, and `@tabler/icons-react` across the QC Standard Wording codebase (`src/`). The primary objective is to verify API compatibility, identify any potential breaking changes or specific version constraints prior to upgrading dependencies in Milestone 1, and document baseline verification results.

---

## 2. Dependency Inventory

### Current Installed Dependencies (`package.json`)
| Package | Installed Version | Target Scope | Category |
|---------|-------------------|--------------|----------|
| `@mantine/core` | `^7.15.0` | Latest compatible `7.x.x` | UI Component Framework |
| `@mantine/hooks` | `^7.15.0` | Latest compatible `7.x.x` | React Utility Hooks |
| `@mantine/notifications` | `^7.15.0` | Latest compatible `7.x.x` | Toast Notifications System |
| `@mantine/spotlight` | `^7.15.0` | Latest compatible `7.x.x` | Command Palette & Search Modal |
| `@tabler/icons-react` | `^3.28.0` | Latest compatible `3.x.x` | SVG Icon Library |
| `postcss-preset-mantine` | `^1.17.0` | Latest compatible `1.x.x` | Dev Dependency / CSS Preset |

---

## 3. Source Code Usage Map

### A. `src/App.tsx`
- **Imports from `@mantine/core`**:
  - `MantineProvider`: Root wrapper specifying `theme={defaultTheme}` and `defaultColorScheme="light"`.
  - `createTheme`: Theme definition helper used for `defaultTheme`.
  - `AppShell`: Main layout container (`<AppShell header={{ height: 60 }} padding="0">`), `<AppShell.Header>`, `<AppShell.Main>`.
  - `Affix`: Floating container for scroll-to-top button (`<Affix position={{ bottom: 24, right: 24 }}>`).
  - `Button`: Scroll-to-top button with `leftSection={<IconArrowUp size={16} />}`.
  - `Transition`: Smooth transition wrapper for scroll-to-top button (`<Transition transition="slide-up" mounted={scroll.y > 100}>`).
  - `useMantineColorScheme`: Hook to dynamically switch between dark and light themes (`setColorScheme(nextTheme)`).
- **Imports from `@mantine/notifications`**:
  - `Notifications`: Root notification host component (`<Notifications position="top-right" zIndex={1000} />`).
  - `notifications`: Static imperative API used in Spotlight action callback (`notifications.show({ title: 'Wording Copied', message: item.t, color: 'teal' })`).
- **Imports from `@mantine/spotlight`**:
  - `Spotlight`: Modal search component (`<Spotlight actions={spotlightActions} searchProps={{...}} shortcut={['mod + k', 'ctrl + k']} ... />`).
  - `spotlight`: Imperative API used to trigger modal (`spotlight.open()`).
  - `SpotlightActionData`: TypeScript type definition used for `spotlightActions` memoized array.
- **Imports from `@mantine/hooks`**:
  - `useWindowScroll`: Hook providing `[scroll, scrollTo]` for window scroll tracking and top scrolling.
- **Imports from `@tabler/icons-react`**:
  - `IconArrowUp`: Used inside scroll-to-top button.
  - `IconSearch`: Used inside Spotlight action items.

### B. `src/components/BatchDrawer.tsx`
- **Imports from `@mantine/core`**:
  - `Drawer`: Slide-out panel (`<Drawer opened={isOpen} onClose={onClose} position="right" size="md" keepMounted ...>`).
  - `Badge`: Item counter badges (`<Badge id="bbcount">`, `<Badge id="bcount">`).
  - `Button`: Action buttons (`<Button id="bcopy">`, `<Button id="bclear">`, `<Button id="bpaste">`).
  - `Group` & `Stack`: Layout spacing containers.
  - `Text`: Styled typography components (`Text fw={700}`, `Text c="dimmed"`).
  - `ActionIcon`: Close button (`<ActionIcon id="bclose">`).
  - `Paper`: Container styling for settings panel, queue items, and bulk paste modal.
  - `Textarea`: Input area in bulk paste modal.
- **Imports from `@tabler/icons-react`**:
  - `IconCopy`, `IconTrash`, `IconFileImport`, `IconX`.

### C. `src/components/StatsDashboard.tsx`
- **Imports from `@mantine/core`**:
  - `Paper`: Container with border and shadow (`<Paper id="statsDashboard" ...>`).
  - `Group`: Flexible row containers.
  - `Badge`: Active filter indicators, category pill counts, and total matching count.
  - `Text`: Subtitle and filter labels.
  - `Button`: Quick Search button triggering Spotlight (`onClick={onOpenSpotlight}`).
- **Imports from `@tabler/icons-react`**:
  - `IconDashboard`, `IconFilter`, `IconSearch`, `IconBookmark`, `IconCopy`.

### D. `src/components/WordingContainer.tsx`
- **Imports from `@mantine/core`**:
  - `SegmentedControl`: View switcher for List / Grid / Table modes (`<SegmentedControl size="xs" value={layoutMode} onChange={(val) => onSetLayout(val as LayoutMode)} data={[...]} />`).

### E. `src/index.css`
- **Global Mantine CSS Imports**:
  ```css
  @import '@mantine/core/styles.css';
  @import '@mantine/spotlight/styles.css';
  @import '@mantine/notifications/styles.css';
  ```

---

## 4. API Stability & Upgrade Impact Analysis

1. **Version Alignment Requirement**:
   - All `@mantine/*` packages (`core`, `hooks`, `notifications`, `spotlight`) are tightly coupled in Mantine v7. Upgrading them requires bumping all four packages to the exact same version string (e.g. `^7.17.x` or latest release) to prevent type definition mismatches or runtime style conflicts.
2. **API Stability Evaluation**:
   - **`@mantine/core`**: All components used (`AppShell`, `Paper`, `Button`, `Badge`, `Drawer`, `SegmentedControl`, `Affix`, `Transition`) strictly follow Mantine v7 standard props and compound patterns (e.g., `leftSection`, `variant`, `fw`, `c`, `bg`, `AppShell.Header`). No deprecated v6 props (e.g. `icon`, `weight`, `color` as hex string directly) are present.
   - **`@mantine/spotlight`**: Current implementation uses standard `SpotlightActionData` structure (`id`, `label`, `description`, `onClick`, `leftSection`) and `spotlight.open()`. Upgrading within v7.x preserves full compatibility.
   - **`@mantine/notifications`**: Global component `<Notifications />` + `notifications.show()` matches standard v7 API.
   - **`@mantine/hooks`**: `useWindowScroll()` returns `[scroll, scrollTo]` which is completely stable.
   - **`@tabler/icons-react`**: Standard icon imports (`size`, `color`). Minor version updates have no breaking API changes.

3. **Downstream Overhaul Preparedness (Milestones M2-M6)**:
   - **M2 (Theme Overhaul)**: `createTheme` in `App.tsx` can be extended with custom colors (`deepSlate`, `charcoal`, `cyanAccent`) and custom component default props.
   - **M3 (Sidebar & Layout)**: `AppShell` in `App.tsx` will easily accommodate `navbar={{ width: 260, breakpoint: 'sm' }}` and `<AppShell.Navbar>`.
   - **M4 (Toast Notifications)**: Custom floating toasts can leverage updated `@mantine/notifications` or custom styled floating containers seamlessly.

---

## 5. Verification Results

- **Vite Production Build (`npm run build`)**: Pass (Exit code 0, 0 errors, 6997 modules transformed, production PWA bundle built).
- **TypeScript Type Check (`npm run lint`)**: Pass (0 type errors).
- **Test Suite (`npm run test`)**: Pass (100% pass rate: 32/32 tests passed across Tiers 1-4).
