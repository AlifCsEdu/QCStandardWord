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
      root.setAttribute('data-accent', String(appearance.accent));
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
