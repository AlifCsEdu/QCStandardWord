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
  type LucideIcon,
} from 'lucide-react';
import { CATEGORIES } from '../data/qcData.ts';

const CATEGORY_COLOR_MAP: Record<string, string> = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id.trim().toLowerCase()] = cat.color;
  return acc;
}, {} as Record<string, string>);

// Map all 15 category keys / aliases to dedicated Lucide Icons
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
};

/**
 * Returns category hex color. Fallbacks to slate #64748b if unknown.
 */
export function getCategoryColor(categoryKey: string): string {
  const key = (categoryKey || '').trim().toLowerCase();
  return CATEGORY_COLOR_MAP[key] || '#64748b';
}

function hexToRgb(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '100, 116, 139';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

const BADGE_STYLE_CACHE: Record<string, React.CSSProperties> = {};
const BORDER_STYLE_CACHE: Record<string, React.CSSProperties> = {};

/**
 * Returns inline styling for category badges.
 */
export function getCategoryBadgeStyle(categoryKey: string): React.CSSProperties {
  const key = (categoryKey || '').trim().toLowerCase();
  if (BADGE_STYLE_CACHE[key]) return BADGE_STYLE_CACHE[key];
  const color = getCategoryColor(key);
  const rgb = hexToRgb(color);
  const style = {
    backgroundColor: `rgba(${rgb}, 0.18)`,
    borderColor: `rgba(${rgb}, 0.45)`,
    color: color,
  };
  BADGE_STYLE_CACHE[key] = style;
  return style;
}

/**
 * Returns category left border accent styling (`border-l-4`) with inline color or Tailwind class.
 */
export function getCategoryLeftBorderStyle(categoryKey: string): React.CSSProperties {
  const key = (categoryKey || '').trim().toLowerCase();
  if (BORDER_STYLE_CACHE[key]) return BORDER_STYLE_CACHE[key];
  const color = getCategoryColor(key);
  const style = {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: color,
  };
  BORDER_STYLE_CACHE[key] = style;
  return style;
}

/**
 * Returns Tailwind class string for category left border accent.
 */
export function getCategoryIconComponent(categoryKey: string): LucideIcon {
  const key = (categoryKey || '').trim().toLowerCase();
  return CATEGORY_ICON_MAP[key] || Folder;
}

export function getCategoryIcon(categoryKey: string, props?: any): React.ReactNode {
  const IconComponent = getCategoryIconComponent(categoryKey);
  return React.createElement(IconComponent, props || {});
}

const categoryBadgeCache = new Map<string, React.ReactNode>();

/**
 * Returns a static cached category badge element to avoid re-instantiating Lucide icons per card.
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
