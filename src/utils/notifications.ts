import React from 'react';
import { toast } from 'sonner';
import {
  Copy as IconCopy,
  Pin as IconPin,
  Plus as IconPlus,
  Trash2 as IconTrash2,
  Undo2 as IconArrowBackUp,
  AlertTriangle as IconAlertTriangle,
  Check as IconCheck,
  Pencil as IconPencil,
  Download as IconDownload,
  Upload as IconUpload,
  RotateCcw as IconRefresh,
} from 'lucide-react';
import type { ToastNotice } from '../types/qc.ts';

function createNamedIcon(Component: React.ComponentType<any>, name: string) {
  const IconComponent: React.FC<any> = (props) => React.createElement(Component, props);
  Object.defineProperty(IconComponent, 'name', { value: name, configurable: true });
  IconComponent.displayName = name;
  return IconComponent;
}

export const AlertTriangle = createNamedIcon(IconAlertTriangle, 'AlertTriangle');
export const Copy = createNamedIcon(IconCopy, 'Copy');
export const Pin = createNamedIcon(IconPin, 'Pin');
export const Plus = createNamedIcon(IconPlus, 'Plus');
export const Trash2 = createNamedIcon(IconTrash2, 'Trash2');
export const Trash = createNamedIcon(IconTrash2, 'Trash');
export const ArrowBackUp = createNamedIcon(IconArrowBackUp, 'ArrowBackUp');
export const Pencil = createNamedIcon(IconPencil, 'Pencil');
export const Download = createNamedIcon(IconDownload, 'Download');
export const Upload = createNamedIcon(IconUpload, 'Upload');
export const Refresh = createNamedIcon(IconRefresh, 'Refresh');
export const Check = createNamedIcon(IconCheck, 'Check');

/**
 * Returns an appropriate Lucide Icon React element based on message content and warning state.
 */
export function getToastIcon(msg: string, warn?: boolean): React.ReactElement {
  if (warn) {
    return React.createElement(AlertTriangle, { size: 18, className: 'toast-icon-svg text-amber-500' });
  }

  const lower = msg.toLowerCase();

  if (lower.includes('copied') || lower.includes('copy')) {
    return React.createElement(Copy, { size: 18, className: 'toast-icon-svg text-stone-200' });
  }
  if (lower.includes('pinned') || lower.includes('pin') || lower.includes('starred')) {
    return React.createElement(Pin, { size: 18, className: 'toast-icon-svg text-amber-400' });
  }
  if (lower.includes('added') || lower.includes('batch')) {
    return React.createElement(Plus, { size: 18, className: 'toast-icon-svg text-emerald-400' });
  }
  if (lower.includes('deleted') || lower.includes('remove') || lower.includes('cleared')) {
    return React.createElement(Trash2, { size: 18, className: 'toast-icon-svg text-red-400' });
  }
  if (lower.includes('restored') || lower.includes('undo')) {
    return React.createElement(ArrowBackUp, { size: 18, className: 'toast-icon-svg text-blue-400' });
  }
  if (lower.includes('saved') || lower.includes('updated') || lower.includes('edit')) {
    return React.createElement(Pencil, { size: 18, className: 'toast-icon-svg text-stone-300' });
  }
  if (lower.includes('export') || lower.includes('download')) {
    return React.createElement(Download, { size: 18, className: 'toast-icon-svg text-stone-300' });
  }
  if (lower.includes('import') || lower.includes('upload')) {
    return React.createElement(Upload, { size: 18, className: 'toast-icon-svg text-stone-300' });
  }
  if (lower.includes('reset')) {
    return React.createElement(Refresh, { size: 18, className: 'toast-icon-svg text-zinc-400' });
  }

  return React.createElement(Check, { size: 18, className: 'toast-icon-svg text-stone-200' });
}

export interface NoticeOptions {
  type: 'copy' | 'pin' | 'batch' | 'edit' | 'custom' | 'info' | 'warning' | 'delete' | string;
  text: string;
  action?: {
    label: string;
    fn: () => void;
  };
}

/**
 * Triggers a sonner toast notification with appropriate Lucide icon.
 */
export function showNotice(notice: NoticeOptions): ToastNotice {
  const isWarn = notice.type === 'warning';
  const icon = getToastIcon(notice.text, isWarn);

  try {
    toast(notice.text, {
      icon: icon,
      action: notice.action
        ? {
            label: notice.action.label,
            onClick: notice.action.fn,
          }
        : undefined,
    });
  } catch {
    // Graceful fallback if Toast provider is not mounted
  }

  return createToastNotice(notice.text, isWarn, notice.action);
}

/**
 * Creates a ToastNotice object with generated unique ID.
 */
export function createToastNotice(
  msg: string,
  warn: boolean = false,
  action?: { label: string; fn: () => void }
): ToastNotice {
  const icon = getToastIcon(msg, warn);
  try {
    toast(msg, {
      icon,
      action: action
        ? {
            label: action.label,
            onClick: action.fn,
          }
        : undefined,
    });
  } catch {
    // Graceful fallback
  }

  return {
    id: 't_' + Math.random().toString(36).substring(2, 9),
    msg,
    warn,
    action,
  };
}

/**
 * Floating toast dispatcher / factory helper.
 */
export function showFloatingToast(
  msg: string,
  type: 'info' | 'warn' | 'success' | 'error' = 'info',
  action?: { label: string; fn: () => void }
): ToastNotice {
  const isWarn = type === 'warn' || type === 'error';
  return showNotice({
    type: isWarn ? 'warning' : 'info',
    text: msg,
    action,
  });
}
