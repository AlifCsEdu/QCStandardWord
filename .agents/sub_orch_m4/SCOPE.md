# Scope: Milestone 4 - Modern Floating Toast Notifications & Copy Feedback

## Architecture
- Floating toast notification system (`src/components/ToastsContainer.tsx`, `src/utils/notifications.ts`, `src/index.css`).
- Floating toast pills with category icons, subtle glow, copy feedback animations, and progress timers.
- Test harness compatibility (`#toasts .toast`, `.warn`, `.tact`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 7 | Floating Toast Notifications | Modern floating toast pills with category icons, subtle glow, copy feedback, progress timers, retaining `#toasts .toast`, `.warn`, `.tact` compatibility | M4 | R2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 4 | M4: Modern Floating Toast Notifications & Copy Feedback | Refactor notifications to floating glassmorphic toasts with category icons, subtle glow, progress timer | M2 | DONE |

## Interface Contracts
### Notifications System
- Toast container: `#toasts`
- Toast items: `.toast`
- Toast types / classes: `.warn`, `.tact`, etc.
