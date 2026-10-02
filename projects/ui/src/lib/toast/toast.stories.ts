import { Component, inject, input } from '@angular/core';

import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiActionBar } from '../action-bar/action-bar';
import { UiButton } from '../button/button';
import { UiTab, UiTabBar } from '../tab-bar/tab-bar';
import { UiToaster } from './toast';
import { UiToasts } from './toasts';

@Component({
  selector: 'ui-toast-demo',
  imports: [UiActionBar, UiButton, UiToaster, UiTab, UiTabBar],
  template: `
    <div class="p-4">
      <button class="rounded-control border border-(--border) px-4 py-2" type="button" (click)="show()">
        Show a toast
      </button>
    </div>
    <ui-toaster />
    @if (actionBar()) {
      <ui-action-bar>
        <button size="tall" type="button" ui-button variant="outline">Vendre</button>
        <button size="tall" type="button" ui-button>Acheter</button>
      </ui-action-bar>
    }
    <nav class="fixed inset-x-0 bottom-0 lg:hidden" ui-tab-bar>
      <a active href="#" ui-tab>Portefeuille</a>
      <a href="#" ui-tab>Lignes</a>
      <a href="#" ui-tab>Répartition</a>
      <a href="#" ui-tab>Comptes</a>
    </nav>
  `,
})
class ToastDemo {
  readonly actionBar = input(false);

  private readonly toasts = inject(UiToasts);

  protected show(): void {
    this.toasts.show('Achat enregistré');
  }
}

const meta: Meta = {
  title: 'Feedback/Toast',
  decorators: [moduleMetadata({ imports: [ToastDemo] })],
  parameters: {
    docs: {
      description: {
        component: `A short confirmation after an action that changed data. \`UiToasts.show(message)\` puts a
sentence in the single slot of the \`<ui-toaster />\` the app shell renders once. A new message
replaces the current one in place; the message fades out after \`--toast-duration\` (5 s) and the timer
stops while the pointer is over it or focus is within.

Below \`64rem\` it is centred 8px above \`ui-tab-bar\` (its \`--tab-bar-height\`, 52px plus the safe area), or 8px above
\`ui-action-bar\` when one is on the page (the bar publishes its height as \`--action-bar-height\`); from \`64rem\` it sits
bottom right, 24px from the edges. It enters with opacity and an 8px rise over \`--duration-base\`, and
leaves with opacity over \`--duration-exit\`. Under \`prefers-reduced-motion: reduce\` it only fades.

#### When to use

* To confirm that a save, a deletion or an import went through.

#### When not to use

* For an error or anything that needs an answer: use \`ui-alert\` or a dialog.
* To offer an action. A toast carries a sentence only, never a button.

#### Accessibility

* The \`role="status"\` region is in the DOM while empty, so a screen reader announces the first message.
* Keep the sentence short: it disappears on its own.`,
      },
    },
  },
  render: () => ({ template: '<ui-toast-demo />' }),
};

export default meta;
type Story = StoryObj;

const play: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const status = canvas.getByRole('status');
  await expect(status).toBeEmptyDOMElement();

  await userEvent.click(canvas.getByRole('button', { name: 'Show a toast' }));

  await waitFor(() => expect(status).toHaveTextContent('Achat enregistré'));
  await expect(within(status).queryByRole('button')).toBeNull();
  await expect(getComputedStyle(status.firstElementChild!).transitionProperty).toBe('opacity, translate');
};

const gapAbove = async (canvasElement: HTMLElement, selector: string): Promise<void> => {
  const toast = within(canvasElement).getByRole('status').firstElementChild!;
  const below = canvasElement.querySelector(selector)!;

  await waitFor(() =>
    expect(Math.round(below.getBoundingClientRect().top - toast.getBoundingClientRect().bottom)).toBe(8),
  );
};

export const Phone: Story = {
  parameters: { viewport: { width: 390, height: 600 } },
  play: async (context) => {
    await play(context);
    await gapAbove(context.canvasElement, '[ui-tab-bar]');
  },
};

export const PhoneWithActionBar: Story = {
  name: 'Phone, above the action bar',
  parameters: { viewport: { width: 390, height: 600 } },
  render: () => ({ template: '<ui-toast-demo [actionBar]="true" />' }),
  play: async (context) => {
    await play(context);
    await gapAbove(context.canvasElement, 'ui-action-bar');
  },
};

export const Desktop: Story = {
  parameters: { viewport: { width: 1440, height: 700 } },
  play,
};
