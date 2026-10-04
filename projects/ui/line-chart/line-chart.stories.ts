import { signal } from '@angular/core';

import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { plotHeightFor, plotPaddingFor } from './internal/chart-layout';
import { buildGeometry } from './internal/chart-scale';
import { type ChartPoint, UiLineChart } from './line-chart';

type LineChartArgs = {
  points: ChartPoint[];
  label: string;
  startLabel: string;
  timeColumnLabel: string;
  valueColumnLabel: string;
  valueFormat: (value: number) => string;
  tooltipFormat?: (point: ChartPoint) => string;
  deltaFormat: (delta: number) => string;
  deltaSuffix?: string;
  timeFormat: (time: number) => string;
  axisFormat: (time: number) => string;
};

const eur = (value: number): string =>
  `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}\u00a0\u20ac`;

const signedEur = (delta: number): string => `${delta > 0 ? '+' : delta < 0 ? '\u2212' : ''}${eur(Math.abs(delta))}`;

const dayFormat = (time: number): string =>
  new Date(time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const hourFormat = (time: number): string =>
  new Date(time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const buildMonthlySeries = (start: number, days: number): ChartPoint[] =>
  Array.from({ length: days }, (_, index) => {
    const progress = index / (days - 1);
    const wobble = Math.sin(index * 1.3) * 900;

    return {
      t: start + index * 24 * 60 * 60 * 1000,
      v: 142120.75 + 2418.6 * progress + wobble,
    };
  });

const oneMonthPoints = buildMonthlySeries(Date.UTC(2026, 7, 25), 31);

const oneDayPoints: ChartPoint[] = Array.from({ length: 24 }, (_, hour) => ({
  t: Date.UTC(2026, 8, 25, hour),
  v: 142864.2 + Math.sin(hour / 2) * 320 + hour * 21,
}));

const flatPoints: ChartPoint[] = [
  { t: Date.UTC(2026, 7, 1), v: 42000 },
  { t: Date.UTC(2026, 8, 25), v: 42000 },
];

const singlePoint: ChartPoint[] = [{ t: Date.UTC(2026, 8, 25), v: 144539.35 }];

const crowdedRightEndPoints: ChartPoint[] = Array.from({ length: 60 }, (_, index) => ({
  t: Date.UTC(2026, 7, 1) + index * 12 * 60 * 60 * 1000,
  v: index < 54 ? 50000 : 50000 + (index - 53) * 12000,
}));

const sparklinePoints: ChartPoint[] = [6, 7, 4, 9, 15, 13, 19, 20].map((v, index) => ({
  t: Date.UTC(2026, 8, 18) + index * 24 * 60 * 60 * 1000,
  v,
}));

const meta: Meta<LineChartArgs> = {
  title: 'Data display/Line chart',
  decorators: [moduleMetadata({ imports: [UiLineChart] })],
  parameters: {
    docs: {
      description: {
        component: `A single series' value over time: a monotone curve (Fritsch-Carlson, the same interpolation
as d3's \`curveMonotoneX\`) that never overshoots the data between two points, a dashed reference
line at the range's starting value with its "Départ" label, a focus/hover tooltip with the change
since the start, and a shape transition when \`points\` changes to a new range.

The transition runs only for a new \`points\` array: mounting, the first measured size and any later
resize draw at once. It lasts \`--duration-base\` with an ease-out, restarts from the shape on screen
when the range changes again, and moves the end dot along the curve. The "Départ" label and the
dashed line fade out when it starts and back in at their new place when it ends; the tooltip waits
for the end. Under \`prefers-reduced-motion\` the new series shows at once.

Bind \`rangeKey\` (the range's id, \`1M\`, \`1A\`) and only a series that comes with a new key
interpolates: the same range reloaded after a buy, or a refresh of its prices, redraws at once with
no fade, as MOUVEMENT.md animates the curve on a range change only. The key may change before its
series arrives; the interpolation runs when the series does. Without \`rangeKey\`, every new series
interpolates.

Formatting and locale are the consumer's business: \`valueFormat\`, \`deltaFormat\`, \`timeFormat\` and
\`axisFormat\` all arrive as inputs, so masking amounts is a matter of passing a formatter that
returns bullets instead of digits — the curve's shape stays visible either way.

The host fills its parent's height (\`block h-full\`); size the chart by sizing its container.

#### When to use

* Portfolio or instrument value over a selectable range, one series at a time.
* A short history under a coarse \`axisFormat\` (years on a 5-year range): a tick label equal to the
  previous drawn one is skipped, so the axis never reads "2026 2026 2026".

#### When not to use

* A compact inline figure with its own axis and tooltip. Pass \`sparkline\` for the 80 x 24 form
  (curve only, no axis, reference line, dot or tooltip, and out of the tab order).
* Comparing two or more series at once: the reference line and the tooltip both assume a single
  series.

#### Accessibility

* The \`<svg>\` is \`role="img"\` named by \`label\`, and focusable: Arrow Left/Right move the focused
  point one at a time, Home/End jump to the first/last point, Escape clears it.
* Every point is also available as a \`sr-only\` \`<table>\`, headed by \`timeColumnLabel\` and
  \`valueColumnLabel\`, so the data survives without the SVG.
* \`touch-none\` on the plot: a tap shows the tooltip and a drag moves it, while the page still scrolls
  everywhere else. Release or cancel hides it.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<div style="height: 240px;"><ui-line-chart [points]="points" [label]="label" [startLabel]="startLabel" [timeColumnLabel]="timeColumnLabel" [valueColumnLabel]="valueColumnLabel" [valueFormat]="valueFormat" [deltaFormat]="deltaFormat" [deltaSuffix]="deltaSuffix" [timeFormat]="timeFormat" [axisFormat]="axisFormat" /></div>`,
  }),
  args: {
    points: oneMonthPoints,
    label: 'Net worth over one month',
    startLabel: 'Départ',
    timeColumnLabel: 'Date',
    valueColumnLabel: 'Value',
    valueFormat: eur,
    deltaFormat: signedEur,
    timeFormat: dayFormat,
    axisFormat: dayFormat,
  },
  argTypes: {
    points: { control: false, description: 'Series of `{ t, v }` points, ordered by time.' },
    label: { control: 'text', description: 'The SVG\'s accessible name (`role="img"`).' },
    startLabel: {
      control: 'text',
      description: 'Prefix of the reference-line label, e.g. `Départ`. Empty hides the label.',
    },
    timeColumnLabel: { control: 'text', description: "Header of the screen-reader table's time column." },
    valueColumnLabel: { control: 'text', description: "Header of the screen-reader table's value column." },
    tooltip: {
      control: 'inline-radio',
      options: ['compact', 'large', 'auto'],
      description:
        '`compact` (default) sits 12px above the plot with label and caption sizes; `large` is the desktop Dashboard tooltip, at the top of the plot with body and label sizes; `auto` is compact below 64rem and large from 64rem up, with no breakpoint in the consumer.',
    },
    deltaSuffix: { control: 'text', description: 'Text after the tooltip change, kept when masked.' },
    tooltipDelta: {
      control: 'boolean',
      description: 'Shows the change since the start in the tooltip. Defaults to true.',
    },
    axisGap: {
      control: 'number',
      description:
        'Pixels between the plot and the axis row, 12 by default and 16 on the desktop Dashboard, or "auto" for 12 below 64rem and 16 from 64rem up. The box is plot + gap + 17.',
    },
    axisTicks: {
      control: 'inline-radio',
      options: ['auto', 3, 5],
      description:
        '3 draws start, middle and end only (Lignes), 5 draws five labels, auto (default) draws 3 below 40rem and 5 above (Dashboard).',
    },
    sparkline: {
      control: 'boolean',
      description:
        'Draws the curve alone at 1.5px, with no reference line, dot, axis or tooltip, and out of the tab order. Size it with the container.',
    },
    valueFormat: {
      control: false,
      description:
        'Formats a point value for the start label, the screen-reader table and, without tooltipFormat, the tooltip.',
    },
    tooltipFormat: {
      control: false,
      description:
        'Formats a whole point for the tooltip value line, when it reads more than the value (a position value and its unit price). Falls back to valueFormat.',
    },
    rangeKey: {
      control: false,
      description:
        'Id of the range the series belongs to. When bound, a new series interpolates only if it comes with a new key; under the same key it redraws at once, with no fade. Null (default) interpolates every new series.',
    },
    deltaFormat: { control: false, description: 'Formats the signed change since the first point, for the tooltip.' },
    timeFormat: { control: false, description: "Formats a point's time for the tooltip and the table." },
    axisFormat: { control: false, description: 'Formats a tick time for the axis.' },
  },
};

export default meta;
type Story = StoryObj<LineChartArgs>;

export const OneMonth: Story = {};

const framed = (width: number, height: number, attributes: string): Story => ({
  render: (args) => ({
    props: args,
    template: `<div style="width: ${width}px; height: ${height}px;"><ui-line-chart ${attributes} [points]="points" [label]="label" startLabel="Départ" [valueFormat]="valueFormat" [deltaFormat]="deltaFormat" [timeFormat]="timeFormat" [axisFormat]="axisFormat" /></div>`,
  }),
});

export const DashboardPhone: Story = framed(326, 205, 'tooltip="auto" axisGap="auto"');

export const DashboardDesktop: Story = framed(688, 404, 'tooltip="auto" axisGap="auto"');

export const LignesPhone: Story = framed(326, 179, '[tooltipDelta]="false" axisTicks="3"');

export const LignesDesktop: Story = framed(352, 169, '[tooltipDelta]="false" axisTicks="3"');

export const Sparkline: Story = {
  render: (args) => ({
    props: { ...args, sparklinePoints },
    template: `<div class="h-6 w-20"><ui-line-chart sparkline [points]="sparklinePoints" [label]="label" [valueFormat]="valueFormat" [timeFormat]="timeFormat" /></div>`,
  }),
  args: { label: 'Évolution sur 7 jours' },
};

export const OneDay: Story = {
  args: {
    points: oneDayPoints,
    label: 'Net worth over one day',
    startLabel: 'Départ',
    timeFormat: hourFormat,
    axisFormat: hourFormat,
  },
};

const yearFormat = (time: number): string => String(new Date(time).getUTCFullYear());

const shortHistoryPoints: ChartPoint[] = Array.from({ length: 12 }, (_, index) => ({
  t: Date.UTC(2026, 3, 1) + index * 14 * 24 * 60 * 60 * 1000,
  v: 52000 + index * 900 + Math.sin(index) * 400,
}));

export const ShortFiveYearHistory: Story = {
  name: 'Short history on a 5-year range',
  args: {
    points: shortHistoryPoints,
    label: 'Net worth, five-year range with a few months of data',
    axisFormat: yearFormat,
  },
  play: async ({ canvasElement }) => {
    const labels = [...canvasElement.querySelectorAll('[data-chart-axis-tick]')].map((tick) =>
      tick.textContent?.trim(),
    );

    await expect(labels).toEqual(['2026']);
  },
};

export const FlatSeries: Story = {
  name: 'Flat series',
  args: { points: flatPoints, label: 'Net worth, unchanged' },
};

export const SinglePoint: Story = {
  name: 'Single point',
  args: { points: singlePoint, label: 'Net worth, a single point' },
};

export const StartLabelMovesAside: Story = {
  name: 'Start label moves aside from a crowded right end',
  args: { points: crowdedRightEndPoints, label: 'Net worth, start label crowded' },
};

export const MaskedAmounts: Story = {
  name: 'Masked amounts',
  args: {
    valueFormat: () => '\u2022\u2022\u2022\u2022 \u20ac',
    deltaFormat: () => '\u2022\u2022\u2022\u2022 \u20ac',
    deltaSuffix: 'depuis le début',
  },
};

export const HoverShowsTheTooltip: Story = {
  name: 'Hover shows the tooltip',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvasElement.querySelector('svg') as HTMLElement;

    await userEvent.hover(svg);

    await expect(canvas.getByTestId('chart-tooltip')).toBeInTheDocument();
  },
};

export const RangeTransitionSettles: Story = {
  name: 'A range transition settles on the exact target shape',
  render: () => {
    const points = signal<ChartPoint[]>(oneMonthPoints);

    return {
      props: {
        points,
        valueFormat: eur,
        switchRange: () => points.update((current) => (current === oneDayPoints ? oneMonthPoints : oneDayPoints)),
      },
      template: `
        <div style="width: 640px; height: 240px;">
          <ui-line-chart [points]="points()" label="Net worth" startLabel="Départ" [valueFormat]="valueFormat" />
        </div>
        <button type="button" (click)="switchRange()">Switch range</button>
      `,
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Switch range' }));
    await new Promise((resolve) => setTimeout(resolve, 400));

    const plotHeight = plotHeightFor(240, false, 12, false);
    const padding = plotPaddingFor(plotHeight, false);
    const target = buildGeometry(oneDayPoints, 640, plotHeight, { x: 0, top: padding, bottom: padding });

    await expect(canvasElement.querySelector('[data-chart-line]')).toHaveAttribute('d', target?.line);
  },
};

export const SameRangeReloadDrawsAtOnce: Story = {
  name: 'A reload of the same range draws at once, a new range interpolates',
  render: () => {
    const points = signal<ChartPoint[]>(oneMonthPoints);
    const rangeKey = signal('1M');

    return {
      props: {
        points,
        rangeKey,
        valueFormat: eur,
        reload: () => points.set(oneMonthPoints.map((point) => ({ ...point, v: point.v + 4000 }))),
        switchRange: () => {
          rangeKey.set('1J');
          points.set(oneDayPoints);
        },
      },
      template: `
        <div style="width: 640px; height: 240px;">
          <ui-line-chart [points]="points()" [rangeKey]="rangeKey()" label="Net worth" startLabel="Départ" [valueFormat]="valueFormat" />
        </div>
        <button type="button" (click)="reload()">Reload</button>
        <button type="button" (click)="switchRange()">Switch range</button>
      `,
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fading = (): Animation[] => canvasElement.querySelector('svg')!.getAnimations({ subtree: true });

    await userEvent.click(canvas.getByRole('button', { name: 'Reload' }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    await expect(canvasElement.querySelector('[data-chart-start-label]')).not.toHaveClass('opacity-0');
    await expect(fading()).toHaveLength(0);

    await userEvent.click(canvas.getByRole('button', { name: 'Switch range' }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    await expect(canvasElement.querySelector('[data-chart-start-label]')).toHaveClass('opacity-0');
  },
};

export const LignesDetailTooltip: Story = {
  name: 'Lignes detail, tooltip with the unit price',
  args: {
    tooltipFormat: (point: ChartPoint) => `${eur(point.v)} · cours ${eur(point.v / 500)}`,
  },
  render: (args) => ({
    props: args,
    template: `<div data-frame class="bg-(--card) p-4" style="width: 358px"><div style="height: 150px;"><ui-line-chart [tooltipDelta]="false" axisTicks="3" [points]="points" [label]="label" startLabel="Départ" [valueFormat]="valueFormat" [tooltipFormat]="tooltipFormat" [timeFormat]="timeFormat" [axisFormat]="axisFormat" /></div></div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvasElement.querySelector('svg') as HTMLElement);

    await expect(canvas.getByTestId('chart-tooltip')).toHaveTextContent(/cours/);
    await expect(canvas.getByText(/^Départ /)).not.toHaveTextContent(/cours/);
  },
};

export const ScreenReaderTableDoesNotWiden: Story = {
  name: 'The screen-reader table does not widen its host',
  render: (args) => ({
    props: args,
    template: `<div data-frame style="width: 326px; height: 205px; overflow: visible;"><ui-line-chart [points]="points" [label]="label" [valueFormat]="valueFormat" [timeFormat]="timeFormat" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('table') as HTMLElement;

    await expect(table.parentElement as HTMLElement).toHaveClass('sr-only');
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
