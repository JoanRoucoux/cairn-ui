import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiButton } from '../button/button';
import { UiTab, UiTabBar } from '../tab-bar/tab-bar';
import { UiActionBar } from './action-bar';

const meta: Meta = {
  title: 'Surfaces/Action bar',
  decorators: [moduleMetadata({ imports: [UiActionBar, UiButton, UiTab, UiTabBar] })],
  parameters: {
    viewport: { width: 390, height: 600 },
    docs: {
      description: {
        component: `Bar of actions fixed above the tab bar on iPhone, such as Vendre and Acheter on a holding's
detail: the primary actions, within thumb reach. It sits \`52px + env(safe-area-inset-bottom)\` above the
bottom edge, so it clears \`ui-tab-bar\`, draws a hairline on top over the page background, pads with the
gutter, and splits its width equally between its children. It is hidden from \`64rem\`, where the same
actions live in the page.

Pad the scrolling content by the bar's height (about 73px) so its end is not hidden behind it.

#### When to use

* For the one or two actions that define a detail screen on a phone.

#### When not to use

* On a desktop, where the bar is hidden: place the actions in the page.
* For navigation. That is the [Tab bar](?path=/docs/data-display-tab-bar--docs).

#### Accessibility

* A plain container: the actions inside keep their native button semantics and focus order.
* Use \`size="tall"\` on the buttons so each reaches a 48px touch target.`,
      },
    },
  },
  render: () => ({
    template: `
      <div class="relative h-[300px] w-[390px] overflow-hidden bg-(--background) shadow-[0_0_0_1px_var(--border)]" style="transform: translateZ(0)">
        <ui-action-bar style="display: grid">
          <button ui-button variant="outline" size="tall" type="button">Vendre</button>
          <button ui-button size="tall" type="button">Acheter</button>
        </ui-action-bar>
        <nav ui-tab-bar class="absolute inset-x-0 bottom-0">
          <a ui-tab active href="#">Portefeuille</a>
          <a ui-tab href="#">Lignes</a>
        </nav>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Vendre' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Acheter' })).toBeVisible();
  },
};
