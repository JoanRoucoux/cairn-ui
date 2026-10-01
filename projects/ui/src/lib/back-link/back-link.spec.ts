import { render, screen } from '@testing-library/angular';

import { type BackLinkSize, UiBackLink } from './back-link';

describe('UiBackLink', () => {
  it('renders a link with a decorative chevron and its label', async () => {
    const { container } = await render('<a ui-back-link href="/accounts">Comptes</a>', { imports: [UiBackLink] });

    expect(screen.getByRole('link', { name: 'Comptes' })).toHaveAttribute('href', '/accounts');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveAttribute('width', '22');
  });

  it('is the 44 px foreground link by default', async () => {
    await render('<a ui-back-link href="/">Retour</a>', { imports: [UiBackLink] });

    expect(screen.getByRole('link', { name: 'Retour' })).toHaveClass(
      'h-11',
      'pr-3',
      'pl-1',
      'gap-0.5',
      'text-body',
      'font-medium',
      'rounded-control',
      'text-(--foreground)',
      'active:scale-(--press-scale)',
    );
  });

  it.each<[BackLinkSize, string[]]>([
    ['md', ['h-11', 'text-(--foreground)']],
    ['sm', ['h-9', 'pr-2', 'pl-0.5', 'text-(--muted-foreground)', 'hover:bg-(--glow)', 'hover:text-(--foreground)']],
  ])('applies the %s size', async (size, classes) => {
    await render('<a ui-back-link href="/" [size]="size">Retour</a>', {
      imports: [UiBackLink],
      componentProperties: { size },
    });

    expect(screen.getByRole('link', { name: 'Retour' })).toHaveClass(...classes);
  });
});
