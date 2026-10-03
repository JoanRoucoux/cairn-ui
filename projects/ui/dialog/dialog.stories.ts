import { UiButton } from '@joanroucoux/cairn-ui/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type DialogLayout, type DialogWidth, UiDialog } from './dialog';
import {
  addLineTemplate,
  bodyReachable,
  defaultTemplate,
  desktopAnchored,
  dialogArgTypes,
  field,
  keptMountedTemplate,
  keptMountedUntilClosed,
  pressCross,
  sheetFitsTheScreen,
  sheetHasGrips,
  sheetStaysFixed,
} from './internal/dialog-story-fixtures';

type DialogArgs = {
  heading: string;
  description?: string;
  closeLabel?: string;
  width: DialogWidth | (string & {});
  layout?: DialogLayout;
  open: boolean;
  busy?: boolean;
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
length (Acheter 528px, Nouveau compte 528px, Ajouter une ligne 560px, Supprimer la clé 488px).

The \`layout\` input picks the spacing of a screen family, so a consumer sets \`layout\` and \`width\` at most: \`trade\` (default, Acheter and Vendre: start-aligned header, the cross hangs beside the title and subtitle), \`form\` (Nouveau compte: centred header), \`list\` (Ajouter une ligne and the board: centred header, hairline above the footer, and a sheet of fixed height, \`100dvh - 58px\`, so the footer stays pinned while the results change; 760px at most on a desktop) and \`confirm\` (a confirmation such as deleting a passkey: announced as an alertdialog, with the delete spacing). \`truncateDescription\` keeps the subtitle on one ellipsised line instead of wrapping. A click that starts and ends on the backdrop closes the dialog, like Escape.

Content goes in two slots: the default one for the body, and \`[dialogActions]\` for the footer
buttons. Put the dismissing action first. On a desktop the footer is right-aligned; on a sheet the
actions stack at full width and 50px, the primary on top, so hide Annuler there with
\`max-lg:hidden\` when the sheet has only the primary.

Every way out goes through one close: Escape, the backdrop, the cross, a drag of the sheet and the
owner setting \`open\` back to \`false\`. \`dismissed\` fires at once for a close the reader started, never
for one the owner asked for. \`closed\` fires once per close, after the exit transition has played,
with what started it: \`escape\`, \`backdrop\`, \`cross\`, \`drag\` or \`programmatic\`. When there is no
transition to wait for, it fires at once. Reopening during the exit, or destroying the dialog, drops it.

A consumer that mounts the dialog under \`@if\` keeps it mounted until \`closed\`. It sets \`open\` to
\`false\` (on \`dismissed\`, or after a save), and only removes the wrapper and reports to its own
parent in \`(closed)\`. Removing the wrapper together with \`open = false\`, or on \`dismissed\`, cuts the
exit: the \`<dialog>\` leaves the page before the exit has played.

\`\`\`html
@if (selling()) {
  <ui-dialog heading="Vendre" [open]="open()" (dismissed)="open.set(false)" (closed)="selling.set(false); sold.emit()">
    ...
  </ui-dialog>
}
\`\`\`

On a desktop the dialog fades and scales up from \`--enter-scale\` in \`--duration-base\` and leaves in
\`--duration-exit\`, on \`--ease-out\`. As a sheet the panel only slides, from \`translateY(100%)\`, on
\`--ease-sheet\`, while the veil fades. The handle and the header of a sheet can be dragged down: the
panel follows the finger, closes past 30 % of its height or on a release faster than 0.5 px/ms, and
otherwise springs back on \`--ease-sheet\` in \`--duration-base\`. The body scrolls and never drags.

\`busy\` keeps the dialog open while its action runs, so the outcome stays on screen: Escape, a click on the
backdrop and a drag of the sheet do nothing, the cross is disabled and the dialog carries \`aria-busy\`. The
owner disables its own buttons and still closes it by setting \`open\` to \`false\`.
With \`prefers-reduced-motion: reduce\` the sheet fades instead of sliding.

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
* Every way out is handled the same: Escape, the cross, the backdrop, a drag of the sheet and the
  owner setting \`open\` back to \`false\`.`,
      },
    },
  },
  render: (args) => ({ props: args, template: defaultTemplate }),
  args: {
    heading: 'Saisir un cours',
    description: 'Ferrari · PEA',
    closeLabel: 'Fermer',
    layout: 'trade',
    width: '440px',
    open: false,
    busy: false,
  },
  argTypes: dialogArgTypes,
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
    await pressCross(canvas.getByRole('button', { name: 'Fermer' }));

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

