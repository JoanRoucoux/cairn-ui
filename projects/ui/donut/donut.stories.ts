import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { type DonutSlice, UiDonut } from './donut';

type DonutArgs = {
  slices: DonutSlice[];
  label: string;
  othersLabel: string;
  valueFormat: (value: number) => string;
  shareFormat: (share: number) => string;
  legendHref: ((id: string) => string | null) | undefined;
  sliceSelect: (id: string) => void;
};

const eur = (value: number): string =>
  `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}\u00a0€`;

const pct = (share: number): string =>
  `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(share * 100)}\u00a0%`;

const maskedEur = (): string => '••••\u00a0€';

const byAssetClass: DonutSlice[] = [
  { id: 'etf', label: 'ETF', value: 52318.4, sublabel: '6 holdings' },
  { id: 'funds', label: 'Funds', value: 41206.15, sublabel: '8 holdings' },
  { id: 'stocks', label: 'Stocks', value: 24870.55, sublabel: '4 holdings' },
  { id: 'cash', label: 'Cash', value: 15880.25, sublabel: 'Balances and savings accounts' },
  { id: 'crypto', label: 'Crypto', value: 10264, sublabel: '5 holdings' },
];

const byAccount: DonutSlice[] = [
  { id: 'northwind-pea', label: 'Northwind PEA', value: 48215.6, sublabel: 'PEA · Northwind Bank' },
  { id: 'woodgrove-savings', label: 'Woodgrove Savings Plan', value: 31840.15, sublabel: 'PEE · Woodgrove Bank' },
  { id: 'contoso', label: 'Contoso Trading', value: 22377.9, sublabel: 'CTO · Contoso Securities' },
  { id: 'livret-a', label: 'Livret A', value: 16120.45, sublabel: 'Savings · Woodgrove Bank' },
  { id: 'tailspin', label: 'Tailspin Wallet', value: 11264.3, sublabel: 'Crypto · Tailspin Exchange' },
  { id: 'fabrikam-life', label: 'Fabrikam Life', value: 8530.75, sublabel: 'Life insurance · Fabrikam Insurance' },
  { id: 'woodgrove-retirement', label: 'Woodgrove Retirement', value: 6190.2, sublabel: 'PER · Woodgrove Bank' },
];

const meta: Meta<DonutArgs> = {
  title: 'Data display/Donut',
  decorators: [moduleMetadata({ imports: [UiDonut] })],
  parameters: {
    docs: {
      description: {
        component: `A ring chart with its legend: slices come from \`slices\`, ranked largest first on the neutral gray
ramp (\`--ramp-1\` to \`--ramp-6\`). Beyond six slices, the five largest keep their rank and the rest
merge into one “Other” slice on \`--ramp-6\`, whose legend sub-label lists the merged names, while the
ring's \`aria-label\` still names every original slice.

The largest slice is selected at first. Hovering, focusing or touching a legend row (or its arc) selects it instead: its arc thickens from 30 to 38 around the same radius, its row takes the soft surface, and the center shows its name, share
and value. The selection stays when the pointer or the focus leaves; activating a row (click or Enter) emits \`sliceSelect\` with its id, for the
caller to navigate with. Clicking or tapping an arc only selects it, so a phone, which has no hover, shows a slice's details without leaving the page. With \`legendHref\`, rows are real links: a plain click is canceled and emitted as \`sliceSelect\` so a router can navigate, while Ctrl/Cmd/Shift-click and middle-click keep the browser's behavior. Formatting is the caller's business: \`valueFormat\` and \`shareFormat\` both
arrive as inputs, so masking amounts is a matter of a formatter that returns bullets; shares stay
visible either way.

#### When to use

* A breakdown by one dimension (asset class, account, wrapper) where the parts sum to a whole.

#### When not to use

* Comparing two breakdowns side by side with a shared color meaning: the ramp is assigned by rank,
  not by category, so the same color means different things in two different rings.
* A value that is not a share of a total, such as a trend over time. Use \`ui-line-chart\` instead.

#### Accessibility

* The \`<svg>\` is \`role="img"\`, named by \`label\` followed by every slice and its share, so the full
  detail survives even when several slices are grouped into “Other” visually.
* Every legend row is a \`<button>\`, or a link when \`legendHref\` returns a URL for it: reachable by Tab, activated with Enter (and Space on a button), and its own text
  already carries the name, the sub-label, the share and the value: nothing depends on color alone.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-donut [slices]="slices" [label]="label" [othersLabel]="othersLabel" [valueFormat]="valueFormat" [shareFormat]="shareFormat" [legendHref]="legendHref" (sliceSelect)="sliceSelect($event)" />`,
  }),
  args: {
    slices: byAssetClass,
    label: 'By asset class',
    othersLabel: 'Other',
    valueFormat: eur,
    shareFormat: pct,
    legendHref: undefined,
    sliceSelect: fn(),
  },
  argTypes: {
    slices: { control: false, description: 'Slices to rank and draw, each `{ id, label, value, sublabel? }`.' },
    label: { control: 'text', description: 'The ring’s accessible name, e.g. “By asset class”.' },
    othersLabel: { control: 'text', description: 'Label of the grouped slice beyond the sixth, e.g. “Other”.' },
    valueFormat: { control: false, description: "Formats a slice's value, for the legend and the center." },
    shareFormat: { control: false, description: "Formats a slice's share (0..1), for the legend and the center." },
    legendHref: {
      control: false,
      description:
        'Maps a slice id to a URL. A row with a URL becomes a link, a row without one (or without the input) stays a button.',
    },
    sliceSelect: { description: 'Emitted with a slice id when its legend row is activated.' },
  },
};

export default meta;
type Story = StoryObj<DonutArgs>;

export const Default: Story = {};

export const Grouped: Story = {
  name: 'Seven slices grouped into Other',
  args: { slices: byAccount, label: 'By account' },
};

export const MaskedAmounts: Story = {
  name: 'Masked amounts',
  args: { valueFormat: maskedEur },
};

export const LegendLinks: Story = {
  name: 'Legend rows as links',
  args: { legendHref: (id: string) => `#class-${id}` },
};
