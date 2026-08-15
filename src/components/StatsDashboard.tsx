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

const CATEGORY_NAMES: Record<string, string> = {
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
      className="stats-dashboard w-full px-4 sm:px-6 py-2.5 min-h-[48px] bg-muted/40 border-b border-border text-foreground flex flex-wrap items-center justify-between gap-3 text-xs select-none"
    >
      {/* Left: Metric Summary Strip */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
        <div className="flex items-center gap-1.5 text-foreground font-medium">
          <IconDashboard className="size-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground">
            {totalFilteredCount} {totalFilteredCount === 1 ? 'Defect' : 'Defects'}
          </span>
        </div>

        <span className="text-muted-foreground font-mono text-[10px] select-none">•</span>

        <span className="text-muted-foreground hidden sm:inline">
          {selectedCategory === 'all'
            ? '12 Categories'
            : CATEGORY_NAMES[selectedCategory] || selectedCategory}
        </span>

        <span className="text-muted-foreground font-mono text-[10px] hidden sm:inline select-none">•</span>

        <div className="flex items-center gap-1 text-amber-400 font-medium">
          <IconBookmark className="size-3.5 text-amber-400/90 shrink-0" />
          <span>{pinnedCount} Starred</span>
        </div>

        {batchCount > 0 && (
          <>
            <span className="text-muted-foreground font-mono text-[10px] select-none">•</span>
            <div className="flex items-center gap-1 text-foreground font-medium bg-muted px-2.5 py-1 rounded-full border border-border">
              <IconLayers className="size-3.5 text-muted-foreground shrink-0" />
              <span>{batchCount} in Batch</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Active Filter Indicators */}
      <div className="flex items-center gap-2 flex-wrap">
        {hasActiveFilter ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <IconFilter className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground font-medium hidden md:inline">
              Filter:
            </span>
            {selectedCategory !== 'all' && (
              <Badge
                variant="outline"
                className="bg-muted border-border text-foreground text-[11px] px-2.5 py-0.5 min-h-[24px] font-normal"
              >
                Cat: {CATEGORY_NAMES[selectedCategory] || selectedCategory}
              </Badge>
            )}
            {selectedCategory === 'codes' && selectedSubCategory !== 'ALL' && (
              <Badge
                variant="outline"
                className="bg-muted border-border text-foreground text-[11px] px-2.5 py-0.5 min-h-[24px] font-normal"
              >
                Sub: {selectedSubCategory}
              </Badge>
            )}
            {searchQuery.trim() && (
              <Badge
                variant="outline"
                className="bg-muted border-border text-foreground text-[11px] px-2.5 py-0.5 min-h-[24px] font-normal"
              >
                Query: "{searchQuery.trim()}"
              </Badge>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <Sparkles className="size-3.5 text-muted-foreground" />
            <span>Ready for QC Inspection</span>
          </div>
        )}
      </div>
    </div>
  );
});
