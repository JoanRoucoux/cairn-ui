import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiInput } from '../input/input';
import { UiField } from './field';

type FieldArgs = {
  label: string;
  hint: string;
  error: string;
};

const meta: Meta<FieldArgs> = {
  title: 'Inputs/Field',
  decorators: [moduleMetadata({ imports: [UiField, UiInput] })],
  parameters: {
    docs: {
      description: {
        component: `Label, hint and error message wrapped around a projected control as a single unit.

The control stays a plain native element such as \`uiInput\` or \`uiSelect\`. The field finds it in
its own projected content and wires the ARIA attributes onto it, instead of replacing it with a
custom component that would have to reimplement every native forms behaviour.

#### When to use

* Around every form control the user is expected to fill in.
* Whenever a control needs a hint or can show a validation error.

#### When not to use

* Around a control whose purpose is already obvious from an adjacent heading, where a second label
  would only repeat it.
* Around more than one control. One field wires one control.

#### Accessibility

* The label's \`for\` points at the control's id, generated when the control has none, so clicking
  the label focuses the control.
* \`hint\` and \`error\` are joined into the control's \`aria-describedby\`.
* A non empty \`error\` marks the control \`aria-invalid\` and renders the message with \`role="alert"\`,
  so a screen reader announces it as soon as it appears.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-field [label]="label" [hint]="hint" [error]="error">
        <input uiInput type="number" step="0.0001" />
      </ui-field>
    `,
  }),
  args: {
    label: 'Prix de revient unitaire',
    hint: '',
    error: '',
  },
  argTypes: {
    label: { control: 'text', description: "The field's label, wired to the control via `for`/`id`." },
    hint: { control: 'text', description: 'Optional helper text below the control, joined into `aria-describedby`.' },
    error: {
      control: 'text',
      description:
        'Optional validation message. When set, also marks the control `aria-invalid` and renders with `role="alert"`.',
    },
  },
};

export default meta;
type Story = StoryObj<FieldArgs>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: 'Laisser vide si vous ne le connaissez pas.' },
};

export const WithError: Story = {
  args: { error: 'Le prix doit etre positif.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
  },
};
