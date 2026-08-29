import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { METER_TONES, type MeterTone, UiMeter } from './meter';

type MeterArgs = {
  value: number;
  label: string;
  valueText: string;
  tone: MeterTone;
};

const meta: Meta<MeterArgs> = {
  title: 'Data display/Meter',
  decorators: [moduleMetadata({ imports: [UiMeter] })],
  parameters: {
    docs: {
      description: {
        component: `Proportion of a whole, drawn as a single bar. In Cairn it carries an allocation
category's share of the portfolio.

Always one bar per category, never a stacked strip. The palette is monochrome and has no hue to
tell segments of a strip apart, so length has to do that work alone, and it only reads as a
comparison when every bar starts at the same edge.

#### When to use

* To compare parts of a whole, one bar per part, each with its own label.
* For a static proportion the user reads. It is a display, not a control.

#### When not to use

* For progress towards completion, such as an upload. That is a progress bar, and it carries a
  different meaning.
* As the only place a figure appears. The bar shows a relationship, not a value.

#### Accessibility

* Renders \`role="meter"\` with \`aria-valuemin\`, \`aria-valuemax\`, \`aria-valuenow\` and
  \`aria-valuetext\`.
* \`valueText\` should read as a full phrase carrying both the share and the amount, so a screen
  reader announces exactly what a sighted user reads next to the bar.
* \`tone\` is decorative. Neighbouring ramp steps separate by at least 1.36:1, which distinguishes
  them without ever identifying a category on its own.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<div class="w-80"><ui-meter [value]="value" [label]="label" [valueText]="valueText" [tone]="tone" /></div>`,
  }),
  args: {
    value: 0.463,
    label: 'Funds',
    valueText: '46.3%, 128,656.00 EUR',
    tone: 1,
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Fill proportion, 0 to 1. Also sets `aria-valuenow`.',
    },
    label: { control: 'text', description: 'Accessible name for the meter, usually the category name.' },
    valueText: {
      control: 'text',
      description: 'Phrase announced in place of the raw number, carrying both the share and the amount.',
    },
    tone: {
      control: 'select',
      options: [...METER_TONES],
      description:
        'Step of the neutral ramp used to paint the fill, `1` being the most prominent and `6` the quietest.',
    },
  },
};

export default meta;
type Story = StoryObj<MeterArgs>;

export const Default: Story = {};

export const Smallest: Story = {
  args: { value: 0.038, label: 'Crypto', valueText: '3.8%, 10,525.00 EUR', tone: 4 },
};

export const ExposesItsValue: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('meter', { name: args.label })).toHaveAttribute('aria-valuetext', args.valueText);
  },
};
