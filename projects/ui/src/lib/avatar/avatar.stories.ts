import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { AVATAR_SIZES, type AvatarSize, UiAvatar } from './avatar';

type AvatarArgs = {
  initials: string;
  label: string;
  size: AvatarSize;
};

const meta: Meta<AvatarArgs> = {
  title: 'Data display/Avatar',
  decorators: [moduleMetadata({ imports: [UiAvatar] })],
  render: (args) => ({
    props: args,
    template: `<ui-avatar [initials]="initials" [label]="label" [size]="size" />`,
  }),
  args: {
    initials: 'JR',
    label: 'My account',
    size: 'md',
  },
  argTypes: {
    initials: { control: 'text' },
    label: { control: 'text' },
    size: { control: 'select', options: [...AVATAR_SIZES] },
  },
};

export default meta;
type Story = StoryObj<AvatarArgs>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const IsNamed: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('img', { name: args.label })).toBeVisible();
  },
};
