import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiCellSub, UiGroupCell, UiRowAction, UiRowLink, UiTable, UiTd, UiTh, UiTr } from './table';

type TableArgs = Record<string, never>;

type Tone = 'positive' | 'negative' | 'stale';
type Extra = { stale?: string; noValue?: boolean; selected?: boolean };

type Holding = Record<
  'name' | 'sub' | 'quantity' | 'average' | 'price' | 'value' | 'pnl' | 'pnlPct' | 'day' | 'narrow',
  string
> & { tone: Tone } & Extra;

const FIELDS = ['name', 'sub', 'quantity', 'average', 'price', 'value', 'pnl', 'pnlPct', 'day'];

function holding(line: string, tone: Tone, extra: Extra = {}): Holding {
  const cells = line.split('|');
  const fields = Object.fromEntries(FIELDS.map((field, index) => [field, cells[index]]));
  return { ...fields, tone, narrow: `${cells[2]} × ${cells[4]} €`, ...extra } as Holding;
}

const GROUPS: { name: string; meta: string; total: string; rows: Holding[] }[] = [
  {
    name: 'Saxo Investor',
    meta: 'PEA · Saxo',
    total: '61 247,83 €',
    rows: [
      holding('Ferrari|NL00150001Q9 · Action|10|388,10|421,26|4 212,60 €|+331,60 €|+8,54 %|+1,60 %', 'positive'),
      holding(
        'Amundi MSCI World|LU1681043599 · ETF|500|26,40|28,64|14 318,40 €|+1 118,40 €|+8,48 %|+0,90 %',
        'positive',
        {
          selected: true,
        },
      ),
      holding('Accor|FR0000120404 · Action|60|40,12|38,42|2 305,20 €|−102,00 €|−4,24 %|−0,42 %', 'negative'),
    ],
  },
  {
    name: 'Assurance-vie Linxea Spirit 2',
    meta: 'Assurance-vie · Linxea',
    total: '21 406,18 €',
    rows: [
      {
        ...holding(
          'Amundi Opportunités ESR|FR0013412020 · Fonds|12|1 700,00|1 783,85|21 406,18 €|+1 006,18 €|+4,93 %|—',
          'stale',
          {
            stale: 'Cours du 24/09',
          },
        ),
        narrow: 'Cours du 24/09, en retard',
      },
      {
        ...holding('Valmy Gestion Flexible Retraite|FR0010000000 · Fonds|3|—|—|—|—||—', 'stale', { noValue: true }),
        narrow: 'Aucun cours',
      },
    ],
  },
];

const CARD = 'rounded-container bg-(--card) px-4 pt-2 pb-3 text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)]';
const DOTS =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>';
const ACTION =
  'inline-grid size-9 place-items-center rounded-control text-(--muted-foreground) hover:bg-(--soft) hover:text-(--foreground)';
const PILL = 'inline-flex h-6 items-center rounded-pill bg-(--muted) px-2.5 text-caption font-medium';
const SIGN =
  '[class.text-(--positive)]="row.tone === \'positive\'" [class.text-(--negative)]="row.tone === \'negative\'"';

