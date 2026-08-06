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
        gap: '6px',
        padding: '8px 20px',
        background: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        overflowX: 'auto',
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
              padding: '4px 12px',
              borderRadius: '12px',
              border: isActive ? '1px solid #7048e8' : '1px solid #dee2e6',
              background: isActive ? '#7048e8' : '#ffffff',
              color: isActive ? '#ffffff' : '#343a40',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.8rem',
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
