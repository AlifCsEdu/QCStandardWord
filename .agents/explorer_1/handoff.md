# Handoff Report — Legacy QC Wording Data & Codebase Analysis

## 1. Observation
- File inspected: `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\standardwording.html` (3946 lines, 150,505 bytes).
- Base dataset array `BASE` defined at `standardwording.html:2434-2574` contains 139 defect entries (#2 through #140).
- Category array `CATS` defined at `standardwording.html:2576-2667` contains 13 standard categories (`codes`, `screen`, `camera`, `buttons`, `battery`, `backcover`, `locks`, `pen`, `water`, `audio`, `body`, `system`, and `all`) plus 2 virtual views (`pinned`, `recent`).
- Panel / Code groups array `CODE_SUBS` defined at `standardwording.html:2668-2679` contains 10 sub-category codes: `["ALL", "FCPB", "FCPW", "FCPC", "RCPB", "RCPW", "RCPC", "FCDS", "RCDS", "PC"]`.
- Search & fuzzy matching implementation located at `standardwording.html:2860-2963` featuring Levenshtein distance `lev()`, sub-sequence matching `subseq()`, keyword enrichment `CATKEY`, and alias mapping `ALIAS`.
- State storage management `store` defined at `standardwording.html:2767-2809` utilizing 12 distinct `localStorage` keys (`qc-appearance`, `qc-sort`, `qc-theme`, `qc-density`, `qc-pins`, `qc-recents`, `qc-history`, `qc-batch`, `qc-join`, `qc-autoclear`, `qc-edits`, `qc-dels`, `qc-custom`).

## 2. Logic Chain
1. **Defect Count Verification**:
   - `BASE` contains entries from #2 (`Symbol B`) to #140 (`HINGE`).
   - Total items = $140 - 2 + 1 = 139$ entries.
   - All entries map to one of 12 primary category keys (`body`, `backcover`, `battery`, `buttons`, `camera`, `codes`, `locks`, `system`, `audio`, `pen`, `screen`, `water`).

2. **Category Structuring**:
   - `CATS` maps 12 data categories + 1 `all` view = 13 standard categories.
   - Virtual categories `pinned` and `recent` operate as filtered views over the base dataset.

3. **Sub-category Filtering**:
   - When category is `codes`, sub-chips filter by item text prefix match: `norm(entry.t).startsWith(sub.toLowerCase())`.
   - The 10 sub-category chips break down into:
     - `FCPB` (#31–#35)
     - `FCPW` (#36–#40)
     - `RCPB` (#41–#45)
     - `RCPW` (#46–#50)
     - `FCDS` (#118–#119)
     - `RCDS` (#120–#121)
     - `RCPC` (#124–#128)
     - `FCPC` (#129–#133)
     - `PC` (#134–#138)
     - `ALL` (no prefix filter)

4. **Search Engine & Data Model Mapping for React Migration**:
   - The React + Vite + Mantine UI v7 implementation can directly ingest `BASE`, `CATS`, `CODE_SUBS`, `CATKEY`, and `ALIAS` without data loss.
   - Fuzzy search logic (`Levenshtein`, `subseq`, `matchTerm`, `rank`) should be abstracted into a clean utility module (e.g. `src/utils/searchEngine.ts`).

## 3. Caveats
- No external CSS or JS libraries were referenced in `standardwording.html`; all CSS and JavaScript are inline within the single HTML file.
- The legacy code relies on browser global `localStorage` for state persistence.
- No caveats regarding missing entries; all 139 defect rows were extracted verbatim.

## 4. Conclusion
The legacy codebase `standardwording.html` provides a complete, self-contained specification for data models, fuzzy search algorithm, categories, panel code chips, and local storage schema. All 139 QC defect entries, 13 categories, 10 code sub-chips, and UI features have been analyzed and documented in `analysis.md` for immediate implementation by the downstream frontend team.

## 5. Verification Method
1. Inspect `standardwording.html:2434-2574` to verify the array length of `BASE` equals 139.
2. Inspect `standardwording.html:2576-2667` to verify 13 categories + 2 virtual views.
3. Compare extracted data table in `analysis.md` with `standardwording.html` line-by-line.
