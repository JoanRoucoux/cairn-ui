import { signal } from '@angular/core';

import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect } from 'storybook/test';

import {
  AMOUNT_MASKINGS,
  AMOUNT_NUMERICS,
  type AmountMasking,
  type AmountNumeric,
  UI_AMOUNT_MASKED,
  UiAmount,
} from './amount';

type AmountArgs = {
  value: number | null;
  currency: string;
  signed: boolean;
  numeric: AmountNumeric;
  whenMasked: AmountMasking;
  fractionDigits: number;
};

const meta: Meta<AmountArgs> = {
  title: 'Data display/Amount',
  decorators: [moduleMetadata({ imports: [UiAmount] })],
  parameters: {
    docs: {
      description: {
        component: `Formats a number or an amount of money for the locale: two decimals, the currency symbol
after the figure with a no-break space, the typographic minus (U+2212) on a negative value, an
explicit plus on a signed gain. A missing value renders as an em dash. Screens never format an
amount themselves — this is the only place that does.

Masking comes from the \`UI_AMOUNT_MASKED\` injection token, a signal the app provides (Cairn's
"Masquer les montants" setting). By default nothing is masked.

#### When to use

* For every euro amount, quantity, average cost or price shown to the user.
* For the one dominant figure on a screen, with \`numeric="proportional"\` so its digits are not
  forced into a tabular grid that was designed for lists.

#### When not to use

* For a percentage: percentages stay visible even when amounts are masked, so they never go
  through \`ui-amount\`.
* For a signed change that sits right next to its own percentage. Pass \`whenMasked="hide"\` so the
  pair disappears together instead of leaving a masked half next to a visible one.

#### Accessibility

* A masked value still renders as text (four bullets, or nothing with \`whenMasked="hide"\`, which
  sets the native \`hidden\` attribute): a screen reader reads it as it is, so a screen that masks an
  amount must not rely on it alone to convey meaning.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-amount [value]="value" [currency]="currency" [signed]="signed" [numeric]="numeric" [whenMasked]="whenMasked" [fractionDigits]="fractionDigits" locale="fr-FR" />`,
  }),
  args: {
    value: 144539.35,
    currency: 'EUR',
    signed: false,
    numeric: 'tabular',
    whenMasked: 'dots',
    fractionDigits: 2,
  },
  argTypes: {
    value: { control: 'number', description: 'The number to format. `null` or `undefined` render as an em dash.' },
    currency: { control: 'text', description: 'ISO 4217 code. Omitted for a plain number, such as a quantity.' },
    signed: { control: 'boolean', description: 'Prefixes a gain with `+` and a loss with the typographic minus.' },
    numeric: {
      control: 'inline-radio',
      options: [...AMOUNT_NUMERICS] as AmountNumeric[],
      description: '`tabular` aligns figures in lists and tables. `proportional` suits the one dominant figure.',
    },
    whenMasked: {
      control: 'inline-radio',
      options: [...AMOUNT_MASKINGS] as AmountMasking[],
      description: '`dots` shows four bullets in place of the figure. `hide` removes the element entirely.',
    },
    fractionDigits: { control: 'number', description: 'Decimal places. Defaults to two.' },
  },
};

export default meta;
type Story = StoryObj<AmountArgs>;

export const Euros: Story = {
  args: { value: 8592 },
  render: (args) => ({
    props: args,
    template: `<span class="text-body font-medium"><ui-amount [value]="value" [currency]="currency" [numeric]="numeric" locale="fr-FR" /></span>`,
  }),
};

export const Display: Story = {
  args: { numeric: 'proportional' },
  render: (args) => ({
    props: args,
    template: `<span class="text-display font-semibold"><ui-amount [value]="value" [currency]="currency" [numeric]="numeric" locale="fr-FR" /></span>`,
  }),
};

export const SignedGain: Story = {
  args: { value: 361.4, signed: true },
  render: (args) => ({
    props: args,
    template: `<span class="text-body font-medium text-(--positive)"><ui-amount [value]="value" [currency]="currency" [signed]="signed" locale="fr-FR" /></span>`,
  }),
};

export const SignedLoss: Story = {
  args: { value: -240.72, signed: true },
  render: (args) => ({
    props: args,
    template: `<span class="text-body font-medium text-(--negative)"><ui-amount [value]="value" [currency]="currency" [signed]="signed" locale="fr-FR" /></span>`,
  }),
};

export const SignedZero: Story = {
  args: { value: 0, signed: true },
};

export const Quantity: Story = {
  args: { value: 500, currency: '', fractionDigits: 0 },
};

export const Missing: Story = {
  args: { value: null },
  render: (args) => ({
    props: args,
    template: `<span class="text-body font-medium"><ui-amount [value]="value" [currency]="currency" locale="fr-FR" /></span>`,
  }),
};

export const Masked: Story = {
  decorators: [moduleMetadata({ providers: [{ provide: UI_AMOUNT_MASKED, useValue: signal(true) }] })],
  render: (args) => ({
    props: args,
    template: `<span class="text-display font-semibold"><ui-amount [value]="value" [currency]="currency" [numeric]="numeric" locale="fr-FR" /></span>`,
  }),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('ui-amount')).toHaveTextContent('••••');
  },
};

export const HiddenNextToAPercentage: Story = {
  name: 'Masked, hidden next to a percentage',
  decorators: [moduleMetadata({ providers: [{ provide: UI_AMOUNT_MASKED, useValue: signal(true) }] })],
  render: (args) => ({
    props: args,
    template: `
      <span class="text-label flex gap-1.5 tabular-nums">
        <ui-amount class="font-medium text-(--positive)" [value]="value" [currency]="currency" signed whenMasked="hide" locale="fr-FR" />
        <span class="font-medium text-(--positive)">+0,25 %</span>
        <span class="text-(--muted-foreground)">aujourd'hui</span>
      </span>
    `,
  }),
  args: { value: 361.4 },
};
