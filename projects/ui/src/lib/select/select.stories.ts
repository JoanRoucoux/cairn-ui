import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CONTROL_SIZES, type ControlSize } from '../input/input';
import { UiSelect } from './select';

type SelectArgs = {
  size: ControlSize;
  disabled: boolean;
};

const meta: Meta<SelectArgs> = {
  title: 'Inputs/Select',
  decorators: [moduleMetadata({ imports: [UiSelect] })],
  parameters: {
    docs: {
      description: {
        component: `Styled native \`<select>\`.

It deliberately keeps the platform's own chevron and picker rather than rebuilding a listbox. On a
phone, that native picker is what makes the control usable at all.

#### When to use

* To choose one value from a list that is too long to display in full, such as an account or an
  instrument.

#### When not to use

* For a handful of options that all deserve to be visible. Use
  [Segmented](?path=/docs/inputs-segmented--docs).
* For a binary on or off. A checkbox or a switch says it in one interaction instead of two.

#### Accessibility

* The control needs an accessible name, either from the label of a surrounding \`<ui-field>\` or
  from an explicit \`aria-label\`.
* Keyboard support, including typeahead, arrow keys and Home and End, comes from the platform.
* A first option with an empty value works as the placeholder, so the unselected state is a real
  value rather than an invisible one.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <select uiSelect [size]="size" [disabled]="disabled" aria-label="Envelope">
        <option value="">Choose an envelope</option>
        <option value="pea">PEA</option>
        <option value="cto">CTO</option>
        <option value="pee">PEE</option>
      </select>
    `,
  }),
  args: { size: 'md', disabled: false },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: [...CONTROL_SIZES],
      description: '`md` is the 44px touch target used by default.',
    },
    disabled: { control: 'boolean', description: 'Native `disabled`.' },
  },
};

export default meta;
type Story = StoryObj<SelectArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox', { name: 'Envelope' })).toBeEnabled();
  },
};

export const Dense: Story = {
  args: { size: 'sm' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
