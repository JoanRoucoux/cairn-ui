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
    label: { control: 'text' },
    value: { control: 'text' },
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
