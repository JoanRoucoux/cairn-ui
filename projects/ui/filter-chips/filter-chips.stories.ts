import { UiMenu, UiMenuItem } from '@joanroucoux/cairn-ui/menu';
import { UiSelectPill } from '@joanroucoux/cairn-ui/select-pill';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type FilterChipOption, UiFilterChips } from './filter-chips';

type FilterChipsArgs = {
  options: FilterChipOption[];
  ariaLabel: string;
  value: string;
};

const CLASSES: FilterChipOption[] = [
  { value: 'all', label: 'All', count: 31 },
  { value: 'etf', label: 'ETF', count: 6 },
  { value: 'funds', label: 'Funds', count: 8 },
  { value: 'stocks', label: 'Stocks', count: 4 },
  { value: 'crypto', label: 'Crypto', count: 5 },
  { value: 'cash', label: 'Cash', count: 8 },
];

const WITHOUT_COUNTS: FilterChipOption[] = CLASSES.map(({ value, label }) => ({ value, label }));

const meta: Meta<FilterChipsArgs> = {
  title: 'Inputs/Filter chips',
  decorators: [moduleMetadata({ imports: [UiFilterChips, UiSelectPill, UiMenu, UiMenuItem] })],
  parameters: {
    docs: {
      description: {
        component: `A row of single-choice filter pills that narrows a list in place, each with an optional
count: an asset class, a status. The choice is a \`model()\`, bound with \`[(value)]\`. One option usually
stands for “no filter” (such as “All”). On a touch screen the row stays on one line and scrolls
sideways, with no visible scrollbar, bleeding to the screen edges through the \`--gutter\` token; each
pill is 34 px tall inside a 44 px target. With a fine pointer the pills are 32 px and wrap.

#### When to use

* To filter a list that is already on screen, with the effect applied immediately and the result
  count visible on each option.

#### When not to use

* A choice made in a form and applied on submit. Use [Choice chips](?path=/docs/inputs-choice-chips--docs).
* A view switch between a few panels. Use [Segmented](?path=/docs/inputs-segmented--docs).
* More than about ten options. Use [Select](?path=/docs/inputs-select--docs).

#### Accessibility

* The row is a \`role="group"\` named by \`ariaLabel\`; every chip is a \`<button>\` with \`aria-pressed\`
  telling which one is active, so a screen reader announces "Pressed" with the label and the count.
* Every chip is a tab stop. Enter and Space select it. The scroller never needs a pointer: focusing
  a chip scrolls it into view.
* Place it in a container padded by \`--gutter\`: on touch the row bleeds to the container's edges.
* The focus ring is drawn inside the pill on touch and outside it with a fine pointer.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-filter-chips [options]="options" [ariaLabel]="ariaLabel" [(value)]="value" />`,
  }),
  args: {
    ariaLabel: 'Filter by asset class',
    value: 'all',
    options: CLASSES,
  },
  argTypes: {
    options: {
      control: false,
      description: 'Ordered `{ value, label, count? }` list. A `count` of `null` or none is left out.',
    },
    ariaLabel: { control: 'text', description: 'Accessible name of the group.' },
    value: { control: 'text', description: 'Value of the active chip. Two-way bound via `[(value)]`.' },
  },
};

export default meta;
type Story = StoryObj<FilterChipsArgs>;

export const Default: Story = {};

export const WithoutCounts: Story = {
  name: 'Without counts, before the data arrives',
  args: { options: WITHOUT_COUNTS },
};

const ACCOUNT_ROW = `
  <div style="padding: 0 var(--gutter)">
    <ui-filter-chips ariaLabel="Filter by asset class" [options]="options" [(value)]="value">
      <ui-select-pill uiChipsLeading [active]="account !== ''" clearLabel="Remove the account filter" contextLabel="Account" (cleared)="account = ''">
        {{ names[account] }}
        <ui-menu label="Account" sheet heading="Account">
          <button uiMenuItem type="button" [checked]="account === ''" (click)="account = ''">All accounts</button>
          <button uiMenuItem type="button" [checked]="account === 'pea'" (click)="account = 'pea'">Northwind PEA</button>
          <button uiMenuItem type="button" [checked]="account === 'cto'" (click)="account = 'cto'">Contoso CTO</button>
        </ui-menu>
      </ui-select-pill>
    </ui-filter-chips>
  </div>
`;

const NAMES = { '': 'All accounts', pea: 'Northwind PEA', cto: 'Contoso CTO' };

const PHONE = {
  globals: { viewport: { value: '390x640', isRotated: false } },
  parameters: {
    viewport: { options: { '390x640': { name: '390 x 640', styles: { width: '390px', height: '640px' } } } },
  },
};
const DESKTOP = {
  globals: { viewport: { value: '1440x480', isRotated: false } },
  parameters: {
    viewport: { options: { '1440x480': { name: '1440 x 480', styles: { width: '1440px', height: '480px' } } } },
  },
};

const accountRender: Story['render'] = (args) => ({
  props: { ...args, account: '', names: NAMES },
  template: ACCOUNT_ROW,
});

export const WithLeadingSelector: Story = { render: accountRender };

const accountRow = (viewport: Pick<Story, 'globals' | 'parameters'>, play: Story['play']): Story => ({
  render: accountRender,
  ...viewport,
  play,
});

const atRest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const rule = canvasElement.querySelector('[data-chips-rule]')!;
  const trigger = canvas.getByRole('button', { name: 'All accounts' });

  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(canvas.queryByRole('button', { name: 'Remove the account filter' })).toBeNull();
  await expect(getComputedStyle(rule).display).toBe('block');
  await expect(canvas.getByRole('group', { name: 'Filter by asset class' })).not.toContainElement(trigger);
};

