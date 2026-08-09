import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createAppInstance } from './harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Challenger M4: Floating Toast Notifications Empirical Verification', () => {
  it('1. Code Analysis: notifications.ts contains getToastIcon logic with Tabler icons for categories', () => {
    const notifPath = path.join(projectRoot, 'src', 'utils', 'notifications.ts');
    const content = fs.readFileSync(notifPath, 'utf8');

    assert.ok(content.includes('IconCopy'), 'notifications.ts must import & use IconCopy');
    assert.ok(content.includes('IconPlus'), 'notifications.ts must import & use IconPlus');
    assert.ok(content.includes('IconTrash'), 'notifications.ts must import & use IconTrash');
    assert.ok(content.includes('IconArrowBackUp'), 'notifications.ts must import & use IconArrowBackUp');
    assert.ok(content.includes('IconPencil'), 'notifications.ts must import & use IconPencil');
    assert.ok(content.includes('IconDownload'), 'notifications.ts must import & use IconDownload');
    assert.ok(content.includes('IconUpload'), 'notifications.ts must import & use IconUpload');
    assert.ok(content.includes('IconRefresh'), 'notifications.ts must import & use IconRefresh');
    assert.ok(content.includes('IconAlertTriangle'), 'notifications.ts must import & use IconAlertTriangle');
    assert.ok(content.includes('IconCheck'), 'notifications.ts must import & use IconCheck default');
  });

  it('2. Component Structure: ToastsContainer.tsx matches contract selectors (#toasts, .toast, .warn, .ticon, .tact, .tprogress)', () => {
    const containerPath = path.join(projectRoot, 'src', 'components', 'ToastsContainer.tsx');
    const content = fs.readFileSync(containerPath, 'utf8');

    assert.ok(content.includes('id="toasts"'), 'ToastsContainer must render container id="toasts"');
    assert.ok(content.includes('className="toasts-container"'), 'ToastsContainer must render className="toasts-container"');
    assert.ok(content.includes('className={`toast ${toast.warn ? \'warn\' : \'\'}`'), 'ToastsContainer must render .toast and optional .warn class');
    assert.ok(content.includes('className="ticon"'), 'ToastsContainer must render .ticon container');
    assert.ok(content.includes('data-testid="toast-icon"'), 'ToastsContainer must include data-testid="toast-icon"');
    assert.ok(content.includes('className="toast-message"'), 'ToastsContainer must render .toast-message');
    assert.ok(content.includes('className="tact"'), 'ToastsContainer must render .tact action button');
    assert.ok(content.includes('data-testid="toast-action"'), 'ToastsContainer must include data-testid="toast-action"');
    assert.ok(content.includes('className="tprogress"'), 'ToastsContainer must render .tprogress timer bar');
    assert.ok(content.includes('data-testid="toast-progress"'), 'ToastsContainer must include data-testid="toast-progress"');
  });

  it('3. CSS Glassmorphism & Animations: index.css contains Deep Slate floating pill rules', () => {
    const cssPath = path.join(projectRoot, 'src', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Container selector & positioning
    assert.ok(cssContent.includes('#toasts,'), 'CSS must include #toasts selector');
    assert.ok(cssContent.includes('.toasts-container'), 'CSS must include .toasts-container selector');

    // Glassmorphism styling
    assert.ok(cssContent.includes('background: rgba(30, 41, 59, 0.85);'), 'CSS must specify Deep Slate charcoal rgba bg');
    assert.ok(cssContent.includes('backdrop-filter: blur(12px);'), 'CSS must specify 12px backdrop-filter blur');
    assert.ok(cssContent.includes('border-radius: 9999px;'), 'CSS must specify rounded pill border radius');

    // Progress bar & keyframe animations
    assert.ok(cssContent.includes('.tprogress'), 'CSS must include .tprogress selector');
    assert.ok(cssContent.includes('@keyframes toastSlideIn'), 'CSS must define toastSlideIn keyframes');
    assert.ok(cssContent.includes('@keyframes toastProgress'), 'CSS must define toastProgress keyframes');
    assert.ok(cssContent.includes('@keyframes copyFeedbackBounce'), 'CSS must define copyFeedbackBounce keyframes');

    // Hover pause behavior
    assert.ok(cssContent.includes('.toast:hover .tprogress'), 'CSS must include hover pause rule for progress timer');
    assert.ok(cssContent.includes('animation-play-state: paused;'), 'CSS must set animation-play-state: paused on hover');
  });

  it('4. DOM Integration: Spawning toast via JSDOM test harness renders correct selectors', async () => {
    const app = createAppInstance();

    // Trigger copy on first wording card by clicking row
    await app.clickItemRow(0);

    const toasts = app.getToasts();
    assert.ok(toasts.length > 0, 'Triggering copy must spawn a floating toast');

    const firstToast = toasts[0];
    assert.ok(firstToast.text.length > 0, 'Toast must have non-empty text content');
    assert.equal(firstToast.hasIcon, true, 'Toast must render category icon (.ticon / data-testid="toast-icon")');
    assert.equal(firstToast.hasProgressTimer, true, 'Toast must render progress timer bar (.tprogress / data-testid="toast-progress")');

    // Verify DOM element selectors directly
    const toastNode = app.document.querySelector('#toasts .toast');
    assert.ok(toastNode, 'DOM must contain #toasts .toast element');
    assert.ok(toastNode.querySelector('.ticon'), 'Toast DOM must contain .ticon element');
    assert.ok(toastNode.querySelector('.toast-message'), 'Toast DOM must contain .toast-message element');
    assert.ok(toastNode.querySelector('.tprogress'), 'Toast DOM must contain .tprogress element');
  });

  it('5. Action Toast Integration: Action button (.tact) triggers action callback and restores deleted item', async () => {
    const app = createAppInstance();

    // Enable edit mode to make delete buttons visible
    app.toggleEditMode();

    const initialCount = app.getVisibleItems().length;
    assert.ok(initialCount > 0, 'Initial items must exist');

    // Delete item to spawn toast with "Undo" action button
    await app.clickItemAction(0, 'del');

    const countAfterDel = app.getVisibleItems().length;
    assert.equal(countAfterDel, initialCount - 1, 'Item count should decrease by 1 after deletion');

    const toasts = app.getToasts();
    assert.ok(toasts.length > 0, 'Deleting item must spawn a toast notification');

    const undoToastIndex = toasts.findIndex((t) => t.actionLabel === 'Undo');
    assert.ok(undoToastIndex >= 0, 'Toast with Undo action button must exist');

    // Trigger action via test harness helper
    app.triggerToastAction(undoToastIndex);

    // Verify item count is restored after clicking Undo
    const countAfterUndo = app.getVisibleItems().length;
    assert.equal(countAfterUndo, initialCount, 'Undo action should restore deleted wording item');
  });
});
