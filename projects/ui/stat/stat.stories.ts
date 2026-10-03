import { UiDelta } from '@joanroucoux/cairn-ui/delta';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { STAT_SIZES, type StatSize, UiStat } from './stat';

type StatArgs = {
  label: string;
  size: StatSize;
  value: string;
  delta: string;
};

const meta: Meta<StatArgs> = {
  title: 'Data display/Stat',
  decorators: [moduleMetadata({ imports: [UiDelta, UiStat] })],
  parameters: {
    docs: {
      description: {
        component: `Label, figure and a named period of change, at two sizes: a \`hero\` for a screen's single
headline number, or a smaller \`tile\` repeated in a grid.

The figure goes in \`[uiStatValue]\`, already formatted by the caller. \`[uiStatDelta]\` takes a
\`ui-delta\` carrying the change, \`[uiStatCaption]\` names the period it covers (such as "over 1
month"), and \`[uiStatAside]\` is an optional slot for a compact visual such as a sparkline. All
three are optional; only the value is required.

#### When to use

* For the single most important figure on a screen, at \`size="hero"\`.
* For one figure among several of the same kind, such as one tile per account, at the default
  \`size="tile"\`.

#### When not to use

* For a figure with no period attached and nothing changing over time. A plain value in a
  \`ui-card\` is enough.

#### Accessibility

* The label and the figure are a \`dt\`/\`dd\` pair inside a \`dl\`, so the association survives without
  extra ARIA.
* The \`hero\` figure is at least 48px with proportional digits, never \`tabular-nums\`: a lone
  headline number is not a column of aligned figures.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-stat [label]="label" [size]="size">
        <span uiStatValue>{{ value }}</span>
        <ui-delta uiStatDelta [value]="1" unknownLabel="Non disponible">{{ delta }}</ui-delta>
        <span uiStatCaption>aujourd'hui</span>
      </ui-stat>
    `,
  }),
  args: {
    label: 'Patrimoine',
    size: 'hero',
    value: '164 294,28 €',
    delta: '+412,56 € · +0,25 %',
  },
  argTypes: {
    value: { control: 'text', description: 'The formatted figure, projected into the value slot.' },
    delta: { control: 'text', description: 'The formatted, signed change, projected into the delta slot.' },
    label: { control: 'text', description: "The stat's label, in sentence case and without a trailing colon." },
    size: {
      control: 'inline-radio',
      options: [...STAT_SIZES],
      description: "`hero` for a screen's single headline figure, `tile` for one among several.",
    },
  },
};

export default meta;
type Story = StoryObj<StatArgs>;

export const Hero: Story = {};

export const Tile: Story = {
  args: { size: 'tile', label: 'Plus-value latente', value: '+21 846,90 €', delta: '+15,34 %' },
  render: (args) => ({
    props: args,
    template: `
      <div class="rounded-container box-content w-[200px] bg-(--card) p-4 shadow-[inset_0_0_0_1px_var(--border)]">
        <ui-stat [label]="label" [size]="size">
          <span uiStatValue>{{ value }}</span>
          <ui-delta uiStatDelta [value]="1" unknownLabel="Non disponible">{{ delta }}</ui-delta>
        </ui-stat>
      </div>
    `,
  }),
};

export const WithoutDelta: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ui-stat [label]="label" [size]="size">
        <span uiStatValue>{{ value }}</span>
      </ui-stat>
    `,
  }),
};

export const WithAside: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ui-stat [label]="label" [size]="size">
        <span uiStatValue>{{ value }}</span>
        <ui-delta uiStatDelta [value]="1" unknownLabel="Non disponible">{{ delta }}</ui-delta>
        <span uiStatCaption>aujourd'hui</span>
        <svg uiStatAside width="80" height="32" viewBox="0 0 80 32" aria-hidden="true">
          <polyline points="0,24 20,18 40,20 60,8 80,4" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </ui-stat>
    `,
  }),
};

export const AssociatesLabelAndValue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dt = canvasElement.querySelector('dt');
    const dd = canvasElement.querySelector('dd');

    await expect(dt).toHaveTextContent('Patrimoine');
    await expect(dd).toHaveTextContent('164 294,28 €');
    await expect(canvas.getByText("aujourd'hui")).toBeInTheDocument();
  },
};
