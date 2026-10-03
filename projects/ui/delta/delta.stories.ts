import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import {
  DELTA_EMPHASES,
  DELTA_SIZES,
  DELTA_WEIGHTS,
  type DeltaEmphasis,
  type DeltaSize,
  type DeltaWeight,
  UiDelta,
} from './delta';

type DeltaArgs = {
  value: number | null;
  emphasis: DeltaEmphasis;
  size: DeltaSize;
  weight: DeltaWeight;
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
    template: `<ui-delta [value]="value" [emphasis]="emphasis" [size]="size" [weight]="weight" unknownLabel="Non disponible">{{ label }}</ui-delta>`,
  }),
  args: {
    value: 361.4,
    emphasis: 'text',
    size: 'label',
    weight: 'medium',
    label: '+361,40 € · +0,25 %',
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
    size: {
      control: 'inline-radio',
      options: [...DELTA_SIZES],
      description: '`label` sets the label size; `inherit` takes the size of the line it sits in.',
    },
    weight: {
      control: 'inline-radio',
      options: [...DELTA_WEIGHTS],
      description: '`medium` (500, the default) or `regular` (400) for a figure that sits in running rows.',
    },
    label: { control: 'text', description: 'Projected content: the formatted figure, already carrying its own sign.' },
  },
};

export default meta;
type Story = StoryObj<DeltaArgs>;

export const Gain: Story = {};

export const Loss: Story = {
  args: { value: -240.72, label: '−240,72 € · −3,80 %' },
};

export const Neutral: Story = {
  args: { value: 0, label: '0,00 € · 0,00 %' },
};

export const Pill: Story = {
  args: { emphasis: 'pill', label: '+0,90 %' },
};

export const Unknown: Story = {
  args: { value: null, label: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Non disponible')).toBeInTheDocument();
  },
};

export const RegularLabel: Story = {
  name: 'Envelope share, regular weight',
  args: { weight: 'regular', label: '+4,2 %' },
  render: (args) => ({
    props: args,
    template: `<div data-frame class="bg-(--card) p-2"><ui-delta [value]="value" [size]="size" [weight]="weight" unknownLabel="Non disponible">{{ label }}</ui-delta></div>`,
  }),
};

export const InheritedBody: Story = {
  name: 'Mover in a table cell, size inherit and regular weight',
  args: { size: 'inherit', weight: 'regular', label: '+1 204,50 €' },
  render: (args) => ({
    props: args,
    template: `<div data-frame class="text-body bg-(--card) p-2"><ui-delta [value]="value" [size]="size" [weight]="weight" unknownLabel="Non disponible">{{ label }}</ui-delta></div>`,
  }),
  play: async ({ canvasElement }) => {
    const delta = canvasElement.querySelector('ui-delta') as HTMLElement;

    await expect(getComputedStyle(delta).fontSize).toBe(getComputedStyle(delta.parentElement as HTMLElement).fontSize);
    await expect(getComputedStyle(delta).fontWeight).toBe('400');
  },
};
