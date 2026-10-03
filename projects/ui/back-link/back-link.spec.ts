import { render, screen } from '@testing-library/angular';

import { type BackLinkSize, UiBackLink } from './back-link';

describe('UiBackLink', () => {
  it('renders a link with a decorative chevron and its label', async () => {
    const { container } = await render('<a ui-back-link href="/accounts">Comptes</a>', { imports: [UiBackLink] });

    expect(screen.getByRole('link', { name: 'Comptes' })).toHaveAttribute('href', '/accounts');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveAttribute('width', '22');
  });

  it('splits the press transform from the hover fill durations', async () => {
    await render('<a ui-back-link href="/">Retour</a>', { imports: [UiBackLink] });

    expect(screen.getByRole('link', { name: 'Retour' })).toHaveClass(
      'transition-[scale,background-color,color]',
      '[transition-duration:var(--duration-press),var(--duration-fast),var(--duration-fast)]',
    );
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
    ['header', ['h-11', 'text-(--foreground)', 'focus-visible:-outline-offset-2']],
    ['sm', ['h-9', 'pr-2', 'pl-0.5', 'text-(--muted-foreground)', 'hover:bg-(--glow)', 'hover:text-(--foreground)']],
  ])('applies the %s size', async (size, classes) => {
    await render('<a ui-back-link href="/" [size]="size">Retour</a>', {
      imports: [UiBackLink],
      componentProperties: { size },
    });

    expect(screen.getByRole('link', { name: 'Retour' })).toHaveClass(...classes);
  });
});

describe('UiBackLink chevron', () => {
  it.each<[BackLinkSize, string]>([
    ['md', '22'],
    ['sm', '22'],
    ['header', '24'],
  ])('draws the %s chevron %s px', async (size, expected) => {
    const { container } = await render('<a ui-back-link href="/" [size]="size">Lignes</a>', {
      imports: [UiBackLink],
      componentProperties: { size },
    });

    expect(container.querySelector('svg')).toHaveAttribute('width', expected);
    expect(container.querySelector('svg')).toHaveAttribute('height', expected);
  });
});
