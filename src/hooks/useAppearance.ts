import { useCallback, useEffect, useState } from 'react';
import type { AppearanceSettings, DensityMode, LayoutMode, MotionMode, RadiusOption, SortOption, TextSizeOption } from '../types/qc.ts';

const DEFAULT_SETTINGS: AppearanceSettings = {
  layout: 'list',
  radius: 'soft',
  textsize: 'm',
  accent: 'indigo',
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

export function useAppearance() {
  const [appearance, setAppearanceState] = useState<AppearanceSettings>(() => {
    const savedApp = safeJSONParse<Partial<AppearanceSettings>>('qc-appearance', {});
    const savedTheme = safeStorageGet('qc-theme', savedApp.theme || 'dark') as AppearanceSettings['theme'];
    const savedDensity = safeStorageGet('qc-density', savedApp.density || 'cozy') as DensityMode;
    return {
      ...DEFAULT_SETTINGS,
      ...savedApp,
      theme: savedTheme,
      density: savedDensity,
    };
  });

  const [sortOption, setSortOptionState] = useState<SortOption>(() => {
    return (safeStorageGet('qc-sort', 'default') as SortOption) || 'default';
  });

  // Sync settings to localStorage and HTML root element attributes
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
      root.setAttribute('data-layout', appearance.layout);
    }
  }, [appearance]);

  useEffect(() => {
    safeStorageSet('qc-sort', sortOption);
  }, [sortOption]);

  const setTheme = useCallback((theme: AppearanceSettings['theme']) => {
    setAppearanceState((prev) => ({ ...prev, theme }));
  }, []);

  const setLayout = useCallback((layout: LayoutMode) => {
    setAppearanceState((prev) => ({ ...prev, layout }));
  }, []);

  const setRadius = useCallback((radius: RadiusOption) => {
    setAppearanceState((prev) => ({ ...prev, radius }));
  }, []);

  const setDensity = useCallback((density: DensityMode) => {
    setAppearanceState((prev) => ({ ...prev, density }));
  }, []);

  const setTextSize = useCallback((textsize: TextSizeOption) => {
    setAppearanceState((prev) => ({ ...prev, textsize }));
  }, []);

  const setMotion = useCallback((motion: MotionMode) => {
    setAppearanceState((prev) => ({ ...prev, motion }));
  }, []);

  const setAccent = useCallback((accent: string) => {
    setAppearanceState((prev) => ({ ...prev, accent }));
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
