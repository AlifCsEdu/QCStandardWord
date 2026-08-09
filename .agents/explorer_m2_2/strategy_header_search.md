# Technical Refactoring Strategy: Top Header, Hero Search Bar & Spotlight Command Modal (Milestone M2)

## Executive Summary
This document defines the architectural and visual refactoring strategy for Milestone M2's header and search components (`AppHeader.tsx`, `App.tsx`, and `command.tsx`). The primary goal is to elevate the UI to 2026 Linear/Vercel design standards—featuring glassmorphic backdrop blurring (`backdrop-blur-xl`), Onyx surface containers (`#0c0e12`), ambient cyan glow borders (`from-cyan-500/20 to-blue-500/10`), and Geist/Inter font typography—while maintaining 100% backward compatibility with DOM selector contracts (`#appHeader`, `#search`, `#setLayout`, `data-v="list|grid|table"`, etc.) and test suite expectations.

---

## 1. Component Audit & Current State Analysis

### 1.1 Sticky Top Header (`AppHeader.tsx`)
- **Current File**: `src/components/AppHeader.tsx` (Lines 1–265)
- **Current Styling**: Uses legacy Tailwind dark classes (`bg-zinc-900/95`, `backdrop-blur-md`, `border-zinc-800`).
- **Detected Defect / Bug**: Line 163 references `<FolderPin className="size-3.5 text-cyan-400" />`, but `FolderPin` is NOT imported from `lucide-react` at the top of `AppHeader.tsx` (only `Folder` is imported). This must be fixed by importing `FolderPin` or using `Folder`.
- **Mandatory DOM IDs & Attributes**:
  - Container: `id="appHeader"`, `data-testid="app-header"`
  - Mobile Toggle: `aria-label="Toggle navigation"`
  - Search Input: `id="search"`, `data-testid="header-search-input"`
  - Clear Button: `id="clearBtn"`, `data-testid="clear-search-btn"`
  - Spotlight Trigger: `id="spotlightBtn"`, `data-testid="spotlight-trigger"`
  - View Switcher Container: `id="setLayout"`, `data-testid="view-switcher"`
  - View Switcher Items: `data-v="list"`, `data-v="grid"`, `data-v="table"`, `data-value="..."`
  - Edit Mode Toggle: `id="editBtn"`, `className="edit-btn ..."`
  - Batch Drawer Trigger: `id="batchBtn"`, `className="batch-btn ..."`
  - Batch Counter Pill: `id="bcount"`, `className="bcount ..."`
  - Settings Trigger: `id="setBtn"`, `className="set-btn settings-btn ..."`
  - Offline Download Button: `id="dlBtn"`, `className="dl-btn ..."`
  - Theme Toggle: `id="themeBtn"`, `className="theme-btn ..."`

### 1.2 CommandDialog Spotlight Search Modal (`src/App.tsx` & `src/components/ui/command.tsx`)
- **Current Files**:
  - Main app binding: `src/App.tsx` (Lines 129–138 for keydown `Cmd+K` / `Ctrl+K`, Lines 307–333 for `<CommandDialog>`)
  - Primitive wrappers: `src/components/ui/command.tsx` (CMDK + Radix Dialog wrapper)
- **Current Styling**: Basic Zinc dark background (`bg-zinc-900`, `border-zinc-800`).
- **Deficiencies**: Lacks ambient cyan glow framing, missing shortcut help footer (`[↑↓] Select`, `[↵] Copy`, `[ESC] Close`), and lacks JetBrains Mono code badges for defect numbers.

---

## 2. 2026 Linear/Vercel Aesthetic Engine Specifications

### 2.1 Color Palette & Glassmorphic Surface Tokens
- **Top Header Navbar (`#appHeader`)**:
  - Background: `bg-[#0c0e12]/80` (Onyx surface with 80% opacity) combined with `backdrop-blur-xl` and `-webkit-backdrop-filter: blur(24px)`.
  - Razor-sharp Border: `border-b border-white/[0.08]` (1px subtle specular border).
  - Ambient Top Shadow: `shadow-[0_4px_30px_rgba(0,0,0,0.4)]`.

