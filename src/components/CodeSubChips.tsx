import React from 'react';
import { CODE_SUBS } from '../data/qcData.ts';
import type { CategoryInfo, CategoryKey, SubCategoryCode } from '../types/qc.ts';

interface CodeSubChipsProps {
  selectedCategory: CategoryKey;
  selectedSubCategory: SubCategoryCode;
  onSelectSubCategory: (sub: SubCategoryCode) => void;
  categories?: CategoryInfo[];
}

export const CodeSubChips: React.FC<CodeSubChipsProps> = React.memo(({
  selectedCategory,
  selectedSubCategory,
  onSelectSubCategory,
  categories = [],
}) => {
  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const subCodes =
    activeCategoryObj?.subCodes && activeCategoryObj.subCodes.length > 0
      ? activeCategoryObj.subCodes
      : selectedCategory === 'codes'
      ? CODE_SUBS
      : [];

  const isVisible = subCodes.length > 0;

  return (
    <div
      id="subchips"
      data-testid="code-sub-chips"
      className={`subchips-container ${
        isVisible ? 'flex' : 'hidden'
      } flex-wrap gap-2 p-2.5 bg-stone-900/80 border border-stone-800 rounded-lg mx-2.5 my-2 shadow-xs select-none overflow-x-auto touch-manipulation`}
    >
      {subCodes.map((sub) => {
        const isActive = selectedSubCategory === sub;
        return (
          <button
            key={sub}
            data-sub={sub}
            data-testid={`sub-chip-${sub}`}
            onClick={() => onSelectSubCategory(sub)}
            className={`subchip-btn min-h-[40px] ${
              isActive
                ? 'active bg-stone-700 text-stone-100 border-stone-600 font-bold shadow-xs'
                : 'bg-stone-800/80 text-stone-400 border-stone-700/80 hover:bg-stone-700/80 hover:text-stone-200 font-medium'
            } px-3.5 py-2 rounded-lg border text-xs cursor-pointer whitespace-nowrap font-mono transition-all duration-150 active:scale-95`}
          >
            {sub}
          </button>
        );
      })}
    </div>
  );
});
