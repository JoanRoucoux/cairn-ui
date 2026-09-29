import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiSwitch } from './switch';

type SwitchArgs = {
  checked: boolean;
  disabled: boolean;
  label: string;
};

const meta: Meta<SwitchArgs> = {
  title: 'Inputs/Switch',
  decorators: [moduleMetadata({ imports: [UiSwitch] })],
  parameters: {
    docs: {
      description: {
        component: `A native checkbox styled as a track and a sliding knob, exposed to assistive technology as
\`role="switch"\`. Being a real checkbox, it works with a plain \`[checked]\` / \`(change)\` pair or with
Angular forms — no custom \`ControlValueAccessor\` is involved.

#### When to use

* For a setting that takes effect immediately, with no separate "Save" step, such as "Hide amounts".

#### When not to use

* For a choice that still needs confirming. A switch implies the change already happened.
* For a choice between more than two options. Use \`ui-segmented\` instead.

#### Accessibility

* \`role="switch"\` overrides the native checkbox role; the checked state stays native, so a screen
  reader announces it the same way it would a real switch.
* Always give it an accessible name, either \`aria-label\` or a \`<label>\` referencing its \`id\`.
* Toggles on a click and on Space, both native to the checkbox input.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<input type="checkbox" uiSwitch [checked]="checked" [disabled]="disabled" [attr.aria-label]="label" />`,
  }),
  args: {
    checked: false,
    disabled: false,
    label: 'Hide amounts',
  },
  argTypes: {
    checked: { control: 'boolean', description: 'The native checked state.' },
    disabled: { control: 'boolean', description: 'Dims the switch to opacity 0.4 and blocks interaction.' },
    label: { control: 'text', description: 'Accessible name, wired through `aria-label`.' },
  },
};

export default meta;
type Story = StoryObj<SwitchArgs>;

export const Off: Story = {};

export const On: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const TogglesOnClick: Story = {
  name: 'Toggles on click',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Hide amounts' }) as HTMLInputElement;

    await userEvent.click(toggle);

    await expect(toggle.checked).toBe(true);
  },
};
