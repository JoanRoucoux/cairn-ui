import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { DELTA_EMPHASES, type DeltaEmphasis, UiDelta } from './delta';

type DeltaArgs = {
  value: number | null;
  emphasis: DeltaEmphasis;
  label: string;
};

const meta: Meta<DeltaArgs> = {
  title: 'Components/Delta',
  decorators: [moduleMetadata({ imports: [UiDelta] })],
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
    value: { control: 'number' },
    emphasis: { control: 'select', options: [...DELTA_EMPHASES] },
    label: { control: 'text' },
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
