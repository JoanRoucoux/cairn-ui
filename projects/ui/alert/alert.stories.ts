import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ALERT_VARIANTS, type AlertVariant, UiAlert } from './alert';

type AlertArgs = {
  variant: AlertVariant;
  heading: string;
  fadeIn: boolean;
  text: string;
};

const meta: Meta<AlertArgs> = {
  title: 'Feedback/Alert',
  decorators: [moduleMetadata({ imports: [UiAlert] })],
  parameters: {
    docs: {
      description: {
        component: `Inline message that explains why something failed, or what an action is about to cost: a
Lucide icon in the \`--negative\` color, an optional heading and a text.

#### When to use

* To report a failed submission next to the form that caused it, such as a sign-in error.
* To explain a step with static help, such as what a manual entry cannot verify (\`info\` variant).
* To warn, right above a confirmation, about an irreversible consequence (\`warning\` variant).

#### When not to use

* For a failed data load inside a block. Use [Async](?path=/docs/feedback-async--docs), which offers a retry.
* For a label on a row. Use [Badge](?path=/docs/data-display-badge--docs).

#### Accessibility

* The \`error\` variant is \`role="alert"\`, announced as soon as it appears. The \`warning\` variant is
  \`role="status"\`, announced politely.
* The \`info\` variant is \`role="note"\`: read in place, never announced.
* The icon is decorative and hidden from assistive technology: the text carries the message.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 342px"><ui-alert [variant]="variant" [heading]="heading" [fadeIn]="fadeIn">{{ text }}</ui-alert></div>`,
  }),
  args: {
    variant: 'error',
    heading: 'Sign-in failed',
    fadeIn: true,
    text: 'The request was canceled or the passkey wasn’t recognized. Try again.',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...ALERT_VARIANTS],
      description:
        '`error` is a bordered card with the circle icon. `warning` is a bare inline notice with the triangle icon. `info` is a `--muted` box with the circle-i icon in the text color, a static note.',
    },
    heading: { control: 'text', description: 'Optional heading. The text below it turns muted.' },
    text: { control: 'text', description: 'Projected text content.' },
    fadeIn: {
      control: 'boolean',
      description:
        'Fades the alert in over `--duration-fast` when it appears (default). Turn it off for an alert that is part of the page as it opens, such as an error state after a load: that one shows without motion.',
    },
  },
};

export default meta;
type Story = StoryObj<AlertArgs>;

export const WithHeading: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByRole('alert')).toBeVisible());
    await expect(canvas.getByText('Sign-in failed')).toBeVisible();
  },
};

export const TextOnly: Story = {
  args: { heading: '', text: 'Incorrect username or password.' },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    heading: '',
    text: 'You’re selling the whole quantity: the holding will be removed from Northwind PEA. This can’t be undone.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByRole('status')).toBeVisible());
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    heading: '',
    text: 'Cairn can’t verify this ISIN before it’s added. The price will come with the next SG Sirius update; if the ISIN is wrong, the holding will stay without a price.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const note = await canvas.findByRole('note');

    await waitFor(() => expect(note).toBeVisible());
    await expect(getComputedStyle(note).padding).toBe('12px');
  },
};

export const AppearsAndLeaves: Story = {
  render: () => ({
    props: { shown: false },
    template: `
      <button type="button" class="text-label" (click)="shown = !shown">Toggle</button>
      <div class="mt-3 w-[340px]">
        @if (shown) {
          <ui-alert variant="warning">You’re selling the whole holding. This can’t be undone.</ui-alert>
        }
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: 'The alert fades in when it appears and fades out when it is removed.' } },
  },
};

const appearing = (fadeIn: boolean): Story => ({
  render: () => ({
    props: { shown: false, fadeIn },
    template: `
      <div style="max-width: 342px" class="flex flex-col gap-3">
        <button type="button" class="rounded-control border border-(--border) px-4 py-2" (click)="shown = true">Sign in</button>
        @if (shown) {
          <ui-alert [fadeIn]="fadeIn">Incorrect username or password.</ui-alert>
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));

    const alert = await canvas.findByRole('alert');
    await expect(getComputedStyle(alert).animationName).toBe(fadeIn ? 'cairn-fade-in' : 'none');
  },
});

export const FadesInAfterASubmit: Story = { name: 'Fades in after a submit', ...appearing(true) };

export const ShowsAtOnceWithoutFadeIn: Story = { name: 'Shows at once with fadeIn off', ...appearing(false) };
