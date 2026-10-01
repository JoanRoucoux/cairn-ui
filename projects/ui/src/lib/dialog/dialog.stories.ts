import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiButton } from '../button/button';
import { type DialogWidth, UiDialog } from './dialog';

type DialogArgs = {
  heading: string;
  description?: string;
  closeLabel?: string;
  width: DialogWidth | (string & {});
  open: boolean;
};

const meta: Meta<DialogArgs> = {
  title: 'Surfaces/Dialog',
  decorators: [moduleMetadata({ imports: [UiButton, UiDialog] })],
  parameters: {
    docs: {
      description: {
        component: `Modal dialog built on the native \`<dialog>\`. The focus trap, the return of focus to the
trigger, closing on Escape and the top layer all come from the platform rather than from custom
JavaScript.

Under \`64rem\` it rises from the bottom as a sheet, with a drag handle, 16px padding and its footer
clear of the home indicator; above that width it is centered with 24px padding. Its body scrolls on
its own when the content is taller than the screen, so the header and the footer stay in place.

The header carries the title, an optional subtitle (\`description\`) and a close cross, which exists
only when the consumer passes \`closeLabel\`. The width is set by the consumer: \`md\`, \`lg\` or any CSS
length (Acheter 530px, Nouveau compte 528px, Ajouter une ligne 560px, Supprimer la clé 488px).

Layout inputs: \`align\` (\`start\` hangs the cross beside a title that may carry a subtitle, \`center\` centres title and cross), \`divided\` (a hairline above the footer, used by the fixed-footer dialogs), \`role\` (\`alertdialog\` for confirmations) and \`truncateDescription\` (one ellipsised line instead of wrapping). A click on the backdrop closes the dialog, like Escape.

The spacing of each screen is set with CSS custom properties on the host, with the handoff defaults: \`--dialog-top-lg\` (24px), \`--dialog-head-gap\` and \`-lg\` (8px, 20px: header to body), \`--dialog-foot-gap\` and \`-lg\` (16px, 20px: body to footer), \`--dialog-bottom\` (8px plus the safe area, which \`--dialog-safe\` can replace) and \`--dialog-bottom-lg\` (24px, 16px when divided), \`--dialog-title-top\`, \`--dialog-handle-top\` and \`--dialog-icon-lg\`. The stories carry the values of every screen.

Content goes in two slots: the default one for the body, and \`[dialogActions]\` for the footer
buttons. Put the dismissing action first. On a desktop the footer is right-aligned; on a sheet the
actions stack at full width and 50px, the primary on top, so hide Annuler there with
\`max-lg:hidden\` when the sheet has only the primary.

#### When to use

* When an answer is needed before anything else can continue, such as confirming a deletion.
* To edit a short, self contained form without leaving the current screen.

#### When not to use

* For a task the user repeats often. Interrupting the same flow again and again wears thin.
* For information that is not urgent, or that the user may want to keep visible while working.
* To hold a long form. If the content scrolls inside the dialog, it belongs on a screen.

#### Accessibility

* \`aria-labelledby\` and \`aria-describedby\` are wired from \`heading\` and \`description\`. Never set
  them by hand.
* Follows the [W3C dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) through
  the native element, including the initial focus move and the focus return on close.
* The close cross is named by \`closeLabel\`, which the consumer translates. Without it there is no
  cross, and Escape stays the way out.
* Every way out is handled the same: Escape, the cross, a dismissing button, and the owner setting
  \`open\` back to \`false\`.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <button ui-button (click)="open = true">Ouvrir</button>
      <ui-dialog
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <p class="text-label text-(--muted-foreground)">
          Le cours saisi remplace la dernière valeur connue jusqu'à la prochaine actualisation.
        </p>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Enregistrer</button>
      </ui-dialog>
    `,
  }),
  args: {
    heading: 'Saisir un cours',
    description: 'Ferrari · PEA',
    closeLabel: 'Fermer',
    width: '440px',
    open: false,
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Visible title, also wired as the accessible name via `aria-labelledby`.',
    },
    description: {
      control: 'text',
      description: 'Optional subtitle under the title, also wired as `aria-describedby`.',
    },
    closeLabel: {
      control: 'text',
      description: 'Accessible name of the close cross. The cross is shown only when this is set.',
    },
    width: {
      control: 'text',
      description: 'Max width of the dialog on a desktop: `md`, `lg` or any CSS length such as `530px`.',
    },
    open: { control: 'boolean', description: 'Controls `showModal()`/`close()` on the native `<dialog>`.' },
  },
};

export default meta;
type Story = StoryObj<DialogArgs>;

export const Closed: Story = {};

export const Opens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir' }));

    await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Saisir un cours' })).toBeVisible());
  },
};

export const CrossCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir' }));
    await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Saisir un cours' })).toBeVisible());
    await expect(canvas.getByRole('button', { name: 'Fermer' })).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'Fermer' }));

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Ouvrir' })).toHaveFocus();
  },
};

export const BackdropCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir' }));
    await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Saisir un cours' })).toBeVisible());
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: canvas.getByRole('dialog'),
      coords: { clientX: 4, clientY: 4 },
    });

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Ouvrir' })).toHaveFocus();
  },
};

const field = (label: string): string => `
  <div class="flex flex-col gap-1.5">
    <span class="text-label font-medium text-(--muted-foreground)">${label}</span>
    <div class="rounded-control bg-(--background) shadow-[inset_0_0_0_1px_var(--border)] h-12 lg:h-10"></div>
  </div>`;

