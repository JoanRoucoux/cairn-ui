import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiGroup, UiGroupCell, UiTable, UiTd, UiTh, UiTr } from './table';

type CollapsibleArgs = { locked: boolean };

const GROUPS = [
  {
    name: 'Northwind PEA',
    meta: 'PEA · Northwind Bank · 2 lignes',
    total: '12 011,08 €',
    rows: [
      { name: 'Ferrari', value: '3 370,08 €', day: '+1,60 %' },
      { name: 'Amundi MSCI World', value: '8 641,00 €', day: '+0,90 %' },
    ],
  },
  {
    name: 'Woodgrove Savings Plan',
    meta: 'PEE · Woodgrove Bank · 1 ligne',
    total: '18 049,20 €',
    rows: [{ name: 'Carmignac Patrimoine', value: '18 049,20 €', day: '−0,42 %' }],
  },
];

const meta: Meta<CollapsibleArgs> = {
  title: 'Data display/Table groups',
  decorators: [moduleMetadata({ imports: [UiTable, UiTh, UiTd, UiTr, UiGroup, UiGroupCell] })],
  args: { locked: false },
  argTypes: {
    locked: {
      control: 'boolean',
      description: 'Sets `toggleDisabled` on every band, as a filter holding the groups open does.',
    },
  },
  parameters: {
    viewport: { width: 1280, height: 600 },
    docs: {
      description: {
        component: `Collapsible group bands of \`uiTable\`: \`td[ui-group-cell] collapsible\` is a button inside the heading
(\`h2 > button[aria-expanded]\`) with an 18px chevron that turns to -90 degrees in \`--duration-fast\`. Bind
\`[(expanded)]\`, keep the fold memory in the page and set \`[collapsed]\` on the \`tbody[uiGroup]\`: its \`tr[uiTr]\` rows
get \`hidden\` and stay in the DOM, so a \`uiFlipList\` around the table slides nothing. \`toggleDisabled\` keeps the
button announced (\`aria-disabled\`) while a click does nothing, for a group a filter holds open; \`controls\` is the id
of the group it folds.

#### When to use

* To let a long list of grouped rows fold group by group.

#### When not to use

* To hide a group a filter or a search keeps open: set \`toggleDisabled\` and keep \`expanded\` true.

#### Accessibility

* The button sits inside the heading and carries \`aria-expanded\`; \`aria-controls\` points at the group body.
* Folded rows are \`hidden\`, so assistive technology skips them.`,
      },
    },
  },
  render: (args) => ({
    props: { ...args, groups: GROUPS, folded: { 'Northwind PEA': false, 'Woodgrove Savings Plan': !args.locked } },
    template: `
      <div class="w-[1120px] rounded-container bg-(--card) px-4 pt-2 pb-3 text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)]">
        <table uiTable row="60" [rule]="false">
          <thead>
            <tr>
              <th uiTh primary>Ligne</th>
              <th uiTh numeric width="140px">Valeur</th>
              <th uiTh numeric width="92px">Jour</th>
            </tr>
          </thead>
          @for (group of groups; track group.name) {
            <tbody uiGroup [id]="'group-' + $index" [collapsed]="folded[group.name]">
              <tr uiTr group>
                <td ui-group-cell size="lg" collapsible colspan="3" [name]="group.name" [meta]="group.meta"
                    [controls]="'group-' + $index" [expanded]="!folded[group.name]" [toggleDisabled]="locked"
                    (expandedChange)="folded[group.name] = !$event">{{ group.total }}</td>
              </tr>
              @for (row of group.rows; track row.name) {
                <tr uiTr>
                  <td uiTd primary class="font-medium">{{ row.name }}</td>
                  <td uiTd numeric class="font-medium">{{ row.value }}</td>
                  <td uiTd numeric>{{ row.day }}</td>
                </tr>
              }
            </tbody>
          }
        </table>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<CollapsibleArgs>;

export const Default: Story = {
  name: 'Un groupe ouvert, un replié',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const northwind = canvas.getByRole('button', { name: /Northwind PEA/ });
    const woodgrove = canvas.getByRole('button', { name: /Woodgrove Savings Plan/ });

    await expect(northwind).toHaveAttribute('aria-expanded', 'true');
    await expect(woodgrove).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText('Ferrari')).toBeVisible();
    await expect(canvas.getByText('Carmignac Patrimoine')).not.toBeVisible();

    await userEvent.click(northwind);
    await expect(northwind).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText('Ferrari')).not.toBeVisible();

    await userEvent.click(woodgrove);
    await expect(canvas.getByText('Carmignac Patrimoine')).toBeVisible();
  },
};

export const HeldOpen: Story = {
  name: 'Tenu ouvert par un filtre',
  args: { locked: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const northwind = canvas.getByRole('button', { name: /Northwind PEA/ });
    const rest = getComputedStyle(northwind).backgroundColor;

    await userEvent.hover(northwind);
    await expect(getComputedStyle(northwind).backgroundColor).toBe(rest);
    await expect(getComputedStyle(northwind).cursor).not.toBe('pointer');

    await userEvent.click(northwind);
    await expect(northwind).toHaveAttribute('aria-disabled', 'true');
    await expect(northwind).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Ferrari')).toBeVisible();
  },
};
