# Milestone 1 (R2 100% Functional Settings Engine) Technical Recommendation & Implementation Blueprint

## 1. Observation

### Codebase Inspection Findings
1. **`src/types/qc.ts` (Lines 71–88)**:
   - `DensityMode` is currently defined as `'cozy' | 'compact'`, missing the tablet ergonomic mode (`'tablet'`) required for Samsung Galaxy Tab S9+ 48px touch targets.
   - `RadiusOption` is currently `'sharp' | 'soft' | 'round'`, missing numeric literals (`'0' | '6' | '10' | '16'`).
   - `TextSizeOption` is currently `'s' | 'm' | 'l'`, missing numeric pixel literals (`'13' | '14' | '16'`).
   - `AccentOption` and `ThemeMode` are not formally defined as dedicated union types.
   - `AppearanceSettings` accent property is typed as `string` without typed palette presets.

2. **`src/hooks/useAppearance.ts` (Lines 44–146)**:
   - Only synchronizes `data-theme`, `data-density`, and `data-layout` attributes on `document.documentElement`.
   - Does **not** inject `data-radius`, `data-font-size`, `data-text-size`, `data-accent`, `data-motion`.
   - Does **not** inject the `--radius` CSS variable on `document.documentElement.style`.
   - Does **not** dynamically set `document.documentElement.style.fontSize`.
   - Does **not** listen to `window.matchMedia('(prefers-color-scheme: dark)')` change events for `'auto'` theme.
   - Does **not** listen to multi-tab `storage` events for synchronized cross-tab preference updates.

3. **`src/index.css` (Lines 15–85, 310–345)**:
   - Contains basic dark/light theme variables but lacks comprehensive CSS custom property mappings for:
     - 3 Density Modes (`compact` 36px, `cozy` 44px, `tablet` 48px touch targets).
     - 4 Radius Levels (`0px`, `6px`, `10px`, `16px`).
     - 3 Font Sizes (`13px`, `14px`, `16px`).
     - 5 Rich Accent Palettes (Warm Amber, Sage Emerald, Slate Stone, Rose Red, Ocean Blue).
     - Global Reduced Motion overrides (`animation-duration: 0.01ms !important`, `scroll-behavior: auto !important`).
     - Custom sleek touch-friendly scrollbars across WebKit and Firefox.

