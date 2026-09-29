import { render, screen } from '@testing-library/angular';

import { type BadgeVariant, UiBadge } from './badge';

describe('UiBadge', () => {
  it('renders projected content', async () => {
    await render('<ui-badge>New</ui-badge>', { imports: [UiBadge] });

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('sits on the muted surface by default', async () => {
    await render('<ui-badge>ETF</ui-badge>', { imports: [UiBadge] });

    expect(screen.getByText('ETF').closest('ui-badge')).toHaveClass('bg-(--muted)', 'rounded-pill', 'text-caption');
  });

  it.each<[BadgeVariant, string]>([
    ['neutral', 'bg-(--muted)'],
    ['outline', 'shadow-[inset_0_0_0_1px_var(--border)]'],
  ])('applies the %s variant classes', async (variant, expectedClass) => {
    await render('<ui-badge [variant]="variant">New</ui-badge>', {
      imports: [UiBadge],
      componentProperties: { variant },
    });

    expect(screen.getByText('New')).toHaveClass(expectedClass);
  });
});
