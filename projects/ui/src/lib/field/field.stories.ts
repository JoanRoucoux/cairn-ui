import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiInput } from '../input/input';
import { UiField } from './field';

type FieldArgs = {
  label: string;
  labelHidden: boolean;
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

A field shows a message from one of two places. \`error\` is the caller's own, and always wins. Where
none is set, the field shows the first message among the projected control's \`errors\`, once that
control is touched: Angular's \`[formField]\` fills a \`uiInput\`, \`uiSelect\` or \`uiTextarea\` with its
validation state on its own, so a form field needs no binding here at all.

#### When to use

* Around every form control the user is expected to fill in.
* Whenever a control needs a hint or can show a validation error.
* With \`labelHidden\`, around a control whose purpose the page already makes plain, such as a
  search box above the list it filters. The label is still what a screen reader announces.

#### When not to use

* Around more than one control. One field wires one control.

#### Accessibility

* The label's \`for\` points at the control's id, generated when the control has none, so clicking
  the label focuses the control.
* \`labelHidden\` hides the label from sight only: it stays in the accessibility tree and keeps
  naming the control. A placeholder is not a substitute for it, it disappears as soon as the user types.
* \`hint\` and \`error\` are joined into the control's \`aria-describedby\`.
* A non empty \`error\` marks the control \`aria-invalid\` and renders the message with \`role="alert"\`,
  so a screen reader announces it as soon as it appears.
* A control outside a field shows no message. It has nowhere to put one.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-field [label]="label" [labelHidden]="labelHidden" [hint]="hint" [error]="error">
        <input uiInput type="number" step="0.0001" />
      </ui-field>
    `,
  }),
  args: {
    label: 'Average unit cost',
    labelHidden: false,
    hint: '',
    error: '',
  },
  argTypes: {
    label: { control: 'text', description: "The field's label, wired to the control via `for`/`id`." },
    labelHidden: {
      control: 'boolean',
      description: 'Hides the label from sight while it keeps naming the control for assistive technologies.',
    },
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
  args: { hint: 'Leave empty if you do not know it.' },
};

export const WithError: Story = {
  args: { error: 'The price must be positive.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
  },
};

export const LabelHidden: Story = {
  render: () => ({
    template: `
      <ui-field label="Search holdings" labelHidden>
        <input uiInput type="search" placeholder="Instrument or account" />
      </ui-field>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const search = canvas.getByRole('searchbox', { name: 'Search holdings' });
    const label = canvasElement.querySelector('label')!;

    await expect(search).toBeVisible();
    await expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  },
};

export const InARow: Story = {
  render: () => ({
    template: `
      <div class="flex items-start gap-3">
        <ui-field class="grow" label="Quantity">
          <input uiInput type="number" />
        </ui-field>
        <ui-field class="grow" label="Price" error="The price must be positive.">
          <input uiInput type="number" />
        </ui-field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const valid = canvas.getByLabelText('Quantity');
    const refused = canvas.getByLabelText('Price');

    await expect(valid.getBoundingClientRect().top).toBeCloseTo(refused.getBoundingClientRect().top, 0);
  },
};
