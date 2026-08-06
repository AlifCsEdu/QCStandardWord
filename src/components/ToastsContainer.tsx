import React from 'react';
import type { ToastNotice } from '../types/qc.ts';

interface ToastsContainerProps {
  toasts: ToastNotice[];
  onRemoveToast: (id: string) => void;
}

export const ToastsContainer: React.FC<ToastsContainerProps> = ({
  toasts,
  onRemoveToast,
}) => {
  return (
    <div
      id="toasts"
      className="toasts-container"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.warn ? 'warn' : ''}`}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '6px',
            background: toast.warn ? '#fff5f5' : '#1098ad',
            color: toast.warn ? '#c92a2a' : '#ffffff',
            border: toast.warn ? '1px solid #ffc9c9' : '1px solid #0c8599',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '0.875rem',
            fontWeight: 500,
            maxWidth: '360px',
          }}
        >
          <span>{toast.msg}</span>

          {toast.action && (
            <button
              className="tact"
              onClick={() => {
                toast.action?.fn();
                onRemoveToast(toast.id);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: toast.warn ? '1px solid #e03131' : '1px solid #ffffff',
                background: toast.warn ? '#e03131' : '#ffffff',
                color: toast.warn ? '#ffffff' : '#0c8599',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
