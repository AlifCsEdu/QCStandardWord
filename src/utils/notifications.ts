import React from 'react';
import {
  IconCopy,
  IconPlus,
  IconTrash,
  IconArrowBackUp,
  IconAlertTriangle,
  IconCheck,
  IconPencil,
  IconDownload,
  IconUpload,
  IconRefresh,
  IconBell,
} from '@tabler/icons-react';
import type { ToastNotice } from '../types/qc.ts';

function createNamedIcon(TablerComponent: React.ComponentType<any>, name: string) {
  const IconComponent: React.FC<any> = (props) => React.createElement(TablerComponent, props);
  Object.defineProperty(IconComponent, 'name', { value: name, configurable: true });
  IconComponent.displayName = name;
  return IconComponent;
}

const AlertTriangle = createNamedIcon(IconAlertTriangle, 'AlertTriangle');
const Copy = createNamedIcon(IconCopy, 'Copy');
const Plus = createNamedIcon(IconPlus, 'Plus');
const Trash = createNamedIcon(IconTrash, 'Trash');
const ArrowBackUp = createNamedIcon(IconArrowBackUp, 'ArrowBackUp');
const Pencil = createNamedIcon(IconPencil, 'Pencil');
const Download = createNamedIcon(IconDownload, 'Download');
const Upload = createNamedIcon(IconUpload, 'Upload');
const Refresh = createNamedIcon(IconRefresh, 'Refresh');
const Check = createNamedIcon(IconCheck, 'Check');

/**
 * Returns an appropriate Tabler Icon React element based on message content and warning state.
 */
export function getToastIcon(msg: string, warn?: boolean): React.ReactElement {
  if (warn) {
    return React.createElement(AlertTriangle, { size: 18, className: 'toast-icon-svg' });
  }

  const lower = msg.toLowerCase();

  if (lower.includes('copied') || lower.includes('copy')) {
    return React.createElement(Copy, { size: 18, className: 'toast-icon-svg' });
  }
  if (lower.includes('added') || lower.includes('batch')) {
    return React.createElement(Plus, { size: 18, className: 'toast-icon-svg' });
  }
  if (lower.includes('deleted') || lower.includes('remove') || lower.includes('cleared')) {
    return React.createElement(Trash, { size: 18, className: 'toast-icon-svg' });
  }
  if (lower.includes('restored') || lower.includes('undo')) {
    return React.createElement(ArrowBackUp, { size: 18, className: 'toast-icon-svg' });
  }
  if (lower.includes('saved') || lower.includes('updated') || lower.includes('edit')) {
    return React.createElement(Pencil, { size: 18, className: 'toast-icon-svg' });
  }
  if (lower.includes('export') || lower.includes('download')) {
    return React.createElement(Download, { size: 18, className: 'toast-icon-svg' });
  }
  if (lower.includes('import') || lower.includes('upload')) {
    return React.createElement(Upload, { size: 18, className: 'toast-icon-svg' });
  }
  if (lower.includes('reset')) {
    return React.createElement(Refresh, { size: 18, className: 'toast-icon-svg' });
  }

  return React.createElement(Check, { size: 18, className: 'toast-icon-svg' });
}

/**
 * Creates a ToastNotice object with generated unique ID.
 */
export function createToastNotice(
  msg: string,
  warn: boolean = false,
  action?: { label: string; fn: () => void }
): ToastNotice {
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
  return createToastNotice(msg, isWarn, action);
}
