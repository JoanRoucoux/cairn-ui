import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/angular-vite';
import { afterEach } from 'vitest';

import * as projectAnnotations from './preview';

const layoutAnnotations = {
  beforeEach: ({ parameters }: { parameters: { layout?: string } }) => {
    document.body.style.padding = (parameters.layout ?? 'padded') === 'padded' ? '1rem' : '';

    return () => {
      document.body.style.padding = '';
    };
  },
};

const TABBABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
  '[role^="menuitem"]',
].join(',');

const hasOutline = (style: CSSStyleDeclaration): boolean =>
  style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;

const describe = (el: Element): string => {
  const name = el.getAttribute('aria-label') ?? el.textContent.trim().slice(0, 40);
  const classes = name ? '' : [...el.classList].slice(0, 4).join('.');
  return `<${el.localName}${classes ? `.${classes}` : ''}>${name ? ` "${name}"` : ''}`;
};

const isTabbable = (el: Element): boolean => {
  if (!(el instanceof HTMLElement) || el.matches(':disabled') || el.inert) return false;
  const tabindex = el.getAttribute('tabindex');
  if (tabindex !== null && Number(tabindex) < 0 && !el.matches('[role^="menuitem"]')) return false;
  if (el.localName === 'input' && (el as HTMLInputElement).type === 'hidden') return false;
  return el.checkVisibility();
};

const focusRingGuard = {
  afterEach: () => {
    const missing: string[] = [];

    for (const el of document.querySelectorAll(TABBABLE_SELECTOR)) {
      if (!isTabbable(el)) continue;
      (el as HTMLElement).focus({ focusVisible: true } as FocusOptions);
      if (document.activeElement !== el) continue;
      const drawn = [null, '::before', '::after'].some((pseudo) => hasOutline(getComputedStyle(el, pseudo)));
      if (!drawn) missing.push(describe(el));
    }

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    if (missing.length > 0) {
      throw new Error(`Focus ring missing (no outline on the element, ::before or ::after):\n${missing.join('\n')}`);
    }
  },
};

export const annotations = [a11yAddonAnnotations, projectAnnotations, layoutAnnotations, focusRingGuard];

setProjectAnnotations(annotations);

const nextFrames = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

afterEach(async () => {
  if (window.scrollX !== 0 || window.scrollY !== 0) {
    window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    await nextFrames();
  }
});
