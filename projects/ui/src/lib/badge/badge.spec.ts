import { render, screen } from '@testing-library/angular';

import { type BadgeVariant, UiBadge } from './badge';

describe('UiBadge', () => {
  it('renders projected content', async () => {
    await render('<ui-badge>New</ui-badge>', { imports: [UiBadge] });

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it.each<[BadgeVariant, string]>([
    ['primary', 'bg-(--primary)'],
    ['secondary', 'bg-(--secondary)'],
    ['destructive', 'bg-(--destructive)'],
    ['outline', 'border-(--border)'],
  ])('applies the %s variant classes', async (variant, expectedClass) => {
    await render('<ui-badge [variant]="variant">New</ui-badge>', {
      imports: [UiBadge],
      componentProperties: { variant },
    });

    expect(screen.getByText('New')).toHaveClass(expectedClass);
  });
});
