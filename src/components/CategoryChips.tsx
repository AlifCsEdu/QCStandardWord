import React from 'react';
import { CATEGORIES } from '../data/qcData.ts';
import type { CategoryKey } from '../types/qc.ts';

interface CategoryChipsProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  return (
    <div
      id="nav"
      className="category-nav-container"
      style={{ padding: '12px 10px', borderBottom: '1px solid var(--border-contrast, #334155)' }}
    >
      <div
        id="chips"
        className="chips-scroll-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id];
          return (
            <button
              key={cat.id}
              data-cat={cat.id}
              onClick={() => {
                console.log('Chip clicked:', cat.id);
                onSelectCategory(cat.id);
              }}
              className={`chip-btn ${isActive ? 'active' : ''}`}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: isActive
                  ? `1px solid ${cat.color || 'var(--accent-cyan, #06b6d4)'}`
                  : '1px solid transparent',
                background: isActive
                  ? cat.color || 'rgba(6, 182, 212, 0.2)'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{cat.name}</span>
              {count !== undefined && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    opacity: 0.85,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--container-charcoal, #1e293b)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

