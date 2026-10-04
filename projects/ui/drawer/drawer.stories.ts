import { UiButton } from '@joanroucoux/cairn-ui/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiDrawer } from './drawer';
import { DrawerStackDemo, defaultTemplate, drawerArgTypes, facts } from './internal/drawer-story-fixtures';

type DrawerArgs = {
  heading?: string;
  description?: string;
  closeLabel?: string;
  label?: string;
  width: string;
  open: boolean;
  busy: boolean;
};

const meta: Meta<DrawerArgs> = {
  title: 'Surfaces/Drawer',
  decorators: [moduleMetadata({ imports: [UiButton, UiDrawer, DrawerStackDemo] })],
  parameters: {
    viewport: { width: 1440, height: 900 },
    docs: {
      description: {
        component: `Modal side panel built on the native \`<dialog>\`, against the right edge of the window at full
height, for the detail of a row opened from a list on a desktop. The focus trap, the inert page, Escape and the
return of focus to the opener come from the platform.

It is 440px wide (\`width\` takes any CSS length), on \`--card\`, with a shadow on its left edge and 24px of padding;
a \`rgb(0 0 0 / 0.36)\` veil covers the rest of the window. The panel scrolls on its own and keeps the scroll from
chaining to the page (\`overscroll-behavior: contain\`); the page is not locked, so the list behind keeps its
columns and its scroll position.

With \`heading\` it draws a header: the title, an optional \`description\` under it, and a 36px close cross when
\`closeLabel\` is set. Without \`heading\` it draws nothing of its own: the content brings its title row and its
close button, and \`label\` gives the panel its accessible name. The content is laid out in a column with a 24px gap.

Every way out goes through one close: Escape, a click that starts and ends on the veil, the cross and the owner
setting \`open\` back to \`false\`. \`dismissed\` fires at once for a close the reader started, never for one the owner
asked for; \`closed\` fires once, after the exit has played, with \`escape\`, \`backdrop\`, \`cross\` or
\`programmatic\`. \`busy\` keeps it open while an action runs, like \`ui-dialog\`.

The panel enters with opacity and a 24px slide from the right over \`--duration-base\` on \`--ease-out\`, while the
veil fades in; it leaves the reverse way over \`--duration-exit\`. Under \`prefers-reduced-motion: reduce\` it only
fades.

A dialog opened from the drawer opens over it, and the drawer stays open underneath. \`ui-dialog\` sees the modal
already open and draws its own lighter veil, \`rgb(0 0 0 / 0.24)\`, over the drawer's: there is nothing to set.
Escape closes the dialog first, then the drawer. Closing or submitting the dialog leaves the drawer open, and focus
goes back to the drawer button that opened the dialog: the owner only toggles the dialog's \`open\`.

\`\`\`html
<ui-drawer heading="Northwind Monde" closeLabel="Fermer le détail" [open]="detail()" (dismissed)="detail.set(false)">
  ...
  <button ui-button (click)="buying.set(true)">Acheter</button>
</ui-drawer>
<ui-dialog heading="Acheter" [open]="buying()" (dismissed)="buying.set(false)">
  ...
  <button dialogActions ui-button (click)="buy()">Acheter 10 parts</button>
</ui-dialog>
\`\`\`

After a delete or a sale of everything, the line is gone: set both \`open\` to \`false\`, then move focus to the list.

#### When to use

* For the detail of a row on a desktop, when the list behind must keep its place.

#### When not to use

* On a phone: below \`64rem\` the detail is a screen of its own. The drawer is not responsive.
* For a task that needs an answer before anything else: use \`ui-dialog\`.

#### Accessibility

* Named by its heading through \`aria-labelledby\` (and described by \`description\`), or by \`label\` without a
  heading. Never set them by hand.
* Follows the [W3C dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) through the native
  element: focus moves into the panel on open and goes back to the opener on close.
* The cross is named by \`closeLabel\`, which the consumer translates.`,
      },
    },
  },
  render: (args) => ({ props: args, template: defaultTemplate }),
  args: {
    heading: 'Northwind Monde',
    description: 'ETF · Compte-titres Contoso',
    closeLabel: 'Fermer le détail',
    label: undefined,
    width: '440px',
    open: false,
    busy: false,
  },
  argTypes: drawerArgTypes,
};

