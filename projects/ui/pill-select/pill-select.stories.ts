import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiPillSelect } from './pill-select';

type PillSelectArgs = {
  active: boolean;
};

const meta: Meta<PillSelectArgs> = {
  title: 'Inputs/Pill select',
  decorators: [moduleMetadata({ imports: [UiPillSelect] })],
  parameters: {
    docs: {
      description: {
        component: `Compact pill-shaped native \`<select>\` that heads a row of
[Filter chips](?path=/docs/inputs-filter-chips--docs), for a filter with too many values for chips, such as
an account. At rest it is outlined on the card surface; once a value other than the "all" option is picked
(\`[active]="true"\`) it is solid primary and the chevron turns to the primary foreground. It is 34 px tall
inside a 44 px target on touch, 32 px with a fine pointer.

#### When to use

* To filter a list by one value among several, next to the chips of another filter.

#### When not to use

* A choice made in a form. Use [Select](?path=/docs/inputs-select--docs).
* A handful of values that all deserve to be visible. Use [Filter chips](?path=/docs/inputs-filter-chips--docs).

#### Accessibility

* The control needs its own accessible name through \`aria-label\`: place it outside the chips' group,
  as the \`uiChipsLeading\` slot of \`ui-filter-chips\` does.
* The first option, with an empty value, is the "no filter" choice, so the unselected state is a real value.
* Keyboard support and the native picker on touch come from the platform.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <select uiPillSelect aria-label="Compte" [active]="active">
        <option value="">Tous les comptes</option>
        <option value="pea">Northwind PEA</option>
        <option value="cto">Contoso CTO</option>
      </select>
    `,
  }),
  args: { active: false },
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Solid primary pill with a primary-foreground chevron, for a value other than "all".',
    },
  },
};

export default meta;
type Story = StoryObj<PillSelectArgs>;

export const Rest: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox', { name: 'Compte' })).toHaveValue('');
  },
};

export const Active: Story = { args: { active: true } };

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const select = within(canvasElement).getByRole('combobox', { name: 'Compte' });

    await expect(select).toHaveFocus();
    await expect(getComputedStyle(select).outlineStyle).toBe('solid');
    await expect(getComputedStyle(select).outlineWidth).toBe('2px');
  },
};
