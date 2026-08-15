import React from 'react';
import type { ToastNotice } from '../types/qc.ts';
import { getToastIcon } from '../utils/notifications.ts';

interface ToastsContainerProps {
  toasts: ToastNotice[];
  onRemoveToast: (id: string) => void;
}

export const ToastsContainer: React.FC<ToastsContainerProps> = ({
  toasts,
  onRemoveToast,
}) => {
  return (
    <div id="toasts" className="toasts-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const iconElement = getToastIcon(toast.msg, toast.warn);
        return (
          <div
            key={toast.id}
            data-testid="floating-toast"
            data-toast-id={toast.id}
            className={`toast ${toast.warn ? 'warn' : ''}`}
            onClick={() => onRemoveToast(toast.id)}
            role="status"
          >
            <div className="ticon" data-testid="toast-icon">
              {iconElement}
            </div>
            <span className="toast-message" title={toast.msg}>
              {toast.msg}
            </span>
            {toast.action && (
              <button
                type="button"
                className="tact"
                data-testid="toast-action"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.action?.fn();
                  onRemoveToast(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <div className="tprogress" data-testid="toast-progress" />
          </div>
        );
      })}
    </div>
  );
};
