import { render, screen } from '@testing-library/angular';

import { UiRow } from './row';

describe('UiRow', () => {
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

  it('offers a tall row and tighter or no side padding', async () => {
    await render('<a ui-row size="lg" padding="sm" href="#">A</a><a ui-row padding="none" href="#">B</a>', {
      imports: [UiRow],
    });

    expect(screen.getByRole('link', { name: 'A' })).toHaveClass('min-h-15', 'px-2');
    expect(screen.getByRole('link', { name: 'B' })).toHaveClass('px-0');
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
});
