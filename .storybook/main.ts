import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../projects/ui/docs/**/*.mdx', '../projects/ui/src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/angular-vite',
    options: { compodoc: false },
  },
  staticDirs: ['../public'],
};

export default config;
