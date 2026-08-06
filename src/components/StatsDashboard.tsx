import React from 'react';
import { Badge, Group, Paper, Text, Card, SimpleGrid, Button } from '@mantine/core';
import { IconDashboard, IconFilter, IconSearch, IconBookmark, IconCopy } from '@tabler/icons-react';
import type { CategoryKey, SubCategoryCode } from '../types/qc.ts';

interface StatsDashboardProps {
  categoryCounts: Record<string, number>;
  selectedCategory: CategoryKey;
  selectedSubCategory: SubCategoryCode;
  searchQuery: string;
  totalFilteredCount: number;
  batchCount: number;
  pinnedCount: number;
  onOpenSpotlight: () => void;
  onSelectCategory: (cat: CategoryKey) => void;
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
  categoryCounts,
  selectedCategory,
  selectedSubCategory,
  searchQuery,
  totalFilteredCount,
  batchCount,
  pinnedCount,
  onOpenSpotlight,
  onSelectCategory,
}) => {
  const categoriesToShow: CategoryKey[] = [
    'codes',
    'screen',
    'camera',
    'buttons',
    'battery',
    'locks',
    'audio',
    'body',
  ];

  return (
    <Paper
      id="statsDashboard"
      p="md"
      m="md"
      radius="md"
      withBorder
      style={{
        background: 'var(--mantine-color-body, #ffffff)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <IconDashboard size={20} color="var(--mantine-color-blue-6)" />
          <Text fw={700} size="sm">
            Inspection Stats Dashboard
          </Text>
          <Badge color="blue" variant="light" size="sm">
            {totalFilteredCount} matching
          </Badge>
        </Group>

        <Group gap="xs">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconSearch size={14} />}
            onClick={onOpenSpotlight}
            rightSection={
              <Badge size="xs" variant="outline" color="gray">
                ⌘K / Ctrl+K
              </Badge>
            }
          >
            Quick Search
          </Button>
        </Group>
      </Group>

      {/* Category Breakdown Badges */}
      <Group gap="xs" mb="sm" wrap="wrap">
        {categoriesToShow.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isActive = selectedCategory === cat;
          return (
            <Badge
              key={cat}
              variant={isActive ? 'filled' : 'outline'}
              color={isActive ? 'blue' : 'gray'}
              style={{ cursor: 'pointer', textTransform: 'capitalize' }}
              onClick={() => onSelectCategory(cat)}
            >
              {CATEGORY_NAMES[cat] || cat}: {count}
            </Badge>
          );
        })}
      </Group>

      {/* Active Filter Summary Banner */}
      <Group gap="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)', paddingTop: '8px' }}>
        <Group gap="xs">
          <IconFilter size={14} color="var(--mantine-color-dimmed)" />
          <Text size="xs" c="dimmed" fw={500}>
            Active Filter:
          </Text>
          <Badge size="xs" color="indigo" variant="dot">
            Cat: {CATEGORY_NAMES[selectedCategory] || selectedCategory}
          </Badge>
          {selectedCategory === 'codes' && selectedSubCategory !== 'ALL' && (
            <Badge size="xs" color="teal" variant="dot">
              Sub: {selectedSubCategory}
            </Badge>
          )}
          {searchQuery.trim() && (
            <Badge size="xs" color="orange" variant="dot">
              Query: "{searchQuery.trim()}"
            </Badge>
          )}
        </Group>

        <Group gap="xs" ml="auto">
          <Badge size="xs" color="yellow" variant="outline" leftSection={<IconBookmark size={10} />}>
            Pinned: {pinnedCount}
          </Badge>
          <Badge size="xs" color="cyan" variant="outline" leftSection={<IconCopy size={10} />}>
            Batch: {batchCount}
          </Badge>
        </Group>
      </Group>
    </Paper>
  );
};
