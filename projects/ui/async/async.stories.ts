import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, within } from 'storybook/test';

import {
  ASYNC_ALIGNS,
  ASYNC_STATES,
  ASYNC_VARIANTS,
  type AsyncAlign,
  type AsyncState,
  type AsyncVariant,
  UiAsync,
} from './async';

type AsyncArgs = {
  title: string;
  state: AsyncState;
  errorTitle: string;
  errorMessage: string;
  retryLabel: string;
  retryIcon: boolean;
  variant: AsyncVariant;
  align: AsyncAlign;
  card: boolean;
  fill: boolean;
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
title stays visible above it: that title is not part of this component, the caller renders it.

One call, one block, its three states: a call that fails never erases the rest of the screen.

The error block has four looks. \`elevated\` (the default) is a tinted box with the token line heights.
\`plain\` has no surface and the normal line height, for a block that sits in a card or a table the
screen already draws. \`emphasis\` is a heading, a longer message and a primary retry button, for a
list that is the whole page. \`inline\` is one row, message left and retry right, for a failure
inside a form. \`align\` centers the block (\`auto\`: from 64rem), \`card\` draws a card around it and
\`fill\` makes it fill a host the screen sizes.

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
        <ui-async [state]="state" [errorTitle]="errorTitle" [errorMessage]="errorMessage" [retryLabel]="retryLabel" [retryIcon]="retryIcon" [variant]="variant" [align]="align" [card]="card" [fill]="fill" (retry)="retry()">
          <div asyncLoading class="flex flex-col gap-2.5">
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-30"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-[110px]"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
          </div>
          <div asyncEmpty class="rounded-control flex flex-col items-start gap-2 bg-(--background) p-4">
            <span class="text-label text-(--muted-foreground)">This account has no holdings yet. Add one or import a CSV.</span>
            <button type="button" class="rounded-control text-label h-9 bg-(--card) px-3 font-medium shadow-[inset_0_0_0_1px_var(--border)]">Add a holding</button>
          </div>
          <span class="text-body font-medium tabular-nums">8 592,00 €</span>
        </ui-async>
      </div>
    `,
  }),
  args: {
    title: 'By wrapper',
    state: 'ready',
    errorTitle: 'Wrappers couldn’t be loaded',
    errorMessage: 'The server didn’t respond.',
    retryLabel: 'Try again',
    retryIcon: true,
    variant: 'elevated',
    align: 'start',
    card: false,
    fill: false,
    retry: fn(),
  },
  argTypes: {
    title: { control: 'text', description: "The block's own title, rendered by the caller above the three states." },
    state: { control: 'inline-radio', options: [...ASYNC_STATES], description: 'Which slot is currently shown.' },
    errorTitle: { control: 'text', description: 'Error state title, next to the block name.' },
    errorMessage: { control: 'text', description: 'Error state detail sentence.' },
    retryLabel: { control: 'text', description: 'Label of the retry button.' },
    retryIcon: {
      control: 'boolean',
      description:
        'Draws the rotate icon in the retry button (default). Turn it off for a text-only retry, as in a per-source search error. Only the `inline` variant honors it.',
    },
    variant: {
      control: 'inline-radio',
      options: [...ASYNC_VARIANTS],
      description:
        'Look of the error block: `elevated` tinted box, `plain` no surface, `emphasis` heading and primary retry, `inline` one row.',
    },
    align: {
      control: 'inline-radio',
      options: [...ASYNC_ALIGNS],
      description: 'Alignment of the error block. `auto` is the start below 64rem and centered from 64rem.',
    },
    card: {
      control: 'boolean',
      description: 'The error block draws its own card (background, container radius, hairline).',
    },
    fill: {
      control: 'boolean',
      description: 'The error block fills its host and centers vertically; the host sets the minimum height.',
    },
    retry: { description: 'Emitted when the retry button is pressed. Only that block reloads.' },
  },
};

export default meta;
type Story = StoryObj<AsyncArgs>;

export const Default: Story = {};

export const Loading: Story = {
  args: { state: 'loading' },
};

export const Empty: Story = {
  args: { state: 'empty' },
};

export const Error: Story = {
  args: { state: 'error' },
};

export const Variants: Story = {
  parameters: { layout: 'padded' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex w-[420px] flex-col gap-4">
        @for (v of ['elevated', 'plain', 'emphasis', 'inline']; track v) {
          <ui-async state="error" [variant]="v" [errorTitle]="errorTitle" [errorMessage]="errorMessage" [retryLabel]="retryLabel" [retryIcon]="retryIcon" [align]="align" [card]="card" [fill]="fill" (retry)="retry()" />
        }
      </div>
    `,
  }),
};

export const InlineRetryWithoutIcon: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'padded' },
  render: () => ({
    template: `
      <div class="w-[350px] bg-(--card) p-2">
        <ui-async state="error" errorTitle="" errorMessage="Yahoo Finance didn’t respond." retryLabel="Try again" variant="inline" [retryIcon]="false" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const retry = within(canvasElement).getByRole('button', { name: 'Try again' });

    await expect(retry.querySelector('svg')).toBeNull();
    await expect(getComputedStyle(retry).paddingLeft).toBe('12px');
  },
};
