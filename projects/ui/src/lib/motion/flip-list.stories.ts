import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiButton } from '../button/button';
import { UiListRow } from '../row/row';
import { UiGroup, UiGroupCell, UiTable, UiTd, UiTr } from '../table/table';
import { UiFlipItem, UiFlipList } from './flip-list';

const meta: Meta = {
  title: 'Foundations/Flip list',
  decorators: [
    moduleMetadata({
      imports: [UiButton, UiFlipItem, UiFlipList, UiGroup, UiGroupCell, UiListRow, UiTable, UiTd, UiTr],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `\`[uiFlipList]\` on a list container slides the remaining items into place when one is removed or
inserted. It measures every item before and after the change (FLIP), from the top of the list itself, then
animates the shift in \`translateY\` over \`--duration-base\` with \`--ease-out\`. The list needs no
\`position: relative\`, and a list that moved on the page in the meantime slides by the gap only.

The items are the direct children of the list, unless some are marked \`uiFlipItem\`: the list then follows
the marked items at any depth. Put \`uiFlipList\` around every group of a page and \`uiFlipItem\` on each group
heading and row, so a removal also slides the groups below. An item inside another item (a row inside a card)
moves by its own share, the card carrying the rest.

#### When to use

* On the list of a deletable item: a holding, a passkey. Put \`animate.leave="ui-leave-fade"\` on the item so it fades out first, then the others move up.
* On a page made of groups (one \`tbody\` or card per account): \`uiFlipList\` on the table or the page column, \`uiFlipItem\` on the headings and rows.
* When an item comes back in its place: the ones after it slide down.

#### When not to use

* To reorder or filter a long list: only items added or removed start a slide, and only vertically.
* On a change inside an item (a row that grows): the layout changes at once, nothing slides.

#### Accessibility

* Under \`prefers-reduced-motion: reduce\` nothing moves: the list closes up at once.`,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const slideOf = (element: Element): number | null => {
  for (const animation of element.getAnimations()) {
    const from = (animation.effect as KeyframeEffect).getKeyframes()[0]?.['transform'];
    if (typeof from === 'string' && from.startsWith('translateY')) {
      return parseFloat(from.slice('translateY('.length));
    }
  }
  return null;
};

export const RemoveThenReinsert: Story = {
  render: () => ({
    props: {
      all: ['Livret A', 'LDDS', 'PEA', 'Assurance vie'],
      items: ['Livret A', 'LDDS', 'PEA', 'Assurance vie'],
      remove(this: { items: string[] }) {
        this.items = this.items.filter((item) => item !== 'LDDS');
      },
      removeFirst(this: { items: string[] }) {
        this.items = this.items.filter((item) => item !== 'Livret A');
      },
      restore(this: { items: string[]; all: string[] }) {
        this.items = [...this.all];
      },
    },
    template: `
      <div class="flex w-[340px] flex-col gap-3 p-4">
        <div class="flex gap-2">
          <button ui-button type="button" (click)="remove()">Remove LDDS</button>
          <button ui-button type="button" (click)="removeFirst()">Remove Livret A</button>
          <button ui-button type="button" (click)="restore()">Put it back</button>
        </div>
        <ul uiFlipList class="m-0 list-none p-0" data-testid="list">
          @for (item of items; track item) {
            <li uiListRow class="ui-enter-fade" animate.leave="ui-leave-fade" [attr.data-testid]="item">{{ item }}</li>
          }
        </ul>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pea = canvas.getByTestId('PEA');

    await userEvent.click(canvas.getByRole('button', { name: 'Remove LDDS' }));
    await waitFor(() => expect(canvas.queryByTestId('LDDS')).toBeNull());
    await waitFor(() => expect(slideOf(pea)).not.toBeNull());

    await userEvent.click(canvas.getByRole('button', { name: 'Put it back' }));
    await waitFor(() => expect(canvas.queryByTestId('LDDS')).not.toBeNull());
  },
};

type Account = {
  name: string;
  meta: string;
  total: string;
  rows: { name: string; value: string }[];
};

const ACCOUNTS: Account[] = [
  {
    name: 'Fortuneo',
    meta: 'PEA',
    total: '12 480,00 €',
    rows: [
      { name: 'Amundi MSCI World', value: '9 120,00 €' },
      { name: 'Air Liquide', value: '3 360,00 €' },
    ],
  },
  {
    name: 'Boursorama',
    meta: 'CTO',
    total: '8 940,00 €',
    rows: [
      { name: 'TotalEnergies', value: '2 310,00 €' },
      { name: 'Schneider Electric', value: '4 120,00 €' },
      { name: 'Hermes', value: '2 510,00 €' },
    ],
  },
  {
    name: 'Linxea',
    meta: 'Assurance vie',
    total: '21 300,00 €',
    rows: [
      { name: 'Fonds euros', value: '15 000,00 €' },
      { name: 'Comgest Monde', value: '6 300,00 €' },
    ],
  },
];

const withoutRow = (accounts: Account[], name: string): Account[] =>
  accounts.map((account) => ({ ...account, rows: account.rows.filter((row) => row.name !== name) }));

export const AcrossGroups: Story = {
  render: () => ({
    props: {
      accounts: ACCOUNTS,
      remove(this: { accounts: Account[] }) {
        this.accounts = withoutRow(this.accounts, 'Schneider Electric');
      },
      restore(this: { accounts: Account[] }) {
        this.accounts = ACCOUNTS;
      },
    },
    template: `
      <div class="flex w-[560px] flex-col gap-3 p-4">
        <div class="flex gap-2">
          <button ui-button type="button" (click)="remove()">Remove Schneider Electric</button>
          <button ui-button type="button" (click)="restore()">Put it back</button>
        </div>
        <table uiTable uiFlipList>
          @for (account of accounts; track account.name) {
            <tbody uiGroup>
              <tr uiTr group uiFlipItem [attr.data-testid]="account.name">
                <td ui-group-cell colspan="2" [name]="account.name" [meta]="account.meta">{{ account.total }}</td>
              </tr>
              @for (row of account.rows; track row.name) {
                <tr uiTr uiFlipItem animate.leave="ui-leave-fade" [attr.data-testid]="row.name">
                  <td uiTd primary>{{ row.name }}</td>
                  <td uiTd numeric>{{ row.value }}</td>
                </tr>
              }
            </tbody>
          }
        </table>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hermes = canvas.getByTestId('Hermes');
    const linxea = canvas.getByTestId('Linxea');
    const fonds = canvas.getByTestId('Fonds euros');
    const height = hermes.getBoundingClientRect().height;

    await userEvent.click(canvas.getByRole('button', { name: 'Remove Schneider Electric' }));
    await waitFor(() => expect(canvas.queryByTestId('Schneider Electric')).toBeNull());

    await waitFor(() => expect(slideOf(hermes)).toBeCloseTo(height, 0));
    await expect(slideOf(linxea)).toBeCloseTo(height, 0);
    await expect(slideOf(fonds)).toBeCloseTo(height, 0);
    await expect(slideOf(canvas.getByTestId('TotalEnergies'))).toBeNull();
    await expect(slideOf(canvas.getByTestId('Fortuneo'))).toBeNull();
  },
};

export const AcrossCards: Story = {
  render: () => ({
    props: {
      accounts: ACCOUNTS,
      remove(this: { accounts: Account[] }) {
        this.accounts = withoutRow(this.accounts, 'Schneider Electric');
      },
      restore(this: { accounts: Account[] }) {
        this.accounts = ACCOUNTS;
      },
    },
    template: `
      <div class="flex w-[360px] flex-col gap-3 p-4">
        <div class="flex gap-2">
          <button ui-button type="button" (click)="remove()">Remove Schneider Electric</button>
          <button ui-button type="button" (click)="restore()">Put it back</button>
        </div>
        <div uiFlipList class="flex flex-col gap-3">
          @for (account of accounts; track account.name) {
            <section uiFlipItem class="rounded-container border border-(--border) bg-(--card) px-4" [attr.data-testid]="account.name">
              <h3 class="text-body m-0 pt-3 font-semibold">{{ account.name }}</h3>
              <ul class="m-0 list-none p-0">
                @for (row of account.rows; track row.name) {
                  <li uiListRow uiFlipItem animate.leave="ui-leave-fade" [attr.data-testid]="row.name">
                    <span class="flex-1">{{ row.name }}</span>
                    <span class="tabular-nums">{{ row.value }}</span>
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hermes = canvas.getByTestId('Hermes');
    const linxea = canvas.getByTestId('Linxea');
    const height = hermes.getBoundingClientRect().height;

    await userEvent.click(canvas.getByRole('button', { name: 'Remove Schneider Electric' }));
    await waitFor(() => expect(canvas.queryByTestId('Schneider Electric')).toBeNull());

    await waitFor(() => expect(slideOf(hermes)).toBeCloseTo(height, 0));
    await expect(slideOf(linxea)).toBeCloseTo(height, 0);
    await expect(slideOf(canvas.getByTestId('Fonds euros'))).toBeNull();
  },
};

export const AfterTheListMoved: Story = {
  render: () => ({
    props: {
      items: ['Livret A', 'LDDS', 'PEA', 'Assurance vie'],
      panel: false,
      open(this: { panel: boolean }) {
        this.panel = true;
      },
      remove(this: { items: string[] }) {
        this.items = this.items.filter((item) => item !== 'LDDS');
      },
    },
    template: `
      <div class="flex w-[340px] flex-col gap-3 p-4">
        <div class="flex gap-2">
          <button ui-button type="button" (click)="open()">Open the panel</button>
          <button ui-button type="button" (click)="remove()">Remove LDDS</button>
        </div>
        @if (panel) {
          <div class="h-[240px] rounded-container border border-(--border) bg-(--card) p-4" data-testid="panel">Panel</div>
        }
        <ul uiFlipList class="m-0 list-none p-0">
          @for (item of items; track item) {
            <li uiListRow animate.leave="ui-leave-fade" [attr.data-testid]="item">{{ item }}</li>
          }
        </ul>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pea = canvas.getByTestId('PEA');
    const height = pea.getBoundingClientRect().height;

    await userEvent.click(canvas.getByRole('button', { name: 'Open the panel' }));
    await waitFor(() => expect(canvas.queryByTestId('panel')).not.toBeNull());
    await userEvent.click(canvas.getByRole('button', { name: 'Remove LDDS' }));
    await waitFor(() => expect(canvas.queryByTestId('LDDS')).toBeNull());

    await waitFor(() => expect(slideOf(pea)).toBeCloseTo(height, 0));
  },
};
