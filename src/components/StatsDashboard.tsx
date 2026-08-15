import React from 'react';
import {
  LayoutDashboard as IconDashboard,
  Filter as IconFilter,
  Bookmark as IconBookmark,
  Copy as IconCopy,
} from 'lucide-react';
import type { CategoryKey, SubCategoryCode } from '../types/qc.ts';
import { Card, CardContent } from './ui/card.tsx';
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
  pinned: 'Pinned / Favorites',
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
  return (
    <Card
      id="statsDashboard"
      data-testid="stats-dashboard"
      className="m-4 border-stone-800 bg-stone-900 text-stone-100 shadow-xs"
    >
      <CardContent className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IconDashboard className="size-4.5 text-stone-300" />
          <span className="font-semibold text-sm text-stone-100">
            Inspection Dashboard
          </span>
          <Badge variant="default" className="bg-stone-800/80 border-stone-700 text-stone-200">
            {totalFilteredCount} matching
          </Badge>
        </div>

        {/* Active Filter & Status Summary */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <IconFilter className="size-3.5 text-stone-400" />
            <span className="text-xs text-stone-400 font-medium">
              Active Filter:
            </span>
            <Badge variant="outline" className="bg-stone-800/60 border-stone-700 text-stone-300">
              Cat: {CATEGORY_NAMES[selectedCategory] || selectedCategory}
            </Badge>
            {selectedCategory === 'codes' && selectedSubCategory !== 'ALL' && (
              <Badge variant="outline" className="bg-stone-800/60 border-stone-700 text-stone-300">
                Sub: {selectedSubCategory}
              </Badge>
            )}
            {searchQuery.trim() && (
              <Badge variant="outline" className="bg-orange-950/40 border-orange-500/30 text-orange-400">
                Query: "{searchQuery.trim()}"
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-400 gap-1 bg-amber-950/20">
              <IconBookmark className="size-3" />
              Pinned: {pinnedCount}
            </Badge>
            <Badge variant="outline" className="border-stone-700 text-stone-300 gap-1 bg-stone-800/60">
              <IconCopy className="size-3" />
              Batch: {batchCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

