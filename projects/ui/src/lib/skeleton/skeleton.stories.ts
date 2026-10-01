import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import { SKELETON_SHAPES, type SkeletonShape, UiSkeleton } from './skeleton';

type SkeletonArgs = {
  shape: SkeletonShape;
  lines: number;
  height: number;
  size: number;
};

const meta: Meta<SkeletonArgs> = {
  title: 'Feedback/Skeleton',
  decorators: [moduleMetadata({ imports: [UiSkeleton] })],
  parameters: {
    docs: {
      description: {
        component: `Placeholder standing in for content that has not arrived yet, at the shape of the content it
replaces: text, a dominant figure, a list row, a chart, or a ring.

\`shape="text"\` (the default) draws one bar per \`lines\`; above one line, the last bar is shortened so
the block reads as the tail of a paragraph rather than another full width line. \`figure\` is the 260 by
40 dominant figure and \`row\` a list row. \`chart\` fills its host from a 200px floor, so the
screen sizes the box (200 on the phone, 300 and more on the desktop). \`ring\` takes \`size\`
(232 on the phone, 240 on the desktop) with a 30px band. None of them reads \`lines\` or \`height\`.

#### When to use

* While a first load is in flight, sized and positioned like the content it replaces, so nothing
  jumps when the real content lands.

#### When not to use

* For a refresh of content already on screen. Replacing what the user is reading with grey bars
  loses their place.
* For a wait with no known shape. A skeleton promises a layout it then has to deliver.

#### Accessibility

* The whole block is \`aria-hidden\`, so a screen reader never announces a row of decorative bars.
* The announcement is the calling screen's job: it owns the \`role="status"\` sentence that says
  content is loading. This component only paints.
* The pulse reads its duration from \`--pulse-duration\`, which \`tokens.css\` sets to \`0ms\` under
  \`prefers-reduced-motion: reduce\`: it stops there with no branching in this component.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-skeleton [shape]="shape" [lines]="lines" [height]="height" [size]="size" />`,
  }),
  args: { shape: 'text', lines: 3, height: 12, size: 232 },
  argTypes: {
    shape: {
      control: 'select',
      options: [...SKELETON_SHAPES],
      description: 'The shape of the content being stood in for. `text` is the only one `lines` and `height` affect.',
    },
    lines: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'Number of bars, `shape="text"` only. Above 1, the last one is narrower.',
    },
    size: {
      control: { type: 'number', min: 40, max: 400 },
      description:
        'Diameter in pixels, `shape="ring"` only. 232 on the phone, 240 on the desktop; the band is always 30px.',
    },
    height: {
      control: { type: 'number', min: 4, max: 240 },
      description: 'Bar height in pixels, `shape="text"` only. Match the text being stood in for.',
    },
  },
};

export default meta;
type Story = StoryObj<SkeletonArgs>;

export const Paragraph: Story = {};

export const SingleBar: Story = {
  args: { lines: 1, height: 16 },
};

export const Figure: Story = {
  args: { shape: 'figure' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-2">
        <ui-skeleton class="w-[84px]" [height]="14" />
        <ui-skeleton [shape]="shape" />
        <ui-skeleton class="w-[180px]" [height]="14" />
      </div>
    `,
  }),
};

export const Row: Story = {
  args: { shape: 'row' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex w-[280px] flex-col gap-3.5">
        <ui-skeleton [shape]="shape" />
        <ui-skeleton [shape]="shape" />
        <ui-skeleton [shape]="shape" />
      </div>
    `,
  }),
};

export const Chart: Story = {
  args: { shape: 'chart' },
  render: (args) => ({
    props: args,
    template: `<div class="flex h-[200px] w-[326px] flex-col"><ui-skeleton [shape]="shape" /></div>`,
  }),
};

export const ChartFillsItsHost: Story = {
  args: { shape: 'chart' },
  render: (args) => ({
    props: args,
    template: `<div class="flex h-[340px] w-[688px] flex-col"><ui-skeleton class="flex-1" [shape]="shape" /></div>`,
  }),
};

export const Ring: Story = {
  args: { shape: 'ring' },
};

export const RingDesktop: Story = {
  args: { shape: 'ring', size: 240 },
};
