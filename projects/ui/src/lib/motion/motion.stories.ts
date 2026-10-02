import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta = {
  title: 'Foundations/Motion classes',
  parameters: {
    docs: {
      description: {
        component: `The enter and leave classes shipped in \`styles/motion.css\`, for Angular's \`animate.enter\` and
\`animate.leave\`. A consumer imports that stylesheet after \`theme.css\` and writes
\`animate.enter="ui-enter-fade"\`; it needs no styling of its own.

#### When to use

* \`ui-enter-fade\`: opacity over \`--duration-fast\`, for a message that appears.
* \`ui-enter-fade-up\`: opacity and a 4px rise over \`--duration-fast\`, for content that arrives in place.
* \`ui-enter-panel\`: opacity and an 8px slide in over \`--duration-base\`, for a detail panel.
* \`ui-leave-fade\`: opacity over \`--duration-exit\`, for every exit.

#### When not to use

* On page open: nothing animates when a screen first renders.
* For a layout change: only \`transform\` and \`opacity\` animate.

#### Accessibility

* Under \`prefers-reduced-motion: reduce\` the rise and the slide become a plain fade, and view transitions are off.`,
      },
    },
  },
  render: () => ({
    props: { shown: true },
    template: `
      <div class="flex flex-col items-start gap-4 p-4">
        <button type="button" class="rounded-control border border-(--border) px-4 py-2" (click)="shown = !shown">{{ shown ? 'Leave' : 'Enter' }}</button>
        @if (shown) {
          <div data-testid="fade" class="ui-enter-fade rounded-container border border-(--border) bg-(--card) p-4" animate.leave="ui-leave-fade">ui-enter-fade</div>
          <div data-testid="fade-up" class="ui-enter-fade-up rounded-container border border-(--border) bg-(--card) p-4" animate.leave="ui-leave-fade">ui-enter-fade-up</div>
          <div data-testid="panel" class="ui-enter-panel rounded-container border border-(--border) bg-(--card) p-4" animate.leave="ui-leave-fade">ui-enter-panel</div>
        }
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj;

export const EnterAndLeave: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const animationOf = (id: string): string => getComputedStyle(canvas.getByTestId(id)).animationName;

    await expect(animationOf('fade')).toBe('cairn-fade-in');
    await expect(animationOf('fade-up')).toBe('cairn-fade-up-in');
    await expect(animationOf('panel')).toBe('cairn-panel-in');

    await userEvent.click(canvas.getByRole('button', { name: 'Leave' }));

    await expect(canvas.queryByTestId('fade')).not.toBeNull();
    await waitFor(() => expect(canvas.queryByTestId('fade')).toBeNull());
  },
};
