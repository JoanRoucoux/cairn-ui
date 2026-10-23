import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import { FACT_SIZES, FACT_SUB_TONES, type FactSize, type FactSubTone, UiFact, UiFacts } from './fact';

type FactArgs = {
  size: FactSize;
  subTone: FactSubTone;
  ruled: boolean;
};

const meta: Meta<FactArgs> = {
  title: 'Data display/Facts',
  decorators: [moduleMetadata({ imports: [UiFacts, UiFact] })],
  parameters: {
    docs: {
      description: {
        component: `A list of facts about one thing: a label on the left, its value on the right, an optional
line under the value, and a hairline between rows. Built on a native description list.

#### When to use

* On a detail screen, for the figures that describe the item: quantity, average cost, price with its
  date and source, identifier with its class.

#### When not to use

* For tabular data with several columns. Use the [Table](?path=/docs/data-display-table--docs).
* For a list of things the user can open. Use [Row](?path=/docs/data-display-row--docs).

#### Accessibility

* \`dl[uiFacts]\` holds \`div[ui-fact]\` children, each exposing a \`dt\` (the label) and a \`dd\` (the
  value and its sub-line), which is the markup assistive technologies expect for term and value pairs.
* The sub-line color (\`stale\`) is never the only signal: the line says what is out of date.
* \`size="auto"\` is \`md\` below 64rem and \`sm\` from it, as the Holdings detail does, so one list serves both widths.
* \`size="md"\` (12 px rows, body value) is the iPhone detail inside a card; \`sm\` (10 px rows, label
  value) is the desktop detail card. The card around the iPhone list is page layout.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[358px]">
        <dl uiFacts [ruled]="ruled">
          <div ui-fact label="Quantity" [size]="size">500</div>
          <div ui-fact label="Avg. cost" [size]="size">24,12 €</div>
          <div ui-fact label="Price" [size]="size" sub="Price as of 25/09 at 17:35 · Yahoo Finance" [subTone]="subTone">28,64 €</div>
          <div ui-fact label="ISIN" [size]="size" sub="ETF">LU1681043599</div>
        </dl>
      </div>
    `,
  }),
  args: { size: 'md', subTone: 'subtle', ruled: false },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: [...FACT_SIZES],
      description:
        '`md` is a 12 px row with a body value; `sm` a 10 px row with a label-size value and no hairline between rows; `recap` a 9 px row with a label-size value and a hairline between rows, for the before/after recap of a trade dialog; `auto` is `md` below 64rem and `sm` from it, so one list serves both widths.',
    },
    subTone: {
      control: 'inline-radio',
      options: [...FACT_SUB_TONES],
      description: 'Color of the line under a value: `subtle`, or `stale` for an out-of-date figure.',
    },
    ruled: { control: 'boolean', description: 'Also draws the hairline above the first row.' },
  },
};

export default meta;
type Story = StoryObj<FactArgs>;

export const Default: Story = {};

export const Stale: Story = {
  args: { subTone: 'stale' },
};

export const InACard: Story = {
  name: 'In a card',
  render: (args) => ({
    props: args,
    template: `
      <div class="rounded-container w-[358px] bg-(--card) px-4 py-1 shadow-[inset_0_0_0_1px_var(--border)]">
        <dl uiFacts>
          <div ui-fact label="Quantity" size="md">500</div>
          <div ui-fact label="Avg. cost" size="md">24,12 €</div>
          <div ui-fact label="Price" size="md" sub="Price as of 25/09 at 17:35 · Yahoo Finance" [subTone]="subTone">28,64 €</div>
          <div ui-fact label="ISIN" size="md" sub="ETF">LU1681043599</div>
        </dl>
      </div>
    `,
  }),
};
