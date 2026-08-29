import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/angular-vite';
import { getPreferredColorScheme } from 'storybook/theming';

import './preview.css';
import { cairnStorybookTheme } from './theme';

const preview: Preview = {
  decorators: [
    /*
     * Matches the theming contract of the token sheet: `light-dark()` resolves from the
     * color-scheme that [data-theme] forces on <html> (see styles/tokens.css).
     *
     * "system" sets an empty data-theme, which neither [data-theme='light'] nor
     * [data-theme='dark'] matches. The `color-scheme: light dark` declared on :root then stands
     * and the OS decides, exactly as it does in an application that forces nothing. It is the
     * default here because it is also the default a consuming application inherits.
     */
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
    /*
     * A Docs page is Storybook's own chrome, rendered outside the component tree the decorator
     * above themes, so its prose, tables and code blocks take their colors from this ThemeVars.
     * Storybook resolves it once, so it follows the OS like the sidebar does, and the two always
     * agree; the toolbar drives the stories, including those embedded in the page. See AGENTS.md.
     */
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
