# E2E Test Strategy & Design Analysis: QC Standard Wording (Raycast Warm Stone UI)

**Working Directory**: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m1_3`  
**Milestone**: M1.3 — E2E Testing Strategy & Test Case Formulation  
**Target Coverage**: >= 138 Test Cases across Tiers 1–4  

---

## 1. Executive Summary & Test Philosophy

This analysis formulates an opaque-box, requirement-driven end-to-end (E2E) and integration test design for the **QC Standard Wording** application redesigned with the **Raycast Warm Stone UI** palette (`#121214` dark / `#fcfcfc` light).

### Test Philosophy
- **Requirement-Driven**: All test cases derive directly from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `TEST_INFRA.md`.
- **Opaque-Box Verification**: Tests interact with the rendered DOM and public state contracts (e.g. `localStorage`, custom events, standard user interactions) without coupling to internal component implementations.
- **Multitiered Coverage Strategy**:
  - **Tier 1**: Functional Feature Coverage (>= 5 tests per feature * 12 features = 60 test cases).
  - **Tier 2**: Boundary, Edge Case, & Adversarial Input Coverage (>= 5 tests per feature * 12 features = 60 test cases).
  - **Tier 3**: Cross-Feature Pairwise Interactions & Interoperability (12 pairwise combination test cases).
  - **Tier 4**: Real-World Application Workload Scenarios (6 end-to-end multi-step scenarios).
- **Total Formulated Test Cases**: **138 test cases**.

---

## 2. Test Directory Layout & File Naming Conventions

To maintain strict organization, co-located React/DOM tests are structured within `src/__tests__/` (or mirrored under `tests/` for Node test runner integration). 

### Recommended Directory Structure

```
src/__tests__/
├── tier1_warm_stone_theme.test.tsx          # Tier 1: Features 1 & 2 (10 tests)
├── tier1_muted_pills_icons.test.tsx         # Tier 1: Features 3 & 4 (10 tests)
├── tier1_sidebar_pin_folders.test.tsx       # Tier 1: Features 5, 6, 7 (15 tests)
├── tier1_header_spotlight_drawer.test.tsx   # Tier 1: Features 8 & 9 (10 tests)
├── tier1_performance_build.test.tsx         # Tier 1: Features 10, 11, 12 (15 tests)
├── tier2_boundary_theme_tropes.test.tsx     # Tier 2: Features 1 & 2 boundaries (10 tests)
├── tier2_boundary_pills_icons.test.tsx       # Tier 2: Features 3 & 4 boundaries (10 tests)
├── tier2_boundary_sidebar_folders.test.tsx   # Tier 2: Features 5, 6, 7 boundaries (15 tests)
├── tier2_boundary_header_drawer.test.tsx     # Tier 2: Features 8 & 9 boundaries (10 tests)
├── tier2_boundary_perf_build.test.tsx        # Tier 2: Features 10, 11, 12 boundaries (15 tests)
├── tier3_pairwise_interactions.test.tsx     # Tier 3: Pairwise Interaction Suite (12 tests)
└── tier4_realworld_workflows.test.tsx       # Tier 4: Real-World Workload Scenarios (6 scenarios)
```

### File Naming Rules
1. **Prefix**: Tier level (`tier1_`, `tier2_`, `tier3_`, `tier4_`).
2. **Feature Scope**: Lowercase snake_case describing the feature domain (e.g. `warm_stone_theme`, `sidebar_pin_folders`).
3. **Extension**: `.test.tsx` (or `.test.ts` / `.test.js`).
4. **Test Description Pattern**: `[T<Tier>-F<FeatureID>-<Index>] <Descriptive Action & Expected Outcome>`.

---

## 3. Tier 1: Functional Feature Coverage (60 Test Cases)

Each of the 12 features from `PROJECT.md` is assigned exactly 5 distinct functional test cases.

### Feature 1: Raycast Warm Stone Base Theme (5 Tests)
- `[T1-F1-01]` Renders `#121214` dark mode surface background when dark theme is active.
  *Assertion*: `expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(18, 18, 20)')`.
- `[T1-F1-02]` Renders `#fcfcfc` light mode surface background when light theme is active.
  *Assertion*: `expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(252, 252, 252)')`.
- `[T1-F1-03]` Applies warm grey border styles (`border-stone-800` dark / `border-stone-200` light) to card elements.
  *Assertion*: `expect(cardElement.className).toMatch(/border-stone-(800|200)/)`.
- `[T1-F1-04]` Applies clean typography classes (`font-sans`, muted text colors) to header and body elements.
  *Assertion*: `expect(headerElement.className).toMatch(/font-sans|text-stone-/)`.
- `[T1-F1-05]` Persists user theme preference (`qc-theme`) in `localStorage` across page reloads.
  *Assertion*: `expect(localStorage.getItem('qc-theme')).toBe('dark')`.

