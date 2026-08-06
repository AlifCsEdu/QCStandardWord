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
    <div id="nav" className="category-nav-container" style={{ padding: '10px 20px', borderBottom: '1px solid #e9ecef' }}>
      <div
        id="chips"
        className="chips-scroll-container"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin',
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
                padding: '6px 14px',
                borderRadius: '16px',
                border: isActive ? `2px solid ${cat.color || '#1971c2'}` : '1px solid #ced4da',
                background: isActive ? cat.color || '#1971c2' : '#ffffff',
                color: isActive ? '#ffffff' : '#495057',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{cat.name}</span>
              {count !== undefined && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    opacity: 0.85,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#e9ecef',
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
