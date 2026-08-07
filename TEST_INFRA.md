# E2E Test Infrastructure & Test Architecture

## 1. Executive Overview & Methodology

The **QC Standard Wording 2026 UI/UX Overhaul** test suite provides comprehensive, opaque-box, requirement-driven verification for the QC defect inspection application. The testing architecture is designed to support both current legacy DOM elements and future 2026 Mantine v7 UI elements (`<AppShell.Navbar>`, `<AppShell.Header>`, `<SegmentedControl>`, Cmd+K Spotlight search modal, modern floating toast notifications, glassmorphic batch drawer, Deep Slate & Charcoal theme provider, and `data-testid` selector attributes).

### Key Test Principles
- **Dual-Mode Selector Resilience**: Test helpers transparently query both legacy selectors (`#search`, `#listwrap`, `[data-cat="..."]`, `#bcount`, `#blist`, `#toasts`) and modern 2026 Mantine v7 component structures (`[data-testid="app-navbar"]`, `[data-testid="app-header"]`, `[data-testid="view-switcher"]`, `[data-testid="floating-toast"]`, `[data-testid="batch-drawer"]`).
- **Progressive Testability & Isolation**: Tests run in an isolated JSDOM browser environment per test suite with an in-memory `localStorage` mock, mock clipboard API, mock matchMedia, and mock scrollTo.
- **High-Performance In-Memory Bundling**: The test harness uses `esbuild` to compile TypeScript React source files (`src/main.tsx`) into executable browser scripts on demand, with module-level bundle caching for ultra-fast execution (~15s total suite duration).

---

## 2. Test Architecture & File Structure

```
tests/
├── harness.js                 # Dual-mode JSDOM test runner harness & DOM interaction helpers
├── searchEngine.test.ts       # Algorithmic unit tests for search engine primitives & filters
├── tier1-features.test.js     # Tier 1: Feature Coverage (Happy Path for Features 1-10)
├── tier2-boundary.test.js     # Tier 2: Boundary & Corner Cases (Edge cases, adversarial inputs, layout shift, resilience)
├── tier3-combinations.test.js # Tier 3: Cross-Feature Combinations (Multi-component pipelines)
└── tier4-workloads.test.js    # Tier 4: Real-World Workload Scenarios (End-to-end technician & supervisor flows)
```

---

## 3. Feature Inventory Mapping (Features 1 through 10)

