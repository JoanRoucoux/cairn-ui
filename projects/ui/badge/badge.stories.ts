import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { BADGE_SIZES, BADGE_VARIANTS, type BadgeSize, type BadgeVariant, UiBadge } from './badge';

type BadgeArgs = {
  variant: BadgeVariant;
  size: BadgeSize;
  label: string;
};

const meta: Meta<BadgeArgs> = {
  title: 'Data display/Badge',
  decorators: [moduleMetadata({ imports: [UiBadge] })],
  parameters: {
    docs: {
      description: {
        component: `Small descriptor that labels the thing next to it, such as a source's sync status or an
account's envelope type.

#### When to use

* To qualify a row or a heading with a short, stable piece of metadata.
* When the label is a single word or two. A badge is read at a glance, not parsed.

#### When not to use

* For a signed figure that moves, such as a gain or a loss. Use [Delta](?path=/docs/data-display-delta--docs).
* For a message the user has to act on. A badge is a label, not a notification.

#### Accessibility

* Always give the badge text. Its variant color is a reinforcement, never the only signal for the
  state it names.
* The badge is inert. Nothing inside it should be focusable or clickable.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-badge [variant]="variant" [size]="size">{{ label }}</ui-badge>`,
  }),
  args: {
    variant: 'neutral',
    size: 'md',
    label: 'Badge',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...BADGE_VARIANTS],
      description:
        '`neutral` sits on the `--muted` surface. `outline` is quieter still, for a state that should not compete with the content around it.',
    },
    size: {
      control: 'select',
      options: [...BADGE_SIZES],
      description: '`md` is 24 px high, `sm` 22 px for dense rows.',
    },
    label: { control: 'text', description: 'Projected text content.' },
  },
};

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Neutral: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const RendersContent: Story = {
  args: { label: 'New' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(args.label)).toBeVisible();
  },
};
