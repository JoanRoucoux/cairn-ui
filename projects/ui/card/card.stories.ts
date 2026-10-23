import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import {
  CARD_BORDERS,
  CARD_PADDINGS,
  CARD_SURFACES,
  CARD_VARIANTS,
  type CardBorder,
  type CardPadding,
  type CardSurface,
  type CardVariant,
  UiCard,
} from './card';

type CardArgs = {
  variant: CardVariant;
  border: CardBorder;
  padding: CardPadding;
  surface: CardSurface;
  clip: boolean;
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
* With \`surface="lg"\` or \`"max-lg"\` when the same block is a card at one width only, such as a detail that is a card beside the list on a desktop and a plain screen on a phone.

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
    template: `<ui-card [variant]="variant" [border]="border" [padding]="padding" [surface]="surface" [clip]="clip">{{ label }}</ui-card>`,
  }),
  args: {
    variant: 'default',
    border: 'auto',
    padding: 'md',
    surface: 'always',
    clip: false,
    label: 'Total portfolio value',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...CARD_VARIANTS],
      description:
        "`default` for a primary surface. `elevated` sits on the same tokens as a table's zebra rows, for content that should read as secondary to a `default` card next to it. `inset` is the `--background` box with the control radius that nests inside a card or a dialog.",
    },
    border: {
      control: 'inline-radio',
      options: [...CARD_BORDERS],
      description:
        'Inset 1px ring. `auto` (default) follows the variant: `border` for `default`, `hairline` for `elevated`, `none` for `inset`. Set it to override: a hairline results box, a bordered picked title.',
    },
    padding: {
      control: 'select',
      options: [...CARD_PADDINGS],
      description:
        'Inner spacing; `xs` is 4 px, `sm` 12 px, `md` follows `--inset-card` (16 px, 24 px from 1 024 px), `recap` is 4 px / 12 px for a before/after recap whose rows carry their own 9 px, `panel` is 10 x 12 px, then 12 x 16 px from 1 024 px, `list` keeps a narrow side padding for rows that carry their own inset, `rows` is the 4 px / `--inset-card` inset of a ruled list such as facts, `none` when the content manages its own (e.g. a table).',
    },
    clip: {
      control: 'boolean',
      description:
        'Clips the content to the rounded corners (`overflow-hidden`). Off by default, so focus rings and popovers of the content are not cut. Use it with `padding="none"` when a table or list touches the edges and its hovered or selected last row must follow the corners.',
    },
    surface: {
      control: 'inline-radio',
      options: [...CARD_SURFACES],
      description:
        'Where the fill, the border, the radius and the padding apply: `always` (default), `lg` (from 64rem, plain below), or `max-lg` (below 64rem, plain from it). The block stays one element, so a detail screen can be a card on a desktop and a plain page on a phone.',
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

export const Inset: Story = {
  args: { variant: 'inset', padding: 'sm' },
};
