import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiCellSub, UiGroupCell, UiRowAction, UiRowLink, UiTable, UiTd, UiTh, UiTr } from './table';

const imports = [UiTable, UiTd, UiTh, UiTr, UiGroupCell, UiRowLink, UiRowAction, UiCellSub];

const renderTable = (attributes = ''): Promise<RenderResult<unknown>> =>
  render(
    `<table uiTable>
       <thead>
         <tr>
           <th uiTh>Ligne</th>
           <th uiTh numeric ${attributes}>Valeur</th>
         </tr>
       </thead>
       <tbody>
         <tr uiTr>
           <td uiTd>Savings account</td>
           <td uiTd numeric ${attributes}>20 010,00 EUR</td>
         </tr>
       </tbody>
     </table>`,
    { imports },
  );

describe('UiTable', () => {
  it('keeps the native table semantics', async () => {
    await renderTable();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Ligne' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(2);
  });

  it('styles the table itself', async () => {
    await renderTable();

    expect(screen.getByRole('table')).toHaveClass('w-full');
  });

  it('styles headers as captions in the subtle color, 36px tall', async () => {
    await renderTable();

    expect(screen.getByRole('columnheader', { name: 'Ligne' })).toHaveClass(
      'h-9',
      'text-caption',
      'text-(--subtle-foreground)',
    );
  });

  it('makes a header 40px tall when asked', async () => {
    await render(`<table uiTable><thead><tr><th uiTh tall>Compte</th></tr></thead></table>`, { imports });

    expect(screen.getByRole('columnheader')).toHaveClass('h-10');
    expect(screen.getByRole('columnheader')).not.toHaveClass('h-9');
  });

  it('fixes a column width and keeps it from shrinking', async () => {
    await render('<table uiTable><thead><tr><th uiTh width="108px">Quantité</th></tr></thead></table>', { imports });

    expect(screen.getByRole('columnheader')).toHaveStyle({ width: '108px', minWidth: '108px' });
  });

  it('gives body cells a 48px row', async () => {
    await renderTable();

    expect(screen.getByRole('cell', { name: 'Savings account' })).toHaveClass('h-12');
  });

  it('aligns a numeric column to the right and lines up its digits', async () => {
    await renderTable();

    expect(screen.getByRole('columnheader', { name: 'Valeur' })).toHaveClass('text-right', 'tabular-nums');
    expect(screen.getByRole('cell', { name: '20 010,00 EUR' })).toHaveClass('text-right', 'tabular-nums');
  });

  it('keeps a textual column aligned to the start', async () => {
    await renderTable();

    expect(screen.getByRole('columnheader', { name: 'Ligne' })).toHaveClass('text-left');
  });

  it('lets the primary column absorb the free width', async () => {
    await render(`<table uiTable><tbody><tr uiTr><td uiTd primary>Ferrari</td></tr></tbody></table>`, { imports });

    expect(screen.getByRole('cell')).toHaveClass('w-full', 'max-w-0');
  });

  it('holds a secondary column back until its breakpoint', async () => {
    await renderTable('from="md"');

    expect(screen.getByRole('columnheader', { name: 'Valeur' })).toHaveClass('hidden', 'md:table-cell');
    expect(screen.getByRole('cell', { name: '20 010,00 EUR' })).toHaveClass('hidden', 'md:table-cell');
  });

  it('holds a cell marked secondary back under 1024px', async () => {
    await renderTable('secondary');

    expect(screen.getByRole('columnheader', { name: 'Valeur' })).toHaveClass('hidden', 'lg:table-cell');
    expect(screen.getByRole('cell', { name: '20 010,00 EUR' })).toHaveClass('hidden', 'lg:table-cell');
  });

  it('shows every column when no breakpoint is asked for', async () => {
    await renderTable();

    expect(screen.getByRole('columnheader', { name: 'Valeur' })).not.toHaveClass('hidden');
  });
});

