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
length (530px for a trade, 460px to add a line, 440px for a new account).

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
    await userEvent.click(canvas.getByRole('button', { name: 'Fermer' }));

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Ouvrir' })).toHaveFocus();
  },
};

export const Trade: Story = {
  name: 'Dialog, trade (530px)',
  args: { heading: 'Acheter', description: 'Ferrari · PEA', width: '530px', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <p class="text-label text-(--muted-foreground)">Quantité et prix unitaire.</p>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Acheter 40 parts</button>
      </ui-dialog>
    `,
  }),
};

export const NewAccount: Story = {
  name: 'Dialog, new account (440px)',
  args: { heading: 'Nouveau compte', description: undefined, width: '440px', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog [heading]="heading" [closeLabel]="closeLabel" [width]="width" [open]="open" (dismissed)="open = false">
        <p class="text-label text-(--muted-foreground)">Nom du compte, enveloppe et établissement.</p>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Créer le compte</button>
      </ui-dialog>
    `,
  }),
};

export const AddLine: Story = {
  name: 'Dialog, add a line (460px)',
  args: { heading: 'Ajouter une ligne', description: 'PEA Boursorama', width: '460px', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <p class="text-label text-(--muted-foreground)">Un seul champ, Titre : un nom ou un ISIN.</p>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Ajouter la ligne</button>
      </ui-dialog>
    `,
  }),
};

export const Destructive: Story = {
  name: 'Dialog, destructive primary (440px)',
  args: {
    heading: 'Supprimer la clé « iPhone de Joan » ?',
    description: undefined,
    closeLabel: undefined,
    width: '440px',
    open: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog [heading]="heading" [width]="width" [open]="open" (dismissed)="open = false">
        <p class="text-body text-(--muted-foreground)">
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