4. **`src/components/SettingsModal.tsx` (Lines 1–203)**:
   - Currently uses raw HTML buttons inside a custom wrapper.
   - Missing the `'tablet'` density option.
   - Missing numeric radius and font size options.
   - Missing theme selection (Auto / Dark / Light) in modal controls.
   - Missing rich accent color swatches with visual indicators.
   - Must preserve all legacy DOM IDs and test IDs (`#setmodal`, `#setLayout`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`, `#setdone`, `data-testid="settings-modal"`, `data-testid="settings-close-btn"`).

---

## 2. Logic Chain

1. **Foundational Types (`src/types/qc.ts`)**:
   - Defining `DensityMode = 'compact' | 'cozy' | 'tablet'` unlocks the 48px touch target mode for tablet ergonomics while maintaining backward compatibility with existing tests.
   - Defining `RadiusOption = '0' | '6' | '10' | '16' | 'sharp' | 'soft' | 'round'` and `TextSizeOption = '13' | '14' | '16' | 's' | 'm' | 'l'` allows both modern numeric specifications and legacy semantic strings to parse without runtime type mismatch.
   - Formalizing `AccentOption = 'amber' | 'emerald' | 'stone' | 'rose' | 'blue' | string` and `ThemeMode = 'dark' | 'light' | 'auto'` enforces strong typing across settings components and state hooks.

2. **Dynamic DOM Attribute & Style Injection Engine (`src/hooks/useAppearance.ts`)**:
   - Applying all data attributes (`data-theme`, `data-density`, `data-radius`, `data-font-size`, `data-text-size`, `data-accent`, `data-motion`, `data-layout`) directly to `document.documentElement` allows Tailwind CSS v4 attribute selectors (e.g. `[data-density='tablet']`) and pure CSS variables to cascade throughout the component tree with zero re-render overhead.
   - Inlining `--radius` and root `fontSize` (`13px`, `14px`, `16px`) onto `document.documentElement.style` guarantees instant visual updates even if CSS is not fully loaded or in headless test environments.
   - Registering a listener on `window.matchMedia('(prefers-color-scheme: dark)')` when `theme === 'auto'` ensures immediate theme switching when the user changes OS appearance.
   - Registering a `window.addEventListener('storage', ...)` listener synchronizes appearance changes seamlessly across multiple browser tabs without requiring a page reload.

3. **Complete CSS Custom Properties & Token Mappings (`src/index.css`)**:
   - Density CSS blocks dynamically adjust touch target heights (`min-height: var(--touch-target-min)`), card padding, and spacing.
   - Radius CSS blocks map `--radius` tokens to all buttons, cards, dialogs, and inputs.
   - 5 Accent Palettes define `--accent-primary`, `--accent-hover`, `--accent-glow`, `--accent-subtle`, `--accent-border`, and `--accent-ring`.
   - Global reduced motion override suppresses transitions and animations for accessibility compliance.
   - Touch scrollbars provide clean, sleek 6px pill thumbs without layout shifts.

4. **Sleek Settings Modal Component (`src/components/SettingsModal.tsx`)**:
   - Modernized using Radix Dialog, ToggleGroup / Segmented controls, and interactive color swatches.
   - Preserves all legacy IDs (`#setmodal`, `#setLayout`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`, `#setdone`) and data attributes (`data-v`, `data-density`, `data-radius`, `data-size`, `data-motion`, `data-accent`) to maintain 100% test compatibility.
   - Enhances tablet touch ergonomics with min 44–48px touch targets and clear active states.

---

## 3. Caveats

1. **Dual Format Compatibility**: Users may have legacy localStorage data storing `'soft'`, `'sharp'`, `'round'` or `'s'`, `'m'`, `'l'`. The hook and CSS selectors must normalize and support both formats simultaneously.
2. **DOM ID Preservation**: Automated test suites in `tests/tier1-features.test.js`, `tests/tier2-boundary.test.js`, and `tests/harness.js` query `#setmodal`, `#setLayout`, `#setDensity`, `#setRadius`, `#setText`, `#setMotion`, `#setAccent`, `#setdone`. These exact DOM element IDs and data attributes MUST NOT be removed or renamed.
3. **JSDOM Style Isolation**: In JSDOM test environments, `window.matchMedia` is mocked, and CSS custom property inheritance is not evaluated. Injecting attributes and inline styles directly on `document.documentElement` satisfies both JSDOM test assertions and real browser rendering engines.

---

## 4. Conclusion & Concrete Code Specifications

### 4.1. File 1: `src/types/qc.ts`

```typescript
export type LayoutMode = 'list' | 'grid' | 'table';
export type RadiusOption = '0' | '6' | '10' | '16' | 'sharp' | 'soft' | 'round';
export type TextSizeOption = '13' | '14' | '16' | 's' | 'm' | 'l';
export type DensityMode = 'compact' | 'cozy' | 'tablet';
export type MotionMode = 'full' | 'reduced';
export type AccentOption = 'amber' | 'emerald' | 'stone' | 'rose' | 'blue' | string;
export type ThemeMode = 'dark' | 'light' | 'auto';
export type DelimiterKey = 'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet';
export type SortOption = 'default' | 'alpha' | 'num';

export interface AppearanceSettings {
  layout: LayoutMode;
  radius: RadiusOption;
  textsize: TextSizeOption;
  accent: AccentOption | string;
  density: DensityMode;
  motion: MotionMode;
  theme: ThemeMode;
}
```

---

### 4.2. File 2: `src/hooks/useAppearance.ts`

```typescript
import { useCallback, useEffect, useState } from 'react';
import type {
  AccentOption,
  AppearanceSettings,
  DensityMode,
  LayoutMode,
  MotionMode,
  RadiusOption,
  SortOption,
  TextSizeOption,
  ThemeMode,
} from '../types/qc.ts';

export const DEFAULT_SETTINGS: AppearanceSettings = {
  layout: 'list',
  radius: '10',
  textsize: '14',
  accent: 'stone',
  density: 'cozy',
  motion: 'full',
  theme: 'dark',
};

function safeJSONParse<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeStorageGet(key: string, fallback: string): string {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Failed to set localStorage key ${key}:`, err);
  }
}

function normalizeRadius(rad?: string): RadiusOption {
  if (!rad) return '10';
  if (['0', '6', '10', '16', 'sharp', 'soft', 'round'].includes(rad)) {
    return rad as RadiusOption;
  }
  return '10';
}

