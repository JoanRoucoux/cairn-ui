import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiTable, UiTd, UiTh } from './table';

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
         <tr>
           <td uiTd>Livret A</td>
           <td uiTd numeric ${attributes}>20 010,00 EUR</td>
         </tr>
       </tbody>
     </table>`,
    { imports: [UiTable, UiTd, UiTh] },
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

  it('aligns a numeric column to the right and lines up its digits', async () => {
    await renderTable();

    expect(screen.getByRole('columnheader', { name: 'Valeur' })).toHaveClass('text-right', 'tabular-nums');
    expect(screen.getByRole('cell', { name: '20 010,00 EUR' })).toHaveClass('text-right', 'tabular-nums');
  });

  it('keeps a textual column aligned to the start', async () => {
    await renderTable();

    expect(screen.getByRole('columnheader', { name: 'Ligne' })).toHaveClass('text-left');
  });

  it('holds a secondary column back until its breakpoint', async () => {
    await renderTable('from="md"');

    expect(screen.getByRole('columnheader', { name: 'Valeur' })).toHaveClass('hidden', 'md:table-cell');
    expect(screen.getByRole('cell', { name: '20 010,00 EUR' })).toHaveClass('hidden', 'md:table-cell');
  });

  it('shows every column when no breakpoint is asked for', async () => {
    await renderTable();

    expect(screen.getByRole('columnheader', { name: 'Valeur' })).not.toHaveClass('hidden');
  });
});