const opened: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: 'All accounts' }));

  await waitFor(() => expect(canvas.getByRole('menu', { name: 'Account' })).toBeVisible());
  await expect(canvas.getAllByRole('menuitemradio')).toHaveLength(3);
  await expect(canvas.getByRole('menuitemradio', { name: 'All accounts' })).toHaveAttribute('aria-checked', 'true');
  await expect(canvas.getByRole('menuitemradio', { name: 'All accounts' })).toHaveFocus();
};

const chosenThenCleared: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: 'All accounts' }));
  await userEvent.click(await canvas.findByRole('menuitemradio', { name: 'Northwind PEA' }));

  const cross = await canvas.findByRole('button', { name: 'Remove the account filter' });
  await expect(canvas.getByRole('button', { name: 'Account Northwind PEA' })).toBeVisible();
  await expect(cross).toBeVisible();

  await userEvent.click(cross);

  await expect(canvas.getByRole('button', { name: 'All accounts' })).toHaveFocus();
  await expect(canvas.queryByRole('button', { name: 'Remove the account filter' })).toBeNull();
};

export const AccountSelectorAtRest390: Story = {
  tags: ['!dev', '!autodocs'],
  ...accountRow(PHONE, atRest),
  name: 'Leading selector at rest on a narrow viewport (scrolls, selector first; needs touch emulation)',
};

export const AccountSelectorAtRest1440: Story = {
  tags: ['!dev', '!autodocs'],
  ...accountRow(DESKTOP, atRest),
  name: 'Leading selector at rest on a wide viewport (wraps)',
};

export const AccountSelectorOpen390: Story = {
  tags: ['!dev', '!autodocs'],
  ...accountRow(PHONE, opened),
  name: 'Leading selector menu opens as a sheet on a narrow viewport',
};

export const AccountSelectorOpen1440: Story = {
  tags: ['!dev', '!autodocs'],
  ...accountRow(DESKTOP, opened),
  name: 'Leading selector menu opens as a popover on a wide viewport',
};

export const AccountSelectorChosen390: Story = {
  tags: ['!dev', '!autodocs'],
  ...accountRow(PHONE, chosenThenCleared),
  name: 'Leading selector choice cleared with the cross returns focus, narrow viewport',
};

export const AccountSelectorChosen1440: Story = {
  tags: ['!dev', '!autodocs'],
  ...accountRow(DESKTOP, chosenThenCleared),
  name: 'Leading selector choice cleared with the cross returns focus, wide viewport',
};

export const NoRuleWithoutLeading: Story = {
  name: 'No rule without a leading element',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(canvasElement.querySelector('[data-chips-rule]')!).display).toBe('none');
  },
};
