import { CATEGORIES } from '../data/qcData.ts';

const CATEGORY_COLOR_MAP: Record<string, string> = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id.toLowerCase()] = cat.color;
  return acc;
}, {} as Record<string, string>);

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

export function getCategoryBadgeStyle(categoryKey: string): React.CSSProperties {
  const color = getCategoryColor(categoryKey);
  const rgb = hexToRgb(color);
  return {
    backgroundColor: `rgba(${rgb}, 0.18)`,
    borderColor: `rgba(${rgb}, 0.45)`,
    color: color,
  };
}
