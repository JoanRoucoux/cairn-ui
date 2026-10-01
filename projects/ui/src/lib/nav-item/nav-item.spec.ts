import { render, screen } from '@testing-library/angular';

import { UiNavItem } from './nav-item';

describe('UiNavItem', () => {
  it('renders the projected icon and label', async () => {
    await render('<a ui-nav-item href="/"><svg navIcon></svg>Portfolio</a>', { imports: [UiNavItem] });

    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument();
  });

  it('carries the touch target and radius classes', async () => {
    await render('<a ui-nav-item href="/">Portfolio</a>', { imports: [UiNavItem] });

    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveClass('h-10', 'rounded-control');
  });

  it('marks the active destination current and on the soft background', async () => {
    await render('<a ui-nav-item active href="/">Portfolio</a>', { imports: [UiNavItem] });

    const item = screen.getByRole('link', { name: 'Portfolio' });
    expect(item).toHaveAttribute('aria-current', 'page');
    expect(item).toHaveClass('bg-(--soft)', 'text-(--foreground)');
    expect(item).not.toHaveClass('text-(--muted-foreground)');
  });

  it('is muted and carries no aria-current when inactive', async () => {
    await render('<a ui-nav-item href="/">Portfolio</a>', { imports: [UiNavItem] });

    const item = screen.getByRole('link', { name: 'Portfolio' });
    expect(item).not.toHaveAttribute('aria-current');
    expect(item).toHaveClass('text-(--muted-foreground)');
  });

  it('accepts active as a bare attribute', async () => {
    await render('<a ui-nav-item active href="/">Portfolio</a>', { imports: [UiNavItem] });

    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the inherited line height and fills on press when idle', async () => {
    await render('<a ui-nav-item href="/">Portfolio</a>', { imports: [UiNavItem] });

    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveClass('leading-normal', 'active:bg-(--soft)');
  });
});