function getRadiusPx(rad: RadiusOption): string {
  switch (rad) {
    case '0':
    case 'sharp':
      return '0px';
    case '6':
    case 'soft':
      return '6px';
    case '10':
      return '10px';
    case '16':
    case 'round':
      return '16px';
    default:
      return typeof rad === 'string' && rad.endsWith('px') ? rad : '10px';
  }
}

function normalizeTextSize(size?: string): TextSizeOption {
  if (!size) return '14';
  if (['13', '14', '16', 's', 'm', 'l'].includes(size)) {
    return size as TextSizeOption;
  }
  return '14';
}

function getTextSizePx(size: TextSizeOption): string {
  switch (size) {
    case '13':
    case 's':
      return '13px';
    case '14':
    case 'm':
      return '14px';
    case '16':
    case 'l':
      return '16px';
    default:
      return typeof size === 'string' && size.endsWith('px') ? size : '14px';
  }
}

function normalizeDensity(den?: string): DensityMode {
  if (!den) return 'cozy';
  if (['compact', 'cozy', 'tablet'].includes(den)) {
    return den as DensityMode;
  }
  return 'cozy';
}

function normalizeTheme(theme?: string): ThemeMode {
  if (!theme) return 'dark';
  if (['dark', 'light', 'auto'].includes(theme)) {
    return theme as ThemeMode;
  }
  return 'dark';
}

function normalizeMotion(motion?: string): MotionMode {
  if (!motion) return 'full';
  if (['full', 'reduced'].includes(motion)) {
    return motion as MotionMode;
  }
  return 'full';
}

function normalizeLayout(layout?: string): LayoutMode {
  if (!layout) return 'list';
  if (['list', 'grid', 'table'].includes(layout)) {
    return layout as LayoutMode;
  }
  return 'list';
}

