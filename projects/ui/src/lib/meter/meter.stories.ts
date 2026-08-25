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
  title: 'Components/Meter',
  decorators: [moduleMetadata({ imports: [UiMeter] })],
  render: (args) => ({
    props: args,
    template: `<div class="w-80"><ui-meter [value]="value" [label]="label" [valueText]="valueText" [tone]="tone" /></div>`,
  }),
  args: {
    value: 0.463,
    label: 'Funds',
    valueText: '46.3% - 128,656.00 EUR',
    tone: 1,
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    label: { control: 'text' },
    valueText: { control: 'text' },
    tone: { control: 'select', options: [...METER_TONES] },
  },
};

export default meta;
type Story = StoryObj<MeterArgs>;

export const Default: Story = {};

export const Smallest: Story = {
  args: { value: 0.038, label: 'Crypto', valueText: '3.8% - 10,525.00 EUR', tone: 4 },
};

export const ExposesItsValue: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('meter', { name: args.label })).toHaveAttribute('aria-valuetext', args.valueText);
  },
};
