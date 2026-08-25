import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CONTROL_SIZES, type ControlSize, UiInput, UiTextarea } from './input';

type InputArgs = {
  type: string;
  placeholder: string;
  disabled: boolean;
  size: ControlSize;
};

const meta: Meta<InputArgs> = {
  title: 'Components/Input',
  decorators: [moduleMetadata({ imports: [UiInput, UiTextarea] })],
  render: (args) => ({
    props: args,
    template: `<input uiInput [type]="type" [placeholder]="placeholder" [disabled]="disabled" [size]="size" aria-label="Example" />`,
  }),
  args: {
    type: 'text',
    placeholder: 'you@example.com',
    disabled: false,
    size: 'md',
  },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'search'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    size: { control: 'inline-radio', options: [...CONTROL_SIZES] },
  },
};

export default meta;
type Story = StoryObj<InputArgs>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AcceptsTyping: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Example' });

    await userEvent.type(input, 'jane@example.com');

    await expect(input).toHaveValue('jane@example.com');
  },
};

export const Textarea: Story = {
  render: () => ({
    template: `<textarea uiTextarea aria-label="Notes"></textarea>`,
  }),
};
