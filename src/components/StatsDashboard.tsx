import React from 'react';
import { Badge, Group, Paper, Text } from '@mantine/core';
import { IconDashboard, IconFilter, IconBookmark, IconCopy } from '@tabler/icons-react';
import type { CategoryKey, SubCategoryCode } from '../types/qc.ts';

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

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  selectedCategory,
  selectedSubCategory,
  searchQuery,
  totalFilteredCount,
  batchCount,
  pinnedCount,
}) => {
  return (
    <Paper
      id="statsDashboard"
      data-testid="stats-dashboard"
      p="sm"
      m="md"
      radius="md"
      withBorder
      style={{
        background: 'var(--container-charcoal, #1e293b)',
        borderColor: 'var(--border-contrast, #334155)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Group gap="xs">
          <IconDashboard size={18} color="var(--accent-cyan, #06b6d4)" />
          <Text fw={700} size="sm" c="var(--text-primary, #f8fafc)">
            Inspection Dashboard
          </Text>
          <Badge color="cyan" variant="light" size="sm">
            {totalFilteredCount} matching
          </Badge>
        </Group>

        {/* Active Filter & Status Summary */}
        <Group gap="xs" wrap="wrap">
          <Group gap="xs">
            <IconFilter size={14} color="var(--text-secondary, #94a3b8)" />
            <Text size="xs" c="var(--text-secondary, #94a3b8)" fw={500}>
              Active Filter:
            </Text>
            <Badge size="xs" color="cyan" variant="dot">
              Cat: {CATEGORY_NAMES[selectedCategory] || selectedCategory}
            </Badge>
            {selectedCategory === 'codes' && selectedSubCategory !== 'ALL' && (
              <Badge size="xs" color="indigo" variant="dot">
                Sub: {selectedSubCategory}
              </Badge>
            )}
            {searchQuery.trim() && (
              <Badge size="xs" color="orange" variant="dot">
                Query: "{searchQuery.trim()}"
              </Badge>
            )}
          </Group>

          <Group gap="xs" ml="xs">
            <Badge size="xs" color="yellow" variant="outline" leftSection={<IconBookmark size={10} />}>
              Pinned: {pinnedCount}
            </Badge>
            <Badge size="xs" color="cyan" variant="outline" leftSection={<IconCopy size={10} />}>
              Batch: {batchCount}
            </Badge>
          </Group>
        </Group>
      </Group>
    </Paper>
  );
};

