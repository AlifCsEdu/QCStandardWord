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
  acc[cat.id.toLowerCase()] = cat.color;
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
  return CATEGORY_COLOR_MAP[categoryKey.toLowerCase()] || '#64748b';
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

/**
 * Returns inline styling for category badges.
 */
export function getCategoryBadgeStyle(categoryKey: string): React.CSSProperties {
  const color = getCategoryColor(categoryKey);
  const rgb = hexToRgb(color);
  return {
    backgroundColor: `rgba(${rgb}, 0.18)`,
    borderColor: `rgba(${rgb}, 0.45)`,
    color: color,
  };
}

/**
 * Returns category left border accent styling (`border-l-4`) with inline color or Tailwind class.
 */
export function getCategoryLeftBorderStyle(categoryKey: string): React.CSSProperties {
  const color = getCategoryColor(categoryKey);
  return {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: color,
  };
}

/**
 * Returns Tailwind class string for category left border accent.
 */
export const CATEGORY_LEFT_BORDER_CLASS = 'border-l-4';

/**
 * Returns the Lucide icon component for a category key.
 */
export function getCategoryIconComponent(categoryKey: string): LucideIcon {
  const key = categoryKey.toLowerCase();
  return CATEGORY_ICON_MAP[key] || Folder;
}

/**
 * Renders the Lucide icon React element for a given category.
 */
export function getCategoryIcon(
  categoryKey: string,
  props?: React.ComponentProps<LucideIcon>
): React.ReactElement {
  const IconComp = getCategoryIconComponent(categoryKey);
  return React.createElement(IconComp, { size: 16, ...props });
}
