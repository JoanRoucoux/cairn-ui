import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CARD_PADDINGS, CARD_VARIANTS, type CardPadding, type CardVariant, UiCard } from './card';

type CardArgs = {
  variant: CardVariant;
  padding: CardPadding;
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
    template: `<ui-card [variant]="variant" [padding]="padding">{{ label }}</ui-card>`,
  }),
  args: {
    variant: 'default',
    padding: 'md',
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
      description: 'Inner spacing; `none` when the content manages its own (e.g. a table).',
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

export const RendersContent: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(args.label)).toBeVisible();
  },
};
