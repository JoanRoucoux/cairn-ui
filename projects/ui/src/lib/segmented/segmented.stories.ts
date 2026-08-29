import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { type SegmentedOption, UiSegmented } from './segmented';

type SegmentedArgs = {
  options: SegmentedOption[];
  label: string;
  value: string;
};

const meta: Meta<SegmentedArgs> = {
  title: 'Inputs/Segmented',
  decorators: [moduleMetadata({ imports: [UiSegmented] })],
  parameters: {
    docs: {
      description: {
        component: `Exclusive choice within a small, known set, such as a chart's time range, a unit or a
mode. The selection is a \`model()\`, bound with \`[(value)]\`.

#### When to use

* When every option fits on one line and all of them are worth showing at once, which in practice
  means about two to six.
* When picking an option applies it immediately, with no confirmation step.

#### When not to use

* For more options than fit, or for a list that grows. Use
  [Select](?path=/docs/inputs-select--docs).
* For actions rather than a selection. A row of buttons is not a segmented control.
* For a choice that only takes effect once a form is submitted, where a radio group reads more
  honestly.

#### Accessibility

* Implements the [ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), since
  no native element covers this.
* A roving \`tabindex\` keeps a single stop in the tab order: the selected option, or the first one
  when nothing matches.
* Arrow Left, Right, Up and Down move the selection and the focus together, wrapping at both ends.
* \`label\` names the group. Without it, a screen reader announces the options with nothing to tie
  them to.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-segmented [options]="options" [label]="label" [(value)]="value" />`,
  }),
  args: {
    label: 'Time range',
    value: '1d',
    options: [
      { value: '1d', label: '1D' },
      { value: '7d', label: '7D' },
      { value: '1m', label: '1M' },
      { value: '1y', label: '1Y' },
      { value: '5y', label: '5Y' },
      { value: 'max', label: 'Max' },
    ],
  },
  argTypes: {
    label: { control: 'text', description: 'Accessible name for the group (`aria-label` on the `radiogroup`).' },
    value: { control: 'text', description: 'Currently selected option value. Two-way bound via `[(value)]`.' },
    options: { control: false, description: 'Ordered `{ value, label }` list of choices.' },
  },
};

export default meta;
type Story = StoryObj<SegmentedArgs>;

export const Default: Story = {};

export const SelectsOnClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('radio', { name: 'Max' }));

    await expect(canvas.getByRole('radio', { name: 'Max' })).toBeChecked();
  },
};