export function useAppearance() {
  const [appearance, setAppearanceState] = useState<AppearanceSettings>(() => {
    const savedApp = safeJSONParse<Partial<AppearanceSettings>>('qc-appearance', {});
    const rawTheme = safeStorageGet('qc-theme', savedApp.theme || 'dark');
    const savedTheme = normalizeTheme(rawTheme);
    const rawDensity = safeStorageGet('qc-density', savedApp.density || 'cozy');
    const savedDensity = normalizeDensity(rawDensity);

    return {
      layout: normalizeLayout(savedApp.layout),
      radius: normalizeRadius(savedApp.radius),
      textsize: normalizeTextSize(savedApp.textsize),
      accent: savedApp.accent || DEFAULT_SETTINGS.accent,
      density: savedDensity,
      motion: normalizeMotion(savedApp.motion),
      theme: savedTheme,
    };
  });

  const [sortOption, setSortOptionState] = useState<SortOption>(() => {
    return (safeStorageGet('qc-sort', 'default') as SortOption) || 'default';
  });

  // Dynamic injection on document.documentElement
  useEffect(() => {
    safeStorageSet('qc-appearance', JSON.stringify(appearance));
    safeStorageSet('qc-theme', appearance.theme);
    safeStorageSet('qc-density', appearance.density);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      const isDark =
        appearance.theme === 'dark' ||
        (appearance.theme === 'auto' &&
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      root.classList.toggle('dark', isDark);
      root.setAttribute('data-theme', appearance.theme);
      root.setAttribute('data-density', appearance.density);
      root.setAttribute('data-radius', String(appearance.radius));
      root.setAttribute('data-font-size', String(appearance.textsize));
      root.setAttribute('data-text-size', String(appearance.textsize));
      root.setAttribute('data-accent', appearance.accent);
      root.setAttribute('data-motion', appearance.motion);
      root.setAttribute('data-layout', appearance.layout);

      // Injected CSS custom properties
      root.style.setProperty('--radius', getRadiusPx(appearance.radius));
      root.style.fontSize = getTextSizePx(appearance.textsize);
    }
  }, [appearance]);

  // System Theme listener for 'auto' mode
  useEffect(() => {
    if (appearance.theme === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      };
    }
  }, [appearance.theme]);

  // Multi-tab storage event synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;

      if (event.key === 'qc-appearance' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setAppearanceState((prev) => ({
            ...prev,
            layout: normalizeLayout(parsed.layout || prev.layout),
            radius: normalizeRadius(parsed.radius || prev.radius),
            textsize: normalizeTextSize(parsed.textsize || prev.textsize),
            accent: parsed.accent || prev.accent,
            density: normalizeDensity(parsed.density || prev.density),
            motion: normalizeMotion(parsed.motion || prev.motion),
            theme: normalizeTheme(parsed.theme || prev.theme),
          }));
        } catch {}
      } else if (event.key === 'qc-theme' && event.newValue) {
        setAppearanceState((prev) => ({ ...prev, theme: normalizeTheme(event.newValue || prev.theme) }));
      } else if (event.key === 'qc-density' && event.newValue) {
        setAppearanceState((prev) => ({ ...prev, density: normalizeDensity(event.newValue || prev.density) }));
      } else if (event.key === 'qc-sort' && event.newValue) {
        const nextSort = (event.newValue as SortOption) || 'default';
        if (['default', 'alpha', 'num'].includes(nextSort)) {
          setSortOptionState(nextSort);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    safeStorageSet('qc-sort', sortOption);
  }, [sortOption]);

  const setTheme = useCallback((themeOrFn: ThemeMode | ((prev: ThemeMode) => ThemeMode)) => {
    setAppearanceState((prev) => {
      const nextTheme = typeof themeOrFn === 'function' ? themeOrFn(prev.theme) : themeOrFn;
      return {
        ...prev,
        theme: normalizeTheme(nextTheme),
      };
    });
  }, []);

  const setLayout = useCallback((layout: LayoutMode) => {
    setAppearanceState((prev) => ({ ...prev, layout: normalizeLayout(layout) }));
  }, []);

  const setRadius = useCallback((radius: RadiusOption) => {
    setAppearanceState((prev) => ({ ...prev, radius: normalizeRadius(radius) }));
  }, []);

  const setDensity = useCallback((density: DensityMode) => {
    setAppearanceState((prev) => ({ ...prev, density: normalizeDensity(density) }));
  }, []);

  const setTextSize = useCallback((textsize: TextSizeOption) => {
    setAppearanceState((prev) => ({ ...prev, textsize: normalizeTextSize(textsize) }));
  }, []);

  const setMotion = useCallback((motion: MotionMode) => {
    setAppearanceState((prev) => ({ ...prev, motion: normalizeMotion(motion) }));
  }, []);

  const setAccent = useCallback((accent: AccentOption | string) => {
    setAppearanceState((prev) => ({ ...prev, accent: accent || 'stone' }));
  }, []);

  const setSortOption = useCallback((sort: SortOption) => {
    setSortOptionState(sort);
  }, []);

  return {
    appearance,
    theme: appearance.theme,
    layout: appearance.layout,
    radius: appearance.radius,
    density: appearance.density,
    textSize: appearance.textsize,
    textsize: appearance.textsize,
    motion: appearance.motion,
    accent: appearance.accent,
    sortOption,
    setTheme,
    setLayout,
    setRadius,
    setDensity,
    setTextSize,
    setMotion,
    setAccent,
    setSortOption,
  };
}
```

---

### 4.3. File 3: `src/index.css` (CSS Variable Token Enhancements)

```css
/* ==========================================================================
   Density Scaling Modes (Compact, Cozy, Tablet)
   ========================================================================== */
:root,
[data-density='cozy'] {
  --touch-target-min: 44px;
  --spacing-card-p: 12px 16px;
  --spacing-card-gap: 10px;
  --spacing-density-card: 0.75rem;
  --spacing-density-btn: 0.5rem 0.75rem;
  --btn-padding-y: 8px;
  --btn-padding-x: 12px;
}

[data-density='compact'] {
  --touch-target-min: 36px;
  --spacing-card-p: 8px 12px;
  --spacing-card-gap: 6px;
  --spacing-density-card: 0.5rem;
  --spacing-density-btn: 0.25rem 0.5rem;
  --btn-padding-y: 4px;
  --btn-padding-x: 8px;
}

[data-density='tablet'] {
  --touch-target-min: 48px;
  --spacing-card-p: 16px 20px;
  --spacing-card-gap: 14px;
  --spacing-density-card: 1rem;
  --spacing-density-btn: 0.75rem 1rem;
  --btn-padding-y: 10px;
  --btn-padding-x: 16px;
}

/* ==========================================================================
   Border Radius Levels
   ========================================================================== */
[data-radius='0'],
[data-radius='sharp'] {
  --radius: 0px;
  --radius-card: 0px;
  --radius-btn: 0px;
}

