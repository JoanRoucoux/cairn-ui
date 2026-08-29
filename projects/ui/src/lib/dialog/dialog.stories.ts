import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiButton } from '../button/button';
import { DIALOG_WIDTHS, type DialogWidth, UiDialog } from './dialog';

type DialogArgs = {
  heading: string;
  width: DialogWidth;
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

Content goes in two slots: the default one for the body, and \`[dialogActions]\` for the footer
buttons. Put the dismissing action first, so it sits on the left.

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
* Every way out is handled the same: Escape, a dismissing button, and the owner setting \`open\` back
  to \`false\`.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <button ui-button (click)="open = true">Ouvrir</button>
      <ui-dialog [heading]="heading" [width]="width" [open]="open" (dismissed)="open = false">
        <p class="text-sm text-(--muted-foreground)">
          Le cours saisi remplace la derniere valeur connue jusqu'au prochain rafraichissement.
        </p>
        <button dialogActions ui-button variant="outline" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Enregistrer</button>
      </ui-dialog>
    `,
  }),
  args: {
    heading: 'Saisir un cours',
    width: 'md',
    open: false,
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Visible title, also wired as the accessible name via `aria-labelledby`.',
    },
    width: { control: 'inline-radio', options: [...DIALOG_WIDTHS], description: 'Max width of the dialog panel.' },
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

    await expect(canvas.getByRole('dialog', { name: 'Saisir un cours' })).toBeVisible();
  },
};

export const Wide: Story = {
  args: { width: 'lg', open: true },
};