### Feature 2: Complete Elimination of AI Tropes (5 Tests)
- `[T1-F2-01]` Verifies 0 instances of heavy glassmorphism blur classes (`backdrop-blur-md`, `backdrop-blur-lg`) in DOM.
  *Assertion*: `expect(document.querySelectorAll('[class*="backdrop-blur-"]').length).toBe(0)`.
- `[T1-F2-02]` Verifies 0 instances of neon radial glowing background halos (`from-cyan-500`, `to-purple-600`, `glow-*`).
  *Assertion*: `expect(document.querySelectorAll('.glow, [class*="from-cyan"], [class*="to-purple"]').length).toBe(0)`.
- `[T1-F2-03]` Verifies batch drawer overlay uses solid subtle backdrop (`bg-black/40` or `bg-stone-900/50`) without glass blur filters.
  *Assertion*: `expect(getComputedStyle(drawerOverlay).backdropFilter).toBe('none')`.
- `[T1-F2-04]` Verifies Spotlight search modal backdrop uses clean dark mask without neon border gradients.
  *Assertion*: `expect(spotlightModal.className).not.toMatch(/neon|gradient|glow/)`.
- `[T1-F2-05]` Verifies settings dialog panel renders solid warm stone card surface without translucent blurs.
  *Assertion*: `expect(settingsDialog.className).toMatch(/bg-stone-/)` and `not.toMatch(/backdrop-blur/)`.

### Feature 3: Muted Semantic Color Pills (5 Tests)
- `[T1-F3-01]` Renders Soft Green pill badge (`rgba(..., 0.18)` bg, soft text) for Battery defect category.
  *Assertion*: `expect(getCategoryBadgeStyle('battery').color).toBe('#22c55e')`.
- `[T1-F3-02]` Renders Muted Amber pill badge for Buttons defect category.
  *Assertion*: `expect(getCategoryBadgeStyle('buttons').color).toBe('#f59e0b')`.
- `[T1-F3-03]` Renders Steel Blue pill badge for Screen defect category.
  *Assertion*: `expect(getCategoryBadgeStyle('screen').color).toBe('#3b82f6')`.
- `[T1-F3-04]` Renders Muted Plum pill badge for Pen defect category.
  *Assertion*: `expect(getCategoryBadgeStyle('pen').color).toBe('#a855f7')`.
- `[T1-F3-05]` Renders Rose pill badge for Locks category and Slate for standard Codes/Other categories.
  *Assertion*: `expect(getCategoryBadgeStyle('locks').color).toBe('#f43f5e')`.

### Feature 4: Lucide Iconography System (5 Tests)
- `[T1-F4-01]` Renders `Battery` Lucide icon component alongside Battery category pills and sidebar tabs.
  *Assertion*: `expect(container.querySelector('svg.lucide-battery')).not.toBeNull()`.
- `[T1-F4-02]` Renders `Sliders` Lucide icon component for Buttons category.
  *Assertion*: `expect(container.querySelector('svg.lucide-sliders')).not.toBeNull()`.
- `[T1-F4-03]` Renders `Monitor` Lucide icon component for Screen category.
  *Assertion*: `expect(container.querySelector('svg.lucide-monitor')).not.toBeNull()`.
- `[T1-F4-04]` Renders `PenTool` Lucide icon component for Pen category and `Lock` for Locks.
  *Assertion*: `expect(container.querySelector('svg.lucide-pen-tool')).not.toBeNull()`.
- `[T1-F4-05]` Renders valid Lucide SVG icons for all 15 defect category keys (`CATEGORY_ICON_MAP`).
  *Assertion*: `expect(Object.keys(CATEGORY_ICON_MAP).length).toBeGreaterThanOrEqual(15)`.

### Feature 5: Left Border Accent Indicators (5 Tests)
- `[T1-F5-01]` Renders `border-l-4` left accent indicator on Defect Cards in List view.
  *Assertion*: `expect(card.getAttribute('style')).toMatch(/border-left/)` or `expect(card.className).toContain('border-l-4')`.
- `[T1-F5-02]` Renders `border-l-4` left accent indicator on Grid card items.
  *Assertion*: `expect(gridCard.getAttribute('style')).toMatch(/border-left/)`.
- `[T1-F5-03]` Renders `border-l-4` left accent indicator on Table view rows (`trow`).
  *Assertion*: `expect(tableRow.getAttribute('style')).toMatch(/border-left/)`.
- `[T1-F5-04]` Applies matching category color hex to `border-left-color` in inline style / class.
  *Assertion*: `expect(getCategoryLeftBorderStyle('battery').borderLeftColor).toBe(getCategoryColor('battery'))`.
- `[T1-F5-05]` Maintains left border accent contrast and visibility across light and dark theme modes.
  *Assertion*: `expect(getCategoryLeftBorderStyle('screen').borderLeftWidth).toBe('4px')`.