const SAFE = '--dialog-safe: var(--story-safe, env(safe-area-inset-bottom))';

export const Board: Story = {
  name: 'Board, dialog (380px)',
  args: { heading: 'Vendre Ferrari', description: undefined, width: '380px', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        style="--dialog-top-lg: 20px; --dialog-head-gap-lg: 16px; --dialog-foot-gap-lg: 20px; --dialog-icon-lg: 20px"
        headerAlign="center"
        divided
        [heading]="heading"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <p class="text-label text-(--muted-foreground)">Contenu, défilant si besoin.</p>
        <button dialogActions ui-button variant="outline" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Vendre</button>
      </ui-dialog>
    `,
  }),
};

export const BoardSheet: Story = {
  name: 'Board, sheet (iPhone, no cross)',
  parameters: { viewport: { width: 390, height: 844 } },
  args: { heading: 'Acheter Ferrari', description: undefined, closeLabel: undefined, open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        style="--dialog-head-gap: 0px; --dialog-foot-gap: 0px; --dialog-bottom: 20px"
        headerAlign="center"
        divided
        [heading]="heading"
        [open]="open"
        (dismissed)="open = false"
      >
        <div style="height: 82px"></div>
        <button dialogActions ui-button (click)="open = false">Acheter 10 parts</button>
      </ui-dialog>
    `,
  }),
};

export const Trade: Story = {
  name: 'Acheter, dialog (530px) and sheet',
  args: { heading: 'Acheter', description: 'Ferrari · PEA', width: '530px', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        style="--dialog-head-gap: 12px; --dialog-safe: 0px; --dialog-bottom: 0px"
        truncateDescription
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <div class="flex flex-col gap-4" data-story-body>${field('Quantité')}${field('Prix unitaire')}</div>
        <div dialogActions class="-mx-4 mt-1 grid grid-cols-3 gap-1.5 bg-(--muted) p-1.5 pb-10 lg:hidden" data-story-keypad>
          <span class="text-center text-2xl">1</span><span class="text-center text-2xl">2</span><span class="text-center text-2xl">3</span>
        </div>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Acheter 40 parts</button>
      </ui-dialog>
    `,
  }),
};

export const NewAccount: Story = {
  name: 'Nouveau compte, dialog (528px) and sheet',
  args: { heading: 'Nouveau compte', description: undefined, width: '528px', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        style="--dialog-head-gap-lg: 16px; --dialog-foot-gap-lg: 20px; --dialog-bottom-lg: 20px; --dialog-foot-gap: 20px; --dialog-bottom: 12px; ${SAFE}"
        headerAlign="center"
        [heading]="heading"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <div class="flex flex-col gap-4" data-story-body>${field('Nom du compte')}${field('Enveloppe')}${field('Établissement (facultatif)')}</div>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Créer le compte</button>
      </ui-dialog>
    `,
  }),
};

export const AddLine: Story = {
  name: 'Ajouter une ligne, dialog (560px) and sheet',
  args: { heading: 'Ajouter une ligne', description: undefined, width: '560px', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        style="--dialog-top-lg: 20px; --dialog-head-gap-lg: 16px; --dialog-foot-gap-lg: 20px; ${SAFE}"
        headerAlign="center"
        divided
        [heading]="heading"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <div class="flex flex-col gap-4" data-story-body>${field('Compte')}${field('Titre')}</div>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Ajouter la ligne</button>
      </ui-dialog>
    `,
  }),
};

export const DeletePasskey: Story = {
  name: 'Supprimer la clé, alertdialog (488px) and sheet',
  args: {
    heading: 'Supprimer la clé « MacBook Air » ?',
    description: undefined,
    closeLabel: undefined,
    width: '488px',
    open: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        style="--dialog-head-gap-lg: 12px; --dialog-foot-gap-lg: 24px; --dialog-handle-top: 11.5px; --dialog-title-top: 12px; --dialog-head-gap: 12px; --dialog-foot-gap: 20px; ${SAFE}"
        headerAlign="center"
        role="alertdialog"
        [heading]="heading"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <p class="text-body text-(--muted-foreground)" data-story-body>
          Cet appareil ne pourra plus se connecter à Cairn avec cette clé. Les autres clés restent valables.
        </p>
        <button dialogActions ui-button variant="outline" (click)="open = false">Annuler</button>
        <button dialogActions ui-button variant="destructive" (click)="open = false">Supprimer la clé</button>
      </ui-dialog>
    `,
  }),
};

export const Wide: Story = {
  args: { width: 'lg', open: true },
};

export const SheetOnAnIPhone: Story = {
  name: 'Sheet on a 390px viewport',
  parameters: {
    viewport: { width: 390, height: 844 },
  },
  render: (args) => ({
    props: { ...args, rows: Array.from({ length: 60 }, (_, index) => index + 1) },
    template: `
      <ui-dialog
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [open]="true"
        (dismissed)="open = false"
      >
        @for (row of rows; track row) {
          <p class="text-label text-(--muted-foreground)">Ligne {{ row }} d'un corps plus haut que l'écran.</p>
        }
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Acheter 10 parts</button>
      </ui-dialog>
    `,
  }),
  args: { heading: 'Acheter Ferrari', open: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole('dialog', { name: 'Acheter Ferrari' });
    const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;
    const body = dialog.querySelector('[data-dialog-body]') as HTMLElement;
    const primary = canvas.getByRole('button', { name: 'Acheter 10 parts' });

    await waitFor(() => expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight));
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await expect(primary.getBoundingClientRect().height).toBe(50);
  },
};
