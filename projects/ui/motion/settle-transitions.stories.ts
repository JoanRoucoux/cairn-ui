import { Component, ViewContainerRef, viewChild } from '@angular/core';

import { UiAsync } from '@joanroucoux/cairn-ui/async';
import { UiBackLink } from '@joanroucoux/cairn-ui/back-link';
import { UiButton } from '@joanroucoux/cairn-ui/button';
import { UiNavItem } from '@joanroucoux/cairn-ui/nav-item';
import { UiRow } from '@joanroucoux/cairn-ui/row';
import { UiSegmented } from '@joanroucoux/cairn-ui/segmented';
import { UiSwitch } from '@joanroucoux/cairn-ui/switch';
import { UiTable, UiTd, UiTr } from '@joanroucoux/cairn-ui/table';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

@Component({
  selector: 'ui-story-mounted-page',
  imports: [UiAsync, UiBackLink, UiButton, UiNavItem, UiRow, UiSegmented, UiSwitch, UiTable, UiTd, UiTr],
  template: `
    <div class="flex w-90 flex-col items-start gap-3 p-4">
      <a href="#" ui-back-link>Profil</a>
      <a active href="#" ui-nav-item>Lignes</a>
      <button type="button" ui-button variant="outline">Ajouter une clé</button>
      <button size="block" type="button" ui-button variant="outline-destructive">Se déconnecter</button>
      <input aria-label="Masquer les montants" type="checkbox" uiSwitch [checked]="true" />
      <ui-segmented label="Thème" [options]="themes" [value]="'dark'" />
      <a href="#" selected ui-row>Livret A</a>
      <ui-async errorTitle="Clés indisponibles" retryLabel="Réessayer" state="error" />
      <table uiTable>
        <tbody>
          <tr selected uiTr>
            <td uiTd>Accor</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
class MountedPage {
  protected readonly themes = [
    { value: 'system', label: 'Système' },
    { value: 'light', label: 'Clair' },
    { value: 'dark', label: 'Sombre' },
  ];
}

@Component({
  selector: 'ui-story-mount-host',
  template: `
    <button class="m-4" type="button" (click)="mount()">Open the page</button>
    <ng-container #slot />
  `,
})
class MountHost {
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });

  mount(): void {
    this.slot().createComponent(MountedPage);
    document.body.getBoundingClientRect();
  }
}

const meta: Meta = {
  title: 'Foundations/Transitions on mount',
  parameters: {
    docs: {
      description: {
        component: `Nothing animates when a screen opens, even when the router lays the page out before its first
change detection. Opening a route creates its elements first and binds their classes on the next
tick; a layout read in between (the router's scroll to the top, a view transition capturing the
page) styles the elements without their classes, and the classes then arrive as a change. The
components below hold their transitions (and their descendants') until two frames after their first
render, so their fill, colour, thumb and switch track are simply there.

#### When to use

* \`holdTransitionsUntilRendered()\`, in the constructor of a component or directive of your own whose
  bound classes carry a transition. \`styles/motion.css\` holds the matching rule.

#### When not to use

* In a view whose change detector is detached: the hold ends after its first render, which never comes.
* For an element that should animate as it appears: use \`animate.enter\` or \`@starting-style\`.

#### Accessibility

* No effect on semantics: it only delays when transitions start to apply.`,
      },
    },
  },
  render: () => ({ moduleMetadata: { imports: [MountHost] }, template: '<ui-story-mount-host />' }),
};

export default meta;

type Story = StoryObj;

export const NothingAnimatesOnMount: Story = {
  name: 'A page opened after a layout read starts no transition',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const runs: string[] = [];
    const record = (event: TransitionEvent): void => {
      runs.push(`${(event.target as Element).tagName.toLowerCase()}${event.pseudoElement} ${event.propertyName}`);
    };

    document.addEventListener('transitionrun', record, true);
    await userEvent.click(canvas.getByRole('button', { name: 'Open the page' }));
    await new Promise((resolve) => setTimeout(resolve, 400));
    document.removeEventListener('transitionrun', record, true);

    await expect(canvas.getByRole('switch', { name: 'Masquer les montants' })).toBeChecked();
    await expect(runs.join(' | ')).toBe('');
  },
};

export const TransitionsRunAfterMount: Story = {
  name: 'Transitions still run on a later change',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open the page' }));
    await new Promise((resolve) => setTimeout(resolve, 200));

    const runs: string[] = [];
    const record = (event: TransitionEvent): void => {
      runs.push(event.propertyName);
    };
    document.addEventListener('transitionrun', record, true);
    await userEvent.click(canvas.getByRole('switch', { name: 'Masquer les montants' }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    document.removeEventListener('transitionrun', record, true);

    await expect(runs).toContain('background-color');
  },
};