### Feature 6: Sticky Left Sidebar Navigation (5 Tests)
- `[T1-F6-01]` Renders sticky positioning container (`sticky top-0`) for left sidebar navigation.
  *Assertion*: `expect(sidebar.className).toMatch(/sticky|fixed/)`.
- `[T1-F6-02]` Navigates to selected category tab when clicked and filters displayed defects.
  *Assertion*: `expect(getVisibleItems().every(i => i.categoryPill.toLowerCase() === 'battery')).toBe(true)`.
- `[T1-F6-03]` Displays sub-code chips (`FCPB`, `FCPW`, `FCPM`) when "Codes" category tab is active.
  *Assertion*: `expect(container.querySelector('[data-testid="sub-chip-FCPB"]')).not.toBeNull()`.
- `[T1-F6-04]` Renders item count badges for each category in sidebar tab list.
  *Assertion*: `expect(categoryTabBadge.textContent).toMatch(/^\d+$/)`.
- `[T1-F6-05]` Supports active state styling (`bg-stone-200` dark: `bg-stone-800`) for currently selected tab.
  *Assertion*: `expect(activeTab.className).toMatch(/bg-stone-|active/)`.

### Feature 7: Custom User Pin Folder Manager (5 Tests)
- `[T1-F7-01]` Creates new custom pin folder with custom name and color badge via modal/form.
  *Assertion*: `expect(folders.find(f => f.name === 'Critical Screen')).toBeDefined()`.
- `[T1-F7-02]` Deletes custom pin folder and unpins items associated only with deleted folder.
  *Assertion*: `expect(folders.find(f => f.id === targetId)).toBeUndefined()`.
- `[T1-F7-03]` Renames existing custom pin folder and updates sidebar tab label immediately.
  *Assertion*: `expect(folderTab.textContent).toContain('Renamed Folder')`.
- `[T1-F7-04]` Toggles pinning defect item to specific custom pin folder (`togglePinToFolder`).
  *Assertion*: `expect(isPinnedInFolder(itemId, folderId)).toBe(true)`.
- `[T1-F7-05]` Persists custom pin folders data in `localStorage` under `qc-pin-folders` key.
  *Assertion*: `expect(JSON.parse(localStorage.getItem('qc-pin-folders'))).toHaveLength(1)`.

### Feature 8: Clean Top Header & Spotlight Search (5 Tests)
- `[T1-F8-01]` Triggers ⌘K / Ctrl+K keyboard shortcut to open Spotlight search modal (`cmdk`).
  *Assertion*: `expect(document.querySelector('[data-testid="spotlight-modal"]')).not.toBeNull()`.
- `[T1-F8-02]` Filters defect items in real time as user types into search input.
  *Assertion*: `expect(getVisibleItems().every(i => i.text.toLowerCase().includes('crease'))).toBe(true)`.
- `[T1-F8-03]` Switches view layout modes between List, Grid, and Table via SegmentedControl view switcher.
  *Assertion*: `expect(wordingContainer.className).toContain('grid')`.
- `[T1-F8-04]` Toggles theme mode (Dark / Light / System) from top header theme button.
  *Assertion*: `expect(document.documentElement.classList.contains('dark')).toBe(true)`.
- `[T1-F8-05]` Opens settings modal when clicking header settings gear icon.
  *Assertion*: `expect(document.querySelector('[data-testid="settings-modal"]')).not.toBeNull()`.

### Feature 9: Floating Sonner Toasts & Batch Drawer (5 Tests)
- `[T1-F9-01]` Triggers floating Sonner toast notification on copying defect wording.
  *Assertion*: `expect(document.querySelector('.toast, [data-testid="floating-toast"]')).not.toBeNull()`.
- `[T1-F9-02]` Displays slide-out batch drawer when adding items to batch queue.
  *Assertion*: `expect(getBatchDrawer()).not.toBeNull()` and `expect(getBatchCount()).toBe(1)`.
- `[T1-F9-03]` Formats batch output string with selected delimiter (Comma, Semicolon, Newline, Space).
  *Assertion*: `expect(copiedText).toBe('Defect 1; Defect 2')`.
- `[T1-F9-04]` Auto-clears batch drawer queue when copy batch is executed with autoclear enabled.
  *Assertion*: `expect(getBatchCount()).toBe(0)`.
- `[T1-F9-05]` Supports batch item reordering (move up / move down) and item removal inside drawer.
  *Assertion*: `expect(getBatchItems()[0].text).toBe(originalItem2Text)`.

### Feature 10: Type Safety & Performance (5 Tests)
- `[T1-F10-01]` Verifies 0 TypeScript build or type checking errors across `src/` (`npm run lint`).
  *Assertion*: `exec('npm run lint')` exits with code 0.
- `[T1-F10-02]` Verifies zero layout shift (CLS = 0) when switching categories or sub-code chips.
  *Assertion*: `expect(subchipsHeightBefore).toBe(subchipsHeightAfter)`.
