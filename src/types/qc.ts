export type CategoryKey =
  | 'all'
  | 'codes'
  | 'screen'
  | 'camera'
  | 'buttons'
  | 'battery'
  | 'backcover'
  | 'locks'
  | 'pen'
  | 'water'
  | 'audio'
  | 'body'
  | 'system'
  | 'pinned'
  | 'recent'
  | (string & {});

export type SubCategoryCode = string;

export interface QCItem {
  id: string;
  n: number;
  t: string;
  c: CategoryKey;
  sub?: SubCategoryCode;
  custom?: boolean;
}

export interface CustomPinFolder {
  id: string;
  name: string;
  color?: string;
  itemIds: (string | number)[];
  createdAt: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  desc: string;
  iconType?: 'lucide' | 'emoji';
  iconValue?: string;
  subCodes?: string[];
  order?: number;
  isDefault?: boolean;
}

export interface CodeSubInfo {
  code: SubCategoryCode;
  label: string;
}

export interface SearchResult {
  item: QCItem;
  score: number;
  isApprox: boolean;
  highlightedText: string;
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export type LayoutMode = 'list' | 'grid' | 'table';
export type RadiusOption = '0' | '6' | '10' | '16' | 'sharp' | 'soft' | 'round';
export type TextSizeOption = '13' | '14' | '16' | 's' | 'm' | 'l';
export type DensityMode = 'compact' | 'cozy' | 'tablet';
export type MotionMode = 'full' | 'reduced';
export type AccentOption = 'amber' | 'emerald' | 'stone' | 'rose' | 'blue' | string;
export type ThemeMode = 'dark' | 'light' | 'auto';
export type DelimiterKey = 'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet';
export type SortOption = 'default' | 'alpha' | 'num';

export interface AppearanceSettings {
  layout: LayoutMode;
  radius: RadiusOption;
  textsize: TextSizeOption;
  accent: AccentOption | string;
  density: DensityMode;
  motion: MotionMode;
  theme: ThemeMode;
}

export interface HistoryEntry {
  id: string;
  text: string;
  itemNumber?: number;
  category?: string;
  timestamp: number;
  source?: 'single' | 'batch';
}

export interface ToastNotice {
  id: string;
  msg: string;
  warn?: boolean;
  action?: {
    label: string;
    fn: () => void;
  };
}
