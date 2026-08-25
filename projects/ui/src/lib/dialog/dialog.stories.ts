import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiButton } from '../button/button';
import { DIALOG_WIDTHS, type DialogWidth, UiDialog } from './dialog';

type DialogArgs = {
  heading: string;
  width: DialogWidth;
  open: boolean;
};

const meta: Meta<DialogArgs> = {
  title: 'Surfaces/Dialog',
  decorators: [moduleMetadata({ imports: [UiButton, UiDialog] })],
  render: (args) => ({
    props: args,
    template: `
      <button ui-button (click)="open = true">Ouvrir</button>
      <ui-dialog [heading]="heading" [width]="width" [open]="open" (dismissed)="open = false">
        <p class="text-sm text-(--muted-foreground)">
          Le cours saisi remplace la derniere valeur connue jusqu'au prochain rafraichissement.
        </p>
        <button dialogActions ui-button variant="outline" (click)="open = false">Annuler</button>
        <button dialogActions ui-button (click)="open = false">Enregistrer</button>
      </ui-dialog>
    `,
  }),
  args: {
    heading: 'Saisir un cours',
    width: 'md',
    open: false,
  },
  argTypes: {
    heading: { control: 'text' },
    width: { control: 'inline-radio', options: [...DIALOG_WIDTHS] },
    open: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<DialogArgs>;

export const Closed: Story = {};

export const Opens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Ouvrir' }));

    await expect(canvas.getByRole('dialog', { name: 'Saisir un cours' })).toBeVisible();
  },
};

export const Wide: Story = {
  args: { width: 'lg', open: true },
};