- `[T1-F10-03]` Measures instant search filter response execution (< 16ms per keystroke).
  *Assertion*: `expect(searchExecutionTime).toBeLessThan(16)`.
- `[T1-F10-04]` Validates type safety of all 14 `localStorage` state keys (`qc-pins`, `qc-pin-folders`, etc.).
  *Assertion*: `expect(validateStateSchema(mockStorage)).toBe(true)`.
- `[T1-F10-05]` Verifies clean component unmounting and memory leak prevention during rapid category switching.
  *Assertion*: `expect(listenersCount).toBeConstant()`.

### Feature 11: Cloudflare Pages Build Integrity (5 Tests)
- `[T1-F11-01]` Executes static production build `npm run build` and verifies creation of `dist/` directory.
  *Assertion*: `expect(fs.existsSync('./dist')).toBe(true)`.
- `[T1-F11-02]` Verifies `dist/index.html` contains production asset scripts and Warm Stone font imports.
  *Assertion*: `expect(indexHtmlContent).toContain('<script type="module"')`.
- `[T1-F11-03]` Verifies `wrangler.jsonc` Cloudflare Pages configuration compatibility and static site routes.
  *Assertion*: `expect(wranglerConfig.pages_build_output_dir).toBe('./dist')`.
- `[T1-F11-04]` Verifies `dist/_redirects` file exists and handles SPA route rewrites (`/* /index.html 200`).
  *Assertion*: `expect(fs.readFileSync('dist/_redirects', 'utf8')).toContain('/* /index.html 200')`.
- `[T1-F11-05]` Verifies static build CSS bundle contains Raycast Warm Stone `#121214` and `#fcfcfc` color variables.
  *Assertion*: `expect(distCssContent).toMatch(/#121214|#fcfcfc/)`.

### Feature 12: Full E2E & Tier 5 Test Suite Verification (5 Tests)
- `[T1-F12-01]` Executes full test suite (`npm run test`) and verifies 100% pass rate (0 failures, exit code 0).
  *Assertion*: `exec('npm run test')` returns exit code 0 and total test count >= 138.
- `[T1-F12-02]` Verifies Tier 1 feature coverage suite (`test:tier1`) passes completely.
  *Assertion*: `exec('npm run test:tier1')` exits with code 0.
- `[T1-F12-03]` Verifies Tier 2 boundary suite (`test:tier2`) passes completely.
  *Assertion*: `exec('npm run test:tier2')` exits with code 0.
- `[T1-F12-04]` Verifies Tier 3 pairwise combinations suite (`test:tier3`) passes completely.
  *Assertion*: `exec('npm run test:tier3')` exits with code 0.
- `[T1-F12-05]` Verifies Tier 4 real-world workloads suite (`test:tier4`) passes completely.
  *Assertion*: `exec('npm run test:tier4')` exits with code 0.

---

## 4. Tier 2: Boundary & Edge Cases (60 Test Cases)

### Feature 1 Boundaries (5 Tests)
- `[T2-F1-01]` Tolerates invalid theme key in `localStorage` (`qc-theme="invalid"`) by defaulting gracefully to system Warm Stone theme.
  *Assertion*: `expect(resolvedTheme).toBe('system')`.
- `[T2-F1-02]` Handles high-contrast mode media query overrides without breaking Warm Stone stone-800 borders.
  *Assertion*: `expect(getComputedStyle(card).borderWidth).not.toBe('0px')`.
- `[T2-F1-03]` Ensures color contrast ratio between `#121214` surface and `#a8a29e` text satisfies WCAG AA (>= 4.5:1).
  *Assertion*: `expect(contrastRatio('#121214', '#a8a29e')).toBeGreaterThanOrEqual(4.5)`.
- `[T2-F1-04]` Preserves Warm Stone palette when browser print media style sheet is triggered.
  *Assertion*: `expect(printStyles).not.toBeNull()`.
- `[T2-F1-05]` Prevents flash of unstyled theme content (FOUC) during initial document hydration.
  *Assertion*: `expect(document.documentElement.className).toMatch(/dark|light/)`.

### Feature 2 Boundaries (5 Tests)
- `[T2-F2-01]` Rejects dynamically injected inline styles attempting to add `backdrop-filter: blur(10px)`.
  *Assertion*: `expect(sanitizedStyle).not.toContain('backdrop-filter')`.
- `[T2-F2-02]` Rejects third-party utility classes matching glowing neon animation patterns (`animate-pulse-glow`).
  *Assertion*: `expect(sanitizedClass).not.toMatch(/glow|neon/)`.
- `[T2-F2-03]` Verifies modal dialog mask remains opaque stone overlay even under ultra-wide viewport resolutions.
  *Assertion*: `expect(getComputedStyle(overlay).opacity).toBe('0.5')`.
