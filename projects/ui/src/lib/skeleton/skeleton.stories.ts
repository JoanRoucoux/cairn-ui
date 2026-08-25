import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import { UiSkeleton } from './skeleton';

type SkeletonArgs = {
  lines: number;
  height: number;
};

const meta: Meta<SkeletonArgs> = {
  title: 'Feedback/Skeleton',
  decorators: [moduleMetadata({ imports: [UiSkeleton] })],
  render: (args) => ({
    props: args,
    template: `<ui-skeleton [lines]="lines" [height]="height" />`,
  }),
  args: { lines: 3, height: 12 },
  argTypes: {
    lines: { control: { type: 'number', min: 1, max: 12 } },
    height: { control: { type: 'number', min: 4, max: 240 } },
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
