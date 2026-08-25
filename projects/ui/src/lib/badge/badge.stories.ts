import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { BADGE_VARIANTS, type BadgeVariant, UiBadge } from './badge';

type BadgeArgs = {
  variant: BadgeVariant;
  label: string;
};

const meta: Meta<BadgeArgs> = {
  title: 'Components/Badge',
  decorators: [moduleMetadata({ imports: [UiBadge] })],
  render: (args) => ({
    props: args,
    template: `<ui-badge [variant]="variant">{{ label }}</ui-badge>`,
  }),
  args: {
    variant: 'primary',
    label: 'Badge',
  },
  argTypes: {
    variant: { control: 'select', options: [...BADGE_VARIANTS] },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
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
