# Strategy & Technical Plan: `src/index.css` Theme Tokens & 2026 Aesthetic Engine

## Executive Summary
This document details the analysis and precise modification strategy for `src/index.css` to implement **Milestone M1: Aesthetic Engine & Theme Tokens**. 
The objective is to migrate the application's styling infrastructure from a legacy dark zinc palette (`#09090b` / `#18181b`) to the state-of-the-art 2026 Linear/Vercel aesthetic:
- **Background**: Deep Void Midnight (`#050608`)
- **Container Surfaces**: Onyx (`#0c0e12`)
- **Borders**: 1px razor-sharp outlines (`border-white/[0.08]` / `rgba(255, 255, 255, 0.08)` or `#27272a`)
- **Highlights**: Ambient cyan glow (`from-cyan-500/20 to-blue-500/10` / `#06b6d4`)
- **Typography**: Geist/Inter sans-serif + JetBrains Mono monospaced font family system via Tailwind CSS v4 `@theme`.
- **Legacy Purge**: Total removal of `--mantine-color-body` and `[data-mantine-color-scheme]` attributes.

---

## 1. Current State Investigation (`src/index.css`)

### 1.1 Theme Variable Analysis
Currently, `src/index.css` defines theme tokens in `@layer base` under `:root, [data-theme='dark'], .dark`:
```css
--background: #09090b;   /* Deep Zinc Dark */
--card: #18181b;         /* Container Charcoal */
--border: #27272a;
--mantine-color-body: var(--bg-deep-slate); /* LEGACY MANTINE VARIABLE */
```
**Deficiencies identified**:
1. **Background & Card Colors**: `--background` is `#09090b` and `--card` is `#18181b`. These do not match the target Deep Void Midnight (`#050608`) and Onyx (`#0c0e12`).
2. **Legacy Mantine Property**: `--mantine-color-body` (line 38 and line 79) remains in CSS definitions despite the application migrating off Mantine.
3. **Legacy Selectors**: CSS blocks include `[data-mantine-color-scheme='dark']` and `[data-mantine-color-scheme='light']`.
4. **Font Declarations**: Body currently relies on system fallback (`font-family: system-ui, -apple-system...`). `Geist`, `Inter`, and `JetBrains Mono` fonts are neither imported nor registered in Tailwind v4.
5. **Border Tokens**: Uses solid `#27272a` instead of 1px translucent razor borders (`rgba(255, 255, 255, 0.08)`).
6. **Ambient Cyan Glow**: Hover glows exist ad-hoc on `.gcard:hover`, but no standard utility classes or reusable glow variables exist.

---

## 2. Specification for 2026 Linear/Vercel Aesthetic Engine

### 2.1 Color Palette Specifications
| Design Token | Role | Hex / RGBA Value | CSS Property Alias |
|---|---|---|---|
| **Deep Void Midnight** | Page background | `#050608` | `--background`, `--bg-deep-slate` |
| **Onyx Surface** | Cards, modals, sidebars | `#0c0e12` | `--card`, `--popover`, `--container-charcoal`, `--header-bg` |
| **Razor Border** | Crisp 1px container outlines | `rgba(255, 255, 255, 0.08)` / `#27272a` | `--border`, `--border-contrast`, `--input` |
| **Cool Cyan Accent** | Primary interactive accent | `#06b6d4` | `--primary`, `--ring`, `--accent-cyan` |
| **Sky Accent** | Secondary highlight | `#0284c7` | `--accent-sky` |
| **Ambient Cyan Glow** | Linear/Vercel hover backlight | `linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.1))` | `.ambient-cyan-glow`, `.glow-cyan-subtle` |

### 2.2 Typography System
- **Sans-Serif Font Stack**: `Geist`, `Inter`, system-ui, -apple-system, sans-serif.
- **Monospace Font Stack**: `JetBrains Mono`, ui-monospace, SFMono-Regular, Consolas, monospace.
- **Google Fonts Import**:
  `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap`

---

## 3. Precise Modification Strategy for `src/index.css`

The implementer (`implementer_m1_1`) should apply the following targeted updates to `src/index.css`:

### Step 1: Add Google Font Import & Tailwind CSS v4 `@theme` Block
Place at the top of `src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: 'Geist', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --color-deep-void: #050608;
  --color-onyx: #0c0e12;
  --color-razor-border: rgba(255, 255, 255, 0.08);
  --color-glow-cyan: #06b6d4;
}
```