const meta: Meta<TableArgs> = {
  title: 'Data display/Table',
  decorators: [
    moduleMetadata({ imports: [UiTable, UiTd, UiTh, UiTr, UiGroupCell, UiRowLink, UiRowAction, UiCellSub] }),
  ],
  parameters: {
    docs: {
      description: {
        component: `Styled native \`<table>\`. The rows and cells stay plain \`<tr>\` and \`<td>\`, with \`uiTable\`,
\`uiTh\`, \`uiTd\` and \`uiTr\` applied as attributes. The header row reads once, in caption size and the subtle
color, over a hairline. Body rows are 48px tall and glow on hover; a \`selected\` row takes the soft fill.

\`numeric\` right aligns a column and lines its digits up. Set it on the \`<th>\` and on every \`<td>\` of that
column, since they carry it independently. \`primary\` marks the one column that absorbs the free width and
truncates; give the others a \`width\` on their header. \`td[ui-group-cell]\` is the muted band that opens a group of rows: the name
in 600, the meta beside it, and the projected total (a \`ui-amount\`) on the right.

Put an \`a[uiRowLink]\` or \`button[uiRowLink]\` in the first cell and the whole row becomes that one target: the
pointer, the keyboard and a screen reader all reach it, and the focus ring wraps the row. A control in another
cell, such as an actions menu, takes \`uiRowAction\` so it stays above the stretched layer.

Under 1024px, mark the quantity, average cost and quote columns \`secondary\` on their header and cells: they are
hidden, and a \`<span uiCellSub narrow>\` in the line's own cell carries them as the row subtitle instead of
dropping them silently.

#### When to use

* For data with more than one dimension, where a row and a column both mean something.

#### When not to use

* For layout. A table announces relationships that a layout does not have.
* For a single list of values, where a list carries the same content with less structure.

#### Accessibility

* The semantics come from the real \`<table>\`, so rows, columns and header association work without
  any ARIA.
* \`selected\` sets \`aria-selected\` on the row, for the line whose detail is open next to the table.
* A column held back by \`secondary\` must be held back on its header and its cells together, or the
  remaining cells shift under the wrong headers. Its content stays available in the subtitle.`,
      },
    },
  },
  render: () => ({
    template: `
      <div class="${CARD} w-[692px]">
        <table uiTable>
          <thead>
            <tr>
              <th uiTh primary>Ligne</th>
              <th uiTh numeric width="106px">Quantité</th>
              <th uiTh numeric width="126px">Cours</th>
              <th uiTh numeric width="146px">Valeur</th>
              <th uiTh numeric width="106px">Jour</th>
            </tr>
          </thead>
          <tbody>
            <tr uiTr group>
              <td ui-group-cell colspan="5" name="Saxo Investor">61 247,83 €</td>
            </tr>
            <tr uiTr>
              <td uiTd primary class="font-medium">Ferrari</td>
              <td uiTd numeric>10</td>
              <td uiTd numeric>421,26</td>
              <td uiTd numeric class="font-medium">4 212,60 €</td>
              <td uiTd numeric class="text-(--positive)">+1,60 %</td>
            </tr>
            <tr uiTr class="[&>td]:bg-(--glow)">
              <td uiTd primary class="font-medium">Amundi MSCI World</td>
              <td uiTd numeric>500</td>
              <td uiTd numeric>28,64</td>
              <td uiTd numeric class="font-medium">14 318,40 €</td>
              <td uiTd numeric class="text-(--positive)">+0,90 %</td>
            </tr>
            <tr uiTr>
              <td uiTd primary class="font-medium">Accor</td>
              <td uiTd numeric>60</td>
              <td uiTd numeric>38,42</td>
              <td uiTd numeric class="font-medium">2 305,20 €</td>
              <td uiTd numeric class="text-(--negative)">−0,42 %</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TableArgs>;

export const Default: Story = {
  name: 'Groupe, lignes, survol',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('table')).toBeInTheDocument();
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(5);
  },
};

const holdingsTemplate = (columns: 'full' | 'compact' | 'narrow'): string => {
  const detail = columns !== 'compact';
  const narrow = columns === 'narrow';
  const hold = narrow ? 'secondary' : '';
  const width = { full: 'w-[1088px]', compact: 'w-[560px]', narrow: 'w-[720px]' }[columns];
  return `
    <div class="${CARD} ${width}">
      <table uiTable>
        <thead>
          <tr>
            <th uiTh primary>Ligne</th>
            ${detail ? `<th uiTh numeric ${hold} width="108px">Quantité</th><th uiTh numeric ${hold} width="116px">PRU</th><th uiTh numeric ${hold} width="128px">Cours</th>` : ''}
            <th uiTh numeric width="140px">Valeur</th>
            ${detail ? `<th uiTh numeric ${hold} width="152px">Plus-value latente</th>` : ''}
            <th uiTh numeric width="92px">Jour</th>
          </tr>
        </thead>
        @for (group of groups; track group.name) {
          <tbody>
            <tr uiTr group>
              <td ui-group-cell colspan="${detail ? 7 : 3}" [name]="group.name" [meta]="group.meta">{{ group.total }}</td>
            </tr>
            @for (row of group.rows; track row.name) {
              <tr uiTr [selected]="${columns === 'compact'} && row.selected === true">
                <td uiTd primary class="h-15!">
                  <a uiRowLink href="#" (click)="$event.preventDefault()">{{ row.name }}</a>
                  <span uiCellSub ${narrow ? 'class="max-lg:hidden"' : ''}>{{ row.sub }}</span>
                  ${narrow ? `<span uiCellSub narrow [class.text-(--stale)]="row.tone === 'stale'" [class.font-medium]="row.tone === 'stale'">{{ row.narrow }}</span>` : ''}
                </td>
                ${
                  detail
                    ? `
                <td uiTd numeric ${hold}>{{ row.quantity }}</td>
                <td uiTd numeric ${hold}>{{ row.average }}</td>
                <td uiTd numeric ${hold}>
                  @if (row.noValue) {
                    <button uiRowAction type="button" class="h-8 rounded-control bg-(--card) px-2.5 text-label font-medium whitespace-nowrap shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow)">Saisir un cours</button>
                  } @else {
                    {{ row.price }}
                    @if (row.stale) {
                      <span uiCellSub class="text-right font-medium text-(--stale)">{{ row.stale }}</span>
                    }
                  }
                </td>`
                    : ''
                }
                <td uiTd numeric class="font-medium">{{ row.value }}</td>
                ${
                  detail
                    ? `
                <td uiTd numeric ${hold} ${SIGN}>
                  {{ row.pnl }}
                  @if (row.pnlPct) {
                    <span uiCellSub class="text-right text-[inherit]">{{ row.pnlPct }}</span>
                  }
                </td>`
                    : ''
                }
                <td uiTd numeric ${SIGN}>{{ row.day }}</td>
              </tr>
            }
          </tbody>
        }
      </table>
    </div>
  `;
};

export const Lignes: Story = {
  render: () => ({ props: { groups: GROUPS }, template: holdingsTemplate('full') }),
  parameters: { viewport: { width: 1280, height: 900 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('columnheader')).toHaveLength(7);
    await expect(canvas.getAllByRole('link')).toHaveLength(5);
    await expect(canvas.getByRole('button', { name: 'Saisir un cours' })).toBeInTheDocument();
  },
};

export const LigneOuverte: Story = {
  name: 'Lignes, détail ouvert',
  render: () => ({ props: { groups: GROUPS }, template: holdingsTemplate('compact') }),
  parameters: { viewport: { width: 1280, height: 900 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Ligne',
      'Valeur',
      'Jour',
    ]);
    await expect(canvas.getByRole('row', { selected: true })).toHaveTextContent('Amundi MSCI World');
  },
};

export const Etroit: Story = {
  render: () => ({ props: { groups: GROUPS }, template: holdingsTemplate('narrow') }),
  parameters: { viewport: { width: 768, height: 900 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('columnheader', { name: 'Quantité' })).not.toBeInTheDocument();
    await expect(canvas.getByText('10 × 421,26 €')).toBeVisible();
  },
};

const ACCOUNTS = [
  { name: 'PEA Saxo', env: 'PEA', inst: 'Saxo', lines: 3, value: '61 247,83 €', share: '37,3 %' },
  { name: 'Livret A', env: 'Épargne', inst: 'Boursorama', lines: 1, value: '22 515,47 €', share: '13,7 %' },
  { name: 'Assurance-vie Linxea Spirit 2', env: 'Assurance-vie', inst: 'Linxea', lines: 4, value: '—', share: '—' },
];

export const Comptes: Story = {
  render: () => ({
    props: { accounts: ACCOUNTS },
    template: `
      <div class="${CARD} w-[1088px]">
        <table uiTable>
          <thead>
            <tr>
              <th uiTh tall primary>Compte</th>
              <th uiTh tall width="166px">Enveloppe</th>
              <th uiTh tall width="186px">Établissement</th>
              <th uiTh tall numeric width="126px">Lignes</th>
              <th uiTh tall numeric width="166px">Valeur</th>
              <th uiTh tall numeric width="88px">Part</th>
              <th uiTh tall width="56px"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            @for (account of accounts; track account.name) {
              <tr uiTr>
                <td uiTd primary class="h-13!"><a uiRowLink href="#" (click)="$event.preventDefault()">{{ account.name }}</a></td>
                <td uiTd><span class="${PILL}">{{ account.env }}</span></td>
                <td uiTd class="text-label text-(--muted-foreground)">{{ account.inst }}</td>
                <td uiTd numeric class="text-label text-(--muted-foreground)">{{ account.lines }}</td>
                <td uiTd numeric class="font-medium">{{ account.value }}</td>
                <td uiTd numeric class="text-(--muted-foreground)">{{ account.share }}</td>
                <td uiTd class="text-right">
                  <button uiRowAction type="button" [attr.aria-label]="'Actions sur ' + account.name" class="${ACTION}">${DOTS}</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    `,
  }),
  parameters: { viewport: { width: 1280, height: 700 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'PEA Saxo' })).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Actions sur PEA Saxo' })).toBeInTheDocument();
  },
};

const INSTRUMENTS = [
  { name: 'Amundi MSCI World', isin: 'LU1681043599', cls: 'ETF', source: 'Yahoo Finance', ref: 'CW8.PA', lines: 2 },
  { name: 'Bitcoin', isin: 'BTC', cls: 'Crypto', source: 'CoinGecko', ref: 'bitcoin', lines: 1 },
  {
    name: 'Valmy Gestion Flexible Retraite',
    isin: 'FR0010000000',
    cls: 'Fonds',
    source: 'Saisie manuelle',
    ref: '',
    lines: 1,
  },
];

export const Instruments: Story = {
  render: () => ({
    props: { instruments: INSTRUMENTS },
    template: `
      <div class="${CARD} w-[1088px]">
        <table uiTable>
          <thead>
            <tr>
              <th uiTh tall primary>Instrument</th>
              <th uiTh tall width="166px">ISIN ou symbole</th>
              <th uiTh tall width="126px">Classe</th>
              <th uiTh tall width="236px">Source du cours</th>
              <th uiTh tall numeric width="106px">Lignes</th>
              <th uiTh tall width="56px"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            @for (instrument of instruments; track instrument.name) {
              <tr uiTr>
                <td uiTd primary class="font-medium">{{ instrument.name }}</td>
                <td uiTd class="text-label text-(--muted-foreground) tabular-nums">{{ instrument.isin }}</td>
                <td uiTd><span class="${PILL}">{{ instrument.cls }}</span></td>
                <td uiTd>
                  <span class="block text-label">{{ instrument.source }}</span>
                  @if (instrument.ref) {
                    <span uiCellSub>{{ instrument.ref }}</span>
                  }
                </td>
                <td uiTd numeric class="text-label text-(--muted-foreground)">{{ instrument.lines }}</td>
                <td uiTd class="text-right">
                  <button type="button" [attr.aria-label]="'Actions sur ' + instrument.name" class="${ACTION}">${DOTS}</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    `,
  }),
  parameters: { viewport: { width: 1280, height: 600 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('row')).toHaveLength(4);
  },
};
