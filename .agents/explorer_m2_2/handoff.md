# Handoff Report: Top Header, Hero Search Bar & Spotlight Command Modal Strategy (Milestone M2)

## 1. Observation
- **Inspected Files**:
  - `src/components/AppHeader.tsx` (Lines 1–265): Contains sticky header, hero search input, view switcher `#setLayout`, action triggers (`#editBtn`, `#batchBtn`, `#bcount`, `#setBtn`, `#dlBtn`, `#themeBtn`), and Spotlight button `#spotlightBtn`.
  - `src/App.tsx` (Lines 129–138 & 308–333): Implements `useEffect` shortcut listener for `Cmd+K`/`Ctrl+K` keybindings and mounts `<CommandDialog>`.
  - `src/components/ui/command.tsx` & `src/components/ui/dialog.tsx`: Wrapped CMDK and Radix Dialog primitives.
  - `tests/harness.js` & `tests/tier1-features.test.js`: Validated test query methods for `#appHeader`, `#search`, `#clearBtn`, `[data-testid="spotlight-trigger"]`, `#setLayout`, `data-v="list|grid|table"`, and `#bcount`.
- **Direct Observations & Defects Found**:
  - `AppHeader.tsx` currently uses legacy dark classes (`bg-zinc-900/95`, `backdrop-blur-md`, `border-zinc-800`).
  - `AppHeader.tsx` line 163 uses `<FolderPin ... />` without importing `FolderPin` from `lucide-react` (only `Folder` is imported).
  - Spotlight modal in `App.tsx` lacks cyan ambient glow border, keyboard navigation help footer (`[↑↓] Navigate`, `[↵] Copy & Close`, `[ESC] Exit`), and JetBrains Mono code badges for defect numbers.

## 2. Logic Chain
1. **Goal**: Upgrade `AppHeader.tsx` and Spotlight `CommandDialog` modal to 2026 Linear/Vercel design standards (glassmorphism `backdrop-blur-xl`, Onyx background `#0c0e12`, ambient cyan border glow `from-cyan-500/20 to-blue-500/10`, Geist/Inter + JetBrains Mono typography).
2. **Constraint Verification**: Must strictly preserve DOM selector IDs (`#appHeader`, `#search`, `#clearBtn`, `#spotlightBtn`, `#setLayout`, `#editBtn`, `#batchBtn`, `#bcount`, `#setBtn`, `#dlBtn`, `#themeBtn`), attributes (`data-v="list|grid|table"`, `data-testid`), search input handlers, and `Cmd+K`/`Ctrl+K` keybindings.
3. **Refactoring Strategy**:
   - `AppHeader.tsx`: Apply `bg-[#0c0e12]/80 backdrop-blur-xl border-b border-white/[0.08]`. Wrap hero search input with `focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.25)]`. Apply active cyan highlight state to view switcher buttons (`data-v`). Fix missing `FolderPin` import.
   - `CommandDialog` in `command.tsx` & `App.tsx`: Apply Onyx backdrop `bg-[#0c0e12]/95 backdrop-blur-xl`, ambient cyan border `border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.25)]`, JetBrains Mono number badges `#{item.n}`, and add keyboard navigation shortcut footer bar.

## 3. Caveats
- No caveats. The exact selectors and attributes expected by test suite `tests/tier1-features.test.js` and `tests/harness.js` have been mapped and preserved in the proposed implementation strategy.

## 4. Conclusion
The comprehensive refactoring strategy detailed in `strategy_header_search.md` provides exact code structures and CSS styling to achieve state-of-the-art 2026 Linear/Vercel visual quality while guaranteeing 100% test contract compliance and fixing pre-existing missing import bugs.

## 5. Verification Method
- **Static Build**: `npm run build`
- **Test Suite**: `npm test` (specifically Tier 1 feature tests in `tests/tier1-features.test.js` covering search, view switcher, spotlight modal trigger, clear search, and header rendering).
- **Inspect Files**:
  - `c:\Users\alif325\Documents\WIndsurf projeks\QCStandardWording\.agents\explorer_m2_2\strategy_header_search.md`
