import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ASYNC_STATES, type AsyncState, UiAsync } from './async';

type AsyncArgs = {
  title: string;
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
      <div class="rounded-container box-content flex w-[300px] flex-col gap-2.5 bg-(--card) p-4 shadow-[inset_0_0_0_1px_var(--border)]">
        <span class="text-title font-semibold">{{ title }}</span>
        <ui-async [state]="state" [errorTitle]="errorTitle" [errorMessage]="errorMessage" [retryLabel]="retryLabel" (retry)="retry()">
          <div asyncLoading class="flex flex-col gap-2.5">
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-30"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-[110px]"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
          </div>
          <div asyncEmpty class="rounded-control flex flex-col items-start gap-2 bg-(--background) p-4">
            <span class="text-label text-(--muted-foreground)">Ce compte n'a encore aucune ligne. Ajoutez un titre ou importez un CSV.</span>
            <button type="button" class="rounded-control text-label h-9 bg-(--card) px-3 font-medium shadow-[inset_0_0_0_1px_var(--border)]">Ajouter une ligne</button>
          </div>
          <span class="text-body font-medium tabular-nums">14 318,40 €</span>
        </ui-async>
      </div>
    `,
  }),
  args: {
    title: 'Par enveloppe',
    state: 'ready',
    errorTitle: "Les enveloppes n'ont pas pu être chargées",
    errorMessage: "Le serveur n'a pas répondu.",
    retryLabel: 'Réessayer',
    retry: fn(),
  },
  argTypes: {
    title: { control: 'text', description: "The block's own title, rendered by the caller above the three states." },
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
    await userEvent.click(canvas.getByRole('button', { name: 'Réessayer' }));
    await expect(args.retry).toHaveBeenCalledOnce();
  },
};
