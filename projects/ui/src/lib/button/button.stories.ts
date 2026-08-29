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
  title: 'Inputs/Button',
  decorators: [moduleMetadata({ imports: [UiButton] })],
  parameters: {
    docs: {
      description: {
        component: `Clickable element that triggers an action. Its variant tells the user how consequential
that action is, so a screen reads at a glance.

#### When to use

* For any action taken on the current screen: submitting a form, opening a dialog, refreshing quotes.
* On an \`<a>\`, only when the action genuinely is a navigation the browser performs itself, such as a
  file download.

#### When not to use

* For ordinary navigation between screens. A link should look like a link, and its role should stay
  a link.
* More than one \`primary\` per screen. If every action is emphasised, none of them is.
* For a destructive action without a confirmation step. Pair \`destructive\` with a dialog.

#### Accessibility

* The host stays a native \`<button>\` or \`<a>\`, so focus, activation with Enter or Space, and the
  disabled state all come from the platform rather than from an ARIA imitation.
* \`size="md"\` is the 44px touch target Cairn applies everywhere. Drop to \`sm\` only where the
  surrounding density genuinely requires it.
* A button labelled only by an icon still needs a name of its own, through visually hidden text or
  \`aria-label\`.`,
      },
    },
  },
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
    variant: {
      control: 'select',
      options: [...BUTTON_VARIANTS],
      description:
        'How much emphasis the action carries. `primary` for the expected action, `destructive` for an irreversible one, `secondary`, `outline` and `ghost` for everything else.',
    },
    size: {
      control: 'select',
      options: [...BUTTON_SIZES],
      description: '`md` is the 44px touch target used everywhere by default. `sm` and `lg` are deliberate exceptions.',
    },
    disabled: {
      control: 'boolean',
      description: 'Native `disabled`, so the button leaves the tab order instead of only looking inactive.',
    },
    label: { control: 'text', description: 'Projected text content.' },
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
