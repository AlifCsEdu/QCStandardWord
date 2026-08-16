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

const ACCENT_PALETTES: { id: string; name: string; hex: string; bgClass: string }[] = [
  { id: 'stone', name: 'Slate Stone', hex: '#78716c', bgClass: 'bg-stone-500' },
  { id: 'amber', name: 'Warm Amber', hex: '#f59e0b', bgClass: 'bg-amber-500' },
  { id: 'green', name: 'Sage Emerald', hex: '#10b981', bgClass: 'bg-emerald-500' },
  { id: 'rose', name: 'Rose Red', hex: '#f43f5e', bgClass: 'bg-rose-500' },
  { id: 'blue', name: 'Ocean Blue', hex: '#0ea5e9', bgClass: 'bg-sky-500' },
  { id: 'steel', name: 'Steel Blue', hex: '#0284c7', bgClass: 'bg-blue-500' },
  { id: 'plum', name: 'Plum Rose', hex: '#e11d48', bgClass: 'bg-rose-600' },
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
          <DialogContent className="bg-[#22222a] bg-stone-900 border-stone-700/60 text-stone-100 max-w-xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="size-4.5 text-stone-400" />
                Appearance & Display Preferences
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-400">
                Customize touch ergonomics, density, theme palettes, typography, and motion effects.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              {/* Theme Mode Selector */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
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
                        onClick={() => onSetTheme && onSetTheme(id as ThemeMode)}
                        className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-[#141418]'
                        }`}
                      >
                        <IconComp className="size-3.5" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Selector */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
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
                        className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-150 active:scale-95 capitalize cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-[#141418]'
                        }`}
                      >
                        <IconComp className="size-3.5" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density Selector (Compact 36px, Cozy 44px, Tablet 48px) */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>Touch Ergonomics & Density:</span>
                  <span className="text-[11px] font-normal text-stone-400 font-mono">
                    {appearance.density === 'tablet'
                      ? '48px Touch Targets'
                      : appearance.density === 'compact'
                      ? '36px Compact'
                      : '44px Balanced'}
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
                        className={`flex flex-col items-center justify-center min-h-[48px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-[#141418]'
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
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
                  Border Radius:
                </label>
                <div id="setRadius" className="grid grid-cols-4 gap-2">
                  {[
                    { id: '0', alias: 'sharp', label: 'Sharp (0px)' },
                    { id: '6', alias: 'soft', label: 'Subtle (6px)' },
                    { id: '10', alias: '10', label: 'Medium (10px)' },
                    { id: '16', alias: 'round', label: 'Round (16px)' },
                  ].map(({ id, alias, label }) => {
                    const isActive =
                      appearance.radius === id ||
                      appearance.radius === alias ||
                      String(appearance.radius) === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-radius={alias}
                        onClick={() => onSetRadius(alias as RadiusOption)}
                        className={`flex items-center justify-center min-h-[44px] py-2 px-2 rounded-lg text-xs font-semibold border transition-all duration-150 active:scale-95 text-center cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-[#141418]'
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
                <label className="block mb-1.5 text-xs font-semibold text-stone-300 flex items-center justify-between">
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
                    const isActive =
                      appearance.textsize === id ||
                      appearance.textsize === alias ||
                      String(appearance.textsize) === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-size={alias}
                        data-textsize={alias}
                        data-fontsize={alias}
                        onClick={() => onSetTextSize(alias as TextSizeOption)}
                        className={`flex items-center justify-center min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-[#141418]'
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
                <label className="block mb-1.5 text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Palette className="size-3.5 text-stone-400" />
                  Accent Color Palette:
                </label>
                <div id="setAccent" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ACCENT_PALETTES.map(({ id, name, bgClass }) => {
                    const isActive =
                      appearance.accent === id ||
                      (id === 'green' && appearance.accent === 'emerald') ||
                      (id === 'blue' && appearance.accent === 'steel');
                    return (
                      <button
                        key={id}
                        type="button"
                        data-accent={id}
                        onClick={() => onSetAccent(id)}
                        className={`flex items-center gap-2 min-h-[44px] py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold ring-1 ring-stone-500 shadow-xs'
                            : 'bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-[#141418]'
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
                <label className="block mb-1.5 text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Zap className="size-3.5 text-stone-400" />
                  Animations & Motion:
                </label>
                <div id="setMotion" className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'full', label: 'Full Motion' },
                    { id: 'reduced', label: 'Reduced Motion' },
                  ].map(({ id, label }) => {
                    const isActive = appearance.motion === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        data-motion={id}
                        onClick={() => onSetMotion(id as MotionMode)}
                        className={`flex items-center justify-center min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-stone-800 border-stone-600 text-stone-100 font-bold shadow-xs'
                            : 'bg-[#1a1a20] border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-[#141418]'
                        }`}
                      >
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-stone-700/60">
              <Button
                id="setdone"
                data-testid="settings-close-btn"
                onClick={onClose}
                className="w-full sm:w-auto min-h-[44px] bg-stone-100 text-stone-900 font-bold hover:bg-white px-8 rounded-lg cursor-pointer transition-all duration-150 active:scale-95"
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
