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
  parameters: {
    docs: {
      description: {
        component: `Initials in a disc, standing in for a person.

#### When to use

* As the account entry in the shell. Cairn is a single user application, so exactly one avatar is on
  screen at a time.

#### When not to use

* As a decorative shape. It carries an image role and an accessible name, both of which cost a
  screen reader something to announce.
* To display an uploaded picture. This component draws initials only.

#### Accessibility

* The host carries \`role="img"\` and takes its accessible name from \`label\`.
* The initials are \`aria-hidden\`, so a screen reader announces the real name instead of spelling
  out two letters.`,
      },
    },
  },
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
    initials: {
      control: 'text',
      description: 'Two-letter (or so) glyph rendered inside the disc. Purely decorative: hidden from assistive tech.',
    },
    label: {
      control: 'text',
      description: 'Accessible name, announced instead of the initials. Usually the full name.',
    },
    size: {
      control: 'select',
      options: [...AVATAR_SIZES],
      description: 'Disc diameter: `sm` 32 px, `md` 34 px (iPhone header), `lg` 56 px (Profil).',
    },
  },
};

export default meta;
type Story = StoryObj<AvatarArgs>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const InProfileLink: Story = {
  render: () => ({
    template: `
      <a href="#" aria-label="Profil" class="grid size-10 place-items-center rounded-pill hover:bg-(--glow) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)">
        <ui-avatar initials="JO" label="Profil" size="sm" />
      </a>
    `,
  }),
};

export const InProfileLinkTouch: Story = {
  render: () => ({
    template: `
      <a href="#" aria-label="Profil" class="grid size-11 place-items-center rounded-pill active:scale-(--press-scale)">
        <ui-avatar initials="JO" label="Profil" size="md" />
      </a>
    `,
  }),
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const IsNamed: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('img', { name: args.label })).toBeVisible();
  },
};