[data-radius='6'],
[data-radius='soft'] {
  --radius: 6px;
  --radius-card: 6px;
  --radius-btn: 6px;
}

[data-radius='10'] {
  --radius: 10px;
  --radius-card: 10px;
  --radius-btn: 8px;
}

[data-radius='16'],
[data-radius='round'] {
  --radius: 16px;
  --radius-card: 16px;
  --radius-btn: 12px;
}

/* ==========================================================================
   Font Size Scaling
   ========================================================================== */
[data-font-size='13'],
[data-font-size='s'],
[data-text-size='13'],
[data-text-size='s'] {
  --font-size-base: 13px;
}

[data-font-size='14'],
[data-font-size='m'],
[data-text-size='14'],
[data-text-size='m'] {
  --font-size-base: 14px;
}

[data-font-size='16'],
[data-font-size='l'],
[data-text-size='16'],
[data-text-size='l'] {
  --font-size-base: 16px;
}

/* ==========================================================================
   5 Rich Accent Palettes
   ========================================================================== */
/* Warm Amber */
[data-accent='amber'] {
  --accent-primary: #f59e0b;
  --accent-hover: #d97706;
  --accent-glow: rgba(245, 158, 11, 0.25);
  --accent-subtle: rgba(245, 158, 11, 0.12);
  --accent-border: rgba(245, 158, 11, 0.4);
  --accent-ring: #f59e0b;
  --accent-foreground: #000000;
}

/* Sage Emerald */
[data-accent='emerald'],
[data-accent='green'] {
  --accent-primary: #10b981;
  --accent-hover: #059669;
  --accent-glow: rgba(16, 185, 129, 0.25);
  --accent-subtle: rgba(16, 185, 129, 0.12);
  --accent-border: rgba(16, 185, 129, 0.4);
  --accent-ring: #10b981;
  --accent-foreground: #ffffff;
}

/* Slate Stone */
:root,
[data-accent='stone'] {
  --accent-primary: #78716c;
  --accent-hover: #57534e;
  --accent-glow: rgba(120, 113, 108, 0.25);
  --accent-subtle: rgba(120, 113, 108, 0.12);
  --accent-border: rgba(120, 113, 108, 0.4);
  --accent-ring: #a8a29e;
  --accent-foreground: #ffffff;
}

/* Rose Red */
[data-accent='rose'],
[data-accent='plum'] {
  --accent-primary: #f43f5e;
  --accent-hover: #e11d48;
  --accent-glow: rgba(244, 63, 94, 0.25);
  --accent-subtle: rgba(244, 63, 94, 0.12);
  --accent-border: rgba(244, 63, 94, 0.4);
  --accent-ring: #f43f5e;
  --accent-foreground: #ffffff;
}

/* Ocean Blue */
[data-accent='blue'],
[data-accent='steel'] {
  --accent-primary: #0ea5e9;
  --accent-hover: #0284c7;
  --accent-glow: rgba(14, 165, 233, 0.25);
  --accent-subtle: rgba(14, 165, 233, 0.12);
  --accent-border: rgba(14, 165, 233, 0.4);
  --accent-ring: #0ea5e9;
  --accent-foreground: #ffffff;
}

/* ==========================================================================
   Reduced Motion Accessibility Override
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

[data-motion='reduced'],
[data-motion='reduced'] *,
[data-motion='reduced'] *::before,
[data-motion='reduced'] *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

/* ==========================================================================
   Custom Touch-Friendly Scrollbars (WebKit & Firefox)
   ========================================================================== */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(113, 113, 122, 0.4) transparent;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(113, 113, 122, 0.35);
  border-radius: 9999px;
  transition: background 150ms ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(161, 161, 170, 0.6);
}
```

---

### 4.4. File 4: `src/components/SettingsModal.tsx`

```tsx
import React from 'react';
import {
  Sun,
  Moon,
  Monitor,
  LayoutList,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  Zap,
  Check,
  Palette,
  Type,
  Maximize2,
  Minimize2,
  Tablet,
} from 'lucide-react';
import type {
  AccentOption,
  AppearanceSettings,
  DensityMode,
  LayoutMode,
  MotionMode,
  RadiusOption,
  TextSizeOption,
  ThemeMode,
} from '../types/qc.ts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog.tsx';
import { Button } from './ui/button.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appearance: AppearanceSettings;
  onSetLayout: (layout: LayoutMode) => void;
  onSetRadius: (radius: RadiusOption) => void;
  onSetDensity: (density: DensityMode) => void;
  onSetTextSize: (textSize: TextSizeOption) => void;
  onSetMotion: (motion: MotionMode) => void;
  onSetAccent: (accent: AccentOption | string) => void;
  onSetTheme?: (theme: ThemeMode) => void;
}

