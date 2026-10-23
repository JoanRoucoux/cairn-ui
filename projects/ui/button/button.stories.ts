import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { BUTTON_SIZES, BUTTON_VARIANTS, type ButtonSize, type ButtonVariant, UiButton } from './button';

type ButtonArgs = {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  loading: boolean;
  busy: boolean;
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
* More than one \`primary\` per screen. If every action is emphasized, none of them is.
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
    template: `<button ui-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading" [busy]="busy" (click)="onClick()">{{ label }}</button>`,
  }),
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    busy: false,
    label: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...BUTTON_VARIANTS],
      description:
        'How much emphasis the action carries. `primary` for the expected action, `destructive` for an irreversible one, `outline` and `ghost` for everything else. `quiet` is a muted icon button that fills `--soft` on hover and press (row actions). `quiet-glow` is the same icon button hovering to `--glow` with no press fill (a close cross). `quiet-destructive` turns negative on hover. `outline-destructive` is an outline with negative text. `tonal` is a filled `--muted` pill that becomes a plain text button with a glow hover from 64rem.',
    },
    size: {
      control: 'select',
      options: [...BUTTON_SIZES],
      description:
        '`md` is the 40/44px touch target used everywhere by default. `xs` (32px), `sm` (36px), `lg` (44px) and `xl` (50px) are fixed heights. `compact` (32px, 28px from 64rem), `slim` (44px, then 32px), `xxl` (52px, then 44px), `tall` (48px, then 40px) and `block` (50px, then 44px) step down at 64rem. `icon` is square and `icon-sm` is 44px on touch, 36px with a mouse; both need an `aria-label`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Native `disabled`, so the button leaves the tab order instead of only looking inactive.',
    },
    loading: {
      control: 'boolean',
      description: 'Marks the button busy, keeps its width, and blocks a second click while an action is in flight.',
    },
    busy: {
      control: 'boolean',
      description:
        'Marks the button busy like `loading`, without the spinner: the label alone says what is happening (“Signing in…”).',
    },
    label: { control: 'text', description: 'Projected text content.' },
    onClick: { action: 'onClick', table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

const ICON_DOTS = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>`;
const ICON_PLUS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M12 5v14" /></svg>`;

export const Default: Story = {};

export const Primary: Story = {
  name: 'Press and hover transitions',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByRole('button', { name: 'Button' }));

    await waitFor(() => expect(style.transitionProperty).toBe('scale, background-color'));
    await expect(style.transitionDuration).toBe('0.12s, 0.18s');
  },
};

export const Variants: Story = {
  render: (args) => ({
    props: { ...args, variants: [...BUTTON_VARIANTS] },
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        @for (item of variants; track item) {
          @if (item.startsWith('quiet')) {
            <button ui-button [variant]="item" size="icon-sm" [attr.aria-label]="item">${ICON_DOTS}</button>
          } @else {
            <button ui-button [variant]="item" [size]="size" [disabled]="disabled">{{ item }}</button>
          }
        }
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: [...BUTTON_SIZES] },
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        @for (item of sizes; track item) {
          @if (item.startsWith('icon')) {
            <button ui-button [variant]="variant" [size]="item" [attr.aria-label]="item">${ICON_DOTS}</button>
          } @else {
            <button ui-button [variant]="variant" [size]="item" [disabled]="disabled">{{ item }}</button>
          }
        }
      </div>
    `,
  }),
};

export const WithLeadingIcon: Story = {
  args: { label: 'Add a holding' },
  render: (args) => ({
    props: args,
    template: `<button ui-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading" [busy]="busy" (click)="onClick()">${ICON_PLUS}{{ label }}</button>`,
  }),
};

export const Icon: Story = {
  args: { size: 'icon', label: 'More actions' },
  render: (args) => ({
    props: args,
    template: `<button ui-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading" [busy]="busy" (click)="onClick()" [attr.aria-label]="label">${ICON_DOTS}</button>`,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true, label: 'Sell' },
};

export const LoadingSpinner: Story = {
  name: 'Loading hides the label and spins',
  tags: ['!dev', '!autodocs'],
  args: { loading: true, label: 'Sell' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Sell/ });

    await expect(getComputedStyle(button.querySelector('[aria-hidden="true"]')!).animationName).toBe('cairn-spin');
    await expect(getComputedStyle(canvas.getByText('Sell')).color).toBe('rgba(0, 0, 0, 0)');
  },
};
