import React from 'react';
import { CODE_SUBS } from '../data/qcData.ts';
import type { CategoryKey, SubCategoryCode } from '../types/qc.ts';

interface CodeSubChipsProps {
  selectedCategory: CategoryKey;
  selectedSubCategory: SubCategoryCode;
  onSelectSubCategory: (sub: SubCategoryCode) => void;
}

export const CodeSubChips: React.FC<CodeSubChipsProps> = React.memo(({
  selectedCategory,
  selectedSubCategory,
  onSelectSubCategory,
}) => {
  const isVisible = selectedCategory === 'codes';

  return (
    <div
      id="subchips"
      className={`subchips-container ${isVisible ? 'flex' : 'hidden'} flex-wrap gap-1.5 p-2.5 bg-stone-900/80 border border-stone-800 rounded-lg mx-2.5 my-2`}
    >
      {CODE_SUBS.map((sub) => {
        const isActive = selectedSubCategory === sub;
        return (
          <button
            key={sub}
            data-sub={sub}
            onClick={() => onSelectSubCategory(sub)}
            className={`subchip-btn ${
              isActive
                ? 'active bg-stone-700 text-stone-100 border-stone-600 font-semibold shadow-xs'
                : 'bg-stone-800/80 text-stone-400 border-stone-700/80 hover:bg-stone-700/80 hover:text-stone-200 font-medium'
            } px-2.5 py-1 rounded-md border text-xs cursor-pointer whitespace-nowrap transition-all duration-150`}
          >
            {sub}
          </button>
        );
      })}
    </div>
  );
});
