import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

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
    template: `<ui-card [variant]="variant" [border]="border" [padding]="padding" [surface]="surface">{{ label }}</ui-card>`,
  }),
  args: {
    variant: 'default',
    border: 'auto',
    padding: 'md',
    surface: 'always',
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

const insetOnCard = (template: string, width = '22.375rem'): Pick<Story, 'render' | 'decorators'> => ({
  render: () => ({ template }),
  decorators: [
    (story) => {
      const rendered = story();
      return {
        ...rendered,
        template: `<div style="width: ${width}; box-sizing: content-box; padding: 1rem; background: var(--card)">${rendered.template}</div>`,
      };
    },
  ],
});

const RESULT_ROW =
  'width: 100%; display: flex; align-items: center; gap: 12px; padding: 6px 10px; border: 0; border-radius: var(--radius-control); background: none; font: inherit; color: var(--foreground); text-align: left';
const RESULT_NAME =
  'font-size: var(--text-body); line-height: var(--text-body--line-height); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis';
const RESULT_SUB =
  'font-size: var(--text-caption); line-height: var(--text-caption--line-height); color: var(--subtle-foreground)';
const RESULT_HEADING =
  'padding: 10px 10px 4px; font-size: var(--text-caption); line-height: var(--text-caption--line-height); letter-spacing: var(--tracking-caption); font-weight: 500; color: var(--subtle-foreground)';

export const InsetPickedTitle: Story = {
  name: 'Inset, picked title',
  ...insetOnCard(`<ui-card variant="inset" border="border" padding="sm">
    <div style="display: flex; align-items: flex-start; gap: 12px">
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px">
        <div style="display: flex; align-items: flex-start; flex-wrap: wrap; gap: 4px 8px; min-width: 0">
          <span style="font-size: var(--text-body); line-height: var(--text-body--line-height); font-weight: 500; text-wrap: pretty">Air Liquide</span>
          <span style="flex: none; display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: var(--radius-pill); background: var(--muted); font-size: var(--text-caption); font-weight: 500">Nouveau</span>
        </div>
        <span style="${RESULT_SUB}">FR0000120073 &middot; Euronext Paris &middot; AI.PA</span>
        <span style="margin-top: 4px; font-size: var(--text-label); line-height: var(--text-label--line-height); color: var(--muted-foreground); font-variant-numeric: var(--numeric)">Cours d'essai 178,42&nbsp;€ &middot; Yahoo Finance. Le titre sera ajouté au catalogue.</span>
      </div>
      <button type="button" style="flex: none; height: 44px; margin: -8px -4px 0 0; padding: 0 10px; border: 0; border-radius: var(--radius-control); background: none; color: var(--foreground); font: inherit; font-size: var(--text-label); font-weight: 500">Changer</button>
    </div>
  </ui-card>`),
};

export const InsetResultsBox: Story = {
  name: 'Inset, hairline results box',
  ...insetOnCard(`<ui-card variant="inset" border="hairline" padding="xs" style="display: flex; flex-direction: column; margin-top: 4px">
    <div style="${RESULT_HEADING}">Dans le catalogue</div>
    <button type="button" style="${RESULT_ROW}; min-height: 56px"><div style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="${RESULT_NAME}">Amundi MSCI World</span><span style="${RESULT_SUB}">LU1681043599 &middot; ETF</span></div><span style="flex: none; font-size: var(--text-caption); color: var(--muted-foreground)">1 ligne</span></button>
    <button type="button" style="${RESULT_ROW}; min-height: 56px"><div style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="${RESULT_NAME}">Amundi PEA Monde MSCI World</span><span style="${RESULT_SUB}">FR001400U5Q4 &middot; ETF</span></div><span style="flex: none; font-size: var(--text-caption); color: var(--muted-foreground)">Aucune ligne</span></button>
    <button type="button" style="${RESULT_ROW}; min-height: 56px"><div style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="${RESULT_NAME}">iShares MSCI World PEA</span><span style="${RESULT_SUB}">IE0002XZSH01 &middot; ETF</span></div><span style="flex: none; font-size: var(--text-caption); color: var(--muted-foreground)">1 ligne</span></button>
    <div style="${RESULT_HEADING}">Nouveau titre, trouvé en ligne</div>
    <button type="button" style="${RESULT_ROW}; min-height: 48px"><div style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="${RESULT_NAME}">iShares Core MSCI World UCITS ETF USD (Acc)</span><span style="${RESULT_SUB}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">IE00B4L5Y983 &middot; Xetra &middot; EUNL.DE</span></div><div style="flex: none; display: flex; flex-direction: column; align-items: flex-end"><span style="font-size: var(--text-label); font-weight: 500; font-variant-numeric: var(--numeric)">97,84&nbsp;€</span><span style="font-size: var(--text-caption); color: var(--subtle-foreground)">cours d'essai</span></div></button>
    <button type="button" style="${RESULT_ROW}; min-height: 48px"><div style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="${RESULT_NAME}">iShares Core MSCI World UCITS ETF USD (Acc)</span><span style="${RESULT_SUB}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">IE00B4L5Y983 &middot; Euronext Amsterdam &middot; IWDA.AS</span></div><div style="flex: none; display: flex; flex-direction: column; align-items: flex-end"><span style="font-size: var(--text-label); font-weight: 500; font-variant-numeric: var(--numeric)">97,91&nbsp;€</span><span style="font-size: var(--text-caption); color: var(--subtle-foreground)">cours d'essai</span></div></button>
    <button type="button" style="${RESULT_ROW}; min-height: 48px"><div style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="${RESULT_NAME}">Xtrackers MSCI World UCITS ETF 1C</span><span style="${RESULT_SUB}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">IE00BJ0KDQ92 &middot; Xetra &middot; XDWD.DE</span></div><div style="flex: none; display: flex; flex-direction: column; align-items: flex-end"><span style="font-size: var(--text-label); font-weight: 500; font-variant-numeric: var(--numeric)">112,36&nbsp;€</span><span style="font-size: var(--text-caption); color: var(--subtle-foreground)">cours d'essai</span></div></button>
  </ui-card>`),
};

const OUTLINE_BUTTON =
  'flex: none; height: 36px; padding: 0 12px; border: 0; border-radius: var(--radius-control); background: var(--card); box-shadow: inset 0 0 0 1px var(--border); color: var(--foreground); font: inherit; font-size: var(--text-label); font-weight: 500';

export const InsetEmptyPanel: Story = {
  name: 'Inset, empty-account panel on an iPhone',
  ...insetOnCard(
    `<ui-card variant="inset" padding="panel" style="display: flex; align-items: center; justify-content: space-between; gap: 12px">
    <span style="font-size: var(--text-label); line-height: var(--text-label--line-height); color: var(--muted-foreground)">Aucune ligne. Ajoutez un titre ou importez un CSV.</span>
    <button type="button" style="${OUTLINE_BUTTON}">Ajouter une ligne</button>
  </ui-card>`,
    '20.625rem',
  ),
};

export const InsetEmptyPanelDesktop: Story = {
  name: 'Inset, empty-account panel on a desktop',
  ...insetOnCard(
    `<ui-card variant="inset" padding="panel" style="display: flex; align-items: center; justify-content: space-between; gap: 16px">
    <span style="font-size: var(--text-label); color: var(--muted-foreground)">Ce compte n'a encore aucune ligne. Ajoutez un titre, ou importez les lignes depuis un fichier CSV.</span>
    <div style="display: flex; gap: 8px; flex: none">
      <button type="button" style="${OUTLINE_BUTTON}">Ajouter une ligne</button>
      <button type="button" style="${OUTLINE_BUTTON}; background: none; box-shadow: none">Importer un CSV</button>
    </div>
  </ui-card>`,
    '67rem',
  ),
};
