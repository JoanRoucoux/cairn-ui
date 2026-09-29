import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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

Under \`64rem\` it rises from the bottom as a sheet, with a drag handle and its footer clear of the
home indicator; above that width it is centered. Its body scrolls on its own when the content is
taller than the screen, so the heading and the footer stay in place.

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
        <p class="text-label text-(--muted-foreground)">
          The price you enter replaces the last known value until the next refresh.
        </p>
        <button dialogActions ui-button variant="outline" (click)="open = false">Cancel</button>
        <button dialogActions ui-button (click)="open = false">Save</button>
      </ui-dialog>
    `,
  }),
  args: {
    heading: 'Enter a price',
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

    await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Enter a price' })).toBeVisible());
  },
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
      <ui-dialog [heading]="heading" [open]="true" (dismissed)="open = false">
        @for (row of rows; track row) {
          <p class="text-label text-(--muted-foreground)">Row {{ row }} of a body taller than the screen.</p>
        }
        <button dialogActions ui-button variant="outline" (click)="open = false">Cancel</button>
        <button dialogActions ui-button (click)="open = false">Save</button>
      </ui-dialog>
    `,
  }),
  args: { open: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole('dialog', { name: 'Enter a price' });
    const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;
    const body = dialog.querySelector('[data-dialog-body]') as HTMLElement;

    await waitFor(() => expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight));
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  },
};