- `[T2-F2-04]` Verifies tooltips render solid Warm Stone background without glass reflection effects.
  *Assertion*: `expect(tooltipContent.className).toMatch(/bg-stone-900|bg-stone-100/)`.
- `[T2-F2-05]` Enforces elimination of linear cyan/magenta gradients on focus ring indicators (`focus:ring-stone-400`).
  *Assertion*: `expect(focusRingClass).not.toMatch(/gradient|cyan|magenta/)`.

### Feature 3 Boundaries (5 Tests)
- `[T2-F3-01]` Handles custom or unknown category key gracefully by falling back to Slate muted pill badge.
  *Assertion*: `expect(getCategoryBadgeStyle('unknown_cat').color).toBe('#64748b')`.
- `[T2-F3-02]` Maintains pill text contrast when category badge background opacity is dynamically reduced.
  *Assertion*: `expect(badgeStyle.backgroundColor).toMatch(/rgba\(.*, 0\.18\)/)`.
- `[T2-F3-03]` Truncates excessively long category pill names with ellipsis without overflowing container width.
  *Assertion*: `expect(pillElement.className).toContain('truncate')`.
- `[T2-F3-04]` Renders pill badge correctly when defect item has multiple category tags.
  *Assertion*: `expect(pillContainer.children.length).toBeGreaterThanOrEqual(1)`.
- `[T2-F3-05]` Ensures color pill badges scale appropriately in high-density layout mode without text clipping.
  *Assertion*: `expect(pillElement.offsetHeight).toBeLessThanOrEqual(24)`.

### Feature 4 Boundaries (5 Tests)
- `[T2-F4-01]` Falls back to `Folder` Lucide icon when category key is not present in `CATEGORY_ICON_MAP`.
  *Assertion*: `expect(getCategoryIconComponent('nonexistent')).toBe(Folder)`.
- `[T2-F4-02]` Prevents icon rendering crash when Lucide SVG props are passed as null or undefined.
  *Assertion*: `expect(() => getCategoryIcon('screen', undefined)).not.toThrow()`.
- `[T2-F4-03]` Handles rapid category icon re-renders without unmounting icon container element.
  *Assertion*: `expect(iconElement.tagName.toLowerCase()).toBe('svg')`.
- `[T2-F4-04]` Scales Lucide icon size proportionally when compact density mode (size=14) vs comfortable mode (size=18) is active.
  *Assertion*: `expect(getCategoryIcon('screen', { size: 14 }).props.size).toBe(14)`.
- `[T2-F4-05]` Ensures Lucide icons retain `aria-hidden="true"` accessibility attribute when decorative.
  *Assertion*: `expect(iconElement.getAttribute('aria-hidden')).toBe('true')`.

### Feature 5 Boundaries (5 Tests)
- `[T2-F5-01]` Ensures `border-l-4` remains fixed width (4px) when item card is resized or flexed.
  *Assertion*: `expect(getCategoryLeftBorderStyle('battery').borderLeftWidth).toBe('4px')`.
- `[T2-F5-02]` Handles custom user items with missing category key by rendering fallback Slate left border.
  *Assertion*: `expect(getCategoryLeftBorderStyle('').borderLeftColor).toBe('#64748b')`.
- `[T2-F5-03]` Prevents double left border rendering when cards are wrapped inside nested container elements.
  *Assertion*: `expect(card.querySelectorAll('[class*="border-l-"]').length).toBe(1)`.
- `[T2-F5-04]` Retains left border accent visibility in horizontal scrolling grid layouts.
  *Assertion*: `expect(gridRowItem.getAttribute('style')).toContain('border-left')`.
- `[T2-F5-05]` Supports RTL document direction by adjusting border accent alignment if needed.
  *Assertion*: `expect(getCategoryLeftBorderStyle('battery')).toBeDefined()`.

### Feature 6 Boundaries (5 Tests)
- `[T2-F6-01]` Handles sidebar collapsing on mobile break-points (< 768px) with accessible hamburger toggle.
  *Assertion*: `expect(sidebarMobileToggle.getAttribute('aria-expanded')).toBe('false')`.
- `[T2-F6-02]` Scroll lock / sticky persistence when sidebar list contains > 20 category tabs.
  *Assertion*: `expect(sidebarContainer.scrollHeight).toBeGreaterThan(sidebarContainer.clientHeight)`.
- `[T2-F6-03]` Handles zero search results gracefully by keeping sidebar navigation interactive.
  *Assertion*: `expect(sidebarTabs.every(t => !t.disabled)).toBe(true)`.
- `[T2-F6-04]` Keyboard navigation (Arrow Up/Down, Tab, Enter) across sidebar category tabs.
  *Assertion*: `expect(document.activeElement).toBe(nextCategoryTab)`.
- `[T2-F6-05]` Prevents sidebar layout shift when sub-code chips expand or collapse.
  *Assertion*: `expect(sidebarWidthBefore).toBe(sidebarWidthAfter)`.

