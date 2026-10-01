import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

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
        'Marks the button busy like `loading`, without the spinner: the label alone says what is happening ("Connexion...").',
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

export const ExtraExtraLarge: Story = {
  args: { size: 'xxl' },
  render: (args) => ({
    props: args,
    template: `<button ui-button [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading" class="w-[320px]">{{ label }}</button>`,
  }),
};

export const WithLeadingIcon: Story = {
  args: { label: 'Ajouter une ligne' },
  render: (args) => ({
    props: args,
    template: `
      <button ui-button [variant]="variant" [size]="size">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        {{ label }}
      </button>
    `,
  }),
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

const ICON_DOTS = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>`;
const ICON_LOGOUT = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>`;
const ICON_TRASH = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>`;

export const SmallActions: Story = {
  name: 'Small actions (Comptes panel)',
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <button ui-button variant="outline" size="sm">Ajouter une ligne</button>
        <button ui-button variant="ghost" size="sm">Importer un CSV</button>
        <button ui-button variant="outline" size="xs">Saisir un cours</button>
      </div>
    `,
  }),
};

export const QuietIcons: Story = {
  name: 'Quiet icon buttons (44 touch, 36 mouse)',
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <button ui-button variant="quiet" size="icon-sm" aria-label="Actions du compte">${ICON_DOTS}</button>
        <button ui-button variant="quiet-destructive" size="icon-sm" aria-label="Supprimer">${ICON_TRASH}</button>
      </div>
    `,
  }),
};

export const OutlineDestructive: Story = {
  name: 'Outline destructive (Profil, 50 then 44)',
  render: () => ({
    template: `
      <button ui-button variant="outline-destructive" size="block" class="w-[320px]">
        ${ICON_LOGOUT}
        Se déconnecter
      </button>
    `,
  }),
};

export const TonalCompact: Story = {
  name: 'Tonal compact (Tout vendre)',
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-end; width: 320px;">
        <span class="text-label text-(--muted-foreground)">Vous détenez 500 parts</span>
        <button ui-button variant="tonal" size="compact" class="-mr-1">Tout vendre</button>
      </div>
    `,
  }),
};

const ICON_HOME = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>`;

export const ResponsiveSizes: Story = {
  name: 'Sizes that step down at 64rem (404, sign-in, Profil)',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; width: 320px;">
        <a ui-button size="xxl" href="#">${ICON_HOME}Revenir au portefeuille</a>
        <button ui-button size="tall" variant="ghost">Utiliser plutôt une clé d'accès</button>
        <button ui-button size="block" variant="outline">Exporter</button>
      </div>
    `,
  }),
};

export const Busy: Story = {
  args: { busy: true, label: 'En attente de la clé...', size: 'xxl' },
  render: (args) => ({
    props: args,
    template: `
      <button ui-button [variant]="variant" [size]="size" [busy]="busy" class="w-[320px]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
        {{ label }}
      </button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /En attente/ });

    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(canvasElement.querySelector('[class*="animate-spin"]')).toBeNull();
  },
};

export const DetailBar: Story = {
  name: 'Detail action bar (Lignes iPhone, 48 px)',
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 340px;">
        <button ui-button variant="outline" size="tall">Vendre</button>
        <button ui-button size="tall">Acheter</button>
      </div>
    `,
  }),
};

export const CloseCross: Story = {
  name: 'Close cross (Lignes desktop detail, 36 px)',
  render: () => ({
    template: `
      <button ui-button variant="quiet-glow" size="icon-sm" aria-label="Fermer le détail">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>
    `,
  }),
};

export const SlimChange: Story = {
  name: 'Slim ghost (Changer)',
  render: () => ({
    template: `<button ui-button variant="ghost" size="slim" type="button">Changer</button>`,
  }),
};
