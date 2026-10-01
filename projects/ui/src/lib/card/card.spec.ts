import { render, screen } from '@testing-library/angular';

import { type CardBorder, type CardPadding, type CardSurface, type CardVariant, UiCard } from './card';

describe('UiCard', () => {
  it('renders projected content', async () => {
    await render('<ui-card>Total</ui-card>', { imports: [UiCard] });

    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it.each<[CardVariant, string]>([
    ['default', 'bg-(--card)'],
    ['elevated', 'bg-(--elevated)'],
    ['inset', 'bg-(--background)'],
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
    ['xs', 'p-1'],
    ['sm', 'p-3'],
    ['md', 'p-(--inset-card)'],
    ['list', 'px-2'],
    ['rows', 'py-1'],
    ['recap', 'px-3'],
    ['panel', 'lg:px-4'],
  ])('applies the %s padding classes', async (padding, expectedClass) => {
    await render('<ui-card [padding]="padding">Total</ui-card>', {
      imports: [UiCard],
      componentProperties: { padding },
    });

    expect(screen.getByText('Total')).toHaveClass(expectedClass);
  });

  describe('inset variant', () => {
    it('is a control-radius box on the page background with no border', async () => {
      await render('<ui-card variant="inset">Total</ui-card>', { imports: [UiCard] });

      const card = screen.getByText('Total');

      expect(card).toHaveClass('rounded-control', 'bg-(--background)');
      expect(card.className).not.toContain('shadow-');
    });
  });

  describe('border', () => {
    it.each<[CardVariant, string]>([
      ['default', 'shadow-[inset_0_0_0_1px_var(--border)]'],
      ['elevated', 'shadow-[inset_0_0_0_1px_var(--hairline)]'],
    ])('follows the %s variant by default', async (variant, expectedClass) => {
      await render('<ui-card [variant]="variant">Total</ui-card>', {
        imports: [UiCard],
        componentProperties: { variant },
      });

      expect(screen.getByText('Total')).toHaveClass(expectedClass);
    });

    it.each<[CardBorder, string | null]>([
      ['border', 'shadow-[inset_0_0_0_1px_var(--border)]'],
      ['hairline', 'shadow-[inset_0_0_0_1px_var(--hairline)]'],
      ['none', null],
    ])('draws %s on any variant', async (border, expectedClass) => {
      await render('<ui-card variant="inset" [border]="border">Total</ui-card>', {
        imports: [UiCard],
        componentProperties: { border },
      });

      const card = screen.getByText('Total');

      if (expectedClass) {
        expect(card).toHaveClass(expectedClass);
      } else {
        expect(card.className).not.toContain('shadow-');
      }
    });

    it('can remove the border of a default card', async () => {
      await render('<ui-card border="none">Total</ui-card>', { imports: [UiCard] });

      expect(screen.getByText('Total').className).not.toContain('shadow-');
    });
  });

  describe('clip', () => {
    it('does not clip by default', async () => {
      await render('<ui-card>Total</ui-card>', { imports: [UiCard] });

      expect(screen.getByText('Total')).not.toHaveClass('overflow-hidden');
    });

    it('clips its content to the rounded corners with the clip attribute', async () => {
      await render('<ui-card clip padding="none">Total</ui-card>', { imports: [UiCard] });

      expect(screen.getByText('Total')).toHaveClass('overflow-hidden');
    });
  });

  describe('panel padding', () => {
    it.each<[CardSurface, string[]]>([
      ['always', ['px-3', 'py-2.5', 'lg:px-4', 'lg:py-3']],
      ['lg', ['lg:px-4', 'lg:py-3']],
      ['max-lg', ['max-lg:px-3', 'max-lg:py-2.5']],
    ])('is 10x12 below 64rem and 12x16 from it, limited by surface %s', async (surface, classes) => {
      await render('<ui-card padding="panel" [surface]="surface">Total</ui-card>', {
        imports: [UiCard],
        componentProperties: { surface },
      });

      expect(screen.getByText('Total')).toHaveClass(...classes);
    });
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
