# Handoff Report: Milestone M1 - Aesthetic Engine & Theme Tokens (`src/index.css`)

## 1. Observation
- **Current Theme Tokens in `src/index.css`**:
  - `--background`: `#09090b` (Deep Zinc Dark)
  - `--card`: `#18181b` (Charcoal surface)
  - `--popover`: `#18181b`
  - `--border`: `#27272a`
  - `--mantine-color-body`: Present on line 38 and line 79.
- **Selectors**:
  - `[data-mantine-color-scheme='dark']` and `[data-mantine-color-scheme='light']` are present in `src/index.css` (lines 289, 305).
- **Typography Infrastructure**:
  - `body` font family set to generic `system-ui, -apple-system, BlinkMacSystemFont...`.
  - No Google Fonts `@import` or Tailwind CSS v4 `@theme` block defined for Geist, Inter, or JetBrains Mono fonts.
- **Ambient Cyan Glow**:
  - Hover box-shadows on `.gcard:hover` exist, but no explicit utility classes (`.ambient-cyan-glow`, `.glow-cyan-subtle`) or CSS gradient variables are present for background glow effects (`from-cyan-500/20 to-blue-500/10`).

## 2. Logic Chain
1. **Requirement Mapping**: The user request and `PROJECT.md` require updating theme tokens to Deep Void Midnight (`#050608`), Onyx container surfaces (`#0c0e12`), 1px razor borders (`rgba(255, 255, 255, 0.08)` / `#27272a`), ambient cyan glow highlights, and Geist/Inter + JetBrains Mono typography.
2. **Purging Legacy Mantine Artefacts**: The specification explicitly mandates purging all legacy `--mantine-color-body` variables and `[data-mantine-color-scheme]` attributes.
3. **Tailwind v4 `@theme` Integration**: In Tailwind CSS v4, custom font families (`--font-sans`, `--font-mono`) and color tokens are properly registered via `@theme` directives alongside Google Fonts `@import`.
4. **Backward Compatibility**: Aliasing `--bg-deep-slate: #050608;` and `--container-charcoal: #0c0e12;` ensures any component or utility referencing these custom variables picks up the 2026 Deep Void theme without breakage.

## 3. Caveats
- `explorer_m1_1` is in read-only mode for `src/`. Source modifications in `src/index.css` must be executed by `implementer_m1_1` following the precise plan in `strategy_index_css.md`.
- Font loading depends on standard Google Fonts network availability or system font fallback chains defined in `--font-sans` and `--font-mono`.

## 4. Conclusion
The current `src/index.css` requires 5 targeted updates:
1. Google Fonts `@import` for Geist, Inter, and JetBrains Mono fonts + `@theme` block for Tailwind CSS v4.
2. Update `:root, [data-theme='dark'], .dark` tokens: `--background: #050608;`, `--card: #0c0e12;`, `--border: rgba(255, 255, 255, 0.08);`.
3. Purge `--mantine-color-body` and `[data-mantine-color-scheme]` selectors completely.
4. Add ambient cyan glow utility classes (`.ambient-cyan-glow`, `.glow-cyan-subtle`, `.glow-cyan-border`).
5. Update `.rnum` to use `font-family: var(--font-mono);`.

## 5. Verification Method
1. Inspect `src/index.css` after modification:
   - Confirm `--background` is `#050608`, `--card` is `#0c0e12`.
   - Confirm `--mantine-color-body` yields 0 grep matches.
2. Run build verification:
   `npm run build`
3. Run test verification:
   `npm test`
