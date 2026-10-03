import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AVATAR_SIZES, type AvatarSize, UiAvatar, UiAvatarLink } from './avatar';

type AvatarArgs = {
  initials: string;
  label: string;
  size: AvatarSize;
};

const meta: Meta<AvatarArgs> = {
  title: 'Data display/Avatar',
  decorators: [moduleMetadata({ imports: [UiAvatar, UiAvatarLink] })],
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
      description:
        'Disc diameter: `sm` 32 px, `md` 34 px (iPhone header), `lg` 56 px (Profil), `auto` 34 px then 32 px from 64rem (the app header).',
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
      <a uiAvatarLink href="#">
        <ui-avatar initials="JO" label="Profil" size="auto" />
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

export const InProfileLinkCurrentPage: Story = {
  name: 'In a link, current page',
  render: () => ({
    template: `
      <a uiAvatarLink href="#" aria-current="page">
        <ui-avatar initials="JO" label="Profil" size="auto" />
      </a>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'Profil' })).toHaveAttribute('aria-current', 'page');
  },
};

export const CurrentPageArrivesAtOnce: Story = {
  name: 'In a link, becoming the current page draws the halo at once',
  render: () => ({
    props: { current: false },
    template: `
      <a uiAvatarLink href="#" [attr.aria-current]="current ? 'page' : null">
        <ui-avatar initials="JO" label="Profil" size="auto" />
      </a>
      <button type="button" (click)="current = !current">Navigate</button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Profil' });
    const runs: string[] = [];
    const record = (event: TransitionEvent): void => {
      runs.push(event.propertyName);
    };

    link.addEventListener('transitionrun', record);
    await userEvent.click(canvas.getByRole('button', { name: 'Navigate' }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    link.removeEventListener('transitionrun', record);

    await expect(link).toHaveAttribute('aria-current', 'page');
    await expect(runs).toEqual([]);
    await expect(getComputedStyle(link).backgroundImage).not.toBe('none');
  },
};
