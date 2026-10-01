import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { ControlSurface } from '../input/input';
import { type ChoiceChipOption, UiChoiceChips } from './choice-chips';

type ChoiceChipsArgs = {
  options: ChoiceChipOption[];
  label: string;
  ariaLabel: string;
  value: string;
  surface: ControlSurface;
  disabled: boolean;
};

const ENVELOPES: ChoiceChipOption[] = ['PEA', 'PEE', 'PER', 'CTO', 'Assurance-vie', 'Crypto', 'Épargne'].map(
  (label) => ({ value: label, label }),
);

const meta: Meta<ChoiceChipsArgs> = {
  title: 'Inputs/Choice chips',
  decorators: [moduleMetadata({ imports: [UiChoiceChips] })],
  parameters: {
    docs: {
      description: {
        component: `Exclusive choice among a handful of named options, shown as wrapping pills, such as an
account envelope, a category or a frequency. The selection is a \`model()\`, bound with \`[(value)]\`
or with Signal Forms' \`[formField]\`, which fills \`disabled\`, \`errors\` and \`touched\` too.

#### When to use

* When every option is worth showing at once and their labels are words rather than a short code,
  about three to ten.
* In a form, where the choice takes effect on submit.

#### When not to use

* For a numeric range or a view switch applied immediately. Use
  [Segmented](?path=/docs/inputs-segmented--docs).
* For a long or growing list. Use [Select](?path=/docs/inputs-select--docs).
* For several choices at once: this is a single choice.

#### Accessibility

* Implements the [ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).
* A roving \`tabindex\` keeps a single stop in the tab order: the selected chip, or the first one
  when nothing matches.
* Arrow Left, Right, Up and Down move the selection and the focus together, wrapping at both ends.
  Home and End jump to the first and last chip. Space and Enter select the focused chip.
* Name the group with \`label\` (shown above the chips), or with \`ariaLabel\` or \`ariaLabelledby\`
  when the label lives elsewhere.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-choice-chips
        [options]="options"
        [label]="label"
        [ariaLabel]="ariaLabel"
        [surface]="surface"
        [disabled]="disabled"
        [(value)]="value"
      />
    `,
  }),
  args: {
    label: 'Enveloppe',
    ariaLabel: undefined,
    value: 'PEA',
    surface: 'background',
    disabled: false,
    options: ENVELOPES,
  },
  argTypes: {
    options: { control: false, description: 'Ordered `{ value, label }` list of choices.' },
    label: { control: 'text', description: 'Visible label above the chips. It also names the `radiogroup`.' },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the group when there is no visible `label`.',
    },
    value: { control: 'text', description: 'Selected option value. Two-way bound via `[(value)]`.' },
    surface: {
      control: 'inline-radio',
      options: ['background', 'card'],
      description: 'Fill of the unselected chips, to match the surface they sit on.',
    },
    disabled: { control: 'boolean', description: 'Dims every chip and removes them from interaction.' },
  },
};

export default meta;
type Story = StoryObj<ChoiceChipsArgs>;

export const Default: Story = {};

export const NothingSelected: Story = { args: { value: '' } };

export const LastSelected: Story = { args: { value: 'Épargne' } };

export const OnACardSurface: Story = {
  args: { surface: 'card' },
  decorators: [
    (story) => ({
      ...story(),
      template: `<div class="rounded-container bg-(--muted) p-4">${story().template}</div>`,
    }),
  ],
};

export const WithoutVisibleLabel: Story = { args: { label: undefined, ariaLabel: 'Enveloppe' } };

export const Disabled: Story = { args: { disabled: true } };

export const WrapsOnANarrowScreen: Story = {
  name: 'Wraps on a narrow screen',
  decorators: [
    (story) => ({
      ...story(),
      template: `<div style="width: 358px">${story().template}</div>`,
    }),
  ],
};

export const SelectsOnClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('radio', { name: 'CTO' }));

    await expect(canvas.getByRole('radio', { name: 'CTO' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'PEA' })).not.toBeChecked();
  },
};

export const MovesWithTheArrowKeys: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    canvas.getByRole('radio', { name: 'PEA' }).focus();
    await userEvent.keyboard('{ArrowLeft}');

    await expect(canvas.getByRole('radio', { name: 'Épargne' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Épargne' })).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('radio', { name: 'PEA' })).toBeChecked();
  },
};