### 2.2 Hero Search Input & ⌘K Shortcut Badge
- **Container Styling**:
  - Background: `bg-[#0c0e12]` (Onyx dark surface) or `bg-zinc-950/90`.
  - Border & Glow: `border border-white/[0.1] focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.25)] focus-within:ring-1 focus-within:ring-cyan-500/50`.
  - Transition: `transition-all duration-200 ease-out`.
- **Search Input Text**: `font-sans text-sm text-zinc-100 placeholder:text-zinc-500`.
- **Spotlight Trigger Button (`#spotlightBtn`)**:
  - Background: `bg-[#0c0e12] border border-white/[0.08] hover:border-cyan-500/40 hover:bg-zinc-900/60 text-zinc-300 hover:text-zinc-100`.
  - Badge Element: `<span className="font-mono text-[10px] tracking-tight bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-md font-semibold">⌘K</span>`.

### 2.3 Segmented View Switcher (`#setLayout`)
- **Container (`#setLayout`)**:
  - Background: `bg-[#0c0e12] border border-white/[0.08] p-1 rounded-lg flex items-center gap-1`.
- **Option Item (`data-v="list|grid|table"`)**:
  - Active State (`layoutMode === mode`): `bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-bold`.
  - Inactive State: `bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] font-medium`.
  - Typography: `font-sans text-xs capitalize transition-all duration-150`.

### 2.4 Spotlight Command Modal (`CommandDialog`)
- **Dialog Surface**:
  - Background: `bg-[#0c0e12]/95 backdrop-blur-xl`.
  - Border: `border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.25)] sm:rounded-xl overflow-hidden`.
- **Command Input**:
  - Icon: Glowing Cyan Search Icon (`<Search className="size-4 text-cyan-400 animate-pulse" />`).
  - Text: `font-sans text-sm text-zinc-100 placeholder:text-zinc-500`.
- **Command Item Active Highlight**:
  - Selected item state: `data-[selected=true]:bg-cyan-500/10 data-[selected=true]:text-cyan-200 data-[selected=true]:border-l-2 data-[selected=true]:border-cyan-400 transition-colors`.
  - Defect Number: `font-mono text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded`.
- **Command Dialog Footer Bar**:
  - Added bottom instruction bar for quick keyboard navigation:
    ```tsx
    <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2 bg-zinc-950/80 text-[11px] font-mono text-zinc-400">
      <div className="flex items-center gap-3">
        <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">↑↓</kbd> Navigate</span>
        <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">↵</kbd> Copy & Close</span>
      </div>
      <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">ESC</kbd> Exit</span>
    </div>
    ```

---

## 3. Preservation Strategy & Risk Mitigation

| Target Contract | Current Implementation | Preservation Strategy | Verification Criteria |
|---|---|---|---|
| Header Container ID | `<header id="appHeader">` | Maintain exact `id="appHeader"` and `data-testid="app-header"` | `document.querySelector('#appHeader')` returns non-null |
| Search Bar ID & Attributes | `<Input id="search" data-testid="header-search-input">` | Retain `id="search"`, `data-testid`, and `onChange` handler | `app.search("battery")` finds input and triggers filtering |
| Clear Search Button | `<button id="clearBtn" data-testid="clear-search-btn">` | Retain `id="clearBtn"` and conditional rendering `hasQuery` | `app.clearSearch()` resets search state |
| Spotlight Trigger | `<Button id="spotlightBtn" data-testid="spotlight-trigger">` | Retain `id="spotlightBtn"` and `onClick={onOpenSpotlight}` | Click opens Spotlight modal |
| View Switcher Selector | `<div id="setLayout" data-testid="view-switcher">` | Retain container ID `#setLayout` & `data-testid` | `app.getSegmentedControl()` returns element |
| View Switcher Modes | `<button data-v="list">`, `data-v="grid"`, `data-v="table"` | Retain `data-v` attributes and `onClick` handlers | `app.setLayout("grid")` updates state & DOM |
| Edit Mode Toggle | `<Button id="editBtn" className="edit-btn ...">` | Retain `id="editBtn"` and `edit-btn` class | `toggleEditMode()` works as expected |
| Batch Drawer Toggle | `<Button id="batchBtn" className="batch-btn ...">` | Retain `id="batchBtn"` and `batch-btn` class | Clicking opens Batch Drawer |
| Batch Count Badge | `<span id="bcount" className="bcount ...">` | Retain `id="bcount"` and `bcount` class | Count badge matches `batchQueue.length` |
| Settings Trigger | `<Button id="setBtn" className="set-btn settings-btn ...">` | Retain `id="setBtn"` and `set-btn` class | Clicking opens Settings modal |
| Keyboard Shortcut | `(e.metaKey \|\| e.ctrlKey) && e.key === 'k'` in `App.tsx` | Retain global `keydown` listener in `App.tsx` | Pressing Cmd+K / Ctrl+K toggles `spotlightOpen` |

