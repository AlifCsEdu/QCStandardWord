import React from 'react';
import { SegmentedControl, Burger } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { LayoutMode } from '../types/qc.ts';

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  layoutMode: LayoutMode;
  onSetLayout?: (layout: LayoutMode) => void;
  onOpenSpotlight: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  batchCount: number;
  onOpenBatchDrawer: () => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark' | 'auto';
  onToggleTheme: () => void;
  mobileOpened?: boolean;
  onToggleMobile?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  layoutMode,
  onSetLayout,
  onOpenSpotlight,
  editMode,
  onToggleEditMode,
  batchCount,
  onOpenBatchDrawer,
  onOpenSettings,
  theme,
  onToggleTheme,
  mobileOpened = false,
  onToggleMobile,
}) => {
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <header
      id="appHeader"
      data-testid="app-header"
      className="app-header"
      style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--border-contrast, #334155)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--header-bg, #1e293b)',
        gap: '16px',
        flexWrap: 'wrap',
        minHeight: '60px',
        boxSizing: 'border-box',
      }}
    >
      {/* Left side: Mobile Burger + Logo/Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleMobile && (
          <Burger
            opened={mobileOpened}
            onClick={onToggleMobile}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />
        )}
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', whiteSpace: 'nowrap' }}>
          QC Standard Wording
        </h2>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-cyan, #06b6d4)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            fontWeight: 600,
          }}
        >
          v2.0
        </span>
      </div>

      {/* Middle: Search Bar + Clear Button + Cmd+K Spotlight Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '480px', minWidth: '220px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            id="search"
            data-testid="header-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            placeholder="Search QC defects (e.g. FCPB, battery, display, crease)..."
            style={{
              width: '100%',
              padding: '8px 36px 8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-contrast, #334155)',
              background: 'var(--bg-deep-slate, #0f172a)',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {hasQuery && (
            <button
              id="clearBtn"
              data-testid="clear-search-btn"
              className={`clear-btn ${hasQuery ? 'show' : ''}`}
              onClick={onClearSearch}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary, #94a3b8)',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 700,
                padding: '2px 4px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Cmd+K Spotlight Modal Trigger */}
        <button
          id="spotlightBtn"
          data-testid="spotlight-trigger"
          className="spotlight-btn"
          onClick={onOpenSpotlight}
          title="Quick Search (Cmd+K / Ctrl+K)"
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border-contrast, #334155)',
            background: 'var(--bg-deep-slate, #0f172a)',
            color: 'var(--text-secondary, #94a3b8)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          <IconSearch size={14} color="var(--accent-cyan, #06b6d4)" />
          <span>⌘K</span>
        </button>
      </div>

      {/* Right side: View Switcher SegmentedControl & Header Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {onSetLayout && (
          <SegmentedControl
            id="setLayout"
            data-testid="view-switcher"
            size="xs"
            value={layoutMode}
            onChange={(val) => onSetLayout(val as LayoutMode)}
            data={[
              { label: 'List', value: 'list' },
              { label: 'Grid', value: 'grid' },
              { label: 'Table', value: 'table' },
            ]}
          />
        )}

        {/* Edit Mode Toggle */}
        <button
          id="editBtn"
          className={`edit-btn ${editMode ? 'on' : ''}`}
          onClick={onToggleEditMode}
          title="Toggle Edit Mode"
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            border: editMode ? '1px solid var(--accent-sky, #0284c7)' : '1px solid var(--border-contrast, #334155)',
            cursor: 'pointer',
            background: editMode ? 'var(--accent-sky, #0284c7)' : 'var(--container-charcoal, #1e293b)',
            color: editMode ? '#ffffff' : 'var(--text-primary, #f8fafc)',
            fontWeight: 600,
            fontSize: '0.85rem',
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
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-contrast, #334155)',
            cursor: 'pointer',
            background: 'var(--container-charcoal, #1e293b)',
            color: 'var(--text-primary, #f8fafc)',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Batch Queue</span>
          <span
            id="bcount"
            className="bcount"
            style={{
              background: 'var(--accent-cyan, #06b6d4)',
              color: '#0f172a',
              padding: '1px 7px',
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
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-contrast, #334155)',
            cursor: 'pointer',
            background: 'var(--container-charcoal, #1e293b)',
            color: 'var(--text-primary, #f8fafc)',
            fontWeight: 600,
            fontSize: '0.85rem',
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
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-contrast, #334155)',
            cursor: 'pointer',
            background: 'var(--container-charcoal, #1e293b)',
            color: 'var(--text-primary, #f8fafc)',
            fontWeight: 500,
            fontSize: '0.85rem',
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
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-contrast, #334155)',
            cursor: 'pointer',
            background: 'var(--container-charcoal, #1e293b)',
            color: 'var(--text-primary, #f8fafc)',
            fontWeight: 500,
            fontSize: '0.85rem',
          }}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
};
