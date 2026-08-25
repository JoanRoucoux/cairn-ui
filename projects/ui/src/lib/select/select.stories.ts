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
    size: { control: 'inline-radio', options: [...CONTROL_SIZES] },
    disabled: { control: 'boolean' },
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
