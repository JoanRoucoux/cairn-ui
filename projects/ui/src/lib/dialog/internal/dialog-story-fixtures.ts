import type { StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

export const field = (label: string): string => `
  <label class="flex flex-col gap-1.5">
    <span class="text-label font-medium text-(--muted-foreground)">${label}</span>
    <input class="rounded-control bg-(--background) shadow-[inset_0_0_0_1px_var(--border)] h-12 lg:h-10 px-3 text-body outline-none focus-visible:outline-2 focus-visible:outline-(--ring)" />
  </label>`;

export const result = (index: number): string => `
  <button type="button" class="flex w-full items-center justify-between rounded-control px-3 py-2 text-left hover:bg-(--glow)">
    <span class="text-body font-medium">Résultat ${index}</span>
    <span class="text-caption text-(--muted-foreground)">cours d'essai</span>
  </button>`;

export const sheetStaysFixed: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const dialog = canvas.getByRole('dialog', { name: 'Ajouter une ligne' });
  const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;

  await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().height)).toBe(window.innerHeight - 58));
  await waitFor(() => expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(window.innerHeight));
};

export const desktopAnchored: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const dialog = canvas.getByRole('dialog', { name: 'Ajouter une ligne' });
  const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;

  await waitFor(() => expect(Math.round(dialog.getBoundingClientRect().top)).toBe(96));
  await waitFor(() => expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight - 32));
  await expect(dialog.getBoundingClientRect().height).toBeLessThanOrEqual(760);
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
  const dialog = canvas.getByRole('dialog', { name: 'Acheter Ferrari' });
  const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;
  const body = dialog.querySelector('[data-dialog-body]') as HTMLElement;
  const primary = canvas.getByRole('button', { name: 'Acheter 10 parts' });

  await waitFor(() => expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight));
  await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  await expect(primary.getBoundingClientRect().height).toBe(50);
};

export const keptMountedTemplate = `
      <button ui-button (click)="mounted = true; open = true">Ouvrir</button>
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
          <p class="text-label text-(--muted-foreground)">Le cadre reste monté jusqu'à la fin de la sortie.</p>
          <button dialogActions ui-button (click)="open = false">Enregistrer</button>
        </ui-dialog>
      }
`;

export const keptMountedUntilClosed: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const closed = canvasElement.querySelector('[data-story-closed]') as HTMLElement;

  await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir' }));
  await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Saisir un cours' })).toBeVisible());
  await userEvent.click(canvas.getByRole('button', { name: 'Fermer' }));

  await expect(canvasElement.querySelector('ui-dialog')).not.toBeNull();
  await waitFor(() => expect(canvasElement.querySelector('ui-dialog')).toBeNull());
  await expect(closed).toHaveTextContent('1 cross');
  await expect(canvas.getByRole('button', { name: 'Ouvrir' })).toHaveFocus();

  await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir' }));
  await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Saisir un cours' })).toBeVisible());
  await userEvent.click(canvas.getByRole('button', { name: 'Enregistrer' }));

  await waitFor(() => expect(canvasElement.querySelector('ui-dialog')).toBeNull());
  await expect(closed).toHaveTextContent('2 programmatic');
  await expect(canvas.getByRole('button', { name: 'Ouvrir' })).toHaveFocus();
};

export const sheetHasGrips: StoryObj['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir' }));
  const dialog = await canvas.findByRole('dialog', { name: 'Saisir un cours' });
  const header = dialog.querySelector('[data-dialog-header]') as HTMLElement;

  await waitFor(() => expect(dialog.querySelector('[data-dialog-handle]')).toBeVisible());
  await expect(getComputedStyle(header).touchAction).toBe('none');
};

export const defaultTemplate = `
      <button ui-button (click)="open = true">Ouvrir</button>
      <ui-dialog
        [heading]="heading"
        [description]="description"
        [closeLabel]="closeLabel"
        [layout]="layout"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <p class="text-label text-(--muted-foreground)">
          Le cours saisi remplace la dernière valeur connue jusqu'à la prochaine actualisation.
        </p>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Enregistrer</button>
      </ui-dialog>
`;

export const addLineTemplate = (results: number): string => `
      <ui-dialog
        [heading]="heading"
        [closeLabel]="closeLabel"
        [layout]="layout"
        [width]="width"
        [open]="open"
        (dismissed)="open = false"
      >
        <div class="flex flex-col gap-4" data-story-body>
          ${field('Compte')}${field('Titre')}
          <div class="flex flex-col">${Array.from({ length: results }, (_, index) => result(index + 1)).join('')}</div>
        </div>
        <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Ajouter la ligne</button>
      </ui-dialog>
`;
