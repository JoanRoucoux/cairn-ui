import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import {
  CARD_PADDINGS,
  CARD_SURFACES,
  CARD_VARIANTS,
  type CardPadding,
  type CardSurface,
  type CardVariant,
  UiCard,
} from './card';

type CardArgs = {
  variant: CardVariant;
  padding: CardPadding;
  surface: CardSurface;
  label: string;
};

const meta: Meta<CardArgs> = {
  title: 'Surfaces/Card',
  decorators: [moduleMetadata({ imports: [UiCard] })],
  parameters: {
    docs: {
      description: {
        component: `Surface that groups related content, such as a summary block, a table or a side panel.

#### When to use

* To draw a boundary around content that belongs together and can be read on its own.
* With \`padding="none"\` when the content manages its own spacing, which is what a table does.
* With \`surface="lg"\` or \`"max-lg"\` when the same block is a card at one width only, such as a detail that is a card beside the list on a desktop and a plain screen on an iPhone.

#### When not to use

* As a spacing utility. If nothing is being grouped, a card adds a border for no reason.
* Nested inside another card of the same variant. Two identical surfaces stacked read as one.

#### Accessibility

* The card is a plain visual container. It carries no role and no landmark.
* When it groups a distinct section of a screen, give the content inside it a heading, so the
  section is reachable from a screen reader's heading list.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-card [variant]="variant" [padding]="padding" [surface]="surface">{{ label }}</ui-card>`,
  }),
  args: {
    variant: 'default',
    padding: 'md',
    surface: 'always',
    label: 'Total portfolio value',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...CARD_VARIANTS],
      description:
        "`default` for a primary surface. `elevated` sits on the same tokens as a table's zebra rows, for content that should read as secondary to a `default` card next to it.",
    },
    padding: {
      control: 'select',
      options: [...CARD_PADDINGS],
      description:
        'Inner spacing; `md` follows `--inset-card` (16 px, 24 px from 1 024 px), `list` keeps a narrow side padding for rows that carry their own inset, `rows` is the 4 px / `--inset-card` inset of a ruled list such as facts, `none` when the content manages its own (e.g. a table).',
    },
    surface: {
      control: 'inline-radio',
      options: [...CARD_SURFACES],
      description:
        'Where the fill, the border, the radius and the padding apply: `always` (default), `lg` (from 64rem, plain below), or `max-lg` (below 64rem, plain from it). The block stays one element, so a detail screen can be a card on a desktop and a plain page on an iPhone.',
    },
    label: { control: 'text', description: 'Projected content.' },
  },
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Default: Story = {};

export const Elevated: Story = {
  args: { variant: 'elevated' },
};

export const Flush: Story = {
  args: { padding: 'none' },
};

export const List: Story = {
  args: { padding: 'list' },
};

export const RendersContent: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(args.label)).toBeVisible();
  },
};

export const CardOnDesktopOnly: Story = {
  name: 'Surface lg, plain on an iPhone',
  args: { surface: 'lg', label: 'Card from 64rem' },
};

export const CardOnIPhoneOnly: Story = {
  name: 'Surface max-lg, plain on a desktop',
  args: { surface: 'max-lg', label: 'Card below 64rem' },
};
