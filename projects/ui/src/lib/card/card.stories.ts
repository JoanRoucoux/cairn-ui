import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CARD_PADDINGS, CARD_VARIANTS, type CardPadding, type CardVariant, UiCard } from './card';

type CardArgs = {
  variant: CardVariant;
  padding: CardPadding;
  label: string;
};

const meta: Meta<CardArgs> = {
  title: 'Components/Card',
  decorators: [moduleMetadata({ imports: [UiCard] })],
  render: (args) => ({
    props: args,
    template: `<ui-card [variant]="variant" [padding]="padding">{{ label }}</ui-card>`,
  }),
  args: {
    variant: 'default',
    padding: 'md',
    label: 'Total portfolio value',
  },
  argTypes: {
    variant: { control: 'select', options: [...CARD_VARIANTS] },
    padding: { control: 'select', options: [...CARD_PADDINGS] },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Default: Story = {};

export const Elevated: Story = {
  args: { variant: 'elevated' },
};

export const Flush: Story = {
  args: { padding: 'none' },
};

export const RendersContent: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(args.label)).toBeVisible();
  },
};
