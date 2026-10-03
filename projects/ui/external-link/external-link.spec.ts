import { render, screen } from '@testing-library/angular';

import { UiExternalLink } from './external-link';

describe('UiExternalLink', () => {
  it('renders a link with a decorative external-link icon after its label', async () => {
    const { container } = await render(
      '<a ui-external-link href="https://amundietf.fr" target="_blank" rel="noopener">Fiche sur amundietf.fr</a>',
      { imports: [UiExternalLink] },
    );

    const link = screen.getByRole('link', { name: 'Fiche sur amundietf.fr' });
    expect(link).toHaveAttribute('href', 'https://amundietf.fr');
    const icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('width', '14');
    expect(link.lastElementChild).toBe(icon);
  });

  it('is a 44 px target on touch and underlines on hover', async () => {
    await render('<a ui-external-link href="#">Fiche</a>', { imports: [UiExternalLink] });

    expect(screen.getByRole('link', { name: 'Fiche' })).toHaveClass(
      'inline-flex',
      'items-center',
      'gap-1.5',
      'min-h-11',
      'lg:min-h-0',
      'text-label',
      'leading-[17px]',
      'font-medium',
      'hover:underline',
      'underline-offset-3',
      'rounded-[4px]',
      'focus-visible:outline-offset-2',
    );
  });
});
