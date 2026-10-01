import { Component, computed, input } from '@angular/core';

/** Available card variants. `CardVariant` is derived from this tuple. */
export const CARD_VARIANTS = ['default', 'elevated'] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];

/** Available card paddings. `CardPadding` is derived from this tuple. */
export const CARD_PADDINGS = ['none', 'sm', 'md', 'list', 'rows'] as const;
export type CardPadding = (typeof CARD_PADDINGS)[number];

/** Where the card surface (fill, border, radius) and its padding apply. `CardSurface` is derived from this tuple. */
export const CARD_SURFACES = ['always', 'lg', 'max-lg'] as const;
export type CardSurface = (typeof CARD_SURFACES)[number];

const BASE_CLASSES = 'block';

const VARIANT_CLASSES: Record<CardVariant, Record<CardSurface, string>> = {
  default: {
    always: 'rounded-container bg-(--card) shadow-[inset_0_0_0_1px_var(--border)] text-(--card-foreground)',
    lg: 'lg:rounded-container lg:bg-(--card) lg:shadow-[inset_0_0_0_1px_var(--border)] lg:text-(--card-foreground)',
    'max-lg':
      'max-lg:rounded-container max-lg:bg-(--card) max-lg:shadow-[inset_0_0_0_1px_var(--border)] max-lg:text-(--card-foreground)',
  },
  elevated: {
    always: 'rounded-container bg-(--elevated) shadow-[inset_0_0_0_1px_var(--hairline)] text-(--foreground)',
    lg: 'lg:rounded-container lg:bg-(--elevated) lg:shadow-[inset_0_0_0_1px_var(--hairline)] lg:text-(--foreground)',
    'max-lg':
      'max-lg:rounded-container max-lg:bg-(--elevated) max-lg:shadow-[inset_0_0_0_1px_var(--hairline)] max-lg:text-(--foreground)',
  },
};

const PADDING_CLASSES: Record<CardPadding, Record<CardSurface, string>> = {
  none: {
    always: 'p-0',
    lg: 'lg:p-0',
    'max-lg': 'max-lg:p-0',
  },
  sm: {
    always: 'p-3',
    lg: 'lg:p-3',
    'max-lg': 'max-lg:p-3',
  },
  md: {
    always: 'p-(--inset-card)',
    lg: 'lg:p-(--inset-card)',
    'max-lg': 'max-lg:p-(--inset-card)',
  },
  list: {
    always: 'px-2 py-3',
    lg: 'lg:px-2 lg:py-3',
    'max-lg': 'max-lg:px-2 max-lg:py-3',
  },
  rows: {
    always: 'px-(--inset-card) py-1',
    lg: 'lg:px-(--inset-card) lg:py-1',
    'max-lg': 'max-lg:px-(--inset-card) max-lg:py-1',
  },
};

/**
 * Surface that groups related content: a summary block, a table, a side panel. `surface` limits the
 * fill, border, radius and padding to one side of `64rem`, for a block that is a card on a desktop and
 * plain on an iPhone, or the reverse.
 *
 * @example
 * <ui-card variant="elevated" padding="sm">Total</ui-card>
 * <ui-card surface="max-lg">Card on an iPhone, plain on a desktop</ui-card>
 */
@Component({
  selector: 'ui-card',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
  },
})
export class UiCard {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<CardPadding>('md');
  readonly surface = input<CardSurface>('always');

  protected readonly classes = computed(
    () =>
      `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()][this.surface()]} ${PADDING_CLASSES[this.padding()][this.surface()]}`,
  );
}
