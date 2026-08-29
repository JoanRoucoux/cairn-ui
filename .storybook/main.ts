import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../projects/ui/docs/**/*.mdx', '../projects/ui/src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/angular-vite',
    options: { compodoc: false },
  },
  staticDirs: ['../public'],
  // The onboarding checklist ("Guide" tab, sidebar widget) is disabled: not useful once past a
  // project's first run.
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
};

export default config;