### Feature 7 Boundaries (5 Tests)
- `[T2-F7-01]` Rejects empty folder name or folder name exceeding 50 characters during creation.
  *Assertion*: `expect(createFolder('   ')).toBeNull()`.
- `[T2-F7-02]` Prevents duplicate pin folder names (case-insensitive) under same user account.
  *Assertion*: `expect(() => createFolder('Screen Defects')).toThrow()`.
- `[T2-F7-03]` Handles corrupted `qc-pin-folders` JSON payload in `localStorage` by auto-recovering to empty array `[]`.
  *Assertion*: `expect(folders).toEqual([])` after setting corrupted string.
- `[T2-F7-04]` Handles deletion of folder containing > 100 pinned items without blocking UI main thread.
  *Assertion*: `expect(deletionTimeMs).toBeLessThan(50)`.
- `[T2-F7-05]` Caps maximum custom pin folders limit at 20 folders with clear user toast notification.
  *Assertion*: `expect(createFolder('Folder 21')).toBeNull()`.

### Feature 8 Boundaries (5 Tests)
- `[T2-F8-01]` Tolerates off-by-two Levenshtein typos in search input ("scren" -> screen, "batery" -> battery).
  *Assertion*: `expect(getVisibleItems().some(i => i.text.toLowerCase().includes('screen'))).toBe(true)`.
- `[T2-F8-02]` Marks fuzzy search matches with score < 80 using approximate match indicator ("≈").
  *Assertion*: `expect(getVisibleItems().find(i => i.isFuzzy)).toBeDefined()`.
