import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiCellSub, UiGroup, UiGroupCell, UiRowAction, UiRowLink, UiTable, UiTd, UiTh, UiTr } from './table';

type TableArgs = Record<string, never>;

type Tone = 'positive' | 'negative' | 'none';
type Holding = Record<string, string> & { tone: Tone; stale: boolean; noValue: boolean; selected: boolean };

const FIELDS = ['name', 'isin', 'cls', 'quantity', 'average', 'price', 'value', 'pnl', 'pnlPct', 'day'];

function holding(line: string, tone: Tone): Holding {
  const cells = line.split('|');
  const f = Object.fromEntries(FIELDS.map((field, index) => [field, cells[index]]));
  const flags = { selected: cells[10] === 'selected', stale: cells[10] === 'stale', noValue: cells[10] === 'noValue' };
  const compact = flags.stale ? 'Cours du 24/09' : flags.noValue ? 'Aucun cours' : f['cls'];
  const narrow = flags.noValue
    ? `${f['quantity']} · PRU ${f['average']} €`
    : `${f['quantity']} × ${f['price']} € · PRU ${f['average']} €`;
  const note = flags.stale ? 'Cours du 24/09, en retard' : flags.noValue ? 'Aucun cours, à saisir' : '';
  return { ...f, sub: `${f['isin']} · ${f['cls']}`, compact, narrow, note, tone, ...flags } as Holding;
}

