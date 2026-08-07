# Analysis Report — Milestone 3: Focus Area 1 (AppShell Layout & Sidebar Navigation)

## Executive Summary
This report presents the architectural analysis and design recommendations for **Focus Area 1** of **Milestone 3: Sticky Left Sidebar Navigation & Top Header Refactoring**. The goal is to refactor the main application layout in `src/App.tsx` using Mantine v7 `<AppShell>`, establishing a dedicated sticky left sidebar `<AppShell.Navbar>` to host category navigation (`CategoryChips.tsx` / `SidebarNav.tsx`) and sub-code chips (`CodeSubChips.tsx`). This refactoring resolves the vertical layout shift (~45px jump) when toggling panel sub-codes, integrates seamlessly with the 2026 Deep Slate & Charcoal theme (`#0f172a` / `#1e293b` / `#334155`), and maintains 100% test compatibility.

---

## 1. Existing Layout & Component Architecture

### 1.1 `src/App.tsx` Overview
- **Current AppShell Setup**:
  ```tsx
  <AppShell header={{ height: 60 }} padding="0">
    <AppShell.Header>
      <AppHeader ... />
    </AppShell.Header>
    <AppShell.Main style={{ paddingTop: '60px' }}>
      <StatsDashboard ... />
      <CategoryChips ... />
      <CodeSubChips ... />
      <HistoryBar ... />
      <EditToolbar ... />
      <WordingContainer ... />
      ...
    </AppShell.Main>
  </AppShell>
  ```
- **Observations & Deficiencies**:
  1. `AppShell` only specifies `header={{ height: 60 }}` without a `navbar` configuration property.
  2. `<AppShell.Navbar>` is absent in the JSX tree.
  3. `CategoryChips` and `CodeSubChips` are rendered inside `<AppShell.Main>` as horizontal inline scrollable bars (`overflowX: 'auto'`).
  4. When users scroll down the main content, category navigation scrolls out of view.
  5. `CodeSubChips` conditionally renders (`display: isVisible ? 'flex' : 'none'`) directly in the vertical block flow of `<AppShell.Main>`. When switching to the `'codes'` category, this adds ~45px of height to the main document flow, causing a visible vertical content jump (layout shift).
  6. `StatsDashboard.tsx` renders duplicate category breakdown badges (`categoriesToShow`), creating redundant navigation elements.

---

## 2. AppShell.Navbar Configuration & Responsive Layout Strategy

### 2.1 Mantine v7 `<AppShell>` Specification
To configure a fixed, sticky left sidebar in Mantine v7:
```tsx
<AppShell
  header={{ height: 60 }}
  navbar={{
    width: 260,
    breakpoint: 'sm',
    collapsed: { mobile: !mobileOpened },
  }}
  padding="0"
>
```
- **Desktop Layout (`>= 768px` / `sm`)**:
  - Navbar fixed width: `260px`.
  - Position: `fixed`, top: `60px`, height: `calc(100vh - 60px)`.
  - `<AppShell.Main>` automatically offsets left padding by `260px` in Mantine v7.
- **Mobile Layout (`< 768px`)**:
  - Responsive collapsible drawer using `useDisclosure()` state in `App.tsx` (e.g. `mobileOpened`).
  - Hamburger toggle in `AppHeader.tsx` toggles `mobileOpened`.
  - When closed on mobile, `AppShell.Navbar` slides out of view; when opened, it overlays or slides in cleanly.

### 2.2 Deep Slate & Charcoal Theme Styling for Navbar
- **Container Background**: `--container-charcoal` (`#1e293b`).
- **Border Outline**: Right border `1px solid var(--border-contrast, #334155)`.
- **Text & Accent Colors**:
  - Text primary: `#f8fafc`.
  - Text muted: `#94a3b8`.
  - Active tab bg: `var(--accent-sky, #0284c7)` or category accent color with high contrast white text.
  - Hover state: `rgba(255, 255, 255, 0.05)` or `#334155` background with 150ms ease transition.

---

## 3. Sidebar Component Layout (`CategoryChips` & `CodeSubChips`)

### 3.1 Vertical Navigation Layout in Navbar
Instead of horizontal scrolling rows, the sidebar navigation should present a clean vertical list of categories:
1. **Header / Title Section**:
   - Title: "CATEGORIES" or "DEFECT CATEGORIES" (uppercase, 0.75rem font size, letter-spacing, `#94a3b8` muted text).
