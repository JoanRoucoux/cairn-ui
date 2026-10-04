import { Component, signal } from '@angular/core';

import { UiButton } from '@joanroucoux/cairn-ui/button';
import { UiDialog } from '@joanroucoux/cairn-ui/dialog';
import type { Meta } from '@storybook/angular-vite';

import { type DrawerCloseReason, UiDrawer } from '../drawer';

const fact = (term: string, value: string, last = false): string =>
  `<div class="flex justify-between py-2 ${last ? '' : 'shadow-[inset_0_-1px_0_var(--hairline)]'}"><dt class="text-label text-(--muted-foreground)">${term}</dt><dd>${value}</dd></div>`;

export const facts = `
  <dl class="flex flex-col">
    ${fact('Quantité', '40 parts')}${fact('Classe', 'ETF')}${fact('Source', 'Yahoo Finance')}${fact('Compte', 'Compte-titres Contoso', true)}
  </dl>`;

export const defaultTemplate = `
  <button ui-button variant="outline" (click)="open = true">Ouvrir le détail</button>
  <ui-drawer
    [heading]="heading"
    [description]="description"
    [closeLabel]="closeLabel"
    [label]="label"
    [width]="width"
    [open]="open"
    [busy]="busy"
    (dismissed)="open = false"
  >
    ${facts}
    <div class="grid grid-cols-2 gap-2">
      <button ui-button variant="outline" (click)="open = false">Vendre</button>
      <button ui-button (click)="open = false">Acheter</button>
    </div>
  </ui-drawer>
`;

type Trade = 'Acheter' | 'Vendre';

@Component({
  selector: 'ui-drawer-swap-demo',
  imports: [UiButton, UiDialog, UiDrawer],
  template: `
    <div class="flex flex-col items-start gap-4 p-4">
      <button type="button" ui-button variant="outline" (click)="drawer.set(true)">Northwind Monde</button>
      <p class="text-label text-(--muted-foreground)" data-story-log>{{ log().join(' · ') }}</p>
    </div>

    <ui-drawer
      closeLabel="Fermer le détail"
      description="ETF · Compte-titres Contoso"
      heading="Northwind Monde"
      [open]="drawer()"
      (closed)="onDrawerClosed($event)"
      (dismissed)="drawer.set(false)"
    >
      <p class="text-label text-(--muted-foreground)">40 parts sur le Compte-titres Contoso.</p>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" ui-button variant="outline" (click)="replaceBy('Vendre')">Vendre</button>
        <button type="button" ui-button (click)="replaceBy('Acheter')">Acheter</button>
      </div>
    </ui-drawer>

    <ui-dialog
      closeLabel="Fermer"
      description="Northwind Monde · Compte-titres Contoso"
      width="480px"
      [heading]="trade() ?? 'Acheter'"
      [open]="dialog()"
      (closed)="onDialogClosed()"
      (dismissed)="dialog.set(false)"
    >
      <p class="text-label text-(--muted-foreground)">Le tiroir revient sur la même ligne à la fermeture.</p>
      <button dialogActions type="button" ui-button variant="outline" (click)="dialog.set(false)">Annuler</button>
      <button dialogActions type="button" ui-button (click)="dialog.set(false)">{{ trade() }} 10 parts</button>
    </ui-dialog>
  `,
})
export class DrawerSwapDemo {
  protected readonly drawer = signal(false);
  protected readonly dialog = signal(false);
  protected readonly trade = signal<Trade | null>(null);
  protected readonly log = signal<string[]>([]);

  protected replaceBy(trade: Trade): void {
    this.trade.set(trade);
    this.drawer.set(false);
  }

  protected onDrawerClosed(reason: DrawerCloseReason): void {
    this.log.update((log) => [...log, `tiroir fermé (${reason})`]);
    if (this.trade()) {
      this.dialog.set(true);
      this.log.update((log) => [...log, 'dialogue ouvert']);
    }
  }

  protected onDialogClosed(): void {
    this.trade.set(null);
    this.drawer.set(true);
    this.log.update((log) => [...log, 'dialogue fermé', 'tiroir rouvert']);
  }
}

export const drawerArgTypes: Meta['argTypes'] = {
  heading: {
    control: 'text',
    description: 'Title of the header, also its accessible name. Without it the drawer draws no header.',
  },
  description: {
    control: 'text',
    description: 'Optional line under the title, wired as `aria-describedby`. Shown only with a heading.',
  },
  closeLabel: {
    control: 'text',
    description: 'Accessible name of the 36px close cross, shown in the header only when this is set.',
  },
  label: {
    control: 'text',
    description: 'Accessible name of the panel when it has no heading, such as « Détail de la ligne ».',
  },
  width: {
    control: 'text',
    description: 'Width of the panel, any CSS length. Defaults to `440px`.',
  },
  open: {
    control: 'boolean',
    description:
      'Controls `showModal()`/`close()` on the native `<dialog>`. Setting it to `false` plays the exit, then emits `closed` with `programmatic`.',
  },
  busy: {
    control: 'boolean',
    description:
      'While an action runs: Escape and a click on the veil leave the drawer open, and the cross is disabled. The owner still closes it through `open`.',
  },
};
