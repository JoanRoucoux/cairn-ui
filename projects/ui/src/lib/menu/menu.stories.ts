import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiButton } from '../button/button';
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

#### When to use

* For the secondary actions of a row: edit, delete, duplicate.
* When there are too many actions to show as buttons, or when one of them is destructive and
  should not sit one accidental tap away from the primary action.

#### When not to use

* For a single action. A button says more with less.
* For navigation between screens. \`ui-nav-item\` and \`ui-tab-bar\` cover that.

#### Accessibility

* The trigger carries \`aria-haspopup="menu"\`, \`aria-expanded\` and \`aria-controls\`.
* Opening moves focus to the first item; the arrow keys move between items and wrap; Home and End
  jump to the first and the last. Escape and a click outside close the menu, and focus returns to
  the trigger either way.
* A destructive item is colored \`--negative\`, never conveyed by color alone: its label already
  says what it does ("Delete the line").`,
      },
    },
  },
  render: () => ({
    template: `
      <button ui-button size="icon" variant="ghost" aria-label="More" [uiMenuTrigger]="menu">⋯</button>
      <ui-menu #menu label="Line actions">
        <button uiMenuItem type="button">Edit</button>
        <button uiMenuItem type="button" destructive>Delete the line</button>
      </ui-menu>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Closed: Story = {};

export const Opens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'More' }));

    await waitFor(() => expect(canvas.getByRole('menu', { name: 'Line actions' })).toBeVisible());
    await expect(canvas.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
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
        <ui-menu #menu label="Line actions">
          <button uiMenuItem type="button">Edit</button>
          <button uiMenuItem type="button" destructive>Delete the line</button>
        </ui-menu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'More' }));

    const menu = canvas.getByRole('menu', { name: 'Line actions' });
    const rect = menu.getBoundingClientRect();

    await expect(rect.top).toBeGreaterThanOrEqual(0);
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
  },
};
