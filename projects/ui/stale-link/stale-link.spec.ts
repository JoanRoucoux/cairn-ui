import { render, screen } from '@testing-library/angular';

import { UiStaleLink } from './stale-link';

describe('UiStaleLink', () => {
  it('renders a link in the stale tone, caption 12/17 at weight 500', async () => {
    await render('<a uiStaleLink href="/holdings/1">1 ligne sans cours, non comptée</a>', {
      imports: [UiStaleLink],
    });

    const link = screen.getByRole('link', { name: '1 ligne sans cours, non comptée' });
    expect(link).not.toHaveClass('text-label');
    expect(link).toHaveClass('text-caption', 'font-medium', 'text-(--stale)');
  });

  it('sets the label size, 14/20 at weight 500, on request', async () => {
    await render('<a uiStaleLink size="label" href="/holdings">1 cours en retard</a>', { imports: [UiStaleLink] });

    const link = screen.getByRole('link', { name: '1 cours en retard' });
    expect(link).toHaveClass('text-label', 'font-medium', 'text-(--stale)');
    expect(link).not.toHaveClass('text-caption');
  });

  it('keeps the 44 px hit area, 40 px with a mouse, at the label size', async () => {
    await render('<a uiStaleLink chevron size="label" href="#">Cours</a>', { imports: [UiStaleLink] });

    expect(screen.getByRole('link', { name: 'Cours' })).toHaveClass(
      'before:h-11',
      'pointer-fine:before:h-10',
      'after:size-4',
    );
  });

  it('underlines on hover and draws a 2 px ring on focus', async () => {
    await render('<a uiStaleLink href="#">Cours en retard</a>', { imports: [UiStaleLink] });

    expect(screen.getByRole('link', { name: 'Cours en retard' })).toHaveClass(
      'hover:underline',
      'underline-offset-3',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-(--ring)',
    );
  });

  it('extends its hit area to 44 px, 40 px with a mouse, without growing the caption', async () => {
    await render('<a uiStaleLink href="#">Cours</a>', { imports: [UiStaleLink] });

    expect(screen.getByRole('link', { name: 'Cours' })).toHaveClass(
      'relative',
      'before:absolute',
      'before:inset-x-0',
      'before:top-1/2',
      'before:-translate-y-1/2',
      'before:h-11',
      'pointer-fine:before:h-10',
    );
  });

  it('spaces the chevron 4 px on touch and 2 px with a mouse', async () => {
    await render('<a uiStaleLink chevron href="#">Cours</a>', { imports: [UiStaleLink] });

    expect(screen.getByRole('link', { name: 'Cours' })).toHaveClass('gap-1', 'pointer-fine:gap-0.5');
  });

  it('has no chevron by default', async () => {
    await render('<a uiStaleLink href="#">Cours</a>', { imports: [UiStaleLink] });

    expect(screen.getByRole('link', { name: 'Cours' }).className).not.toContain('after:');
  });

  it('adds a trailing chevron on request', async () => {
    await render('<a uiStaleLink chevron href="#">Cours</a>', { imports: [UiStaleLink] });

    expect(screen.getByRole('link', { name: 'Cours' })).toHaveClass('after:size-4', 'after:bg-current');
  });
});
