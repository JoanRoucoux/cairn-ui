import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/angular-vite';

import './preview.css';

const preview: Preview = {
  decorators: [
    // Matches the tokens' theming contract: light-dark() values resolve from the
    // color-scheme forced by [data-theme] on <html> (see styles/tokens.css).
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    controls: { expanded: true },
    options: {
      storySort: {
        order: ['Foundations', 'Inputs', 'Data display', 'Surfaces', 'Feedback'],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
