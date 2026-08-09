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
  | 'recent';

export type SubCategoryCode =
  | 'ALL'
  | 'FCPB'
  | 'FCPW'
  | 'FCPC'
  | 'RCPB'
  | 'RCPW'
  | 'RCPC'
  | 'FCDS'
  | 'RCDS'
  | 'PC';

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
  id: CategoryKey;
  name: string;
  color: string;
  desc: string;
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
export type RadiusOption = 'sharp' | 'soft' | 'round';
export type TextSizeOption = 's' | 'm' | 'l';
export type DensityMode = 'cozy' | 'compact';
export type MotionMode = 'full' | 'reduced';
export type DelimiterKey = 'nl' | 'comma' | 'semi' | 'space' | 'pipe' | 'bullet';
export type SortOption = 'default' | 'alpha' | 'num';

export interface AppearanceSettings {
  layout: LayoutMode;
  radius: RadiusOption;
  textsize: TextSizeOption;
  accent: string;
  density: DensityMode;
  motion: MotionMode;
  theme: 'light' | 'dark' | 'auto';
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