| # | Feature | Tier 1 (Feature Coverage) | Tier 2 (Boundary & Corner) | Tier 3 (Cross-Feature) | Tier 4 (Real-World Workloads) |
|---|---------|---------------------------|----------------------------|------------------------|-------------------------------|
| **1** | **Dependency Updates** | Mantine v7 bundle initialization check | Storage schema fallback | Component hook state sync | Full Vite build verification |
| **2** | **Deep Slate & Charcoal Theme** | Palette tokens (#0f172a, #1e293b, #334155, cyan accent) | Dark/Light mode color scheme fallbacks | Theme toggle persistence + contrast cards | Full inspection flow under Deep Slate theme |
| **3** | **Sticky Left Sidebar Navigation** | Sticky sidebar `<AppShell.Navbar>`, fixed 260px width, 13 categories | Mobile collapsible sidebar toggle & empty views | Sidebar nav + Spotlight search + View switcher sync | Desktop vs Mobile layout integrity workflow |
| **4** | **Top Header Search & View Switcher** | Top header `<AppShell.Header>`, Spotlight search trigger, `SegmentedControl` | Levenshtein typo cap, whitespace trimming, regex meta-char escaping | Cmd+K Spotlight + SegmentedControl + Category nav | Mobile technician inspection search flow |
| **5** | **Remove Duplicate Stats Header** | Single consolidated `StatsDashboard.tsx` header | Zero duplicate stats badges or orphaned summary elements | Dynamic stats count updates on category/pin filter | Supervisor model audit stats summary |
| **6** | **Eliminate Layout Shift** | Panel code chips (`FCPB`, `FCPW`) inside sidebar container | 0px vertical jump constraint verification | Rapid sub-code switching under search filtering | Viewport layout stability during workload |
| **7** | **Floating Toast Notifications** | Floating toast pills (`showFloatingToast`), category icons, progress timer | Rapid copy toast queueing & undo toast trigger | Toast feedback + Drawer queue + Undo restoration | Technician inspection copy toast feedback |
| **8** | **Glassmorphic Batch Drawer** | Slide-out drawer, backdrop-filter blur(8px), non-dimming overlay, reorder, copy | 50+ item batch queue, delimiter formatting, item removal | Batch drawer + Floating toasts + JSON export/import | Technician inspection batch report export |
| **9** | **High-Contrast Cards & Table Rows** | High-contrast borders (#334155), 150ms hover ease, category pill badges, List/Grid/Table views | HTML meta-character XSS escaping in custom titles | High-contrast items across list/grid/table mode switch | Compact table view defect inspection workflow |
| **10** | **E2E & Integrity Verification** | Favorites pinning, custom wording storage persistence | Storage corruption resilience & fallback recovery | 3 Multi-component integration pipelines | 3 End-to-end technician & supervisor workloads |

---

## 4. Test Tier Breakdown & Objectives

### Tier 1: Feature Coverage (`tests/tier1-features.test.js`)
Validates happy-path functionality for all 10 features:
- Dataset completeness (139+ defect items, 13 categories, 2 virtual categories).
- Mantine Provider theme tokens and layout initialization.
- Sticky left sidebar navigation (`<AppShell.Navbar>`).
- Top header search bar (`<AppShell.Header>`), Cmd+K Spotlight modal trigger, and alias expansion.
- Consolidated `StatsDashboard` summary header without duplicates.
- Panel code sub-category chips filtering (`FCPB`, `FCPW`).
- Floating toast pill notifications (`showFloatingToast`) with icons and progress feedback.
- Glassmorphic batch drawer queue, custom delimiters, item removal, and batch copy.
- Defect cards/rows with high-contrast borders (#334155), 150ms hover ease, category pill badges, and List/Grid/Table layout switcher.
- Favorites pinning (`qc-pins`), custom wording additions (`qc-custom`), and copy history feed (`qc-recents`).

### Tier 2: Boundary & Corner Cases (`tests/tier2-boundary.test.js`)
Tests boundary conditions, stress states, and error handling:
- **Levenshtein Typo Distance**: Off-by-one ("batery") and off-by-two ("scren") typo tolerance with `≈` fuzzy indicator pill; strict rejection of out-of-bounds queries ("xyzqwerty").
- **Empty Search & Whitespace**: Empty string search returns full dataset; whitespace trimming handling.
- **Adversarial Input Escaping**: Regex meta-characters (`[ ] ( ) * + ? ^ $ \ . |`) executed safely; HTML XSS payload (`<script>alert("XSS")</script>`) escaped without DOM injection.
- **Layout Shift Constraint**: Verifies 0px vertical jump constraint and constant sidebar width (260px) when toggling sub-code chips.
- **Large Workload & Rapid Throttling**: Queueing 50+ unique items in batch drawer and formatting with custom delimiters; rapid copy clicking without toast flooding.
- **Corrupted Storage Resilience**: Graceful boot and fallback to canonical dataset when `localStorage` contains malformed JSON syntax strings.

### Tier 3: Cross-Feature Combinations (`tests/tier3-combinations.test.js`)
Validates multi-component integration pipelines:
- **Pipeline 1**: Sidebar Category Nav + Top Header Spotlight Search + Segmented View Switcher Sync.
- **Pipeline 2**: Custom Wording Edit + Pin Favorite + Theme Toggle Persistence.
- **Pipeline 3**: Glassmorphic Batch Drawer Queue + Floating Toast Notifications + JSON Export/Import.

### Tier 4: Real-World Application Workloads (`tests/tier4-workloads.test.js`)
Validates complete user application workflows:
- **Workload 1**: Complete QC Mobile Technician Smartphone Defect Inspection Workflow.
- **Workload 2**: QC Supervisor Custom Wording Audit & Model Synchronization Workflow.
- **Workload 3**: Desktop vs Mobile Viewport Switch & AppShell Layout Integrity.

### Algorithmic Unit Tests (`tests/searchEngine.test.ts`)
Validates core search algorithms in isolation:
- Bounded Levenshtein distance calculation `lev(a, b, cap)`.
- Sub-sequence matching `subseq(t, h)`.
- Approximate match detection `isApprox(score)`.
- Pure category, sub-code, pinned, and recent filter functions.

---

## 5. Test Execution Commands

```bash
# Run all E2E test suites (Tiers 1-4)
node --test tests/**/*.test.js

# Run search engine pure algorithmic unit tests
npx tsx --test tests/searchEngine.test.ts

# Run TypeScript type safety check
npx tsc --noEmit

# Run production Vite build verification
npm run build
```
