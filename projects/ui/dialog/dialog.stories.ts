import { UiButton } from '@joanroucoux/cairn-ui/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type DialogSheet, type DialogVariant, type DialogWidth, UiDialog } from './dialog';
import {
  addHoldingTemplate,
  bodyReachable,
  confirmTemplate,
  defaultTemplate,
  desktopCentered,
  dialogArgTypes,
  emptyFooterUnpadded,
  headerCentered,
  headerTopped,
  keptMountedTemplate,
  keptMountedUntilClosed,
  newAccountTemplate,
  pressCross,
  sheetFitsTheScreen,
  sheetHasGrips,
  sheetStaysFixed,
  tradeTemplate,
} from './internal/dialog-story-fixtures';

type DialogArgs = {
  heading: string;
  description?: string;
  closeLabel?: string;
  width?: DialogWidth | (string & {});
  variant?: DialogVariant;
  sheet?: DialogSheet;
  open: boolean;
  busy?: boolean;
};

const PHONE = {
  globals: { viewport: { value: '390x844', isRotated: false } },
  parameters: {
    viewport: { options: { '390x844': { name: '390 x 844', styles: { width: '390px', height: '844px' } } } },
  },
};

const DESKTOP = {
  globals: { viewport: { value: '1440x900', isRotated: false } },
  parameters: {
    viewport: { options: { '1440x900': { name: '1440 x 900', styles: { width: '1440px', height: '900px' } } } },
  },
};

const DESKTOP_650 = {
  globals: { viewport: { value: '1366x650', isRotated: false } },
  parameters: {
    viewport: { options: { '1366x650': { name: '1366 x 650', styles: { width: '1366px', height: '650px' } } } },
  },
};

const PHONE_420 = {
  globals: { viewport: { value: '390x420', isRotated: false } },
  parameters: {
    viewport: { options: { '390x420': { name: '390 x 420', styles: { width: '390px', height: '420px' } } } },
  },
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
Its veil is \`rgb(0 0 0 / 0.36)\`; opened while another modal is open (over a \`ui-drawer\`), it draws
a lighter \`rgb(0 0 0 / 0.24)\` over that one's, with nothing to set.

The header carries the title, an optional subtitle (\`description\`) and a close cross, which exists
only when the consumer passes \`closeLabel\`. The width is set by the consumer: \`md\`, \`lg\` or any CSS
length (560px for a search with results, 480px for a form, 440px for a confirmation).

Every dialog has the same three zones. The header (title, optional subtitle, cross) is padded 16px 16px 16px 24px, with the title and the cross centered on each other, or lined up at the top under a subtitle; the body 20px 24px and is the only zone that scrolls, the footer 16px 24px. On a sheet they are 0 8px 12px 16px, 16px and 12px 16px plus the safe area, under a drag handle. A hairline runs under the header and above the footer, and both come with the cross: without \`closeLabel\` there is no cross and no hairlines. On a desktop the dialog is centered and never taller than \`100dvh - 96px\`.

The \`variant\` input is \`default\` or \`confirm\`: a confirmation (deleting a passkey) is announced as an alertdialog, has no cross and no hairlines, one 24px padding and a 440px width unless \`width\` says otherwise. The \`sheet\` input is \`fit\` (the sheet is as tall as its content) or \`full\` (it fills the screen below 58px, so the footer stays pinned while the content changes, as in a search whose results come and go). \`truncateDescription\` keeps the subtitle on one ellipsized line instead of wrapping. A click that starts and ends on the backdrop closes the dialog, like Escape.

Content goes in two slots: the default one for the body, and \`[dialogActions]\` for the footer
buttons. Put the dismissing action first. On a desktop the footer is right-aligned; on a sheet the
actions stack at full width and 50px in the same order, the dismissing action on top and the primary at the bottom, next to the thumb, so the Tab order follows what the eye sees. Hide Cancel there with
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
  <ui-dialog heading="Sell" [open]="open()" (dismissed)="open.set(false)" (closed)="selling.set(false); sold.emit()">
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
* The footer keeps the DOM order on a sheet too (dismissing action on top, primary at the bottom), so
  the Tab order matches what the eye sees. Never reverse it with \`flex-col-reverse\` or \`order-*\`.
* The close cross is named by \`closeLabel\`, which the consumer translates. Without it there is no
  cross, and Escape stays the way out.
* Every way out is handled the same: Escape, the cross, the backdrop, a drag of the sheet and the
  owner setting \`open\` back to \`false\`.`,
      },
    },
  },
  render: (args) => ({ props: args, template: defaultTemplate }),
  args: {
    heading: 'Enter a price',
    description: 'Ferrari · PEA',
    closeLabel: 'Close',
    width: '440px',
    variant: 'default',
    sheet: 'fit',
    open: false,
    busy: false,
  },
  argTypes: dialogArgTypes,
};

export default meta;
type Story = StoryObj<DialogArgs>;

const hidden = ['!dev', '!autodocs'];

export const Default: Story = {};

export const Confirm: Story = {
  args: {
    heading: 'Delete the passkey “MacBook Air”?',
    description: undefined,
    closeLabel: undefined,
    variant: 'confirm',
    open: true,
  },
  render: (args) => ({ props: args, template: confirmTemplate(true) }),
};

export const Wide: Story = { args: { width: 'lg', open: true } };

