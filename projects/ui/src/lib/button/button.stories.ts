import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { BUTTON_SIZES, BUTTON_VARIANTS, type ButtonSize, type ButtonVariant, UiButton } from './button';

type ButtonArgs = {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  label: string;
  onClick: () => void;
};

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  decorators: [moduleMetadata({ imports: [UiButton] })],
  render: (args) => ({
    props: args,
    template: `<button ui-button [variant]="variant" [size]="size" [disabled]="disabled" (click)="onClick()">{{ label }}</button>`,
  }),
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    label: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: [...BUTTON_VARIANTS] },
    size: { control: 'select', options: [...BUTTON_SIZES] },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    onClick: { action: 'onClick', table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const EmitsClicks: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Button' }));

    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