---

## 4. Detailed Implementation Strategy for Implementer Agent

### 4.1 Update `src/components/AppHeader.tsx`
1. **Fix Missing Import**: Add `FolderPin` to imports from `lucide-react` or substitute with `Folder`.
2. **Refactor Container**:
   Change `<header className="... bg-zinc-900/95 backdrop-blur-md ...">` to:
   ```tsx
   <header
     id="appHeader"
     data-testid="app-header"
     className="app-header sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0c0e12]/80 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap min-h-[60px] box-border text-zinc-100 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
   >
   ```
3. **Refactor Search Container & Input**:
   Wrap hero search input in a high-contrast container with focus glow:
   ```tsx
   <div className="relative flex-1 group">
     <Input
       id="search"
       data-testid="header-search-input"
       type="text"
       value={searchQuery}
       onChange={(e) => onSearchChange(e.target.value)}
       onKeyDown={(e) => {
         if (e.key === 'Enter') e.preventDefault();
       }}
       placeholder="Search QC defects (e.g. FCPB, battery, display, crease)..."
       className="w-full pr-9 bg-[#0c0e12] border-white/[0.08] text-zinc-100 text-sm placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all duration-200"
     />
     {hasQuery && (
       <button
         id="clearBtn"
         data-testid="clear-search-btn"
         className="clear-btn show absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-cyan-400 bg-transparent border-0 cursor-pointer p-1 transition-colors"
         onClick={onClearSearch}
         title="Clear search"
       >
         <X className="size-4" />
       </button>
     )}
   </div>
   ```
4. **Refactor Spotlight Trigger Button (`#spotlightBtn`)**:
   ```tsx
   <Button
     id="spotlightBtn"
     data-testid="spotlight-trigger"
     className="spotlight-btn bg-[#0c0e12] border border-white/[0.08] text-zinc-300 hover:bg-zinc-900 hover:border-cyan-500/40 hover:text-zinc-100 text-xs gap-2 whitespace-nowrap h-9 px-3 transition-all"
     variant="outline"
     onClick={onOpenSpotlight}
     title="Quick Search (Cmd+K / Ctrl+K)"
   >
     <Search className="size-3.5 text-cyan-400" />
     <span className="font-mono text-[10px] tracking-tight bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-semibold">⌘K</span>
   </Button>
   ```
5. **Refactor View Switcher (`#setLayout`)**:
   ```tsx
   <div id="setLayout" data-testid="view-switcher" className="inline-flex rounded-lg bg-[#0c0e12] p-1 border border-white/[0.08]">
     {(['list', 'grid', 'table'] as LayoutMode[]).map((mode) => (
       <button
         key={mode}
         data-v={mode}
         data-value={mode}
         onClick={() => onSetLayout(mode)}
         className={`px-2.5 py-1 text-xs font-semibold rounded transition-all duration-150 border-0 cursor-pointer capitalize ${
           layoutMode === mode
             ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-bold'
             : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
         }`}
       >
         {mode}
       </button>
     ))}
   </div>
   ```
