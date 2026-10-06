import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

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
    [
      'inline',
      [
        'h-11',
        'pointer-fine:h-9',
        'text-label',
        'font-medium',
        'text-(--muted-foreground)',
        'hover:text-(--foreground)',
      ],
    ],
  ])('applies the %s size', async (size, classes) => {
    await render('<a ui-back-link href="/" [size]="size">Retour</a>', {
      imports: [UiBackLink],
      componentProperties: { size },
    });

    expect(screen.getByRole('link', { name: 'Retour' })).toHaveClass(...classes);
  });

  it('carries the inline outset of the frame: -8px top, -4px bottom, -6px left, at the start of its column', async () => {
    await render('<button ui-back-link size="inline">Retour à la recherche</button>', { imports: [UiBackLink] });

    expect(screen.getByRole('button', { name: 'Retour à la recherche' })).toHaveClass(
      '-mt-2',
      '-mb-1',
      '-ml-1.5',
      'self-start',
    );
  });

  it.each<BackLinkSize>(['md', 'sm', 'header'])('adds no margin at the %s size', async (size) => {
    await render('<a ui-back-link href="/" [size]="size">Retour</a>', {
      imports: [UiBackLink],
      componentProperties: { size },
    });

    expect(screen.getByRole('link', { name: 'Retour' }).className).not.toMatch(/(^|\s)-?m[tblrxy]?-/);
  });
});

describe('UiBackLink on a button', () => {
  it('is a button that never submits a form, with the inline metrics', async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    await render(
      '<form (submit)="onSubmit($event)"><button ui-back-link size="inline">Retour à la recherche</button></form>',
      {
        imports: [UiBackLink],
        componentProperties: { onSubmit },
      },
    );

    const back = screen.getByRole('button', { name: 'Retour à la recherche' });
    await userEvent.click(back);

    expect(back).toHaveAttribute('type', 'button');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps an explicit type', async () => {
    await render('<button ui-back-link type="submit">Retour</button>', { imports: [UiBackLink] });

    expect(screen.getByRole('button', { name: 'Retour' })).toHaveAttribute('type', 'submit');
  });

  it('leaves a link without a type', async () => {
    await render('<a ui-back-link href="/">Retour</a>', { imports: [UiBackLink] });

    expect(screen.getByRole('link', { name: 'Retour' })).not.toHaveAttribute('type');
  });
});

describe('UiBackLink chevron', () => {
  it.each<[BackLinkSize, string]>([
    ['md', '22'],
    ['sm', '22'],
    ['header', '24'],
    ['inline', '18'],
  ])('draws the %s chevron %s px', async (size, expected) => {
    const { container } = await render('<a ui-back-link href="/" [size]="size">Lignes</a>', {
      imports: [UiBackLink],
      componentProperties: { size },
    });

    expect(container.querySelector('svg')).toHaveAttribute('width', expected);
    expect(container.querySelector('svg')).toHaveAttribute('height', expected);
  });
});
