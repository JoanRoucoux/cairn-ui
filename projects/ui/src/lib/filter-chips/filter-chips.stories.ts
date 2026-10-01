import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { type FilterChipOption, UiFilterChips } from './filter-chips';

type FilterChipsArgs = {
  options: FilterChipOption[];
  ariaLabel: string;
  value: string;
};

const CLASSES: FilterChipOption[] = [
  { value: 'all', label: 'Toutes', count: 31 },
  { value: 'etf', label: 'ETF', count: 6 },
  { value: 'funds', label: 'Fonds', count: 8 },
  { value: 'stocks', label: 'Actions', count: 4 },
  { value: 'crypto', label: 'Crypto', count: 5 },
  { value: 'cash', label: 'Liquidités', count: 8 },
];

const WITHOUT_COUNTS: FilterChipOption[] = CLASSES.map(({ value, label }) => ({ value, label }));

const meta: Meta<FilterChipsArgs> = {
  title: 'Inputs/Filter chips',
  decorators: [moduleMetadata({ imports: [UiFilterChips] })],
  parameters: {
    docs: {
      description: {
        component: `A row of single-choice filter pills that narrows a list in place, each with an optional
count: an asset class, a status. The choice is a \`model()\`, bound with \`[(value)]\`. One option usually
stands for "no filter" (such as "All"). On a touch screen the row stays on one line and scrolls
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
    ariaLabel: "Filtrer par classe d'actif",
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

export const FilteredOnAClass: Story = { args: { value: 'etf' } };

export const WithoutCounts: Story = {
  name: 'Without counts, before the data arrives',
  args: { options: WITHOUT_COUNTS },
};

export const ScrollsOnAPhone: Story = {
  name: 'Scrolls on a phone (needs touch emulation)',
  decorators: [
    (story) => ({
      ...story(),
      template: `<div style="width: 390px; padding: 0 var(--gutter)">${story().template}</div>`,
    }),
  ],
};

export const SelectsOnClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Fonds 8' }));

    await expect(canvas.getByRole('button', { name: 'Fonds 8' })).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'Toutes 31' })).toHaveAttribute('aria-pressed', 'false');
  },
};

export const SelectsWithTheKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    await expect(canvas.getByRole('button', { name: 'ETF 6' })).toHaveAttribute('aria-pressed', 'true');
  },
};