2. **Category List (`CategoryChips` / `SidebarNav`)**:
   - `display: flex`, `flexDirection: column`, `gap: 4px`.
   - Each category item is a full-width button (`width: 100%`, `display: flex`, `alignItems: center`, `justifyContent: space-between`, `padding: 8px 12px`, `borderRadius: 8px`).
   - Displays category name on the left and item count badge on the right.
3. **Sub-Code Chips Section (`CodeSubChips`)**:
   - Rendered directly inside `AppShell.Navbar` below the `'codes'` category tab or in a dedicated sub-panel container.
   - When `'codes'` category is active, sub-code pills (`FCPB`, `FCPW`, `FCPI`, `FCPR`, `FCPD`, `FCPM`, `FCPC`, `FCPU`, `FCPO`, `FCPE`, `FCPT`) render in a 2-column or 3-column grid/flex layout (e.g. `display: grid`, `gridTemplateColumns: 'repeat(2, 1fr)'`, `gap: 6px`).
   - Rendered inside the fixed 260px navbar with vertical scrolling (`overflowY: 'auto'`).

### 3.2 Layout Shift Elimination (Feature 6)
- **Root Cause**: `CodeSubChips` conditionally inserted 45px into the vertical normal flow of `<AppShell.Main>`.
- **Resolution**: Placing `CodeSubChips` inside `AppShell.Navbar` isolates the sub-chip container inside the fixed sidebar. The main content container (`AppShell.Main`) maintains constant vertical offset and positioning, achieving **0px vertical layout shift** across all category switches.

---

## 4. Test Compatibility & DOM Selector Contracts

Existing E2E / integration tests in `tests/tier1-features.test.js`, `tests/tier2-boundary.test.js`, and `tests/harness.js` expect specific DOM attributes and IDs:
1. `getAppNavbar()`: Looks for `[data-testid="app-navbar"]`, `.mantine-AppShell-navbar`, `#sidebarNav`, `.sidebar-nav`, or `nav`.
   - **Requirement**: Add `data-testid="app-navbar"`, `id="sidebarNav"`, and `className="sidebar-nav mantine-AppShell-navbar"` to `<AppShell.Navbar>`.
2. `selectCategory(catId)`: Looks for `[data-cat="${catId}"]`, `[data-testid="category-tab-${catId}"]`, `[data-testid="nav-cat-${catId}"]`, or `[data-category="${catId}"]`.
   - **Requirement**: Retain `data-cat={cat.id}` and `className="chip-btn ${isActive ? 'active' : ''}"` on category buttons.
3. `selectSubCategory(subCode)`: Looks for `[data-sub="${subCode}"]`, `[data-testid="sub-chip-${subCode}"]`, `[data-testid="nav-sub-${subCode}"]`, or `[data-subcategory="${subCode}"]`.
   - **Requirement**: Retain `data-sub={sub}` on sub-chip buttons and `#subchips` / `data-testid="code-sub-chips"` on container.
4. `getLayoutShiftMetrics()`: Looks for `#subchips` and `helpers.getAppNavbar()`.
   - **Requirement**: Ensure `#subchips` container exists inside `<AppShell.Navbar>`.

---

## 5. Summary of Recommended Code Changes

### A. `src/App.tsx`
- Add `navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}` to `<AppShell>`.
- Add `<AppShell.Navbar data-testid="app-navbar" id="sidebarNav" className="sidebar-nav" p="md" ...>` containing category navigation and sub-code chips.
- Remove `<CategoryChips>` and `<CodeSubChips>` from `<AppShell.Main>`.

### B. `src/components/SidebarNav.tsx` or `CategoryChips.tsx` & `CodeSubChips.tsx`
- Support vertical layout for category buttons with dark charcoal styling (`#1e293b` bg, `#334155` border, `#0284c7` active accent).
- Display count badges neatly on the right side of category buttons.
- Render sub-code chips in a compact grid when `'codes'` category is active.

### C. DOM Attributes Checklist
- [x] `<AppShell.Navbar>` -> `data-testid="app-navbar" id="sidebarNav" className="sidebar-nav"`
- [x] Category Container -> `id="nav" className="category-nav-container"`
- [x] Chips Scroll / List Container -> `id="chips" className="chips-scroll-container"`
- [x] Category Button -> `data-cat={cat.id} className="chip-btn ${isActive ? 'active' : ''}"`
- [x] Sub-chips Container -> `id="subchips" data-testid="code-sub-chips" className="subchips-container ${isVisible ? 'show' : ''}"`
- [x] Sub-chip Button -> `data-sub={sub} className="subchip-btn ${isActive ? 'active' : ''}"`
