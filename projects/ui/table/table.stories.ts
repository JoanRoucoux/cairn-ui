import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiCellSub, UiGroup, UiGroupCell, UiRowAction, UiRowLink, UiTable, UiTd, UiTh, UiTr } from './table';

type TableArgs = Record<string, never>;

type Tone = 'positive' | 'negative' | 'none';
type Holding = Record<string, string> & { tone: Tone; stale: boolean; noValue: boolean };

const FIELDS = ['name', 'isin', 'cls', 'quantity', 'average', 'price', 'value', 'pnl', 'pnlPct', 'day'];

function holding(line: string, tone: Tone): Holding {
  const cells = line.split('|');
  const f = Object.fromEntries(FIELDS.map((field, index) => [field, cells[index]]));
  const flags = { stale: cells[10] === 'stale', noValue: cells[10] === 'noValue' };
  const narrow = flags.noValue
    ? `${f['quantity']} · Avg. cost ${f['average']} €`
    : `${f['quantity']} × ${f['price']} € · Avg. cost ${f['average']} €`;
  const note = flags.stale ? 'Price as of 24/09, stale' : flags.noValue ? 'No price, enter one' : '';
  return { ...f, sub: `${f['isin']} · ${f['cls']}`, narrow, note, tone, ...flags } as Holding;
}

const GROUPS: { name: string; meta: string; total: string; rows: Holding[] }[] = [
  {
    name: 'Northwind PEA',
    meta: 'PEA · Northwind Bank · 3 holdings',
    total: '48 215,60 €',
    rows: [
      holding('Ferrari|NL00150001Q9|Stocks|8|388,10|421,26|3 370,08 €|+265,28 €|+8,54 %|+1,60 %', 'positive'),
      holding('Amundi MSCI World|LU1681043599|ETF|300|26,40|28,64|8 592,00 €|+672,00 €|+8,48 %|+0,90 %', 'positive'),
      holding('Accor|FR0000120404|Stocks|50|40,12|38,42|1 921,00 €|−85,00 €|−4,24 %|−0,42 %', 'negative'),
    ],
  },
  {
    name: 'Woodgrove Savings Plan',
    meta: 'PEE · Woodgrove Bank · 2 holdings',
    total: '18 049,20 €',
    rows: [
      holding(
        'Carmignac Patrimoine|FR0010135103|Funds|120,000|118,62|150,41|18 049,20 €|+3 814,80 €|+26,80 %||stale',
        'positive',
      ),
      holding('Comgest Monde|FR0000284689|Funds|10,55|119,84||—||||noValue', 'none'),
    ],
  },
];