const GROUPS: { name: string; meta: string; total: string; rows: Holding[] }[] = [
  {
    name: 'Northwind PEA',
    meta: 'PEA · Northwind Bank · 3 lignes',
    total: '48 215,60 €',
    rows: [
      holding('Ferrari|NL00150001Q9|Actions|8|388,10|421,26|3 370,08 €|+265,28 €|+8,54 %|+1,60 %', 'positive'),
      holding(
        'Amundi MSCI World|LU1681043599|ETF|300|26,40|28,64|8 592,00 €|+672,00 €|+8,48 %|+0,90 %|selected',
        'positive',
      ),
      holding('Accor|FR0000120404|Actions|50|40,12|38,42|1 921,00 €|−85,00 €|−4,24 %|−0,42 %', 'negative'),
    ],
  },
  {
    name: 'Woodgrove Savings Plan',
    meta: 'PEE · Woodgrove Bank · 2 lignes',
    total: '18 049,20 €',
    rows: [
      holding(
        'Carmignac Patrimoine|FR0010135103|Fonds|120,000|118,62|150,41|18 049,20 €|+3 814,80 €|+26,80 %||stale',
        'positive',
      ),
      holding('Comgest Monde|FR0000284689|Fonds|10,55|119,84||—||||noValue', 'none'),
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
const IMPORTS = [UiTable, UiTd, UiTh, UiTr, UiGroup, UiGroupCell, UiRowLink, UiRowAction, UiCellSub];

const meta: Meta<TableArgs> = {
  title: 'Data display/Table',
  decorators: [moduleMetadata({ imports: IMPORTS })],
  parameters: {
    docs: {
      description: {
        component: `Styled native \`<table>\`. The rows and cells stay plain \`<tr>\` and \`<td>\`, with \`uiTable\`,
\`uiTh\`, \`uiTd\` and \`uiTr\` applied as attributes. The header caption reads once, centred, in the subtle color.
Table options: \`row\` (48, 52 or 60px body rows), \`[rule]="false"\` (no hairline under the header, as on Lignes)
and \`spaced\` (4px between the header and the first row, as on Comptes and Instruments). A row glows on hover;
\`selected\` takes the soft fill.

\`numeric\` right aligns a column and lines its digits up, on the \`<th>\` and on every \`<td>\`. \`primary\` marks the
one column that absorbs the free width and truncates; give the others a \`width\` on their header.
\`td[ui-group-cell]\` is the muted band that opens a group (\`size="lg"\` is the 48px band of Lignes); wrap the
group in \`<tbody uiGroup>\` for its 4px tail. Its total is a \`ui-amount\`. Its heading takes focus with no ring: \`h2[data-group-heading]\`.

\`a[uiRowLink]\` or \`button[uiRowLink]\` in the first cell makes the whole row one target, with a row-wide ring
(Lignes, Instruments). \`[stretch]="false"\` keeps the target on the name, underlined on hover with its own ring
(Comptes). \`current\` sets \`aria-current\`. A control in another cell takes \`uiRowAction\`. A row
that opens something is \`interactive\` (it presses to the soft fill); one with no action keeps a plain name,
\`<td uiTd primary class="truncate font-medium">\`.

Under 1024px, mark Quantité, PRU and Cours \`secondary\` on their header and cells: they are hidden, and a
\`<span uiCellSub narrow>\` carries them as the row subtitle. \`uiCellSub\` takes a \`tone\`: subtle, stale or
inherit. Amounts in a subtitle go through \`ui-amount\`.

#### When to use

* For data with more than one dimension, where a row and a column both mean something.

#### When not to use

* For layout. A table announces relationships that a layout does not have.
* For a single list of values, where a list carries the same content with less structure.

#### Accessibility

* The semantics come from the real \`<table>\`, so rows, columns and header association work without any ARIA.
* \`selected\` sets \`aria-selected\` on the row; put \`current\` on its link so the open line is announced.
* A column held back by \`secondary\` must be held back on its header and its cells together. Its content stays
  available in the subtitle.`,
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
              <td ui-group-cell colspan="5" name="Northwind PEA">48 215,60 €</td>
            </tr>
            <tr uiTr>
              <td uiTd primary class="font-medium">Ferrari</td>
              <td uiTd numeric>8</td>
              <td uiTd numeric>421,26</td>
              <td uiTd numeric class="font-medium">3 370,08 €</td>
              <td uiTd numeric class="text-(--positive)">+1,60 %</td>
            </tr>
            <tr uiTr class="[&>td]:bg-(--glow)">
              <td uiTd primary class="font-medium">Amundi MSCI World</td>
              <td uiTd numeric>300</td>
              <td uiTd numeric>28,64</td>
              <td uiTd numeric class="font-medium">8 592,00 €</td>
              <td uiTd numeric class="text-(--positive)">+0,90 %</td>
            </tr>
            <tr uiTr>
              <td uiTd primary class="font-medium">Accor</td>
              <td uiTd numeric>50</td>
              <td uiTd numeric>38,42</td>
              <td uiTd numeric class="font-medium">1 921,00 €</td>
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
  const compact = columns === 'compact';
  const narrow = columns === 'narrow';
  const hold = narrow ? 'secondary' : '';
  const width = { full: 'w-[1120px]', compact: 'w-[696px]', narrow: 'w-[720px]' }[columns];
  const staleTone = `[tone]="row.stale ? 'stale' : 'subtle'"`;
  const sub = compact
    ? `<span uiCellSub ${staleTone}>{{ row.compact }}</span>`
    : `<span uiCellSub${narrow ? ' class="max-lg:hidden"' : ''}>{{ row.sub }}</span>
       ${
         narrow
           ? `<span uiCellSub narrow>{{ row.narrow }}</span>
       @if (row.note) {
         <span uiCellSub narrow ${staleTone}>{{ row.note }}</span>
       }`
           : ''
       }`;
  return `
    <div class="${CARD} ${width}">
      <table uiTable row="60" [rule]="false">
        <thead>
          <tr>
            <th uiTh primary>Ligne</th>
            ${compact ? '' : `<th uiTh numeric ${hold} width="108px">Quantité</th><th uiTh numeric ${hold} width="116px">PRU</th><th uiTh numeric ${hold} width="128px">Cours</th>`}
            <th uiTh numeric width="140px">Valeur</th>
            ${compact ? '' : '<th uiTh numeric width="152px">Plus-value latente</th>'}
            <th uiTh numeric width="92px">Jour</th>
          </tr>
        </thead>
        @for (group of groups; track group.name) {
          <tbody uiGroup>
            <tr uiTr group>
              <td ui-group-cell size="lg" colspan="${compact ? 3 : 7}" [name]="group.name" [meta]="group.meta">{{ group.total }}</td>
            </tr>
            @for (row of group.rows; track row.name) {
              <tr uiTr interactive [selected]="${compact} && row.selected === true">
                <td uiTd primary>
                  <a uiRowLink href="#" [current]="${compact} && row.selected === true" (click)="$event.preventDefault()">{{ row.name }}</a>
                  ${sub}
                </td>
                ${
                  compact
                    ? ''
                    : `<td uiTd numeric ${hold}>{{ row.quantity }}</td>
                <td uiTd numeric ${hold}>{{ row.average }}</td>
                <td uiTd numeric ${hold}>
                  @if (row.noValue) {
                    <button uiRowAction type="button" class="h-8 rounded-control bg-(--card) px-2.5 text-label font-medium whitespace-nowrap shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow)">Saisir un cours</button>
                  } @else {
                    {{ row.price }}
                    @if (row.stale) {
                      <span uiCellSub tone="stale">Cours du 24/09</span>
                    }
                  }
                </td>`
                }
                <td uiTd numeric class="font-medium" [class.text-(--subtle-foreground)]="row.noValue">
                  {{ row.value }}
                  ${
                    narrow
                      ? `@if (row.noValue) {
                    <button uiRowAction type="button" class="mt-1 h-8 rounded-control bg-(--card) px-2.5 text-label font-medium whitespace-nowrap shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow) lg:hidden">Saisir un cours</button>
                  }`
                      : ''
                  }
                </td>
                ${
                  compact
                    ? ''
                    : `<td uiTd numeric ${SIGN}>
                  {{ row.pnl }}
                  @if (row.pnlPct) {
                    <span uiCellSub tone="inherit">{{ row.pnlPct }}</span>
                  }
                </td>`
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
    await expect(canvas.getByRole('link', { current: true })).toBeInTheDocument();
  },
};

export const Etroit: Story = {
  render: () => ({ props: { groups: GROUPS }, template: holdingsTemplate('narrow') }),
  parameters: { viewport: { width: 768, height: 900 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('columnheader', { name: 'PRU' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('columnheader', { name: 'Plus-value latente' })).toBeVisible();
    await expect(canvas.getByText('8 × 421,26 € · PRU 388,10 €')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Saisir un cours' })).toBeVisible();
  },
};

const ACCOUNTS = [
  ['Northwind PEA', 'PEA', 'Northwind Bank', '8 lignes', '48 215,60 €', '33,4 %'],
  ['Woodgrove Savings Plan', 'PEE', 'Woodgrove Bank', '3 lignes', '31 840,15 €', '22,0 %'],
  ['Livret A', 'Épargne', 'Woodgrove Bank', '1 ligne', '16 120,45 €', '11,2 %'],
  ['Northwind PEA-PME', 'PEA-PME', 'Northwind Bank', 'Aucune ligne', '0,00 €', '—'],
].map(([name, env, inst, lines, value, share]) => ({ name, env, inst, lines, value, share }));

const rowActions = (label: string): string =>
  `<button uiRowAction type="button" [attr.aria-label]="'Actions sur ' + ${label}" class="${ACTION}">${DOTS}</button>`;

const catalogue = (headers: string, rows: string): string => `
  <div class="${CARD} w-[1120px]">
    <table uiTable spaced>
      <thead><tr>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
`;

export const Comptes: Story = {
  render: () => ({
    props: { accounts: ACCOUNTS },
    template: catalogue(
      `<th uiTh tall primary>Compte</th>
       <th uiTh tall width="166px">Enveloppe</th>
       <th uiTh tall width="186px">Établissement</th>
       <th uiTh tall numeric width="126px">Lignes</th>
       <th uiTh tall numeric width="166px">Valeur</th>
       <th uiTh tall numeric width="88px">Part</th>
       <th uiTh tall width="56px"><span class="sr-only">Actions</span></th>`,
      `@for (account of accounts; track account.name) {
         <tr uiTr>
           <td uiTd primary><a uiRowLink [stretch]="false" href="#" (click)="$event.preventDefault()">{{ account.name }}</a></td>
           <td uiTd><span class="${PILL}">{{ account.env }}</span></td>
           <td uiTd class="text-label text-(--muted-foreground)">{{ account.inst }}</td>
           <td uiTd numeric class="text-label text-(--muted-foreground)">{{ account.lines }}</td>
           <td uiTd numeric class="font-medium">{{ account.value }}</td>
           <td uiTd numeric class="text-(--muted-foreground)">{{ account.share }}</td>
           <td uiTd class="text-right">${rowActions('account.name')}</td>
         </tr>
       }`,
    ).replace('<table uiTable spaced>', '<table uiTable row="52" spaced>'),
  }),
  parameters: { viewport: { width: 1280, height: 700 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Northwind PEA' })).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Actions sur Northwind PEA' })).toBeInTheDocument();
  },
};

const INSTRUMENTS = [
  {
    name: 'Amundi MSCI World',
    isin: 'LU1681043599',
    cls: 'ETF',
    source: 'Yahoo Finance',
    ref: 'CW8.PA',
    lines: '1 ligne',
  },
  { name: 'Bitcoin', isin: 'BTC', cls: 'Crypto', source: 'Tailspin Exchange', ref: 'BTCEUR', lines: '1 ligne' },
  {
    name: 'Comgest Monde',
    isin: 'FR0000284689',
    cls: 'Fonds',
    source: 'Saisie manuelle',
    ref: '',
    lines: 'Aucune',
  },
];

export const Instruments: Story = {
  render: () => ({
    props: { instruments: INSTRUMENTS },
    template: catalogue(
      `<th uiTh tall primary>Instrument</th>
       <th uiTh tall width="166px">ISIN ou symbole</th>
       <th uiTh tall width="126px">Classe</th>
       <th uiTh tall width="236px">Source du cours</th>
       <th uiTh tall numeric width="106px">Lignes</th>
       <th uiTh tall width="56px"><span class="sr-only">Actions</span></th>`,
      `@for (instrument of instruments; track instrument.name) {
         <tr uiTr>
           <td uiTd primary class="truncate font-medium">{{ instrument.name }}</td>
           <td uiTd class="text-label text-(--muted-foreground) tabular-nums">{{ instrument.isin }}</td>
           <td uiTd><span class="${PILL}">{{ instrument.cls }}</span></td>
           <td uiTd>
             <span class="block text-label" [class]="instrument.source === 'Saisie manuelle' ? 'text-(--muted-foreground)' : 'font-medium'">{{ instrument.source }}</span>
             @if (instrument.ref) {
               <span uiCellSub>{{ instrument.ref }}</span>
             }
           </td>
           <td uiTd numeric class="text-label text-(--muted-foreground)">{{ instrument.lines }}</td>
           <td uiTd class="text-right">${rowActions('instrument.name')}</td>
         </tr>
       }`,
    ),
  }),
  parameters: { viewport: { width: 1280, height: 600 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('row')).toHaveLength(4);
  },
};
