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

* The \`error\` variant is \`role="alert"\`, announced as soon as it appears. The \`warning\` variant has no
  role: a live role inserted with its text is never read, so a warning that appears after the page
  opened (\`fadeIn\`, the default) announces its heading and text once, politely, through a shared live region.
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

export const Default: Story = {};

export const TextOnly: Story = {
  args: { heading: '', text: 'Incorrect username or password.' },
};

const warningArgs: Partial<AlertArgs> = {
  variant: 'warning',
  heading: '',
  text: 'You’re selling the whole quantity: the holding will be removed from Northwind PEA. This can’t be undone.',
};

const infoArgs: Partial<AlertArgs> = {
  variant: 'info',
  heading: '',
  text: 'Cairn can’t verify this ISIN before it’s added. The price will come with the next SG Sirius update; if the ISIN is wrong, the holding will stay without a price.',
};

export const Warning: Story = { args: warningArgs };

export const Info: Story = { args: infoArgs };

export const InfoNotePadding: Story = {
  tags: ['!dev', '!autodocs'],
  args: infoArgs,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const note = await canvas.findByRole('note');

    await waitFor(() => expect(note).toBeVisible());
    await expect(getComputedStyle(note).padding).toBe('12px');
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

export const FadesInAfterASubmit: Story = {
  tags: ['!dev', '!autodocs'],
  name: 'Fades in after a submit',
  ...appearing(true),
};

export const ShowsAtOnceWithoutFadeIn: Story = {
  tags: ['!dev', '!autodocs'],
  name: 'Shows at once with fadeIn off',
  ...appearing(false),
};
