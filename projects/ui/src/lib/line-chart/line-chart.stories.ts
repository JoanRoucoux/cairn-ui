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
  deltaFormat: (delta: number) => string;
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
      v: 161389.51 + 2904.77 * progress + wobble,
    };
  });

const oneMonthPoints = buildMonthlySeries(Date.UTC(2026, 7, 25), 31);

const oneDayPoints: ChartPoint[] = Array.from({ length: 24 }, (_, hour) => ({
  t: Date.UTC(2026, 8, 25, hour),
  v: 163881.95 + Math.sin(hour / 2) * 320 + hour * 21,
}));

const flatPoints: ChartPoint[] = [
  { t: Date.UTC(2026, 7, 1), v: 42000 },
  { t: Date.UTC(2026, 8, 25), v: 42000 },
];

const singlePoint: ChartPoint[] = [{ t: Date.UTC(2026, 8, 25), v: 164294.28 }];

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

Formatting and locale are the consumer's business: \`valueFormat\`, \`deltaFormat\`, \`timeFormat\` and
\`axisFormat\` all arrive as inputs, so masking amounts is a matter of passing a formatter that
returns bullets instead of digits — the curve's shape stays visible either way.

The host fills its parent's height (\`block h-full\`); size the chart by sizing its container.

#### When to use

* Portfolio or instrument value over a selectable range, one series at a time.

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
* \`touch-pan-y\` lets a vertical swipe scroll the page while a horizontal drag still moves the
  tooltip.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<div style="height: 240px;"><ui-line-chart [points]="points" [label]="label" [startLabel]="startLabel" [timeColumnLabel]="timeColumnLabel" [valueColumnLabel]="valueColumnLabel" [valueFormat]="valueFormat" [deltaFormat]="deltaFormat" [timeFormat]="timeFormat" [axisFormat]="axisFormat" /></div>`,
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
      options: ['compact', 'large'],
      description:
        '`compact` (default) sits 12px above the plot with label and caption sizes; `large` is the desktop Dashboard tooltip, at the top of the plot with body and label sizes.',
    },
    tooltipDelta: {
      control: 'boolean',
      description: 'Shows the change since the start in the tooltip. Defaults to true.',
    },
    axisGap: {
      control: 'number',
      description:
        'Pixels between the plot and the axis row, 12 by default and 16 on the desktop Dashboard. The box is plot + gap + 17.',
    },
    sparkline: {
      control: 'boolean',
      description:
        'Draws the curve alone at 1.5px, with no reference line, dot, axis or tooltip, and out of the tab order. Size it with the container.',
    },
    valueFormat: { control: false, description: 'Formats a point value for the tooltip and the start label.' },
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

export const DashboardPhone: Story = framed(326, 205, '');

export const DashboardDesktop: Story = framed(688, 404, 'tooltip="large" [axisGap]="16"');

export const LignesPhone: Story = framed(326, 179, '[tooltipDelta]="false"');

export const LignesDesktop: Story = framed(352, 169, '[tooltipDelta]="false"');

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
        switchRange: () => points.set(oneDayPoints),
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

    const plotHeight = plotHeightFor(240, false, 12);
    const padding = plotPaddingFor(plotHeight, false);
    const target = buildGeometry(oneDayPoints, 640, plotHeight, { x: 0, top: padding, bottom: padding });

    await expect(canvasElement.querySelector('[data-chart-line]')).toHaveAttribute('d', target?.line);
  },
};
