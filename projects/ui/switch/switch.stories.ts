import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

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
Angular forms: no custom \`ControlValueAccessor\` is involved.

#### When to use

* For a setting that takes effect immediately, with no separate "Save" step, such as "Hide amounts".

#### When not to use

* For a choice that still needs confirming. A switch implies the change already happened.
* For a choice between more than two options. Use \`ui-segmented\` instead.

#### Accessibility

* The off track is drawn in \`--control-border\`, which keeps 3:1 against the page (WCAG 1.4.11). In forced colors the track gets a border, the checked track takes \`Highlight\` and the thumb \`CanvasText\`, or \`HighlightText\` when on.
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

export const Default: Story = {};

export const On: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
