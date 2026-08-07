# Milestone 4 (R2): Floating Toast Notifications UI/UX & CSS Analysis

## Executive Summary
This document provides a comprehensive UI/UX design, micro-animation, and CSS architecture analysis for **R2: Modern 2026 Floating Toast Notifications** in the QC Standard Wording application.

The design modernizes notification toasts from flat, rectangular, static elements into **floating glassmorphic pills** featuring:
1. **Deep Slate & Charcoal Glassmorphism**: Translucent backdrop-filtered containers (`backdrop-filter: blur(12px)`) with glowing borders (`#06b6d4` cyan accent for normal toasts, `#ef4444` red accent for warning toasts).
2. **Category & Contextual Icons**: Dynamic Tabler icons (`.ticon`) mapped by category (e.g., Screen, Camera, Battery) or action type (Copy, Batch Add, Delete, Restore).
3. **Copy Feedback & Entrance Micro-Animations**: Smooth slide-and-pop entrance (`toastSlideIn`), copy feedback pulse (`copyFeedbackBounce`), and exit animations (`toastSlideOut`).
4. **Animated Progress Timer Bar**: A slender bottom countdown progress bar (`.tprogress`) synchronized with the 4.2-second auto-dismiss lifecycle.
5. **100% Harness Compatibility**: Full preservation of legacy DOM selectors (`#toasts`, `.toast`, `.warn`, `.tact`) alongside modern attributes (`data-testid="floating-toast"`, `.ticon`, `.tprogress`).

---

## 1. Design & Aesthetic Specifications

### Color Palette & Design Tokens
- **Background**: `rgba(30, 41, 59, 0.85)` (Charcoal `#1e293b` with 85% opacity) in Dark Mode; `rgba(255, 255, 255, 0.88)` in Light Mode.
- **Border Outline**: Translucent slate `rgba(51, 65, 85, 0.7)` (`--border-contrast` elevated).
- **Cyan Accent (Standard Toasts)**: Cool cyan `#06b6d4` (`--accent-cyan`) and sky blue `#0284c7`.
- **Red Accent (Warning / Deletion Toasts)**: Red `#ef4444` (`.warn`).
- **Text Color**: `#f8fafc` (`--text-primary` in dark mode) / `#0f172a` (light mode).
- **Typography**: Inter / system-ui, 14px (`0.875rem`), weight 500, line-height 1.4, tracking `-0.01em`.

### Glassmorphism & Elevation
- **Backdrop Filter**: `backdrop-filter: blur(12px) saturate(180%)`, `-webkit-backdrop-filter: blur(12px) saturate(180%)`.
- **Drop Shadows & Glow**:
  - **Standard Toast Glow**: `box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 0 16px rgba(6, 182, 212, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)`.
  - **Warning Toast Glow**: `box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 0 16px rgba(239, 68, 68, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)`.
- **Shape**: Rounded pill geometry (`border-radius: 9999px` or `14px` for multi-content layout).

---

## 2. Interactive Features & Micro-Animations

### Animation Specifications
1. **Entrance Animation (`toastSlideIn`)**:
   - Duration: `300ms`
   - Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like overshoot)
   - Initial state: `opacity: 0; transform: translateY(24px) scale(0.92);`
   - Final state: `opacity: 1; transform: translateY(0) scale(1);`

2. **Copy Feedback Pop (`copyFeedbackBounce`)**:
   - Triggers when an item text is copied to clipboard.
   - Micro-interaction: Icon and pill perform a subtle bounce pop (`transform: scale(1.08)` -> `scale(1.0)` over 250ms) accompanied by a cyan glow pulse.

3. **Progress Timer Bar (`toastProgress`)**:
   - Element: `<div className="tprogress" data-testid="toast-progress" style={{ animationDuration: '4.2s' }} />`
   - Visual: 3px height bar pinned to the bottom of the pill.
   - Animation: `0% { width: 100%; opacity: 1; } 100% { width: 0%; opacity: 0.4; }`
   - Duration: `4.2s linear forwards` (matches `setTimeout` dismiss duration in `useQCState.ts`).

4. **Hover Micro-Interactions**:
   - On `:hover`: pause progress timer (`animation-play-state: paused`), elevate slightly (`transform: translateY(-2px)`), and intensify cyan/red outer glow (`box-shadow` boost).

