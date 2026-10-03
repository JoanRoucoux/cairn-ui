import type { StorybookConfig } from '@storybook/angular-vite';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../projects/ui/docs/**/*.mdx', '../projects/ui/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/angular-vite',
    options: { compodoc: false },
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: [
          {
            find: /^@joanroucoux\/cairn-ui\/(?!styles\/)(.+)$/,
            replacement: `${fileURLToPath(new URL('../projects/ui', import.meta.url))}/$1`,
          },
        ],
      },
    }),
  staticDirs: ['../public'],
  // The onboarding checklist ("Guide" tab, sidebar widget) is disabled: not useful once past a
  // project's first run.
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
};

export default config;