export default meta;
type Story = StoryObj<DrawerArgs>;

const openDrawer = async (canvasElement: HTMLElement, name = 'Northwind Monde'): Promise<HTMLElement> => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir le détail' }));
  const drawer = await canvas.findByRole('dialog', { name });
  await waitFor(() => expect(getComputedStyle(drawer).opacity).toBe('1'));

  return drawer;
};

const platformEscape = (modal: HTMLElement): void => {
  modal.dispatchEvent(new Event('cancel', { cancelable: true }));
};

export const Closed: Story = {};

export const Opens: Story = {
  name: 'Opens against the right edge (1440x900)',
  play: async ({ canvasElement }) => {
    const drawer = await openDrawer(canvasElement);
    const box = drawer.getBoundingClientRect();
    const style = getComputedStyle(drawer);

    await expect(box.width).toBe(440);
    await expect(box.right).toBe(window.innerWidth);
    await expect(box.top).toBe(0);
    await expect(box.height).toBe(window.innerHeight);
    await expect(style.paddingLeft).toBe('24px');
    await expect(style.transitionProperty).toBe('opacity, transform, overlay, display');
    await expect(style.transitionDuration).toBe('0.26s, 0.26s, 0.26s, 0.26s');
    await expect(getComputedStyle(drawer, '::backdrop').backgroundColor).toBe('oklab(0 0 0 / 0.36)');
    await expect(within(drawer).getByRole('button', { name: 'Fermer le détail' })).toHaveFocus();
  },
};

export const OpenOnLoad: Story = {
  name: 'Open on load, no outline on the panel',
  args: { open: true, closeLabel: undefined },
  play: async ({ canvasElement }) => {
    const drawer = await within(canvasElement).findByRole('dialog', { name: 'Northwind Monde' });

    drawer.focus();
    await expect(drawer).toHaveFocus();
    await expect(getComputedStyle(drawer).outlineStyle).toBe('none');
  },
};

export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    platformEscape(await openDrawer(canvasElement));

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Ouvrir le détail' })).toHaveFocus();
  },
};

export const CrossCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const drawer = await openDrawer(canvasElement);

    await userEvent.click(within(drawer).getByRole('button', { name: 'Fermer le détail' }));

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Ouvrir le détail' })).toHaveFocus();
  },
};

export const VeilCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const drawer = await openDrawer(canvasElement);

    await userEvent.pointer({ keys: '[MouseLeft]', target: drawer, coords: { clientX: 40, clientY: 40 } });

    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Ouvrir le détail' })).toHaveFocus();
  },
};

export const BusyStaysOpen: Story = {
  args: { open: true, busy: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const drawer = await canvas.findByRole('dialog', { name: 'Northwind Monde' });

    await expect(drawer).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('button', { name: 'Fermer le détail' })).toBeDisabled();
    platformEscape(drawer);
    await userEvent.pointer({ keys: '[MouseLeft]', target: drawer, coords: { clientX: 40, clientY: 40 } });

    await expect(drawer).toHaveAttribute('open');
  },
};

