import React from 'react';
import type { AppearanceSettings, DensityMode, LayoutMode, MotionMode, RadiusOption, TextSizeOption } from '../types/qc.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog.tsx';
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
  onSetAccent: (accent: string) => void;
}

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
          <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-stone-100">
                Appearance & Display Preferences
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              {/* Layout Selector */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
                  Layout View Mode:
                </label>
                <div id="setLayout" className="flex gap-2">
                  {(['list', 'grid', 'table'] as LayoutMode[]).map((mode) => (
                    <button
                      key={mode}
                      data-v={mode}
                      data-value={mode}
                      onClick={() => onSetLayout(mode)}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold border transition-colors capitalize cursor-pointer ${
                        appearance.layout === mode
                          ? 'bg-stone-800 border-stone-700 text-stone-100 font-bold shadow-xs'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Density Selector */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
                  Density:
                </label>
                <div id="setDensity" className="flex gap-2">
                  {(['cozy', 'compact'] as DensityMode[]).map((den) => (
                    <button
                      key={den}
                      data-density={den}
                      onClick={() => onSetDensity(den)}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold border transition-colors capitalize cursor-pointer ${
                        appearance.density === den
                          ? 'bg-stone-800 border-stone-700 text-stone-100 font-bold shadow-xs'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {den}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius Option */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
                  Border Radius:
                </label>
                <div id="setRadius" className="flex gap-2">
                  {(['sharp', 'soft', 'round'] as RadiusOption[]).map((rad) => (
                    <button
                      key={rad}
                      data-radius={rad}
                      onClick={() => onSetRadius(rad)}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold border transition-colors capitalize cursor-pointer ${
                        appearance.radius === rad
                          ? 'bg-stone-800 border-stone-700 text-stone-100 font-bold shadow-xs'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {rad}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Size Option */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
                  Text Size:
                </label>
                <div id="setText" className="flex gap-2">
                  {(['s', 'm', 'l'] as TextSizeOption[]).map((sz) => (
                    <button
                      key={sz}
                      data-size={sz}
                      onClick={() => onSetTextSize(sz)}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold border transition-colors uppercase cursor-pointer ${
                        appearance.textsize === sz
                          ? 'bg-stone-800 border-stone-700 text-stone-100 font-bold shadow-xs'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion Option */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
                  Animations:
                </label>
                <div id="setMotion" className="flex gap-2">
                  {(['full', 'reduced'] as MotionMode[]).map((mo) => (
                    <button
                      key={mo}
                      data-motion={mo}
                      onClick={() => onSetMotion(mo)}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold border transition-colors capitalize cursor-pointer ${
                        appearance.motion === mo
                          ? 'bg-stone-800 border-stone-700 text-stone-100 font-bold shadow-xs'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {mo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-stone-300">
                  Accent Palette:
                </label>
                <div id="setAccent" className="flex flex-wrap gap-2">
                  {['stone', 'amber', 'green', 'steel', 'plum', 'rose'].map((col) => (
                    <button
                      key={col}
                      data-accent={col}
                      onClick={() => onSetAccent(col)}
                      className={`flex-1 min-w-[50px] py-1.5 px-2 rounded-md text-[11px] font-semibold border transition-colors capitalize cursor-pointer ${
                        appearance.accent === col
                          ? 'bg-stone-800 border-stone-700 text-stone-100 font-bold shadow-xs'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                id="setdone"
                data-testid="settings-close-btn"
                onClick={onClose}
                className="bg-stone-100 text-stone-900 font-bold hover:bg-white px-6"
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

