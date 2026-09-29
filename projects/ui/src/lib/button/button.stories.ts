import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { BUTTON_SIZES, BUTTON_VARIANTS, type ButtonSize, type ButtonVariant, UiButton } from './button';

type ButtonArgs = {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  loading: boolean;
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
* \`size="md"\` is the 40/44px touch target Cairn applies everywhere: 40px under a mouse
  (\`pointer: fine\`), 44px on a touch screen.
* \`size="icon"\` has no visible text: it still needs a name of its own, through \`aria-label\`.
* A \`loading\` button is marked \`aria-busy\` and \`aria-disabled\`, stays focusable, and swallows a
  click instead of letting a slow first response turn into a double submission.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<button ui-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading" (click)="onClick()">{{ label }}</button>`,
  }),
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    label: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...BUTTON_VARIANTS],
      description:
        'How much emphasis the action carries. `primary` for the expected action, `destructive` for an irreversible one, `outline` and `ghost` for everything else.',
    },
    size: {
      control: 'select',
      options: [...BUTTON_SIZES],
      description:
        '`md` is the 40/44px touch target used everywhere by default. `lg` (44px) and `xl` (50px) are deliberate exceptions; `icon` is square and needs an `aria-label`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Native `disabled`, so the button leaves the tab order instead of only looking inactive.',
    },
    loading: {
      control: 'boolean',
      description: 'Marks the button busy, keeps its width, and blocks a second click while an action is in flight.',
    },
    label: { control: 'text', description: 'Projected text content.' },
    onClick: { action: 'onClick', table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary: Story = {};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const ExtraLarge: Story = {
  args: { size: 'xl' },
};

export const Icon: Story = {
  args: { size: 'icon', label: '' },
  render: (args) => ({
    props: args,
    template: `
      <button ui-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading" (click)="onClick()" aria-label="More actions">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true, label: 'Sell' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Sell/ });

    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  },
};

export const States: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <button ui-button [variant]="variant">Rest</button>
        <button ui-button [variant]="variant" disabled>Disabled</button>
        <button ui-button [variant]="variant" loading>Loading</button>
      </div>
    `,
  }),
};

export const EmitsClicks: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Button' }));

    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
