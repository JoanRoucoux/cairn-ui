import { setProjectAnnotations } from '@storybook/angular-vite';

import { annotations } from './vitest.setup';

setProjectAnnotations([...annotations, { initialGlobals: { theme: 'dark' } }]);
