import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DIALOG_SHEETS, DIALOG_VARIANTS } from '../dialog';

export const field = (label: string): string => `
  <label class="flex flex-col gap-1.5">
    <span class="text-label font-medium text-(--muted-foreground)">${label}</span>
    <input class="rounded-control bg-(--background) shadow-[inset_0_0_0_1px_var(--border)] h-12 lg:h-10 px-3 text-body outline-none focus-visible:outline-2 focus-visible:outline-(--ring)" />
  </label>`;

export const result = (index: number): string => `
  <button type="button" class="flex w-full items-center justify-between rounded-control px-3 py-2 text-left hover:bg-(--glow)">
    <span class="text-body font-medium">Result ${index}</span>
    <span class="text-caption text-(--muted-foreground)">test price</span>
  </button>`;

export const sheetStaysFixed: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const dialog = canvas.getByRole('dialog', { name: 'Add a holding' });
  const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;

  await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().height)).toBe(window.innerHeight - 58));
  await waitFor(() => expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(window.innerHeight));
};

export const desktopCentered: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const dialog = canvas.getByRole('dialog', { name: 'Add a holding' });

  await waitFor(() => {
    const rect = dialog.getBoundingClientRect();

    expect(Math.round(rect.top + rect.bottom)).toBe(window.innerHeight);
    expect(rect.height).toBeLessThanOrEqual(window.innerHeight - 96);
  });
};

const headerBoxes = (canvasElement: HTMLElement): { title: DOMRect; cross: DOMRect } => {
  const header = canvasElement.querySelector('[data-dialog-header]') as HTMLElement;

  return {
    title: within(header).getByRole('heading', { level: 2 }).getBoundingClientRect(),
    cross: within(header).getByRole('button').getBoundingClientRect(),
  };
};

export const headerCentered: StoryObj['play'] = async ({ canvasElement }) => {
  await waitFor(() => {
    const { title, cross } = headerBoxes(canvasElement);

    expect(title.top + title.height / 2).toBeCloseTo(cross.top + cross.height / 2, 0);
  });
};

export const headerTopped: StoryObj['play'] = async ({ canvasElement }) => {
  await waitFor(() => {
    const { title, cross } = headerBoxes(canvasElement);

    expect(title.top).toBeCloseTo(cross.top, 0);
  });
};

export const bodyReachable: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const dialog = canvas.getByRole('alertdialog', { name: 'Conditions' });
  const body = dialog.querySelector('[data-dialog-body]') as HTMLElement;

  await waitFor(() => expect(body).toHaveAttribute('tabindex', '0'));
  await expect(body).toHaveAccessibleName('Conditions');
  await expect(body).not.toHaveFocus();

  await userEvent.tab();
  await expect(body).toHaveFocus();
};

export const sheetFitsTheScreen: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const dialog = canvas.getByRole('dialog', { name: 'Buy Ferrari' });
  const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;
  const body = dialog.querySelector('[data-dialog-body]') as HTMLElement;
  const primary = canvas.getByRole('button', { name: 'Buy 10 shares' });

  await waitFor(() => expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight));
  await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  await expect(primary.getBoundingClientRect().height).toBe(50);
};

export const keptMountedTemplate = `
      <button ui-button (click)="mounted = true; open = true">Open</button>
      <p class="text-label text-(--muted-foreground)" data-story-closed>{{ closedCount }} {{ closedReason }}</p>
      @if (mounted) {
        <ui-dialog
          [heading]="heading"
          [description]="description"
          [closeLabel]="closeLabel"
          [width]="width"
          [open]="open"
          (dismissed)="open = false"
          (closed)="mounted = false; closedCount = closedCount + 1; closedReason = $event"
        >
          <p class="text-label text-(--muted-foreground)">The wrapper stays mounted until the exit has played.</p>
          <button dialogActions ui-button (click)="open = false">Save</button>
        </ui-dialog>
      }
`;

export const keptMountedUntilClosed: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const closed = canvasElement.querySelector('[data-story-closed]') as HTMLElement;

  await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
  await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Enter a price' })).toBeVisible());
  await userEvent.click(canvas.getByRole('button', { name: 'Close' }));

  await expect(canvasElement.querySelector('ui-dialog')).not.toBeNull();
  await waitFor(() => expect(canvasElement.querySelector('ui-dialog')).toBeNull());
  await expect(closed).toHaveTextContent('1 cross');
  await expect(canvas.getByRole('button', { name: 'Open' })).toHaveFocus();

  await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
  await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Enter a price' })).toBeVisible());
  await userEvent.click(canvas.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(canvasElement.querySelector('ui-dialog')).toBeNull());
  await expect(closed).toHaveTextContent('2 programmatic');
  await expect(canvas.getByRole('button', { name: 'Open' })).toHaveFocus();
};