- `[T2-F8-03]` Safely escapes special regex meta-characters (`[`, `]`, `(`, `)`, `*`, `+`, `?`, `^`, `$`, `\`, `.`, `|`) in search query.
  *Assertion*: `expect(() => search('[FCPB]*+')).not.toThrow()`.
- `[T2-F8-04]` Trims leading and trailing whitespace and treats whitespace-only queries as full list view.
  *Assertion*: `expect(getVisibleItems().length).toBe(totalItemCount)`.
- `[T2-F8-05]` Supports search terminology expansion aliases ("display" -> screen, "spen" -> pen, "power" -> battery).
  *Assertion*: `expect(search('display').getVisibleItems().length).toBeGreaterThan(0)`.

### Feature 9 Boundaries (5 Tests)
- `[T2-F9-01]` Queues up to 10 toasts simultaneously without stacking overflow or covering header buttons.
  *Assertion*: `expect(getToasts().length).toBeLessThanOrEqual(10)`.
- `[T2-F9-02]` Prevents duplicate items from being added to batch drawer if duplicate mode is disabled.
  *Assertion*: `expect(getBatchCount()).toBe(1)`.
- `[T2-F9-03]` Handles batch drawer opening when batch queue contains 50 items with smooth scrolling.
  *Assertion*: `expect(getBatchItems().length).toBe(50)`.
- `[T2-F9-04]` Triggers Toast "Undo" action to restore deleted custom wording item within 5 seconds timeout window.
  *Assertion*: `expect(getVisibleItems().some(i => i.text === restoredText)).toBe(true)`.
- `[T2-F9-05]` Handles clipboard write rejection with warning toast fallback.
  *Assertion*: `expect(getToasts().some(t => t.isWarn)).toBe(true)`.

### Feature 10 Boundaries (5 Tests)
- `[T2-F10-01]` Validates schema migration for legacy `localStorage` keys (`qc-pins` v1 -> v2) without data loss.
  *Assertion*: `expect(migratedState.pins).toEqual(expectedPins)`.
- `[T2-F10-02]` Memory leak check: creates and destroys 100 App instances without exceeding heap limit.
  *Assertion*: `expect(heapGrowthBytes).toBeLessThan(5 * 1024 * 1024)`.
- `[T2-F10-03]` Rapid search typing stress test (100 input events in 100ms) maintains UI responsiveness.
  *Assertion*: `expect(visibleItems).toBeDefined()`.
- `[T2-F10-04]` Enforces strict TypeScript narrowings for `CategoryKey` union types in all component props.
  *Assertion*: `typecheck` passes without `any` implicit coercions.
- `[T2-F10-05]` Prevents re-rendering of inactive wording cards when selecting items into batch drawer.
  *Assertion*: `expect(unaffectedCardRenderCount).toBe(0)`.

### Feature 11 Boundaries (5 Tests)
- `[T2-F11-01]` Verifies static build size cap: `dist/assets/index-*.js` bundle size does not exceed 350KB gzipped.
  *Assertion*: `expect(gzippedJsSize).toBeLessThan(350 * 1024)`.
- `[T2-F11-02]` Verifies CSS bundle size does not exceed 50KB gzipped.
  *Assertion*: `expect(gzippedCssSize).toBeLessThan(50 * 1024)`.
- `[T2-F11-03]` Validates headers configuration in `public/_headers` (Cache-Control, CSP headers).
  *Assertion*: `expect(fs.readFileSync('public/_headers', 'utf8')).toContain('Cache-Control')`.
- `[T2-F11-04]` Verifies PWA web manifest `dist/manifest.webmanifest` integrity and favicon link tags.
  *Assertion*: `expect(fs.existsSync('dist/manifest.webmanifest')).toBe(true)`.
- `[T2-F11-05]` Verifies clean execution of `npm run preview` on local port without server errors.
  *Assertion*: `expect(previewServerStatus).toBe(200)`.

### Feature 12 Boundaries (5 Tests)
- `[T2-F12-01]` Handles parallel test runner execution without state leakage between JSDOM instances.
  *Assertion*: `expect(testResult.failures).toBe(0)`.
- `[T2-F12-02]` Verifies test timeout cap: full test suite completes in under 15 seconds.
  *Assertion*: `expect(totalTestDurationSeconds).toBeLessThan(15)`.
- `[T2-F12-03]` Validates code coverage threshold (>= 90% lines, >= 85% branches across `src/`).
  *Assertion*: `expect(coverageReport.lines.pct).toBeGreaterThanOrEqual(90)`.
- `[T2-F12-04]` Catches and logs uncaught promise rejections during async test teardowns.
  *Assertion*: `expect(uncaughtRejections.length).toBe(0)`.
- `[T2-F12-05]` Verifies test harness isolation: `MockLocalStorage` clears state cleanly after each test suite.
  *Assertion*: `expect(mockStorage.length).toBe(0)`.

---

## 5. Tier 3: Pairwise Interactions & Interoperability (12 Test Cases)

1. `[T3-PAIR-01]` **F3 x F6**: Category switching in left sidebar dynamically updates badge pill color schemes and icons for all rendered items.
2. `[T3-PAIR-02]` **F1 x F2**: Switching between Dark (#121214) and Light (#fcfcfc) themes maintains 0 glassmorphic blurs or radial neon halos in both modes.
3. `[T3-PAIR-03]` **F7 x F8**: Searching within custom user pin folders filters pinned items while preserving folder badge counts.
4. `[T3-PAIR-04]` **F9 x F8**: Items added to batch drawer in List view remain present and correctly formatted when switching to Grid or Table view.
5. `[T3-PAIR-05]` **F5 x F8**: `border-l-4` left accent indicator renders consistently with correct category hex in List, Grid Cards, and Table views.
6. `[T3-PAIR-06]` **F4 x F7**: Custom pin folders and pinned items render corresponding Lucide `Star` and `Folder` icons without missing icon fallbacks.
7. `[T3-PAIR-07]` **F9 x F7**: Deleting a custom pin folder triggers a floating toast with an "Undo" action that restores the folder and its pin assignments.
8. `[T3-PAIR-08]` **F6 x F9**: Selecting items across multiple sidebar categories (e.g. Battery, Screen, Camera) accumulates them correctly in single batch drawer queue.
9. `[T3-PAIR-09]` **F1 x F9**: Batch drawer slide-out overlay uses solid Warm Stone dark/light background without translucent blur stacks.
10. `[T3-PAIR-10]` **F8 x F3**: Spotlight search results preserve category pill color styling and Lucide icons for all matching items.
11. `[T3-PAIR-11]` **F10 x F7**: LocalStorage state persistence for `qc-pin-folders` validates strict TypeScript interface contracts upon deserialization.
12. `[T3-PAIR-12]` **F11 x F1**: Production CSS bundle generated by `npm run build` retains Raycast Warm Stone variables `#121214` and `#fcfcfc` without purge loss.

---

## 6. Tier 4: Real-World Application Workflows (6 Scenarios)

1. `[T4-SCENARIO-01]` **Complete Mobile Technician Inspection Workflow (F6, F7, F8, F9)**
   - *Flow*: Technician opens app in Table view -> Searches for typo "scren crease" -> Copies item directly (populates Recents) -> Navigates via sticky sidebar to Battery, Camera, and Code (FCPB) categories -> Adds defect from each category to batch queue -> Opens batch drawer -> Selects newline delimiter and enables autoclear -> Copies combined batch.
   - *Assertions*: Table view applied, search returns item, batch count = 3, copy output formatted with newline, batch auto-clears.

2. `[T4-SCENARIO-02]` **QC Supervisor Custom Wording Audit & Model Sync Workflow (F7, F8, F10, F11)**
   - *Flow*: Supervisor enables Edit mode -> Creates 3 custom defects for a new phone model (`FOLDABLEHINGEGAP01`, `AICHIPOVERHEAT02`, `UNDERDISPLAYCAMFOG03`) -> Verifies custom items persist in `localStorage` under `qc-custom` -> Pins items to custom folder "2026 Audit" -> Exports changes JSON payload (`qc-wording-changes.json`) -> Resets all changes back to original state.
   - *Assertions*: Edit mode active, `qc-custom` contains 3 items, pinned folder contains items, export generates valid file, reset restores canonical state.

3. `[T4-SCENARIO-03]` **Spotlight Search Navigation & Multi-View Inspection (F6, F8, F10)**
   - *Flow*: User opens app -> Presses ⌘K to open Spotlight search modal -> Searches for alias "display" -> Keyboard navigates to second item -> Switches view layout from List to Grid Cards via header SegmentedControl -> Toggles high-density mode in Settings.
   - *Assertions*: Spotlight modal opens on ⌘K, search matches alias, layout changes to grid grid-cols-*, density setting applies.

4. `[T4-SCENARIO-04]` **Warm Stone Theme Switching & Palette Persistence Recovery (F1, F2, F8, F10)**
   - *Flow*: User launches app in default dark mode (`#121214`) -> Toggles header theme button to Light mode -> Verifies surface changes to `#fcfcfc` and borders update to `border-stone-200` -> Inspects floating toast and batch drawer overlays to ensure 0 glass blurs or neon glow halos -> Reloads page / instantiates new JSDOM instance -> Verifies theme preference restored from `qc-theme`.
   - *Assertions*: Dark bg `#121214`, Light bg `#fcfcfc`, 0 backdrop-blur classes, theme restored on reload.

5. `[T4-SCENARIO-05]` **Custom Pin Folder Multi-Folder CRUD & Persistence Recovery (F7, F8, F10)**
   - *Flow*: User creates two custom folders ("Screen Issues", "Battery Alerts") -> Pins item A to "Screen Issues" and item B to both folders -> Renames "Screen Issues" to "Display Critical" -> Deletes "Battery Alerts" -> Verifies item B remains pinned in "Display Critical" -> Verifies `localStorage` matches state.
   - *Assertions*: Multi-folder pinning works, folder renamed, item unpinned from deleted folder only, storage state consistent.

6. `[T4-SCENARIO-06]` **Full Build Integrity & Static Cloudflare Deployment Verification (F10, F11, F12)**
   - *Flow*: Run typecheck `npm run lint` -> Run production static build `npm run build` -> Verify `dist/` directory contents (`index.html`, `_redirects`, assets) -> Verify static asset sizes and Warm Stone palette CSS variables -> Execute full test suite `npm run test`.
   - *Assertions*: `tsc --noEmit` clean, `npm run build` succeeds, `dist/_redirects` present, bundle size < 350KB, 100% tests pass.

---

## 7. Traceability Matrix

| Requirement | Description | Associated Features | Tier 1 Tests | Tier 2 Tests | Tier 3 Tests | Tier 4 Scenarios |
|-------------|-------------|---------------------|--------------|--------------|--------------|------------------|
| **R1** | Raycast Warm Stone Palette & Elimination of AI Tropes | F1, F2 | T1-F1-01..05, T1-F2-01..05 | T2-F1-01..05, T2-F2-01..05 | T3-PAIR-02, 09, 12 | T4-SCENARIO-04 |
| **R2** | Muted Color Pills, Lucide Icons, Left Border Accents | F3, F4, F5 | T1-F3-01..05, T1-F4-01..05, T1-F5-01..05 | T2-F3-01..05, T2-F4-01..05, T2-F5-01..05 | T3-PAIR-01, 05, 06, 10 | T4-SCENARIO-01, 03 |
| **R3** | Sticky Left Sidebar, Pin Folders, Header & Spotlight, Toasts & Drawer | F6, F7, F8, F9 | T1-F6-01..05, T1-F7-01..05, T1-F8-01..05, T1-F9-01..05 | T2-F6-01..05, T2-F7-01..05, T2-F8-01..05, T2-F9-01..05 | T3-PAIR-01, 03, 04, 07, 08 | T4-SCENARIO-01, 02, 03, 05 |
| **R4** | Type Safety, Zero Layout Shift, Cloudflare Build & Test Verification | F10, F11, F12 | T1-F10-01..05, T1-F11-01..05, T1-F12-01..05 | T2-F10-01..05, T2-F11-01..05, T2-F12-01..05 | T3-PAIR-11, 12 | T4-SCENARIO-02, 06 |

---

## 8. Summary Table of Test Case Counts

| Tier Level | Focus Area | Features Covered | Target Count | Formulated Count |
|------------|------------|------------------|--------------|------------------|
| **Tier 1** | Functional Feature Coverage | Features 1–12 | >= 60 | 60 |
| **Tier 2** | Boundary & Edge Cases | Features 1–12 | >= 60 | 60 |
| **Tier 3** | Pairwise Feature Interactions | Features 1–12 | >= 12 | 12 |
| **Tier 4** | Real-World Workload Scenarios | Features 1–12 | >= 6 | 6 |
| **TOTAL**  | Complete E2E Suite | Features 1–12 | **>= 138** | **138** |
