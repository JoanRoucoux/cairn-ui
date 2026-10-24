import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import { SEGMENTED_SIZES, type SegmentedOption, type SegmentedSize, UiSegmented } from './segmented';

type SegmentedArgs = {
  showLabel: boolean;
  options: SegmentedOption[];
  label: string;
  value: string;
  size: SegmentedSize;
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

* The selected option sits on a thumb ringed with \`--control-border\` (3:1). In forced colors the track gets a border and the thumb takes the \`Highlight\` / \`HighlightText\` pair.
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
    template: `<ui-segmented [options]="options" [label]="label" [showLabel]="showLabel" [(value)]="value" [size]="size" />`,
  }),
  args: {
    showLabel: false,
    size: 'md',
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
    showLabel: {
      control: 'boolean',
      description:
        'Draws `label` above the track (label size, 500, muted, 6px gap) and names the group by it with `aria-labelledby` instead of `aria-label`.',
    },
    value: { control: 'text', description: 'Currently selected option value. Two-way bound via `[(value)]`.' },
    size: {
      control: 'inline-radio',
      options: [...SEGMENTED_SIZES],
      description:
        'Option height: `md` is 40 px on touch and 32 px with a mouse; `sm` is 40 px, then 30 px with a mouse (a compact range picker beside a chart).',
    },
    options: { control: false, description: 'Ordered `{ value, label }` list of choices.' },
  },
};

export default meta;
type Story = StoryObj<SegmentedArgs>;

export const Default: Story = {};

export const VisibleLabel: Story = {
  name: 'Visible label',
  args: {
    label: 'Theme',
    showLabel: true,
    value: 'system',
    options: [
      { value: 'system', label: 'System' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ],
  },
};

export const Small: Story = {
  args: { size: 'sm' },
};