### Step 2: Refactor `:root, [data-theme='dark'], .dark` Tokens & Purge `--mantine-color-body`
Replace lines 4-45 in `@layer base`:
```css
@layer base {
  :root,
  [data-theme='dark'],
  .dark {
    --background: #050608;
    --foreground: #f8fafc;
    --card: #0c0e12;
    --card-foreground: #f8fafc;
    --popover: #0c0e12;
    --popover-foreground: #f8fafc;
    --primary: #06b6d4;
    --primary-foreground: #ffffff;
    --secondary: #18181b;
    --secondary-foreground: #f8fafc;
    --muted: #18181b;
    --muted-foreground: #94a3b8;
    --accent: #18181b;
    --accent-foreground: #f8fafc;
    --destructive: #ef4444;
    --destructive-foreground: #ffffff;
    --border: rgba(255, 255, 255, 0.08);
    --input: rgba(255, 255, 255, 0.08);
    --ring: #06b6d4;
    --radius: 0.5rem;

    /* Custom variables mapped to Deep Void Midnight (#050608) & Onyx (#0c0e12) */
    --bg-deep-slate: #050608;
    --container-charcoal: #0c0e12;
    --border-contrast: rgba(255, 255, 255, 0.08);
    --accent-cyan: #06b6d4;
    --accent-sky: #0284c7;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --drawer-backdrop-bg: rgba(5, 6, 8, 0.6);
    --drawer-backdrop-blur: blur(12px);
    --header-bg: #0c0e12;
  }

  [data-theme='light'] {
    --background: #ffffff;
    --foreground: #050608;
    --card: #ffffff;
    --card-foreground: #050608;
    --popover: #ffffff;
    --popover-foreground: #050608;
    --primary: #06b6d4;
    --primary-foreground: #ffffff;
    --secondary: #f4f4f5;
    --secondary-foreground: #18181b;
    --muted: #f4f4f5;
    --muted-foreground: #71717a;
    --accent: #f4f4f5;
    --accent-foreground: #18181b;
    --destructive: #ef4444;
    --destructive-foreground: #ffffff;
    --border: #e4e4e7;
    --input: #e4e4e7;
    --ring: #06b6d4;
    --radius: 0.5rem;

    --bg-deep-slate: #f8fafc;
    --container-charcoal: #ffffff;
    --border-contrast: #e2e8f0;
    --accent-cyan: #06b6d4;
    --accent-sky: #0284c7;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --drawer-backdrop-bg: rgba(15, 23, 42, 0.2);
    --drawer-backdrop-blur: blur(4px);
    --header-bg: #ffffff;
  }
}
```

### Step 3: Body Font Family & Antialiasing
Update `body` definition:
```css
body {
  background-color: var(--background);
  color: var(--text-primary);
  transition: background-color 150ms ease, color 150ms ease;
  margin: 0;
  padding: 0;
  font-family: var(--font-sans, 'Geist', 'Inter', system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Step 4: Add Ambient Cyan Glow Utilities
Insert after toast notification styles:
```css
/* Ambient Cyan Glow Utilities */
.ambient-cyan-glow {
  background-image: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.1));
}

.glow-cyan-subtle {
  box-shadow: 0 0 20px -3px rgba(6, 182, 212, 0.25);
}

.glow-cyan-border {
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
}
```

### Step 5: Update Defect Card Variables & Purge Mantine Selectors
Replace lines 286-302:
```css
:root,
[data-theme='dark'] {
  --defect-card-bg: var(--card, #0c0e12);
  --defect-card-bg-hover: #12151c;
  --defect-card-bg-pinned: rgba(245, 159, 0, 0.1);
  --defect-card-border: var(--border, rgba(255, 255, 255, 0.08));
  --defect-card-border-hover: var(--accent-cyan, #06b6d4);
  --defect-card-border-pinned: rgba(245, 159, 0, 0.5);
  --defect-card-glow-hover: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.2);
  --defect-rnum-color: #94a3b8;
  --defect-rtxt-color: var(--text-primary, #f8fafc);
  --defect-act-btn-bg: rgba(255, 255, 255, 0.04);
  --defect-act-btn-border: rgba(255, 255, 255, 0.08);
  --defect-act-btn-color: #94a3b8;
}

[data-theme='light'] {
  --defect-card-bg: #ffffff;
  --defect-card-bg-hover: #f8fafc;
  --defect-card-bg-pinned: #fff9db;
  --defect-card-border: #cbd5e1;
  --defect-card-border-hover: var(--accent-sky, #0284c7);
  --defect-card-border-pinned: #ffe066;
  --defect-card-glow-hover: 0 4px 16px rgba(2, 132, 199, 0.15);
  --defect-rnum-color: #64748b;
  --defect-rtxt-color: #0f172a;
  --defect-act-btn-bg: #f1f5f9;
  --defect-act-btn-border: #cbd5e1;
  --defect-act-btn-color: #475569;
}
```

Update `.rnum` class to use `font-family: var(--font-mono);`:
```css
.rnum {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-weight: 700;
  color: var(--defect-rnum-color);
  letter-spacing: -0.02em;
  transition: color 150ms ease;
}
```

---

## 4. Verification Method

1. **Static File Verification**:
   - Inspect `src/index.css` to confirm `--background: #050608`, `--card: #0c0e12`, `--mantine-color-body` zero occurrences.
   - Confirm Google Fonts `@import` and `@theme` font definitions for Geist, Inter, and JetBrains Mono.
2. **Build Verification**:
   - Run `npm run build` (tsc & vite build) to verify 100% zero syntax errors or broken Tailwind imports.
3. **Test Suite Verification**:
   - Run `npm test` to verify all test suites (Tiers 1-5) continue passing with 100% success rate.
