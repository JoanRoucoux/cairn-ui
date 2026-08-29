import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import { UiSkeleton } from './skeleton';

type SkeletonArgs = {
  lines: number;
  height: number;
};

const meta: Meta<SkeletonArgs> = {
  title: 'Feedback/Skeleton',
  decorators: [moduleMetadata({ imports: [UiSkeleton] })],
  parameters: {
    docs: {
      description: {
        component: `Placeholder standing in for content that has not arrived yet, such as a card, a chart or
a row of a table. Above one line, the last bar is shortened so the block reads as the tail of a
paragraph rather than another full width line.

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
* The pulse is behind \`motion-safe\`, so it stops for users who ask for reduced motion.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-skeleton [lines]="lines" [height]="height" />`,
  }),
  args: { lines: 3, height: 12 },
  argTypes: {
    lines: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'Number of bars. Above 1, the last one is narrower so the block reads as a paragraph tail.',
    },
    height: {
      control: { type: 'number', min: 4, max: 240 },
      description: 'Bar height in pixels. Match the text or the element being stood in for.',
    },
  },
};

export default meta;
type Story = StoryObj<SkeletonArgs>;

export const Paragraph: Story = {};

export const SingleBar: Story = {
  args: { lines: 1, height: 16 },
};

export const Chart: Story = {
  args: { lines: 1, height: 196 },
};
