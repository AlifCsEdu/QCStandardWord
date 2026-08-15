import React from 'react';
import {
  Monitor,
  Camera,
  Sliders,
  Radio,
  Battery,
  Smartphone,
  Lock,
  PenTool,
  Droplets,
  Volume2,
  Cpu,
  Settings,
  Activity,
  Code,
  Folder,
  Star,
  History,
  Sparkles,
  ShieldCheck,
  Layers,
  Tag,
  Wrench,
  Flame,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES } from '../data/qcData.ts';
import type { CategoryInfo } from '../types/qc.ts';

// 24 Curated Lucide Icons for Category Picker
export const CURATED_CATEGORY_ICONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'Monitor', label: 'Screen/Monitor', icon: Monitor },
  { name: 'Camera', label: 'Camera', icon: Camera },
  { name: 'Sliders', label: 'Buttons/Controls', icon: Sliders },
  { name: 'Radio', label: 'Wireless/Radio', icon: Radio },
  { name: 'Battery', label: 'Battery', icon: Battery },
  { name: 'Smartphone', label: 'Device/Backcover', icon: Smartphone },
  { name: 'Lock', label: 'Locks/Security', icon: Lock },
  { name: 'PenTool', label: 'S-Pen/Stylus', icon: PenTool },
  { name: 'Droplets', label: 'Water/Liquid', icon: Droplets },
  { name: 'Volume2', label: 'Audio/Speaker', icon: Volume2 },
  { name: 'Cpu', label: 'Body/Mainboard', icon: Cpu },
  { name: 'Settings', label: 'System/Settings', icon: Settings },
  { name: 'Activity', label: 'Activity/Diagnostics', icon: Activity },
  { name: 'Code', label: 'Part Codes', icon: Code },
  { name: 'Folder', label: 'Folder/General', icon: Folder },
  { name: 'Star', label: 'Starred/Favorites', icon: Star },
  { name: 'History', label: 'Recent/History', icon: History },
  { name: 'Sparkles', label: 'Special/Cosmetic', icon: Sparkles },
  { name: 'ShieldCheck', label: 'Inspection/QC', icon: ShieldCheck },
  { name: 'Layers', label: 'Layers/Assembly', icon: Layers },
  { name: 'Tag', label: 'Labels/Tags', icon: Tag },
  { name: 'Wrench', label: 'Hardware/Tools', icon: Wrench },
  { name: 'Flame', label: 'Thermal/Heat', icon: Flame },
  { name: 'Zap', label: 'Power/Charging', icon: Zap },
];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  screen: Monitor,
  monitor: Monitor,
  camera: Camera,
  buttons: Sliders,
  radio: Radio,
  battery: Battery,
  backcover: Smartphone,
  locks: Lock,
  pen: PenTool,
  water: Droplets,
  audio: Volume2,
  body: Cpu,
  system: Settings,
  activity: Activity,
  codes: Code,
  folder: Folder,
  folders: Folder,
  all: Folder,
  pinned: Star,
  favorites: Star,
  recent: History,
  sparkles: Sparkles,
  shieldcheck: ShieldCheck,
  layers: Layers,
  tag: Tag,
  wrench: Wrench,
  flame: Flame,
  zap: Zap,
};

const DEFAULT_CATEGORY_COLOR_MAP: Record<string, string> = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id.trim().toLowerCase()] = cat.color;
  return acc;
}, {} as Record<string, string>);

/**
 * Returns category hex color. Fallbacks to slate #64748b if unknown.
 * Supports custom categories array and case-insensitive whitespace-trimmed lookups.
 */
export function getCategoryColor(categoryKey: string, customCategories?: CategoryInfo[]): string {
  const key = (categoryKey || '').trim().toLowerCase();
  if (customCategories && Array.isArray(customCategories)) {
    const found = customCategories.find((c) => (c.id || '').trim().toLowerCase() === key);
    if (found && found.color) return found.color;
  }
  return DEFAULT_CATEGORY_COLOR_MAP[key] || '#64748b';
}

function hexToRgb(hex: string): string {
  let c = (hex || '').replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '100, 116, 139';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

/**
 * Returns inline styling for category badges.
 */
export function getCategoryBadgeStyle(categoryKey: string, customColor?: string): React.CSSProperties {
  const key = (categoryKey || '').trim().toLowerCase();
  const color = customColor || getCategoryColor(key);
  const rgb = hexToRgb(color);
  return {
    backgroundColor: `rgba(${rgb}, 0.18)`,
    borderColor: `rgba(${rgb}, 0.45)`,
    color: color,
  };
}

/**
 * Returns category left border accent styling (`border-l-4`).
 */
export function getCategoryLeftBorderStyle(categoryKey: string, customColor?: string): React.CSSProperties {
  const key = (categoryKey || '').trim().toLowerCase();
  const color = customColor || getCategoryColor(key);
  return {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: color,
  };
}

/**
 * Returns Lucide icon component mapped to a category key.
 */
export function getCategoryIconComponent(categoryKey: string): LucideIcon {
  const key = (categoryKey || '').trim().toLowerCase();
  return CATEGORY_ICON_MAP[key] || Folder;
}

export function getCategoryIcon(categoryKey: string, props?: any): React.ReactNode {
  const IconComponent = getCategoryIconComponent(categoryKey);
  return React.createElement(IconComponent, props || {});
}

/**
 * Hybrid Icon & Emoji Renderer supporting both Lucide icons and Custom Emoji strings.
 */
export function renderCategoryIcon(
  category: { iconType?: 'lucide' | 'emoji'; iconValue?: string; id?: string } | string,
  props: { className?: string; style?: React.CSSProperties } = {}
): React.ReactNode {
  const cls = props.className || 'size-4';
  if (typeof category === 'string') {
    const IconComp = getCategoryIconComponent(category);
    return React.createElement(IconComp, { className: cls, style: props.style });
  }

  if (category?.iconType === 'emoji' && category?.iconValue) {
    return React.createElement(
      'span',
      {
        className: `inline-flex items-center justify-center text-sm leading-none shrink-0 select-none ${cls}`,
        style: props.style,
      },
      category.iconValue
    );
  }

  if (category?.iconType === 'lucide' && category?.iconValue) {
    const foundIcon = CURATED_CATEGORY_ICONS.find(
      (i) => i.name.toLowerCase() === category.iconValue?.toLowerCase()
    )?.icon;
    if (foundIcon) {
      return React.createElement(foundIcon, { className: cls, style: props.style });
    }
  }

  const IconComp = getCategoryIconComponent(category?.id || '');
  return React.createElement(IconComp, { className: cls, style: props.style });
}

const categoryBadgeCache = new Map<string, React.ReactNode>();

/**
 * Returns a static cached category badge element.
 */
export function getCategoryBadgeElement(categoryKey: string): React.ReactNode {
  const key = (categoryKey || '').trim().toLowerCase();
  let cached = categoryBadgeCache.get(key);
  if (cached) return cached;
  const CategoryIcon = getCategoryIconComponent(key);
  const badgeStyle = getCategoryBadgeStyle(key);
  cached = React.createElement(
    'span',
    {
      className:
        'rpill text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-transform hover:scale-105',
      style: badgeStyle,
    },
    React.createElement(CategoryIcon, { className: 'size-3.5' }),
    React.createElement('span', null, key)
  );
  categoryBadgeCache.set(key, cached);
  return cached;
}
