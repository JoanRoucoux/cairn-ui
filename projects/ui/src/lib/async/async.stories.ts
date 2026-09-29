import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ASYNC_STATES, type AsyncState, UiAsync } from './async';

type AsyncArgs = {
  state: AsyncState;
  errorTitle: string;
  errorMessage: string;
  retryLabel: string;
  retry: () => void;
};

const meta: Meta<AsyncArgs> = {
  title: 'Feedback/Async',
  decorators: [moduleMetadata({ imports: [UiAsync] })],
  parameters: {
    docs: {
      description: {
        component: `The three states of a block that depends on a service call: a loading skeleton, an error
shown in place with a retry button, or an empty state. Whichever state is active, the block's own
title stays visible above it — that title is not part of this component, the caller renders it.

One call, one block, its three states: a call that fails never erases the rest of the screen.

#### When to use

* Around any content that comes from an HTTP call: a total, a chart, a list.
* When two blocks on the same screen depend on different calls: give each its own \`ui-async\`, so
  one failing never hides the other.

#### When not to use

* Around content that never depends on a call, such as static labels or client-side computed
  values.
* For a full-page error. \`ui-async\` covers one block; a screen where every block failed shows its
  own page-level error instead.

#### Accessibility

* The host carries \`aria-busy="true"\` while loading.
* The error block is \`role="alert"\` inside an \`aria-live="polite"\` region, so assistive technology
  announces it as soon as it appears.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-async [state]="state" [errorTitle]="errorTitle" [errorMessage]="errorMessage" [retryLabel]="retryLabel" (retry)="retry()">
        <span asyncLoading class="text-label text-(--muted-foreground)">Loading…</span>
        <span asyncEmpty class="text-label text-(--muted-foreground)">Add a holding to see it here.</span>
        <span class="text-body">€164,294.28</span>
      </ui-async>
    `,
  }),
  args: {
    state: 'ready',
    errorTitle: 'Total could not be loaded',
    errorMessage: 'The server did not answer.',
    retryLabel: 'Retry',
    retry: fn(),
  },
  argTypes: {
    state: { control: 'inline-radio', options: [...ASYNC_STATES], description: 'Which slot is currently shown.' },
    errorTitle: { control: 'text', description: 'Error state title, next to the block name.' },
    errorMessage: { control: 'text', description: 'Error state detail sentence.' },
    retryLabel: { control: 'text', description: 'Label of the retry button.' },
    retry: { description: 'Emitted when the retry button is pressed. Only that block reloads.' },
  },
};

export default meta;
type Story = StoryObj<AsyncArgs>;

export const Ready: Story = {};

export const Loading: Story = {
  args: { state: 'loading' },
};

export const Empty: Story = {
  args: { state: 'empty' },
};

export const Error: Story = {
  args: { state: 'error' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(args.retry).toHaveBeenCalledOnce();
  },
};
