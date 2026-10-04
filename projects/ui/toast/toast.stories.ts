import { Component, inject, input, model } from '@angular/core';

import { UiActionBar } from '@joanroucoux/cairn-ui/action-bar';
import { UiButton } from '@joanroucoux/cairn-ui/button';
import { UiDialog } from '@joanroucoux/cairn-ui/dialog';
import { UiTab, UiTabBar } from '@joanroucoux/cairn-ui/tab-bar';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiToaster } from './toast';
import { UiToasts } from './toasts';

@Component({
  selector: 'ui-toast-demo',
  imports: [UiActionBar, UiButton, UiDialog, UiToaster, UiTab, UiTabBar],
  template: `
    <div class="p-4">
      <button class="rounded-control border border-(--border) px-4 py-2" type="button" (click)="show()">
        Show a toast
      </button>
      <button class="rounded-control border border-(--border) px-4 py-2" type="button" (click)="showError()">
        Show an error
      </button>
      <button class="rounded-control border border-(--border) px-4 py-2" type="button" (click)="dialog.set(true)">
        Open a dialog
      </button>
    </div>
    <ui-toaster />
    @if (dialog()) {
      <ui-dialog heading="Saisir un cours" open (dismissed)="dialog.set(false)">
        <button class="rounded-control border border-(--border) px-4 py-2" type="button" (click)="show()">
          Show a toast over the dialog
        </button>
        <button dialogActions type="button" ui-button variant="outline" (click)="dialog.set(false)">Fermer</button>
      </ui-dialog>
    }
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
  readonly dialog = model(false);

  private readonly toasts = inject(UiToasts);

  protected show(): void {
    this.toasts.show('Achat enregistré');
  }

  protected showError(): void {
    this.toasts.showError("Échec de l'import : colonne « Quantité » manquante");
  }
}

const meta: Meta = {
  title: 'Feedback/Toast',
  decorators: [moduleMetadata({ imports: [ToastDemo] })],
  parameters: {
    docs: {
      description: {
        component: `A short message after an action. \`UiToasts.show(message)\` puts a confirmation sentence in the single
slot of the \`<ui-toaster />\` the app shell renders once; \`UiToasts.showError(message)\` puts an error there. A new
message replaces the current one in place, whichever kind. It is an inverted surface (\`--primary\` on
\`--primary-foreground\`, no contour) with a check icon. A confirmation fades out after \`--toast-duration\` (5 s) and the
timer stops while the pointer is over it or focus is inside it. An error has an alert icon, no timer, and stays until
its cross (labelled by the second argument, "Fermer" by default) is clicked.

Below \`64rem\` it is centred 8px above \`ui-tab-bar\` (its \`--tab-bar-height\`, 52px plus the safe area), or 8px above
\`ui-action-bar\` when one is on the page (the bar publishes its height as \`--action-bar-height\`); from \`64rem\` it is
centred 24px from the bottom between \`--sidebar-width\` (0 when the app does not set it) and the right edge. It enters
with opacity and an 8px rise over \`--duration-base\`, and leaves with opacity over \`--duration-exit\`. Under
\`prefers-reduced-motion: reduce\` it only fades.

The toaster is a \`popover="manual"\` shown in the top layer, and shown again every time a message arrives, so a
message stays above an open \`ui-drawer\`. A modal that opens while a message is visible does not raise it: show the
toast once the dialog has closed, so it never covers the dialog's main button. Elements behind a modal are inert, so
the pause and the cross do not work over an open modal.

#### When to use

* To confirm that a save, a deletion or an import went through.

#### When not to use

* For anything that needs an answer: use \`ui-alert\` or a dialog.
* For an error a field can show: put it on the field. The error variant is for a failure with no place of its own.
* To offer an action. A toast carries a sentence only, never a button.

#### Accessibility

* The \`role="status"\` region is in the DOM while empty, so a screen reader announces the first message,
  error included.
* Keep the sentence short: a confirmation disappears on its own. The error starts with the problem.`,
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

export const OverDialog: Story = {
  name: 'Over a modal dialog',
  parameters: { viewport: { width: 1440, height: 700 } },
  render: () => ({ template: '<ui-toast-demo [dialog]="true" />' }),
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');
    await expect(status.matches(':popover-open')).toBe(true);

    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show a toast over the dialog' }));

    await waitFor(() => expect(status).toHaveTextContent('Achat enregistré'));
    await expect(status.matches(':popover-open')).toBe(true);
  },
};

export const ErrorToast: Story = {
  name: 'Error',
  parameters: { viewport: { width: 1440, height: 700 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');
    await userEvent.click(canvas.getByRole('button', { name: 'Show an error' }));

    await waitFor(() => expect(status).toHaveTextContent("Échec de l'import"));
    await userEvent.click(within(status).getByRole('button', { name: 'Fermer' }));
    await waitFor(() => expect(status).toBeEmptyDOMElement());
  },
};

export const BesideSidebar: Story = {
  name: 'Centred beside a sidebar',
  parameters: { viewport: { width: 1440, height: 700 } },
  render: () => ({ template: '<div style="--sidebar-width: 240px"><ui-toast-demo /></div>' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');
    await userEvent.click(canvas.getByRole('button', { name: 'Show a toast' }));
    await waitFor(() => expect(status).toHaveTextContent('Achat enregistré'));

    const rect = status.firstElementChild!.getBoundingClientRect();
    await expect(Math.round(rect.left + rect.width / 2)).toBe(Math.round((240 + window.innerWidth) / 2));
    await waitFor(() =>
      expect(Math.round(window.innerHeight - status.firstElementChild!.getBoundingClientRect().bottom)).toBe(24),
    );
  },
};
