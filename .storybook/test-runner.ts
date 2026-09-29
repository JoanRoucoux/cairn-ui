import { type TestRunnerConfig, getStoryContext } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async preVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    const viewport = storyContext.parameters?.viewport as { width: number; height: number } | undefined;

    if (viewport) {
      await page.setViewportSize(viewport);
    }
  },
};

export default config;
