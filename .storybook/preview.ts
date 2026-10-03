import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/angular-vite';
import { getPreferredColorScheme } from 'storybook/theming';

import '../projects/ui/styles/fonts.css';
import './preview.css';
import { cairnStorybookTheme } from './theme';

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        system: '',
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'system',
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    controls: { expanded: true },
    a11y: { test: 'error' },
    docs: { theme: cairnStorybookTheme(getPreferredColorScheme()) },
    options: {
      storySort: {
        order: ['Foundations', ['Overview', 'Colors', 'Typography'], 'Inputs', 'Data display', 'Surfaces', 'Feedback'],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
