import { Component, inject } from '@angular/core';

import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiAnnouncer } from './announcer';

const BUTTON_CLASSES =
  'm-4 rounded-control bg-(--primary) px-4 py-2 text-(--primary-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)';

@Component({
  selector: 'ui-story-announce-host',
  template: `
    <button type="button" [class]="buttonClasses" (click)="panel.showModal()">Add a holding</button>
    <dialog #panel aria-label="Add a holding" class="rounded-container m-auto bg-(--card) text-(--foreground)">
      <button type="button" [class]="buttonClasses" (click)="announce()">Save</button>
    </dialog>
  `,
})
class AnnounceHost {
  readonly #announcer = inject(UiAnnouncer);
  protected readonly buttonClasses = BUTTON_CLASSES;

  protected announce(): void {
    this.#announcer.announce('Contoso Global Equity added to Alex’s PEA');
  }
}

const meta: Meta = {
  title: 'Foundations/Announcer',
  parameters: {
    docs: {
      description: {
        component: `A service that speaks one message to screen readers through a single visually hidden polite live region. Text inserted into the page together with its live role (\`role="alert"\`, \`role="status"\`, \`aria-live\`) is not read: the region has to exist before its text changes, which is what the announcer keeps.

#### When to use

* \`inject(UiAnnouncer).announce(message)\` for an outcome that appears without the focus moving: an empty state after a filter, a warning that shows up, a row that finished saving.
* \`ui-empty\` (\`announce\`), \`ui-result-group\` and \`ui-alert\` (\`warning\`) already call it.

#### When not to use

* For a failure the user must hear at once: render a \`ui-alert\` with the default \`error\` variant, which is \`role="alert"\`.
* For a message the user triggers by moving the focus onto it: the focus already reads it.

#### Accessibility

* One \`aria-live="polite"\` and \`aria-atomic="true"\` region, created on the first call and moved into the last open modal dialog, because a modal makes everything outside it inert.
* The region is emptied before each message and filled 100 ms later, so a repeated message is read again.`,
      },
    },
  },
  render: () => ({ moduleMetadata: { imports: [AnnounceHost] }, template: '<ui-story-announce-host />' }),
};

export default meta;

type Story = StoryObj;

export const RegionSitsInsideTheOpenModal: Story = {
  tags: ['!dev', '!autodocs'],
  name: 'The region sits inside an open modal dialog',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Add a holding' }));

    const dialog = await canvas.findByRole('dialog', { name: 'Add a holding' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    const region = (): Element | null => document.querySelector('[aria-live="polite"][aria-atomic="true"]');
    await waitFor(() => expect(region()).toHaveTextContent('Contoso Global Equity added to Alex’s PEA'));
    await expect(region()?.parentElement).toBe(dialog);
    await expect(dialog.matches(':modal')).toBe(true);
  },
};