describe('UiTr', () => {
  it('highlights an ordinary row on hover and press', async () => {
    await render(`<table uiTable><tbody><tr uiTr><td uiTd>Ferrari</td></tr></tbody></table>`, { imports });

    expect(screen.getByRole('row')).toHaveClass('hover:[&>td]:bg-(--glow)', 'active:[&>td]:bg-(--soft)');
    expect(screen.getByRole('row')).not.toHaveAttribute('aria-selected');
  });

  it('fills a selected row with the soft color and says so', async () => {
    await render(`<table uiTable><tbody><tr uiTr selected><td uiTd>Ferrari</td></tr></tbody></table>`, { imports });

    expect(screen.getByRole('row', { selected: true })).toHaveClass('[&>td]:bg-(--soft)');
  });

  it('leaves a group row without hover', async () => {
    await render(`<table uiTable><tbody><tr uiTr group><td uiTd>Saxo</td></tr></tbody></table>`, { imports });

    expect(screen.getByRole('row')).not.toHaveClass('hover:[&>td]:bg-(--glow)');
  });
});

describe('UiGroupCell', () => {
  const renderBand = (meta = 'meta="PEA · Saxo"'): Promise<RenderResult<unknown>> =>
    render(
      `<table uiTable><tbody><tr uiTr group>
         <td ui-group-cell colspan="3" name="Saxo Investor" ${meta}>61 247,83 €</td>
       </tr></tbody></table>`,
      { imports },
    );

  it('shows the name in 600, the meta beside it and the total', async () => {
    await renderBand();

    expect(screen.getByText('Saxo Investor')).toHaveClass('font-semibold');
    expect(screen.getByText('PEA · Saxo')).toBeInTheDocument();
    expect(screen.getByText('61 247,83 €')).toHaveClass('font-semibold', 'tabular-nums');
  });

  it('draws the muted band at least 44px tall', async () => {
    await renderBand();

    expect(screen.getByText('Saxo Investor').closest('div')).toHaveClass('bg-(--muted)', 'rounded-control', 'min-h-11');
  });

  it('omits the meta when there is none', async () => {
    await renderBand('');

    expect(screen.queryByText('PEA · Saxo')).not.toBeInTheDocument();
  });
});

describe('UiRowLink', () => {
  it('stretches a link over its whole row', async () => {
    await render(
      `<table uiTable><tbody><tr uiTr><td uiTd><a uiRowLink href="/lines/1">Ferrari</a></td></tr></tbody></table>`,
      { imports },
    );

    expect(screen.getByRole('link', { name: 'Ferrari' })).toHaveClass('after:absolute', 'after:inset-0');
  });

  it('works on a button too', async () => {
    await render(
      `<table uiTable><tbody><tr uiTr><td uiTd><button uiRowLink type="button">Ferrari</button></td></tr></tbody></table>`,
      { imports },
    );

    expect(screen.getByRole('button', { name: 'Ferrari' })).toHaveClass('after:absolute');
  });

  it('lifts a control of another cell above the stretched link', async () => {
    await render(`<button uiRowAction type="button">Actions</button>`, { imports });

    expect(screen.getByRole('button')).toHaveClass('relative', 'z-1');
  });
});

describe('UiCellSub', () => {
  it('shows a plain subtitle at every width', async () => {
    await render(`<span uiCellSub>FR0011550185 · ETF</span>`, { imports });

    expect(screen.getByText('FR0011550185 · ETF')).toHaveClass('text-caption', 'text-(--subtle-foreground)');
    expect(screen.getByText('FR0011550185 · ETF')).not.toHaveClass('lg:hidden');
  });

  it('shows a narrow subtitle only under 1024px', async () => {
    await render(`<span uiCellSub narrow>10 × 421,26 €</span>`, { imports });

    expect(screen.getByText('10 × 421,26 €')).toHaveClass('lg:hidden');
  });
});