export const BusyStaysOpen: Story = {
  args: { open: true, busy: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole('dialog', { name: 'Saisir un cours' });

    await expect(dialog).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('button', { name: 'Fermer' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await userEvent.pointer({ keys: '[MouseLeft]', target: dialog, coords: { clientX: 4, clientY: 4 } });

    await expect(dialog).toHaveAttribute('open');
  },
};

export const Board: Story = {
  name: 'Board, dialog (380px)',
  args: { heading: 'Vendre Ferrari', description: undefined, width: '380px', layout: 'list', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        [heading]="heading"
        [closeLabel]="closeLabel"
        [layout]="layout"
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
  parameters: { viewport: { width: 390, height: 270 } },
  args: { heading: 'Acheter Ferrari', description: undefined, closeLabel: undefined, layout: 'list', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog [heading]="heading" [layout]="layout" [open]="open" (dismissed)="open = false">
        <button dialogActions ui-button (click)="open = false">Acheter 10 parts</button>
      </ui-dialog>
    `,
  }),
};

export const Trade: Story = {
  name: 'Acheter, dialog (528px) and sheet',
  args: { heading: 'Acheter', description: 'Ferrari · PEA', width: '528px', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        truncateDescription
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <div class="flex flex-col gap-4" data-story-body>${field('Quantité')}${field('Prix unitaire')}</div>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Acheter 40 parts</button>
      </ui-dialog>
    `,
  }),
};

export const NewAccount: Story = {
  name: 'Nouveau compte, dialog (528px) and sheet',
  args: { heading: 'Nouveau compte', description: undefined, width: '528px', layout: 'form', open: true },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog
        [heading]="heading"
        [closeLabel]="closeLabel"
        [layout]="layout"
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

const addLine = (results: number): Story => ({
  args: { heading: 'Ajouter une ligne', description: undefined, width: '560px', layout: 'list', open: true },
  render: (args) => ({
    props: args,
    template: addLineTemplate(results),
  }),
});

export const AddLine: Story = { name: 'Ajouter une ligne, dialog (560px) and sheet', ...addLine(2) };

export const AddLineDesktopFewResults: Story = {
  name: 'Ajouter une ligne, desktop 1440x900 with few results',
  parameters: { viewport: { width: 1440, height: 900 } },
  ...addLine(2),
  play: desktopAnchored,
};

export const AddLineDesktopManyResultsShortScreen: Story = {
  name: 'Ajouter une ligne, desktop 1366x650 with many results',
  parameters: { viewport: { width: 1366, height: 650 } },
  ...addLine(30),
  play: desktopAnchored,
};

export const AddLineSheetFewResults: Story = {
  name: 'Ajouter une ligne, sheet with few results',
  parameters: { viewport: { width: 390, height: 844 } },
  ...addLine(1),
  play: sheetStaysFixed,
};

export const AddLineSheetManyResults: Story = {
  name: 'Ajouter une ligne, sheet with many results',
  parameters: { viewport: { width: 390, height: 844 } },
  ...addLine(30),
  play: sheetStaysFixed,
};

export const DeletePasskey: Story = {
  name: 'Supprimer la clé, alertdialog (488px) and sheet',
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('dialog')?.getAttribute('aria-describedby')).toBeTruthy();
  },
  args: {
    heading: 'Supprimer la clé « MacBook Air » ?',
    description: undefined,
    closeLabel: undefined,
    width: '488px',
    layout: 'confirm',
    open: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-dialog [heading]="heading" [layout]="layout" [width]="width" [open]="open" (dismissed)="open = false">
        <p class="text-body text-(--muted-foreground)" data-story-body>
          Cet appareil ne pourra plus se connecter à Cairn avec cette clé. Les autres clés restent valables.
        </p>
        <button dialogActions ui-button variant="outline" (click)="open = false">Annuler</button>
        <button dialogActions ui-button variant="destructive" (click)="open = false">Supprimer la clé</button>
      </ui-dialog>
    `,
  }),
};

export const TextOnlyScrollingBody: Story = {
  name: 'Text-only body that scrolls (keyboard reachable)',
  parameters: { viewport: { width: 390, height: 420 } },
  args: { heading: 'Conditions', closeLabel: 'Fermer', layout: 'confirm', width: '488px', open: true },
  render: (args) => ({
    props: { ...args, paragraphs: Array.from({ length: 12 }, (_, index) => index + 1) },
    template: `
      <ui-dialog [heading]="heading" [closeLabel]="closeLabel" [layout]="layout" [width]="width" [open]="open" (dismissed)="open = false">
        @for (paragraph of paragraphs; track paragraph) {
          <p class="text-body text-(--muted-foreground)">
            Le cours saisi remplace la dernière valeur connue jusqu'à la prochaine actualisation de la source.
          </p>
        }
        <button dialogActions ui-button (click)="open = false">Compris</button>
      </ui-dialog>
    `,
  }),
  play: bodyReachable,
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
          <button type="button" class="flex w-full rounded-control px-3 py-2 text-left text-label hover:bg-(--glow)">Ligne {{ row }} d'un corps plus haut que l'écran.</button>
        }
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Acheter 10 parts</button>
      </ui-dialog>
    `,
  }),
  args: { heading: 'Acheter Ferrari', open: true },
  play: sheetFitsTheScreen,
};

export const KeptMountedUntilClosed: Story = {
  name: 'Wrapper kept mounted until closed',
  render: (args) => ({
    props: { ...args, mounted: false, closedCount: 0, closedReason: '' },
    template: keptMountedTemplate,
  }),
  play: keptMountedUntilClosed,
};

export const SheetDragToDismiss: Story = {
  ...KeptMountedUntilClosed,
  name: 'Sheet, drag to dismiss',
  parameters: { viewport: { width: 390, height: 844 } },
  play: sheetHasGrips,
};
