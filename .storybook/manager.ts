import { addons } from 'storybook/manager-api';
import { getPreferredColorScheme } from 'storybook/theming';

import { cairnStorybookTheme } from './theme';

addons.setConfig({ theme: cairnStorybookTheme(getPreferredColorScheme()) });