const longBody: Story = {
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
          <button type="button" class="flex w-full rounded-control px-3 py-2 text-left text-label hover:bg-(--glow)">Row {{ row }} of a body taller than the screen.</button>
        }
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Cancel</button>
        <button dialogActions ui-button (click)="open = false">Buy 10 shares</button>
      </ui-dialog>
    `,
  }),
  args: { heading: 'Buy Ferrari', open: true },
};

export const LongBody: Story = { ...longBody, name: 'Long body that scrolls' };

export const SheetFitsTheScreen: Story = {
  ...longBody,
  name: 'Sheet fits the screen',
  tags: hidden,
  ...PHONE,
  play: sheetFitsTheScreen,
};

export const CrossCloses: Story = {
  tags: hidden,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Enter a price' })).toBeVisible());
    await pressCross(canvas.getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Open' })).toHaveFocus();
  },
};

export const BackdropCloses: Story = {
  tags: hidden,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Enter a price' })).toBeVisible());
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: canvas.getByRole('dialog'),
      coords: { clientX: 4, clientY: 4 },
    });

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Open' })).toHaveFocus();
  },
};

export const BusyStaysOpen: Story = {
  tags: hidden,
  args: { open: true, busy: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole('dialog', { name: 'Enter a price' });

    await expect(dialog).toHaveAttribute('aria-busy', 'true');
    dialog.focus();
    await expect(dialog).toHaveFocus();
    await expect(getComputedStyle(dialog).outlineStyle).toBe('none');
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await userEvent.pointer({ keys: '[MouseLeft]', target: dialog, coords: { clientX: 4, clientY: 4 } });

    await expect(dialog).toHaveAttribute('open');
  },
};

const trade: Story = {
  args: { heading: 'Buy', description: 'Ferrari · PEA', width: '480px', open: true },
  render: (args) => ({ props: args, template: tradeTemplate }),
};

const newAccount: Story = {
  args: { heading: 'New account', description: undefined, width: '480px', open: true },
  render: (args) => ({ props: args, template: newAccountTemplate }),
};

export const TradeDesktopHeader: Story = {
  name: 'Title and cross aligned from the top under a subtitle',
  tags: hidden,
  ...DESKTOP,
  ...trade,
  play: headerTopped,
};

export const NewAccountDesktopHeader: Story = {
  name: 'Title and cross centered on a desktop',
  tags: hidden,
  ...DESKTOP,
  ...newAccount,
  play: headerCentered,
};

export const NewAccountSheetHeader: Story = {
  name: 'Title and cross centered on a sheet',
  tags: hidden,
  ...PHONE,
  ...newAccount,
  play: headerCentered,
};

const addHolding = (results: number): Story => ({
  args: { heading: 'Add a holding', description: undefined, width: '560px', sheet: 'full', open: true },
  render: (args) => ({
    props: args,
    template: addHoldingTemplate(results),
  }),
});

export const AddHoldingDesktopFewResults: Story = {
  name: 'Desktop dialog centered with few results',
  tags: hidden,
  ...DESKTOP,
  ...addHolding(2),
  play: desktopCentered,
};

export const AddHoldingDesktopManyResultsShortScreen: Story = {
  name: 'Desktop dialog capped on a short screen with many results',
  tags: hidden,
  ...DESKTOP_650,
  ...addHolding(30),
  play: desktopCentered,
};

export const AddHoldingSheetFewResults: Story = {
  name: 'Full sheet stays fixed with few results',
  tags: hidden,
  ...PHONE,
  ...addHolding(1),
  play: sheetStaysFixed,
};

export const AddHoldingSheetManyResults: Story = {
  name: 'Full sheet stays fixed with many results',
  tags: hidden,
  ...PHONE,
  ...addHolding(30),
  play: sheetStaysFixed,
};

export const ConfirmWithoutActions: Story = {
  name: 'Confirm without actions on a desktop',
  tags: hidden,
  args: { ...Confirm.args },
  ...DESKTOP,
  render: (args) => ({ props: args, template: confirmTemplate(false) }),
  play: emptyFooterUnpadded,
};

export const ConfirmWithoutActionsSheet: Story = {
  ...ConfirmWithoutActions,
  tags: ['!dev', '!autodocs'],
  name: 'Confirm without actions on a sheet',
  ...PHONE,
};

export const TextOnlyScrollingBody: Story = {
  name: 'Text-only body that scrolls (keyboard reachable)',
  tags: hidden,
  ...PHONE_420,
  args: { heading: 'Conditions', closeLabel: 'Close', variant: 'confirm', width: '488px', open: true },
  render: (args) => ({
    props: { ...args, paragraphs: Array.from({ length: 12 }, (_, index) => index + 1) },
    template: `
      <ui-dialog [heading]="heading" [closeLabel]="closeLabel" [variant]="variant" [width]="width" [open]="open" (dismissed)="open = false">
        @for (paragraph of paragraphs; track paragraph) {
          <p class="text-body text-(--muted-foreground)">
            The price you enter replaces the last known value until the source next refreshes.
          </p>
        }
        <button dialogActions ui-button (click)="open = false">Got it</button>
      </ui-dialog>
    `,
  }),
  play: bodyReachable,
};

export const KeptMountedUntilClosed: Story = {
  name: 'Wrapper kept mounted until closed',
  tags: hidden,
  render: (args) => ({
    props: { ...args, mounted: false, closedCount: 0, closedReason: '' },
    template: keptMountedTemplate,
  }),
  play: keptMountedUntilClosed,
};

export const SheetDragToDismiss: Story = {
  ...KeptMountedUntilClosed,
  tags: ['!dev', '!autodocs'],
  name: 'Sheet has drag grips',
  ...PHONE,
  play: sheetHasGrips,
};