const CARD = 'rounded-container bg-(--card) px-4 pt-2 pb-3 text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)]';
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
\`uiTh\`, \`uiTd\` and \`uiTr\` applied as attributes. The header caption reads once, centered, in the subtle color.
Table options: \`row\` (48, 52 or 60px body rows), \`[rule]="false"\` (no hairline under the header)
and \`spaced\` (4px between the header and the first row). A row glows on hover;
\`selected\` takes the soft fill.

\`numeric\` right aligns a column and lines its digits up, on the \`<th>\` and on every \`<td>\`. \`primary\` marks the
one column that absorbs the free width and truncates; give the others a \`width\` on their header.
\`td[ui-group-cell]\` is the muted band that opens a group (\`size="lg"\` is the 48px band); wrap the
group in \`<tbody uiGroup>\` for its 4px tail. Its total is a \`ui-amount\`. Its heading takes focus with no ring: \`h2[data-group-heading]\`.

\`a[uiRowLink]\` or \`button[uiRowLink]\` in the first cell makes the whole row one target, with a row-wide ring.
\`[stretch]="false"\` keeps the target on the name, underlined on hover with its own ring.
\`current\` sets \`aria-current\`. A control in another cell takes \`uiRowAction\`. A row
that opens something is \`interactive\` (it presses to the soft fill); one with no action keeps a plain name,
\`<td uiTd primary class="truncate font-medium">\`.

Under 1024px, mark Quantity, Avg. cost and Price \`secondary\` on their header and cells: they are hidden, and a
\`<span uiCellSub narrow>\` carries them as the row subtitle. \`uiCellSub\` takes a \`tone\`: subtle, stale or
inherit. Amounts in a subtitle go through \`ui-amount\`.

#### When to use

* For data with more than one dimension, where a row and a column both mean something.

#### When not to use

* For layout. A table announces relationships that a layout does not have.
* For a single list of values, where a list carries the same content with less structure.

#### Accessibility

* The semantics come from the real \`<table>\`, so rows, columns and header association work without any ARIA.
* \`selected\` sets \`aria-selected\` on the row; put \`current\` on its link so the open holding is announced.
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
              <th uiTh primary>Holding</th>
              <th uiTh numeric width="106px">Quantity</th>
              <th uiTh numeric width="126px">Price</th>
              <th uiTh numeric width="146px">Value</th>
              <th uiTh numeric width="106px">Day</th>
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

export const Default: Story = {};

export const Narrow: Story = {
  name: 'Secondary columns fold into the row subtitle under 1024px',
  tags: ['!dev', '!autodocs'],
  render: () => ({
    props: { groups: GROUPS },
    template: `
      <div class="${CARD} w-[720px]">
        <table uiTable row="60" [rule]="false">
          <thead>
            <tr>
              <th uiTh primary>Holding</th>
              <th uiTh numeric secondary width="108px">Quantity</th>
              <th uiTh numeric secondary width="116px">Avg. cost</th>
              <th uiTh numeric secondary width="128px">Price</th>
              <th uiTh numeric width="140px">Value</th>
              <th uiTh numeric width="152px">Unrealized gain</th>
              <th uiTh numeric width="92px">Day</th>
            </tr>
          </thead>
          @for (group of groups; track group.name) {
            <tbody uiGroup>
              <tr uiTr group>
                <td ui-group-cell size="lg" colspan="7" [name]="group.name" [meta]="group.meta">{{ group.total }}</td>
              </tr>
              @for (row of group.rows; track row.name) {
                <tr uiTr interactive>
                  <td uiTd primary>
                    <a uiRowLink href="#" (click)="$event.preventDefault()">{{ row.name }}</a>
                    <span uiCellSub class="max-lg:hidden">{{ row.sub }}</span>
                    <span uiCellSub narrow>{{ row.narrow }}</span>
                    @if (row.note) {
                      <span uiCellSub narrow [tone]="row.stale ? 'stale' : 'subtle'">{{ row.note }}</span>
                    }
                  </td>
                  <td uiTd numeric secondary>{{ row.quantity }}</td>
                  <td uiTd numeric secondary>{{ row.average }}</td>
                  <td uiTd numeric secondary>
                    @if (row.noValue) {
                      <button uiRowAction type="button" class="h-8 rounded-control bg-(--card) px-2.5 text-label font-medium whitespace-nowrap shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow)">Enter a price</button>
                    } @else {
                      {{ row.price }}
                      @if (row.stale) {
                        <span uiCellSub tone="stale">Price as of 24/09</span>
                      }
                    }
                  </td>
                  <td uiTd numeric class="font-medium" [class.text-(--subtle-foreground)]="row.noValue">
                    {{ row.value }}
                    @if (row.noValue) {
                      <button uiRowAction type="button" class="mt-1 h-8 rounded-control bg-(--card) px-2.5 text-label font-medium whitespace-nowrap shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow) lg:hidden">Enter a price</button>
                    }
                  </td>
                  <td uiTd numeric ${SIGN}>
                    {{ row.pnl }}
                    @if (row.pnlPct) {
                      <span uiCellSub tone="inherit">{{ row.pnlPct }}</span>
                    }
                  </td>
                  <td uiTd numeric ${SIGN}>{{ row.day }}</td>
                </tr>
              }
            </tbody>
          }
        </table>
      </div>
    `,
  }),
  parameters: { viewport: { width: 768, height: 900 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('columnheader', { name: 'Avg. cost' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('columnheader', { name: 'Unrealized gain' })).toBeVisible();
    await expect(canvas.getByText('8 × 421,26 € · Avg. cost 388,10 €')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Enter a price' })).toBeVisible();
  },
};
