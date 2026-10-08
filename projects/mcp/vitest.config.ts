import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/mcp',
  test: {
    root: fileURLToPath(new URL('.', import.meta.url)),
    include: ['**/*.spec.ts'],
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['generator/**/*.ts', 'src/**/*.ts'],
      exclude: ['**/*.spec.ts', 'generator/cli.ts', 'generator/testing.ts'],
      reporter: ['text-summary', 'html', 'lcovonly'],
      reportsDirectory: '../../coverage/mcp',
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});
