import { render, screen } from '@testing-library/angular';

import { type CardPadding, type CardSurface, type CardVariant, UiCard } from './card';

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

  it('draws its border as an inset shadow so padding matches the board', async () => {
    await render('<ui-card>Total</ui-card>', { imports: [UiCard] });

    expect(screen.getByText('Total')).toHaveClass('shadow-[inset_0_0_0_1px_var(--border)]');
  });

  it.each<[CardPadding, string]>([
    ['none', 'p-0'],
    ['sm', 'p-3'],
    ['md', 'p-(--inset-card)'],
    ['list', 'px-2'],
    ['rows', 'py-1'],
  ])('applies the %s padding classes', async (padding, expectedClass) => {
    await render('<ui-card [padding]="padding">Total</ui-card>', {
      imports: [UiCard],
      componentProperties: { padding },
    });

    expect(screen.getByText('Total')).toHaveClass(expectedClass);
  });

  describe('surface', () => {
    it('draws the surface and the padding at every width by default', async () => {
      await render('<ui-card>Total</ui-card>', { imports: [UiCard] });

      expect(screen.getByText('Total')).toHaveClass('rounded-container', 'bg-(--card)', 'p-(--inset-card)');
    });

    it.each<[CardSurface, string]>([
      ['lg', 'lg:'],
      ['max-lg', 'max-lg:'],
    ])('limits the surface and the padding to %s', async (surface, prefix) => {
      await render('<ui-card [surface]="surface">Total</ui-card>', {
        imports: [UiCard],
        componentProperties: { surface },
      });

      const card = screen.getByText('Total');

      expect(card).toHaveClass(
        `${prefix}rounded-container`,
        `${prefix}bg-(--card)`,
        `${prefix}shadow-[inset_0_0_0_1px_var(--border)]`,
        `${prefix}p-(--inset-card)`,
      );
      expect(card).not.toHaveClass('bg-(--card)', 'p-(--inset-card)', 'rounded-container');
    });

    it('applies to the elevated variant and to the rows padding', async () => {
      await render('<ui-card variant="elevated" padding="rows" surface="max-lg">Total</ui-card>', {
        imports: [UiCard],
      });

      expect(screen.getByText('Total')).toHaveClass(
        'max-lg:bg-(--elevated)',
        'max-lg:px-(--inset-card)',
        'max-lg:py-1',
      );
    });
  });
});
