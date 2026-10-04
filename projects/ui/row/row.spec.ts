import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiListRow, UiRow, UiRowItem, UiRowTile } from './row';

describe('UiRow trailing chevron', () => {
  it('draws no chevron and keeps its padding and hover fill by default', async () => {
    await render('<button ui-row type="button">Saisir à la main</button>', { imports: [UiRow] });
    const row = screen.getByRole('button', { name: 'Saisir à la main' });

    expect(row.querySelector('svg')).toBeNull();
    expect(row).toHaveClass('px-2.5', 'min-h-14', 'hover:bg-(--glow)');
    expect(row).not.toHaveClass('px-0');
  });

  it('draws a 16 px subtle chevron, with no side padding and a dimming hover', async () => {
    await render('<button ui-row type="button" trailing="chevron">Saisir à la main</button>', { imports: [UiRow] });
    const row = screen.getByRole('button', { name: 'Saisir à la main' });
    const chevron = row.querySelector('svg');

    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(chevron).toHaveAttribute('width', '16');
    expect(chevron).toHaveAttribute('height', '16');
    expect(chevron).toHaveClass('stroke-(--subtle-foreground)');
    expect(row).toHaveClass('px-0', 'min-h-(--row-min)', 'hover:text-(--muted-foreground)');
    expect(row).not.toHaveClass('hover:bg-(--glow)', 'min-h-14', 'px-2.5');
  });

  it('keeps the chevron on an unavailable row without hover or press', async () => {
    await render('<button ui-row type="button" trailing="chevron" unavailable>Saisir à la main</button>', {
      imports: [UiRow],
    });
    const row = screen.getByRole('button', { name: 'Saisir à la main' });

    expect(row.querySelector('svg')).not.toBeNull();
    expect(row).toHaveClass('opacity-50');
    expect(row).not.toHaveClass('transition-colors');
  });
});

