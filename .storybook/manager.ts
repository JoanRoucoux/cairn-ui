import { addons } from 'storybook/manager-api';
import { getPreferredColorScheme } from 'storybook/theming';

import { cairnStorybookTheme } from './theme';

// The sidebar and the toolbar live outside the preview iframe, so the toolbar's own theme control
// cannot reach them: they follow the OS preference, read once at load. See AGENTS.md.
addons.setConfig({ theme: cairnStorybookTheme(getPreferredColorScheme()) });
