import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookAngularVitest } from '@storybook/angular-vite/vitest';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = fileURLToPath(new URL('.', import.meta.url));

const storybookProject = (name: string, setupFile: string) => ({
  extends: false as const,
  plugins: [storybookAngularVitest({ zoneless: true }), storybookTest({ configDir: dirname })],
  test: {
    name,
    setupFiles: [`${dirname}${setupFile}`],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' as const }],
    },
  },
});

export default defineConfig({
  test: {
    projects: [
      storybookProject('storybook', 'vitest.setup.ts'),
      storybookProject('storybook-dark', 'vitest.setup.dark.ts'),
    ],
  },
});
