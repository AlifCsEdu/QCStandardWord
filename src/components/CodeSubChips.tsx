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
      className={`subchips-container ${isVisible ? 'show flex' : 'hidden'} flex-wrap gap-1.5 p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg mx-2.5 my-2`}
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      {CODE_SUBS.map((sub) => {
        const isActive = selectedSubCategory === sub;
        return (
          <button
            key={sub}
            data-sub={sub}
            onClick={() => onSelectSubCategory(sub)}
            className={`subchip-btn ${isActive ? 'active bg-cyan-600 text-white border-cyan-400 font-semibold shadow-xs' : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/80 hover:bg-zinc-700/80 hover:text-zinc-200 font-medium'} px-2.5 py-1 rounded-md border text-xs cursor-pointer whitespace-nowrap transition-all duration-150`}
          >
            {sub}
          </button>
        );
      })}
    </div>
  );
};
