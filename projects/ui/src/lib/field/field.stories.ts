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
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
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
