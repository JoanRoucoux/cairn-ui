import type { StoryObj } from '@storybook/angular-vite';
import { expect, waitFor, within } from 'storybook/test';

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
