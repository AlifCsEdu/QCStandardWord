import React from 'react';
import type { AppearanceSettings, DensityMode, LayoutMode, MotionMode, RadiusOption, TextSizeOption } from '../types/qc.ts';

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
    <div
      id="setmodal"
      className={`settings-modal-container ${isOpen ? 'open' : ''}`}
      style={{
        display: isOpen ? 'flex' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '460px',
          maxWidth: '90vw',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 700 }}>
          Appearance & Display Preferences
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Layout Selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Layout View Mode:
            </label>
            <div id="setLayout" style={{ display: 'flex', gap: '8px' }}>
              {(['list', 'grid', 'table'] as LayoutMode[]).map((mode) => (
                <button
                  key={mode}
                  data-v={mode}
                  onClick={() => onSetLayout(mode)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: appearance.layout === mode ? '2px solid #1971c2' : '1px solid #ced4da',
                    background: appearance.layout === mode ? '#e7f5ff' : '#ffffff',
                    color: appearance.layout === mode ? '#1971c2' : '#495057',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Density Selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Density:
            </label>
            <div id="setDensity" style={{ display: 'flex', gap: '8px' }}>
              {(['cozy', 'compact'] as DensityMode[]).map((den) => (
                <button
                  key={den}
                  data-density={den}
                  onClick={() => onSetDensity(den)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: appearance.density === den ? '2px solid #1971c2' : '1px solid #ced4da',
                    background: appearance.density === den ? '#e7f5ff' : '#ffffff',
                    color: appearance.density === den ? '#1971c2' : '#495057',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {den}
                </button>
              ))}
            </div>
          </div>

          {/* Radius Option */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Border Radius:
            </label>
            <div id="setRadius" style={{ display: 'flex', gap: '8px' }}>
              {(['sharp', 'soft', 'round'] as RadiusOption[]).map((rad) => (
                <button
                  key={rad}
                  data-radius={rad}
                  onClick={() => onSetRadius(rad)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: appearance.radius === rad ? '2px solid #1971c2' : '1px solid #ced4da',
                    background: appearance.radius === rad ? '#e7f5ff' : '#ffffff',
                    color: appearance.radius === rad ? '#1971c2' : '#495057',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {rad}
                </button>
              ))}
            </div>
          </div>

          {/* Text Size Option */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Text Size:
            </label>
            <div id="setText" style={{ display: 'flex', gap: '8px' }}>
              {(['s', 'm', 'l'] as TextSizeOption[]).map((sz) => (
                <button
                  key={sz}
                  data-size={sz}
                  onClick={() => onSetTextSize(sz)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: appearance.textsize === sz ? '2px solid #1971c2' : '1px solid #ced4da',
                    background: appearance.textsize === sz ? '#e7f5ff' : '#ffffff',
                    color: appearance.textsize === sz ? '#1971c2' : '#495057',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Motion Option */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Animations:
            </label>
            <div id="setMotion" style={{ display: 'flex', gap: '8px' }}>
              {(['full', 'reduced'] as MotionMode[]).map((mo) => (
                <button
                  key={mo}
                  data-motion={mo}
                  onClick={() => onSetMotion(mo)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: appearance.motion === mo ? '2px solid #1971c2' : '1px solid #ced4da',
                    background: appearance.motion === mo ? '#e7f5ff' : '#ffffff',
                    color: appearance.motion === mo ? '#1971c2' : '#495057',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {mo}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Palette */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Accent Palette:
            </label>
            <div id="setAccent" style={{ display: 'flex', gap: '8px' }}>
              {['indigo', 'blue', 'teal', 'green', 'orange', 'red', 'grape'].map((col) => (
                <button
                  key={col}
                  data-accent={col}
                  onClick={() => onSetAccent(col)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: appearance.accent === col ? '2px solid #1971c2' : '1px solid #ced4da',
                    background: appearance.accent === col ? '#e7f5ff' : '#ffffff',
                    color: '#495057',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            id="setdone"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#1971c2',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