export const WithoutHeader: Story = {
  name: 'Without header, the content brings its own',
  args: { heading: undefined, description: undefined, closeLabel: undefined, label: 'Détail de la ligne' },
  render: (args) => ({
    props: args,
    template: `
      <button ui-button variant="outline" (click)="open = true">Ouvrir le détail</button>
      <ui-drawer [label]="label" [width]="width" [open]="open" (dismissed)="open = false">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-0.5">
            <h2 class="text-title font-semibold">Woodgrove Énergie</h2>
            <span class="text-label text-(--muted-foreground)">Action · PEA Woodgrove</span>
          </div>
          <button ui-button variant="ghost" (click)="open = false">Fermer</button>
        </div>
        ${facts}
      </ui-drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const drawer = await openDrawer(canvasElement, 'Détail de la ligne');

    await expect(drawer).not.toHaveAttribute('aria-labelledby');
    await expect(within(drawer).getAllByRole('heading')).toHaveLength(1);
  },
};

export const ScrollsAlone: Story = {
  name: 'Scrolls on its own, the page stays put',
  args: { open: true },
  render: (args) => ({
    props: { ...args, rows: Array.from({ length: 40 }, (_, index) => index + 1) },
    template: `
      <div class="flex flex-col gap-2 p-4">
        @for (row of rows; track row) {
          <p class="text-label">Ligne {{ row }} de la liste derrière le tiroir.</p>
        }
      </div>
      <ui-drawer [heading]="heading" [description]="description" [closeLabel]="closeLabel" [open]="open" (dismissed)="open = false">
        @for (row of rows; track row) {
          <p class="text-label text-(--muted-foreground)">Mouvement {{ row }} : achat de 10 parts.</p>
        }
      </ui-drawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const drawer = await canvas.findByRole('dialog', { name: 'Northwind Monde' });
    const style = getComputedStyle(drawer);
    const pageScroll = window.scrollY;

    await expect(style.overflowY).toBe('auto');
    await expect(style.overscrollBehaviorY).toBe('contain');
    await expect(drawer.scrollHeight).toBeGreaterThan(drawer.clientHeight);

    drawer.scrollTop = drawer.scrollHeight;

    await waitFor(() => expect(drawer.scrollTop).toBeGreaterThan(0));
    await expect(window.scrollY).toBe(pageScroll);
    await expect(drawer.getBoundingClientRect().height).toBe(window.innerHeight);
  },
};

const veil = (element: HTMLElement): string => getComputedStyle(element, '::backdrop').backgroundColor;

const shown = (element: HTMLElement): Promise<void> =>
  waitFor(() => expect(getComputedStyle(element).opacity).toBe('1'));

const gone = (element: HTMLElement): Promise<void> =>
  waitFor(() => expect(getComputedStyle(element).display).toBe('none'));

export const DialogOverDrawer: Story = {
  name: 'A dialog over the drawer, Escape twice',
  render: () => ({ template: `<ui-drawer-stack-demo />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole('button', { name: 'Northwind Monde' });
    const log = canvasElement.querySelector('[data-story-log]') as HTMLElement;
    const drawer = canvasElement.querySelector('ui-drawer dialog') as HTMLElement;
    const dialog = canvasElement.querySelector('ui-dialog dialog') as HTMLElement;

    await userEvent.click(opener);
    await shown(drawer);
    const buy = within(drawer).getByRole('button', { name: 'Acheter' });

    await userEvent.click(buy);
    await shown(dialog);

    await expect(drawer).toHaveAttribute('open');
    await expect(getComputedStyle(drawer).opacity).toBe('1');
    await expect(veil(drawer)).toBe('oklab(0 0 0 / 0.36)');
    await expect(veil(dialog)).toBe('oklab(0 0 0 / 0.24)');
    await expect(dialog.getBoundingClientRect().width).toBe(480);

    platformEscape(dialog);
    await gone(dialog);
    await expect(drawer).toHaveAttribute('open');
    await expect(buy).toHaveFocus();
    await waitFor(() => expect(log).toHaveTextContent('dialogue fermé (escape)'));

    platformEscape(drawer);
    await gone(drawer);
    await expect(opener).toHaveFocus();
    await waitFor(() => expect(log).toHaveTextContent('tiroir fermé (escape)'));

    await userEvent.click(opener);
    await shown(drawer);
    const sell = within(drawer).getByRole('button', { name: 'Vendre' });

    await userEvent.click(sell);
    await shown(dialog);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Vendre 10 parts' }));
    await gone(dialog);

    await expect(drawer).toHaveAttribute('open');
    await expect(sell).toHaveFocus();
    await expect(drawer.querySelector('[data-story-quantity]')).toHaveTextContent('30 parts');
    await waitFor(() => expect(log).toHaveTextContent('dialogue fermé (programmatic)'));
  },
};

export const DialogOverDrawerOpen: Story = {
  name: 'A dialog over the drawer, both open',
  render: () => ({ template: `<ui-drawer-stack-demo stacked />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole('dialog', { name: 'Acheter' });

    await shown(dialog);
    await expect(canvas.getByRole('dialog', { name: 'Northwind Monde' })).toHaveAttribute('open');
    await expect(veil(dialog)).toBe('oklab(0 0 0 / 0.24)');
  },
};

export const Light: Story = {
  parameters: { themes: { themeOverride: 'light' } },
  args: { open: true },
};

export const Dark: Story = {
  parameters: { themes: { themeOverride: 'dark' } },
  args: { open: true },
};
