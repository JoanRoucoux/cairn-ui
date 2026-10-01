import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { type DonutSlice, UiDonut } from './donut';

type DonutArgs = {
  slices: DonutSlice[];
  label: string;
  othersLabel: string;
  valueFormat: (value: number) => string;
  shareFormat: (share: number) => string;
  sliceSelect: (id: string) => void;
};

const eur = (value: number): string =>
  `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}\u00a0€`;

const pct = (share: number): string =>
  `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(share * 100)}\u00a0%`;

const maskedEur = (): string => '••••\u00a0€';

const byAssetClass: DonutSlice[] = [
  { id: 'etf', label: 'ETF', value: 57671.28, sublabel: '6 lignes' },
  { id: 'funds', label: 'Fonds', value: 46205.34, sublabel: '8 lignes' },
  { id: 'stocks', label: 'Actions', value: 26609.1, sublabel: '4 lignes' },
  { id: 'cash', label: 'Liquidités', value: 20048.34, sublabel: 'Soldes et livrets' },
  { id: 'crypto', label: 'Crypto', value: 13760.22, sublabel: '5 lignes' },
];

const byAccount: DonutSlice[] = [
  { id: 'saxo', label: 'Saxo Investor', value: 61247.83, sublabel: 'PEA · Saxo' },
  { id: 'esalia', label: 'Esalia', value: 38512.4, sublabel: 'PEE · Amundi ESR' },
  { id: 'sharinbox', label: 'Sharinbox', value: 17914.06, sublabel: 'CTO · SGSS' },
  { id: 'fortuneo', label: 'Fortuneo', value: 15402.18, sublabel: 'Épargne · Fortuneo' },
  { id: 'binance', label: 'Binance', value: 13806.52, sublabel: 'Crypto · Binance' },
  { id: 'fortuneo-vie', label: 'Fortuneo Vie', value: 9718.35, sublabel: 'Assurance-vie · Fortuneo' },
  { id: 'sogeretraite', label: 'Sogeretraite', value: 7692.94, sublabel: 'PER · Société Générale' },
];

const withATinySlice: DonutSlice[] = [
  { id: 'saxo', label: 'Saxo Investor', value: 90000, sublabel: '12 lignes' },
  { id: 'esalia', label: 'Esalia', value: 9900, sublabel: '4 lignes' },
  { id: 'binance', label: 'Binance', value: 100, sublabel: '1 ligne' },
];

const meta: Meta<DonutArgs> = {
  title: 'Data display/Donut',
  decorators: [moduleMetadata({ imports: [UiDonut] })],
  parameters: {
    docs: {
      description: {
        component: `A ring chart with its legend: slices come from \`slices\`, ranked largest first on the neutral grey
ramp (\`--ramp-1\` to \`--ramp-6\`). Beyond six slices, the five largest keep their rank and the rest
merge into one "Others" slice on \`--ramp-6\`, whose legend sub-label lists the merged names — the
ring's \`aria-label\` still names every original slice.

Hovering, focusing or touching a legend row (or its arc) thickens that arc in place, on the same ring, and shows its name, share
and value at the centre; activating a row (click or Enter) emits \`sliceSelect\` with its id, for the
caller to navigate with. Formatting is the caller's business: \`valueFormat\` and \`shareFormat\` both
arrive as inputs, so masking amounts is a matter of a formatter that returns bullets — shares stay
visible either way.

#### When to use

* A breakdown by one dimension (asset class, account, envelope) where the parts sum to a whole.

#### When not to use

* Comparing two breakdowns side by side with a shared color meaning: the ramp is assigned by rank,
  not by category, so the same color means different things in two different rings.
* A value that is not a share of a total, such as a trend over time — use \`ui-line-chart\` instead.

#### Accessibility

* The \`<svg>\` is \`role="img"\`, named by \`label\` followed by every slice and its share, so the full
  detail survives even when several slices are grouped into "Others" visually.
* Every legend row is a \`<button>\`: reachable by Tab, activated with Enter or Space, and its own text
  already carries the name, the sub-label, the share and the value — nothing depends on color alone.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-donut [slices]="slices" [label]="label" [othersLabel]="othersLabel" [valueFormat]="valueFormat" [shareFormat]="shareFormat" (sliceSelect)="sliceSelect($event)" />`,
  }),
  args: {
    slices: byAssetClass,
    label: "Par classe d'actif",
    othersLabel: 'Autres',
    valueFormat: eur,
    shareFormat: pct,
    sliceSelect: fn(),
  },
  argTypes: {
    slices: { control: false, description: 'Slices to rank and draw, each `{ id, label, value, sublabel? }`.' },
    label: { control: 'text', description: 'The ring\'s accessible name, e.g. "Par classe d\'actif".' },
    othersLabel: { control: 'text', description: 'Label of the grouped slice beyond the sixth, e.g. "Autres".' },
    valueFormat: { control: false, description: "Formats a slice's value, for the legend and the centre." },
    shareFormat: { control: false, description: "Formats a slice's share (0..1), for the legend and the centre." },
    sliceSelect: { description: 'Emitted with a slice id when its legend row is activated.' },
  },
};

export default meta;
type Story = StoryObj<DonutArgs>;

export const ByAssetClass: Story = {
  name: 'Five slices, by asset class',
};

export const ByAccount: Story = {
  name: 'Seven slices grouped into Others, by account',
  args: { slices: byAccount, label: 'Par compte' },
};

export const TinySlice: Story = {
  name: 'A slice under 1 %',
  args: { slices: withATinySlice, label: 'Par compte' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const tinyRow = canvas.getByRole('button', { name: /Binance/ });

    await userEvent.hover(tinyRow);
    await userEvent.click(tinyRow);

    await expect(args.sliceSelect).toHaveBeenCalledWith('binance');
  },
};

export const MaskedAmounts: Story = {
  name: 'Masked amounts',
  args: { valueFormat: maskedEur },
};

export const HoverHighlightsTheLegendRow: Story = {
  name: 'Hover highlights the legend row and the centre',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: /Fonds/ });

    await userEvent.hover(row);

    await expect(row).toHaveClass('bg-(--soft)');

    const centre = canvasElement.querySelector('[data-testid="donut-centre"]') as HTMLElement;
    await expect(within(centre).getByText('Fonds')).toBeInTheDocument();
  },
};

export const SelectingARowEmitsSliceSelect: Story = {
  name: 'Selecting a row emits sliceSelect',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /Actions/ }));

    await expect(args.sliceSelect).toHaveBeenCalledWith('stocks');
  },
};

export const HighlightStaysOnTheRing: Story = {
  name: 'The highlighted slice stays on the ring',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvas.getByRole('button', { name: /Crypto/ }));

    const arcs = canvasElement.querySelectorAll<SVGCircleElement>('svg circle[data-slice]');
    await expect(arcs[4]?.style.strokeWidth).toBe('38px');
    await expect(arcs[0]?.style.strokeWidth).toBe('30px');
    await expect(canvasElement.querySelector('svg [style*="transform"]')).toBeNull();
  },
};