export const sheetHasGrips: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
  const dialog = await canvas.findByRole('dialog', { name: 'Enter a price' });
  const header = dialog.querySelector('[data-dialog-header]') as HTMLElement;

  await waitFor(() => expect(dialog.querySelector('[data-dialog-handle]')).toBeVisible());
  await expect(getComputedStyle(header).touchAction).toBe('none');
};

const confirmActions = `
        <button dialogActions ui-button variant="outline" (click)="open = false">Cancel</button>
        <button dialogActions ui-button variant="destructive" (click)="open = false">Delete passkey</button>`;

export const confirmTemplate = (actions: boolean): string => `
      <ui-dialog [heading]="heading" [variant]="variant" [open]="open" (dismissed)="open = false">
        <p class="text-body text-(--muted-foreground)" data-story-body>
          This device will no longer be able to sign in to Cairn with this passkey. Your other passkeys stay valid.
        </p>
        ${actions ? confirmActions : ''}
      </ui-dialog>
`;

export const emptyFooterUnpadded: StoryObj['play'] = async ({ canvasElement }) => {
  const dialog = within(canvasElement).getByRole('alertdialog');
  const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;

  await waitFor(() => expect(dialog).toBeVisible());
  await expect(footer).toBeEmptyDOMElement();
  await expect(getComputedStyle(footer).paddingTop).toBe('0px');
};

export const defaultTemplate = `
      <button ui-button (click)="open = true">Open</button>
      <ui-dialog
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [width]="width"
        [variant]="variant"
        [sheet]="sheet"
        [open]="open"
        [busy]="busy"
        (dismissed)="open = false"
      >
        <p class="text-label text-(--muted-foreground)">
          The price you enter replaces the last known value until the next refresh.
        </p>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Cancel</button>
        <button dialogActions ui-button (click)="open = false">Save</button>
      </ui-dialog>
`;

export const addHoldingTemplate = (results: number): string => `
      <ui-dialog
        [heading]="heading"
        [closeLabel]="closeLabel"
        [sheet]="sheet"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <div class="flex flex-col gap-4" data-story-body>
          ${field('Account')}${field('Security')}
          <div class="flex flex-col">${Array.from({ length: results }, (_, index) => result(index + 1)).join('')}</div>
        </div>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Cancel</button>
        <button dialogActions ui-button (click)="open = false">Add holding</button>
      </ui-dialog>
`;

export const pressCross = async (cross: HTMLElement): Promise<void> => {
  await expect(cross).toHaveFocus();
  await expect(getComputedStyle(cross).transitionProperty).toBe('scale, background-color, color');
  await expect(getComputedStyle(cross).transitionDuration).toBe('0.12s, 0.18s, 0.18s');
  await userEvent.click(cross);
};

export const dialogArgTypes: Meta['argTypes'] = {
  heading: {
    control: 'text',
    description: 'Visible title, also wired as the accessible name via `aria-labelledby`.',
  },
  description: {
    control: 'text',
    description: 'Optional subtitle under the title, also wired as `aria-describedby`.',
  },
  closeLabel: {
    control: 'text',
    description: 'Accessible name of the close cross. The cross is shown only when this is set.',
  },
  width: {
    control: 'text',
    description:
      'Max width of the dialog on a desktop: `md`, `lg` or any CSS length such as `480px`. Defaults to `lg` (560px), or 440px for `confirm`.',
  },
  variant: {
    control: 'inline-radio',
    options: [...DIALOG_VARIANTS],
    description:
      'Structure: `default` (three zones, hairlines with the cross) or `confirm` (alertdialog, no hairlines, 24px padding, 440px).',
  },
  sheet: {
    control: 'inline-radio',
    options: [...DIALOG_SHEETS],
    description:
      'Height of the sheet under `64rem`: `fit` to its content (default) or `full` below the 58px status area.',
  },
  busy: {
    control: 'boolean',
    description:
      'While an action runs: Escape, a click on the backdrop and a drag of the sheet leave the dialog open, and the cross is disabled. The owner still closes it through `open`.',
  },
  open: {
    control: 'boolean',
    description:
      'Controls `showModal()`/`close()` on the native `<dialog>`. Setting it to `false` plays the exit, then emits `closed` with `programmatic`.',
  },
};

export const tradeTemplate = `
      <ui-dialog
        truncateDescription
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <div class="flex flex-col gap-4" data-story-body>${field('Quantity')}${field('Unit price')}</div>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Cancel</button>
        <button dialogActions ui-button (click)="open = false">Buy 40 shares</button>
      </ui-dialog>
    `;

export const newAccountTemplate = `
      <ui-dialog
        [heading]="heading"
        [closeLabel]="closeLabel"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <div class="flex flex-col gap-4" data-story-body>${field('Account name')}${field('Wrapper')}${field('Institution (optional)')}</div>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Cancel</button>
        <button dialogActions ui-button (click)="open = false">Create account</button>
      </ui-dialog>
    `;
