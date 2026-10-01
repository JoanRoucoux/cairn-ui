import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiCellSub, UiGroup, UiGroupCell, UiRowAction, UiRowLink, UiTable, UiTd, UiTh, UiTr } from './table';

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

  it('styles headers as captions in the subtle color, centred in 36px', async () => {
    await renderTable();

    expect(screen.getByRole('columnheader', { name: 'Ligne' })).toHaveClass(
      '[--table-head:2.25rem]',
      'align-middle',
      'text-caption',
      'text-(--subtle-foreground)',
    );
  });

  it('makes a header 40px tall when asked', async () => {
    await render(`<table uiTable><thead><tr><th uiTh tall>Compte</th></tr></thead></table>`, { imports });

    expect(screen.getByRole('columnheader')).toHaveClass('[--table-head:2.5rem]');
  });

  it('fixes a column width and keeps it from shrinking', async () => {
    await render('<table uiTable><thead><tr><th uiTh width="108px">Quantité</th></tr></thead></table>', { imports });

    expect(screen.getByRole('columnheader')).toHaveStyle({ width: '108px', minWidth: '108px' });
  });

  it('gives body cells a 48px row', async () => {
    await renderTable();

    expect(screen.getByRole('cell', { name: 'Savings account' })).toHaveClass('h-(--table-row)');
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
  it('highlights an ordinary row on hover only', async () => {
    await render(`<table uiTable><tbody><tr uiTr><td uiTd>Ferrari</td></tr></tbody></table>`, { imports });

    expect(screen.getByRole('row')).toHaveClass('hover:[&>td]:bg-(--glow)');
    expect(screen.getByRole('row')).not.toHaveClass('active:[&>td]:bg-(--soft)');
    expect(screen.getByRole('row')).not.toHaveAttribute('aria-selected');
  });

  it('presses an interactive row to the soft fill', async () => {
    await render('<table uiTable><tbody><tr uiTr interactive><td uiTd>Ferrari</td></tr></tbody></table>', { imports });

    expect(screen.getByRole('row')).toHaveClass('active:[&>td]:bg-(--soft)');
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

    expect(screen.getByText('Saxo Investor').closest('div')?.parentElement).toHaveClass(
      'bg-(--muted)',
      'rounded-control',
      'min-h-11',
    );
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

describe('UiTable options', () => {
  const host = (attributes: string): Promise<RenderResult<unknown>> =>
    render(`<table uiTable ${attributes}><thead><tr><th uiTh>A</th></tr></thead></table>`, { imports });

  it('is 48px per row, ruled under the header and tight to it by default', async () => {
    await host('');

    expect(screen.getByRole('table')).toHaveClass(
      '[--table-row:3rem]',
      '[--table-rule:inset_0_-1px_0_var(--hairline)]',
    );
    expect(screen.getByRole('table')).toHaveClass('[--table-head-gap:0px]');
  });

  it.each([
    ['52', '[--table-row:3.25rem]'],
    ['60', '[--table-row:3.75rem]'],
  ] as const)('sizes rows at %spx', async (row, expected) => {
    await host(`row="${row}"`);

    expect(screen.getByRole('table')).toHaveClass(expected);
  });

  it('turns the header hairline off', async () => {
    await host('[rule]="false"');

    expect(screen.getByRole('table')).toHaveClass('[--table-rule:none]');
  });

  it('turns the header hairline off with the attribute form', async () => {
    await host('rule="false"');

    expect(screen.getByRole('table')).toHaveClass('[--table-rule:none]');
  });

  it('opens a 4px gap under the header', async () => {
    await host('spaced');

    expect(screen.getByRole('table')).toHaveClass('[--table-head-gap:0.25rem]');
  });

  it('lets cells read the row size and the header read the rule', async () => {
    await renderTable();

    expect(screen.getByRole('cell', { name: 'Savings account' })).toHaveClass('h-(--table-row)');
    expect(screen.getByRole('columnheader', { name: 'Ligne' })).toHaveClass('shadow-(--table-rule)');
  });
});

describe('UiGroupCell sizes', () => {
  it('is 44px high with a 10px lead by default and 48px with a 12px lead when large', async () => {
    await render(
      `<table uiTable><tbody uiGroup>
         <tr uiTr group><td ui-group-cell name="A">1</td></tr>
         <tr uiTr group><td ui-group-cell size="lg" name="B">2</td></tr>
       </tbody></table>`,
      { imports: [...imports, UiGroup] },
    );

    expect(screen.getByText('A').closest('td')).toHaveClass('pt-2.5');
    expect(screen.getByText('A').closest('div')?.parentElement).toHaveClass('min-h-11');
    expect(screen.getByText('B').closest('td')).toHaveClass('pt-3');
    expect(screen.getByText('B').closest('div')?.parentElement).toHaveClass('min-h-12');
  });

  it('names the group with a heading', async () => {
    await render(`<table uiTable><tbody><tr uiTr group><td ui-group-cell name="Saxo">1</td></tr></tbody></table>`, {
      imports,
    });

    expect(screen.getByRole('heading', { name: 'Saxo' })).toBeInTheDocument();
  });

  it('makes the heading a focus target without a ring', async () => {
    await render('<table uiTable><tbody><tr uiTr group><td ui-group-cell name="Saxo">1</td></tr></tbody></table>', {
      imports,
    });
    const heading = screen.getByRole('heading', { name: 'Saxo' });

    heading.focus();

    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(heading).toHaveAttribute('data-group-heading');
    expect(heading).toHaveClass('outline-none');
  });

  it('keeps the name in a heading outside any inline wrapper', async () => {
    await render('<table uiTable><tbody><tr uiTr group><td ui-group-cell name="Saxo">1</td></tr></tbody></table>', {
      imports,
    });

    expect(screen.getByRole('heading').parentElement?.tagName).toBe('DIV');
  });

  it('closes a group with a 4px tail', async () => {
    await render(`<table uiTable><tbody uiGroup></tbody></table>`, { imports: [...imports, UiGroup] });

    expect(screen.getAllByRole('rowgroup')[0]).toHaveClass('after:table-row', 'after:h-1');
  });
});

describe('UiRowLink variants', () => {
  it('can stay on the name alone, underlined on hover, with its own ring', async () => {
    await render(`<a uiRowLink [stretch]="false" href="/a">PEA Saxo</a>`, { imports });

    const link = screen.getByRole('link');
    expect(link).toHaveClass('hover:underline', 'focus-visible:outline-2', 'focus-visible:outline-offset-2');
    expect(link).not.toHaveClass('after:absolute');
  });

  it('stays on the name alone with the attribute form', async () => {
    await render(`<a uiRowLink stretch="false" href="/a">PEA Saxo</a>`, { imports });

    expect(screen.getByRole('link')).not.toHaveClass('after:absolute');
  });

  it('marks the open line with aria-current', async () => {
    await render(`<a uiRowLink current href="/a">Ferrari</a>`, { imports });

    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'true');
  });
});

describe('UiCellSub tone', () => {
  it('is subtle by default', async () => {
    await render(`<span uiCellSub>x</span>`, { imports });

    expect(screen.getByText('x')).toHaveClass('text-(--subtle-foreground)', 'font-normal');
  });

  it('is stale at 500 without the subtle color', async () => {
    await render(`<span uiCellSub tone="stale">x</span>`, { imports });

    expect(screen.getByText('x')).toHaveClass('text-(--stale)', 'font-medium');
    expect(screen.getByText('x')).not.toHaveClass('text-(--subtle-foreground)');
  });

  it('can inherit the color of its cell', async () => {
    await render(`<span uiCellSub tone="inherit">x</span>`, { imports });

    expect(screen.getByText('x')).not.toHaveClass('text-(--subtle-foreground)', 'text-(--stale)');
  });
});