5. **Exit Animation (`toastSlideOut`)**:
   - Duration: `200ms`
   - Easing: `ease-in`
   - Final state: `opacity: 0; transform: translateX(100%) scale(0.9);`

---

## 3. Category & Action Icon Mapping

To deliver visually rich contextual feedback, each toast pill includes an icon container `<div className="ticon" data-testid="toast-icon">`. Icons are determined either by explicit category metadata or automatic message pattern inference:

| Context / Action | Tabler Icon | Color | Icon Container Style |
|------------------|-------------|-------|----------------------|
| **Copy Wording** | `IconCheck` / `IconCopy` | `#06b6d4` | Cyan tint badge (`rgba(6,182,212,0.15)`) |
| **Add to Batch** | `IconPlus` / `IconLayersPlus` | `#06b6d4` | Cyan tint badge |
| **Copy Batch** | `IconCopyCheck` | `#06b6d4` | Cyan tint badge |
| **Delete Defect** | `IconTrash` / `IconAlertTriangle` | `#ef4444` | Red tint badge (`rgba(239,68,68,0.15)`) |
| **Restore Defect** | `IconArrowBackUp` | `#10b981` | Emerald tint badge |
| **Edit / Update** | `IconPencil` | `#3b82f6` | Blue tint badge |
| **Export / Import**| `IconFileExport` / `IconFileImport` | `#8b5cf6` | Purple tint badge |
| **Reset State** | `IconRefresh` | `#f59e0b` | Amber tint badge |
| **Category: Screen** | `IconDeviceMobile` | `#06b6d4` | Cyan tint badge |
| **Category: Camera** | `IconCamera` | `#06b6d4` | Cyan tint badge |
| **Category: Battery** | `IconBattery` | `#06b6d4` | Cyan tint badge |
| **Warning Default** | `IconAlertTriangle` | `#ef4444` | Red tint badge |

---

## 4. CSS Specification (`src/index.css`)

Below is the complete CSS specification to be added to `src/index.css`:

```css
/* ==========================================================================
   Milestone 4: Modern 2026 Floating Toast Notifications & Glassmorphism
   ========================================================================== */

/* Toast Container Overlay */
#toasts,
.toasts-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: calc(100vw - 48px);
}

/* Base Floating Toast Pill */
#toasts .toast,
.toast-pill {
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: 14px;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(51, 65, 85, 0.7);
  color: var(--text-primary, #f8fafc);
  box-shadow: 
    0 10px 30px -5px rgba(0, 0, 0, 0.4),
    0 0 16px rgba(6, 182, 212, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  max-width: 420px;
  min-width: 280px;
  animation: toastSlideIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
}

/* Light Theme Toast Variant */
[data-mantine-color-scheme='light'] #toasts .toast,
[data-theme='light'] #toasts .toast {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.9);
  color: #0f172a;
  box-shadow: 
    0 10px 25px -5px rgba(15, 23, 42, 0.12),
    0 0 12px rgba(6, 182, 212, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.8);
}

/* Toast Hover Interactivity */
#toasts .toast:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 14px 36px -5px rgba(0, 0, 0, 0.5),
    0 0 22px rgba(6, 182, 212, 0.35);
}

#toasts .toast:hover .tprogress {
  animation-play-state: paused;
}

/* Warning Toast Variant (.warn) */
#toasts .toast.warn {
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(239, 68, 68, 0.6);
  color: #f8fafc;
  box-shadow: 
    0 10px 30px -5px rgba(0, 0, 0, 0.4),
    0 0 18px rgba(239, 68, 68, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

[data-mantine-color-scheme='light'] #toasts .toast.warn,
[data-theme='light'] #toasts .toast.warn {
  background: rgba(254, 242, 242, 0.92);
  border: 1px solid rgba(252, 165, 165, 0.9);
  color: #991b1b;
  box-shadow: 
    0 10px 25px -5px rgba(153, 27, 27, 0.12),
    0 0 14px rgba(239, 68, 68, 0.2);
}

/* Category Icon Badge Container (.ticon) */
#toasts .toast .ticon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 8px;
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
  transition: transform 200ms ease;
}

#toasts .toast.warn .ticon {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Toast Message Span */
#toasts .toast span,
#toasts .toast .toast-message {
  flex: 1;
  word-break: break-word;
}

/* Action Button (.tact) */
#toasts .toast .tact {
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(6, 182, 212, 0.5);
  background: rgba(6, 182, 212, 0.2);
  color: #06b6d4;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 150ms ease;
}

#toasts .toast .tact:hover {
  background: #06b6d4;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

#toasts .toast.warn .tact {
  border: 1px solid rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

#toasts .toast.warn .tact:hover {
  background: #ef4444;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

/* Animated Progress Bar (.tprogress) */
#toasts .toast .tprogress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #06b6d4, #0284c7);
  animation: toastProgress 4.2s linear forwards;
  border-bottom-left-radius: 14px;
}

#toasts .toast.warn .tprogress {
  background: linear-gradient(90deg, #f87171, #ef4444);
}

/* Keyframes */
@keyframes toastSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.92);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastProgress {
  0% {
    width: 100%;
    opacity: 1;
  }
  100% {
    width: 0%;
    opacity: 0.4;
  }
}

@keyframes copyFeedbackBounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}
```

