import React from 'react';
import type { CategoryKey } from '../types/qc.ts';

interface AppHeaderProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  batchCount: number;
  onOpenBatchDrawer: () => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark' | 'auto';
  onToggleTheme: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  editMode,
  onToggleEditMode,
  batchCount,
  onOpenBatchDrawer,
  onOpenSettings,
  theme,
  onToggleTheme,
}) => {
  return (
    <header
      className="app-header"
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--mantine-color-gray-3, #e9ecef)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--header-bg, #ffffff)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>QC Standard Wording</h2>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: '#e7f5ff',
            color: '#1971c2',
            fontWeight: 600,
          }}
        >
          v2.0
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Edit Mode Toggle */}
        <button
          id="editBtn"
          className={`edit-btn ${editMode ? 'on' : ''}`}
          onClick={onToggleEditMode}
          title="Toggle Edit Mode"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: editMode ? '1px solid #1971c2' : '1px solid #ced4da',
            cursor: 'pointer',
            background: editMode ? '#1971c2' : '#ffffff',
            color: editMode ? '#ffffff' : '#212529',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.15s ease',
          }}
        >
          Edit Mode
        </button>

        {/* Batch Drawer Button */}
        <button
          id="batchBtn"
          className="batch-btn"
          onClick={onOpenBatchDrawer}
          title="Open Batch Drawer"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #ced4da',
            cursor: 'pointer',
            background: '#ffffff',
            color: '#212529',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Batch Queue</span>
          <span
            id="bcount"
            className="bcount"
            style={{
              background: '#1971c2',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {batchCount}
          </span>
        </button>

        {/* Settings Button */}
        <button
          id="setBtn"
          className="set-btn settings-btn"
          onClick={onOpenSettings}
          title="Appearance & Layout Settings"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #ced4da',
            cursor: 'pointer',
            background: '#ffffff',
            color: '#212529',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          Settings
        </button>

        {/* Download Offline Copy */}
        <button
          id="dlBtn"
          className="dl-btn"
          onClick={() => {
            if (typeof document === 'undefined') return;
            const html = document.documentElement.outerHTML;
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qc-standard-wording-offline.html';
            a.click();
            URL.revokeObjectURL(url);
          }}
          title="Download Offline Copy"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #ced4da',
            cursor: 'pointer',
            background: '#ffffff',
            color: '#212529',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          Offline Copy
        </button>

        {/* Theme Toggle */}
        <button
          id="themeBtn"
          className="theme-btn"
          onClick={onToggleTheme}
          title="Toggle Dark/Light Theme"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #ced4da',
            cursor: 'pointer',
            background: '#ffffff',
            color: '#212529',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
};