const ACCENT_PALETTES: { id: AccentOption; name: string; hex: string; bgClass: string }[] = [
  { id: 'amber', name: 'Warm Amber', hex: '#f59e0b', bgClass: 'bg-amber-500' },
  { id: 'emerald', name: 'Sage Emerald', hex: '#10b981', bgClass: 'bg-emerald-500' },
  { id: 'stone', name: 'Slate Stone', hex: '#78716c', bgClass: 'bg-stone-500' },
  { id: 'rose', name: 'Rose Red', hex: '#f43f5e', bgClass: 'bg-rose-500' },
  { id: 'blue', name: 'Ocean Blue', hex: '#0ea5e9', bgClass: 'bg-sky-500' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appearance,
  onSetLayout,
  onSetRadius,
  onSetDensity,
  onSetTextSize,
  onSetMotion,
  onSetAccent,
  onSetTheme,
}) => {
  return (
    <>
      {/* Wrapper container for backward compatibility with tests querying #setmodal */}
      <div
        id="setmodal"
        data-testid="settings-modal"
        className={`settings-modal-container ${isOpen ? 'block' : 'hidden'}`}
      >
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="bg-[#18181b] border-stone-800 text-stone-100 max-w-xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="size-4.5 text-stone-400" />
                Appearance & Display Preferences
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-400">
                Customize touch ergonomics, density, theme palettes, typography, and motion effects.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5 py-2">
              {/* Theme Mode Selector (if onSetTheme provided) */}
              {onSetTheme && (
                <div>
                  <label className="block mb-2 text-xs font-semibold text-stone-300">
                    Theme Mode:
                  </label>
                  <div id="setTheme" className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'dark', label: 'Dark (Stone)', icon: Moon },
                      { id: 'light', label: 'Light (Paper)', icon: Sun },
                      { id: 'auto', label: 'Auto (System)', icon: Monitor },
                    ].map(({ id, label, icon: IconComp }) => {
                      const isActive = appearance.theme === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          data-theme={id}
                          onClick={() => onSetTheme(id as ThemeMode)}
                          className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                              : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                          }`}
                        >
                          <IconComp className="size-3.5" />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Layout Selector */}
              <div>
                <label className="block mb-2 text-xs font-semibold text-stone-300">
                  Layout View Mode:
                </label>
                <div id="setLayout" className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'list', label: 'List View', icon: LayoutList },
                    { id: 'grid', label: 'Grid Cards', icon: LayoutGrid },
                    { id: 'table', label: 'Data Table', icon: TableIcon },
                  ].map(({ id, label, icon: IconComp }) => {
                    const isActive = appearance.layout === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-v={id}
                        data-value={id}
                        onClick={() => onSetLayout(id as LayoutMode)}
                        className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all capitalize cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                        }`}
                      >
                        <IconComp className="size-3.5" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density Selector (Compact, Cozy, Tablet) */}
              <div>
                <label className="block mb-2 text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>Touch Ergonomics & Density:</span>
                  <span className="text-[11px] font-normal text-stone-400 font-mono">
                    {appearance.density === 'tablet' ? '48px Touch Targets' : appearance.density === 'compact' ? '36px Compact' : '44px Balanced'}
                  </span>
                </label>
                <div id="setDensity" className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'Compact', desc: '36px', icon: Minimize2 },
                    { id: 'cozy', label: 'Cozy', desc: '44px', icon: Maximize2 },
                    { id: 'tablet', label: 'Tablet S9+', desc: '48px', icon: Tablet },
                  ].map(({ id, label, desc, icon: IconComp }) => {
                    const isActive = appearance.density === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-density={id}
                        onClick={() => onSetDensity(id as DensityMode)}
                        className={`flex flex-col items-center justify-center min-h-[48px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <IconComp className="size-3.5" />
                          <span>{label}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">{desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border Radius Options */}
              <div>
                <label className="block mb-2 text-xs font-semibold text-stone-300">
                  Border Radius:
                </label>
                <div id="setRadius" className="grid grid-cols-4 gap-2">
                  {[
                    { id: '0', alias: 'sharp', label: 'Sharp (0px)' },
                    { id: '6', alias: 'soft', label: 'Subtle (6px)' },
                    { id: '10', alias: '10', label: 'Medium (10px)' },
                    { id: '16', alias: 'round', label: 'Round (16px)' },
                  ].map(({ id, alias, label }) => {
                    const isActive = appearance.radius === id || appearance.radius === alias;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-radius={id}
                        onClick={() => onSetRadius(id as RadiusOption)}
                        className={`flex items-center justify-center min-h-[44px] py-2 px-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                        }`}
                      >
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Scaling Options */}
              <div>
                <label className="block mb-2 text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Type className="size-3.5 text-stone-400" />
                    Root Typography Scale:
                  </span>
                  <span className="text-[11px] font-normal text-stone-400 font-mono">
                    {appearance.textsize === '13' || appearance.textsize === 's'
                      ? '13px Base'
                      : appearance.textsize === '16' || appearance.textsize === 'l'
                      ? '16px Large'
                      : '14px Standard'}
                  </span>
                </label>
                <div id="setText" className="grid grid-cols-3 gap-2">
                  {[
                    { id: '13', alias: 's', label: 'Small (13px)' },
                    { id: '14', alias: 'm', label: 'Normal (14px)' },
                    { id: '16', alias: 'l', label: 'Large (16px)' },
                  ].map(({ id, alias, label }) => {
                    const isActive = appearance.textsize === id || appearance.textsize === alias;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-size={id}
                        data-textsize={id}
                        onClick={() => onSetTextSize(id as TextSizeOption)}
                        className={`flex items-center justify-center min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                        }`}
                      >
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette Swatches */}
              <div>
                <label className="block mb-2 text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Palette className="size-3.5 text-stone-400" />
                  Accent Color Palette:
                </label>
                <div id="setAccent" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ACCENT_PALETTES.map(({ id, name, hex, bgClass }) => {
                    const isActive = appearance.accent === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-accent={id}
                        onClick={() => onSetAccent(id)}
                        className={`flex items-center gap-2 min-h-[44px] py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold ring-1 ring-stone-500 shadow-xs'
                            : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                        }`}
                      >
                        <span
                          className={`size-3.5 rounded-full ${bgClass} shrink-0 border border-black/20 flex items-center justify-center`}
                        >
                          {isActive && <Check className="size-2 text-black stroke-[3]" />}
                        </span>
                        <span className="truncate text-[11px]">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Motion and Animations Option */}
              <div>
                <label className="block mb-2 text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Zap className="size-3.5 text-stone-400" />
                  Animations & Motion:
                </label>
                <div id="setMotion" className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'full', label: 'Full Motion (Springs & Transitions)' },
                    { id: 'reduced', label: 'Reduced Motion (Instant)' },
                  ].map(({ id, label }) => {
                    const isActive = appearance.motion === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-motion={id}
                        onClick={() => onSetMotion(id as MotionMode)}
                        className={`flex items-center justify-center min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                        }`}
                      >
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-stone-800">
              <Button
                id="setdone"
                data-testid="settings-close-btn"
                onClick={onClose}
                className="w-full sm:w-auto min-h-[44px] bg-stone-100 text-stone-900 font-bold hover:bg-white px-8 rounded-lg cursor-pointer transition-all"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
```

---

## 5. Verification Method

To independently verify all changes upon implementation:

1. **Test Suite Execution**:
   ```bash
   npm test
   ```
   Ensures 100% pass rate across Tier 1 through Tier 5 and all adversarial stress suites.

2. **TypeScript Compilation & Production Build**:
   ```bash
   npm run build
   ```
   Ensures type safety across all updated types and clean static output compilation in `./dist`.

3. **DOM Selector & Attribute Integrity Verification**:
   - Inspect `#setmodal` container rendering and visibility toggling.
   - Inspect `#setLayout [data-v]`, `#setDensity [data-density]`, `#setRadius [data-radius]`, `#setText [data-size]`, `#setMotion [data-motion]`, `#setAccent [data-accent]`, and `#setdone`.
   - Verify `document.documentElement` attributes (`data-theme`, `data-density`, `data-radius`, `data-font-size`, `data-accent`, `data-motion`) reflect live UI state.
   - Verify multi-tab `storage` event handler responds to external `qc-appearance` updates.
