# QC Standard Wording — E2E Test Infrastructure & Methodology

## Overview
This document specifies the architecture, environment setup, expected output derivation rules, test inventory, and execution methodology for the QC Standard Wording opaque-box test suite.

The test suite validates the full specifications defined in `ORIGINAL_REQUEST.md` and `PROJECT.md`, covering dataset integrity, fuzzy search engine, category filtering, sub-category chips, view modes, batch operations, custom delimiters, history, pinning, inline editing, undo lifecycle, storage persistence, security escaping, boundary limits, and end-to-end inspection workflows.

---

## Test Architecture & Framework Setup

- **Test Runner**: Native Node.js test runner (`node:test`, `node:assert/strict`) via ES Modules (`"type": "module"` in `package.json`).
- **DOM Engine**: `JSDOM` v26 for headless, opaque-box DOM rendering and user interaction simulation.
- **Browser API Mocks**:
  - `localStorage` (In-memory `MockLocalStorage` implementation)
  - `navigator.clipboard.writeText` & `navigator.clipboard.readText`
  - `navigator.vibrate`
  - `window.matchMedia`
  - `window.scrollTo`
  - `URL.createObjectURL` & `URL.revokeObjectURL`

---

## Directory Structure

```
QCStandardWording/
├── TEST_INFRA.md              # Test infrastructure & methodology specification (Root)
├── TEST_READY.md              # Test suite completion & execution ready signal (Root)
├── package.json               # Dependencies and test runner scripts
├── standardwording.html       # Canonical reference oracle application
└── tests/
    ├── harness.js             # JSDOM loader, MockLocalStorage, and opaque DOM helper APIs
    ├── tier1-features.test.js # Tier 1: Feature Coverage test suite (17 tests)
    ├── tier2-boundary.test.js # Tier 2: Boundary & Corner Cases test suite (10 tests)
    ├── tier3-combinations.test.js # Tier 3: Cross-Feature Combinations test suite (3 tests)
    └── tier4-workloads.test.js    # Tier 4: Real-World Workload Scenarios test suite (2 tests)
```

---

## Expected Output Derivation Methodology

All expected test values and behavior assertions are derived directly from authoritative project specifications:
1. **Reference Program (Oracle)**: `standardwording.html` provides the canonical reference implementation, dataset definitions (139+ QC defect entries), category keys, Levenshtein distance calculations (`lev`), sub-sequence scoring (`subseq`), alias mappings (`ALIAS`), storage persistence keys (`qc-pins`, `qc-batch`, `qc-edits`, `qc-dels`, `qc-custom`, `qc-recents`), and batch joiner strings.
2. **Interface Contracts**: Derived from `PROJECT.md` § Interface Contracts (`QCItem`, `CategoryKey`, `SubCategoryCode`, `SearchResult`).
3. **Requirement Verification**: Every test case validates observable user interaction outputs (rendered list items, highlight `<mark>` tags, approximate match indicator pills `≈`, drawer queue counters, clipboard outputs, toast messages, and `localStorage` JSON structures).

---

## Comprehensive Test Suite Inventory

### Tier 1: Feature Coverage (17 Test Cases)
- **1. Dataset & Category Coverage**:
  - Full dataset initialization (139+ entries).
  - Filtering across all 13 standard categories (`codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`).
  - Virtual categories initialization (`pinned`, `recent`).
- **2. Fuzzy Search Engine & Alias Expansion**:
  - Exact and substring search matching.
  - Term alias expansion (`"display"` -> screen, `"spen"` -> pen).
  - Matching substring highlighting (`<mark>`).
- **3. Sub-Category Chip Filtering**:
  - Code sub-category chip visibility toggling for `codes` category.
  - Filtering items by sub-category codes (`FCPB`, `FCPW`, etc.).
- **4. View Mode Layout Transitions**:
  - Switching layout display modes between `list`, `grid`, and `table`.
- **5. Batch Queue & Custom Delimiters**:
  - Queueing items and counter updates.
  - Formatting batch output with custom delimiters (`nl` `\n`, `comma` `, `, `semi` `; `, `space` ` `).
  - Autoclear flag behavior (`true` clears queue on copy, `false` retains queue).
  - Removing individual items and clearing entire queue.
- **6. Copy & History Feed**:
  - Single item click copy and recent history recording.
  - Direct re-copying from recent history chips.
- **7. Favorites / Pinning System**:
  - Item pinning, persistence in `qc-pins`, and filtering in `pinned` view.
- **8. Edit Mode & Storage Persistence**:
  - Custom wording entry creation, saving to `qc-custom`, and searchability.

### Tier 2: Boundary & Corner Cases (10 Test Cases)
- **1. Levenshtein Typos & Bounded Distance**:
  - Off-by-one typos (`"batery"` -> battery).
  - Off-by-two typos (`"scren"` -> screen).
  - Approximate match indicator pill (`≈`) rendering for scores < 80.
  - Bounded distance tolerance cap filtering out unrelated terms.
- **2. Empty Search & Whitespace Handling**:
  - Empty search returning full dataset.
  - Trimming leading/trailing whitespace and handling whitespace-only input.
- **3. Special Characters & Escaping Integrity (Adversarial)**:
  - Regex meta-character safety (`[`, `]`, `(`, `)`, `*`, `+`, `?`, `^`, `$`, `\`, `.`, `|`).
  - HTML escaping for malicious script inputs (`<script>alert("XSS")</script>`).
- **4. Max Batch Queue Items & Large Workload**:
  - Queueing 50+ unique items into batch queue and verifying formatted copy output.
- **5. Storage Fallback & Corrupted Data Resilience**:
  - Graceful application initialization when `localStorage` contains corrupted JSON syntax strings.

### Tier 3: Cross-Feature Combinations (3 Test Cases)
- **Pipeline 1**: Category filter (`codes`) + Sub-category chip (`FCPB`) + Search (`"crease"`) + Batch Queue + Custom Semicolon Delimiter (`"; "`).
- **Pipeline 2**: Custom Edit Mode Wording Creation + Item Pinning + Search + Pinned Category Filter View.
- **Pipeline 3**: Edit Mode Entry Creation + Item Deletion + 4.2s Undo Toast Action + JSON Export Payload Verification.

### Tier 4: Real-World Workload Scenarios (2 Test Cases)
- **Workload 1 (Mobile Inspection Workflow)**: Technician launches tool -> switches layout to Compact Table -> searches screen defect with typo -> copies wording directly -> inspects battery, camera, and panel code defects -> adds items to batch -> sets newline joiner -> copies batch report -> verifies auto-cleared queue.
- **Workload 2 (Supervisor Audit & Sync Workflow)**: Supervisor enters Edit mode -> creates 3 model-specific custom defects -> verifies `qc-custom` storage -> exports `qc-wording-changes.json` -> resets all changes -> verifies clean state -> imports JSON payload -> verifies restored entries and search functionality.

---

## How to Run the Tests

### Command Line Options

Run full test suite (32 tests across Tiers 1-4):
```bash
npm test
```

Run specific test tiers:
```bash
npm run test:tier1    # Feature Coverage (17 tests)
npm run test:tier2    # Boundary & Corner Cases (10 tests)
npm run test:tier3    # Cross-Feature Combinations (3 tests)
npm run test:tier4    # Real-World Workload Scenarios (2 tests)
```

Direct Node.js test execution:
```bash
node --test tests/**/*.test.js
```
