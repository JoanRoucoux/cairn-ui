import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { DELTA_EMPHASES, type DeltaEmphasis, UiDelta } from './delta';

type DeltaArgs = {
  value: number | null;
  emphasis: DeltaEmphasis;
  label: string;
};

const meta: Meta<DeltaArgs> = {
  title: 'Data display/Delta',
  decorators: [moduleMetadata({ imports: [UiDelta] })],
  parameters: {
    docs: {
      description: {
        component: `Signed amount whose sign carries meaning: a gain, a loss, or a value that is simply not
known.

\`value\` selects the color and nothing else. The figure itself is projected content, and the caller
is responsible for formatting it with its own sign, because color can never carry that sign alone.

#### When to use

* For a figure whose direction matters as much as its magnitude, such as an unrealised gain or a
  daily change.
* Whenever that figure can legitimately be unknown. Twelve of Cairn's twenty six holdings have no
  cost basis.

#### When not to use

* For a plain amount that has no direction, such as a total or a quantity.
* With \`value\` set to \`0\` to stand in for a missing figure. A zero claims a known result of zero,
  which is a different statement. Pass \`null\`.

#### Accessibility

* A \`null\` value renders an em dash marked \`aria-hidden\` next to a visually hidden
  \`unknownLabel\`, so the unknown state is announced rather than skipped in silence.
* The sign always appears in the projected text, so the meaning survives without color.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-delta [value]="value" [emphasis]="emphasis" unknownLabel="Not available">{{ label }}</ui-delta>`,
  }),
  args: {
    value: 316.54,
    emphasis: 'text',
    label: '+316.54 EUR',
  },
  argTypes: {
    value: {
      control: 'number',
      description:
        'Selects the color: positive, negative, neutral, or unknown when `null`. It never affects the text that is displayed.',
    },
    emphasis: {
      control: 'select',
      options: [...DELTA_EMPHASES],
      description: '`text` colors the figure only. `pill` also draws a neutral chip behind it.',
    },
    label: { control: 'text', description: 'Projected content: the formatted figure, already carrying its own sign.' },
  },
};

export default meta;
type Story = StoryObj<DeltaArgs>;

export const Gain: Story = {};

export const Loss: Story = {
  args: { value: -131.3, label: '−131.30 EUR' },
};

export const Pill: Story = {
  args: { emphasis: 'pill' },
};

export const Unknown: Story = {
  args: { value: null, label: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Not available')).toBeInTheDocument();
  },
};