describe('UiRow', () => {
  it('shows a spinner in the trailing slot and marks itself busy and disabled while busy', async () => {
    await render('<button ui-row type="button" busy>Import</button>', { imports: [UiRow] });
    const row = screen.getByText('Import', { selector: 'button' });

    expect(row).toHaveAttribute('aria-busy', 'true');
    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).not.toHaveAttribute('inert');
    expect(row).toHaveClass('pointer-events-none');
    expect(row.querySelector('[aria-hidden="true"]')).toHaveClass('animate-cairn-spin');
  });

  it('swallows activation while busy and keeps the focus on the row', async () => {
    const clicked = vi.fn();
    await render('<button ui-row type="button" busy (click)="clicked()">Import</button>', {
      imports: [UiRow],
      componentProperties: { clicked },
    });
    const row = screen.getByText('Import', { selector: 'button' });

    row.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    row.click();

    expect(clicked).not.toHaveBeenCalled();
    expect(row).toHaveFocus();
  });

  it('lets a click through when not busy', async () => {
    const clicked = vi.fn();
    await render('<button ui-row type="button" (click)="clicked()">Import</button>', {
      imports: [UiRow],
      componentProperties: { clicked },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it('draws no spinner and stays interactive when not busy', async () => {
    await render('<button ui-row type="button">Import</button>', { imports: [UiRow] });
    const row = screen.getByRole('button', { name: 'Import' });

    expect(row).not.toHaveAttribute('aria-busy');
    expect(row).not.toHaveAttribute('aria-disabled');
    expect(row.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('renders as a link carrying its content', async () => {
    await render('<a ui-row href="/holdings/1">Amundi MSCI World</a>', { imports: [UiRow] });

    expect(screen.getByRole('link', { name: 'Amundi MSCI World' })).toBeInTheDocument();
  });

  it('renders as a button carrying its content', async () => {
    await render('<button ui-row type="button">Open</button>', { imports: [UiRow] });

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('carries the touch target, radius and interaction classes', async () => {
    await render('<a ui-row href="#">Row</a>', { imports: [UiRow] });

    expect(screen.getByRole('link', { name: 'Row' })).toHaveClass(
      'min-h-14',
      'rounded-control',
      'hover:bg-(--glow)',
      'active:bg-(--soft)',
    );
  });

  it('eases the press scale at the press duration and the hover fill at the fast one', async () => {
    await render('<a ui-row href="#">Row</a>', { imports: [UiRow] });

    expect(screen.getByRole('link', { name: 'Row' })).toHaveClass(
      'transition-[scale,background-color]',
      '[transition-duration:var(--duration-press),var(--duration-fast)]',
      'ease-out',
      'active:scale-(--press-scale)',
    );
  });

  it('offers a tall row and tighter or no side padding', async () => {
    await render('<a ui-row size="lg" padding="sm" href="#">A</a><a ui-row padding="none" href="#">B</a>', {
      imports: [UiRow],
    });

    expect(screen.getByRole('link', { name: 'A' })).toHaveClass('min-h-15', 'px-2');
    expect(screen.getByRole('link', { name: 'B' })).toHaveClass('px-0');
  });

  it('draws the profile row at 72 px on touch, 68 px with a mouse, with a 12 px gap', async () => {
    await render('<a ui-row size="xl" padding="sm" href="#">Row</a>', { imports: [UiRow] });

    expect(screen.getByRole('link', { name: 'Row' })).toHaveClass('min-h-18', 'pointer-fine:min-h-17', 'gap-3', 'px-2');
    expect(screen.getByRole('link', { name: 'Row' })).not.toHaveClass('gap-2.5');
  });

  it('marks a selected row current and on the soft background', async () => {
    await render('<a ui-row selected href="#">Row</a>', { imports: [UiRow] });

    const row = screen.getByRole('link', { name: 'Row' });
    expect(row).toHaveAttribute('aria-current', 'true');
    expect(row).toHaveClass('bg-(--soft)');
  });

  it('carries no aria-current when not selected', async () => {
    await render('<a ui-row href="#">Row</a>', { imports: [UiRow] });

    expect(screen.getByRole('link', { name: 'Row' })).not.toHaveAttribute('aria-current');
  });

  it('accepts selected as a bare attribute', async () => {
    await render('<a ui-row selected href="#">Row</a>', { imports: [UiRow] });

    expect(screen.getByRole('link', { name: 'Row' })).toHaveAttribute('aria-current', 'true');
  });

  it('offers a 68 px card row with an 8 px gap', async () => {
    await render('<a ui-row size="card" href="#">Row</a>', { imports: [UiRow] });

    const row = screen.getByRole('link', { name: 'Row' });
    expect(row).toHaveClass('min-h-17', 'gap-2');
    expect(row).not.toHaveClass('gap-2.5');
    expect(row).not.toHaveClass('gap-3');
  });

  it('offers a dense result row, 56 px then 48 px from 64rem, with a 12 px gap', async () => {
    await render('<button ui-row size="dense" type="button">Row</button>', { imports: [UiRow] });

    expect(screen.getByRole('button', { name: 'Row' })).toHaveClass('min-h-14', 'lg:min-h-12', 'gap-3');
  });

  it('narrows the gap to 8 px on any size without keeping the size gap', async () => {
    await render('<a ui-row size="xl" gap="sm" padding="sm" href="#">Row</a>', { imports: [UiRow] });

    const row = screen.getByRole('link', { name: 'Row' });
    expect(row).toHaveClass('gap-2', 'min-h-18', 'pointer-fine:min-h-17');
    expect(row).not.toHaveClass('gap-3');
  });

  it('greys an unavailable row, forbids the cursor and drops hover and press', async () => {
    await render('<button ui-row unavailable type="button">Row</button>', { imports: [UiRow] });

    const row = screen.getByRole('button', { name: 'Row' });
    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(row).not.toHaveClass('hover:bg-(--glow)');
    expect(row).not.toHaveClass('active:bg-(--soft)');
    expect(row).not.toHaveClass('active:scale-(--press-scale)');
  });

  it('keeps its busy rules on a row that is both busy and unavailable', async () => {
    const onClick = vi.fn();
    await render('<button ui-row busy unavailable type="button" (click)="onClick()">Row</button>', {
      imports: [UiRow],
      componentProperties: { onClick },
    });
    const row = screen.getByText('Row', { selector: 'button' });

    row.focus();
    await userEvent.keyboard('{Enter}');
    row.click();

    expect(onClick).not.toHaveBeenCalled();
    expect(row).toHaveFocus();
    expect(row).toHaveAttribute('aria-busy', 'true');
    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).toHaveClass('pointer-events-none', 'opacity-50', 'cursor-not-allowed');
    expect(row).not.toHaveClass('hover:bg-(--glow)');
    expect(row).not.toHaveClass('active:scale-(--press-scale)');
    expect(row.querySelector('[aria-hidden="true"]')).toHaveClass('animate-cairn-spin');
  });

  it('keeps hover and press and no aria-disabled on an available row', async () => {
    await render('<button ui-row type="button">Row</button>', { imports: [UiRow] });

    const row = screen.getByRole('button', { name: 'Row' });
    expect(row).not.toHaveAttribute('aria-disabled');
    expect(row).not.toHaveClass('opacity-50');
    expect(row).toHaveClass('hover:bg-(--glow)', 'active:bg-(--soft)');
  });

  it('swallows the clicks of an unavailable row', async () => {
    const onClick = vi.fn();
    await render('<button ui-row unavailable type="button" (click)="onClick()">Row</button>', {
      imports: [UiRow],
      componentProperties: { onClick },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Row' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('lets an available row click through', async () => {
    const onClick = vi.fn();
    await render('<button ui-row type="button" (click)="onClick()">Row</button>', {
      imports: [UiRow],
      componentProperties: { onClick },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Row' }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('UiRowItem', () => {
  const template = `
    <div uiRowItem data-testid="item">
      <a ui-row size="xl" padding="sm" href="#">Northwind PEA</a>
      <button type="button" aria-label="Actions sur Northwind PEA">...</button>
    </div>`;

  it('lays the row and its trailing action side by side, 4 px apart, centred', async () => {
    await render(template, { imports: [UiRow, UiRowItem] });

    expect(screen.getByTestId('item')).toHaveClass('flex', 'items-center', 'gap-1');
  });

  it('lets the row take the room the action leaves', async () => {
    await render(template, { imports: [UiRow, UiRowItem] });

    expect(screen.getByTestId('item').className).toContain('[&>[ui-row]]:min-w-0');
    expect(screen.getByTestId('item').className).toContain('[&>[ui-row]]:flex-1');
    expect(screen.getByTestId('item').className).toContain('[&>[ui-row]]:w-auto');
  });

  it('keeps the trailing action at its own size', async () => {
    await render(template, { imports: [UiRow, UiRowItem] });

    expect(screen.getByTestId('item').className).toContain('[&>:not([ui-row])]:flex-none');
  });
});

describe('UiListRow', () => {
  it('lays a static row out at 72px, 68px from 64rem, with a 12px gap', async () => {
    await render('<ul><li uiListRow>MacBook Air</li></ul>', { imports: [UiListRow] });

    expect(screen.getByRole('listitem')).toHaveClass(
      'flex',
      'min-h-18',
      'lg:min-h-17',
      'items-center',
      'gap-3',
      'py-1.5',
    );
  });

  it('draws the hairline under the row by default', async () => {
    await render('<ul><li uiListRow>MacBook Air</li></ul>', { imports: [UiListRow] });

    expect(screen.getByRole('listitem')).toHaveClass('shadow-[inset_0_-1px_0_var(--hairline)]');
  });

  it('leaves the hairline out when not ruled', async () => {
    await render('<ul><li uiListRow [ruled]="false">MacBook Air</li></ul>', { imports: [UiListRow] });

    expect(screen.getByRole('listitem')).not.toHaveClass('shadow-[inset_0_-1px_0_var(--hairline)]');
    expect(screen.getByRole('listitem')).toHaveClass('lg:min-h-17');
  });
});

describe('UiRowTile', () => {
  it('draws a 36px muted square with the control radius around its icon', async () => {
    await render('<span uiRowTile data-testid="tile">icon</span>', { imports: [UiRowTile] });

    expect(screen.getByTestId('tile')).toHaveClass(
      'size-9',
      'rounded-control',
      'bg-(--muted)',
      'grid',
      'place-items-center',
      'flex-none',
    );
  });
});
