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
  title: 'Inputs/Input',
  decorators: [moduleMetadata({ imports: [UiInput, UiTextarea] })],
  parameters: {
    docs: {
      description: {
        component: `Styled native \`<input>\` and \`<textarea>\`.

Both are attributes rather than wrapper components, so the host stays the real element. Every
flavour of Angular forms, from \`ngModel\` to Signal Forms, and every native attribute keep working
without any plumbing. \`uiTextarea\` shares its classes with \`uiInput\` and takes no size, because a
textarea grows from a floor instead of sitting at a fixed height.

#### When to use

* For free text and numbers the user types, wrapped in a
  [Field](?path=/docs/inputs-field--docs) that labels it.

#### When not to use

* For a choice among known options. Use [Select](?path=/docs/inputs-select--docs) for a list, or
  [Segmented](?path=/docs/inputs-segmented--docs) for a handful of mutually exclusive values.

#### Accessibility

* The control always needs an accessible name, either from the label of a surrounding
  \`<ui-field>\` or from an explicit \`aria-label\`.
* A placeholder is not a label. It disappears as soon as the user types.
* \`size="md"\` is the 44px touch target, as it is for every other control in the library.`,
      },
    },
  },
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search'],
      description: 'Native `type` attribute, forwarded as-is.',
    },
    placeholder: { control: 'text', description: 'Native placeholder text.' },
    disabled: { control: 'boolean', description: 'Native `disabled`.' },
    size: {
      control: 'inline-radio',
      options: [...CONTROL_SIZES],
      description: '`md` is the 44px touch target used by default.',
    },
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
