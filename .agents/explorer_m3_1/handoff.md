# Handoff Report — Explorer 1 (Milestone 3: Focus Area 1)

## 1. Observation
- **File: `src/App.tsx` (lines 148–194)**:
  - `<AppShell header={{ height: 60 }} padding="0">` currently configures only `header={{ height: 60 }}` without `navbar`.
  - `<AppShell.Navbar>` is missing from the JSX hierarchy.
  - `<CategoryChips>` (lines 179-186) and `<CodeSubChips>` (lines 189-193) are rendered inside `<AppShell.Main>` in the vertical page document flow.
- **File: `src/components/CategoryChips.tsx` (lines 17–75)**:
  - Renders category navigation as a horizontal scrollable row (`display: 'flex'`, `overflowX: 'auto'`).
  - Container uses `id="nav"`, inner row uses `id="chips"`.
  - Each button uses `data-cat={cat.id}` and `className="chip-btn ${isActive ? 'active' : ''}"`.
- **File: `src/components/CodeSubChips.tsx` (lines 19–56)**:
  - Renders panel code sub-chips (`FCPB`, `FCPW`, etc.) conditionally (`display: isVisible ? 'flex' : 'none'`).
  - Container uses `id="subchips"` and `className="subchips-container ${isVisible ? 'show' : ''}"`.
  - Buttons use `data-sub={sub}` and `className="subchip-btn ${isActive ? 'active' : ''}"`.
- **File: `src/components/StatsDashboard.tsx` (lines 100–115)**:
  - Currently renders duplicate category badges (`categoriesToShow.map(...)`), which creates redundant category selection controls.
- **File: `tests/harness.js` (lines 195–204, 275–302)**:
  - Test helper `getAppNavbar()` queries `[data-testid="app-navbar"], .mantine-AppShell-navbar, #sidebarNav, .sidebar-nav, nav`.
  - `selectCategory()` queries `[data-cat="${catId}"]`.
  - `selectSubCategory()` queries `[data-sub="${subCode}"]`.
  - `getLayoutShiftMetrics()` queries `#subchips`.

## 2. Logic Chain
1. **Current Design Problem**: Because `CategoryChips` and `CodeSubChips` are located inside `<AppShell.Main>`, scrolling down the list causes navigation controls to move out of view. Furthermore, when switching to the `codes` category, `CodeSubChips` appears in the main layout flow, causing a ~45px vertical jump (layout shift).
2. **AppShell Refactoring Solution**: Adding `navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}` to `<AppShell>` in `App.tsx` and adding `<AppShell.Navbar>` creates a fixed 260px sticky sidebar.
3. **Sidebar Component Integration**: Moving `CategoryChips` and `CodeSubChips` inside `<AppShell.Navbar>` and switching `CategoryChips` to a vertical column stack (`flexDirection: 'column'`) creates a modern 2026 split layout.
4. **Layout Shift Elimination**: Since the sidebar has a fixed width (260px) and vertical scrolling (`overflowY: 'auto'`), showing/hiding `CodeSubChips` inside the sidebar container does not alter the height or positioning of `<AppShell.Main>`, achieving 0px vertical layout shift.
5. **Test Compatibility Guarantee**: By retaining attributes `data-testid="app-navbar"`, `id="sidebarNav"`, `id="nav"`, `id="chips"`, `id="subchips"`, `data-cat`, and `data-sub`, all test harness DOM queries will continue to pass seamlessly.

## 3. Caveats
- **Responsive Mobile Behavior**: On screens smaller than `sm` (768px), `AppShell.Navbar` will collapse based on `collapsed.mobile`. `AppHeader.tsx` should include a hamburger drawer trigger button if full mobile drawer navigation is desired.
- **DOM Selector Retention**: When refactoring `CategoryChips.tsx` and `CodeSubChips.tsx` or introducing a unified `SidebarNav.tsx`, developer MUST NOT remove or change existing `id`, `data-cat`, `data-sub`, or `data-testid` attributes.

## 4. Conclusion
The recommended implementation path for Focus Area 1 is:
1. Update `src/App.tsx` to configure `<AppShell navbar={{ width: 260, breakpoint: 'sm' }} header={{ height: 60 }}>`.
2. Add `<AppShell.Navbar data-testid="app-navbar" id="sidebarNav" className="sidebar-nav">` in `src/App.tsx`.
3. Move `CategoryChips` and `CodeSubChips` into `<AppShell.Navbar>`.
4. Style `CategoryChips` with vertical button stacking, full width items, count badges aligned right, and dark charcoal palette (`#1e293b` bg, `#334155` border, cyan active accent).
5. Style `CodeSubChips` as a compact 2-column or 3-column sub-grid rendered inside the navbar beneath the `codes` category item or panel section.

## 5. Verification Method
1. **Build Verification**:
   ```bash
   npm run build
   ```
   Must compile with 0 errors.
2. **Test Suite Verification**:
   ```bash
   npm run test
   ```
   Must pass 100% of test cases in `tests/tier1-features.test.js` (including Feature 3 & Feature 6), `tests/tier2-boundary.test.js`, and `tests/m2_challenger_theme.test.js`.
3. **Manual / Structural DOM Inspection**:
   - Check that `<nav id="sidebarNav" data-testid="app-navbar">` is present in rendered DOM.
   - Check that category buttons with `data-cat="..."` are inside the sidebar navbar.
   - Check that sub-chips container `#subchips` with `data-sub="..."` is inside the sidebar navbar.