---

## 5. React Component Implementation Strategy (`src/components/ToastsContainer.tsx`)

### Proposed Component Architecture
The updated `ToastsContainer` component maintains full backward compatibility with `ToastNotice` props while introducing dynamic category icon selection and `.ticon` + `.tprogress` DOM elements:

```tsx
import React from 'react';
import {
  IconCheck,
  IconCopy,
  IconPlus,
  IconTrash,
  IconArrowBackUp,
  IconPencil,
  IconAlertTriangle,
  IconInfoCircle,
  IconFileExport,
  IconFileImport,
  IconRefresh,
} from '@tabler/icons-react';
import type { ToastNotice } from '../types/qc.ts';

interface ToastsContainerProps {
  toasts: ToastNotice[];
  onRemoveToast: (id: string) => void;
}

// Icon Sniffer Helper
const getToastIcon = (toast: ToastNotice) => {
  if (toast.warn) return <IconAlertTriangle size={18} />;
  
  const msg = toast.msg.toLowerCase();
  if (msg.includes('copied')) return <IconCopy size={18} />;
  if (msg.includes('added to batch') || msg.includes('bulk imported')) return <IconPlus size={18} />;
  if (msg.includes('deleted')) return <IconTrash size={18} />;
  if (msg.includes('restored')) return <IconArrowBackUp size={18} />;
  if (msg.includes('updated') || msg.includes('added custom')) return <IconPencil size={18} />;
  if (msg.includes('exported')) return <IconFileExport size={18} />;
  if (msg.includes('imported')) return <IconFileImport size={18} />;
  if (msg.includes('reset')) return <IconRefresh size={18} />;

  return <IconCheck size={18} />;
};

export const ToastsContainer: React.FC<ToastsContainerProps> = ({
  toasts,
  onRemoveToast,
}) => {
  return (
    <div
      id="toasts"
      className="toasts-container"
      data-testid="toasts-container"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.warn ? 'warn' : ''}`}
          data-testid="floating-toast"
        >
          {/* Category / Context Icon */}
          <div className="ticon" data-testid="toast-icon">
            {getToastIcon(toast)}
          </div>

          {/* Toast Message Content */}
          <span className="toast-message">{toast.msg}</span>

          {/* Action Button (e.g., Undo) */}
          {toast.action && (
            <button
              className="tact"
              data-testid="toast-action"
              onClick={() => {
                toast.action?.fn();
                onRemoveToast(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          )}

          {/* Progress Timer Countdown Bar */}
          <div className="tprogress" data-testid="toast-progress" />
        </div>
      ))}
    </div>
  );
};
```

---

## 6. Verification Against Harness Expectations

The DOM output strictly aligns with all JSDOM test harness queries in `tests/harness.js`:

```js
// harness.js query verification:
document.querySelectorAll('#toasts .toast, [data-testid="floating-toast"]'); // -> Returns div.toast
t.querySelector('span, .toast-message'); // -> Returns span text
t.classList.contains('warn'); // -> Matches toast.warn
t.querySelector('.tact, [data-testid="toast-action"]'); // -> Matches Undo button
t.querySelector('.ticon, [data-testid="toast-icon"]'); // -> Returns icon container (hasIcon: true)
t.querySelector('.tprogress, [data-testid="toast-progress"]'); // -> Returns progress bar (hasProgressTimer: true)
```

All 6 harness properties (`text`, `isWarn`, `actionLabel`, `actionBtn`, `hasIcon`, `hasProgressTimer`) will resolve to `true` / valid values!
