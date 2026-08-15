import React from 'react';
import {
  LayoutDashboard as IconDashboard,
  Filter as IconFilter,
  Bookmark as IconBookmark,
  Layers as IconLayers,
  Sparkles,
} from 'lucide-react';
import type { CategoryKey, SubCategoryCode } from '../types/qc.ts';
import { Badge } from './ui/badge.tsx';

interface StatsDashboardProps {
  categoryCounts?: Record<string, number>;
  selectedCategory: CategoryKey;
  selectedSubCategory: SubCategoryCode;
  searchQuery: string;
  totalFilteredCount: number;
  batchCount: number;
  pinnedCount: number;
  onOpenSpotlight?: () => void;
  onSelectCategory?: (cat: CategoryKey) => void;
}

const CATEGORY_NAMES: Record<CategoryKey, string> = {
  all: 'All Categories',
  codes: 'Panel Codes',
  screen: 'Screen & Display',
  camera: 'Camera Systems',
  buttons: 'Physical Buttons',
  battery: 'Battery & Power',
  backcover: 'Back Cover & Frame',
  locks: 'Security & Locks',
  pen: 'Stylus & Pen',
  water: 'Water Damage',
  audio: 'Audio & Speakers',
  body: 'Body & Housing',
  system: 'System & OS',
  pinned: 'Starred Defects',
  recent: 'Recent History',
};

export const StatsDashboard: React.FC<StatsDashboardProps> = React.memo(({
  selectedCategory,
  selectedSubCategory,
  searchQuery,
  totalFilteredCount,
  batchCount,
  pinnedCount,
}) => {
  const hasActiveFilter =
    selectedCategory !== 'all' ||
    (selectedCategory === 'codes' && selectedSubCategory !== 'ALL') ||
    Boolean(searchQuery.trim());

  return (
    <div
      id="statsDashboard"
      data-testid="stats-dashboard"
      className="stats-dashboard w-full px-4 sm:px-6 py-2.5 bg-stone-900/50 border-b border-stone-800/80 text-stone-300 flex flex-wrap items-center justify-between gap-3 text-xs select-none"
    >
      {/* Left: Metric Summary Strip */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
        <div className="flex items-center gap-1.5 text-stone-100 font-medium">
          <IconDashboard className="size-3.5 text-stone-400 shrink-0" />
          <span className="font-semibold text-stone-100">
            {totalFilteredCount} {totalFilteredCount === 1 ? 'Defect' : 'Defects'}
          </span>
        </div>

        <span className="text-stone-600 font-mono text-[10px] select-none">•</span>

        <span className="text-stone-300 hidden sm:inline">
          {selectedCategory === 'all'
            ? '12 Categories'
            : CATEGORY_NAMES[selectedCategory] || selectedCategory}
        </span>

        <span className="text-stone-600 font-mono text-[10px] hidden sm:inline select-none">•</span>

        <div className="flex items-center gap-1 text-amber-400 font-medium">
          <IconBookmark className="size-3 text-amber-400/90 shrink-0" />
          <span>{pinnedCount} Starred</span>
        </div>

        {batchCount > 0 && (
          <>
            <span className="text-stone-600 font-mono text-[10px] select-none">•</span>
            <div className="flex items-center gap-1 text-stone-200 font-medium bg-stone-800/60 px-2 py-0.5 rounded-full border border-stone-700/60">
              <IconLayers className="size-3 text-stone-400 shrink-0" />
              <span>{batchCount} in Batch</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Active Filter Indicators */}
      <div className="flex items-center gap-2 flex-wrap">
        {hasActiveFilter ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <IconFilter className="size-3 text-stone-500 shrink-0" />
            <span className="text-[11px] text-stone-500 font-medium hidden md:inline">
              Filter:
            </span>
            {selectedCategory !== 'all' && (
              <Badge
                variant="outline"
                className="bg-stone-800/80 border-stone-700/80 text-stone-200 text-[11px] px-2 py-0 h-5 font-normal"
              >
                Cat: {CATEGORY_NAMES[selectedCategory] || selectedCategory}
              </Badge>
            )}
            {selectedCategory === 'codes' && selectedSubCategory !== 'ALL' && (
              <Badge
                variant="outline"
                className="bg-stone-800/80 border-stone-700/80 text-stone-200 text-[11px] px-2 py-0 h-5 font-normal"
              >
                Sub: {selectedSubCategory}
              </Badge>
            )}
            {searchQuery.trim() && (
              <Badge
                variant="outline"
                className="bg-stone-800/80 border-stone-600 text-stone-100 text-[11px] px-2 py-0 h-5 font-normal"
              >
                Query: "{searchQuery.trim()}"
              </Badge>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
            <Sparkles className="size-3 text-stone-400" />
            <span>Ready for QC Inspection</span>
          </div>
        )}
      </div>
    </div>
  );
});