6. **Refactor Action Buttons**:
   - `editBtn`: Active state glows with `bg-cyan-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]`. Inactive state: `bg-[#0c0e12] border-white/[0.08] text-zinc-200 hover:bg-zinc-800`.
   - `batchBtn`: Styled with `bg-[#0c0e12] border-white/[0.08]`, `#bcount` badge with `bg-cyan-400 text-zinc-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]`.

### 4.2 Update `src/components/ui/command.tsx` & Spotlight Modal (`src/App.tsx`)
1. In `src/components/ui/command.tsx`:
   Update `CommandDialog` container to include ambient cyan glow border and 2026 Onyx backdrop:
   ```tsx
   const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
     return (
       <Dialog {...props}>
         <DialogContent className="overflow-hidden p-0 shadow-2xl border-cyan-500/30 bg-[#0c0e12]/95 backdrop-blur-xl sm:rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.2)]">
           <Command data-testid="spotlight-modal" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-cyan-400/80 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
             {children}
           </Command>
         </DialogContent>
       </Dialog>
     );
   };
   ```
2. In `src/App.tsx`:
   Enhance items rendered inside `<CommandList>` with JetBrains Mono number badges and category pills:
   ```tsx
   <CommandDialog open={spotlightOpen} onOpenChange={setSpotlightOpen}>
     <CommandInput placeholder="Search QC defects or type a command (e.g. battery, screen)..." />
     <CommandList className="max-h-[360px]">
       <CommandEmpty className="py-8 text-center text-sm text-zinc-500 font-sans">
         No matching QC wording defects found.
       </CommandEmpty>
       <CommandGroup heading="QC Wording Defects">
         {searchResults.slice(0, 20).map(({ item }) => (
           <CommandItem
             key={item.id}
             onSelect={() => {
               copySingleItem(item.t);
               setSpotlightOpen(false);
             }}
             className="cursor-pointer flex items-center justify-between py-2.5 px-3 rounded-lg data-[selected=true]:bg-cyan-500/10 data-[selected=true]:text-cyan-200 transition-colors"
           >
             <div className="flex items-center gap-2.5 min-w-0">
               <span className="font-mono text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                 #{item.n}
               </span>
               <span className="truncate text-sm text-zinc-100 font-sans font-medium">{item.t}</span>
             </div>
             <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/80 font-mono capitalize">
               {item.c}
             </span>
           </CommandItem>
         ))}
       </CommandGroup>
     </CommandList>
     <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2 bg-zinc-950/80 text-[11px] font-mono text-zinc-400">
       <div className="flex items-center gap-3">
         <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">↑↓</kbd> Navigate</span>
         <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">↵</kbd> Copy & Close</span>
       </div>
       <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700">ESC</kbd> Exit</span>
     </div>
   </CommandDialog>
   ```

---

## 5. Verification & Testing Plan

### 5.1 Static Type Check & Build Command
- Execute `npm run build` to verify TypeScript compilation and Vite bundle creation without errors.

### 5.2 Test Suite Execution
- Execute `npm test` (Runs Tier 1 through Tier 5 test suites).
- Specifically check `tests/tier1-features.test.js` Feature 4:
  - Top header rendering (`app.getAppHeader()`).
  - Search input interaction (`app.search('battery')`, `app.submitSearch('crease')`).
  - Clear search functionality (`app.clearSearch()`).
  - Spotlight modal opening and state (`app.openSpotlightModal()`, `app.isSpotlightOpen()`).
  - View switcher selection (`app.setLayout('grid')`).

### 5.3 Invalidation Conditions
The refactoring strategy is considered invalid if any of the following occur:
1. `npm run build` or `npm test` fails.
2. Selector `#appHeader` or `#search` or `#spotlightBtn` or `#setLayout` is missing or renamed.
3. Attribute `data-v="list|grid|table"` is omitted from view switcher buttons.
4. Missing import of `FolderPin` causes build or runtime crashes.
5. Keyboard shortcut `⌘K` / `Ctrl+K` fails to trigger Spotlight modal.

---
*Report prepared by `explorer_m2_2` for Milestone M2 Handoff.*
