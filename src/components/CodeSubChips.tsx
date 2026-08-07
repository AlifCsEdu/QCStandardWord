import React from 'react';
import { CODE_SUBS } from '../data/qcData.ts';
import type { CategoryKey, SubCategoryCode } from '../types/qc.ts';

interface CodeSubChipsProps {
  selectedCategory: CategoryKey;
  selectedSubCategory: SubCategoryCode;
  onSelectSubCategory: (sub: SubCategoryCode) => void;
}

export const CodeSubChips: React.FC<CodeSubChipsProps> = ({
  selectedCategory,
  selectedSubCategory,
  onSelectSubCategory,
}) => {
  const isVisible = selectedCategory === 'codes';

  return (
    <div
      id="subchips"
      className={`subchips-container ${isVisible ? 'show' : ''}`}
      style={{
        display: isVisible ? 'flex' : 'none',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '10px 12px',
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '8px',
        margin: '8px 10px',
        border: '1px solid var(--border-contrast, #334155)',
      }}
    >
      {CODE_SUBS.map((sub) => {
        const isActive = selectedSubCategory === sub;
        return (
          <button
            key={sub}
            data-sub={sub}
            onClick={() => onSelectSubCategory(sub)}
            className={`subchip-btn ${isActive ? 'active' : ''}`}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: isActive ? '1px solid #7048e8' : '1px solid var(--border-contrast, #334155)',
              background: isActive ? '#7048e8' : 'var(--container-charcoal, #1e293b)',
              color: isActive ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.75rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {sub}
          </button>
        );
      })}
    </div>
  );
};

