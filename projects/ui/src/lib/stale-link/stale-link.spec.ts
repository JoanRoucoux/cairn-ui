import { render, screen } from '@testing-library/angular';

import { UiStaleLink } from './stale-link';

describe('UiStaleLink', () => {
  it('renders a link in the stale tone, caption 12/17 at weight 500', async () => {
    await render('<a uiStaleLink href="/holdings/1">1 ligne sans cours, non comptée</a>', {
      imports: [UiStaleLink],
    });

    expect(screen.getByRole('link', { name: '1 ligne sans cours, non comptée' })).toHaveClass(
      'text-caption',
      'font-medium',
      'text-(--stale)',
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

  it('has no chevron by default', async () => {
    await render('<a uiStaleLink href="#">Cours</a>', { imports: [UiStaleLink] });

    expect(screen.getByRole('link', { name: 'Cours' }).className).not.toContain('after:');
  });

  it('adds a trailing chevron on request', async () => {
    await render('<a uiStaleLink chevron href="#">Cours</a>', { imports: [UiStaleLink] });

    expect(screen.getByRole('link', { name: 'Cours' })).toHaveClass('after:size-3.5', 'after:bg-current');
  });
});
