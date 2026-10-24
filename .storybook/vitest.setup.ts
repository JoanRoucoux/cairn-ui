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

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations, layoutAnnotations]);

const nextFrames = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

afterEach(async () => {
  if (window.scrollX !== 0 || window.scrollY !== 0) {
    window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    await nextFrames();
  }
});
