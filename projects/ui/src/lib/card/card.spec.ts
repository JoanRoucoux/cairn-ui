import { render, screen } from '@testing-library/angular';

import { type CardPadding, type CardVariant, UiCard } from './card';

describe('UiCard', () => {
  it('renders projected content', async () => {
    await render('<ui-card>Total</ui-card>', { imports: [UiCard] });

    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it.each<[CardVariant, string]>([
    ['default', 'bg-(--card)'],
    ['elevated', 'bg-(--elevated)'],
  ])('applies the %s variant classes', async (variant, expectedClass) => {
    await render('<ui-card [variant]="variant">Total</ui-card>', {
      imports: [UiCard],
      componentProperties: { variant },
    });

    expect(screen.getByText('Total')).toHaveClass(expectedClass);
  });

  it.each<[CardPadding, string]>([
    ['none', 'p-0'],
    ['sm', 'p-3'],
    ['md', 'p-5'],
  ])('applies the %s padding classes', async (padding, expectedClass) => {
    await render('<ui-card [padding]="padding">Total</ui-card>', {
      imports: [UiCard],
      componentProperties: { padding },
    });

    expect(screen.getByText('Total')).toHaveClass(expectedClass);
  });
});
