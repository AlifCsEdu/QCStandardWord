/**
 * Formats a millisecond timestamp into a human-friendly relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return 'Recently';
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1m ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 7200) return '1h ago';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';

  const days = Math.floor(diffSec / 86400);
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a timestamp into a full localized date-time string.
 */
export function formatFullDateTime(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return '';
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
