import { UiButton } from '@joanroucoux/cairn-ui/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiMenu, UiMenuItem, UiMenuTrigger } from './menu';

const meta: Meta = {
  title: 'Surfaces/Menu',
  decorators: [moduleMetadata({ imports: [UiButton, UiMenu, UiMenuTrigger, UiMenuItem] })],
  parameters: {
    docs: {
      description: {
        component: `Secondary actions menu, built on the native Popover API: light dismiss (Escape, a click
outside), stacking and the top layer all come from the platform. It opens below its trigger,
aligned to the trigger's right edge, and flips above when there is no room below.

With \`sheet\`, below 64rem it opens instead as a bottom action sheet above the tab bar, with a
backdrop, and \`heading\` names what the actions apply to. \`width\` fixes the popover width in pixels,
**outer width, padding included**: the mockup's \`width: 210px\` and \`200px\` are content-box, so pass
\`218\` and \`208\`. Without it the menu fits its content.

#### When to use

* For the secondary actions of a row: edit, delete, duplicate.
* When there are too many actions to show as buttons, or when one of them is destructive and
  should not sit one accidental tap away from the primary action.

#### When not to use

* For a single action. A button says more with less.
* For navigation between screens. \`ui-nav-item\` and \`ui-tab-bar\` cover that.

#### Accessibility

* \`heading\` is hidden from assistive technologies, so \`label\` must name the target as well, for
  example “Actions for Northwind PEA”.
* The trigger carries \`aria-haspopup="menu"\`, \`aria-expanded\` and \`aria-controls\`.
* Opening moves focus to the first item; the arrow keys move between items and wrap; Home and End
  jump to the first and the last. Escape and a click outside close the menu, and focus returns to
  the trigger either way.
* A destructive item is colored \`--negative\`, never conveyed by color alone: its label already
  says what it does (“Delete the holding”).`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <button ui-button size="icon" variant="ghost" aria-label="More" [uiMenuTrigger]="menu">⋯</button>
      <ui-menu #menu label="Holding actions" [sheet]="sheet" [heading]="heading">
        <button uiMenuItem type="button">Edit</button>
        <button uiMenuItem type="button" destructive>Delete the holding</button>
      </ui-menu>
    `,
  }),
  args: { sheet: false, heading: undefined },
  argTypes: {
    sheet: {
      control: 'boolean',
      description:
        'Below 64rem, opens as a bottom action sheet above the tab bar, with a backdrop, instead of as a popover beside the trigger. From 64rem it is a popover either way.',
    },
    heading: {
      control: 'text',
      description:
        'Title of the sheet naming what the actions apply to (an account name). Shown only with `sheet`, below 64rem, and hidden from assistive technologies: `label` must name the target too.',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Closed: Story = {};

export const Opens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'More' }));

    await waitFor(() => expect(canvas.getByRole('menu', { name: 'Holding actions' })).toBeVisible());
    await expect(canvas.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await expect(getComputedStyle(canvas.getByRole('menu', { name: 'Holding actions' })).transitionProperty).toBe(
      'opacity, scale, overlay, display',
    );
    await expect(getComputedStyle(canvas.getByRole('menuitem', { name: 'Edit' })).transitionProperty).toBe(
      'background-color',
    );
  },
};

export const ClosesOnEscapeAndReturnsFocus: Story = {
  name: 'Closes on Escape and returns focus',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'More' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(trigger).toHaveFocus();
  },
};

export const NearTheBottomRightCorner: Story = {
  name: 'Opens near the bottom-right corner, stays in the viewport',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => ({
    template: `
      <div class="flex h-screen items-end justify-end p-4">
        <button ui-button size="icon" variant="ghost" aria-label="More" [uiMenuTrigger]="menu">⋯</button>
        <ui-menu #menu label="Holding actions">
          <button uiMenuItem type="button">Edit</button>
          <button uiMenuItem type="button" destructive>Delete the holding</button>
        </ui-menu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'More' }));

    const menu = canvas.getByRole('menu', { name: 'Holding actions' });
    const rect = menu.getBoundingClientRect();

    await expect(rect.top).toBeGreaterThanOrEqual(0);
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
  },
};

const ICON_PEN = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>`;
const ICON_TRASH = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>`;

export const ActionSheet: Story = {
  name: 'Action sheet below 64rem (Accounts)',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    template: `
      <div class="flex h-screen items-start justify-end p-4">
        <button ui-button size="icon-sm" variant="quiet" aria-label="Account actions" [uiMenuTrigger]="menu">⋯</button>
        <ui-menu #menu label="Account actions" sheet heading="Livret A" [width]="218">
          <button uiMenuItem type="button">${ICON_PEN}Edit the account</button>
          <button uiMenuItem type="button" destructive>${ICON_TRASH}Delete the account</button>
        </ui-menu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Account actions' }));

    await waitFor(() => expect(canvas.getByRole('menu', { name: 'Account actions' })).toBeVisible());
    await expect(canvas.getByRole('menuitem', { name: 'Edit the account' })).toHaveFocus();
  },
};

export const FixedWidth: StoryObj<{ width: number }> = {
  name: 'Fixed width and icon sizes (Holdings 208, Accounts 218)',
  args: { width: 218 },
  argTypes: {
    width: {
      control: 'number',
      description: 'Outer popover width in pixels, padding included. The sheet spans the screen below 64rem.',
    },
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-screen items-start justify-end p-4">
        <button ui-button size="icon-sm" variant="quiet" aria-label="Account actions" [uiMenuTrigger]="menu">⋯</button>
        <ui-menu #menu label="Account actions" [width]="width">
          <button uiMenuItem type="button">${ICON_PEN}Edit the account</button>
          <button uiMenuItem type="button" destructive>${ICON_TRASH}Delete the account</button>
        </ui-menu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Account actions' }));

    const menu = canvas.getByRole('menu', { name: 'Account actions' });
    await waitFor(() => expect(menu).toBeVisible());
    await expect(menu.offsetWidth).toBe(218);
  },
};

const ICON_DOWNLOAD = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /></svg>`;

export const LongLabelOnIphone: Story = {
  name: 'Long label beside the right edge at 390',
  parameters: { layout: 'fullscreen', viewport: { width: 390, height: 844 } },
  render: () => ({
    template: `
      <div class="flex items-start justify-end p-1">
        <button ui-button size="icon-sm" variant="quiet" aria-label="Holding actions" [uiMenuTrigger]="menu">⋯</button>
        <ui-menu #menu label="Holding actions">
          <button uiMenuItem type="button">${ICON_DOWNLOAD}Export the transactions</button>
          <button uiMenuItem type="button">${ICON_PEN}Edit</button>
          <button uiMenuItem type="button" destructive>${ICON_TRASH}Delete the holding</button>
        </ui-menu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Holding actions' }));

    const menu = canvas.getByRole('menu', { name: 'Holding actions' });
    await waitFor(() => expect(menu).toBeVisible());

    const textBox = (name: string): DOMRect[] => {
      const item = canvas.getByRole('menuitem', { name });
      const range = document.createRange();
      range.selectNodeContents(item.lastChild!);
      return [...range.getClientRects()];
    };
    const long = textBox('Export the transactions');
    const short = textBox('Edit');

    await expect(long).toHaveLength(1);
    await expect(long[0]!.left).toBe(short[0]!.left);

    const rect = menu.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(8);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth - 8);
  },
};
